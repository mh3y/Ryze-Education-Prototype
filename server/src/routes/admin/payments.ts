import { Router } from 'express';
import { db } from '../../prisma';
import { requireAdmin, requireAdminOnly } from '../../auth/middleware';
import {
  generateOverduePayments,
  resolveNotificationsForEntity,
} from '../../services/notificationService';

// Fire-and-forget helper — notification failures must not affect payment mutations
function notifyAsync(fn: () => Promise<unknown>): void {
  fn().catch((e) => console.error('[payments] notification side-effect error:', e));
}

// ── Student Payments ──────────────────────────────────────────────────────────

export const studentPaymentsRouter = Router();
studentPaymentsRouter.use(requireAdmin);

function studentPaymentToItem(p: any) {
  const amountDue       = p.amount_cents / 100;
  const amountPaid      = (p.amount_paid_cents ?? 0) / 100;
  const amountRemaining = Math.max(0, amountDue - amountPaid);
  return {
    id:                 p.id,
    student_id:         p.student_id,
    student_name:       p.student?.full_name ?? null,
    term:               p.term ?? null,
    description:        p.description,
    frequency:          p.frequency,
    installment_number: p.installment_number ?? null,
    total_installments: p.total_installments ?? null,
    amount_due:         amountDue,
    amount_paid:        amountPaid,
    amount_remaining:   amountRemaining,
    due_date:           p.due_date ? (p.due_date instanceof Date ? p.due_date.toISOString() : p.due_date) : null,
    paid_at:            p.paid_at   ? (p.paid_at   instanceof Date ? p.paid_at.toISOString()   : p.paid_at)   : null,
    payment_method:     p.payment_method ?? null,
    received_by:        p.received_by ?? null,
    reference:          p.reference ?? null,
    status:             p.status,
    notes:              p.notes ?? null,
    created_at:         p.created_at instanceof Date ? p.created_at.toISOString() : p.created_at,
  };
}

