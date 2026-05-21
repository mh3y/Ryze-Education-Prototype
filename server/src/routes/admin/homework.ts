import { Router } from 'express';
import { db } from '../../prisma';
import { requireAdmin } from '../../auth/middleware';

export const homeworkRouter = Router();
homeworkRouter.use(requireAdmin);

function homeworkToItem(h: any) {
  const submissions: any[] = h.submissions ?? [];
  const submitted = submissions.filter((s: any) => ['submitted', 'late', 'marked'].includes(s.status)).length;
  const late = submissions.filter((s: any) => s.status === 'late').length;
  const reviewed = submissions.filter((s: any) => s.status === 'marked').length;
  const missing = submissions.filter((s: any) => s.status === 'missing').length;

  return {
    id: h.id,
    title: h.title,
    description: h.description ?? null,
    instructions: h.instructions ?? null,
    class_group_id: h.class_id,
    class_group_name: h.class?.name ?? null,
    lesson_id: null,
    due_at: h.due_date ? (h.due_date instanceof Date ? h.due_date.toISOString() : h.due_date) : '',
    max_score: h.max_score ?? null,
    file_url: h.file_url ?? null,
    published: h.published,
    created_by: 0,
    created_at: h.created_at instanceof Date ? h.created_at.toISOString() : h.created_at,
    submission_summary: { submitted, late, missing, reviewed },
    submission_total: submissions.length,
  };
}

// GET /api/admin/homework
homeworkRouter.get('/', async (req, res) => {
  try {
    const { class_group_id } = req.query as { class_group_id?: string };
    const where: any = {};
    if (class_group_id) where.class_id = Number(class_group_id);

    const items = await db.homework.findMany({
      where,
      include: {
        class: { select: { name: true } },
        submissions: true,
      },
      orderBy: { due_date: 'asc' },
    });
    res.json({ total: items.length, items: items.map(homeworkToItem) });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// GET /api/admin/homework/:id
homeworkRouter.get('/:id', async (req, res) => {
  try {
    const h = await db.homework.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        class: { select: { name: true } },
        submissions: {
          include: { student: { select: { full_name: true } } },
        },
      },
    });
    if (!h) { res.status(404).json({ detail: 'Homework not found' }); return; }

    res.json({
      ...homeworkToItem(h),
      submissions: (h as any).submissions.map((s: any) => ({
        id: s.id,
        student_id: s.student_id,
        student_name: s.student?.full_name ?? null,
        status: s.status,
        submitted_at: s.submitted_at ? (s.submitted_at instanceof Date ? s.submitted_at.toISOString() : s.submitted_at) : null,
        marked_at: s.marked_at ? (s.marked_at instanceof Date ? s.marked_at.toISOString() : s.marked_at) : null,
        score: s.score ?? null,
        feedback: s.feedback ?? null,
        notes: s.notes ?? null,
        file_url: s.file_url ?? null,
      })),
    });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// POST /api/admin/homework
homeworkRouter.post('/', async (req, res) => {
  try {
    const { class_group_id, title, description, instructions, due_at, max_score, file_url, published } = req.body as {
      class_group_id?: number; title?: string; description?: string; instructions?: string;
      due_at?: string; max_score?: number; file_url?: string; published?: boolean;
    };
    if (!class_group_id) { res.status(400).json({ detail: 'class_group_id is required' }); return; }
    if (!title) { res.status(400).json({ detail: 'title is required' }); return; }

    const hw = await db.homework.create({
      data: {
        class_id: class_group_id,
        title: title.trim(),
        description: description ?? null,
        instructions: instructions ?? null,
        due_date: due_at ? new Date(due_at) : null,
        max_score: max_score ?? null,
        file_url: file_url ?? null,
        published: published ?? false,
      },
    });
    res.status(201).json({ id: hw.id, title: hw.title });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// PATCH /api/admin/homework/:id
homeworkRouter.patch('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const body = req.body as Partial<{
      title: string; description: string; instructions: string; due_at: string;
      max_score: number; file_url: string; published: boolean;
    }>;
    const data: any = {};
    if (body.title !== undefined) data.title = body.title.trim();
    if (body.description !== undefined) data.description = body.description;
    if (body.instructions !== undefined) data.instructions = body.instructions;
    if (body.due_at !== undefined) data.due_date = new Date(body.due_at);
    if (body.max_score !== undefined) data.max_score = body.max_score;
    if (body.file_url !== undefined) data.file_url = body.file_url;
    if (body.published !== undefined) data.published = body.published;

    await db.homework.update({ where: { id }, data });
    res.json({ updated: true });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// DELETE /api/admin/homework/:id
homeworkRouter.delete('/:id', async (req, res) => {
  try {
    await db.homework.delete({ where: { id: Number(req.params.id) } });
    res.status(204).send();
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// PATCH /api/admin/homework/:id/submissions/:submissionId
homeworkRouter.patch('/:id/submissions/:submissionId', async (req, res) => {
  try {
    const submissionId = Number(req.params.submissionId);
    const body = req.body as Partial<{
      status: string; feedback: string; score: number; notes: string;
    }>;
    const data: any = {};
    if (body.status !== undefined) data.status = body.status;
    if (body.feedback !== undefined) data.feedback = body.feedback;
    if (body.score !== undefined) data.score = body.score;
    if (body.notes !== undefined) data.notes = body.notes;
    if (body.status === 'marked') data.marked_at = new Date();

    await db.homeworkSubmission.update({ where: { id: submissionId }, data });
    res.json({ updated: true });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});
