/**
 * Calendar router — /api/admin/calendar
 *
 * GET /calendar/events   — Google Calendar events for the given date range
 *
 * Uses the same OAuth2 refresh-token credentials as the Discord bot.
 * Required env vars:
 *   GOOGLE_CLIENT_ID
 *   GOOGLE_CLIENT_SECRET
 *   GOOGLE_REFRESH_TOKEN
 *   GOOGLE_CALENDAR_ID  (defaults to 'primary')
 */

import { Router } from 'express';
import { google } from 'googleapis';
import { requireAdmin } from '../../auth/middleware';

export const calendarRouter = Router();

// ---------------------------------------------------------------------------
// Build an authorised Google Calendar client using the refresh-token flow.
// Returns null (and logs a warning) when credentials are absent.
// ---------------------------------------------------------------------------

function getCalendarClient() {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN } = process.env;

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REFRESH_TOKEN) {
    return null;
  }

  const auth = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET);
  auth.setCredentials({ refresh_token: GOOGLE_REFRESH_TOKEN });
  return google.calendar({ version: 'v3', auth });
}

// ---------------------------------------------------------------------------
// GET /events
// ---------------------------------------------------------------------------

calendarRouter.get('/events', requireAdmin, async (req, res) => {
  const { start, end } = req.query as { start?: string; end?: string };

  const calendar = getCalendarClient();

  if (!calendar) {
    // Credentials not configured — return empty so the frontend degrades
    // gracefully (DB lessons still appear via the portal lessons endpoint).
    console.warn('[calendar] GOOGLE_CLIENT_ID / SECRET / REFRESH_TOKEN not set — skipping GCal fetch');
    res.json([]);
    return;
  }

  try {
    const calendarId = process.env.GOOGLE_CALENDAR_ID ?? 'primary';

    const response = await calendar.events.list({
      calendarId,
      timeMin:      start ?? new Date().toISOString(),
      timeMax:      end   ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      singleEvents: true,
      orderBy:      'startTime',
      maxResults:   250,
    });

    const items = response.data.items ?? [];

    const events = items.map((ev) => {
      // Normalise start/end — Google returns either dateTime or date (all-day)
      const rawStart = ev.start?.dateTime ?? ev.start?.date ?? '';
      const rawEnd   = ev.end?.dateTime   ?? ev.end?.date   ?? rawStart;

      // For all-day events (date-only strings like "2026-05-28"), append
      // explicit Sydney midnight so Date parsing uses the correct local day
      // instead of UTC midnight which can roll into the wrong calendar date
      // for users in +10/+11 timezones.
      const toISO = (s: string) =>
        /^\d{4}-\d{2}-\d{2}$/.test(s) ? `${s}T00:00:00+10:00` : s;

      // Google Meet link
      let meetLink: string | null = null;
      const conf = ev.conferenceData;
      if (conf) {
        for (const ep of conf.entryPoints ?? []) {
          if (ep.entryPointType === 'video' && ep.uri) {
            meetLink = ep.uri;
            break;
          }
        }
      }

      return {
        google_event_id: ev.id ?? '',
        title:           ev.summary ?? '(No title)',
        start:           toISO(rawStart),
        end:             toISO(rawEnd),
        location:        ev.location ?? null,
        description:     ev.description ?? null,
        html_link:       ev.htmlLink ?? null,
        meet_link:       meetLink,
      };
    });

    res.json(events);
  } catch (e: any) {
    console.error('[calendar] GCal API error:', e?.message);
    res.status(500).json({ detail: e?.message ?? 'Failed to fetch Google Calendar events' });
  }
});
