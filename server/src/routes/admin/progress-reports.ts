import { Router } from 'express';
import { db } from '../../prisma';
import { requireAdmin } from '../../auth/middleware';

export const progressReportsRouter = Router();
progressReportsRouter.use(requireAdmin);

function reportToItem(r: any) {
  return {
    id: r.id,
    student_user_id: r.student_id,
    student_name: r.student?.full_name ?? null,
    lesson_id: null,
    tutor_user_id: r.created_by ?? 0,
    tutor_name: r.created_by ? (r.creator?.full_name ?? null) : null,
    class_group_id: r.class_id ?? null,
    class_name: r.class?.name ?? null,
    period: r.period ?? null,
    score: r.score ?? null,
    grade: r.grade ?? null,
    strengths: r.strengths ?? null,
    improvements: r.improvements ?? null,
    summary: r.notes ?? null,
    status: r.status,
    visible_to_parent: r.status === 'published',
    visible_to_student: r.status === 'published',
    submitted_at: r.published_at ? (r.published_at instanceof Date ? r.published_at.toISOString() : r.published_at) : null,
    created_at: r.created_at instanceof Date ? r.created_at.toISOString() : r.created_at,
  };
}

// GET /api/admin/progress-reports
progressReportsRouter.get('/', async (req, res) => {
  try {
    const { student_user_id, status } = req.query as { student_user_id?: string; status?: string };
    const where: any = {};
    if (student_user_id) where.student_id = Number(student_user_id);
    if (status) where.status = status;

    const items = await db.progressReport.findMany({
      where,
      include: {
        student: { select: { full_name: true } },
        creator: { select: { full_name: true } },
        class: { select: { name: true } },
      },
      orderBy: { created_at: 'desc' },
    });
    res.json({ total: items.length, items: items.map(reportToItem) });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// GET /api/admin/progress-reports/:id
progressReportsRouter.get('/:id', async (req, res) => {
  try {
    const r = await db.progressReport.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        student: { select: { full_name: true } },
        creator: { select: { full_name: true } },
        class: { select: { name: true } },
      },
    });
    if (!r) { res.status(404).json({ detail: 'Report not found' }); return; }
    res.json(reportToItem(r));
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// POST /api/admin/progress-reports
progressReportsRouter.post('/', async (req, res) => {
  try {
    const { student_user_id, class_id, period, score, grade, strengths, improvements, notes, status, created_by } = req.body as {
      student_user_id?: number; class_id?: number; period?: string; score?: number;
      grade?: string; strengths?: string; improvements?: string; notes?: string;
      status?: string; created_by?: number;
    };
    if (!student_user_id) { res.status(400).json({ detail: 'student_user_id is required' }); return; }

    const report = await db.progressReport.create({
      data: {
        student_id: student_user_id,
        class_id: class_id ?? null,
        period: period ?? null,
        score: score ?? null,
        grade: grade ?? null,
        strengths: strengths ?? null,
        improvements: improvements ?? null,
        notes: notes ?? null,
        status: (status as any) ?? 'draft',
        created_by: created_by ?? null,
        ...(status === 'published' ? { published_at: new Date() } : {}),
      },
    });
    res.status(201).json({ id: report.id });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// PATCH /api/admin/progress-reports/:id
progressReportsRouter.patch('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const body = req.body as Partial<{
      status: string; strengths: string; improvements: string; notes: string;
      score: number; grade: string; period: string; class_id: number;
    }>;
    const data: any = {};
    if (body.status !== undefined) {
      data.status = body.status;
      if (body.status === 'published') data.published_at = new Date();
    }
    if (body.strengths !== undefined) data.strengths = body.strengths;
    if (body.improvements !== undefined) data.improvements = body.improvements;
    if (body.notes !== undefined) data.notes = body.notes;
    if (body.score !== undefined) data.score = body.score;
    if (body.grade !== undefined) data.grade = body.grade;
    if (body.period !== undefined) data.period = body.period;
    if (body.class_id !== undefined) data.class_id = body.class_id;

    await db.progressReport.update({ where: { id }, data });
    res.json({ updated: true });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});
