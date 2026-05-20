import { Router } from 'express';
import { db } from '../prisma';

export const healthRouter = Router();

healthRouter.get('/health', async (_req, res) => {
  try {
    await db.$queryRaw`SELECT 1`;
    const [studentCount, classCount, upcomingLessons] = await Promise.all([
      db.user.count({ where: { role: 'student', active: true } }),
      db.classGroup.count({ where: { active: true } }),
      db.lesson.count({ where: { scheduled_at: { gt: new Date() }, status: { not: 'cancelled' } } }),
    ]);
    res.json({
      status: 'ok',
      db_ok: true,
      student_count: studentCount,
      class_count: classCount,
      upcoming_lessons: upcomingLessons,
      timestamp: new Date().toISOString(),
    });
  } catch {
    res.status(503).json({
      status: 'error',
      db_ok: false,
      student_count: 0,
      class_count: 0,
      upcoming_lessons: 0,
      timestamp: new Date().toISOString(),
    });
  }
});
