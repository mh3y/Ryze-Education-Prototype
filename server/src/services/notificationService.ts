/**
 * notificationService.ts
 *
 * Generates in-app Notification records for CRM events.
 *
 * Design principles:
 *   - Idempotent: dedup check prevents re-notifying for the same entity
 *     within a configurable time window.
 *   - Role-aware: admin notifications go to all admin users; tutor/student/
 *     parent notifications go only to the directly affected principal.
 *   - Non-critical: every generator is try/catch wrapped so a single failure
 *     never blocks the others or breaks the calling request.
 *   - Extensible: each generator is exported individually so callers can
 *     trigger a specific type (e.g. on payment status change) without running
 *     the full scan.
 *
 * Trigger this via:
 *   POST /api/notifications/generate          (admin — runs generateAll)
 *   POST /api/admin/alerts/generate           (already calls generateAll at end)
 *   Cron / external scheduler                 (call generateAll on a schedule)
 */

import { Prisma } from '@prisma/client';
import { db } from '../prisma';

// ---------------------------------------------------------------------------
// Dedup windows (ms)
// ---------------------------------------------------------------------------

const DEDUP_MS = {
  overdue_payment:     7 * 24 * 3600_000,   // 7 days
  attendance_unmarked: 24       * 3600_000,   // 24 h
  lesson_reminder:     24       * 3600_000,   // 24 h (one per lesson per recipient)
  progress_missing:    7 * 24 * 3600_000,   // 7 days
  admin_alert:         7 * 24 * 3600_000,   // 7 days
} as const;

type NotifKey = keyof typeof DEDUP_MS;

// ---------------------------------------------------------------------------
// Dedup helper — raw SQL because Prisma JSON path filters are finicky
// ---------------------------------------------------------------------------

async function dedupExists(opts: {
  user_id?:   number;
  parent_id?: number;
  type:       NotifKey | string;
  entity_id:  number;
  windowMs:   number;
}): Promise<boolean> {
  const windowStart = new Date(Date.now() - opts.windowMs);

  if (opts.user_id !== undefined) {
    const rows = await db.$queryRaw<{ id: number }[]>(Prisma.sql`
      SELECT id FROM "Notification"
      WHERE  type       = ${opts.type}
      AND    user_id    = ${opts.user_id}
      AND    read       = false
      AND    created_at > ${windowStart}
      AND    (data->>'entity_id')::int = ${opts.entity_id}
      LIMIT  1
    `);
    return rows.length > 0;
  }

  if (opts.parent_id !== undefined) {
    const rows = await db.$queryRaw<{ id: number }[]>(Prisma.sql`
      SELECT id FROM "Notification"
      WHERE  type       = ${opts.type}
      AND    parent_id  = ${opts.parent_id}
      AND    read       = false
      AND    created_at > ${windowStart}
      AND    (data->>'entity_id')::int = ${opts.entity_id}
      LIMIT  1
    `);
    return rows.length > 0;
  }

  return false;
}

// ---------------------------------------------------------------------------
// Create helper
// ---------------------------------------------------------------------------

async function notify(opts: {
  user_id?:   number;
  parent_id?: number;
  type:       string;
  title:      string;
  body:       string;
  href?:      string;
  entity_id:  number;
}): Promise<void> {
  await db.notification.create({
    data: {
      user_id:   opts.user_id   ?? null,
      parent_id: opts.parent_id ?? null,
      type:      opts.type,
      title:     opts.title,
      body:      opts.body,
      data:      { entity_id: opts.entity_id, ...(opts.href ? { href: opts.href } : {}) },
      channel:   'in_app',
      sent_at:   new Date(),
    },
  });
}

// ---------------------------------------------------------------------------
// Fetch all admin user IDs (cached per call — admins don't change often)
// ---------------------------------------------------------------------------

async function getAdminUserIds(): Promise<number[]> {
  const admins = await db.user.findMany({
    where: { role: 'admin', active: true },
    select: { id: true },
  });
  return admins.map((a) => a.id);
}

// ---------------------------------------------------------------------------
// 1. Overdue payments → admins
// ---------------------------------------------------------------------------

export async function generateOverduePayments(): Promise<number> {
  let created = 0;
  try {
    const overduePayments = await db.studentPayment.findMany({
      where: { status: 'overdue' },
      include: { student: { select: { full_name: true } } },
    });

    if (overduePayments.length === 0) return 0;

    const adminIds = await getAdminUserIds();
    const windowMs = DEDUP_MS.overdue_payment;

    for (const payment of overduePayments) {
      const amountStr = `$${(payment.amount_cents / 100).toFixed(2)}`;
      const bodyText  = `${payment.student.full_name} — ${amountStr} overdue.${payment.term ? ` Term: ${payment.term}.` : ''}`;

      for (const adminId of adminIds) {
        if (await dedupExists({ user_id: adminId, type: 'overdue_payment', entity_id: payment.id, windowMs })) continue;
        await notify({
          user_id:   adminId,
          type:      'overdue_payment',
          title:     `Overdue payment — ${payment.student.full_name}`,
          body:      bodyText,
          href:      '/dashboard/admin/payments',
          entity_id: payment.id,
        });
        created++;
      }
    }
  } catch (e) {
    console.error('[notifService] generateOverduePayments error:', e);
  }
  return created;
}

