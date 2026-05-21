import { Router } from 'express';
import { db } from '../../prisma';
import { requireAdmin } from '../../auth/middleware';

export const classesRouter = Router();
classesRouter.use(requireAdmin);

function classToItem(c: any) {
  return {
    id: c.id,
    name: c.name,
    year_level: c.year_level ?? null,
    subject: c.subject ?? null,
    active: c.active,
    created_at: c.created_at instanceof Date ? c.created_at.toISOString() : c.created_at,
    tutor: c.tutor
      ? { id: c.tutor.id, full_name: c.tutor.full_name, discord_user_id: c.tutor.discord_user_id ?? null }
      : null,
    member_count: c._count?.enrollments ?? 0,
  };
}

// GET /api/admin/classes
classesRouter.get('/', async (_req, res) => {
  try {
    const items = await db.classGroup.findMany({
      orderBy: { name: 'asc' },
      include: {
        tutor: { select: { id: true, full_name: true, discord_user_id: true } },
        _count: { select: { enrollments: true } },
      },
    });
    res.json({ total: items.length, items: items.map(classToItem) });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// GET /api/admin/classes/:id
classesRouter.get('/:id', async (req, res) => {
  try {
    const c = await db.classGroup.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        tutor: { select: { id: true, full_name: true, discord_user_id: true } },
        _count: { select: { enrollments: true } },
        enrollments: {
          include: { student: { select: { id: true, full_name: true } } },
          orderBy: { enrolled_at: 'asc' },
        },
      },
    });
    if (!c) { res.status(404).json({ detail: 'Class not found' }); return; }

    res.json({
      ...classToItem(c),
      roster: (c as any).enrollments.map((e: any) => ({
        membership_id: e.id,
        user_id: e.student_id,
        student_name: e.student.full_name,
        enrollment_status: e.active ? 'active' : 'inactive',
        start_date: e.created_at instanceof Date ? e.created_at.toISOString() : e.created_at,
        end_date: null,
      })),
    });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// POST /api/admin/classes
classesRouter.post('/', async (req, res) => {
  try {
    const { name, subject, year_level, tutor_user_id, max_students, active } = req.body as {
      name?: string; subject?: string; year_level?: string; tutor_user_id?: number;
      max_students?: number; active?: boolean;
    };
    if (!name) { res.status(400).json({ detail: 'name is required' }); return; }

    const classGroup = await db.classGroup.create({
      data: {
        name: name.trim(),
        subject: subject ?? '',
        year_level: year_level != null ? String(year_level) : null,
        tutor_id: tutor_user_id ?? null,
        max_students: max_students ?? null,
        active: active ?? true,
      },
    });
    res.status(201).json({ id: classGroup.id, name: classGroup.name });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// PATCH /api/admin/classes/:id
classesRouter.patch('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const body = req.body as Partial<{
      name: string; subject: string; year_level: string; tutor_user_id: number;
      max_students: number; active: boolean;
    }>;
    const data: any = {};
    if (body.name !== undefined) data.name = body.name.trim();
    if (body.subject !== undefined) data.subject = body.subject;
    if (body.year_level !== undefined) data.year_level = body.year_level != null ? String(body.year_level) : null;
    if (body.tutor_user_id !== undefined) data.tutor_id = body.tutor_user_id;
    if (body.max_students !== undefined) data.max_students = body.max_students;
    if (body.active !== undefined) data.active = body.active;

    await db.classGroup.update({ where: { id }, data });
    res.json({ updated: true });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// DELETE /api/admin/classes/:id — soft delete
classesRouter.delete('/:id', async (req, res) => {
  try {
    await db.classGroup.update({ where: { id: Number(req.params.id) }, data: { active: false } });
    res.json({ deleted: true });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});
