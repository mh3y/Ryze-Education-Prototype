/**
 * Calendar router — /api/admin/calendar
 *
 * GET /calendar/events   — supplementary Google Calendar events (non-lesson)
 *
 * Currently returns DB lessons that have google_event_id set so the frontend
 * can surface them as "Other" calendar events. Swap the implementation for a
 * real Google Calendar API call once service-account credentials are available.
 */

import { Router } from 'express';
import { db } from '../../prisma';
import { requireAdmin } from '../../auth/middleware';

export const calendarRouter = Router();

// ---------------------------------------------------------------------------
// GET /events
// ---------------------------------------------------------------------------

calendarRouter.get('/events', requireAdmin, async (req, res) => {
  try {
    const { start, end } = req.query as { start?: string; end?: string };

    const where: any = { google_event_id: { not: null } };
    if (start) where.scheduled_at = { ...where.scheduled_at, gte: new Date(start) };
    if (end)   where.scheduled_at = { ...where.scheduled_at, lte: new Date(end) };

    const lessons = await db.lesson.findMany({
      where,
      include: { class: { select: { name: true } } },
      orderBy: { scheduled_at: 'asc' },
    });

    res.json(
      lessons.map((l: any) => ({
        google_event_id: l.google_event_id,
        title: l.title,
        start: l.scheduled_at.toISOString(),
        end: l.duration_min
          ? new Date(l.scheduled_at.getTime() + l.duration_min * 60_000).toISOString()
          : l.scheduled_at.toISOString(),
        location: null,
        description: l.description ?? null,
        html_link: null,
      })),
    );
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});