// ---------------------------------------------------------------------------
// 2. Unmarked attendance on completed lessons → admins + class tutor
// ---------------------------------------------------------------------------

export async function generateUnmarkedAttendance(): Promise<number> {
  let created = 0;
  try {
    // Only look at lessons that completed in the last 7 days
    const cutoff = new Date(Date.now() - 7 * 24 * 3600_000);

    const lessons = await db.lesson.findMany({
      where: {
        status:     'completed',
        scheduled_at: { gt: cutoff },
        attendance: { some: { status: 'unknown' } },
      },
      include: {
        class:      { select: { name: true, tutor_id: true } },
        attendance: { where: { status: 'unknown' }, select: { id: true } },
      },
    });

    if (lessons.length === 0) return 0;

    const adminIds = await getAdminUserIds();
    const windowMs = DEDUP_MS.attendance_unmarked;

    for (const lesson of lessons) {
      const unknownCount = lesson.attendance.length;
      const dateStr = lesson.scheduled_at instanceof Date
        ? lesson.scheduled_at.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })
        : String(lesson.scheduled_at);
      const title = `Attendance unmarked — ${lesson.class?.name ?? 'Unknown class'}`;
      const body  = `${unknownCount} student${unknownCount === 1 ? '' : 's'} unrecorded in "${lesson.title}" on ${dateStr}.`;

      // Collect recipients: all admins + class tutor (deduplicated)
      const recipientSet = new Set<number>(adminIds);
      if (lesson.class?.tutor_id) recipientSet.add(lesson.class.tutor_id);

      for (const userId of recipientSet) {
        if (await dedupExists({ user_id: userId, type: 'attendance_unmarked', entity_id: lesson.id, windowMs })) continue;
        await notify({
          user_id:   userId,
          type:      'attendance_unmarked',
          title,
          body,
          href:      '/dashboard/admin/attendance',
          entity_id: lesson.id,
        });
        created++;
      }
    }
  } catch (e) {
    console.error('[notifService] generateUnmarkedAttendance error:', e);
  }
  return created;
}

// ---------------------------------------------------------------------------
// 3. Upcoming lessons (1–25 h ahead) → enrolled students + their parents
// ---------------------------------------------------------------------------

