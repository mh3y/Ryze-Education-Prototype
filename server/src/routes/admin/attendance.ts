/**
 * /api/admin/attendance/*
 *
 * Architecture:
 *   Scheduled Lesson → Attendance Engine → Raw Discord Evidence → Final Result
 *
 * Endpoints:
 *   GET  /health                                 — attendance health dashboard (discrepancy detection)
 *   GET  /lessons                                — lesson-based attendance report (main view)
 *   POST /lessons/:lessonId/participants/:userId/override — manual status override
 *   GET  /voice-sessions                         — raw Discord voice feed (audit / debug)
 *   GET  /                                       — legacy CRM attendance records
 *   POST /:lessonId/:userId/mark                 — legacy manual mark
 */

import { Router } from 'express';
import { db } from '../../prisma';
import { requireAdmin } from '../../auth/middleware';
import {
  generateUnmarkedAttendance,
  resolveNotificationsForEntity,
} from '../../services/notificationService';
import {
  THRESHOLDS,
  mergeVoiceFragments,
  computeStatus,
  detectIssues,
  lessonWindow,
  sessionOverlapsWindow,
  type RawVoiceFragment,
} from '../../services/attendanceEngine';

function notifyAsync(fn: () => Promise<unknown>): void {
  fn().catch((e) => console.error('[attendance] notification side-effect error:', e));
}

export const attendanceRouter = Router();
attendanceRouter.use(requireAdmin);

// ── Helpers ───────────────────────────────────────────────────────────────────

function todayAEST(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Australia/Sydney' });
}

function aestDayBoundaries(dateStr: string): { dayStart: Date; dayEnd: Date } {
  const dayStart = new Date(dateStr + 'T00:00:00+10:00');
  const dayEnd   = new Date(dayStart.getTime() + 86_400_000);
  return { dayStart, dayEnd };
}

function toFragment(v: any): RawVoiceFragment {
  return {
    id:               v.id,
    joined_at:        v.joined_at instanceof Date ? v.joined_at : new Date(v.joined_at),
    left_at:          v.left_at ? (v.left_at instanceof Date ? v.left_at : new Date(v.left_at)) : null,
    duration_seconds: v.duration_seconds ?? null,
    discord_channel:  v.discord_channel ?? null,
    discord_channel_id: v.discord_channel_id ?? null,
    status:           v.status ?? 'completed',
  };
}

function serializeDate(d: Date | null | undefined): string | null {
  if (!d) return null;
  return d instanceof Date ? d.toISOString() : new Date(d).toISOString();
}

// ── GET /api/admin/attendance/health ──────────────────────────────────────────
//
// Attendance health check for a given date (AEST). Detects:
//   • Lessons with no voice evidence at all ("missing_attendance")
//   • Voice sessions not matched to any lesson participant ("orphan_sessions")
//   • Bot sync log showing last sync time and status
//
// Returns a structured health report suitable for an admin dashboard widget.

