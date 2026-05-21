/**
 * Alerts router — /api/admin/alerts
 *
 * Endpoints
 *   GET    /alerts               list alerts (filterable by status / severity)
 *   POST   /alerts/generate      scan the DB and create new system alerts
 *   PATCH  /alerts/:id/resolve   mark alert as resolved
 *   PATCH  /alerts/:id/dismiss   mark alert as dismissed
 */

import { Router } from 'express';
import { db } from '../../prisma';
import { requireAdminOnly } from '../../auth/middleware';

export const alertsRouter = Router();
alertsRouter.use(requireAdminOnly);

// ---------------------------------------------------------------------------
// Serialiser
// ---------------------------------------------------------------------------

function alertToItem(a: any) {
  return {
    id: a.id,
    alert_type: a.alert_type,
    severity: a.severity,
    title: a.title,
    message: a.message,
    related_entity_type: a.related_entity_type ?? null,
    related_entity_id: a.related_entity_id ?? null,
    status: a.status,
    assigned_to: a.assigned_to ?? null,
    created_at: a.created_at instanceof Date ? a.created_at.toISOString() : a.created_at,
    resolved_at: a.resolved_at instanceof Date ? a.resolved_at.toISOString() : (a.resolved_at ?? null),
  };
}

// ---------------------------------------------------------------------------
// GET /alerts
// ---------------------------------------------------------------------------

alertsRouter.get('/alerts', async (req, res) => {
  try {
    const status   = (req.query.status   as string | undefined) ?? 'open';
    const severity = req.query.severity  as string | undefined;
    const limit    = Math.min(Number(req.query.limit ?? 200), 500);
    const skip     = Number(req.query.skip ?? 0);

    const where: any = {};
    if (status !== 'all')     where.status   = status;
    if (severity)             where.severity = severity;

    const [total, items] = await Promise.all([
      db.alert.count({ where }),
      db.alert.findMany({
        where,
        orderBy: [{ created_at: 'desc' }],
        skip,
        take: limit,
      }),
    ]);

    res.json({ total, items: items.map(alertToItem) });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// ---------------------------------------------------------------------------
// POST /alerts/generate — run checks and create new alerts
// ---------------------------------------------------------------------------

alertsRouter.post('/alerts/generate', async (req, res) => {
  try {
    const created: number[] = [];

    // Helper: only insert if no open alert of the same type+entity exists
    async function maybeCreate(data: {
      alert_type: string;
      severity: string;
      title: string;
      message: string;
      related_entity_type?: string;
      related_entity_id?: number;
    }) {
      const existing = await db.alert.findFirst({
        where: {
          alert_type: data.alert_type,
          related_entity_id: data.related_entity_id ?? null,
          status: 'open',
        },
      });
      if (existing) return;
      const a = await db.alert.create({ data: { ...data, status: 'open' } });
      created.push(a.id);
    }

    // ── 1. Overdue student payments ────────────────────────────────────── //
    const overduePayments = await db.studentPayment.findMany({
      where: { status: 'overdue' },
      include: { student: { select: { full_name: true } } },
    });
    for (const p of overduePayments) {
      await maybeCreate({
        alert_type: 'overdue_payment',
        severity: 'high',
        title: `Overdue payment — ${p.student.full_name}`,
        message: `Invoice #${p.id} ($${(p.amount_cents / 100).toFixed(2)}) is overdue. Term: ${p.term ?? 'N/A'}.`,
        related_entity_type: 'payment',
        related_entity_id: p.id,
      });
    }

    // ── 2. Completed lessons with unknown attendance ────────────────────── //
    const lessonsWithUnknown = await db.lesson.findMany({
      where: {
        status: 'completed',
        attendance: { some: { status: 'unknown' } },
      },
      include: {
        class: { select: { name: true } },
        attendance: { where: { status: 'unknown' }, select: { id: true } },
      },
    });
    for (const l of lessonsWithUnknown) {
      const count = l.attendance.length;
      await maybeCreate({
        alert_type: 'missing_attendance',
        severity: 'medium',
        title: `Missing attendance — ${l.class?.name ?? 'Unknown class'}`,
        message: `Lesson "${l.title}" (${l.scheduled_at instanceof Date ? l.scheduled_at.toLocaleDateString('en-AU') : l.scheduled_at}) has ${count} student${count === 1 ? '' : 's'} with unrecorded attendance.`,
        related_entity_type: 'lesson',
        related_entity_id: l.id,
      });
    }

    // ── 3. Students enrolled with no progress report ever ──────────────── //
    const studentsNoReport = await db.user.findMany({
      where: {
        role: 'student',
        active: true,
        enrollments: { some: { active: true } },
        progress_reports: { none: {} },
      },
      select: { id: true, full_name: true },
      take: 50, // cap to avoid flooding alert list
    });
    for (const s of studentsNoReport) {
      await maybeCreate({
        alert_type: 'missing_report',
        severity: 'low',
        title: `No progress report — ${s.full_name}`,
        message: `${s.full_name} has no progress reports on record. Consider writing one.`,
        related_entity_type: 'student',
        related_entity_id: s.id,
      });
    }

    // ── 4. Expiring parent invite tokens (within 48 h) ─────────────────── //
    const soon = new Date(Date.now() + 48 * 3600 * 1000);
    const expiringInvites = await db.parent.findMany({
      where: {
        invite_pending: true,
        has_set_password: false,
        invite_expires_at: { lte: soon, gt: new Date() },
      },
      select: { id: true, first_name: true, last_name: true, email: true },
    });
    for (const p of expiringInvites) {
      await maybeCreate({
        alert_type: 'expiring_invite',
        severity: 'low',
        title: `Invite expiring — ${p.first_name} ${p.last_name}`,
        message: `Parent invite for ${p.email} expires within 48 hours and hasn't been accepted yet.`,
        related_entity_type: 'parent',
        related_entity_id: p.id,
      });
    }

    res.json({ created: created.length, alert_ids: created });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// ---------------------------------------------------------------------------
// PATCH /alerts/:id/resolve
// ---------------------------------------------------------------------------

alertsRouter.patch('/alerts/:id/resolve', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const alert = await db.alert.findUnique({ where: { id } });
    if (!alert) { res.status(404).json({ detail: 'Alert not found' }); return; }

    await db.alert.update({
      where: { id },
      data: { status: 'resolved', resolved_at: new Date() },
    });
    res.json({ resolved: true });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// ---------------------------------------------------------------------------
// PATCH /alerts/:id/dismiss
// ---------------------------------------------------------------------------

alertsRouter.patch('/alerts/:id/dismiss', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const alert = await db.alert.findUnique({ where: { id } });
    if (!alert) { res.status(404).json({ detail: 'Alert not found' }); return; }

    await db.alert.update({
      where: { id },
      data: { status: 'dismissed' },
    });
    res.json({ dismissed: true });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});
