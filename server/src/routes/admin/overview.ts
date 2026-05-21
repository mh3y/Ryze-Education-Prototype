import { Router } from 'express';
import { db } from '../../prisma';
import { requireAdmin } from '../../auth/middleware';

export const overviewRouter = Router();

overviewRouter.get('/overview-stats', requireAdmin, async (_req, res) => {
  try {
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    const [totalStudents, activeClasses, todayLessons, pendingPayments, missingReports, openAlerts, recentAlerts] = await Promise.all([
      db.user.count({ where: { role: 'student', active: true } }),
      db.classGroup.count({ where: { active: true } }),
      db.lesson.findMany({
        where: { scheduled_at: { gte: todayStart, lte: todayEnd } },
        include: { class: { select: { name: true } } },
        orderBy: { scheduled_at: 'asc' },
      }),
      db.studentPayment.count({ where: { status: { in: ['pending', 'overdue'] } } }),
      db.user.count({
        where: {
          role: 'student',
          active: true,
          progress_reports: { none: { status: 'published' } },
        },
      }),
      db.alert.count({ where: { status: 'open' } }),
      db.alert.findMany({
        where: { status: 'open' },
        orderBy: { created_at: 'desc' },
        take: 5,
      }),
    ]);

    res.json({
      total_students: totalStudents,
      active_classes: activeClasses,
      today_lessons: todayLessons.length,
      open_alerts: openAlerts,
      pending_payments: pendingPayments,
      missing_reports: missingReports,
      recent_alerts: recentAlerts.map((a: any) => ({
        id: a.id,
        alert_type: a.alert_type,
        severity: a.severity,
        title: a.title,
        message: a.message,
        created_at: a.created_at instanceof Date ? a.created_at.toISOString() : a.created_at,
      })),
      today_lesson_list: todayLessons.map((l: any) => ({
        id: l.id,
        title: l.title,
        class_name: l.class?.name ?? null,
        start_time: l.scheduled_at.toISOString(),
        end_time: l.duration_min
          ? new Date(l.scheduled_at.getTime() + l.duration_min * 60000).toISOString()
          : null,
        status: l.status,
      })),
    });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});
