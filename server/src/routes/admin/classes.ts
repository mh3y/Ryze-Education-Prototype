/**
 * /api/admin/classes — class group CRUD + enrollment + health + Discord sync
 *
 * All routes require admin or tutor JWT (requireAdmin).
 * Write routes (POST/PATCH/DELETE) are admin-or-tutor — callers that need
 * admin-only restriction use requireAdminOnly.
 *
 * Endpoints
 *   GET    /                       list all classes
 *   POST   /                       create class (full fields)
 *   GET    /health                 health warnings across all classes
 *   GET    /:id                    class detail (with roster)
 *   PATCH  /:id                    update class (full fields)
 *   DELETE /:id                    soft-archive class
 *   GET    /:id/health             health warnings for one class
 *   POST   /:id/sync-discord       queue Discord permission sync BotJob
 *   POST   /:id/enroll             enroll a student in this class
 *   PATCH  /:id/enrollment/:studentId  update/unenroll a student
 */

import { Router } from 'express';
import { db } from '../../prisma';
import { requireAdmin, requireAdminOnly } from '../../auth/middleware';

export const classesRouter = Router();
classesRouter.use(requireAdmin);

// ── Serialisers ───────────────────────────────────────────────────────────────

function classToItem(c: any) {
  return {
    id: c.id,
    name: c.name,
    class_type: c.class_type ?? 'group',
    year_level: c.year_level ?? null,
    subject: c.subject ?? null,
    timezone: c.timezone ?? 'Australia/Sydney',
    schedule: c.schedule ?? null,
    schedule_day: c.schedule_day ?? null,
    schedule_hour: c.schedule_hour ?? null,
    schedule_minute: c.schedule_minute ?? null,
    duration_min: c.duration_min ?? 60,
    max_students: c.max_students ?? null,
    discord_channel_id: c.discord_channel_id ?? null,
    discord_role_id: c.discord_role_id ?? null,
    google_calendar_id: c.google_calendar_id ?? null,
    active: c.active,
    archived_at: c.archived_at ? (c.archived_at instanceof Date ? c.archived_at.toISOString() : c.archived_at) : null,
    created_at: c.created_at instanceof Date ? c.created_at.toISOString() : c.created_at,
    tutor: c.tutor
      ? { id: c.tutor.id, full_name: c.tutor.full_name, discord_user_id: c.tutor.discord_user_id ?? null }
      : null,
    member_count: c._count?.enrollments ?? 0,
  };
}

function buildClassHealthWarnings(cls: any): string[] {
  const warnings: string[] = [];
  if (!cls.tutor_id) warnings.push('no_tutor_assigned');
  const activeEnrollments = (cls.enrollments ?? []).filter((e: any) => e.active);
  if (activeEnrollments.length === 0) warnings.push('no_students_enrolled');
  if (!cls.discord_channel_id) warnings.push('no_discord_channel');
  if (!cls.google_calendar_id && !cls.schedule_day) warnings.push('no_schedule_or_calendar');

  // Email-looking class names
  if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(cls.name.trim())) {
    warnings.push('email_as_class_name');
  }

  // Check tutor has Discord linked
  if (cls.tutor && !cls.tutor.discord_user_id) warnings.push('tutor_missing_discord');

  // Check students missing Discord
  const studentsWithoutDiscord = activeEnrollments.filter(
    (e: any) => e.student && !e.student.discord_user_id,
  );
  if (studentsWithoutDiscord.length > 0) {
    warnings.push(`${studentsWithoutDiscord.length}_student(s)_missing_discord`);
  }

  // Check for upcoming lessons
  const now = new Date();
  const hasUpcoming = (cls.lessons ?? []).some(
    (l: any) => new Date(l.scheduled_at) > now && l.status !== 'cancelled',
  );
  if (!hasUpcoming) warnings.push('no_upcoming_lessons');

  return warnings;
}

// ── GET /api/admin/classes ────────────────────────────────────────────────────

