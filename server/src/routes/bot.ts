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

// ── POST /api/bot/sync-members ───────────────────────────────────────────────
// Bot pushes a bulk snapshot of all Discord guild members with their portal role.
// Body: { members: Array<{ discord_user_id: string; full_name: string; avatar_url?: string; role: "admin"|"tutor"|"student" }> }

botRouter.post('/sync-members', async (req, res) => {
  try {
    const { members } = req.body as {
      members: Array<{
        discord_user_id: string;
        full_name: string;
        avatar_url?: string;
        role: 'admin' | 'tutor' | 'student';
      }>;
    };

    if (!Array.isArray(members)) {
      res.status(400).json({ detail: 'members array is required' });
      return;
    }

    let created = 0;
    let updated = 0;

    for (const m of members) {
      if (!m.discord_user_id || !m.full_name || !m.role) continue;

      const existing = await db.user.findUnique({
        where: { discord_user_id: m.discord_user_id },
      });

      if (existing) {
        // Only update role/avatar — never overwrite manually set fields like email
        const changed =
          existing.role !== m.role ||
          (m.avatar_url && existing.avatar_url !== m.avatar_url);

        if (changed) {
          await db.user.update({
            where: { discord_user_id: m.discord_user_id },
            data: {
              role:       m.role,
              avatar_url: m.avatar_url ?? existing.avatar_url,
              updated_at: new Date(),
            },
          });
          updated++;
        }
      } else {
        await db.user.create({
          data: {
            discord_user_id: m.discord_user_id,
            full_name:       m.full_name,
            avatar_url:      m.avatar_url ?? null,
            role:            m.role,
            active:          true,
          },
        });
        created++;
      }
    }

    res.json({ synced: members.length, created, updated });
  } catch (e: any) {
    console.error('[bot] sync-members error:', e?.message);
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// ── POST /api/bot/classes ─────────────────────────────────────────────────────
// Bot creates a new class group discovered from Google Calendar.
// Body: { name, subject, google_calendar_id, discord_channel_id?, discord_role_id?, year_level?, description? }

botRouter.post('/classes', async (req, res) => {
  try {
    const {
      name, subject, google_calendar_id,
      discord_channel_id, discord_role_id,
      year_level, description,
    } = req.body as {
      name: string; subject: string; google_calendar_id: string;
      discord_channel_id?: string; discord_role_id?: string;
      year_level?: string; description?: string;
    };

    if (!name || !subject || !google_calendar_id) {
      res.status(400).json({ detail: 'name, subject, google_calendar_id are required' });
      return;
    }

    // Prevent duplicates — idempotent by google_calendar_id
    const existing = await db.classGroup.findFirst({
      where: { google_calendar_id },
    });
    if (existing) {
      res.json({ id: existing.id, created: false, class: existing });
      return;
    }

    const cls = await db.classGroup.create({
      data: {
        name,
        subject,
        google_calendar_id,
        discord_channel_id: discord_channel_id ?? null,
        discord_role_id:    discord_role_id    ?? null,
        year_level:         year_level         ?? null,
        description:        description        ?? null,
        active:             true,
      },
    });

    console.log(`[bot] Auto-created class "${name}" (id=${cls.id}) from Google Calendar ${google_calendar_id}`);
    res.status(201).json({ id: cls.id, created: true, class: cls });
  } catch (e: any) {
    console.error('[bot] create class error:', e?.message);
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// ── GET /api/bot/classes ──────────────────────────────────────────────────────
// Bot fetches the list of active classes so it can match Google Calendar IDs.

botRouter.get('/classes', async (_req, res) => {
  try {
    const classes = await db.classGroup.findMany({
      where:   { active: true },
      select:  {
        id:                true,
        name:              true,
        subject:           true,
        google_calendar_id: true,
        discord_channel_id: true,
        discord_role_id:   true,
        tutor_id:          true,
      },
      orderBy: { name: 'asc' },
    });
    res.json(classes);
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// ── PATCH /api/bot/classes/:id ───────────────────────────────────────────────
// Bot updates Discord channel/role IDs on a class after creating them in Discord.

botRouter.patch('/classes/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { discord_channel_id, discord_role_id } = req.body as {
      discord_channel_id?: string;
      discord_role_id?: string;
    };

    const data: Record<string, any> = {};
    if (discord_channel_id !== undefined) data.discord_channel_id = discord_channel_id;
    if (discord_role_id    !== undefined) data.discord_role_id    = discord_role_id;

    if (!Object.keys(data).length) {
      res.status(400).json({ detail: 'Nothing to update' });
      return;
    }

    const cls = await db.classGroup.update({ where: { id }, data });
    res.json({ id: cls.id, discord_channel_id: cls.discord_channel_id, discord_role_id: cls.discord_role_id });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// ── PATCH /api/bot/classes/:id/set-calendar ───────────────────────────────────
// Bot or admin sets the Google Calendar ID for a class.

botRouter.patch('/classes/:id/set-calendar', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { google_calendar_id } = req.body as { google_calendar_id: string };
    if (!google_calendar_id) {
      res.status(400).json({ detail: 'google_calendar_id is required' });
      return;
    }
    const cls = await db.classGroup.update({
      where: { id },
      data:  { google_calendar_id },
    });
    res.json({ id: cls.id, google_calendar_id: cls.google_calendar_id });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// ── POST /api/bot/sync-lessons ────────────────────────────────────────────────
// Bot pushes lessons parsed from Google Calendar into Supabase.
// Body: { lessons: Array<{ google_event_id, class_id, title, description?, scheduled_at, duration_min, meet_link?, status? }> }

botRouter.post('/sync-lessons', async (req, res) => {
  try {
    const { lessons } = req.body as {
      lessons: Array<{
        google_event_id: string;
        class_id: number;
        title: string;
        description?: string;
        scheduled_at: string;   // ISO string
        duration_min: number;
        meet_link?: string;
        status?: 'scheduled' | 'live' | 'completed' | 'cancelled';
      }>;
    };

    if (!Array.isArray(lessons)) {
      res.status(400).json({ detail: 'lessons array is required' });
      return;
    }

    let created = 0;
    let updated = 0;

    for (const l of lessons) {
      if (!l.google_event_id || !l.class_id || !l.scheduled_at) continue;

      const scheduledAt = new Date(l.scheduled_at);
      const status = (l.status ?? 'scheduled') as any;

      const existing = await db.lesson.findUnique({
        where: { google_event_id: l.google_event_id },
      });

      if (existing) {
        await db.lesson.update({
          where: { google_event_id: l.google_event_id },
          data: {
            title:        l.title,
            description:  l.description ?? existing.description,
            scheduled_at: scheduledAt,
            duration_min: l.duration_min,
            meet_link:    l.meet_link ?? existing.meet_link,
            status,
            updated_at:   new Date(),
          },
        });
        updated++;
      } else {
        await db.lesson.create({
          data: {
            class_id:       l.class_id,
            google_event_id: l.google_event_id,
            title:          l.title,
            description:    l.description ?? null,
            scheduled_at:   scheduledAt,
            duration_min:   l.duration_min,
            meet_link:      l.meet_link ?? null,
            status,
          },
        });
        created++;
      }
    }

    res.json({ synced: lessons.length, created, updated });
  } catch (e: any) {
    console.error('[bot] sync-lessons error:', e?.message);
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// ── POST /api/bot/sync-log ───────────────────────────────────────────────────
// Bot pushes a sync audit record after each scheduled or triggered sync.

botRouter.post('/sync-log', async (req, res) => {
  try {
    const {
      sync_type, source, started_at, completed_at,
      status, records_created, records_updated, records_failed,
      error_message, triggered_by, portal_api_url,
    } = req.body as {
      sync_type:        string;
      source?:          string;
      started_at:       string;
      completed_at?:    string;
      status:           string;
      records_created?: number;
      records_updated?: number;
      records_failed?:  number;
      error_message?:   string;
      triggered_by?:    string;
      portal_api_url?:  string;
    };

    if (!sync_type || !started_at || !status) {
      res.status(400).json({ detail: 'sync_type, started_at, and status are required' });
      return;
    }

    const log = await db.botSyncLog.create({
      data: {
        sync_type,
        source:          source          ?? 'scheduled',
        started_at:      new Date(started_at),
        completed_at:    completed_at    ? new Date(completed_at) : null,
        status,
        records_created: records_created ?? 0,
        records_updated: records_updated ?? 0,
        records_failed:  records_failed  ?? 0,
        error_message:   error_message   ?? null,
        triggered_by:    triggered_by    ?? null,
        portal_api_url:  portal_api_url  ?? null,
      },
    });

    const errSuffix = (status === 'failed' && error_message) ? ` | error: ${error_message}` : '';
    console.log(`[bot] sync-log: ${sync_type} ${status} created=${records_created ?? 0} updated=${records_updated ?? 0}${errSuffix}`);
    res.status(201).json({ id: log.id });
  } catch (e: any) {
    console.error('[bot] sync-log error:', e?.message);
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
