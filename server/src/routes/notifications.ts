/**
 * /api/notifications — in-app notification feed
 *
 * Supports both user (Discord) and parent sessions.
 *
 * Routes:
 *   GET    /                  list last 50 notifications for current principal
 *   GET    /unread-count      cheap count of unread notifications (for badge polling)
 *   PATCH  /read-all          mark every unread notification as read
 *   PATCH  /:id/read          mark a single notification as read
 *   POST   /generate          (admin only) run all notification generators
 */

import { Router } from 'express';
import { db } from '../prisma';
import { requireAuth, requireAdminOnly } from '../auth/middleware';
import { generateAll } from '../services/notificationService';

export const notificationsRouter = Router();
notificationsRouter.use(requireAuth);

// ── GET /api/notifications ────────────────────────────────────────────────────

notificationsRouter.get('/', async (req, res) => {
  try {
    const p      = req.jwtPayload!;
    const where: any = {};

    if (p.role === 'parent' && p.parent_profile_id) {
      where.parent_id = p.parent_profile_id;
    } else if (p.user_id) {
      where.user_id = p.user_id;
    } else {
      res.json([]);
      return;
    }

    const notifs = await db.notification.findMany({
      where,
      orderBy: { created_at: 'desc' },
      take: 50,
    });

    res.json(notifs.map((n: any) => ({
      id:         String(n.id),
      type:       n.type,
      title:      n.title,
      body:       n.body ?? '',
      read:       n.read,
      created_at: n.created_at instanceof Date ? n.created_at.toISOString() : n.created_at,
      href:       (n.data as any)?.href ?? null,
    })));
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// ── GET /api/notifications/unread-count ──────────────────────────────────────
// Lightweight endpoint polled by the topbar bell badge every 30 s.
// Returns { count: N } without fetching the full notification list.

notificationsRouter.get('/unread-count', async (req, res) => {
  try {
    const p     = req.jwtPayload!;
    const where: any = { read: false };

    if (p.role === 'parent' && p.parent_profile_id) {
      where.parent_id = p.parent_profile_id;
    } else if (p.user_id) {
      where.user_id = p.user_id;
    } else {
      res.json({ count: 0 });
      return;
    }

    const count = await db.notification.count({ where });
    res.json({ count });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// ── POST /api/notifications/generate ─────────────────────────────────────────
// Admin-only: run all five notification generators and return counts.
// Safe to call repeatedly — generators are idempotent via dedup windows.

notificationsRouter.post('/generate', requireAdminOnly, async (_req, res) => {
  try {
    const result = await generateAll();
    res.json(result);
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// ── POST /api/notifications/generate-cron ─────────────────────────────────────
// Accepts a static CRON_SECRET bearer token instead of a user JWT.
// Intended for GitHub Actions / external schedulers that cannot hold a session.
// Set CRON_SECRET to a strong random string in server .env (same pattern as
// BOT_API_SECRET).  If CRON_SECRET is not set this endpoint returns 501.

notificationsRouter.post('/generate-cron', async (req, res) => {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    res.status(501).json({ detail: 'CRON_SECRET not configured' });
    return;
  }
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ') || header.slice(7) !== cronSecret) {
    res.status(401).json({ detail: 'Invalid cron secret' });
    return;
  }
  try {
    const result = await generateAll();
    console.log('[notify-cron] external trigger →', result);
    res.json(result);
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// ── PATCH /api/notifications/:id/read ────────────────────────────────────────

notificationsRouter.patch('/:id/read', async (req, res) => {
  try {
    const p  = req.jwtPayload!;
    const id = Number(req.params.id);

    // Build ownership filter so users can only mark their own notifications as read
    const ownerFilter: any = {};
    if (p.role === 'parent' && p.parent_profile_id) {
      ownerFilter.parent_id = p.parent_profile_id;
    } else if (p.user_id) {
      ownerFilter.user_id = p.user_id;
    }

    const result = await db.notification.updateMany({
      where: { id, ...ownerFilter },
      data:  { read: true, read_at: new Date() },
    });

    if (result.count === 0) {
      res.status(404).json({ detail: 'Notification not found' });
      return;
    }
    res.json({ updated: true });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// ── PATCH /api/notifications/read-all ────────────────────────────────────────

notificationsRouter.patch('/read-all', async (req, res) => {
  try {
    const p     = req.jwtPayload!;
    const where: any = { read: false };

    if (p.role === 'parent' && p.parent_profile_id) {
      where.parent_id = p.parent_profile_id;
    } else if (p.user_id) {
      where.user_id = p.user_id;
    }

    const result = await db.notification.updateMany({
      where,
      data: { read: true, read_at: new Date() },
    });
    res.json({ updated: result.count });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// ── Utility exported for use from other routes ────────────────────────────────

export async function createNotification(opts: {
  user_id?:   number;
  parent_id?: number;
  type:       string;
  title:      string;
  body?:      string;
  href?:      string;
  channel?:   string;
}): Promise<void> {
  try {
    await db.notification.create({
      data: {
        user_id:   opts.user_id   ?? null,
        parent_id: opts.parent_id ?? null,
        type:      opts.type,
        title:     opts.title,
        body:      opts.body  ?? null,
        data:      opts.href  ? { href: opts.href } : undefined,
        channel:   opts.channel ?? 'in_app',
        sent_at:   new Date(),
      },
    });
  } catch { /* non-critical — don't crash the caller if notification fails */ }
}
