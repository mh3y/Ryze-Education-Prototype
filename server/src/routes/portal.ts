import { Router } from 'express';
import { db } from '../prisma';
import { requireAuth } from '../auth/middleware';

export const portalRouter = Router();

// ── GET /api/students — used by portalApi.getStudents() ──────────────────────

portalRouter.get('/students', requireAuth, async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit ?? 100), 500);
    const skip  = Number(req.query.skip ?? 0);
    const role  = req.query.role as string | undefined;
    const where: any = { role: role ?? 'student' };
    if (req.query.active !== undefined) where.active = req.query.active === 'true';

    const [total, items] = await Promise.all([
      db.user.count({ where }),
      db.user.findMany({ where, skip, take: limit, orderBy: { full_name: 'asc' } }),
    ]);
    res.json({
      total,
      items: items.map((s) => ({
        id: s.id,
        discord_user_id: s.discord_user_id ? Number(s.discord_user_id) : null,
        full_name: s.full_name,
        email: s.email ?? null,
        role: s.role,
        active: s.active,
        created_at: s.created_at instanceof Date ? s.created_at.toISOString() : s.created_at,
      })),
    });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// ── GET /api/classes — used by portalApi.getClasses() ────────────────────────

portalRouter.get('/classes', requireAuth, async (req, res) => {
  try {
    const where: any = {};
    if (req.query.active !== undefined) where.active = req.query.active === 'true';

    const classes = await db.classGroup.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        tutor: { select: { id: true, full_name: true, discord_user_id: true } },
        _count: { select: { enrollments: true } },
      },
    });
    res.json({
      total: classes.length,
      items: classes.map((c: any) => ({
        id: c.id,
        name: c.name,
        subject: c.subject ?? null,
        year_level: c.year_level ?? null,
        active: c.active,
        tutor: c.tutor
          ? { id: c.tutor.id, full_name: c.tutor.full_name, discord_user_id: c.tutor.discord_user_id ?? null }
          : null,
        tutor_name: c.tutor?.full_name ?? null,  // legacy compat
        member_count: c._count?.enrollments ?? 0,
        created_at: c.created_at instanceof Date ? c.created_at.toISOString() : c.created_at,
      })),
    });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// ── GET /api/lessons — used by portalApi.getLessons() ────────────────────────

portalRouter.get('/lessons', requireAuth, async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit ?? 100), 500);
    const skip  = Number(req.query.skip ?? 0);
    const { status, class_group_id, upcoming_only } = req.query as {
      status?: string; class_group_id?: string; upcoming_only?: string;
    };

    const where: any = {};
    if (status) where.status = status;
    if (class_group_id) where.class_id = Number(class_group_id);
    if (upcoming_only === 'true') where.scheduled_at = { gte: new Date() };

    const [total, items] = await Promise.all([
      db.lesson.count({ where }),
      db.lesson.findMany({
        where,
        skip,
        take: limit,
        orderBy: { scheduled_at: 'asc' },
        include: {
          class: {
            select: { name: true, tutor: { select: { id: true, full_name: true } } },
          },
        },
      }),
    ]);

    res.json({
      total,
      items: items.map((l: any) => ({
        id: l.id,
        class_group_id: l.class_id,
        class_group_name: l.class?.name ?? null,
        title: l.title,
        description: l.description ?? null,
        start_time: l.scheduled_at instanceof Date ? l.scheduled_at.toISOString() : l.scheduled_at,
        end_time: l.duration_min
          ? new Date(l.scheduled_at.getTime() + l.duration_min * 60000).toISOString()
          : null,
        location: null,
        meet_link: l.meet_link ?? null,
        status: l.status,
        tutor_name: l.class?.tutor?.full_name ?? null,
        discord_thread_id: null,
        google_event_id: null,
      })),
    });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// ── GET /api/attendance — used by portalApi.getAttendance() ──────────────────

portalRouter.get('/attendance', requireAuth, async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit ?? 100), 500);
    const skip  = Number(req.query.skip ?? 0);
    const { lesson_id, user_id, status } = req.query as {
      lesson_id?: string; user_id?: string; status?: string;
    };

    const where: any = {};
    if (lesson_id) where.lesson_id  = Number(lesson_id);
    if (user_id)   where.student_id = Number(user_id);
    if (status)    where.status     = status;

    const [total, items] = await Promise.all([
      db.attendance.count({ where }),
      db.attendance.findMany({
        where,
        skip,
        take: limit,
        include: {
          lesson:  { select: { title: true, scheduled_at: true } },
          student: { select: { full_name: true } },
        },
        orderBy: { lesson: { scheduled_at: 'desc' } },
      }),
    ]);

    res.json({
      total,
      items: items.map((a: any) => ({
        id: a.id,
        lesson_id: a.lesson_id,
        lesson_title: a.lesson?.title ?? null,
        user_id: a.student_id,
        student_name: a.student?.full_name ?? null,
        status: a.status,
        joined_at: null,
        left_at: null,
        duration_minutes: null,
        notes: a.notes ?? null,
      })),
    });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});
