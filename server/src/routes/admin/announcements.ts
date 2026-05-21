import { Router } from 'express';
import { db } from '../../prisma';
import { requireAdmin } from '../../auth/middleware';

export const announcementsRouter = Router();
announcementsRouter.use(requireAdmin);

function announcementToItem(a: any) {
  return {
    id: a.id,
    title: a.title,
    body: a.body,
    created_by: a.author_id ?? 0,
    target_role: a.audience !== 'all' ? a.audience : null,
    target_class_group_id: a.class_id ?? null,
    target_program_id: null,
    pinned: a.pinned,
    discord_sent: a.discord_sent,
    email_sent: a.email_sent,
    published_at: a.published_at
      ? (a.published_at instanceof Date ? a.published_at.toISOString() : a.published_at)
      : null,
    status: a.published ? 'published' : 'draft',
    created_at: a.created_at instanceof Date ? a.created_at.toISOString() : a.created_at,
  };
}

// GET /api/admin/announcements
announcementsRouter.get('/', async (req, res) => {
  try {
    const { status } = req.query as { status?: string };
    const where: any = {};
    if (status === 'published') where.published = true;
    if (status === 'draft') where.published = false;

    const items = await db.announcement.findMany({
      where,
      orderBy: { created_at: 'desc' },
    });
    res.json({ total: items.length, items: items.map(announcementToItem) });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// POST /api/admin/announcements
announcementsRouter.post('/', async (req, res) => {
  try {
    const { title, body, author_id, audience, class_id, pinned, published } = req.body as {
      title?: string; body?: string; author_id?: number; audience?: string;
      class_id?: number; pinned?: boolean; published?: boolean;
    };
    if (!title) { res.status(400).json({ detail: 'title is required' }); return; }
    if (!body) { res.status(400).json({ detail: 'body is required' }); return; }

    const isPublished = published ?? false;
    const a = await db.announcement.create({
      data: {
        title: title.trim(),
        body,
        author_id: author_id ?? null,
        audience: (audience as any) ?? 'all',
        class_id: class_id ?? null,
        pinned: pinned ?? false,
        published: isPublished,
        published_at: isPublished ? new Date() : null,
        discord_sent: false,
        email_sent: false,
      },
    });
    res.status(201).json({ id: a.id, title: a.title });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// PATCH /api/admin/announcements/:id
announcementsRouter.patch('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const body = req.body as Partial<{
      title: string; body: string; audience: string; class_id: number;
      pinned: boolean; published: boolean; status: string;
    }>;
    const data: any = {};
    if (body.title !== undefined) data.title = body.title.trim();
    if (body.body !== undefined) data.body = body.body;
    if (body.audience !== undefined) data.audience = body.audience;
    if (body.class_id !== undefined) data.class_id = body.class_id;
    if (body.pinned !== undefined) data.pinned = body.pinned;

    // Support both published boolean and status string
    if (body.published !== undefined) {
      data.published = body.published;
      if (body.published) data.published_at = new Date();
    }
    if (body.status === 'published') {
      data.published = true;
      data.published_at = new Date();
    } else if (body.status === 'draft') {
      data.published = false;
      data.published_at = null;
    }

    await db.announcement.update({ where: { id }, data });
    res.json({ updated: true });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// DELETE /api/admin/announcements/:id
announcementsRouter.delete('/:id', async (req, res) => {
  try {
    await db.announcement.delete({ where: { id: Number(req.params.id) } });
    res.status(204).send();
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});
