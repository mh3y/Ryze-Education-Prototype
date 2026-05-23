import { Router } from 'express';
import { db } from '../../prisma';
import { requireAdmin } from '../../auth/middleware';
import {
  generateUnmarkedAttendance,
  generateUpcomingLessons,
} from '../../services/notificationService';

function notifyAsync(fn: () => Promise<unknown>): void {
  fn().catch((e) => console.error('[lessons] notification side-effect error:', e));
}

export const lessonsRouter = Router();
lessonsRouter.use(requireAdmin);

function computeEndTime(scheduledAt: Date, durationMin: number | null): string | null {
  if (!durationMin) return null;
  return new Date(scheduledAt.getTime() + durationMin * 60000).toISOString();
}

function lessonToItem(l: any) {
  return {
    id: l.id,
    class_group_id: l.class_id,
    class_group_name: l.class?.name ?? null,
    title: l.title,
    description: l.description ?? null,
    start_time: l.scheduled_at instanceof Date ? l.scheduled_at.toISOString() : l.scheduled_at,
    end_time: computeEndTime(l.scheduled_at, l.duration_min),
    location: null,
    meet_link: l.meet_link ?? null,
    status: l.status,
  };
}

// GET /api/admin/lessons/calendar/events — MUST be before /:id to avoid route collision
lessonsRouter.get('/calendar/events', requireAdmin, async (req, res) => {
  try {
    const { start, end, class_group_id } = req.query as {
      start?: string; end?: string; class_group_id?: string;
    };
    const where: any = {};
    if (start) where.scheduled_at = { ...where.scheduled_at, gte: new Date(start) };
    if (end) where.scheduled_at = { ...where.scheduled_at, lte: new Date(end) };
    if (class_group_id) where.class_id = Number(class_group_id);

    const lessons = await db.lesson.findMany({
      where,
      include: { class: { select: { name: true } } },
      orderBy: { scheduled_at: 'asc' },
    });

    res.json(lessons.map((l: any) => ({
      id: l.id,
      title: `${l.class?.name ?? 'Class'}: ${l.title}`,
      start: l.scheduled_at.toISOString(),
      end: computeEndTime(l.scheduled_at, l.duration_min),
      status: l.status,
      class_group_id: l.class_id,
      meet_link: l.meet_link ?? null,
    })));
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// GET /api/admin/lessons
lessonsRouter.get('/', async (req, res) => {
  try {
    const { class_group_id, status, upcoming_only } = req.query as {
      class_group_id?: string; status?: string; upcoming_only?: string;
    };
    const where: any = {};
    if (class_group_id) where.class_id = Number(class_group_id);
    if (status) where.status = status;
    if (upcoming_only === 'true') where.scheduled_at = { gte: new Date() };

    const items = await db.lesson.findMany({
      where,
      include: { class: { select: { name: true } } },
      orderBy: { scheduled_at: 'asc' },
    });
    res.json({ total: items.length, items: items.map(lessonToItem) });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// GET /api/admin/lessons/:id
lessonsRouter.get('/:id', async (req, res) => {
  try {
    const l = await db.lesson.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        class: {
          select: { name: true, tutor: { select: { id: true, full_name: true } } },
        },
        attendance: true,
      },
    });
    if (!l) { res.status(404).json({ detail: 'Lesson not found' }); return; }

    const attendance = (l as any).attendance ?? [];
    const summary = {
      present: attendance.filter((a: any) => a.status === 'present').length,
      late: attendance.filter((a: any) => a.status === 'late').length,
      absent: attendance.filter((a: any) => a.status === 'absent').length,
      excused: attendance.filter((a: any) => a.status === 'excused').length,
      unknown: attendance.filter((a: any) => !['present', 'late', 'absent', 'excused'].includes(a.status)).length,
    };

    const classData = (l as any).class;
    res.json({
      ...lessonToItem(l),
      tutor_name: classData?.tutor?.full_name ?? null,
      tutor_user_id: classData?.tutor?.id ?? null,
      created_at: l.created_at instanceof Date ? l.created_at.toISOString() : l.created_at,
      updated_at: l.updated_at instanceof Date ? l.updated_at.toISOString() : l.updated_at,
      notes: l.notes ?? null,
      recording_url: l.recording_url ?? null,
      discord_event_id: l.discord_event_id ?? null,
      attendance_summary: summary,
      attendance_total: attendance.length,
    });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// POST /api/admin/lessons
lessonsRouter.post('/', async (req, res) => {
  try {
    const { class_group_id, title, description, start_time, end_time, meet_link, status, notes } = req.body as {
      class_group_id?: number; title?: string; description?: string;
      start_time?: string; end_time?: string; meet_link?: string;
      status?: string; notes?: string;
    };
    if (!class_group_id) { res.status(400).json({ detail: 'class_group_id is required' }); return; }
    if (!title) { res.status(400).json({ detail: 'title is required' }); return; }
    if (!start_time) { res.status(400).json({ detail: 'start_time is required' }); return; }

    const scheduledAt = new Date(start_time);
    let durationMin: number | null = null;
    if (end_time) {
      const endDate = new Date(end_time);
      durationMin = Math.round((endDate.getTime() - scheduledAt.getTime()) / 60000);
    }

    const lesson = await db.lesson.create({
      data: {
        class_id: class_group_id,
        title: title.trim(),
        description: description ?? null,
        scheduled_at: scheduledAt,
        duration_min: durationMin ?? 60,
        meet_link: meet_link ?? null,
        status: (status as any) ?? 'scheduled',
        notes: notes ?? null,
      },
    });

    // If lesson falls within the 25-hour reminder window, notify enrolled students/parents
    const hoursUntil = (scheduledAt.getTime() - Date.now()) / 3600_000;
    if (hoursUntil >= 1 && hoursUntil <= 25) {
      notifyAsync(() => generateUpcomingLessons());
    }

    res.status(201).json({ id: lesson.id, title: lesson.title });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// PATCH /api/admin/lessons/:id
lessonsRouter.patch('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const body = req.body as Partial<{
      title: string; description: string; start_time: string; end_time: string;
      meet_link: string; status: string; notes: string; recording_url: string;
    }>;
    const data: any = {};
    if (body.title !== undefined) data.title = body.title.trim();
    if (body.description !== undefined) data.description = body.description;
    if (body.meet_link !== undefined) data.meet_link = body.meet_link;
    if (body.status !== undefined) data.status = body.status;
    if (body.notes !== undefined) data.notes = body.notes;
    if (body.recording_url !== undefined) data.recording_url = body.recording_url;
    if (body.start_time !== undefined) {
      data.scheduled_at = new Date(body.start_time);
      if (body.end_time) {
        const endDate = new Date(body.end_time);
        data.duration_min = Math.round((endDate.getTime() - data.scheduled_at.getTime()) / 60000);
      }
    }

    await db.lesson.update({ where: { id }, data });

    // Post-mutation notification side-effects (fire-and-forget)
    if (body.status === 'completed') {
      // Lesson just completed — attendance is almost certainly all 'unknown'
      notifyAsync(() => generateUnmarkedAttendance());
    } else if (body.start_time && !body.status) {
      // Lesson rescheduled — re-evaluate upcoming reminder window
      notifyAsync(() => generateUpcomingLessons());
    }

    res.json({ updated: true });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// DELETE /api/admin/lessons/:id — cancel
lessonsRouter.delete('/:id', async (req, res) => {
  try {
    await db.lesson.update({ where: { id: Number(req.params.id) }, data: { status: 'cancelled' } });
    res.json({ cancelled: true });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// POST /api/admin/lessons/generate — create recurring lessons for a class
// Body: { class_group_id, title_prefix, start_date, end_date, day_of_week (0-6), hour, minute, duration_min, meet_link? }
// Skips dates where the tutor has an unavailability record.
lessonsRouter.post('/generate', async (req, res) => {
  try {
    const {
      class_group_id, title_prefix, start_date, end_date,
      day_of_week, hour, minute, duration_min, meet_link,
      // utc_offset_hours: the local timezone offset for this school, e.g. 10 for AEST, 11 for AEDT.
      // The hour/minute params are interpreted as LOCAL time; this offset converts them to UTC
      // for storage. Defaults to 10 (AEST). Pass 11 during daylight saving (AEDT).
      utc_offset_hours,
    } = req.body as {
      class_group_id?: number; title_prefix?: string;
      start_date?: string; end_date?: string; day_of_week?: number;
      hour?: number; minute?: number; duration_min?: number; meet_link?: string;
      utc_offset_hours?: number;
    };

    const tzOffset = utc_offset_hours ?? 10; // Default: AEST (UTC+10)

    if (!class_group_id) { res.status(400).json({ detail: 'class_group_id is required' }); return; }
    if (!title_prefix)   { res.status(400).json({ detail: 'title_prefix is required' }); return; }
    if (!start_date)     { res.status(400).json({ detail: 'start_date is required' }); return; }
    if (!end_date)       { res.status(400).json({ detail: 'end_date is required' }); return; }
    if (day_of_week === undefined) { res.status(400).json({ detail: 'day_of_week is required (0=Sun … 6=Sat)' }); return; }
    if (hour === undefined)        { res.status(400).json({ detail: 'hour is required (0–23)' }); return; }

    const cls = await db.classGroup.findUnique({
      where: { id: class_group_id },
      include: { tutor: { select: { id: true } } },
    });
    if (!cls) { res.status(404).json({ detail: 'Class not found' }); return; }

    // Load tutor unavailability dates for the range
    const blockedDates = new Set<string>();
    if (cls.tutor_id) {
      const unavailability = await db.tutorUnavailability.findMany({
        where: {
          tutor_id: cls.tutor_id,
          date: { gte: new Date(start_date), lte: new Date(end_date) },
        },
      });
      unavailability.forEach((u: any) => {
        const d = u.date instanceof Date ? u.date : new Date(u.date);
        blockedDates.add(d.toISOString().slice(0, 10)); // YYYY-MM-DD
      });
    }

    // Enumerate all matching days in range
    const mins     = minute ?? 0;
    const dur      = duration_min ?? cls.duration_min ?? 60;
    const start    = new Date(start_date);
    const end      = new Date(end_date);
    const lessonData: any[] = [];
    let lessonNum  = 1;

    const cursor = new Date(start);
    // Advance to the first occurrence of the correct day of week
    while (cursor.getDay() !== day_of_week) cursor.setDate(cursor.getDate() + 1);

    while (cursor <= end) {
      const dateStr = cursor.toISOString().slice(0, 10);
      if (!blockedDates.has(dateStr)) {
        // Construct lesson time in UTC: localHour - tzOffset = UTC hour.
        // e.g. 4pm AEST (UTC+10) → hour=16, tzOffset=10 → UTC 06:00
        const utcHour = hour - tzOffset;
        const scheduled = new Date(Date.UTC(
          cursor.getFullYear(), cursor.getMonth(), cursor.getDate(),
          utcHour, mins, 0, 0,
        ));
        lessonData.push({
          class_id:     class_group_id,
          title:        `${title_prefix} — Lesson ${lessonNum}`,
          scheduled_at: scheduled,
          duration_min: dur,
          meet_link:    meet_link ?? null,
          status:       'scheduled',
        });
        lessonNum++;
      }
      cursor.setDate(cursor.getDate() + 7); // next weekly occurrence
    }

    if (!lessonData.length) {
      res.status(400).json({ detail: 'No lessons would be created — check date range and day_of_week' });
      return;
    }

    const result = await db.lesson.createMany({ data: lessonData });
    res.status(201).json({ created: result.count, lesson_count: lessonNum - 1 });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

