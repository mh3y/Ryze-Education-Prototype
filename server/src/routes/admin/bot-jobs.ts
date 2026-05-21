/**
 * Admin bot-jobs endpoint — queue tasks for the Discord bot.
 *
 * The admin dashboard creates jobs; the bot polls /api/bot/jobs/pending
 * to claim and process them.
 */

import { Router } from 'express';
import { db } from '../../prisma';
import { requireAdmin, requireAdminOnly } from '../../auth/middleware';

export const botJobsRouter = Router();
botJobsRouter.use(requireAdmin);

// ── GET /api/admin/bot-jobs ───────────────────────────────────────────────────

botJobsRouter.get('/', async (req, res) => {
  try {
    const { status, job_type } = req.query as { status?: string; job_type?: string };
    const where: any = {};
    if (status)   where.status   = status;
    if (job_type) where.job_type = job_type;

    const jobs = await db.botJob.findMany({
      where,
      orderBy: [{ created_at: 'desc' }],
      take: 50,
    });
    res.json({ total: jobs.length, items: jobs.map((j: any) => ({
      id:          j.id,
      job_type:    j.job_type,
      status:      j.status,
      priority:    j.priority,
      attempts:    j.attempts,
      max_attempts: j.max_attempts,
      error:       j.error ?? null,
      created_at:  j.created_at instanceof Date ? j.created_at.toISOString() : j.created_at,
      claimed_at:  j.claimed_at instanceof Date ? j.claimed_at.toISOString() : j.claimed_at,
      completed_at: j.completed_at instanceof Date ? j.completed_at.toISOString() : j.completed_at,
    })) });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// ── POST /api/admin/bot-jobs ──────────────────────────────────────────────────

botJobsRouter.post('/', requireAdminOnly, async (req, res) => {
  try {
    const { job_type, payload, priority } = req.body as {
      job_type?: string; payload?: object; priority?: number;
    };
    if (!job_type) { res.status(400).json({ detail: 'job_type is required' }); return; }
    if (!payload)  { res.status(400).json({ detail: 'payload is required' }); return; }

    const VALID_TYPES = [
      'post_announcement', 'create_event', 'cancel_event',
      'send_reminder', 'send_dm',
    ];
    if (!VALID_TYPES.includes(job_type)) {
      res.status(400).json({ detail: `job_type must be one of: ${VALID_TYPES.join(', ')}` });
      return;
    }

    const job = await db.botJob.create({
      data: {
        job_type,
        payload,
        priority:  priority ?? 5,
        created_by: req.jwtPayload!.user_id ?? null,
      },
    });
    res.status(201).json({ id: job.id, status: job.status });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// ── DELETE /api/admin/bot-jobs/:id ───────────────────────────────────────────
// Cancel a pending job.

botJobsRouter.delete('/:id', requireAdminOnly, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const job = await db.botJob.findUnique({ where: { id } });
    if (!job) { res.status(404).json({ detail: 'Job not found' }); return; }
    if (job.status !== 'pending') {
      res.status(400).json({ detail: `Cannot cancel a job with status '${job.status}'` });
      return;
    }
    await db.botJob.delete({ where: { id } });
    res.status(204).end();
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});