classesRouter.get('/', async (_req, res) => {
  try {
    const items = await db.classGroup.findMany({
      orderBy: { name: 'asc' },
      include: {
        tutor: { select: { id: true, full_name: true, discord_user_id: true } },
        _count: { select: { enrollments: true } },
      },
    });
    res.json({ total: items.length, items: items.map(classToItem) });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// ── GET /api/admin/classes/health — MUST be before /:id ──────────────────────

classesRouter.get('/health', async (_req, res) => {
  try {
    const classes = await db.classGroup.findMany({
      where: { active: true },
      include: {
        tutor: { select: { id: true, full_name: true, discord_user_id: true } },
        enrollments: {
          include: { student: { select: { id: true, full_name: true, discord_user_id: true } } },
        },
        lessons: {
          where: { status: { not: 'cancelled' }, scheduled_at: { gte: new Date() } },
          select: { id: true, scheduled_at: true, status: true },
          take: 1,
          orderBy: { scheduled_at: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    });

    const results = classes.map((cls: any) => {
      const warnings = buildClassHealthWarnings(cls);
      return {
        id: cls.id,
        name: cls.name,
        warnings,
        warning_count: warnings.length,
        healthy: warnings.length === 0,
      };
    });

    const totalWarnings = results.reduce((acc: number, r: any) => acc + r.warning_count, 0);

    res.json({
      total_classes: classes.length,
      healthy_count: results.filter((r: any) => r.healthy).length,
      warning_count: totalWarnings,
      classes: results,
    });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// ── POST /api/admin/classes ───────────────────────────────────────────────────

classesRouter.post('/', requireAdminOnly, async (req, res) => {
  try {
    const {
      name, class_type, subject, year_level, tutor_user_id, max_students, active,
      discord_channel_id, discord_role_id, google_calendar_id,
      schedule_day, schedule_hour, schedule_minute, duration_min, schedule,
      timezone, description,
    } = req.body as {
      name?: string; class_type?: string; subject?: string; year_level?: string;
      tutor_user_id?: number; max_students?: number; active?: boolean;
      discord_channel_id?: string; discord_role_id?: string; google_calendar_id?: string;
      schedule_day?: number; schedule_hour?: number; schedule_minute?: number;
      duration_min?: number; schedule?: string; timezone?: string; description?: string;
    };

    if (!name) { res.status(400).json({ detail: 'name is required' }); return; }

    const classGroup = await db.classGroup.create({
      data: {
        name: name.trim(),
        class_type: class_type ?? 'group',
        subject: subject ?? '',
        description: description ?? null,
        year_level: year_level != null ? String(year_level) : null,
        timezone: timezone ?? 'Australia/Sydney',
        tutor_id: tutor_user_id ?? null,
        max_students: max_students ?? null,
        active: active ?? true,
        discord_channel_id: discord_channel_id ?? null,
        discord_role_id: discord_role_id ?? null,
        google_calendar_id: google_calendar_id ?? null,
        schedule: schedule ?? null,
        schedule_day: schedule_day ?? null,
        schedule_hour: schedule_hour ?? null,
        schedule_minute: schedule_minute ?? null,
        duration_min: duration_min ?? 60,
      },
    });

    // Audit log
    await db.auditLog.create({
      data: {
        actor_id: (req as any).jwtPayload?.id ?? null,
        actor_type: 'user',
        actor_name: (req as any).jwtPayload?.email ?? null,
        action: 'create',
        entity_type: 'class',
        entity_id: String(classGroup.id),
        entity_name: classGroup.name,
        new_data: { name, class_type, subject, tutor_user_id, discord_channel_id },
      },
    }).catch(() => {}); // non-fatal

    res.status(201).json({ id: classGroup.id, name: classGroup.name });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// ── GET /api/admin/classes/:id ────────────────────────────────────────────────

classesRouter.get('/:id', async (req, res) => {
  try {
    const c = await db.classGroup.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        tutor: { select: { id: true, full_name: true, discord_user_id: true } },
        _count: { select: { enrollments: true } },
        enrollments: {
          include: {
            student: { select: { id: true, full_name: true, discord_user_id: true } },
          },
          orderBy: { enrolled_at: 'asc' },
        },
      },
    });
    if (!c) { res.status(404).json({ detail: 'Class not found' }); return; }

    res.json({
      ...classToItem(c),
      roster: (c as any).enrollments.map((e: any) => ({
        membership_id: e.id,
        user_id: e.student_id,
        student_name: e.student.full_name,
        discord_user_id: e.student.discord_user_id ?? null,
        enrollment_status: e.active ? 'active' : 'inactive',
        start_date: e.enrolled_at instanceof Date ? e.enrolled_at.toISOString() : e.enrolled_at,
        end_date: e.end_date ? (e.end_date instanceof Date ? e.end_date.toISOString() : e.end_date) : null,
        is_trial: e.is_trial,
        notes: e.notes ?? null,
      })),
    });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// ── PATCH /api/admin/classes/:id ──────────────────────────────────────────────

classesRouter.patch('/:id', requireAdminOnly, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const body = req.body as Partial<{
      name: string; class_type: string; subject: string; year_level: string;
      tutor_user_id: number; max_students: number; active: boolean;
      discord_channel_id: string; discord_role_id: string; google_calendar_id: string;
      schedule_day: number; schedule_hour: number; schedule_minute: number;
      duration_min: number; schedule: string; timezone: string; description: string;
    }>;

    const data: any = {};
    if (body.name          !== undefined) data.name          = body.name.trim();
    if (body.class_type    !== undefined) data.class_type    = body.class_type;
    if (body.subject       !== undefined) data.subject       = body.subject;
    if (body.description   !== undefined) data.description   = body.description;
    if (body.year_level    !== undefined) data.year_level    = body.year_level != null ? String(body.year_level) : null;
    if (body.timezone      !== undefined) data.timezone      = body.timezone;
    if (body.tutor_user_id !== undefined) data.tutor_id      = body.tutor_user_id;
    if (body.max_students  !== undefined) data.max_students  = body.max_students;
    if (body.active        !== undefined) {
      data.active     = body.active;
      data.archived_at = body.active ? null : new Date();
    }
    if (body.discord_channel_id !== undefined) data.discord_channel_id = body.discord_channel_id;
    if (body.discord_role_id    !== undefined) data.discord_role_id    = body.discord_role_id;
    if (body.google_calendar_id !== undefined) data.google_calendar_id = body.google_calendar_id;
    if (body.schedule_day       !== undefined) data.schedule_day       = body.schedule_day;
    if (body.schedule_hour      !== undefined) data.schedule_hour      = body.schedule_hour;
    if (body.schedule_minute    !== undefined) data.schedule_minute    = body.schedule_minute;
    if (body.duration_min       !== undefined) data.duration_min       = body.duration_min;
    if (body.schedule           !== undefined) data.schedule           = body.schedule;

    // Fetch before for audit
    const before = await db.classGroup.findUnique({ where: { id }, select: { name: true, tutor_id: true, discord_channel_id: true, active: true } });

    await db.classGroup.update({ where: { id }, data });

    await db.auditLog.create({
      data: {
        actor_id: (req as any).jwtPayload?.id ?? null,
        actor_type: 'user',
        actor_name: (req as any).jwtPayload?.email ?? null,
        action: 'update',
        entity_type: 'class',
        entity_id: String(id),
        entity_name: before?.name ?? null,
        old_data: before ?? undefined,
        new_data: body,
      },
    }).catch(() => {});

    res.json({ updated: true });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// ── DELETE /api/admin/classes/:id — soft archive ─────────────────────────────

classesRouter.delete('/:id', requireAdminOnly, async (req, res) => {
  try {
    const id = Number(req.params.id);
    await db.classGroup.update({
      where: { id },
      data: { active: false, archived_at: new Date() },
    });
    await db.auditLog.create({
      data: {
        actor_id: (req as any).jwtPayload?.id ?? null,
        actor_type: 'user',
        action: 'delete',
        entity_type: 'class',
        entity_id: String(id),
      },
    }).catch(() => {});
    res.json({ archived: true });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// ── GET /api/admin/classes/:id/health ────────────────────────────────────────

classesRouter.get('/:id/health', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const cls = await db.classGroup.findUnique({
      where: { id },
      include: {
        tutor: { select: { id: true, full_name: true, discord_user_id: true } },
        enrollments: {
          include: { student: { select: { id: true, full_name: true, discord_user_id: true } } },
        },
        lessons: {
          where: { status: { not: 'cancelled' }, scheduled_at: { gte: new Date() } },
          select: { id: true, scheduled_at: true, status: true },
          take: 5,
          orderBy: { scheduled_at: 'asc' },
        },
      },
    });
    if (!cls) { res.status(404).json({ detail: 'Class not found' }); return; }

    const warnings = buildClassHealthWarnings(cls);
    const activeEnrollments = (cls as any).enrollments.filter((e: any) => e.active);

    res.json({
      id: cls.id,
      name: cls.name,
      warnings,
      warning_count: warnings.length,
      healthy: warnings.length === 0,
      details: {
        has_tutor: !!cls.tutor_id,
        tutor_has_discord: !!cls.tutor?.discord_user_id,
        active_students: activeEnrollments.length,
        students_missing_discord: activeEnrollments.filter((e: any) => !e.student?.discord_user_id).length,
        has_discord_channel: !!cls.discord_channel_id,
        has_google_calendar: !!cls.google_calendar_id,
        has_schedule: cls.schedule_day != null,
        upcoming_lessons: (cls as any).lessons.length,
      },
    });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// ── POST /api/admin/classes/:id/sync-discord ─────────────────────────────────
// Queue a BotJob to sync Discord channel permissions for this class.
// The bot will grant class channel access to the tutor and all active students,
// and revoke access for inactive students.

classesRouter.post('/:id/sync-discord', requireAdminOnly, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const cls = await db.classGroup.findUnique({
      where: { id },
      include: {
        tutor: { select: { id: true, discord_user_id: true, full_name: true } },
        enrollments: {
          include: { student: { select: { id: true, discord_user_id: true, full_name: true } } },
        },
      },
    });
    if (!cls) { res.status(404).json({ detail: 'Class not found' }); return; }
    if (!cls.discord_channel_id) {
      res.status(400).json({ detail: 'Class has no discord_channel_id set' });
      return;
    }

    const job = await db.botJob.create({
      data: {
        job_type: 'discord_permission_sync',
        priority: 3,
        payload: {
          class_id: id,
          class_name: cls.name,
          // Bot reads: channel_id, tutor_discord_id, grant_discord_ids, revoke_discord_ids
          channel_id: cls.discord_channel_id,
          tutor_discord_id: cls.tutor?.discord_user_id ?? null,
          grant_discord_ids: (cls as any).enrollments
            .filter((e: any) => e.active && e.student?.discord_user_id)
            .map((e: any) => e.student.discord_user_id),
          revoke_discord_ids: (cls as any).enrollments
            .filter((e: any) => !e.active && e.student?.discord_user_id)
            .map((e: any) => e.student.discord_user_id),
        },
        created_by: (req as any).jwtPayload?.id ?? null,
      },
    });

    await db.auditLog.create({
      data: {
        actor_id: (req as any).jwtPayload?.id ?? null,
        actor_type: 'user',
        action: 'sync',
        entity_type: 'class',
        entity_id: String(id),
        entity_name: cls.name,
        new_data: { job_id: job.id, discord_channel_id: cls.discord_channel_id },
      },
    }).catch(() => {});

    res.status(201).json({ job_id: job.id, status: 'queued' });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// ── POST /api/admin/classes/:id/enroll ───────────────────────────────────────
// Enroll a student in this class (from class side, mirrors /students/:id/enroll).

classesRouter.post('/:id/enroll', requireAdminOnly, async (req, res) => {
  try {
    const class_id = Number(req.params.id);
    const { student_id, is_trial, notes } = req.body as {
      student_id?: number; is_trial?: boolean; notes?: string;
    };
    if (!student_id) { res.status(400).json({ detail: 'student_id is required' }); return; }

    // Validate student exists and is a student
    const student = await db.user.findUnique({ where: { id: student_id } });
    if (!student || student.role !== 'student') {
      res.status(404).json({ detail: 'Student not found' });
      return;
    }

    // Upsert: if inactive enrollment exists, reactivate
    const existing = await db.classEnrollment.findUnique({
      where: { student_id_class_id: { student_id, class_id } },
    });

    let enrollment;
    if (existing) {
      enrollment = await db.classEnrollment.update({
        where: { id: existing.id },
        data: { active: true, end_date: null, enrolled_at: new Date(), is_trial: is_trial ?? false, notes: notes ?? existing.notes },
      });
    } else {
      enrollment = await db.classEnrollment.create({
        data: { student_id, class_id, active: true, is_trial: is_trial ?? false, notes: notes ?? null },
      });
    }

    const cls = await db.classGroup.findUnique({ where: { id: class_id }, select: { name: true } });

    await db.auditLog.create({
      data: {
        actor_id: (req as any).jwtPayload?.id ?? null,
        actor_type: 'user',
        action: 'enrol',
        entity_type: 'class',
        entity_id: String(class_id),
        entity_name: cls?.name ?? null,
        new_data: { student_id, student_name: student.full_name, is_trial },
      },
    }).catch(() => {});

    // Queue Discord permission sync if class has a Discord channel
    const clsWithDiscord = await db.classGroup.findUnique({
      where: { id: class_id },
      select: { discord_channel_id: true },
    });
    if (clsWithDiscord?.discord_channel_id && student.discord_user_id) {
      await db.botJob.create({
        data: {
          job_type: 'discord_permission_sync',
          priority: 4,
          payload: {
            class_id,
            // Bot reads: channel_id, grant_discord_ids
            channel_id: clsWithDiscord.discord_channel_id,
            grant_discord_ids: [student.discord_user_id],
            revoke_discord_ids: [],
          },
        },
      }).catch(() => {});
    }

    res.status(201).json({ enrollment_id: enrollment.id, reactivated: !!existing });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// ── PATCH /api/admin/classes/:id/enrollment/:studentId ───────────────────────
// Update enrollment (unenroll with historical preservation).

classesRouter.patch('/:id/enrollment/:studentId', requireAdminOnly, async (req, res) => {
  try {
    const class_id = Number(req.params.id);
    const student_id = Number(req.params.studentId);
    const { active, notes } = req.body as { active?: boolean; notes?: string };

    const data: any = {};
    if (active !== undefined) {
      data.active = active;
      if (!active) data.end_date = new Date(); // record when unenrolled
      else data.end_date = null;               // reactivating clears end_date
    }
    if (notes !== undefined) data.notes = notes;

    await db.classEnrollment.update({
      where: { student_id_class_id: { student_id, class_id } },
      data,
    });

    // Queue Discord permission revoke if unenrolling
    if (active === false) {
      const [cls, student] = await Promise.all([
        db.classGroup.findUnique({ where: { id: class_id }, select: { discord_channel_id: true, name: true } }),
        db.user.findUnique({ where: { id: student_id }, select: { discord_user_id: true, full_name: true } }),
      ]);
      if (cls?.discord_channel_id && student?.discord_user_id) {
        await db.botJob.create({
          data: {
            job_type: 'discord_permission_sync',
            priority: 4,
            payload: {
              class_id,
              // Bot reads: channel_id, revoke_discord_ids
              channel_id: cls.discord_channel_id,
              revoke_discord_ids: [student.discord_user_id],
              grant_discord_ids: [],
            },
          },
        }).catch(() => {});
      }
      await db.auditLog.create({
        data: {
          actor_id: (req as any).jwtPayload?.id ?? null,
          actor_type: 'user',
          action: 'unenrol',
          entity_type: 'class',
          entity_id: String(class_id),
          entity_name: cls?.name ?? null,
          new_data: { student_id, student_name: student?.full_name ?? null },
        },
      }).catch(() => {});
    }

    res.json({ updated: true });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});
