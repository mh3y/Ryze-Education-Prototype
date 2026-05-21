/**
 * /api/tutor/* — tutor portal routes
 *
 * All routes require requireTutor (tutor OR admin role).
 * The tutor sees only their own classes, lessons, and students.
 */

import { Router } from 'express';
import { db } from '../../prisma';
import { requireTutor } from '../../auth/middleware';
import { attendanceRate } from '../../utils/attendance';

export const tutorRouter = Router();
tutorRouter.use(requireTutor);

// ── Helper ────────────────────────────────────────────────────────────────────

function tutorId(req: any): number {
  const id = req.jwtPayload?.user_id;
  if (!id) throw new Error('Tutor session has no user_id — ensure you are logged in via Discord');
  return id;
}

// ── GET /api/tutor/portal ─────────────────────────────────────────────────────
// Full tutor dashboard payload in one request.

tutorRouter.get('/portal', async (req, res) => {
  try {
    const uid = tutorId(req);
    const now = new Date();

    const user = await db.user.findUnique({
      where: { id: uid },
      include: {
        tutor_profile: true,
        taught_classes: {
          where: { active: true },
          include: {
            enrollments: {
              where: { active: true },
              include: { student: { select: { id: true, full_name: true } } },
            },
            lessons: {
              where: { scheduled_at: { gt: now }, status: { not: 'cancelled' } },
              orderBy: { scheduled_at: 'asc' },
              take: 1,
            },
          },
        },
      },
    });

    if (!user) { res.status(404).json({ detail: 'Tutor not found' }); return; }

    // Upcoming lessons across all taught classes (next 14 days)
    const upcomingLessons = await db.lesson.findMany({
      where: {
        class: { tutor_id: uid },
        scheduled_at: { gte: now, lte: new Date(now.getTime() + 14 * 86400000) },
        status: { not: 'cancelled' },
      },
      include: { class: { select: { name: true } } },
      orderBy: { scheduled_at: 'asc' },
      take: 20,
    });

    // Homework assigned by this tutor (recent, unpublished or published)
    const recentHomework = await db.homework.findMany({
      where: { class: { tutor_id: uid } },
      orderBy: { created_at: 'desc' },
      take: 10,
      include: {
        class: { select: { name: true } },
        _count: { select: { submissions: true } },
      },
    });

    res.json({
      tutor: {
        id:         user.id,
        full_name:  user.full_name,
        bio:        user.tutor_profile?.bio ?? null,
        subjects:   user.tutor_profile?.subjects ?? null,
        hourly_rate: user.tutor_profile?.hourly_rate ?? null,
      },
      classes: user.taught_classes.map((c: any) => ({
        class_id:      c.id,
        class_name:    c.name,
        subject:       c.subject ?? null,
        year_level:    c.year_level ?? null,
        schedule:      c.schedule ?? null,
        student_count: c.enrollments.length,
        next_lesson:   c.lessons[0]
          ? { id: c.lessons[0].id, title: c.lessons[0].title, scheduled_at: c.lessons[0].scheduled_at.toISOString() }
          : null,
      })),
      upcoming_lessons: upcomingLessons.map((l: any) => ({
        id:           l.id,
        class_name:   l.class?.name ?? null,
        title:        l.title,
        scheduled_at: l.scheduled_at.toISOString(),
        end_time:     l.duration_min
          ? new Date(l.scheduled_at.getTime() + l.duration_min * 60000).toISOString()
          : null,
        status:       l.status,
        meet_link:    l.meet_link ?? null,
      })),
      recent_homework: recentHomework.map((h: any) => ({
        id:                h.id,
        class_name:        h.class?.name ?? null,
        title:             h.title,
        due_date:          h.due_date?.toISOString() ?? null,
        published:         h.published,
        submission_count:  h._count.submissions,
      })),
    });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// ── GET /api/tutor/classes ────────────────────────────────────────────────────

tutorRouter.get('/classes', async (req, res) => {
  try {
    const uid = tutorId(req);
    const classes = await db.classGroup.findMany({
      where: { tutor_id: uid, active: true },
      include: {
        _count: { select: { enrollments: { where: { active: true } } } },
        lessons: {
          where: { scheduled_at: { gt: new Date() }, status: { not: 'cancelled' } },
          orderBy: { scheduled_at: 'asc' },
          take: 1,
        },
      },
      orderBy: { name: 'asc' },
    });

    res.json(classes.map((c: any) => ({
      class_id:      c.id,
      name:          c.name,
      subject:       c.subject ?? null,
      year_level:    c.year_level ?? null,
      schedule:      c.schedule ?? null,
      student_count: c._count.enrollments,
      next_lesson:   c.lessons[0]
        ? { id: c.lessons[0].id, title: c.lessons[0].title, scheduled_at: c.lessons[0].scheduled_at.toISOString() }
        : null,
    })));
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// ── GET /api/tutor/classes/:id/roster ────────────────────────────────────────

tutorRouter.get('/classes/:id/roster', async (req, res) => {
  try {
    const uid     = tutorId(req);
    const classId = Number(req.params.id);

    const cls = await db.classGroup.findFirst({
      where: { id: classId, tutor_id: uid },
    });
    if (!cls) { res.status(404).json({ detail: 'Class not found or not yours' }); return; }

    const enrollments = await db.classEnrollment.findMany({
      where:   { class_id: classId, active: true },
      include: {
        student: {
          include: {
            student_profile: true,
            attendance: {
              where: { lesson: { class_id: classId } },
              select: { status: true },
            },
          },
        },
      },
      orderBy: { student: { full_name: 'asc' } },
    });

    res.json(enrollments.map((e: any) => ({
      enrollment_id:   e.id,
      student_id:      e.student_id,
      student_name:    e.student.full_name,
      year_level:      e.student.student_profile?.year_level ?? null,
      is_trial:        e.is_trial,
      enrolled_at:     e.enrolled_at.toISOString(),
      attendance_rate: attendanceRate(e.student.attendance.map((a: any) => a.status)),
    })));
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// ── GET /api/tutor/lessons ────────────────────────────────────────────────────

tutorRouter.get('/lessons', async (req, res) => {
  try {
    const uid = tutorId(req);
    const { upcoming_only } = req.query as { upcoming_only?: string };
    const where: any = { class: { tutor_id: uid } };
    if (upcoming_only === 'true') where.scheduled_at = { gte: new Date() };

    const lessons = await db.lesson.findMany({
      where,
      include: {
        class: { select: { name: true } },
        _count: { select: { attendance: true } },
      },
      orderBy: { scheduled_at: 'desc' },
      take: 50,
    });

    res.json(lessons.map((l: any) => ({
      id:             l.id,
      class_name:     l.class?.name ?? null,
      title:          l.title,
      description:    l.description ?? null,
      scheduled_at:   l.scheduled_at.toISOString(),
      duration_min:   l.duration_min,
      meet_link:      l.meet_link ?? null,
      status:         l.status,
      notes:          l.notes ?? null,
      student_count:  l._count.attendance,
    })));
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// ── GET /api/tutor/lessons/:id/attendance ─────────────────────────────────────

tutorRouter.get('/lessons/:id/attendance', async (req, res) => {
  try {
    const uid      = tutorId(req);
    const lessonId = Number(req.params.id);

    // Verify lesson belongs to one of the tutor's classes
    const lesson = await db.lesson.findFirst({
      where: { id: lessonId, class: { tutor_id: uid } },
      include: { class: { select: { name: true } } },
    });
    if (!lesson) { res.status(404).json({ detail: 'Lesson not found or not yours' }); return; }

    // Get enrolled students for this class, with their attendance for this lesson
    const enrollments = await db.classEnrollment.findMany({
      where: { class_id: lesson.class_id, active: true },
      include: {
        student: {
          select: { id: true, full_name: true },
        },
      },
    });

    const existing = await db.attendance.findMany({
      where: { lesson_id: lessonId },
    });
    const existingMap = new Map(existing.map((a: any) => [a.student_id, a]));

    res.json({
      lesson_id:  lessonId,
      class_name: (lesson as any).class?.name ?? null,
      roster: enrollments.map((e: any) => {
        const att = existingMap.get(e.student_id);
        return {
          student_id:   e.student_id,
          student_name: e.student.full_name,
          status:       att?.status ?? 'unknown',
          notes:        att?.notes ?? null,
          marked_at:    att?.marked_at?.toISOString() ?? null,
        };
      }),
    });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// ── PATCH /api/tutor/lessons/:id/attendance ───────────────────────────────────
// Body: { student_id, status, notes? }

tutorRouter.patch('/lessons/:id/attendance', async (req, res) => {
  try {
    const uid      = tutorId(req);
    const lessonId = Number(req.params.id);
    const { student_id, status, notes } = req.body as {
      student_id?: number; status?: string; notes?: string;
    };

    if (!student_id) { res.status(400).json({ detail: 'student_id is required' }); return; }
    if (!status)     { res.status(400).json({ detail: 'status is required' }); return; }

    const lesson = await db.lesson.findFirst({
      where: { id: lessonId, class: { tutor_id: uid } },
    });
    if (!lesson) { res.status(404).json({ detail: 'Lesson not found or not yours' }); return; }

    await db.attendance.upsert({
      where:  { lesson_id_student_id: { lesson_id: lessonId, student_id } },
      update: { status: status as any, notes: notes ?? undefined, marked_by: uid, marked_at: new Date() },
      create: { lesson_id: lessonId, student_id, status: status as any, notes: notes ?? null, marked_by: uid, marked_at: new Date() },
    });

    res.json({ updated: true });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// ── GET /api/tutor/homework ───────────────────────────────────────────────────

tutorRouter.get('/homework', async (req, res) => {
  try {
    const uid = tutorId(req);
    const { class_id } = req.query as { class_id?: string };
    const where: any = { class: { tutor_id: uid } };
    if (class_id) where.class_id = Number(class_id);

    const homework = await db.homework.findMany({
      where,
      include: {
        class: { select: { name: true } },
        _count: { select: { submissions: true } },
      },
      orderBy: { due_date: 'desc' },
      take: 50,
    });

    res.json(homework.map((h: any) => ({
      id:               h.id,
      class_id:         h.class_id,
      class_name:       h.class?.name ?? null,
      title:            h.title,
      description:      h.description ?? null,
      instructions:     h.instructions ?? null,
      due_date:         h.due_date?.toISOString() ?? null,
      published:        h.published,
      submission_count: h._count.submissions,
    })));
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// ── POST /api/tutor/homework ──────────────────────────────────────────────────

tutorRouter.post('/homework', async (req, res) => {
  try {
    const uid = tutorId(req);
    const { class_id, title, description, instructions, due_date, max_score } = req.body as {
      class_id?: number; title?: string; description?: string;
      instructions?: string; due_date?: string; max_score?: number;
    };

    if (!class_id) { res.status(400).json({ detail: 'class_id is required' }); return; }
    if (!title)    { res.status(400).json({ detail: 'title is required' }); return; }

    // Verify class belongs to this tutor
    const cls = await db.classGroup.findFirst({ where: { id: class_id, tutor_id: uid } });
    if (!cls) { res.status(403).json({ detail: 'Class not found or not yours' }); return; }

    const hw = await db.homework.create({
      data: {
        class_id, title,
        description:  description ?? null,
        instructions: instructions ?? null,
        due_date:     due_date ? new Date(due_date) : null,
        max_score:    max_score ?? null,
        published:    false,
      },
    });
    res.status(201).json({ id: hw.id, title: hw.title });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// ── PATCH /api/tutor/homework/:id ─────────────────────────────────────────────

tutorRouter.patch('/homework/:id', async (req, res) => {
  try {
    const uid = tutorId(req);
    const id  = Number(req.params.id);
    const body = req.body as Partial<{
      title: string; description: string; instructions: string;
      due_date: string; max_score: number; published: boolean;
    }>;

    const hw = await db.homework.findFirst({
      where: { id, class: { tutor_id: uid } },
    });
    if (!hw) { res.status(404).json({ detail: 'Homework not found or not yours' }); return; }

    const data: any = {};
    if (body.title        !== undefined) data.title        = body.title;
    if (body.description  !== undefined) data.description  = body.description;
    if (body.instructions !== undefined) data.instructions = body.instructions;
    if (body.due_date     !== undefined) data.due_date     = new Date(body.due_date);
    if (body.max_score    !== undefined) data.max_score    = body.max_score;
    if (body.published    !== undefined) {
      data.published    = body.published;
      if (body.published) data.published_at = new Date();
    }

    await db.homework.update({ where: { id }, data });
    res.json({ updated: true });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// ── GET /api/tutor/homework/:id/submissions ───────────────────────────────────

tutorRouter.get('/homework/:id/submissions', async (req, res) => {
  try {
    const uid = tutorId(req);
    const id  = Number(req.params.id);

    const hw = await db.homework.findFirst({ where: { id, class: { tutor_id: uid } } });
    if (!hw) { res.status(404).json({ detail: 'Homework not found or not yours' }); return; }

    const submissions = await db.homeworkSubmission.findMany({
      where: { homework_id: id },
      include: { student: { select: { id: true, full_name: true } } },
      orderBy: { submitted_at: 'asc' },
    });

    res.json(submissions.map((s: any) => ({
      id:           s.id,
      student_id:   s.student_id,
      student_name: s.student?.full_name ?? null,
      status:       s.status,
      submitted_at: s.submitted_at?.toISOString() ?? null,
      marked_at:    s.marked_at?.toISOString() ?? null,
      score:        s.score ?? null,
      grade:        s.score !== null && hw.max_score ? `${s.score}/${hw.max_score}` : null,
      feedback:     s.feedback ?? null,
      file_url:     s.file_url ?? null,
      notes:        s.notes ?? null,
    })));
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// ── PATCH /api/tutor/homework/:id/submissions/:submissionId ──────────────────

tutorRouter.patch('/homework/:id/submissions/:subId', async (req, res) => {
  try {
    const uid = tutorId(req);
    const hwId = Number(req.params.id);
    const subId = Number(req.params.subId);

    const hw = await db.homework.findFirst({ where: { id: hwId, class: { tutor_id: uid } } });
    if (!hw) { res.status(404).json({ detail: 'Homework not found or not yours' }); return; }

    const { feedback, score, status } = req.body as {
      feedback?: string; score?: number; status?: string;
    };

    const data: any = {};
    if (feedback !== undefined) data.feedback = feedback;
    if (score    !== undefined) data.score    = score;
    if (status   !== undefined) data.status   = status as any;
    data.marked_at = new Date();

    const updated = await db.homeworkSubmission.update({
      where: { id: subId },
      data,
    });
    res.json({ updated: true, id: updated.id, status: updated.status });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// ── GET /api/tutor/progress-reports ──────────────────────────────────────────

tutorRouter.get('/progress-reports', async (req, res) => {
  try {
    const uid = tutorId(req);
    const { student_id, class_id, status } = req.query as {
      student_id?: string; class_id?: string; status?: string;
    };

    const where: any = { created_by: uid };
    if (student_id) where.student_id = Number(student_id);
    if (class_id)   where.class_id   = Number(class_id);
    if (status)     where.status     = status;

    const reports = await db.progressReport.findMany({
      where,
      include: {
        student: { select: { full_name: true } },
        class:   { select: { name: true } },
      },
      orderBy: { created_at: 'desc' },
      take: 50,
    });

    res.json(reports.map((r: any) => ({
      id:           r.id,
      student_id:   r.student_id,
      student_name: r.student?.full_name ?? null,
      class_id:     r.class_id ?? null,
      class_name:   r.class?.name ?? null,
      period:       r.period ?? null,
      score:        r.score ?? null,
      grade:        r.grade ?? null,
      strengths:    r.strengths ?? null,
      improvements: r.improvements ?? null,
      notes:        r.notes ?? null,
      status:       r.status,
      published_at: r.published_at?.toISOString() ?? null,
      created_at:   r.created_at.toISOString(),
    })));
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// ── POST /api/tutor/progress-reports ─────────────────────────────────────────

tutorRouter.post('/progress-reports', async (req, res) => {
  try {
    const uid = tutorId(req);
    const { student_id, class_id, period, score, grade, strengths, improvements, notes } = req.body as {
      student_id?: number; class_id?: number; period?: string;
      score?: number; grade?: string; strengths?: string; improvements?: string; notes?: string;
    };

    if (!student_id) { res.status(400).json({ detail: 'student_id is required' }); return; }

    const report = await db.progressReport.create({
      data: {
        student_id, class_id: class_id ?? null, created_by: uid,
        period:       period       ?? null,
        score:        score        ?? null,
        grade:        grade        ?? null,
        strengths:    strengths    ?? null,
        improvements: improvements ?? null,
        notes:        notes        ?? null,
        status:       'draft',
      },
    });
    res.status(201).json({ id: report.id });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// ── PATCH /api/tutor/progress-reports/:id ────────────────────────────────────

tutorRouter.patch('/progress-reports/:id', async (req, res) => {
  try {
    const uid = tutorId(req);
    const id  = Number(req.params.id);

    const existing = await db.progressReport.findFirst({ where: { id, created_by: uid } });
    if (!existing) { res.status(404).json({ detail: 'Report not found or not yours' }); return; }

    const body = req.body as Partial<{
      period: string; score: number; grade: string; strengths: string;
      improvements: string; notes: string; status: string;
    }>;

    const data: any = {};
    if (body.period       !== undefined) data.period       = body.period;
    if (body.score        !== undefined) data.score        = body.score;
    if (body.grade        !== undefined) data.grade        = body.grade;
    if (body.strengths    !== undefined) data.strengths    = body.strengths;
    if (body.improvements !== undefined) data.improvements = body.improvements;
    if (body.notes        !== undefined) data.notes        = body.notes;
    if (body.status       !== undefined) {
      data.status = body.status;
      if (body.status === 'published') data.published_at = new Date();
    }

    await db.progressReport.update({ where: { id }, data });
    res.json({ updated: true });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// ── GET /api/tutor/unavailability ─────────────────────────────────────────────

tutorRouter.get('/unavailability', async (req, res) => {
  try {
    const uid = tutorId(req);
    const items = await db.tutorUnavailability.findMany({
      where: { tutor_id: uid },
      orderBy: { date: 'asc' },
    });
    res.json(items.map((u: any) => ({
      id:     u.id,
      date:   u.date instanceof Date ? u.date.toISOString() : u.date,
      reason: u.reason ?? null,
    })));
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// ── POST /api/tutor/unavailability ────────────────────────────────────────────

tutorRouter.post('/unavailability', async (req, res) => {
  try {
    const uid = tutorId(req);
    const { date, reason } = req.body as { date?: string; reason?: string };
    if (!date) { res.status(400).json({ detail: 'date is required' }); return; }

    const item = await db.tutorUnavailability.create({
      data: { tutor_id: uid, date: new Date(date), reason: reason ?? null },
    });
    res.status(201).json({ id: item.id });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// ── DELETE /api/tutor/unavailability/:id ──────────────────────────────────────

tutorRouter.delete('/unavailability/:id', async (req, res) => {
  try {
    const uid = tutorId(req);
    const id  = Number(req.params.id);

    const item = await db.tutorUnavailability.findFirst({ where: { id, tutor_id: uid } });
    if (!item) { res.status(404).json({ detail: 'Not found' }); return; }

    await db.tutorUnavailability.delete({ where: { id } });
    res.status(204).end();
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});
