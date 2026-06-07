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
import { sydneyDayBounds, todaySydney } from '../../utils/timezone';
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
  detectUnexpectedParticipants,
  type RawVoiceFragment,
  type UnexpectedParticipant,
} from '../../services/attendanceEngine';

function notifyAsync(fn: () => Promise<unknown>): void {
  fn().catch((e) => console.error('[attendance] notification side-effect error:', e));
}

export const attendanceRouter = Router();
attendanceRouter.use(requireAdmin);

// ── Helpers ───────────────────────────────────────────────────────────────────
// todaySydney() and sydneyDayBounds() are imported from utils/timezone.ts.
// They replace the former todayAEST() / aestDayBoundaries() helpers which
// hardcoded +10:00 and were wrong during AEDT (Sydney +11:00, Oct–Apr).

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
    const dateStr = (req.query.date as string | undefined) ?? todaySydney();
    const { start: dayStart, end: dayEnd } = sydneyDayBounds(0, dateStr);

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
          substitute_tutor: { select: { id: true, full_name: true } },
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
      if ((lesson as any).substitute_tutor?.id) participantIds.add((lesson as any).substitute_tutor.id);
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
    const dateStr = (req.query.date as string | undefined) ?? todaySydney();
    const { start: dayStart, end: dayEnd } = sydneyDayBounds(0, dateStr);

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
        substitute_tutor: { select: { id: true, full_name: true, discord_user_id: true } },
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

      // ── Primary tutor ─────────────────────────────────────────────────
      const tutorUser  = lesson.class?.tutor ?? null;
      const tutorReport = tutorUser
        ? buildParticipant({ ...tutorUser, role: 'tutor' }, true)
        : null;

      // ── Substitute tutor (if set for this lesson) ─────────────────────
      const subTutorUser = (lesson as any).substitute_tutor ?? null;
      const subTutorReport = subTutorUser
        ? buildParticipant({ ...subTutorUser, role: 'tutor' }, true)
        : null;

      // ── Students ──────────────────────────────────────────────────────
      const studentReports = (lesson.class?.enrollments ?? []).map((e: any) =>
        buildParticipant(e.student, true),
      );

      // ── Issues — use substitute tutor if present, else primary tutor ──
      const effectiveTutor = subTutorReport ?? tutorReport;
      const issues = detectIssues({
        tutor: effectiveTutor
          ? { user_id: effectiveTutor.user_id, full_name: effectiveTutor.full_name, final_status: effectiveTutor.final_status, is_late: effectiveTutor.is_late, left_early: effectiveTutor.left_early }
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

        tutor:            tutorReport,
        substitute_tutor: subTutorReport,
        students:         studentReports,

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
      const { start: dayStart, end: dayEnd } = sydneyDayBounds(0, date);
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

// ── Shared reconciliation helper ──────────────────────────────────────────────
//
// Builds a full lesson report (same shape as /lessons) for a single lesson,
// given the lesson row and a pre-loaded slice of voice sessions. Used by
// /overview and /classes/:classId to avoid repeating the reconciliation logic.

function reconcileLesson(params: {
  lesson:              any;
  voiceSessionsByUser: Map<number, any[]>;
  channelSessions:     any[]; // all sessions in this lesson's channel+window
}): any {
  const { lesson, voiceSessionsByUser, channelSessions } = params;
  const { windowStart, windowEnd, lessonEnd } = lessonWindow({
    scheduled_at: lesson.scheduled_at instanceof Date ? lesson.scheduled_at : new Date(lesson.scheduled_at),
    duration_min: lesson.duration_min,
  });

  // Index manual overrides by student_id
  const overrideMap = new Map<number, any>();
  for (const att of (lesson.attendance ?? [])) {
    overrideMap.set(att.student_id, att);
  }

  // Build participant report for a single user
  function buildParticipant(
    user: { id: number; full_name: string; discord_user_id?: string | null; role?: string },
    enrolled: boolean,
  ) {
    const userSessions = (voiceSessionsByUser.get(user.id) ?? []).filter((s: any) =>
      sessionOverlapsWindow(
        { joined_at: new Date(s.joined_at), left_at: s.left_at ? new Date(s.left_at) : null },
        windowStart,
        windowEnd,
      ),
    );

    const fragments = userSessions.map(toFragment);
    const merged    = mergeVoiceFragments(fragments);
    const computed  = computeStatus(
      { scheduled_at: lesson.scheduled_at instanceof Date ? lesson.scheduled_at : new Date(lesson.scheduled_at), duration_min: lesson.duration_min },
      merged,
    );

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
      first_join:      serializeDate(merged?.first_join),
      last_leave:      serializeDate(merged?.last_leave),
      total_minutes:   merged?.total_minutes ?? 0,
      computed_status: computed.status,
      is_late:         computed.is_late,
      left_early:      computed.left_early,
      is_override:     isOverride,
      override_status: overrideStatus,
      override_notes:  override?.notes ?? null,
      override_by:     override?.marked_by ?? null,
      override_at:     serializeDate(override?.marked_at),
      final_status:    finalStatus,
      fragments:       fragments.map(f => ({
        id:               f.id,
        joined_at:        serializeDate(f.joined_at),
        left_at:          serializeDate(f.left_at),
        duration_minutes: f.duration_seconds != null ? Math.round(f.duration_seconds / 60) : null,
        discord_channel:  f.discord_channel,
        status:           f.status,
      })),
    };
  }

  const tutorUser      = lesson.class?.tutor ?? null;
  const tutorReport    = tutorUser ? buildParticipant({ ...tutorUser, role: 'tutor' }, true) : null;
  const subTutorUser   = lesson.substitute_tutor ?? null;
  const subTutorReport = subTutorUser ? buildParticipant({ ...subTutorUser, role: 'tutor' }, true) : null;

  const studentReports = (lesson.class?.enrollments ?? []).map((e: any) =>
    buildParticipant(e.student, true),
  );

  const effectiveTutor = subTutorReport ?? tutorReport;
  const issues = detectIssues({
    tutor: effectiveTutor
      ? { user_id: effectiveTutor.user_id, full_name: effectiveTutor.full_name, final_status: effectiveTutor.final_status, is_late: effectiveTutor.is_late, left_early: effectiveTutor.left_early }
      : null,
    students: studentReports.map((s: any) => ({
      user_id: s.user_id, full_name: s.full_name, final_status: s.final_status, is_late: s.is_late, left_early: s.left_early,
    })),
  });

  // Expected user IDs for unexpected participant detection
  const expectedIds = new Set<number>();
  if (tutorUser)    expectedIds.add(tutorUser.id);
  if (subTutorUser) expectedIds.add(subTutorUser.id);
  for (const e of (lesson.class?.enrollments ?? [])) expectedIds.add(e.student.id);

  const unexpectedParticipants: UnexpectedParticipant[] = lesson.class?.discord_channel_id
    ? detectUnexpectedParticipants({
        expectedUserIds:  expectedIds,
        channelSessions:  channelSessions.filter((s: any) =>
          sessionOverlapsWindow(
            { joined_at: new Date(s.joined_at), left_at: s.left_at ? new Date(s.left_at) : null },
            windowStart,
            windowEnd,
          ),
        ),
      })
    : [];

  const enrolledCount  = studentReports.length;
  const presentCount   = studentReports.filter((s: any) =>
    ['present', 'late', 'left_early'].includes(s.final_status),
  ).length;
  const attendanceRate = enrolledCount > 0 ? Math.round((presentCount / enrolledCount) * 100) : 0;

  // admin_test_activity is informational only — exclude from issue counts / health flags
  const actionableUnexpected = unexpectedParticipants.filter(p => p.type !== 'admin_test_activity');

  return {
    id:                     lesson.id,
    class_id:               lesson.class_id,
    class_name:             lesson.class?.name ?? 'Unknown Class',
    subject:                lesson.class?.subject ?? null,
    year_level:             lesson.class?.year_level ?? null,
    title:                  lesson.title,
    scheduled_at:           serializeDate(lesson.scheduled_at instanceof Date ? lesson.scheduled_at : new Date(lesson.scheduled_at)),
    scheduled_end:          serializeDate(lessonEnd),
    duration_min:           lesson.duration_min,
    lesson_status:          lesson.status,
    meet_link:              lesson.meet_link ?? null,
    tutor:                  tutorReport,
    substitute_tutor:       subTutorReport,
    students:               studentReports,
    issues,
    // has_issues excludes admin_test_activity so admin monitoring doesn't pollute health status
    has_issues:             issues.length > 0 || actionableUnexpected.length > 0,
    unexpected_participants: unexpectedParticipants,
    enrolled_count:         enrolledCount,
    present_count:          presentCount,
    attendance_rate:        attendanceRate,
  };
}

// ── GET /api/admin/attendance/overview ────────────────────────────────────────
//
// Class-centric overview: all active classes with their health status, most-recent
// lesson attendance, and week-level metrics. The primary entry point for the
// redesigned Attendance page.

attendanceRouter.get('/overview', async (req, res) => {
  try {
    const currentUser = (req as any).user as { id: number; role: string } | undefined;
    // Tutors see only their own classes; admins see all
    const classWhere: any = { active: true };
    if (currentUser?.role === 'tutor') classWhere.tutor_id = currentUser.id;

    const now    = new Date();
    const past60 = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    const next30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Week window (last 7 days) for metrics
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // 1. Load active classes (scoped to tutor if applicable)
    const classes = await db.classGroup.findMany({
      where: classWhere,
      include: {
        tutor: { select: { id: true, full_name: true, discord_user_id: true } },
        enrollments: {
          where:   { active: true },
          include: { student: { select: { id: true, full_name: true, discord_user_id: true, role: true } } },
        },
      },
      orderBy: { name: 'asc' },
    });

    if (classes.length === 0) {
      return res.json({
        metrics: { active_classes: 0, lessons_this_week: 0, lessons_completed: 0, healthy_lessons: 0, lessons_with_issues: 0, missing_tutor: 0, missing_student: 0, unmatched_voice: 0, possible_substitute: 0 },
        classes: [],
      });
    }

    const classIds = classes.map((c: any) => c.id);

    // 2. Load lessons for active classes in last 60 days + next scheduled
    const [recentLessons, upcomingLessons] = await Promise.all([
      db.lesson.findMany({
        where: { class_id: { in: classIds }, scheduled_at: { gte: past60, lte: now }, status: { not: 'cancelled' } },
        include: {
          class: {
            include: {
              tutor: { select: { id: true, full_name: true, discord_user_id: true } },
              enrollments: { where: { active: true }, include: { student: { select: { id: true, full_name: true, discord_user_id: true, role: true } } } },
            },
          },
          substitute_tutor: { select: { id: true, full_name: true, discord_user_id: true } },
          attendance:       { include: { student: { select: { full_name: true } } } },
        },
        orderBy: { scheduled_at: 'desc' },
      }),
      db.lesson.findMany({
        where: { class_id: { in: classIds }, scheduled_at: { gt: now, lte: next30 }, status: { not: 'cancelled' } },
        select: { id: true, class_id: true, title: true, scheduled_at: true, duration_min: true },
        orderBy: { scheduled_at: 'asc' },
      }),
    ]);

    // 3. Load voice sessions for the relevant time range and class channels
    const channelIds = classes.map((c: any) => c.discord_channel_id).filter(Boolean) as string[];
    const voiceWindowStart = new Date(past60.getTime() - THRESHOLDS.BUFFER_BEFORE_MS);
    const voiceWindowEnd   = new Date(now.getTime()    + THRESHOLDS.BUFFER_AFTER_MS);

    const allVoiceSessions = channelIds.length > 0
      ? await db.voiceAttendance.findMany({
          where: {
            joined_at:          { gte: voiceWindowStart, lte: voiceWindowEnd },
            discord_channel_id: { in: channelIds },
          },
          include: { user: { select: { id: true, full_name: true, role: true } } },
          orderBy: { joined_at: 'asc' },
        })
      : [];

    // Index voice sessions by crm_user_id and by channel
    const sessionsByUser    = new Map<number, any[]>();
    const sessionsByChannel = new Map<string, any[]>();
    for (const s of allVoiceSessions) {
      if (s.crm_user_id) {
        if (!sessionsByUser.has(s.crm_user_id)) sessionsByUser.set(s.crm_user_id, []);
        sessionsByUser.get(s.crm_user_id)!.push(s);
      }
      const ch = s.discord_channel_id ?? '';
      if (ch) {
        if (!sessionsByChannel.has(ch)) sessionsByChannel.set(ch, []);
        sessionsByChannel.get(ch)!.push(s);
      }
    }

    // Index lessons by class_id
    const lessonsByClass = new Map<number, any[]>();
    for (const l of recentLessons) {
      if (!lessonsByClass.has(l.class_id)) lessonsByClass.set(l.class_id, []);
      lessonsByClass.get(l.class_id)!.push(l);
    }

    // Index next lesson by class_id
    const nextByClass = new Map<number, any>();
    for (const l of upcomingLessons) {
      if (!nextByClass.has(l.class_id)) nextByClass.set(l.class_id, l);
    }

    // 4. Compute per-class overview
    const classOverviews = classes.map((cls: any) => {
      const classLessons  = lessonsByClass.get(cls.id) ?? [];
      const recent3       = classLessons.slice(0, 3); // already ordered desc
      const channelSessions = cls.discord_channel_id ? (sessionsByChannel.get(cls.discord_channel_id) ?? []) : [];

      const reconciledLessons = recent3.map((l: any) =>
        reconcileLesson({ lesson: l, voiceSessionsByUser: sessionsByUser, channelSessions }),
      );

      // Derive class health from most recent reconciled lesson
      let health_status: string;
      let health_message: string;
      let issue_count = 0;

      const configWarnings: string[] = [];
      if (!cls.tutor)                          configWarnings.push('No tutor assigned');
      if ((cls.enrollments ?? []).length === 0) configWarnings.push('No enrolled students');
      if (!cls.discord_channel_id)             configWarnings.push('No Discord channel');

      if (configWarnings.length > 0) {
        health_status  = 'misconfigured';
        health_message = configWarnings.join(', ');
      } else if (reconciledLessons.length === 0) {
        health_status  = 'no_recent_lessons';
        health_message = 'No lessons in last 60 days';
      } else {
        const mostRecent = reconciledLessons[0];
        // Exclude admin_test_activity from issue counts — admin monitoring is not a health issue
        const allIssues  = [
          ...mostRecent.issues,
          ...mostRecent.unexpected_participants.filter((p: any) => p.type !== 'admin_test_activity'),
        ];
        issue_count      = allIssues.length;

        const hasTutorAbsent = mostRecent.issues.some((i: any) => i.type === 'tutor_absent');
        if (hasTutorAbsent) {
          health_status  = 'critical';
          health_message = `Tutor absent ${new Date(mostRecent.scheduled_at).toLocaleDateString('en-AU', { timeZone: 'Australia/Sydney', day: 'numeric', month: 'short' })}`;
        } else if (issue_count > 0) {
          health_status  = 'issue';
          health_message = `${issue_count} issue${issue_count !== 1 ? 's' : ''} in last lesson`;
        } else {
          health_status  = 'healthy';
          health_message = 'All good';
        }
      }

      return {
        id:                cls.id,
        name:              cls.name,
        class_type:        cls.class_type,
        schedule_day:      cls.schedule_day,
        schedule_hour:     cls.schedule_hour,
        schedule_minute:   cls.schedule_minute,
        duration_min:      cls.duration_min,
        timezone:          cls.timezone,
        subject:           cls.subject,
        year_level:        cls.year_level ?? null,
        tutor:             cls.tutor ? { id: cls.tutor.id, full_name: cls.tutor.full_name } : null,
        enrolled_students: (cls.enrollments ?? []).map((e: any) => ({ id: e.student.id, full_name: e.student.full_name })),
        discord_channel_id: cls.discord_channel_id ?? null,
        next_lesson:       nextByClass.has(cls.id)
          ? { id: nextByClass.get(cls.id).id, scheduled_at: serializeDate(nextByClass.get(cls.id).scheduled_at) }
          : null,
        recent_lessons:    reconciledLessons,
        health_status,
        health_message,
        issue_count,
        config_warnings:   configWarnings,
      };
    });

    // 5. Week-level metrics
    const weekLessons = recentLessons.filter((l: any) => new Date(l.scheduled_at) >= weekStart);
    let weekMissingTutor = 0, weekMissingStudent = 0, weekUnmatched = 0, weekPossibleSub = 0;
    let weekHealthy = 0, weekWithIssues = 0;

    for (const l of weekLessons) {
      const channelSessions = l.class?.discord_channel_id ? (sessionsByChannel.get(l.class.discord_channel_id) ?? []) : [];
      const report = reconcileLesson({ lesson: l, voiceSessionsByUser: sessionsByUser, channelSessions });
      if (report.issues.some((i: any) => i.type === 'tutor_absent')) weekMissingTutor++;
      if (report.issues.some((i: any) => i.type === 'student_absent')) weekMissingStudent++;
      if (report.unexpected_participants.some((p: any) => p.type === 'unknown_user')) weekUnmatched++;
      if (report.unexpected_participants.some((p: any) => p.type === 'possible_substitute')) weekPossibleSub++;
      if (report.has_issues) weekWithIssues++; else weekHealthy++;
    }

    res.json({
      metrics: {
        active_classes:      classes.length,
        lessons_this_week:   weekLessons.length,
        lessons_completed:   weekLessons.filter((l: any) => l.status === 'completed').length,
        healthy_lessons:     weekHealthy,
        lessons_with_issues: weekWithIssues,
        missing_tutor:       weekMissingTutor,
        missing_student:     weekMissingStudent,
        unmatched_voice:     weekUnmatched,
        possible_substitute: weekPossibleSub,
      },
      classes: classOverviews,
    });
  } catch (e: any) {
    console.error('[attendance] overview error:', e?.message);
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// ── GET /api/admin/attendance/classes/:classId ────────────────────────────────
//
// Per-class lesson history: last 8 lessons with full attendance reconciliation.
// Returns same lesson shape as /lessons so the existing LessonCard can render them.

attendanceRouter.get('/classes/:classId', async (req, res) => {
  try {
    const classId = Number(req.params.classId);
    if (isNaN(classId)) { res.status(400).json({ detail: 'Invalid classId' }); return; }

    const cls = await db.classGroup.findUnique({
      where:   { id: classId },
      include: {
        tutor: { select: { id: true, full_name: true, discord_user_id: true } },
        enrollments: { where: { active: true }, include: { student: { select: { id: true, full_name: true, discord_user_id: true, role: true } } } },
      },
    });
    if (!cls) { res.status(404).json({ detail: 'Class not found' }); return; }

    // Tutors may only view classes they are assigned to as primary tutor
    const currentUser = (req as any).user as { id: number; role: string } | undefined;
    if (currentUser?.role === 'tutor' && cls.tutor?.id !== currentUser.id) {
      res.status(403).json({ detail: 'Access denied: not your class' });
      return;
    }

    const now    = new Date();
    const past90 = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    const lessons = await db.lesson.findMany({
      where: { class_id: classId, scheduled_at: { gte: past90, lte: now }, status: { not: 'cancelled' } },
      include: {
        class: {
          include: {
            tutor: { select: { id: true, full_name: true, discord_user_id: true } },
            enrollments: { where: { active: true }, include: { student: { select: { id: true, full_name: true, discord_user_id: true, role: true } } } },
          },
        },
        substitute_tutor: { select: { id: true, full_name: true, discord_user_id: true } },
        attendance:       { include: { student: { select: { full_name: true } } } },
      },
      orderBy: { scheduled_at: 'desc' },
      take: 8,
    });

    // Voice sessions for this class's channel in the relevant window
    const voiceWindowStart = new Date(past90.getTime() - THRESHOLDS.BUFFER_BEFORE_MS);
    const voiceWindowEnd   = new Date(now.getTime() + THRESHOLDS.BUFFER_AFTER_MS);

    const allVoiceSessions = cls.discord_channel_id
      ? await db.voiceAttendance.findMany({
          where: { joined_at: { gte: voiceWindowStart, lte: voiceWindowEnd }, discord_channel_id: cls.discord_channel_id },
          include: { user: { select: { id: true, full_name: true, role: true } } },
          orderBy: { joined_at: 'asc' },
        })
      : [];

    const sessionsByUser = new Map<number, any[]>();
    for (const s of allVoiceSessions) {
      if (s.crm_user_id) {
        if (!sessionsByUser.has(s.crm_user_id)) sessionsByUser.set(s.crm_user_id, []);
        sessionsByUser.get(s.crm_user_id)!.push(s);
      }
    }

    const lessonReports = lessons.map((l: any) =>
      reconcileLesson({ lesson: l, voiceSessionsByUser: sessionsByUser, channelSessions: allVoiceSessions }),
    );

    res.json({
      class: {
        id:                cls.id,
        name:              (cls as any).name,
        class_type:        (cls as any).class_type,
        subject:           (cls as any).subject,
        year_level:        (cls as any).year_level ?? null,
        schedule_day:      (cls as any).schedule_day,
        schedule_hour:     (cls as any).schedule_hour,
        schedule_minute:   (cls as any).schedule_minute,
        duration_min:      (cls as any).duration_min,
        timezone:          (cls as any).timezone,
        discord_channel_id: (cls as any).discord_channel_id ?? null,
        tutor:             cls.tutor ? { id: cls.tutor.id, full_name: cls.tutor.full_name } : null,
        enrolled_students: (cls.enrollments ?? []).map((e: any) => ({ id: e.student.id, full_name: e.student.full_name })),
      },
      lessons: lessonReports,
    });
  } catch (e: any) {
    console.error('[attendance] class detail error:', e?.message);
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// ── GET /api/admin/attendance/issues ──────────────────────────────────────────
//
// Aggregated issues across all active classes for the last 14 days.
// Includes lesson-level issues and unexpected participant alerts.

attendanceRouter.get('/issues', async (req, res) => {
  try {
    const currentUser = (req as any).user as { id: number; role: string } | undefined;
    const classWhere: any = { active: true };
    if (currentUser?.role === 'tutor') classWhere.tutor_id = currentUser.id;

    const now    = new Date();
    const past14 = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const classes = await db.classGroup.findMany({
      where: classWhere,
      include: {
        tutor: { select: { id: true, full_name: true, discord_user_id: true } },
        enrollments: { where: { active: true }, include: { student: { select: { id: true, full_name: true, discord_user_id: true, role: true } } } },
      },
    });

    if (classes.length === 0) {
      return res.json({ total: 0, items: [] });
    }

    const classIds = classes.map((c: any) => c.id);
    const channelIds = classes.map((c: any) => c.discord_channel_id).filter(Boolean) as string[];

    const [lessons, voiceSessions] = await Promise.all([
      db.lesson.findMany({
        where: { class_id: { in: classIds }, scheduled_at: { gte: past14, lte: now }, status: { not: 'cancelled' } },
        include: {
          class: {
            include: {
              tutor: { select: { id: true, full_name: true, discord_user_id: true } },
              enrollments: { where: { active: true }, include: { student: { select: { id: true, full_name: true, discord_user_id: true, role: true } } } },
            },
          },
          substitute_tutor: { select: { id: true, full_name: true, discord_user_id: true } },
          attendance: { include: { student: { select: { full_name: true } } } },
        },
        orderBy: { scheduled_at: 'desc' },
      }),
      channelIds.length > 0
        ? db.voiceAttendance.findMany({
            where: {
              joined_at: { gte: new Date(past14.getTime() - THRESHOLDS.BUFFER_BEFORE_MS), lte: new Date(now.getTime() + THRESHOLDS.BUFFER_AFTER_MS) },
              discord_channel_id: { in: channelIds },
            },
            include: { user: { select: { id: true, full_name: true, role: true } } },
            orderBy: { joined_at: 'asc' },
          })
        : Promise.resolve([]),
    ]);

    const sessionsByUser    = new Map<number, any[]>();
    const sessionsByChannel = new Map<string, any[]>();
    for (const s of voiceSessions) {
      if (s.crm_user_id) {
        if (!sessionsByUser.has(s.crm_user_id)) sessionsByUser.set(s.crm_user_id, []);
        sessionsByUser.get(s.crm_user_id)!.push(s);
      }
      const ch = s.discord_channel_id ?? '';
      if (ch) {
        if (!sessionsByChannel.has(ch)) sessionsByChannel.set(ch, []);
        sessionsByChannel.get(ch)!.push(s);
      }
    }

    const aggregatedIssues: any[] = [];

    for (const lesson of lessons) {
      const channelSessions = lesson.class?.discord_channel_id
        ? (sessionsByChannel.get(lesson.class.discord_channel_id) ?? [])
        : [];

      const report = reconcileLesson({ lesson, voiceSessionsByUser: sessionsByUser, channelSessions });

      for (const issue of report.issues) {
        aggregatedIssues.push({
          type:       issue.type,
          severity:   issue.severity,
          message:    issue.message,
          class_id:   lesson.class_id,
          class_name: lesson.class?.name ?? 'Unknown',
          lesson_id:  lesson.id,
          lesson_date: serializeDate(lesson.scheduled_at instanceof Date ? lesson.scheduled_at : new Date(lesson.scheduled_at)),
          user_id:    issue.user_id   ?? null,
          user_name:  issue.user_name ?? null,
        });
      }

      // admin_test_activity is informational only — excluded from the Issues list
      for (const p of report.unexpected_participants.filter((p: any) => p.type !== 'admin_test_activity')) {
        const userName = p.full_name ?? p.discord_username ?? 'unknown';
        const message =
          p.type === 'possible_substitute'
            ? `Possible substitute: ${userName} in ${lesson.class?.name ?? 'class'}`
            : p.type === 'unexpected_student'
            ? `Unexpected student: ${userName}`
            : `Unknown voice user in ${lesson.class?.name ?? 'class'} (${p.discord_username ?? p.discord_user_id})`;
        aggregatedIssues.push({
          type:       p.type,
          severity:   'warning',
          message,
          class_id:   lesson.class_id,
          class_name: lesson.class?.name ?? 'Unknown',
          lesson_id:  lesson.id,
          lesson_date: serializeDate(lesson.scheduled_at instanceof Date ? lesson.scheduled_at : new Date(lesson.scheduled_at)),
          user_id:    p.crm_user_id,
          user_name:  p.full_name,
        });
      }
    }

    // Sort: errors first, then by lesson date desc
    const SEVERITY_ORDER: Record<string, number> = { error: 0, warning: 1 };
    aggregatedIssues.sort((a, b) => {
      const sv = (SEVERITY_ORDER[a.severity] ?? 2) - (SEVERITY_ORDER[b.severity] ?? 2);
      if (sv !== 0) return sv;
      return (b.lesson_date ?? '').localeCompare(a.lesson_date ?? '');
    });

    res.json({ total: aggregatedIssues.length, items: aggregatedIssues });
  } catch (e: any) {
    console.error('[attendance] issues error:', e?.message);
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// ── POST /api/admin/attendance/generate-alerts ───────────────────────────────
//
// Scans the last 14 days of completed lessons and creates persistent Alert records
// for each attendance issue found. Uses stable dedup keys so re-running never
// creates duplicate open alerts.
//
// Alert types created:
//   attendance_tutor_absent      — dedup: lesson_id
//   attendance_student_absent    — dedup: student_user_id (one open alert per absent student)
//   attendance_possible_substitute — dedup: lesson_id
//   attendance_unmatched_voice   — dedup: lesson_id
//
// Admin-only (write operation). Tutors receive 403.

attendanceRouter.post('/generate-alerts', async (req, res) => {
  try {
    const currentUser = (req as any).user as { id: number; role: string } | undefined;
    if (currentUser?.role !== 'admin') {
      res.status(403).json({ detail: 'Admin-only action' }); return;
    }

    const now    = new Date();
    const past14 = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const classes = await db.classGroup.findMany({
      where: { active: true },
      include: {
        tutor: { select: { id: true, full_name: true, discord_user_id: true } },
        enrollments: { where: { active: true }, include: { student: { select: { id: true, full_name: true, discord_user_id: true, role: true } } } },
      },
    });

    if (classes.length === 0) { res.json({ created: 0, keys: [] }); return; }

    const classIds   = classes.map((c: any) => c.id);
    const channelIds = classes.map((c: any) => c.discord_channel_id).filter(Boolean) as string[];

    const [lessons, voiceSessions] = await Promise.all([
      db.lesson.findMany({
        where: { class_id: { in: classIds }, scheduled_at: { gte: past14, lte: now }, status: { not: 'cancelled' } },
        include: {
          class: {
            include: {
              tutor: { select: { id: true, full_name: true, discord_user_id: true } },
              enrollments: { where: { active: true }, include: { student: { select: { id: true, full_name: true, discord_user_id: true, role: true } } } },
            },
          },
          substitute_tutor: { select: { id: true, full_name: true, discord_user_id: true } },
          attendance:        { include: { student: { select: { full_name: true } } } },
        },
        orderBy: { scheduled_at: 'desc' },
      }),
      channelIds.length > 0
        ? db.voiceAttendance.findMany({
            where: {
              joined_at: { gte: new Date(past14.getTime() - THRESHOLDS.BUFFER_BEFORE_MS), lte: new Date(now.getTime() + THRESHOLDS.BUFFER_AFTER_MS) },
              discord_channel_id: { in: channelIds },
            },
            include: { user: { select: { id: true, full_name: true, role: true } } },
            orderBy: { joined_at: 'asc' },
          })
        : Promise.resolve([]) as any,
    ]);

    const sessionsByUser    = new Map<number, any[]>();
    const sessionsByChannel = new Map<string, any[]>();
    for (const s of voiceSessions) {
      if (s.crm_user_id) {
        if (!sessionsByUser.has(s.crm_user_id)) sessionsByUser.set(s.crm_user_id, []);
        sessionsByUser.get(s.crm_user_id)!.push(s);
      }
      const ch = s.discord_channel_id ?? '';
      if (ch) {
        if (!sessionsByChannel.has(ch)) sessionsByChannel.set(ch, []);
        sessionsByChannel.get(ch)!.push(s);
      }
    }

    // Dedup helper: create alert only if no open alert exists for this type+entity pair
    async function maybeCreateAttendanceAlert(data: {
      alert_type: string; severity: string; title: string; message: string;
      related_entity_type: string; related_entity_id: number;
    }): Promise<boolean> {
      const existing = await db.alert.findFirst({
        where: { alert_type: data.alert_type, related_entity_id: data.related_entity_id, status: 'open' },
      });
      if (existing) return false;
      await db.alert.create({ data: { ...data, status: 'open' } });
      return true;
    }

    const createdKeys: string[] = [];

    for (const lesson of lessons) {
      const channelSessions = lesson.class?.discord_channel_id
        ? (sessionsByChannel.get(lesson.class.discord_channel_id) ?? [])
        : [];

      const report     = reconcileLesson({ lesson, voiceSessionsByUser: sessionsByUser, channelSessions });
      const cls        = lesson.class?.name ?? 'Unknown';
      const dateStr    = new Date(lesson.scheduled_at).toLocaleDateString('en-AU', {
        timeZone: 'Australia/Sydney', day: 'numeric', month: 'short', year: 'numeric',
      });

      // ── Tutor absent ─────────────────────────────────────────────────────
      if (report.issues.some((i: any) => i.type === 'tutor_absent')) {
        const ok = await maybeCreateAttendanceAlert({
          alert_type: 'attendance_tutor_absent', severity: 'high',
          title:   `Tutor absent — ${cls}`,
          message: `Tutor was absent for ${cls} on ${dateStr}. Verify whether a substitute was arranged.`,
          related_entity_type: 'lesson', related_entity_id: lesson.id,
        });
        if (ok) createdKeys.push(`tutor_absent:lesson_${lesson.id}`);
      }

      // ── Student absent (one open alert per student — deduped by student_id) ─
      for (const issue of report.issues.filter((i: any) => i.type === 'student_absent')) {
        if (!issue.user_id) continue;
        const ok = await maybeCreateAttendanceAlert({
          alert_type: 'attendance_student_absent', severity: 'medium',
          title:   `Student absent — ${issue.user_name ?? 'Unknown'}`,
          message: `${issue.user_name ?? 'Student'} was absent for ${cls} on ${dateStr}.`,
          related_entity_type: 'student', related_entity_id: issue.user_id,
        });
        if (ok) createdKeys.push(`student_absent:user_${issue.user_id}_lesson_${lesson.id}`);
      }

      // ── Possible substitute ───────────────────────────────────────────────
      const subs = report.unexpected_participants.filter((p: any) => p.type === 'possible_substitute');
      if (subs.length > 0) {
        const subNames = subs.map((p: any) => p.full_name ?? p.discord_username ?? 'unknown').join(', ');
        const ok = await maybeCreateAttendanceAlert({
          alert_type: 'attendance_possible_substitute', severity: 'medium',
          title:   `Possible substitute — ${cls}`,
          message: `Unassigned tutor(s) detected in ${cls} on ${dateStr}: ${subNames}. Confirm whether an authorised substitute covered this lesson.`,
          related_entity_type: 'lesson', related_entity_id: lesson.id,
        });
        if (ok) createdKeys.push(`possible_substitute:lesson_${lesson.id}`);
      }

      // ── Unmatched voice (unknown_user) ────────────────────────────────────
      const unmatched = report.unexpected_participants.filter((p: any) => p.type === 'unknown_user');
      if (unmatched.length > 0) {
        const ok = await maybeCreateAttendanceAlert({
          alert_type: 'attendance_unmatched_voice', severity: 'low',
          title:   `Unmatched voice activity — ${cls}`,
          message: `Unrecognised Discord user(s) were present in the ${cls} channel on ${dateStr}. Check if their account needs to be linked in the CRM.`,
          related_entity_type: 'lesson', related_entity_id: lesson.id,
        });
        if (ok) createdKeys.push(`unmatched_voice:lesson_${lesson.id}`);
      }
    }

    res.json({ created: createdKeys.length, keys: createdKeys });
  } catch (e: any) {
    console.error('[attendance] generate-alerts error:', e?.message);
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
