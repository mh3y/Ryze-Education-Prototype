/**
 * GET /api/admin/database-health/*
 *
 * Read-only admin dashboard endpoints for inspecting production database state.
 * Admin-only (requireAdminOnly). No writes, no deletes. No secrets exposed.
 */

import { Router, Request, Response } from 'express';
import { db } from '../../prisma';
import { requireAdminOnly } from '../../auth/middleware';
import { sydneyDayBounds } from '../../utils/timezone';
import {
  THRESHOLDS,
  mergeVoiceFragments,
  computeStatus,
  lessonWindow,
  sessionOverlapsWindow,
  type RawVoiceFragment,
} from '../../services/attendanceEngine';

export const dbHealthRouter = Router();
dbHealthRouter.use(requireAdminOnly);

function iso(d: Date | null | undefined): string | null {
  if (!d) return null;
  return d instanceof Date ? d.toISOString() : String(d);
}

function isEmailLike(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

// ── GET /summary ──────────────────────────────────────────────────────────────

dbHealthRouter.get('/summary', async (_req: Request, res: Response) => {
  try {
    const [
      totalUsers, adminCount, tutorCount, studentCount,
      noDiscordStudents, noDiscordTutors, inactiveUsers,
      totalClasses, activeClasses,
      totalEnrollments, activeEnrollments,
      totalLessons, scheduledLessons, completedLessons, cancelledLessons,
      totalVoice, unmatchedVoice,
      totalAttendance, unknownAttendance,
    ] = await Promise.all([
      db.user.count(),
      db.user.count({ where: { role: 'admin' } }),
      db.user.count({ where: { role: 'tutor' } }),
      db.user.count({ where: { role: 'student' } }),
      db.user.count({ where: { discord_user_id: null, role: 'student' } }),
      db.user.count({ where: { discord_user_id: null, role: 'tutor' } }),
      db.user.count({ where: { active: false } }),
      db.classGroup.count(),
      db.classGroup.count({ where: { active: true } }),
      db.classEnrollment.count(),
      db.classEnrollment.count({ where: { active: true } }),
      db.lesson.count(),
      db.lesson.count({ where: { status: 'scheduled' } }),
      db.lesson.count({ where: { status: 'completed' } }),
      db.lesson.count({ where: { status: 'cancelled' } }),
      db.voiceAttendance.count(),
      db.voiceAttendance.count({ where: { crm_user_id: null } }),
      db.attendance.count(),
      db.attendance.count({ where: { status: 'unknown' } }),
    ]);

    res.json({
      users: {
        total: totalUsers, admin: adminCount, tutor: tutorCount, student: studentCount,
        no_discord_students: noDiscordStudents, no_discord_tutors: noDiscordTutors, inactive: inactiveUsers,
      },
      classes:      { total: totalClasses,      active: activeClasses,      inactive: totalClasses - activeClasses },
      enrollments:  { total: totalEnrollments,  active: activeEnrollments,  inactive: totalEnrollments - activeEnrollments },
      lessons:      { total: totalLessons,      scheduled: scheduledLessons, completed: completedLessons, cancelled: cancelledLessons },
      voice_attendance: { total: totalVoice, unmatched: unmatchedVoice },
      attendance:   { total: totalAttendance, unknown: unknownAttendance },
    });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// ── GET /users ────────────────────────────────────────────────────────────────

dbHealthRouter.get('/users', async (_req: Request, res: Response) => {
  try {
    const users = await db.user.findMany({
      orderBy: [{ role: 'asc' }, { id: 'asc' }],
      select: {
        id: true, display_id: true, discord_user_id: true,
        full_name: true, role: true, active: true, created_at: true,
        enrollments: { where: { active: true }, select: { id: true } },
      },
    });

    const rows = users.map((u) => {
      const warnings: string[] = [];
      if (!u.discord_user_id && (u.role === 'student' || u.role === 'tutor'))
        warnings.push('No Discord account linked');
      if (!u.active && u.enrollments.length > 0)
        warnings.push(`Inactive — has ${u.enrollments.length} active enrollment(s)`);
      if (isEmailLike(u.full_name))
        warnings.push('Name looks like an email address');
      return {
        id: u.id, display_id: u.display_id, discord_user_id: u.discord_user_id,
        full_name: u.full_name, role: u.role, active: u.active,
        created_at: iso(u.created_at), active_enrollment_count: u.enrollments.length,
        warnings, warning_count: warnings.length,
      };
    });

    res.json({ total: rows.length, items: rows });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// ── GET /classes ──────────────────────────────────────────────────────────────

dbHealthRouter.get('/classes', async (_req: Request, res: Response) => {
  try {
    const classes = await db.classGroup.findMany({
      orderBy: [{ active: 'desc' }, { id: 'asc' }],
      select: {
        id: true, name: true, class_type: true, subject: true, year_level: true,
        timezone: true, schedule_day: true, schedule_hour: true, schedule_minute: true,
        duration_min: true, discord_channel_id: true, discord_role_id: true,
        google_calendar_id: true, tutor_id: true, active: true, archived_at: true, created_at: true,
        tutor: { select: { id: true, full_name: true, discord_user_id: true, role: true } },
        enrollments: { where: { active: true }, select: { id: true } },
        lessons: { where: { status: { in: ['scheduled', 'live'] } }, select: { id: true } },
      },
    });

    const chanCounts: Record<string, number> = {};
    for (const c of classes) {
      if (c.discord_channel_id)
        chanCounts[c.discord_channel_id] = (chanCounts[c.discord_channel_id] ?? 0) + 1;
    }

    const rows = classes.map((c) => {
      const warnings: string[] = [];
      if (!c.tutor_id)            warnings.push('No tutor assigned');
      if (!c.discord_channel_id)  warnings.push('No Discord channel ID');
      if (c.enrollments.length === 0) warnings.push('No active enrolled students');
      if (c.discord_channel_id && (chanCounts[c.discord_channel_id] ?? 0) > 1)
        warnings.push(`Discord channel shared with ${chanCounts[c.discord_channel_id] - 1} other class(es)`);
      if (isEmailLike(c.name))    warnings.push('Class name looks like an email address');
      if (!c.google_calendar_id)  warnings.push('No Google Calendar linked');
      return {
        id: c.id, name: c.name, class_type: c.class_type, subject: c.subject,
        year_level: c.year_level, timezone: c.timezone,
        schedule_day: c.schedule_day, schedule_hour: c.schedule_hour, schedule_minute: c.schedule_minute,
        duration_min: c.duration_min, discord_channel_id: c.discord_channel_id,
        discord_role_id: c.discord_role_id, google_calendar_id: c.google_calendar_id,
        tutor_id: c.tutor_id, tutor_name: c.tutor?.full_name ?? null,
        tutor_has_discord: !!c.tutor?.discord_user_id,
        active: c.active, archived_at: iso(c.archived_at), created_at: iso(c.created_at),
        active_student_count: c.enrollments.length, upcoming_lesson_count: c.lessons.length,
        warnings, warning_count: warnings.length,
      };
    });

    res.json({ total: rows.length, items: rows });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// ── GET /enrollments ──────────────────────────────────────────────────────────

dbHealthRouter.get('/enrollments', async (_req: Request, res: Response) => {
  try {
    const enrollments = await db.classEnrollment.findMany({
      orderBy: [{ active: 'desc' }, { id: 'asc' }],
      select: {
        id: true, student_id: true, class_id: true, active: true,
        is_trial: true, enrolled_at: true, end_date: true, notes: true,
        student: { select: { id: true, full_name: true, role: true, active: true } },
        class:   { select: { id: true, name: true, active: true } },
      },
    });

    const rows = enrollments.map((e) => {
      const warnings: string[] = [];
      if (!e.student.active)              warnings.push('Student account is inactive');
      if (!e.class.active)                warnings.push('Class is archived/inactive');
      if (e.student.role === 'tutor')     warnings.push('Tutor user enrolled as student');
      if (e.student.role === 'admin')     warnings.push('Admin user enrolled as student');
      return {
        id: e.id, student_id: e.student_id, student_name: e.student.full_name,
        student_role: e.student.role, student_active: e.student.active,
        class_id: e.class_id, class_name: e.class.name, class_active: e.class.active,
        active: e.active, is_trial: e.is_trial,
        enrolled_at: iso(e.enrolled_at), end_date: iso(e.end_date), notes: e.notes,
        warnings, warning_count: warnings.length,
      };
    });

    res.json({ total: rows.length, items: rows });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// ── GET /lessons?class_id&status&skip&limit ───────────────────────────────────

dbHealthRouter.get('/lessons', async (req: Request, res: Response) => {
  try {
    const class_id = req.query.class_id ? Number(req.query.class_id) : undefined;
    const status   = req.query.status   ? String(req.query.status)   : undefined;
    const skip     = Number(req.query.skip  ?? 0);
    const limit    = Math.min(Number(req.query.limit ?? 50), 200);

    const where: any = {};
    if (class_id) where.class_id = class_id;
    if (status)   where.status   = status;

    const [total, lessons] = await Promise.all([
      db.lesson.count({ where }),
      db.lesson.findMany({
        where, orderBy: { scheduled_at: 'desc' }, skip, take: limit,
        select: {
          id: true, class_id: true, title: true, scheduled_at: true, duration_min: true,
          status: true, recurrence_key: true, google_event_id: true,
          substitute_tutor_id: true, created_at: true,
          class: { select: { id: true, name: true, active: true, tutor_id: true } },
          substitute_tutor: { select: { id: true, full_name: true, role: true } },
          attendance: { select: { id: true, status: true } },
        },
      }),
    ]);

    const rows = lessons.map((l) => {
      const warnings: string[] = [];
      if (!l.class.active)  warnings.push('Class is archived');
      if (!l.class.tutor_id && !l.substitute_tutor_id) warnings.push('No tutor assigned');
      if (l.substitute_tutor && l.substitute_tutor.role !== 'tutor' && l.substitute_tutor.role !== 'admin')
        warnings.push(`Substitute has unexpected role: ${l.substitute_tutor.role}`);
      const unknownAtt = l.attendance.filter((a) => a.status === 'unknown').length;
      if (unknownAtt > 0 && l.status === 'completed')
        warnings.push(`${unknownAtt} attendance record(s) still 'unknown'`);
      return {
        id: l.id, class_id: l.class_id, class_name: l.class.name, class_active: l.class.active,
        title: l.title, scheduled_at: iso(l.scheduled_at), duration_min: l.duration_min,
        status: l.status, recurrence_key: l.recurrence_key ?? null,
        google_event_id: l.google_event_id ?? null,
        substitute_tutor_id: l.substitute_tutor_id,
        substitute_tutor_name: l.substitute_tutor?.full_name ?? null,
        attendance_count: l.attendance.length, attendance_unknown: unknownAtt,
        created_at: iso(l.created_at), warnings, warning_count: warnings.length,
      };
    });

    res.json({ total, items: rows });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// ── GET /voice-attendance?date&class_id&skip&limit ────────────────────────────

dbHealthRouter.get('/voice-attendance', async (req: Request, res: Response) => {
  try {
    const class_id = req.query.class_id ? Number(req.query.class_id) : undefined;
    const date     = req.query.date     ? String(req.query.date)     : undefined; // YYYY-MM-DD Sydney
    const skip     = Number(req.query.skip  ?? 0);
    const limit    = Math.min(Number(req.query.limit ?? 50), 200);

    let channelId: string | undefined;
    if (class_id) {
      const cls = await db.classGroup.findUnique({ where: { id: class_id }, select: { discord_channel_id: true } });
      channelId = cls?.discord_channel_id ?? undefined;
    }

    const where: any = {};
    if (channelId) where.discord_channel_id = channelId;
    if (date) {
      // Use Sydney day bounds (DST-aware) so a date filter matches the correct local day
      const { start, end } = sydneyDayBounds(0, date);
      where.joined_at = { gte: start, lte: end };
    } else {
      // Default: last 14 days (prevents scanning the full table on initial load)
      const cutoff = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
      where.joined_at = { gte: cutoff };
    }

    const [total, records] = await Promise.all([
      db.voiceAttendance.count({ where }),
      db.voiceAttendance.findMany({
        where, orderBy: { joined_at: 'desc' }, skip, take: limit,
        select: {
          id: true, lesson_id: true, discord_user_id: true, discord_username: true,
          discord_channel_id: true, discord_channel: true,
          joined_at: true, left_at: true, duration_seconds: true, status: true,
          crm_user_id: true, created_at: true,
          user:   { select: { id: true, full_name: true, role: true } },
          lesson: { select: { id: true, title: true, scheduled_at: true, class_id: true } },
        },
      }),
    ]);

    const rows = records.map((v) => ({
      id: v.id, lesson_id: v.lesson_id,
      lesson_title: v.lesson?.title ?? null,
      lesson_scheduled_at: v.lesson ? iso(v.lesson.scheduled_at) : null,
      lesson_class_id: v.lesson?.class_id ?? null,
      discord_user_id: v.discord_user_id, discord_username: v.discord_username,
      discord_channel_id: v.discord_channel_id, discord_channel: v.discord_channel,
      joined_at: iso(v.joined_at), left_at: iso(v.left_at),
      duration_seconds: v.duration_seconds,
      duration_min: v.duration_seconds != null ? Math.round(v.duration_seconds / 60) : null,
      status: v.status, crm_user_id: v.crm_user_id,
      crm_user_name: v.user?.full_name ?? null, crm_user_role: v.user?.role ?? null,
      unmatched: !v.crm_user_id, created_at: iso(v.created_at),
    }));

    res.json({ total, items: rows });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// ── GET /reconciliation?class_id&date ─────────────────────────────────────────

dbHealthRouter.get('/reconciliation', async (req: Request, res: Response) => {
  try {
    const class_id = req.query.class_id ? Number(req.query.class_id) : undefined;
    const date     = req.query.date     ? String(req.query.date)     : undefined;

    if (!class_id || !date)
      return res.json({ class_id: null, date: null, lesson: null, roster: [], unmatched_voice: [], summary: null });

    const cls = await db.classGroup.findUnique({
      where: { id: class_id },
      select: {
        id: true, name: true, discord_channel_id: true, duration_min: true,
        tutor: { select: { id: true, full_name: true } },
        enrollments: {
          where: { active: true },
          select: { id: true, student: { select: { id: true, full_name: true, discord_user_id: true } } },
        },
      },
    });
    if (!cls) return res.status(404).json({ detail: 'Class not found' });

    // Use Sydney day bounds (DST-aware) — consistent with the main Attendance page
    const { start: dayStart, end: dayEnd } = sydneyDayBounds(0, date);

    const lesson = await db.lesson.findFirst({
      where: { class_id, scheduled_at: { gte: dayStart, lte: dayEnd } },
      select: {
        id: true, title: true, scheduled_at: true, duration_min: true, status: true,
        substitute_tutor: { select: { id: true, full_name: true } },
        attendance: { select: { id: true, student_id: true, status: true, marked_by: true } },
      },
    });

    // Voice window includes attendance engine buffers (identical to /lessons endpoint)
    const rawLesson = lesson
      ? { scheduled_at: lesson.scheduled_at instanceof Date ? lesson.scheduled_at : new Date(lesson.scheduled_at), duration_min: lesson.duration_min }
      : null;
    const { windowStart, windowEnd, lessonEnd: lessonEndDate } = rawLesson
      ? lessonWindow(rawLesson)
      : {
          windowStart: new Date(dayStart.getTime() - THRESHOLDS.BUFFER_BEFORE_MS),
          windowEnd:   new Date(dayEnd.getTime()   + THRESHOLDS.BUFFER_AFTER_MS),
          lessonEnd:   dayEnd,
        };

    const voiceRecords = cls.discord_channel_id
      ? await db.voiceAttendance.findMany({
          where: {
            discord_channel_id: cls.discord_channel_id,
            joined_at: { gte: windowStart, lte: windowEnd },
          },
          orderBy: { joined_at: 'asc' },
          select: {
            id: true, discord_user_id: true, discord_username: true,
            joined_at: true, left_at: true, duration_seconds: true,
            discord_channel: true, discord_channel_id: true, status: true,
            crm_user_id: true,
          },
        })
      : [];

    // Index manual overrides
    const attendanceByStudent: Record<number, { status: string; is_override: boolean }> = {};
    if (lesson) {
      for (const a of lesson.attendance) {
        attendanceByStudent[a.student_id] = { status: a.status, is_override: !!a.marked_by };
      }
    }

    // Use the real attendance engine — same as /lessons — to compute per-student status
    const lessonParam = rawLesson ?? { scheduled_at: dayStart, duration_min: (cls as any).duration_min };

    const matchedVoiceIds = new Set<number>();
    const expectedUserIds = new Set<number>();
    if (cls.tutor) expectedUserIds.add(cls.tutor.id);
    if (lesson?.substitute_tutor) expectedUserIds.add(lesson.substitute_tutor.id);
    for (const e of cls.enrollments) expectedUserIds.add(e.student.id);

    const roster = cls.enrollments.map((enr) => {
      const stu = enr.student;

      // Filter voice sessions for this user that overlap the lesson window
      const userSessions = voiceRecords.filter(
        (v) =>
          v.crm_user_id === stu.id &&
          sessionOverlapsWindow(
            { joined_at: new Date(v.joined_at), left_at: v.left_at ? new Date(v.left_at) : null },
            windowStart, windowEnd,
          ),
      );
      userSessions.forEach((v) => matchedVoiceIds.add(v.id));

      const fragments: RawVoiceFragment[] = userSessions.map((v) => ({
        id:               v.id,
        joined_at:        v.joined_at instanceof Date ? v.joined_at : new Date(v.joined_at),
        left_at:          v.left_at ? (v.left_at instanceof Date ? v.left_at : new Date(v.left_at)) : null,
        duration_seconds: v.duration_seconds ?? null,
        discord_channel:  v.discord_channel ?? null,
        discord_channel_id: v.discord_channel_id ?? null,
        status:           v.status ?? 'completed',
      }));

      const merged   = mergeVoiceFragments(fragments);
      const computed = computeStatus(lessonParam, merged);

      // Apply manual override if present (same as /lessons)
      const override   = attendanceByStudent[stu.id];
      const finalStatus = override?.is_override ? override.status : computed.status;
      const mismatch    = override?.is_override && override.status !== computed.status;

      return {
        student_id:       stu.id,
        student_name:     stu.full_name,
        discord_user_id:  stu.discord_user_id,
        has_voice_data:   merged !== null,
        voice_joined_at:  merged ? iso(merged.first_join) : null,
        voice_left_at:    merged ? iso(merged.last_leave) : null,
        voice_total_min:  merged?.total_minutes ?? null,
        is_late:          computed.is_late,
        left_early:       computed.left_early,
        computed_from_voice: computed.status,  // present | absent | late | left_early | partial
        recorded_attendance: override?.status ?? 'not_recorded',
        is_override:      override?.is_override ?? false,
        final_status:     finalStatus,
        mismatch,          // true if manual override disagrees with voice evidence
      };
    });

    // Unmatched voice: sessions in the channel that aren't attributed to any enrolled user
    const unmatchedVoice = voiceRecords
      .filter((v) => !matchedVoiceIds.has(v.id))
      .map((v) => ({
        id: v.id,
        discord_user_id: v.discord_user_id,
        discord_username: v.discord_username,
        crm_user_id: v.crm_user_id,
        in_expected_roster: v.crm_user_id ? expectedUserIds.has(v.crm_user_id) : false,
        joined_at: iso(v.joined_at instanceof Date ? v.joined_at : new Date(v.joined_at)),
        left_at: iso(v.left_at ? (v.left_at instanceof Date ? v.left_at : new Date(v.left_at)) : null),
        duration_seconds: v.duration_seconds,
      }));

    const presentStatuses = ['present', 'late', 'left_early'];
    res.json({
      class_id: cls.id,
      class_name: (cls as any).name,
      date,
      discord_channel_id: cls.discord_channel_id,
      lesson: lesson
        ? { id: lesson.id, title: lesson.title, scheduled_at: iso(lesson.scheduled_at instanceof Date ? lesson.scheduled_at : new Date(lesson.scheduled_at)), duration_min: lesson.duration_min, status: lesson.status, lesson_end: iso(lessonEndDate) }
        : null,
      window: { start: iso(windowStart), end: iso(windowEnd) },
      roster,
      unmatched_voice: unmatchedVoice,
      summary: {
        enrolled:         cls.enrollments.length,
        present:          roster.filter((r) => presentStatuses.includes(r.final_status)).length,
        absent:           roster.filter((r) => r.final_status === 'absent').length,
        late:             roster.filter((r) => r.is_late).length,
        left_early:       roster.filter((r) => r.left_early).length,
        partial:          roster.filter((r) => r.final_status === 'partial').length,
        no_voice_data:    roster.filter((r) => !r.has_voice_data).length,
        overrides:        roster.filter((r) => r.is_override).length,
        mismatches:       roster.filter((r) => r.mismatch).length,
        unmatched_discord: unmatchedVoice.length,
      },
    });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// ── GET /issues ───────────────────────────────────────────────────────────────

dbHealthRouter.get('/issues', async (_req: Request, res: Response) => {
  try {
    type Sev = 'critical' | 'high' | 'medium' | 'low';
    const issues: Array<{
      id: string; severity: Sev; category: string;
      entity_type: string; entity_id: number; entity_name: string;
      description: string; edit_path: string | null;
    }> = [];
    let idx = 0;
    const add = (sev: Sev, cat: string, et: string, eid: number, en: string, desc: string, path: string | null = null) =>
      issues.push({ id: `i${++idx}`, severity: sev, category: cat, entity_type: et, entity_id: eid, entity_name: en, description: desc, edit_path: path });

    const [users, classes, enrollments, unmatchedVoice] = await Promise.all([
      db.user.findMany({ select: { id: true, full_name: true, role: true, active: true, discord_user_id: true, enrollments: { where: { active: true }, select: { id: true } } } }),
      db.classGroup.findMany({ select: { id: true, name: true, active: true, tutor_id: true, discord_channel_id: true, google_calendar_id: true, enrollments: { where: { active: true }, select: { id: true } } } }),
      db.classEnrollment.findMany({ select: { id: true, active: true, student: { select: { id: true, full_name: true, role: true, active: true } }, class: { select: { id: true, name: true, active: true } } } }),
      db.voiceAttendance.count({ where: { crm_user_id: null } }),
    ]);

    for (const u of users) {
      if (!u.discord_user_id && (u.role === 'student' || u.role === 'tutor'))
        add('high', 'Discord', 'user', u.id, u.full_name, 'No Discord account linked', `/dashboard/admin/${u.role}s/${u.id}`);
      if (!u.active && u.enrollments.length > 0)
        add('high', 'Enrollment', 'user', u.id, u.full_name, `Inactive user has ${u.enrollments.length} active enrollment(s)`, `/dashboard/admin/students/${u.id}`);
      if (isEmailLike(u.full_name))
        add('medium', 'Data Quality', 'user', u.id, u.full_name, 'Name looks like an email address — may be a placeholder', `/dashboard/admin/students/${u.id}`);
    }

    const chanCounts: Record<string, number> = {};
    for (const c of classes) if (c.discord_channel_id) chanCounts[c.discord_channel_id] = (chanCounts[c.discord_channel_id] ?? 0) + 1;

    for (const c of classes) {
      if (!c.tutor_id && c.active)             add('high',     'Roster',      'class', c.id, c.name, 'Active class has no tutor assigned', `/dashboard/admin/classes/${c.id}`);
      if (!c.discord_channel_id && c.active)   add('medium',   'Discord',     'class', c.id, c.name, 'No Discord channel ID configured', `/dashboard/admin/classes/${c.id}`);
      if (c.enrollments.length === 0 && c.active) add('medium','Enrollment',  'class', c.id, c.name, 'Active class has no enrolled students', `/dashboard/admin/classes/${c.id}`);
      if (c.discord_channel_id && (chanCounts[c.discord_channel_id] ?? 0) > 1)
        add('critical', 'Discord', 'class', c.id, c.name, `Discord channel shared with ${chanCounts[c.discord_channel_id] - 1} other class(es) — permission conflicts likely`, `/dashboard/admin/classes/${c.id}`);
      if (isEmailLike(c.name))                 add('medium',   'Data Quality','class', c.id, c.name, 'Class name looks like an email address', `/dashboard/admin/classes/${c.id}`);
      if (!c.google_calendar_id && c.active)   add('low',      'Calendar',    'class', c.id, c.name, 'No Google Calendar linked', `/dashboard/admin/classes/${c.id}`);
    }

    for (const e of enrollments) {
      if ((e.student.role === 'tutor' || e.student.role === 'admin') && e.active)
        add('high', 'Enrollment', 'enrollment', e.id, `${e.student.full_name} → ${e.class.name}`, `${e.student.role} role enrolled as student`, `/dashboard/admin/classes/${e.class.id}`);
      if (!e.student.active && e.active)
        add('medium', 'Enrollment', 'enrollment', e.id, `${e.student.full_name} → ${e.class.name}`, 'Active enrollment for inactive student', `/dashboard/admin/students/${e.student.id}`);
    }

    if (unmatchedVoice > 0)
      add('medium', 'Attendance', 'system', 0, 'Voice Attendance', `${unmatchedVoice} voice record(s) with no matched CRM user`, null);

    const order: Record<Sev, number> = { critical: 0, high: 1, medium: 2, low: 3 };
    issues.sort((a, b) => order[a.severity] - order[b.severity]);

    res.json({ total: issues.length, items: issues });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});
