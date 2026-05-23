import { Router } from 'express';
import { db } from '../../prisma';
import { requireAdmin } from '../../auth/middleware';
import {
  generateUnmarkedAttendance,
  resolveNotificationsForEntity,
} from '../../services/notificationService';

function notifyAsync(fn: () => Promise<unknown>): void {
  fn().catch((e) => console.error('[attendance] notification side-effect error:', e));
}

export const attendanceRouter = Router();
attendanceRouter.use(requireAdmin);

function attendanceToRecord(a: any) {
  return {
    id: a.id,
    lesson_id: a.lesson_id,
    lesson_title: a.lesson?.title ?? null,
    user_id: a.student_id,
    student_name: a.student?.full_name ?? null,
    status: a.status,
    tutor_marked_status: a.status,
    discord_verification_status: 'not_verified',
    discord_verified_minutes: null,
    joined_at: null,
    left_at: null,
    duration_minutes: null,
    has_mismatch: false,
    notes: a.notes ?? null,
  };
}

// GET /api/admin/attendance
attendanceRouter.get('/', async (req, res) => {
  try {
    const { lesson_id, user_id } = req.query as { lesson_id?: string; user_id?: string };
    const where: any = {};
    if (lesson_id) where.lesson_id = Number(lesson_id);
    if (user_id) where.student_id = Number(user_id);

    const items = await db.attendance.findMany({
      where,
      include: {
        lesson: { select: { title: true } },
        student: { select: { full_name: true } },
      },
      orderBy: { lesson_id: 'desc' },
    });
    res.json({ total: items.length, items: items.map(attendanceToRecord) });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// GET /api/admin/attendance/voice-sessions
// Returns Discord voice activity — works with or without linked lessons.
attendanceRouter.get('/voice-sessions', async (req, res) => {
  try {
    const { date, user_id, skip, limit } = req.query as {
      date?: string; user_id?: string; skip?: string; limit?: string;
    };

    const where: any = {};

    // Filter by date (AEST day boundary)
    if (date) {
      const day = new Date(date + 'T00:00:00+10:00');
      const nextDay = new Date(day.getTime() + 86_400_000);
      where.joined_at = { gte: day, lt: nextDay };
    }

    // Filter by CRM user
    if (user_id) where.crm_user_id = Number(user_id);

    const take   = Math.min(Number(limit ?? 50), 200);
    const offset = Number(skip ?? 0);

    const [items, total] = await Promise.all([
      db.voiceAttendance.findMany({
        where,
        include: {
          user:   { select: { id: true, full_name: true, role: true } },
          lesson: { select: { id: true, title: true, scheduled_at: true } },
        },
        orderBy: { joined_at: 'desc' },
        take,
        skip: offset,
      }),
      db.voiceAttendance.count({ where }),
    ]);

    res.json({
      total,
      items: items.map((v: any) => ({
        id:                 v.id,
        discord_user_id:    v.discord_user_id,
        discord_username:   v.discord_username,
        discord_channel_id: v.discord_channel_id,
        discord_channel:    v.discord_channel,
        joined_at:          v.joined_at,
        left_at:            v.left_at,
        duration_minutes:   v.duration_seconds != null ? Math.round(v.duration_seconds / 60) : null,
        status:             v.status,
        lesson_id:          v.lesson_id,
        lesson_title:       v.lesson?.title ?? null,
        crm_user_id:        v.crm_user_id,
        crm_user_name:      v.user?.full_name ?? null,
        crm_user_role:      v.user?.role ?? null,
      })),
    });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// POST /api/admin/attendance/:lessonId/:userId/mark
attendanceRouter.post('/:lessonId/:userId/mark', async (req, res) => {
  try {
    const lesson_id = Number(req.params.lessonId);
    const student_id = Number(req.params.userId);
    const { status, notes } = req.body as { status?: string; notes?: string };
    if (!status) { res.status(400).json({ detail: 'status is required' }); return; }

    const record = await db.attendance.upsert({
      where: { lesson_id_student_id: { lesson_id, student_id } },
      create: { lesson_id, student_id, status: status as any, notes: notes ?? null },
      update: { status: status as any, notes: notes ?? null },
    });

    // Post-mutation notification side-effects (fire-and-forget)
    notifyAsync(async () => {
      // Check if this lesson still has any unknown attendance records
      const unknownCount = await db.attendance.count({
        where: { lesson_id, status: 'unknown' },
      });
      if (unknownCount === 0) {
        // Lesson fully marked — resolve any outstanding attendance notifications
        await resolveNotificationsForEntity('attendance_unmarked', lesson_id);
      } else {
        // Still has unknown records — refresh notifications (dedup prevents spam)
        await generateUnmarkedAttendance();
      }
    });

    res.json({ id: record.id, status: record.status });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});
