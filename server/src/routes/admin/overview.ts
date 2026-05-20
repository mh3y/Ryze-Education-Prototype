import { Router } from 'express';
import { db } from '../../prisma';
import { requireAdmin } from '../../auth/middleware';

export const overviewRouter = Router();

overviewRouter.get('/overview-stats', requireAdmin, async (_req, res) => {
  const [students, parents, activeStudents, pendingInvites] = await Promise.all([
    db.student.count(),
    db.parent.count(),
    db.student.count({ where: { active: true } }),
    db.parent.count({ where: { invite_pending: true } }),
  ]);
  res.json({ students, parents, active_students: activeStudents, pending_invites: pendingInvites });
});
