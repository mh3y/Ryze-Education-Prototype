import { Router } from 'express';
import { db } from '../../prisma';
import { requireAdminOnly } from '../../auth/middleware';
import { sydneyDayBounds } from '../../utils/timezone';

export const overviewRouter = Router();

// ── Helpers ──────────────────────────────────────────────────────────────────
// sydneyDayBounds() is imported from utils/timezone.ts.
// The former inline implementation hardcoded +10:00 (AEST only) when
// constructing the midnight UTC timestamp; the import correctly handles
// both AEST (+10:00) and AEDT (+11:00, Oct–Apr).

function syncInfo(log: any) {
  if (!log) return null;
  return {
    status: log.status as string,
    at: (log.completed_at ?? log.started_at).toISOString() as string,
    error: (log.error_message ?? null) as string | null,
    created: log.records_created as number,
    updated: log.records_updated as number,
  };
}

// ── Legacy /overview-stats (kept for backward compat) ────────────────────────

overviewRouter.get('/overview-stats', requireAdminOnly, async (_req, res) => {
  try {
    // sydneyDayBounds() gives correct UTC boundaries for the Sydney calendar day,
    // handling both AEST (+10) and AEDT (+11). The former setHours(0,0,0,0) used
    // server-local (UTC) midnight which was 10–11 hours wrong on Render (Oregon).
    const { start: todayStart, end: todayEnd } = sydneyDayBounds();

    const [totalStudents, activeClasses, todayLessons, pendingPayments,
           missingReports, openAlerts, recentAlerts] = await Promise.all([
      db.user.count({ where: { role: 'student', active: true } }),
      db.classGroup.count({ where: { active: true } }),
      db.lesson.findMany({
        where: { scheduled_at: { gte: todayStart, lte: todayEnd } },
        include: { class: { select: { name: true } } },
        orderBy: { scheduled_at: 'asc' },
      }),
      db.studentPayment.count({ where: { status: { in: ['pending', 'overdue'] } } }),
      db.user.count({
        where: { role: 'student', active: true, progress_reports: { none: { status: 'published' } } },
      }),
      db.alert.count({ where: { status: 'open' } }),
      db.alert.findMany({ where: { status: 'open' }, orderBy: { created_at: 'desc' }, take: 5 }),
    ]);

    res.json({
      total_students: totalStudents,
      active_classes: activeClasses,
      today_lessons: todayLessons.length,
      open_alerts: openAlerts,
      pending_payments: pendingPayments,
      missing_reports: missingReports,
      recent_alerts: recentAlerts.map((a: any) => ({
        id: a.id, alert_type: a.alert_type, severity: a.severity,
        title: a.title, message: a.message,
        created_at: a.created_at instanceof Date ? a.created_at.toISOString() : a.created_at,
      })),
      today_lesson_list: todayLessons.map((l: any) => ({
        id: l.id, title: l.title, class_name: l.class?.name ?? null,
        start_time: l.scheduled_at.toISOString(),
        end_time: l.duration_min ? new Date(l.scheduled_at.getTime() + l.duration_min * 60000).toISOString() : null,
        status: l.status,
      })),
    });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// ── Comprehensive overview ────────────────────────────────────────────────────

overviewRouter.get('/overview', requireAdminOnly, async (_req, res) => {
  try {
    const now = new Date();
    const { start: todayStart, end: todayEnd } = sydneyDayBounds(0);
    const { start: tomorrow }                  = sydneyDayBounds(1);
    const { end:   in7DaysEnd }                = sydneyDayBounds(7);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const startOfMonth  = new Date(now.getFullYear(), now.getMonth(), 1);

    // ── All queries in parallel ───────────────────────────────────────────────
    const [
      activeStudents, activeTutors, activeClasses,
      totalParents, pendingInviteParents, activeParents,
      studentsByYearRaw, newStudents30Days,

      overduePaymentsRaw, outstandingPaymentsRaw,
      paidThisMonthAgg, paidAllTimeAgg,
      unpaidTutorPaymentsRaw,

      todayLessonsRaw, upcomingLessonsRaw,
      openAlertsRaw,

      recentAbsencesRaw,
      classesWithCapacity,
      classesWithoutTutor,
      completedNoAttendance,

      lastMemberSyncRaw, lastCalendarSyncRaw,
      lastLessonSyncRaw, lastAttendanceSyncRaw,
      pendingBotJobs, failedBotJobs,
      lastFailedJob,

      recentActivityRaw,
      unreadMessages,
      calendarHealthLogsRaw,
    ] = await Promise.all([

      // ── Summary counts ──────────────────────────────────────────────────────
      db.user.count({ where: { role: 'student', active: true } }),
      db.user.count({ where: { role: 'tutor',   active: true } }),
      db.classGroup.count({ where: { active: true } }),

      db.parent.count(),
      db.parent.count({ where: { invite_pending: true, has_set_password: false } }),
      db.parent.count({ where: { has_set_password: true, active: true } }),

      db.studentProfile.groupBy({
        by: ['year_level'],
        where: { year_level: { not: null } },
        _count: { id: true },
      }),
      db.user.count({
        where: { role: 'student', active: true, created_at: { gte: thirtyDaysAgo } },
      }),

      // ── Financials: student payments ────────────────────────────────────────
      db.studentPayment.findMany({
        where: { status: 'overdue' },
        include: { student: { select: { id: true, full_name: true } } },
        orderBy: { due_date: 'asc' },
        take: 10,
      }),
      db.studentPayment.findMany({
        where: { status: { in: ['pending', 'partial', 'overdue'] } },
        select: { amount_cents: true, amount_paid_cents: true },
      }),
      db.studentPayment.aggregate({
        where: { paid_at: { gte: startOfMonth }, amount_paid_cents: { gt: 0 } },
        _sum: { amount_paid_cents: true },
      }),
      db.studentPayment.aggregate({
        where: { amount_paid_cents: { gt: 0 } },
        _sum: { amount_paid_cents: true },
      }),

      // ── Financials: tutor payments ──────────────────────────────────────────
      db.tutorPayment.findMany({
        where: { status: 'pending' },
        include: { tutor: { include: { user: { select: { id: true, full_name: true } } } } },
        orderBy: { created_at: 'asc' },
        take: 10,
      }),

      // ── Schedule ────────────────────────────────────────────────────────────
      db.lesson.findMany({
        where: { scheduled_at: { gte: todayStart, lte: todayEnd } },
        include: {
          class: {
            include: {
              tutor: { select: { id: true, full_name: true } },
              enrollments: { where: { active: true }, select: { id: true } },
            },
          },
        },
        orderBy: { scheduled_at: 'asc' },
      }),
      db.lesson.findMany({
        where: { scheduled_at: { gte: tomorrow, lte: in7DaysEnd } },
        include: {
          class: {
            include: { tutor: { select: { id: true, full_name: true } } },
          },
        },
        orderBy: { scheduled_at: 'asc' },
        take: 30,
      }),

      // ── Alerts ──────────────────────────────────────────────────────────────
      db.alert.findMany({
        where: { status: 'open' },
        orderBy: [{ severity: 'desc' }, { created_at: 'desc' }],
        take: 10,
      }),

      // ── Risk: student absences ──────────────────────────────────────────────
      db.attendance.findMany({
        where: {
          status: 'absent',
          lesson: { scheduled_at: { gte: thirtyDaysAgo } },
        },
        include: { student: { select: { id: true, full_name: true } } },
      }),

      // ── Risk: classes at capacity ───────────────────────────────────────────
      db.classGroup.findMany({
        where: { active: true, max_students: { not: null } },
        include: { enrollments: { where: { active: true }, select: { id: true } } },
      }),

      // ── Risk: classes without tutor ─────────────────────────────────────────
      db.classGroup.findMany({
        where: { active: true, tutor_id: null },
        select: { id: true, name: true },
      }),

      // ── Risk: completed lessons with no attendance marked ───────────────────
      db.lesson.findMany({
        where: {
          status: 'completed',
          scheduled_at: { gte: thirtyDaysAgo },
          attendance: { none: {} },
        },
        include: { class: { select: { id: true, name: true } } },
        orderBy: { scheduled_at: 'desc' },
        take: 5,
      }),

      // ── Automation: bot sync logs ───────────────────────────────────────────
      db.botSyncLog.findFirst({ where: { sync_type: 'members'    }, orderBy: { created_at: 'desc' } }),
      db.botSyncLog.findFirst({ where: { sync_type: 'classes'    }, orderBy: { created_at: 'desc' } }),
      db.botSyncLog.findFirst({ where: { sync_type: 'lessons'    }, orderBy: { created_at: 'desc' } }),
      db.botSyncLog.findFirst({ where: { sync_type: 'attendance' }, orderBy: { created_at: 'desc' } }),
      db.botJob.count({ where: { status: 'pending'    } }),
      db.botJob.count({ where: { status: 'failed'     } }),
      db.botJob.findFirst({ where: { status: 'failed' }, orderBy: { updated_at: 'desc' } }),

      // ── Recent activity ─────────────────────────────────────────────────────
      db.auditLog.findMany({
        orderBy: { created_at: 'desc' },
        take: 15,
      }),

      // ── Unread parent messages ──────────────────────────────────────────────
      db.message.count({ where: { sender_type: 'parent', read: false } }),

      // ── Calendar health (last 5 lessons syncs) ──────────────────────────────
      db.botSyncLog.findMany({
        where:   { sync_type: 'lessons' },
        orderBy: { created_at: 'desc' },
        take:    5,
        select:  { status: true, error_message: true, completed_at: true, started_at: true },
      }),
    ]);

    // ── Process financials ────────────────────────────────────────────────────

    const parentOutstanding = outstandingPaymentsRaw.reduce(
      (s, p) => s + Math.max(0, p.amount_cents - p.amount_paid_cents), 0,
    );
    const parentOverdue = overduePaymentsRaw.reduce(
      (s, p) => s + Math.max(0, p.amount_cents - p.amount_paid_cents), 0,
    );

    const topOverduePayments = [...overduePaymentsRaw]
      .sort((a, b) => (b.amount_cents - b.amount_paid_cents) - (a.amount_cents - a.amount_paid_cents))
      .slice(0, 3)
      .map((p: any) => ({
        id: p.id,
        studentId: p.student_id,
        studentName: p.student.full_name,
        amountOwed: p.amount_cents - p.amount_paid_cents,
        dueDate: p.due_date?.toISOString() ?? null,
        description: p.description,
      }));

    const tutorPaymentsOwed = unpaidTutorPaymentsRaw.reduce((s: number, p: any) => s + p.amount_cents, 0);
    const topTutorPayments  = unpaidTutorPaymentsRaw.slice(0, 3).map((p: any) => ({
      id: p.id,
      tutorId: p.tutor.user_id,
      tutorName: p.tutor.user.full_name,
      amountOwed: p.amount_cents,
      period: p.period ?? null,
      description: p.description,
    }));

    // ── Process student year distribution ─────────────────────────────────────

    const studentsByYear: Record<string, number> = {};
    for (const row of studentsByYearRaw) {
      if (row.year_level) studentsByYear[row.year_level] = row._count.id;
    }

    // ── Process schedule ─────────────────────────────────────────────────────

    const mapLesson = (l: any, includeEnrolled = false) => ({
      id: l.id,
      title: l.title,
      className: l.class.name,
      classId: l.class_id,
      tutorName: l.class.tutor?.full_name ?? null,
      enrolledCount: includeEnrolled ? (l.class.enrollments?.length ?? null) : null,
      scheduledAt: l.scheduled_at.toISOString(),
      endAt: new Date(l.scheduled_at.getTime() + l.duration_min * 60_000).toISOString(),
      durationMin: l.duration_min,
      status: l.status,
      meetLink: l.meet_link ?? null,
    });

    // ── Process risk items ────────────────────────────────────────────────────

    // Student: 2+ absences in last 30 days
    const absenceMap: Record<number, { studentId: number; name: string; count: number }> = {};
    for (const a of recentAbsencesRaw as any[]) {
      if (!absenceMap[a.student_id]) {
        absenceMap[a.student_id] = { studentId: a.student_id, name: a.student.full_name, count: 0 };
      }
      absenceMap[a.student_id].count++;
    }
    const attendanceRiskStudents = Object.values(absenceMap)
      .filter(s => s.count >= 2)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map(s => ({
        type: 'attendance',
        severity: s.count >= 3 ? 'high' : 'medium',
        title: `${s.name} missed ${s.count} lesson${s.count > 1 ? 's' : ''} in the last 30 days`,
        entityType: 'student',
        entityId: s.studentId,
        action: `/dashboard/admin/students/${s.studentId}`,
      }));

    // Student: overdue payments
    const paymentRiskStudents = overduePaymentsRaw.slice(0, 2).map((p: any) => ({
      type: 'payment',
      severity: 'high',
      title: `${p.student.full_name} has an overdue payment ($${((p.amount_cents - p.amount_paid_cents) / 100).toFixed(2)})`,
      entityType: 'student',
      entityId: p.student_id,
      action: `/dashboard/admin/payments`,
    }));

    // Class: at/over capacity
    const capacityRisk = (classesWithCapacity as any[])
      .filter(c => c.max_students !== null && c.enrollments.length >= c.max_students)
      .slice(0, 2)
      .map(c => ({
        type: 'capacity',
        severity: 'medium',
        title: `${c.name} is at capacity (${c.enrollments.length}/${c.max_students} students)`,
        entityType: 'class',
        entityId: c.id,
        action: `/dashboard/admin/classes/${c.id}`,
      }));

    // Class: no tutor
    const noTutorRisk = (classesWithoutTutor as any[]).slice(0, 2).map(c => ({
      type: 'no_tutor',
      severity: 'high',
      title: `${c.name} has no assigned tutor`,
      entityType: 'class',
      entityId: c.id,
      action: `/dashboard/admin/classes/${c.id}`,
    }));

    // Tutor: completed lessons with no attendance
    const attendanceRiskLessons = (completedNoAttendance as any[]).map(l => ({
      type: 'missing_attendance',
      severity: 'medium',
      title: `${l.class.name} — attendance not marked for lesson on ${new Date(l.scheduled_at).toLocaleDateString('en-AU')}`,
      entityType: 'lesson',
      entityId: l.id,
      action: `/dashboard/admin/lessons/${l.id}`,
    }));

    // ── Process recent activity ───────────────────────────────────────────────

    const recentActivity = (recentActivityRaw as any[]).map(a => ({
      id: a.id,
      action: a.action,
      entityType: a.entity_type,
      entityName: a.entity_name ?? null,
      actorName: a.actor_name ?? null,
      actorType: a.actor_type,
      createdAt: a.created_at.toISOString(),
    }));

    // ── Calendar health (lightweight version for overview) ───────────────────

    const calLogs = calendarHealthLogsRaw as any[];
    let calConsecFails = 0;
    for (const l of calLogs) {
      if (l.status === 'failed') calConsecFails++;
      else break;
    }
    const calSuccessLog = calLogs.find((l: any) => l.status !== 'failed') ?? null;
    const calFailLog    = calLogs.find((l: any) => l.status === 'failed') ?? null;
    const calLastErr    = calFailLog?.error_message ?? null;
    const calIsToken    = calLastErr
      ? /invalid_grant|token.*(expired|revoked)|RefreshError|reauth/i.test(calLastErr)
      : false;
    const calSuccessAt  = calSuccessLog
      ? ((calSuccessLog.completed_at ?? calSuccessLog.started_at) as Date).toISOString()
      : null;
    const calFailAt     = calFailLog
      ? ((calFailLog.completed_at ?? calFailLog.started_at) as Date).toISOString()
      : null;
    const calStale = !calSuccessAt
      || (Date.now() - new Date(calSuccessAt).getTime()) > 24 * 3_600_000;
    const calStatus: 'ok' | 'warning' | 'error' =
      calLogs.length === 0               ? 'warning' :
      calIsToken                         ? 'error'   :
      calConsecFails >= 3 && calStale    ? 'error'   :
      calConsecFails > 0                 ? 'warning' :
      'ok';

    const calendarHealth = calLogs.length === 0 ? null : {
      status:               calStatus,
      consecutive_failures: calConsecFails,
      last_success_at:      calSuccessAt,
      last_failure_at:      calFailAt,
      last_error:           calLastErr,
      is_token_error:       calIsToken,
      stale:                calStale,
    };

    // ── Build response ────────────────────────────────────────────────────────

    res.json({
      summary: {
        activeStudents,
        activeTutors,
        activeClasses,
        parentAccounts: {
          total: totalParents,
          pendingInvite: pendingInviteParents,
          active: activeParents,
        },
        studentsByYear,
        newStudentsLast30Days: newStudents30Days,
        unreadMessages,
      },

      financials: {
        parentOutstanding,
        parentOverdue,
        countOverdue: overduePaymentsRaw.length,
        oldestOverdueDate: (overduePaymentsRaw[0] as any)?.due_date?.toISOString() ?? null,
        topOverduePayments,
        revenueThisMonth: paidThisMonthAgg._sum.amount_paid_cents ?? 0,
        revenueAllTime:   paidAllTimeAgg._sum.amount_paid_cents   ?? 0,
        tutorPaymentsOwed,
        countTutorPaymentsPending: unpaidTutorPaymentsRaw.length,
        topTutorPayments,
      },

      schedule: {
        today:    todayLessonsRaw.map((l: any)    => mapLesson(l, true)),
        upcoming: upcomingLessonsRaw.map((l: any) => mapLesson(l, false)),
      },

      actions: {
        priorityAlerts: (openAlertsRaw as any[]).map(a => ({
          id: a.id,
          alertType:   a.alert_type,
          severity:    a.severity,
          title:       a.title,
          message:     a.message,
          relatedType: a.related_entity_type ?? null,
          relatedId:   a.related_entity_id   ?? null,
          createdAt:   a.created_at.toISOString(),
        })),
      },

      risk: {
        students: [...attendanceRiskStudents, ...paymentRiskStudents].slice(0, 5),
        classes:  [...noTutorRisk, ...capacityRisk].slice(0, 5),
        tutors:   attendanceRiskLessons.slice(0, 3),
      },

      automation: {
        lastMemberSync:     syncInfo(lastMemberSyncRaw),
        lastCalendarSync:   syncInfo(lastCalendarSyncRaw),
        lastLessonSync:     syncInfo(lastLessonSyncRaw),
        lastAttendanceSync: syncInfo(lastAttendanceSyncRaw),
        pendingBotJobs,
        failedBotJobs,
        lastError:      (lastFailedJob as any)?.error ?? null,
        calendarHealth,
      },

      recentActivity,
    });

  } catch (e: any) {
    console.error('[overview] Error:', e);
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});