// GET /api/admin/student-payments
studentPaymentsRouter.get('/student-payments', async (req, res) => {
  try {
    const { student_id, status, skip, limit } = req.query as {
      student_id?: string; status?: string; skip?: string; limit?: string;
    };
    const where: any = {};
    if (student_id) where.student_id = Number(student_id);
    if (status)     where.status     = status;

    const [total, items] = await Promise.all([
      db.studentPayment.count({ where }),
      db.studentPayment.findMany({
        where,
        include: { student: { select: { full_name: true } } },
        orderBy: { due_date: 'desc' },
        skip: skip ? Number(skip) : 0,
        take: limit ? Number(limit) : 100,
      }),
    ]);
    res.json({ total, items: items.map(studentPaymentToItem) });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// POST /api/admin/student-payments
studentPaymentsRouter.post('/student-payments', requireAdminOnly, async (req, res) => {
  try {
    const {
      student_id, description, amount_cents, term, frequency,
      installment_number, total_installments, due_date, notes,
    } = req.body as {
      student_id?: number; description?: string; amount_cents?: number;
      term?: string; frequency?: string; installment_number?: number;
      total_installments?: number; due_date?: string; notes?: string;
    };

    if (!student_id)      { res.status(400).json({ detail: 'student_id is required' }); return; }
    if (!description)     { res.status(400).json({ detail: 'description is required' }); return; }
    if (amount_cents === undefined) { res.status(400).json({ detail: 'amount_cents is required' }); return; }

    const payment = await db.studentPayment.create({
      data: {
        student_id,
        description,
        amount_cents,
        amount_paid_cents: 0,
        term: term ?? null,
        frequency: (frequency as any) ?? 'termly',
        installment_number: installment_number ?? null,
        total_installments: total_installments ?? null,
        due_date: due_date ? new Date(due_date) : null,
        notes: notes ?? null,
        status: 'pending',
      },
    });
    res.status(201).json({ id: payment.id });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// PATCH /api/admin/student-payments/:id
studentPaymentsRouter.patch('/student-payments/:id', requireAdminOnly, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const body = req.body as Partial<{
      status: string; amount_paid_cents: number; payment_method: string;
      received_by: string; reference: string; paid_at: string; notes: string;
      amount_cents: number; description: string; term: string; due_date: string;
      frequency: string; installment_number: number; total_installments: number;
    }>;

    const existing = await db.studentPayment.findUnique({ where: { id } });
    if (!existing) { res.status(404).json({ detail: 'Payment not found' }); return; }

    const data: any = {};
    if (body.status !== undefined)             data.status = body.status;
    if (body.amount_paid_cents !== undefined)   data.amount_paid_cents = body.amount_paid_cents;
    if (body.payment_method !== undefined)      data.payment_method = body.payment_method;
    if (body.received_by !== undefined)         data.received_by = body.received_by;
    if (body.reference !== undefined)           data.reference = body.reference;
    if (body.paid_at !== undefined)             data.paid_at = new Date(body.paid_at);
    if (body.notes !== undefined)               data.notes = body.notes;
    if (body.amount_cents !== undefined)        data.amount_cents = body.amount_cents;
    if (body.description !== undefined)         data.description = body.description;
    if (body.term !== undefined)                data.term = body.term;
    if (body.due_date !== undefined)            data.due_date = new Date(body.due_date);
    if (body.frequency !== undefined)           data.frequency = body.frequency;
    if (body.installment_number !== undefined)  data.installment_number = body.installment_number;
    if (body.total_installments !== undefined)  data.total_installments = body.total_installments;

    // Auto-derive status from payment amount if not explicitly set
    if (body.amount_paid_cents !== undefined && body.status === undefined) {
      const newPaid  = body.amount_paid_cents;
      const totalDue = body.amount_cents ?? existing.amount_cents;
      if (newPaid >= totalDue) {
        data.status = 'paid';
        data.paid_at = data.paid_at ?? new Date();
      } else if (newPaid > 0) {
        data.status = 'partial';
      }
    }

    // Auto-set paid_at when explicitly marking as paid
    if (body.status === 'paid' && !body.paid_at) {
      data.paid_at = new Date();
    }

    const updated = await db.studentPayment.update({ where: { id }, data });

    // Post-mutation notification side-effects (fire-and-forget)
    const finalStatus = updated.status;
    if (finalStatus === 'overdue') {
      notifyAsync(() => generateOverduePayments());
    } else if (finalStatus === 'paid' || finalStatus === 'waived') {
      // Resolve any unread overdue-payment notifications for this invoice
      notifyAsync(() => resolveNotificationsForEntity('overdue_payment', id));
    }

    res.json({ updated: true });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// PATCH /api/admin/student-payments/:id/mark-paid — convenience one-step mark-paid
studentPaymentsRouter.patch('/student-payments/:id/mark-paid', requireAdminOnly, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { payment_method, received_by, reference, notes } = req.body as {
      payment_method?: string; received_by?: string; reference?: string; notes?: string;
    };

    const existing = await db.studentPayment.findUnique({ where: { id } });
    if (!existing) { res.status(404).json({ detail: 'Payment not found' }); return; }

    await db.studentPayment.update({
      where: { id },
      data: {
        status:             'paid',
        amount_paid_cents:  existing.amount_cents,
        paid_at:            new Date(),
        payment_method:     payment_method ?? null,
        received_by:        received_by ?? null,
        reference:          reference ?? null,
        notes:              notes ?? existing.notes,
      },
    });
    // Resolve any outstanding overdue-payment notifications for this invoice
    notifyAsync(() => resolveNotificationsForEntity('overdue_payment', id));
    res.json({ updated: true });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// POST /api/admin/student-payments/bulk-create — create a batch of installment payments
studentPaymentsRouter.post('/student-payments/bulk-create', requireAdminOnly, async (req, res) => {
  try {
    const {
      student_id, description, amount_cents_per, total_installments, frequency,
      first_due_date, notes,
    } = req.body as {
      student_id?: number; description?: string; amount_cents_per?: number;
      total_installments?: number; frequency?: string;
      first_due_date?: string; notes?: string;
    };

    if (!student_id)          { res.status(400).json({ detail: 'student_id is required' }); return; }
    if (!description)         { res.status(400).json({ detail: 'description is required' }); return; }
    if (!amount_cents_per)    { res.status(400).json({ detail: 'amount_cents_per is required' }); return; }
    if (!total_installments)  { res.status(400).json({ detail: 'total_installments is required' }); return; }
    if (!frequency)           { res.status(400).json({ detail: 'frequency is required' }); return; }

    const intervalDays: Record<string, number> = {
      weekly: 7, termly: 91, yearly: 365,
    };
    const daysBetween = intervalDays[frequency] ?? 30;
    const baseDate = first_due_date ? new Date(first_due_date) : null;

    const data = Array.from({ length: total_installments }, (_, i) => {
      const dueDate = baseDate
        ? new Date(baseDate.getTime() + i * daysBetween * 86400000)
        : null;
      return {
        student_id:         student_id!,
        description,
        amount_cents:       amount_cents_per!,
        amount_paid_cents:  0,
        frequency:          frequency as any,
        installment_number: i + 1,
        total_installments: total_installments!,
        due_date:           dueDate,
        notes:              notes ?? null,
        status:             'pending' as any,
      };
    });

    const result = await db.studentPayment.createMany({ data });
    res.status(201).json({ created: result.count });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// POST /api/admin/payments/escalate-overdue — mark past-due unpaid payments as overdue
studentPaymentsRouter.post('/student-payments/escalate-overdue', requireAdminOnly, async (req, res) => {
  try {
    const result = await db.studentPayment.updateMany({
      where: {
        status:  { in: ['pending', 'partial'] },
        due_date: { lt: new Date() },
      },
      data: { status: 'overdue' },
    });
    // If any payments were escalated, generate overdue notifications
    if (result.count > 0) {
      notifyAsync(() => generateOverduePayments());
    }
    res.json({ escalated: result.count });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// ── Tutor Payments ────────────────────────────────────────────────────────────

export const tutorPaymentsRouter = Router();
tutorPaymentsRouter.use(requireAdmin);

function tutorPaymentToItem(p: any) {
  return {
    id:          p.id,
    tutor_id:    p.tutor_id,
    tutor_name:  p.tutor?.user?.full_name ?? null,
    amount:      (p.amount_cents / 100).toFixed(2),
    period:      p.period ?? null,
    description: p.description,
    paid_at:     p.paid_at ? (p.paid_at instanceof Date ? p.paid_at.toISOString() : p.paid_at) : null,
    status:      p.status,
    created_at:  p.created_at instanceof Date ? p.created_at.toISOString() : p.created_at,
    items: (p.items ?? []).map((item: any) => ({
      id:          item.id,
      class_id:    item.class_id ?? null,
      description: item.description,
      hours:       item.hours ?? null,
      rate_cents:  item.rate_cents ?? null,
      amount:      (item.amount_cents / 100).toFixed(2),
    })),
  };
}

// GET /api/admin/tutor-payments
tutorPaymentsRouter.get('/tutor-payments', async (req, res) => {
  try {
    const { tutor_user_id, status } = req.query as { tutor_user_id?: string; status?: string };
    const where: any = {};
    if (status) where.status = status;
    if (tutor_user_id) {
      const profile = await db.tutorProfile.findUnique({ where: { user_id: Number(tutor_user_id) } });
      if (profile) where.tutor_id = profile.id;
    }

    const items = await db.tutorPayment.findMany({
      where,
      include: { tutor: { include: { user: { select: { full_name: true } } } }, items: true },
      orderBy: { created_at: 'desc' },
    });
    res.json({ total: items.length, items: items.map(tutorPaymentToItem) });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// POST /api/admin/tutor-payments
tutorPaymentsRouter.post('/tutor-payments', requireAdminOnly, async (req, res) => {
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
      data: { tutor_id: profile.id, amount_cents: Math.round(amount_due * 100), description, period: period ?? null, status: status ?? 'pending' },
    });
    res.status(201).json({ id: payment.id });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// PATCH /api/admin/tutor-payments/:id
tutorPaymentsRouter.patch('/tutor-payments/:id', requireAdminOnly, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const body = req.body as Partial<{ status: string; paid_at: string; description: string; period: string; amount_due: number }>;
    const data: any = {};
    if (body.status !== undefined)     data.status = body.status;
    if (body.paid_at !== undefined)    data.paid_at = new Date(body.paid_at);
    if (body.description !== undefined) data.description = body.description;
    if (body.period !== undefined)     data.period = body.period;
    if (body.amount_due !== undefined)  data.amount_cents = Math.round(body.amount_due * 100);
    if (body.status === 'paid' && !body.paid_at) data.paid_at = new Date();

    await db.tutorPayment.update({ where: { id }, data });
    res.json({ updated: true });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// POST /api/admin/tutor-payments/:id/items
tutorPaymentsRouter.post('/tutor-payments/:id/items', requireAdminOnly, async (req, res) => {
  try {
    const payment_id = Number(req.params.id);
    const { class_id, description, hours, rate_cents, amount_due } = req.body as {
      class_id?: number; description?: string; hours?: number; rate_cents?: number; amount_due?: number;
    };
    if (!description) { res.status(400).json({ detail: 'description is required' }); return; }

    const item = await db.tutorPaymentItem.create({
      data: {
        payment_id, class_id: class_id ?? null, description,
        hours: hours ?? null, rate_cents: rate_cents ?? null,
        amount_cents: amount_due !== undefined
          ? Math.round(amount_due * 100)
          : (rate_cents && hours ? Math.round(rate_cents * hours) : 0),
      },
    });
    res.status(201).json({ id: item.id });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});
