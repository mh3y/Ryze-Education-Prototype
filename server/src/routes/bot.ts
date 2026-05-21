/**
 * /api/bot/* — endpoints consumed by the Discord bot
 *
 * Auth: static Bearer token from BOT_API_SECRET env var (requireBot middleware).
 * These routes are NOT for browser clients — they are for the bot process only.
 */

import { Router } from 'express';
import { db } from '../prisma';
import { requireBot } from '../auth/middleware';

export const botRouter = Router();
botRouter.use(requireBot);

// ── GET /api/bot/jobs/pending ─────────────────────────────────────────────────
// Bot polls this to get next jobs to process.

botRouter.get('/jobs/pending', async (_req, res) => {
  try {
    // Claim up to 5 pending jobs atomically (use a transaction)
    const jobs = await db.$transaction(async (tx) => {
      const pending = await tx.botJob.findMany({
        where: {
          status: 'pending',
          // Only pick up jobs that haven't exceeded max_attempts
          // We can't use a column-vs-column comparison in Prisma directly,
          // so we fetch generously and the fail endpoint handles max_attempts check.
        },
        orderBy: [{ priority: 'asc' }, { created_at: 'asc' }],
        take: 5,
      });

      if (!pending.length) return [];

      await tx.botJob.updateMany({
        where: { id: { in: pending.map((j: any) => j.id) } },
        data:  { status: 'processing', claimed_at: new Date(), attempts: { increment: 1 } },
      });

      return pending;
    });

    res.json(jobs.map((j: any) => ({
      id:       j.id,
      job_type: j.job_type,
      payload:  j.payload,
      priority: j.priority,
      attempts: j.attempts + 1, // reflect the increment
    })));
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// ── PATCH /api/bot/jobs/:id/complete ─────────────────────────────────────────

botRouter.patch('/jobs/:id/complete', async (req, res) => {
  try {
    const id = Number(req.params.id);
    await db.botJob.update({
      where: { id },
      data:  { status: 'completed', completed_at: new Date() },
    });
    res.json({ updated: true });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// ── PATCH /api/bot/jobs/:id/fail ─────────────────────────────────────────────

botRouter.patch('/jobs/:id/fail', async (req, res) => {
  try {
    const id    = Number(req.params.id);
    const { error } = req.body as { error?: string };

    const job = await db.botJob.findUnique({ where: { id } });
    if (!job) { res.status(404).json({ detail: 'Job not found' }); return; }

    const newStatus = job.attempts >= job.max_attempts ? 'failed' : 'pending';
    await db.botJob.update({
      where: { id },
      data: { status: newStatus, error: error ?? null, claimed_at: null },
    });
    res.json({ status: newStatus });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// ── POST /api/bot/attendance ──────────────────────────────────────────────────
// Bot reports voice-channel attendance (who joined / left a lesson VC).

botRouter.post('/attendance', async (req, res) => {
  try {
    const { lesson_id, discord_user_id, channel, joined_at, left_at } = req.body as {
      lesson_id?: number; discord_user_id?: string; channel?: string;
      joined_at?: string; left_at?: string;
    };
    if (!lesson_id || !discord_user_id || !joined_at) {
      res.status(400).json({ detail: 'lesson_id, discord_user_id, joined_at are required' });
      return;
    }

    const joinedDate = new Date(joined_at);
    const leftDate   = left_at ? new Date(left_at) : null;
    const seconds    = leftDate ? Math.floor((leftDate.getTime() - joinedDate.getTime()) / 1000) : null;

    // Upsert VoiceAttendance (no unique constraint — just create)
    const existing = await db.voiceAttendance.findFirst({
      where: { lesson_id, discord_user_id },
    });
    if (existing) {
      await db.voiceAttendance.update({
        where: { id: existing.id },
        data:  { left_at: leftDate, duration_seconds: seconds },
      });
    } else {
      await db.voiceAttendance.create({
        data: { lesson_id, discord_user_id, discord_channel: channel ?? null, joined_at: joinedDate, left_at: leftDate, duration_seconds: seconds },
      });
    }

    // Also upsert the canonical Attendance record
    const user = await db.user.findFirst({ where: { discord_user_id } });
    if (user) {
      await db.attendance.upsert({
        where:  { lesson_id_student_id: { lesson_id, student_id: user.id } },
        update: { status: 'present' },
        create: { lesson_id, student_id: user.id, status: 'present' },
      });
    }

    res.json({ recorded: true });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});
