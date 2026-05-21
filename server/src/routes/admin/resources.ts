import { Router } from 'express';
import { db } from '../../prisma';
import { requireAdmin } from '../../auth/middleware';

export const resourcesRouter = Router();
resourcesRouter.use(requireAdmin);

function resourceToItem(r: any) {
  return {
    id: r.id,
    title: r.title,
    description: r.description ?? null,
    resource_url: r.file_url ?? r.external_url ?? '',
    resource_type: r.resource_type,
    audience: r.audience,
    class_group_id: r.class_id ?? null,
    lesson_id: r.lesson_id ?? null,
    program_id: null,
    student_user_id: null,
    created_by: r.created_by ?? 0,
    active: true,
    file_size: r.file_size ?? null,
    file_type: r.file_type ?? null,
    created_at: r.created_at instanceof Date ? r.created_at.toISOString() : r.created_at,
  };
}

// GET /api/admin/resources
resourcesRouter.get('/', async (req, res) => {
  try {
    const { class_group_id } = req.query as { class_group_id?: string };
    const where: any = {};
    if (class_group_id) where.class_id = Number(class_group_id);

    const items = await db.lessonResource.findMany({
      where,
      orderBy: { created_at: 'desc' },
    });
    res.json({ total: items.length, items: items.map(resourceToItem) });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// POST /api/admin/resources
resourcesRouter.post('/', async (req, res) => {
  try {
    const {
      title, description, file_url, external_url, resource_type, audience,
      class_group_id, lesson_id, created_by, file_size, file_type,
    } = req.body as {
      title?: string; description?: string; file_url?: string; external_url?: string;
      resource_type?: string; audience?: string; class_group_id?: number;
      lesson_id?: number; created_by?: number; file_size?: number; file_type?: string;
    };
    if (!title) { res.status(400).json({ detail: 'title is required' }); return; }

    const resource = await db.lessonResource.create({
      data: {
        title: title.trim(),
        description: description ?? null,
        file_url: file_url ?? null,
        external_url: external_url ?? null,
        resource_type: (resource_type as any) ?? 'document',
        audience: (audience as any) ?? 'enrolled',
        class_id: class_group_id ?? null,
        lesson_id: lesson_id ?? null,
        created_by: created_by ?? null,
        file_size: file_size ?? null,
        file_type: file_type ?? null,
      },
    });
    res.status(201).json({ id: resource.id, title: resource.title });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// PATCH /api/admin/resources/:id
resourcesRouter.patch('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const body = req.body as Partial<{
      title: string; description: string; file_url: string; external_url: string;
      resource_type: string; audience: string; class_group_id: number; lesson_id: number;
    }>;
    const data: any = {};
    if (body.title !== undefined) data.title = body.title.trim();
    if (body.description !== undefined) data.description = body.description;
    if (body.file_url !== undefined) data.file_url = body.file_url;
    if (body.external_url !== undefined) data.external_url = body.external_url;
    if (body.resource_type !== undefined) data.resource_type = body.resource_type;
    if (body.audience !== undefined) data.audience = body.audience;
    if (body.class_group_id !== undefined) data.class_id = body.class_group_id;
    if (body.lesson_id !== undefined) data.lesson_id = body.lesson_id;

    await db.lessonResource.update({ where: { id }, data });
    res.json({ updated: true });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// DELETE /api/admin/resources/:id
resourcesRouter.delete('/:id', async (req, res) => {
  try {
    await db.lessonResource.delete({ where: { id: Number(req.params.id) } });
    res.status(204).send();
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});
