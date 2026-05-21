import { Router } from 'express';
import { db } from '../../prisma';
import { requireAdmin, requireAdminOnly } from '../../auth/middleware';

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
    class_count: s._count?.enrollments ?? 0,
  };
}

// GET /api/admin/students
studentsRouter.get('/', async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit ?? 100), 500);
    const skip = Number(req.query.skip ?? 0);
    const role = req.query.role as string | undefined;
    const where: any = { role: (role as any) ?? 'student' };

    const [total, items] = await Promise.all([
      db.user.count({ where }),
      db.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { full_name: 'asc' },
        include: { _count: { select: { enrollments: true } } },
      }),
    ]);
    res.json({ total, items: items.map(studentToItem) });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// POST /api/admin/students — admin only
studentsRouter.post('/', requireAdminOnly, async (req, res) => {
  try {
    const { full_name, email, year_level, school, notes } = req.body as {
      full_name?: string; email?: string; year_level?: string; school?: string; notes?: string;
    };
    if (!full_name) { res.status(400).json({ detail: 'full_name is required' }); return; }

    const profileData: any = {};
    if (year_level !== undefined) profileData.year_level = String(year_level);
    if (school !== undefined) profileData.school = school;
    if (notes !== undefined) profileData.notes = notes;
    const hasProfile = Object.keys(profileData).length > 0;

    const user = await db.user.create({
      data: {
        full_name: full_name.trim(),
        email: email?.toLowerCase().trim() ?? null,
        role: 'student',
        ...(hasProfile ? { student_profile: { create: profileData } } : {}),
      },
    });
    res.status(201).json({ id: user.id, full_name: user.full_name });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// GET /api/admin/students/:id
studentsRouter.get('/:id', async (req, res) => {
  try {
    const user = await db.user.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        student_profile: true,
        parent_links: { include: { parent: true } },
        enrollments: {
          where: { active: true },
          include: { class: { select: { id: true, name: true } } },
        },
      },
    });
    if (!user) { res.status(404).json({ detail: 'Student not found' }); return; }

    res.json({
      ...studentToItem(user),
      profile: user.student_profile
        ? {
            year_level: user.student_profile.year_level ?? null,
            school: user.student_profile.school ?? null,
            notes: user.student_profile.notes ?? null,
          }
        : null,
      class_count: user.enrollments.length,
      classes: user.enrollments.map((e: any) => ({
        class_id: e.class_id,
        class_name: e.class.name,
      })),
      parents: user.parent_links.map((p: any) => ({
        link_id: p.id,
        parent_id: p.parent_id,
        parent_name: `${p.parent.first_name} ${p.parent.last_name}`,
        relationship: p.relationship,
      })),
    });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// PATCH /api/admin/students/:id/profile
studentsRouter.patch('/:id/profile', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { preferred_name, school, year_level, notes } = req.body as Partial<{
      preferred_name: string; school: string; year_level: string; notes: string;
    }>;
    const profileData: any = {};
    if (school !== undefined) profileData.school = school;
    if (year_level !== undefined) profileData.year_level = String(year_level);
    if (notes !== undefined) profileData.notes = notes;

    // preferred_name lives on the User model
    if (preferred_name !== undefined) {
      await db.user.update({ where: { id }, data: { preferred_name } });
    }

    if (Object.keys(profileData).length > 0) {
      await db.studentProfile.upsert({
        where: { user_id: id },
        create: { user_id: id, ...profileData },
        update: { ...profileData },
      });
    }

    res.json({ updated: true });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// PATCH /api/admin/students/:id/deactivate
studentsRouter.patch('/:id/deactivate', async (req, res) => {
  try {
    await db.user.update({ where: { id: Number(req.params.id) }, data: { active: false } });
    res.json({ updated: true });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// DELETE /api/admin/students/:id — admin only
studentsRouter.delete('/:id', requireAdminOnly, async (req, res) => {
  try {
    await db.user.delete({ where: { id: Number(req.params.id) } });
    res.status(204).send();
  } catch {
    res.status(404).json({ detail: 'Student not found' });
  }
});

// POST /api/admin/students/:id/enroll
studentsRouter.post('/:id/enroll', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { class_group_id } = req.body as { class_group_id?: number };
    if (!class_group_id) { res.status(400).json({ detail: 'class_group_id is required' }); return; }

    const enrollment = await db.classEnrollment.create({
      data: { student_id: id, class_id: class_group_id },
    });
    res.status(201).json({ enrollment_id: enrollment.id });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// PATCH /api/admin/students/:id/enrollment/:classId
studentsRouter.patch('/:id/enrollment/:classId', async (req, res) => {
  try {
    const student_id = Number(req.params.id);
    const class_id = Number(req.params.classId);
    const { enrollment_status } = req.body as { enrollment_status?: string };

    await db.classEnrollment.update({
      where: { student_id_class_id: { student_id, class_id } },
      data: { active: enrollment_status !== 'inactive' },
    });
    res.json({ updated: true });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});