export async function generateUpcomingLessons(): Promise<number> {
  let created = 0;
  try {
    const now   = new Date();
    const from  = new Date(now.getTime() +  1 * 3600_000);  // 1 h from now
    const until = new Date(now.getTime() + 25 * 3600_000);  // 25 h from now

    const lessons = await db.lesson.findMany({
      where: {
        status:     'scheduled',
        scheduled_at: { gte: from, lte: until },
      },
      include: {
        class: {
          select: {
            name:        true,
            enrollments: {
              where: { active: true },
              select: {
                student_id: true,
                student: {
                  select: {
                    full_name:    true,
                    parent_links: {
                      select: { parent_id: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
      take: 50, // safety cap
    });

    const windowMs = DEDUP_MS.lesson_reminder;

    for (const lesson of lessons) {
      const timeStr = lesson.scheduled_at instanceof Date
        ? lesson.scheduled_at.toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Australia/Sydney' })
        : String(lesson.scheduled_at);
      const className = lesson.class?.name ?? 'Your class';
      const title = `Lesson tomorrow — ${className}`;
      const body  = `"${lesson.title}" starts at ${timeStr}.`;

      for (const enrol of lesson.class?.enrollments ?? []) {
        const studentId = enrol.student_id;

        // Notify student
        if (!(await dedupExists({ user_id: studentId, type: 'lesson_reminder', entity_id: lesson.id, windowMs }))) {
          await notify({
            user_id:   studentId,
            type:      'lesson_reminder',
            title,
            body,
            href:      '/dashboard/calendar',
            entity_id: lesson.id,
          });
          created++;
        }

        // Notify linked parents
        for (const link of enrol.student.parent_links) {
          const parentId = link.parent_id;
          if (!(await dedupExists({ parent_id: parentId, type: 'lesson_reminder', entity_id: lesson.id, windowMs }))) {
            await notify({
              parent_id: parentId,
              type:      'lesson_reminder',
              title:     `${enrol.student.full_name}'s lesson tomorrow`,
              body:      `${className} — "${lesson.title}" starts at ${timeStr}.`,
              href:      '/dashboard/calendar',
              entity_id: lesson.id,
            });
            created++;
          }
        }
      }
    }
  } catch (e) {
    console.error('[notifService] generateUpcomingLessons error:', e);
  }
  return created;
}

// ---------------------------------------------------------------------------
// 4. Missing tutor progress submissions → admins + class tutor
//    Trigger: class has active enrolments but no progress report in 45 days
// ---------------------------------------------------------------------------

export async function generateMissingProgressReports(): Promise<number> {
  let created = 0;
  try {
    const cutoff = new Date(Date.now() - 45 * 24 * 3600_000);

    // Active classes with at least one active enrolment
    const activeClasses = await db.classGroup.findMany({
      where: {
        active:      true,
        enrollments: { some: { active: true } },
      },
      select: {
        id:                  true,
        name:                true,
        tutor_id:            true,
        progress_reports:    { where: { created_at: { gt: cutoff } }, select: { id: true }, take: 1 },
      },
    });

    const classesWithNoRecentReport = activeClasses.filter((c) => c.progress_reports.length === 0);
    if (classesWithNoRecentReport.length === 0) return 0;

    const adminIds = await getAdminUserIds();
    const windowMs = DEDUP_MS.progress_missing;

    for (const cls of classesWithNoRecentReport) {
      const title = `No progress reports — ${cls.name}`;
      const body  = `${cls.name} has no progress reports in the last 45 days.`;

      const recipientSet = new Set<number>(adminIds);
      if (cls.tutor_id) recipientSet.add(cls.tutor_id);

      for (const userId of recipientSet) {
        if (await dedupExists({ user_id: userId, type: 'progress_missing', entity_id: cls.id, windowMs })) continue;
        await notify({
          user_id:   userId,
          type:      'progress_missing',
          title,
          body,
          href:      '/dashboard/admin/progress-reports',
          entity_id: cls.id,
        });
        created++;
      }
    }
  } catch (e) {
    console.error('[notifService] generateMissingProgressReports error:', e);
  }
  return created;
}

// ---------------------------------------------------------------------------
// 5. Admin-created alerts → all admins
//    Converts open Alert records into Notification records so they surface
//    in the per-user notification feed, not just the dedicated Alerts page.
// ---------------------------------------------------------------------------

export async function generateAdminAlerts(): Promise<number> {
  let created = 0;
  try {
    // Only pick up alerts created in the last 7 days to avoid flooding
    const cutoff  = new Date(Date.now() - 7 * 24 * 3600_000);
    const alerts  = await db.alert.findMany({
      where:   { status: 'open', created_at: { gt: cutoff } },
      orderBy: { created_at: 'desc' },
      take:    100,
    });

    if (alerts.length === 0) return 0;

    const adminIds = await getAdminUserIds();
    const windowMs = DEDUP_MS.admin_alert;

    for (const alert of alerts) {
      for (const adminId of adminIds) {
        if (await dedupExists({ user_id: adminId, type: 'admin_alert', entity_id: alert.id, windowMs })) continue;
        await notify({
          user_id:   adminId,
          type:      'admin_alert',
          title:     alert.title,
          body:      alert.message,
          href:      '/dashboard/admin/alerts',
          entity_id: alert.id,
        });
        created++;
      }
    }
  } catch (e) {
    console.error('[notifService] generateAdminAlerts error:', e);
  }
  return created;
}

// ---------------------------------------------------------------------------
// resolveNotificationsForEntity
// Mark all unread notifications of a specific type+entity as read.
// Called when the source condition is resolved so stale notifications
// don't sit unread after the underlying issue is fixed.
//
// Examples:
//   payment paid      → resolveNotificationsForEntity('overdue_payment', paymentId)
//   attendance marked → resolveNotificationsForEntity('attendance_unmarked', lessonId)
//   alert resolved    → resolveNotificationsForEntity('admin_alert', alertId)
// ---------------------------------------------------------------------------

export async function resolveNotificationsForEntity(
  type: string,
  entityId: number,
): Promise<number> {
  try {
    const result = await db.$executeRaw(Prisma.sql`
      UPDATE "Notification"
      SET    read    = true,
             read_at = NOW()
      WHERE  type      = ${type}
      AND    read      = false
      AND    (data->>'entity_id')::int = ${entityId}
    `);
    return result;
  } catch (e) {
    console.error(`[notifService] resolveNotificationsForEntity(${type}, ${entityId}) error:`, e);
    return 0;
  }
}

// ---------------------------------------------------------------------------
// generateAll — run every generator and return per-type counts
// ---------------------------------------------------------------------------

export interface GenerateResult {
  overdue_payments:      number;
  unmarked_attendance:   number;
  upcoming_lessons:      number;
  missing_reports:       number;
  admin_alerts:          number;
  total:                 number;
}

export async function generateAll(): Promise<GenerateResult> {
  const [
    overdue_payments,
    unmarked_attendance,
    upcoming_lessons,
    missing_reports,
    admin_alerts,
  ] = await Promise.all([
    generateOverduePayments(),
    generateUnmarkedAttendance(),
    generateUpcomingLessons(),
    generateMissingProgressReports(),
    generateAdminAlerts(),
  ]);

  const total = overdue_payments + unmarked_attendance + upcoming_lessons + missing_reports + admin_alerts;

  return {
    overdue_payments,
    unmarked_attendance,
    upcoming_lessons,
    missing_reports,
    admin_alerts,
    total,
  };
}
