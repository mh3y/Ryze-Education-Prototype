import { Router } from 'express';
import { db } from '../prisma';
import { requireAuth, requireAdminOnly } from '../auth/middleware';

export const portalRouter = Router();

// ── GET /api/students — used by portalApi.getStudents() ──────────────────────
// Admin-only: returns all users in the system.
// Tutors, parents, and students are not permitted — they have role-scoped
// equivalents under /api/tutor/*, /api/student/portal, /api/parent/portal.

portalRouter.get('/students', requireAdminOnly, async (req, res) => {
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
// Admin-only: returns all class groups.
// No active tutor-facing caller confirmed — tutors use /api/tutor/classes.

portalRouter.get('/classes', requireAdminOnly, async (req, res) => {
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
// Shared across all roles (CalendarPage uses this endpoint for every role).
// Role-based scoping is applied in-handler so each caller only sees lessons
// relevant to their context.
//
//   admin  → all lessons
//   tutor  → lessons for classes they teach (class.tutor_id = user_id)
//   student → lessons for classes they are actively enrolled in
//   parent  → lessons for classes any of their linked children are enrolled in
//   other  → 403

portalRouter.get('/lessons', requireAuth, async (req, res) => {
  try {
    const p     = req.jwtPayload!;
    const limit = Math.min(Number(req.query.limit ?? 100), 500);
    const skip  = Number(req.query.skip ?? 0);
    const { status, class_group_id, upcoming_only } = req.query as {
      status?: string; class_group_id?: string; upcoming_only?: string;
    };

    const where: any = {};
    if (status) where.status = status;
    if (class_group_id) where.class_id = Number(class_group_id);
    if (upcoming_only === 'true') where.scheduled_at = { gte: new Date() };

    // ── Role-based scoping ────────────────────────────────────────────────── //
    if (p.role === 'admin') {
      // admin: no additional filter — sees all lessons
    } else if (p.role === 'tutor') {
      // tutor: only lessons for classes they teach
      where.class = { tutor_id: p.user_id };
    } else if (p.role === 'student') {
      // student: only lessons for classes they are actively enrolled in
      where.class = {
        enrollments: { some: { student_id: p.user_id, active: true } },
      };
    } else if (p.role === 'parent') {
      // parent: only lessons for classes any linked child is enrolled in
      const parentId = p.parent_profile_id;
      if (!parentId) {
        res.json({ total: 0, items: [] });
        return;
      }
      const childLinks = await db.parentStudent.findMany({
        where:  { parent_id: parentId },
        select: { student_id: true },
      });
      if (childLinks.length === 0) {
        res.json({ total: 0, items: [] });
        return;
      }
      const childIds = childLinks.map((c: any) => c.student_id);
      where.class = {
        enrollments: { some: { student_id: { in: childIds }, active: true } },
      };
    } else {
      res.status(403).json({ detail: 'Forbidden' });
      return;
    }

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
        google_event_id: l.google_event_id ?? null,
      })),
    });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// ── GET /api/attendance — used by portalApi.getAttendance() ──────────────────
// Admin-only: returns all attendance records across all students.
// Tutors use /api/tutor/lessons/:id/attendance (scoped to their own classes).

portalRouter.get('/attendance', requireAdminOnly, async (req, res) => {
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