attendanceRouter.get('/health', async (req, res) => {
  try {
    const dateStr = (req.query.date as string | undefined) ?? todayAEST();
    const { dayStart, dayEnd } = aestDayBoundaries(dateStr);

    const voiceWindowStart = new Date(dayStart.getTime() - THRESHOLDS.BUFFER_BEFORE_MS);
    const voiceWindowEnd   = new Date(dayEnd.getTime()   + THRESHOLDS.BUFFER_AFTER_MS);

    // Fetch lessons and voice sessions in parallel
    const [lessons, allVoiceSessions, lastSyncs] = await Promise.all([
      db.lesson.findMany({
        where: {
          scheduled_at: { gte: dayStart, lt: dayEnd },
          status:       { not: 'cancelled' },
        },
        include: {
          class: {
            include: {
              tutor: { select: { id: true, full_name: true } },
              enrollments: {
                where:   { active: true },
                include: { student: { select: { id: true, full_name: true } } },
              },
            },
          },
        },
        orderBy: { scheduled_at: 'asc' },
      }),
      db.voiceAttendance.findMany({
        where:   { joined_at: { gte: voiceWindowStart, lt: voiceWindowEnd } },
        include: { user: { select: { id: true, full_name: true, role: true } } },
        orderBy: { joined_at: 'asc' },
      }),
      // Last 3 sync log entries of each type relevant to attendance
      db.botSyncLog.findMany({
        where:   { sync_type: { in: ['voice_sessions', 'lessons', 'members', 'classes'] } },
        orderBy: { started_at: 'desc' },
        take: 10,
      }).catch(() => [] as any[]),
    ]);

    const matchedSessionIds = new Set<number>();

    // For each lesson, check if any participant has voice evidence
    const lessonHealth = lessons.map((lesson: any) => {
      const { windowStart, windowEnd } = lessonWindow({
        scheduled_at: lesson.scheduled_at,
        duration_min: lesson.duration_min,
      });

      const participantIds = new Set<number>();
      if (lesson.class?.tutor?.id) participantIds.add(lesson.class.tutor.id);
      for (const e of (lesson.class?.enrollments ?? [])) {
        participantIds.add(e.student.id);
      }

      const lessonSessions = allVoiceSessions.filter(
        (s: any) =>
          s.crm_user_id != null &&
          participantIds.has(s.crm_user_id) &&
          sessionOverlapsWindow(
            { joined_at: new Date(s.joined_at), left_at: s.left_at ? new Date(s.left_at) : null },
            windowStart, windowEnd,
          ),
      );
      lessonSessions.forEach((s: any) => matchedSessionIds.add(s.id));

      const hasEvidence    = lessonSessions.length > 0;
      const enrolledCount  = participantIds.size;
      const withEvidence   = new Set(lessonSessions.map((s: any) => s.crm_user_id)).size;
      const missingCount   = enrolledCount - withEvidence;

      return {
        lesson_id:      lesson.id,
        lesson_title:   lesson.title,
        scheduled_at:   lesson.scheduled_at,
        class_name:     lesson.class?.name ?? 'Unknown',
        enrolled_count: enrolledCount,
        with_evidence:  withEvidence,
        missing_count:  missingCount,
        has_evidence:   hasEvidence,
        status:         !hasEvidence && enrolledCount > 0
          ? 'no_attendance'
          : missingCount > 0
          ? 'partial_attendance'
          : 'ok',
      };
    });

    // Orphan sessions: voice activity with no matching lesson participant
    const orphanSessions = allVoiceSessions
      .filter((s: any) => !matchedSessionIds.has(s.id))
      .map((s: any) => ({
        id:               s.id,
        discord_username: s.discord_username ?? null,
        crm_user_name:    s.user?.full_name ?? null,
        discord_channel:  s.discord_channel ?? null,
        joined_at:        s.joined_at,
        left_at:          s.left_at ?? null,
      }));

    // Summarise sync log by type
    const syncByType: Record<string, any> = {};
    for (const entry of lastSyncs) {
      if (!syncByType[entry.sync_type]) {
        syncByType[entry.sync_type] = {
          last_run:  entry.started_at,
          status:    entry.status,
          error:     entry.error_message ?? null,
        };
      }
    }

    // Overall health score
    const totalLessons      = lessonHealth.length;
    const noAttendance      = lessonHealth.filter((l: any) => l.status === 'no_attendance').length;
    const partialAttendance = lessonHealth.filter((l: any) => l.status === 'partial_attendance').length;
    const okLessons         = lessonHealth.filter((l: any) => l.status === 'ok').length;

    const overallStatus =
      noAttendance > 0   ? 'critical' :
      partialAttendance > 0 ? 'warning' :
      totalLessons === 0 ? 'no_lessons' :
      'healthy';

    res.json({
      date:   dateStr,
      status: overallStatus,
      summary: {
        total_lessons:        totalLessons,
        lessons_ok:           okLessons,
        lessons_no_attendance: noAttendance,
        lessons_partial:      partialAttendance,
        voice_sessions_total: allVoiceSessions.length,
        orphan_sessions:      orphanSessions.length,
      },
      lessons:         lessonHealth,
      orphan_sessions: orphanSessions,
      sync_log:        syncByType,
    });
  } catch (e: any) {
    console.error('[attendance] health error:', e?.message);
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// ── GET /api/admin/attendance/lessons ─────────────────────────────────────────
//
// Main view: lesson-based attendance report for a given date (AEST).
// Returns lessons with participant-level attendance derived from Discord voice evidence.

attendanceRouter.get('/lessons', async (req, res) => {
  try {
    const dateStr = (req.query.date as string | undefined) ?? todayAEST();
    const { dayStart, dayEnd } = aestDayBoundaries(dateStr);

    // Extended window for voice sessions (add buffers to both sides of the day)
    const voiceWindowStart = new Date(dayStart.getTime() - THRESHOLDS.BUFFER_BEFORE_MS);
    const voiceWindowEnd   = new Date(dayEnd.getTime()   + THRESHOLDS.BUFFER_AFTER_MS);

    // ── 1. Fetch lessons for the day ─────────────────────────────────────────
    const lessons = await db.lesson.findMany({
      where: {
        scheduled_at: { gte: dayStart, lt: dayEnd },
        status:       { not: 'cancelled' },
      },
      include: {
        class: {
          include: {
            tutor: { select: { id: true, full_name: true, discord_user_id: true } },
            enrollments: {
              where:   { active: true },
              include: {
                student: { select: { id: true, full_name: true, discord_user_id: true, role: true } },
              },
            },
          },
        },
        attendance: {
          include: { student: { select: { full_name: true } } },
        },
      },
      orderBy: { scheduled_at: 'asc' },
    });

    // ── 2. Fetch ALL voice sessions in the extended day window ───────────────
    const allVoiceSessions = await db.voiceAttendance.findMany({
      where: {
        joined_at: { gte: voiceWindowStart, lt: voiceWindowEnd },
      },
      include: {
        user: { select: { id: true, full_name: true, role: true, discord_user_id: true } },
      },
      orderBy: { joined_at: 'asc' },
    });

    // Track which voice session IDs are matched to a lesson participant
    const matchedSessionIds = new Set<number>();

    // ── 3. Build lesson reports ──────────────────────────────────────────────
    const lessonReports = lessons.map((lesson: any) => {
      const { windowStart, windowEnd, lessonEnd } = lessonWindow({
        scheduled_at: lesson.scheduled_at,
        duration_min: lesson.duration_min,
      });

      // Index manual overrides by student_id
      const overrideMap = new Map<number, any>();
      for (const att of lesson.attendance) {
        overrideMap.set(att.student_id, att);
      }

      // ── Helper: build participant report ────────────────────────────────
      function buildParticipant(user: { id: number; full_name: string; discord_user_id?: string | null; role?: string }, enrolled: boolean) {
        // Find voice sessions for this user in the lesson window
        const userSessions = allVoiceSessions.filter(
          (s: any) =>
            s.crm_user_id === user.id &&
            sessionOverlapsWindow(
              { joined_at: new Date(s.joined_at), left_at: s.left_at ? new Date(s.left_at) : null },
              windowStart,
              windowEnd,
            ),
        );

        // Mark them as matched
        userSessions.forEach((s: any) => matchedSessionIds.add(s.id));

        const fragments = userSessions.map(toFragment);
        const merged    = mergeVoiceFragments(fragments);
        const computed  = computeStatus(
          { scheduled_at: lesson.scheduled_at, duration_min: lesson.duration_min },
          merged,
        );

        // Apply manual override from Attendance table (if any)
        const override       = overrideMap.get(user.id) ?? null;
        const isOverride     = !!override && override.marked_by != null;
        const overrideStatus = isOverride ? override.status : null;
        const finalStatus    = overrideStatus ?? computed.status;

        return {
          user_id:         user.id,
          full_name:       user.full_name,
          role:            (user as any).role ?? 'student',
          discord_user_id: user.discord_user_id ?? null,
          enrolled,

          // Merged summary
          first_join:    serializeDate(merged?.first_join),
          last_leave:    serializeDate(merged?.last_leave),
          total_minutes: merged?.total_minutes ?? 0,

          // Computed status
          computed_status: computed.status,
          is_late:         computed.is_late,
          left_early:      computed.left_early,

          // Override
          is_override:     isOverride,
          override_status: overrideStatus,
          override_notes:  override?.notes ?? null,
          override_by:     override?.marked_by ?? null,
          override_at:     serializeDate(override?.marked_at),

          // Final
          final_status: finalStatus,

          // Raw fragments for audit view
          fragments: fragments.map(f => ({
            id:               f.id,
            joined_at:        serializeDate(f.joined_at),
            left_at:          serializeDate(f.left_at),
            duration_minutes: f.duration_seconds != null ? Math.round(f.duration_seconds / 60) : null,
            discord_channel:  f.discord_channel,
            status:           f.status,
          })),
        };
      }

      // ── Tutor ─────────────────────────────────────────────────────────
      const tutorUser  = lesson.class?.tutor ?? null;
      const tutorReport = tutorUser
        ? buildParticipant({ ...tutorUser, role: 'tutor' }, true)
        : null;

      // ── Students ──────────────────────────────────────────────────────
      const studentReports = (lesson.class?.enrollments ?? []).map((e: any) =>
        buildParticipant(e.student, true),
      );

      // ── Issues ────────────────────────────────────────────────────────
      const issues = detectIssues({
        tutor:    tutorReport
          ? { user_id: tutorReport.user_id, full_name: tutorReport.full_name, final_status: tutorReport.final_status, is_late: tutorReport.is_late, left_early: tutorReport.left_early }
          : null,
        students: studentReports.map((s: any) => ({
          user_id: s.user_id, full_name: s.full_name, final_status: s.final_status, is_late: s.is_late, left_early: s.left_early,
        })),
      });

      // ── Attendance rate ───────────────────────────────────────────────
      const enrolledCount = studentReports.length;
      const presentCount  = studentReports.filter(
        (s: any) => ['present', 'late', 'left_early'].includes(s.final_status),
      ).length;
      const attendanceRate = enrolledCount > 0
        ? Math.round((presentCount / enrolledCount) * 100)
        : 0;

      return {
        id:            lesson.id,
        class_id:      lesson.class_id,
        class_name:    lesson.class?.name ?? 'Unknown Class',
        subject:       lesson.class?.subject ?? null,
        year_level:    lesson.class?.year_level ?? null,
        title:         lesson.title,
        scheduled_at:  serializeDate(lesson.scheduled_at),
        scheduled_end: serializeDate(lessonEnd),
        duration_min:  lesson.duration_min,
        lesson_status: lesson.status,
        meet_link:     lesson.meet_link ?? null,

        tutor:    tutorReport,
        students: studentReports,

        issues,
        has_issues: issues.length > 0,

        enrolled_count:  enrolledCount,
        present_count:   presentCount,
        attendance_rate: attendanceRate,
      };
    });

    // ── 4. Unmatched voice sessions ──────────────────────────────────────────
    // Sessions not matched to any lesson participant, ordered by join time.
    const unmatchedSessions = allVoiceSessions
      .filter((s: any) => !matchedSessionIds.has(s.id))
      .map((s: any) => ({
        id:               s.id,
        discord_user_id:  s.discord_user_id,
        discord_username: s.discord_username ?? null,
        discord_channel:  s.discord_channel ?? null,
        joined_at:        serializeDate(s.joined_at instanceof Date ? s.joined_at : new Date(s.joined_at)),
        left_at:          serializeDate(s.left_at ? (s.left_at instanceof Date ? s.left_at : new Date(s.left_at)) : null),
        duration_minutes: s.duration_seconds != null ? Math.round(s.duration_seconds / 60) : null,
        status:           s.status,
        crm_user_id:      s.crm_user_id ?? null,
        crm_user_name:    s.user?.full_name ?? null,
        crm_user_role:    s.user?.role ?? null,
      }));

    // ── 5. Day-level summary ─────────────────────────────────────────────────
    const totalLessons     = lessonReports.length;
    const completedLessons = lessonReports.filter(l => l.lesson_status === 'completed').length;
    const totalIssues      = lessonReports.reduce((acc, l) => acc + l.issues.length, 0);
    const totalEnrolled    = lessonReports.reduce((acc, l) => acc + l.enrolled_count, 0);
    const totalPresent     = lessonReports.reduce((acc, l) => acc + l.present_count, 0);
    const overallRate      = totalEnrolled > 0 ? Math.round((totalPresent / totalEnrolled) * 100) : 0;

    res.json({
      date: dateStr,
      summary: {
        total_lessons:      totalLessons,
        completed_lessons:  completedLessons,
        issues_count:       totalIssues,
        attendance_rate:    overallRate,
        sessions_unmatched: unmatchedSessions.length,
      },
      lessons:             lessonReports,
      unmatched_sessions:  unmatchedSessions,
    });
  } catch (e: any) {
    console.error('[attendance] lessons error:', e?.message);
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// ── POST /api/admin/attendance/lessons/:lessonId/participants/:userId/override ─
//
// Admin manually overrides the attendance status for one participant in a lesson.
// Stores in the Attendance table; original Discord evidence remains immutable.

attendanceRouter.post('/lessons/:lessonId/participants/:userId/override', async (req, res) => {
  try {
    const lesson_id  = Number(req.params.lessonId);
    const student_id = Number(req.params.userId);

    const { status, notes } = req.body as { status?: string; notes?: string };
    if (!status) { res.status(400).json({ detail: 'status is required' }); return; }

    const validStatuses = ['present', 'absent', 'late', 'left_early', 'partial', 'excused', 'unknown'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ detail: `status must be one of: ${validStatuses.join(', ')}` });
      return;
    }

    // Verify lesson exists
    const lesson = await db.lesson.findUnique({ where: { id: lesson_id } });
    if (!lesson) { res.status(404).json({ detail: 'Lesson not found' }); return; }

    // req.user is set by requireAdmin middleware
    const adminId = (req as any).user?.id ?? null;

    const record = await db.attendance.upsert({
      where:  { lesson_id_student_id: { lesson_id, student_id } },
      create: {
        lesson_id, student_id,
        status:    status as any,
        notes:     notes ?? null,
        marked_by: adminId,
        marked_at: new Date(),
      },
      update: {
        status:    status as any,
        notes:     notes ?? null,
        marked_by: adminId,
        marked_at: new Date(),
      },
    });

    res.json({ id: record.id, status: record.status, is_override: true });
  } catch (e: any) {
    console.error('[attendance] override error:', e?.message);
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// ── GET /api/admin/attendance/voice-sessions ──────────────────────────────────
// Raw Discord voice sessions (audit / debug view). Kept from original implementation.

attendanceRouter.get('/voice-sessions', async (req, res) => {
  try {
    const { date, user_id, skip, limit } = req.query as {
      date?: string; user_id?: string; skip?: string; limit?: string;
    };

    const where: any = {};
    if (date) {
      const { dayStart, dayEnd } = aestDayBoundaries(date);
      where.joined_at = { gte: dayStart, lt: dayEnd };
    }
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

// ── GET /api/admin/attendance ─────────────────────────────────────────────────
// Legacy: CRM attendance records from the Attendance table.

function attendanceToRecord(a: any) {
  return {
    id:                          a.id,
    lesson_id:                   a.lesson_id,
    lesson_title:                a.lesson?.title ?? null,
    user_id:                     a.student_id,
    student_name:                a.student?.full_name ?? null,
    status:                      a.status,
    tutor_marked_status:         a.status,
    discord_verification_status: 'not_verified',
    discord_verified_minutes:    null,
    joined_at:                   null,
    left_at:                     null,
    duration_minutes:            null,
    has_mismatch:                false,
    notes:                       a.notes ?? null,
  };
}

attendanceRouter.get('/', async (req, res) => {
  try {
    const { lesson_id, user_id } = req.query as { lesson_id?: string; user_id?: string };
    const where: any = {};
    if (lesson_id) where.lesson_id = Number(lesson_id);
    if (user_id)   where.student_id = Number(user_id);

    const items = await db.attendance.findMany({
      where,
      include: {
        lesson:  { select: { title: true } },
        student: { select: { full_name: true } },
      },
      orderBy: { lesson_id: 'desc' },
    });
    res.json({ total: items.length, items: items.map(attendanceToRecord) });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// ── POST /api/admin/attendance/:lessonId/:userId/mark ─────────────────────────
// Legacy: direct manual mark endpoint (still used by old CRM tab).

attendanceRouter.post('/:lessonId/:userId/mark', async (req, res) => {
  try {
    const lesson_id  = Number(req.params.lessonId);
    const student_id = Number(req.params.userId);
    const { status, notes } = req.body as { status?: string; notes?: string };
    if (!status) { res.status(400).json({ detail: 'status is required' }); return; }

    const record = await db.attendance.upsert({
      where:  { lesson_id_student_id: { lesson_id, student_id } },
      create: { lesson_id, student_id, status: status as any, notes: notes ?? null },
      update: { status: status as any, notes: notes ?? null },
    });

    notifyAsync(async () => {
      const unknownCount = await db.attendance.count({ where: { lesson_id, status: 'unknown' } });
      if (unknownCount === 0) {
        await resolveNotificationsForEntity('attendance_unmarked', lesson_id);
      } else {
        await generateUnmarkedAttendance();
      }
    });

    res.json({ id: record.id, status: record.status });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});
