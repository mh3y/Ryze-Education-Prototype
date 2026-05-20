import { Router } from 'express';
import { db } from '../../prisma';
import { requireAdmin } from '../../auth/middleware';

// ── Student Payments ──────────────────────────────────────────────────────────

export const studentPaymentsRouter = Router();
studentPaymentsRouter.use(requireAdmin);

function studentPaymentToItem(p: any) {
  return {
    id: p.id,
    student_user_id: p.student_id,
    student_name: p.student?.full_name ?? null,
    parent_profile_id: null,
    term: p.period ?? '',
    amount_due: (p.amount_cents / 100).toFixed(2),
    amount_paid: p.status === 'paid' ? (p.amount_cents / 100).toFixed(2) : '0.00',
    amount_remaining: p.status === 'paid' ? '0.00' : (p.amount_cents / 100).toFixed(2),
    due_date: p.due_date ? (p.due_date instanceof Date ? p.due_date.toISOString() : p.due_date) : null,
    status: p.status,
    payment_method: p.payment_method ?? null,
    paid_at: p.paid_at ? (p.paid_at instanceof Date ? p.paid_at.toISOString() : p.paid_at) : null,
    notes: p.notes ?? null,
    description: p.description ?? null,
    reference: p.reference ?? null,
  };
}

// GET /api/admin/student-payments
studentPaymentsRouter.get('/student-payments', async (req, res) => {
  try {
    const { student_user_id, status } = req.query as { student_user_id?: string; status?: string };
    const where: any = {};
    if (student_user_id) where.student_id = Number(student_user_id);
    if (status) where.status = status;

    const items = await db.studentPayment.findMany({
      where,
      include: { student: { select: { full_name: true } } },
      orderBy: { due_date: 'desc' },
    });
    res.json({ total: items.length, items: items.map(studentPaymentToItem) });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// POST /api/admin/student-payments
studentPaymentsRouter.post('/student-payments', async (req, res) => {
  try {
    const { student_user_id, amount_due, description, period, due_date, status, notes } = req.body as {
      student_user_id?: number; amount_due?: number; description?: string;
      period?: string; due_date?: string; status?: string; notes?: string;
    };
    if (!student_user_id) { res.status(400).json({ detail: 'student_user_id is required' }); return; }
    if (amount_due === undefined) { res.status(400).json({ detail: 'amount_due is required' }); return; }
    if (!description) { res.status(400).json({ detail: 'description is required' }); return; }

    const payment = await db.studentPayment.create({
      data: {
        student_id: student_user_id,
        amount_cents: Math.round(amount_due * 100),
        description,
        period: period ?? null,
        due_date: due_date ? new Date(due_date) : null,
        status: (status as any) ?? 'pending',
        notes: notes ?? null,
      },
    });
    res.status(201).json({ id: payment.id });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// PATCH /api/admin/student-payments/:id
studentPaymentsRouter.patch('/student-payments/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const body = req.body as Partial<{
      status: string; paid_at: string; payment_method: string; notes: string;
      reference: string; amount_due: number; description: string; period: string; due_date: string;
    }>;
    const data: any = {};
    if (body.status !== undefined) data.status = body.status;
    if (body.paid_at !== undefined) data.paid_at = new Date(body.paid_at);
    if (body.payment_method !== undefined) data.payment_method = body.payment_method;
    if (body.notes !== undefined) data.notes = body.notes;
    if (body.reference !== undefined) data.reference = body.reference;
    if (body.amount_due !== undefined) data.amount_cents = Math.round(body.amount_due * 100);
    if (body.description !== undefined) data.description = body.description;
    if (body.period !== undefined) data.period = body.period;
    if (body.due_date !== undefined) data.due_date = new Date(body.due_date);

    // Auto-set paid_at when marking as paid
    if (body.status === 'paid' && !body.paid_at) {
      data.paid_at = new Date();
    }

    await db.studentPayment.update({ where: { id }, data });
    res.json({ updated: true });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// ── Tutor Payments ────────────────────────────────────────────────────────────

export const tutorPaymentsRouter = Router();
tutorPaymentsRouter.use(requireAdmin);

function tutorPaymentToItem(p: any) {
  return {
    id: p.id,
    tutor_profile_id: p.tutor_id,
    tutor_user_id: p.tutor?.user_id ?? null,
    tutor_name: p.tutor?.user?.full_name ?? null,
    amount_cents: p.amount_cents,
    amount: (p.amount_cents / 100).toFixed(2),
    period: p.period ?? null,
    description: p.description,
    paid_at: p.paid_at ? (p.paid_at instanceof Date ? p.paid_at.toISOString() : p.paid_at) : null,
    status: p.status,
    created_at: p.created_at instanceof Date ? p.created_at.toISOString() : p.created_at,
    items: p.items ?? [],
  };
}

// GET /api/admin/tutor-payments
tutorPaymentsRouter.get('/tutor-payments', async (req, res) => {
  try {
    const { tutor_user_id } = req.query as { tutor_user_id?: string };
    const where: any = {};
    if (tutor_user_id) {
      const profile = await db.tutorProfile.findUnique({ where: { user_id: Number(tutor_user_id) } });
      if (profile) where.tutor_id = profile.id;
    }

    const items = await db.tutorPayment.findMany({
      where,
      include: {
        tutor: {
          include: { user: { select: { full_name: true } } },
        },
        items: true,
      },
      orderBy: { created_at: 'desc' },
    });
    res.json({ total: items.length, items: items.map(tutorPaymentToItem) });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// POST /api/admin/tutor-payments
tutorPaymentsRouter.post('/tutor-payments', async (req, res) => {
  try {
    const { tutor_user_id, amount_due, description, period, status } = req.body as {
      tutor_user_id?: number; amount_due?: number; description?: string;
      period?: string; status?: string;
    };
    if (!tutor_user_id) { res.status(400).json({ detail: 'tutor_user_id is required' }); return; }
    if (amount_due === undefined) { res.status(400).json({ detail: 'amount_due is required' }); return; }
    if (!description) { res.status(400).json({ detail: 'description is required' }); return; }

    const profile = await db.tutorProfile.findUnique({ where: { user_id: tutor_user_id } });
    if (!profile) { res.status(404).json({ detail: 'Tutor profile not found' }); return; }

    const payment = await db.tutorPayment.create({
      data: {
        tutor_id: profile.id,
        amount_cents: Math.round(amount_due * 100),
        description,
        period: period ?? null,
        status: status ?? 'pending',
      },
    });
    res.status(201).json({ id: payment.id });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// PATCH /api/admin/tutor-payments/:id
tutorPaymentsRouter.patch('/tutor-payments/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const body = req.body as Partial<{
      status: string; paid_at: string; description: string; period: string; amount_due: number;
    }>;
    const data: any = {};
    if (body.status !== undefined) data.status = body.status;
    if (body.paid_at !== undefined) data.paid_at = new Date(body.paid_at);
    if (body.description !== undefined) data.description = body.description;
    if (body.period !== undefined) data.period = body.period;
    if (body.amount_due !== undefined) data.amount_cents = Math.round(body.amount_due * 100);

    await db.tutorPayment.update({ where: { id }, data });
    res.json({ updated: true });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// POST /api/admin/tutor-payments/:id/items
tutorPaymentsRouter.post('/tutor-payments/:id/items', async (req, res) => {
  try {
    const payment_id = Number(req.params.id);
    const { class_id, description, hours, rate_cents, amount_due } = req.body as {
      class_id?: number; description?: string; hours?: number;
      rate_cents?: number; amount_due?: number;
    };
    if (!description) { res.status(400).json({ detail: 'description is required' }); return; }

    const item = await db.tutorPaymentItem.create({
      data: {
        payment_id,
        class_id: class_id ?? null,
        description,
        hours: hours ?? null,
        rate_cents: rate_cents ?? null,
        amount_cents: amount_due !== undefined ? Math.round(amount_due * 100) : (rate_cents && hours ? Math.round(rate_cents * hours) : 0),
      },
    });
    res.status(201).json({ id: item.id });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});
