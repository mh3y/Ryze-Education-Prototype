/**
 * Tutors router — /api/admin/tutors
 *
 * Endpoints
 *   GET    /tutors               list all tutors
 *   POST   /tutors               create a new tutor
 *   GET    /tutors/:id           tutor detail (with profile + classes)
 *   PATCH  /tutors/:id/profile   update tutor profile
 *   PATCH  /tutors/:id/deactivate
 *   DELETE /tutors/:id
 */

import { Router } from 'express';
import { db } from '../../prisma';
import { requireAdminOnly } from '../../auth/middleware';

export const tutorsRouter = Router();
tutorsRouter.use(requireAdminOnly);

// ---------------------------------------------------------------------------
// Serialiser
// ---------------------------------------------------------------------------

function tutorToItem(t: any) {
  return {
    id: t.id,
    display_id: t.display_id ?? null,
    discord_user_id: t.discord_user_id ? Number(t.discord_user_id) : null,
    full_name: t.full_name,
    email: t.email ?? null,
    role: t.role,
    active: t.active,
    created_at: t.created_at instanceof Date ? t.created_at.toISOString() : t.created_at,
    class_count: t._count?.taught_classes ?? 0,
    subjects: t.tutor_profile?.subjects ?? null,
    hourly_rate: t.tutor_profile?.hourly_rate ?? null,
    bio: t.tutor_profile?.bio ?? null,
  };
}

// ---------------------------------------------------------------------------
// GET /tutors
// ---------------------------------------------------------------------------

tutorsRouter.get('/', async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit ?? 200), 500);
    const skip  = Number(req.query.skip ?? 0);

    const [total, items] = await Promise.all([
      db.user.count({ where: { role: 'tutor' } }),
      db.user.findMany({
        where: { role: 'tutor' },
        skip,
        take: limit,
        orderBy: { full_name: 'asc' },
        include: {
          tutor_profile: true,
          _count: { select: { taught_classes: true } },
        },
      }),
    ]);

    res.json({ total, items: items.map(tutorToItem) });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// ---------------------------------------------------------------------------
// POST /tutors
// ---------------------------------------------------------------------------

tutorsRouter.post('/', async (req, res) => {
  try {
    const { full_name, email, bio, subjects, hourly_rate } = req.body as {
      full_name?: string;
      email?: string;
      bio?: string;
      subjects?: string;
      hourly_rate?: number;
    };
    if (!full_name) { res.status(400).json({ detail: 'full_name is required' }); return; }

    const profileData: any = {};
    if (bio        !== undefined) profileData.bio        = bio;
    if (subjects   !== undefined) profileData.subjects   = subjects;
    if (hourly_rate !== undefined) profileData.hourly_rate = hourly_rate;
    const hasProfile = Object.keys(profileData).length > 0;

    const user = await db.user.create({
      data: {
        full_name: full_name.trim(),
        email: email?.toLowerCase().trim() ?? null,
        role: 'tutor',
        ...(hasProfile ? { tutor_profile: { create: profileData } } : {}),
      },
    });
    res.status(201).json({ id: user.id, full_name: user.full_name });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// ---------------------------------------------------------------------------
// GET /tutors/:id
// ---------------------------------------------------------------------------

tutorsRouter.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const user = await db.user.findUnique({
      where: { id },
      include: {
        tutor_profile: true,
        taught_classes: {
          where: { active: true },
          select: { id: true, name: true, subject: true },
        },
      },
    });
    if (!user || user.role !== 'tutor') {
      res.status(404).json({ detail: 'Tutor not found' });
      return;
    }

    res.json({
      ...tutorToItem(user),
      classes: user.taught_classes.map((c: any) => ({
        class_id: c.id,
        class_name: c.name,
        subject: c.subject ?? null,
      })),
    });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// ---------------------------------------------------------------------------
// PATCH /tutors/:id/profile
// ---------------------------------------------------------------------------

tutorsRouter.patch('/:id/profile', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { bio, subjects, hourly_rate, preferred_name } = req.body as Partial<{
      bio: string;
      subjects: string;
      hourly_rate: number;
      preferred_name: string;
    }>;

    if (preferred_name !== undefined) {
      await db.user.update({ where: { id }, data: { preferred_name } });
    }

    const profileData: any = {};
    if (bio         !== undefined) profileData.bio         = bio;
    if (subjects    !== undefined) profileData.subjects    = subjects;
    if (hourly_rate !== undefined) profileData.hourly_rate = hourly_rate;

    if (Object.keys(profileData).length > 0) {
      await db.tutorProfile.upsert({
        where:  { user_id: id },
        create: { user_id: id, ...profileData },
        update: { ...profileData },
      });
    }

    res.json({ updated: true });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// ---------------------------------------------------------------------------
// PATCH /tutors/:id/deactivate
// ---------------------------------------------------------------------------

tutorsRouter.patch('/:id/deactivate', async (req, res) => {
  try {
    await db.user.update({ where: { id: Number(req.params.id) }, data: { active: false } });
    res.json({ updated: true });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// ---------------------------------------------------------------------------
// DELETE /tutors/:id
// ---------------------------------------------------------------------------

tutorsRouter.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const user = await db.user.findUnique({ where: { id } });
    if (!user || user.role !== 'tutor') {
      res.status(404).json({ detail: 'Tutor not found' });
      return;
    }
    await db.user.delete({ where: { id } });
    res.status(204).send();
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});
