import { Router } from 'express';
import { db } from '../../prisma';
import { requireAdmin } from '../../auth/middleware';

export const studentsRouter = Router();
studentsRouter.use(requireAdmin);

function studentToItem(s: any) {
  return {
    id: s.id,
    discord_user_id: s.discord_user_id ? Number(s.discord_user_id) : null,
    full_name: s.full_name,
    email: s.email ?? null,
    role: s.role,
    active: s.active,
    created_at: s.created_at instanceof Date ? s.created_at.toISOString() : s.created_at,
  };
}

// GET /api/admin/students
studentsRouter.get('/', async (req, res) => {
  const limit = Math.min(Number(req.query.limit ?? 100), 500);
  const skip = Number(req.query.skip ?? 0);
  const role = req.query.role as string | undefined;
  const where: any = {};
  if (role) where.role = role;
  const [total, items] = await Promise.all([
    db.student.count({ where }),
    db.student.findMany({ where, skip, take: limit, orderBy: { full_name: 'asc' } }),
  ]);
  res.json({ total, items: items.map(studentToItem) });
});

// POST /api/admin/students
studentsRouter.post('/', async (req, res) => {
  const { full_name, email, year_level, school, notes } = req.body as {
    full_name?: string; email?: string; year_level?: string; school?: string; notes?: string;
  };
  if (!full_name) { res.status(400).json({ detail: 'full_name is required' }); return; }
  const student = await db.student.create({
    data: { full_name: full_name.trim(), email: email?.toLowerCase().trim() ?? null, year_level: year_level ?? null, school: school ?? null, notes: notes ?? null },
  });
  res.status(201).json({ id: student.id, full_name: student.full_name });
});

// GET /api/admin/students/:id
studentsRouter.get('/:id', async (req, res) => {
  const student = await db.student.findUnique({
    where: { id: Number(req.params.id) },
    include: { parents: { include: { parent: true } }, enrollments: { where: { active: true } } },
  });
  if (!student) { res.status(404).json({ detail: 'Student not found' }); return; }
  res.json({
    ...studentToItem(student),
    year_level: student.year_level,
    school: student.school,
    notes: student.notes,
    class_count: student.enrollments.length,
    parents: student.parents.map((p: any) => ({
      link_id: p.id,
      parent_id: p.parent_id,
      parent_name: `${p.parent.first_name} ${p.parent.last_name}`,
      relationship: p.relationship,
    })),
  });
});

// PATCH /api/admin/students/:id/profile
studentsRouter.patch('/:id/profile', async (req, res) => {
  const id = Number(req.params.id);
  const { preferred_name, school, year_level, notes } = req.body as Partial<{ preferred_name: string; school: string; year_level: string; notes: string }>;
  const data: any = {};
  if (preferred_name !== undefined) data.preferred_name = preferred_name;
  if (school !== undefined) data.school = school;
  if (year_level !== undefined) data.year_level = year_level;
  if (notes !== undefined) data.notes = notes;
  await db.student.update({ where: { id }, data });
  res.json({ updated: true });
});

// PATCH /api/admin/students/:id/deactivate
studentsRouter.patch('/:id/deactivate', async (req, res) => {
  await db.student.update({ where: { id: Number(req.params.id) }, data: { active: false } });
  res.json({ updated: true });
});

// DELETE /api/admin/students/:id
studentsRouter.delete('/:id', async (req, res) => {
  try {
    await db.student.delete({ where: { id: Number(req.params.id) } });
    res.status(204).send();
  } catch { res.status(404).json({ detail: 'Student not found' }); }
});
