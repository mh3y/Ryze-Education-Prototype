/**
 * Calendar router — /api/admin/calendar
 *
 * GET /calendar/events   — Google Calendar events across ALL visible calendars
 *
 * Fetches from every calendar in the account's calendar list (not just primary).
 * This ensures class-specific calendars (e.g. "Year 7", "Year 9 Ext Maths")
 * are included alongside personal/primary events.
 *
 * Required env vars:
 *   GOOGLE_CLIENT_ID
 *   GOOGLE_CLIENT_SECRET
 *   GOOGLE_REFRESH_TOKEN
 *
 * Optional:
 *   GOOGLE_CALENDAR_IDS  — comma-separated list to restrict which calendars are
 *                          fetched (defaults to ALL calendars in the account)
 */

import { Router } from 'express';
import { google } from 'googleapis';
import { requireAdmin } from '../../auth/middleware';
import { sydneyDayBounds } from '../../utils/timezone';

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
// Normalise a Google Calendar event time field → ISO string.
// For all-day events (date-only strings like "2026-05-28"), resolve the
// correct Sydney midnight UTC timestamp so the event lands on the right
// calendar day for both AEST (+10:00) and AEDT (+11:00, Oct–Apr).
// The former implementation hardcoded +10:00 and was 1h wrong during AEDT.
// ---------------------------------------------------------------------------

function toISO(s: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  return sydneyDayBounds(0, s).start.toISOString();
}

// ---------------------------------------------------------------------------
// Shape an event item from the Google API into our response format
// ---------------------------------------------------------------------------

function mapEvent(ev: any, calendarName?: string) {
  const rawStart = ev.start?.dateTime ?? ev.start?.date ?? '';
  const rawEnd   = ev.end?.dateTime   ?? ev.end?.date   ?? rawStart;

  // Extract Google Meet link from conferenceData
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
    calendar_name:   calendarName ?? null,
  };
}

// ---------------------------------------------------------------------------
// GET /events
// Fetches from all visible calendars and merges results (deduplicated by ID).
// ---------------------------------------------------------------------------

calendarRouter.get('/events', requireAdmin, async (req, res) => {
  const { start, end } = req.query as { start?: string; end?: string };

  const calendar = getCalendarClient();

  if (!calendar) {
    console.warn('[calendar] GOOGLE_CLIENT_ID / SECRET / REFRESH_TOKEN not set — skipping GCal fetch');
    res.json([]);
    return;
  }

  const timeMin = start ?? new Date().toISOString();
  const timeMax = end   ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  try {
    // ── Step 1: get the list of all calendars visible to the account ──────────
    let calendarIds: { id: string; name: string }[] = [];

    // If a specific override list is configured, use it; otherwise list all
    const override = process.env.GOOGLE_CALENDAR_IDS;
    if (override) {
      calendarIds = override.split(',').map((id) => ({ id: id.trim(), name: id.trim() }));
    } else {
      try {
        const listResp = await calendar.calendarList.list({ showHidden: false });
        calendarIds = (listResp.data.items ?? []).map((c) => ({
          id:   c.id ?? '',
          name: c.summary ?? c.id ?? '',
        })).filter((c) => c.id);
      } catch (listErr: any) {
        // If listing fails, fall back to just the primary (or GOOGLE_CALENDAR_ID)
        console.warn('[calendar] calendarList.list failed, falling back to primary:', listErr?.message);
        calendarIds = [{ id: process.env.GOOGLE_CALENDAR_ID ?? 'primary', name: 'primary' }];
      }
    }

    // ── Step 2: fetch events from each calendar in parallel ───────────────────
    const seen = new Set<string>();
    const allEvents: ReturnType<typeof mapEvent>[] = [];

    await Promise.allSettled(
      calendarIds.map(async ({ id, name }) => {
        try {
          const resp = await calendar.events.list({
            calendarId:   id,
            timeMin,
            timeMax,
            singleEvents: true,
            orderBy:      'startTime',
            maxResults:   250,
          });

          for (const ev of resp.data.items ?? []) {
            if (!ev.id || seen.has(ev.id)) continue;
            seen.add(ev.id);
            allEvents.push(mapEvent(ev, name));
          }
        } catch (calErr: any) {
          // Skip calendars we can't read (e.g. write-only or access-restricted)
          console.warn(`[calendar] Skipping calendar "${name}" (${id}): ${calErr?.message}`);
        }
      }),
    );

    // Sort by start time
    allEvents.sort((a, b) => a.start.localeCompare(b.start));

    console.log(`[calendar] Fetched ${allEvents.length} event(s) from ${calendarIds.length} calendar(s)`);
    res.json(allEvents);
  } catch (e: any) {
    console.error('[calendar] GCal API error:', e?.message);
    res.status(500).json({ detail: e?.message ?? 'Failed to fetch Google Calendar events' });
  }
});
