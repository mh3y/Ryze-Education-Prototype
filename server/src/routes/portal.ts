import { Router } from 'express';
import { db } from '../prisma';
import { requireAuth } from '../auth/middleware';

export const portalRouter = Router();

// GET /api/students  — used by portalApi.getStudents() in the frontend
portalRouter.get('/students', requireAuth, async (req, res) => {
  const limit = Math.min(Number(req.query.limit ?? 100), 500);
  const skip = Number(req.query.skip ?? 0);
  const role = req.query.role as string | undefined;
  const where: any = {};
  if (role) where.role = role;
  const [total, items] = await Promise.all([
    db.student.count({ where }),
    db.student.findMany({ where, skip, take: limit, orderBy: { full_name: 'asc' } }),
  ]);
  res.json({
    total,
    items: items.map((s) => ({
      id: s.id,
      discord_user_id: s.discord_user_id ? Number(s.discord_user_id) : null,
      full_name: s.full_name,
      email: s.email ?? null,
      role: s.role,
      active: s.active,
      created_at: s.created_at instanceof Date ? s.created_at.toISOString() : s.created_at,
    })),
  });
});

// GET /api/classes — used by portalApi.getClasses()
portalRouter.get('/classes', requireAuth, async (_req, res) => {
  const classes = await db.classGroup.findMany({ where: { active: true }, orderBy: { name: 'asc' } });
  res.json({ items: classes.map((c) => ({ id: c.id, name: c.name, subject: c.subject, tutor_name: c.tutor_name })) });
});
