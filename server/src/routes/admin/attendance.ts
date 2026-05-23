import { Router } from 'express';
import { db } from '../../prisma';
import { requireAdmin } from '../../auth/middleware';
import {
  generateUnmarkedAttendance,
  resolveNotificationsForEntity,
} from '../../services/notificationService';

function notifyAsync(fn: () => Promise<unknown>): void {
  fn().catch((e) => console.error('[attendance] notification side-effect error:', e));
}

export const attendanceRouter = Router();
attendanceRouter.use(requireAdmin);

function attendanceToRecord(a: any) {
  return {
    id: a.id,
    lesson_id: a.lesson_id,
    lesson_title: a.lesson?.title ?? null,
    user_id: a.student_id,
    student_name: a.student?.full_name ?? null,
    status: a.status,
    tutor_marked_status: a.status,
    discord_verification_status: 'not_verified',
    discord_verified_minutes: null,
    joined_at: null,
    left_at: null,
    duration_minutes: null,
    has_mismatch: false,
    notes: a.notes ?? null,
  };
}

// GET /api/admin/attendance
attendanceRouter.get('/', async (req, res) => {
  try {
    const { lesson_id, user_id } = req.query as { lesson_id?: string; user_id?: string };
    const where: any = {};
    if (lesson_id) where.lesson_id = Number(lesson_id);
    if (user_id) where.student_id = Number(user_id);

    const items = await db.attendance.findMany({
      where,
      include: {
        lesson: { select: { title: true } },
        student: { select: { full_name: true } },
      },
      orderBy: { lesson_id: 'desc' },
    });
    res.json({ total: items.length, items: items.map(attendanceToRecord) });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// POST /api/admin/attendance/:lessonId/:userId/mark
attendanceRouter.post('/:lessonId/:userId/mark', async (req, res) => {
  try {
    const lesson_id = Number(req.params.lessonId);
    const student_id = Number(req.params.userId);
    const { status, notes } = req.body as { status?: string; notes?: string };
    if (!status) { res.status(400).json({ detail: 'status is required' }); return; }

    const record = await db.attendance.upsert({
      where: { lesson_id_student_id: { lesson_id, student_id } },
      create: { lesson_id, student_id, status: status as any, notes: notes ?? null },
      update: { status: status as any, notes: notes ?? null },
    });

    // Post-mutation notification side-effects (fire-and-forget)
    notifyAsync(async () => {
      // Check if this lesson still has any unknown attendance records
      const unknownCount = await db.attendance.count({
        where: { lesson_id, status: 'unknown' },
      });
      if (unknownCount === 0) {
        // Lesson fully marked — resolve any outstanding attendance notifications
        await resolveNotificationsForEntity('attendance_unmarked', lesson_id);
      } else {
        // Still has unknown records — refresh notifications (dedup prevents spam)
        await generateUnmarkedAttendance();
      }
    });

    res.json({ id: record.id, status: record.status });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});
