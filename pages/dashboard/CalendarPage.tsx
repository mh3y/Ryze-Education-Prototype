/**
 * CalendarPage.tsx
 *
 * Unified calendar for all roles.  Shows every event category in one grid
 * while letting the user toggle visibility per category.
 *
 * Event categories
 * ────────────────
 *  lessons       amber   — fetched from API (parent → parentApi, others → portalApi)
 *  tutor-meets   emerald — placeholder until tutor-meet endpoint exists
 *  meetings      blue    — placeholder until business-meeting endpoint exists
 *  other         slate   — placeholder for miscellaneous events
 *
 * Route: /dashboard/calendar
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronLeft, ChevronRight, CalendarDays, Video,
  MapPin, X, Filter, CheckCircle, Users, Briefcase,
  BookOpen, Clock, Link2, AlertCircle, RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { parentApi, ChildLesson } from '../../services/parentApi';
import { portalApi, Lesson } from '../../services/portalApi';
import { LoadingState, ErrorState } from '../../components/dashboard/ui';

// ---------------------------------------------------------------------------
// Google Calendar — type shims & helpers
// ---------------------------------------------------------------------------

const GCAL_SCOPE = 'https://www.googleapis.com/auth/calendar.readonly';
const GCAL_TOKEN_KEY = 'ryze_gcal_token';
const GCAL_EMAIL_KEY = 'ryze_gcal_email';

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token?: string; error?: string }) => void;
          }) => { requestAccessToken: (opts?: { prompt?: string }) => void };
        };
      };
    };
  }
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement('script');
    s.src = src; s.async = true; s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.body.appendChild(s);
  });
}

interface GoogleCalendarEvent {
  id: string;
  summary?: string;
  start: { dateTime?: string; date?: string };
  end?:   { dateTime?: string; date?: string };
  location?: string;
  hangoutLink?: string;
  conferenceData?: { entryPoints?: { entryPointType: string; uri: string }[] };
  status?: string;
}

function gcalEventToCalendarEvent(item: GoogleCalendarEvent): CalendarEvent {
  return {
    id:       `gcal-${item.id}`,
    title:    item.summary ?? '(No title)',
    category: 'other' as const,
    start:    item.start.dateTime
      ? new Date(item.start.dateTime)
      : new Date((item.start.date ?? '') + 'T00:00:00'),
    end: item.end?.dateTime
      ? new Date(item.end.dateTime)
      : item.end?.date
      ? new Date(item.end.date + 'T23:59:59')
      : undefined,
    location:  item.location,
    meetLink:  item.hangoutLink ??
               item.conferenceData?.entryPoints?.find(
                 (e) => e.entryPointType === 'video',
               )?.uri,
    status:    item.status,
    subtitle:  'Google Calendar',
  };
}

// ---------------------------------------------------------------------------
// GoogleCalendarBanner — connection strip
// ---------------------------------------------------------------------------

type GcalState = 'idle' | 'connecting' | 'connected' | 'error' | 'no-client-id';

const GoogleCalendarBanner: React.FC<{
  gcalState:    GcalState;
  gcalEmail:    string | null;
  gcalCount:    number;
  onConnect:    () => void;
  onDisconnect: () => void;
  onRefresh:    () => void;
}> = ({ gcalState, gcalEmail, gcalCount, onConnect, onDisconnect, onRefresh }) => {
  const GOOGLE_CLIENT_ID = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID ?? '';

  const isConnected = gcalState === 'connected';

  return (
    <div style={{
      display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 12,
      padding: '12px 18px',
      background: isConnected
        ? 'color-mix(in oklab, var(--ok) 8%, var(--bg-surface))'
        : 'var(--bg-surface)',
      border: `1px solid ${isConnected
        ? 'color-mix(in oklab, var(--ok) 22%, transparent)'
        : 'var(--border-soft)'}`,
      borderRadius: 12,
    }}>
      {/* Google logo */}
      <svg width="18" height="18" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>

      {/* Status text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {gcalState === 'no-client-id' || !GOOGLE_CLIENT_ID ? (
          <span style={{ fontSize: 13, color: 'var(--fg-muted)' }}>
            Google Calendar sync requires{' '}
            <code style={{ fontSize: 11, background: 'var(--bg-surface-2)', padding: '1px 5px', borderRadius: 4, border: '1px solid var(--border-soft)' }}>
              VITE_GOOGLE_CLIENT_ID
            </code>{' '}
            to be configured in environment.
          </span>
        ) : isConnected ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 7, height: 7, borderRadius: 999, background: 'var(--ok)', display: 'inline-block', flexShrink: 0 }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-strong)' }}>
              Google Calendar connected
            </span>
            {gcalEmail && (
              <span style={{ fontSize: 12, color: 'var(--fg-muted)' }}>· {gcalEmail}</span>
            )}
            {gcalCount > 0 && (
              <span style={{
                fontSize: 11, fontWeight: 700,
                padding: '1px 7px', borderRadius: 999,
                background: 'color-mix(in oklab, var(--ok) 14%, transparent)',
                color: 'var(--ok)',
                border: '1px solid color-mix(in oklab, var(--ok) 28%, transparent)',
              }}>
                {gcalCount} event{gcalCount !== 1 ? 's' : ''} synced
              </span>
            )}
          </div>
        ) : gcalState === 'error' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--danger)' }}>
            <AlertCircle size={13} />
            Connection failed. Try again.
          </div>
        ) : gcalState === 'connecting' ? (
          <span style={{ fontSize: 13, color: 'var(--fg-muted)' }}>Connecting…</span>
        ) : (
          <span style={{ fontSize: 13, color: 'var(--fg-muted)' }}>
            Sync your Google Calendar to see all events in one view.
          </span>
        )}
      </div>

      {/* Action buttons */}
      {GOOGLE_CLIENT_ID && (
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          {isConnected && (
            <>
              <button
                onClick={onRefresh}
                style={{
                  height: 30, padding: '0 10px', borderRadius: 7,
                  display: 'flex', alignItems: 'center', gap: 5,
                  fontSize: 12, fontWeight: 600,
                  background: 'transparent',
                  color: 'var(--fg-muted)',
                  border: '1px solid var(--border-soft)', cursor: 'pointer',
                  transition: 'all 120ms ease',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.color = 'var(--fg-strong)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-strong)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color = 'var(--fg-muted)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-soft)';
                }}
              >
                <RefreshCw size={11} /> Sync
              </button>
              <button
                onClick={onDisconnect}
                style={{
                  height: 30, padding: '0 10px', borderRadius: 7,
                  fontSize: 12, fontWeight: 600,
                  background: 'transparent',
                  color: 'var(--fg-muted)',
                  border: '1px solid var(--border-soft)', cursor: 'pointer',
                  transition: 'all 120ms ease',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.color = 'var(--danger)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'color-mix(in oklab, var(--danger) 40%, transparent)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color = 'var(--fg-muted)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-soft)';
                }}
              >
                Disconnect
              </button>
            </>
          )}
          {!isConnected && gcalState !== 'no-client-id' && (
            <button
              onClick={onConnect}
              disabled={gcalState === 'connecting'}
              style={{
                height: 30, padding: '0 14px', borderRadius: 7,
                display: 'flex', alignItems: 'center', gap: 6,
                fontSize: 12.5, fontWeight: 700,
                background: gcalState === 'connecting' ? 'var(--bg-hover)' : 'var(--accent)',
                color: gcalState === 'connecting' ? 'var(--fg-muted)' : 'var(--accent-fg)',
                border: 'none', cursor: gcalState === 'connecting' ? 'default' : 'pointer',
                transition: 'all 120ms ease',
                boxShadow: gcalState === 'connecting' ? 'none' : '0 3px 10px -4px color-mix(in oklab, var(--accent) 55%, transparent)',
              }}
            >
              <Link2 size={11} />
              {gcalState === 'connecting' ? 'Connecting…' : 'Connect Google Calendar'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Event model
// ---------------------------------------------------------------------------

export type EventCategory = 'lesson' | 'tutor-meet' | 'meeting' | 'other';

export interface CalendarEvent {
  id: string;
  title: string;
  category: EventCategory;
  start: Date;
  end?: Date;
  location?: string;
  meetLink?: string;
  status?: string;
  /** Extra label shown below the title (e.g. child name for parents) */
  subtitle?: string;
}

// ---------------------------------------------------------------------------
// Category config (colour + label)
// ---------------------------------------------------------------------------

const CATEGORY_CONFIG: Record<
  EventCategory,
  { label: string; color: string; bg: string; border: string; icon: React.ElementType }
> = {
  lesson: {
    label: 'Lessons',
    color: 'text-[#FFB000]',
    bg: 'bg-[#FFB000]/15',
    border: 'border-[#FFB000]/30',
    icon: BookOpen,
  },
  'tutor-meet': {
    label: 'Tutor Meets',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/15',
    border: 'border-emerald-500/30',
    icon: Users,
  },
  meeting: {
    label: 'Meetings',
    color: 'text-blue-400',
    bg: 'bg-blue-500/15',
    border: 'border-blue-500/30',
    icon: Briefcase,
  },
  other: {
    label: 'Other',
    color: 'ryze-text-muted',
    bg: 'bg-slate-500/15',
    border: 'border-slate-500/30',
    icon: CalendarDays,
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth()    === b.getMonth()    &&
    a.getDate()     === b.getDate()
  );
}

function startOfMonth(year: number, month: number): Date {
  return new Date(year, month, 1);
}

function endOfMonth(year: number, month: number): Date {
  return new Date(year, month + 1, 0);
}

/** Returns grid cells: leading nulls + day numbers */
function buildGrid(year: number, month: number): (number | null)[] {
  const first = startOfMonth(year, month).getDay(); // 0 = Sun
  const last  = endOfMonth(year, month).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < first; i++) cells.push(null);
  for (let d = 1; d <= last; d++) cells.push(d);
  return cells;
}

function formatTime(iso: string | null | undefined): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleTimeString('en-AU', {
      hour: '2-digit', minute: '2-digit', hour12: true,
    });
  } catch { return ''; }
}

function formatFullDate(d: Date): string {
  return d.toLocaleDateString('en-AU', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

// ---------------------------------------------------------------------------
// Convert API data → CalendarEvent[]
// ---------------------------------------------------------------------------

function parentLessonsToEvents(lessons: ChildLesson[], childName: string): CalendarEvent[] {
  return lessons.map((ls) => ({
    id:       `lesson-${ls.id}-${childName}`,
    title:    ls.title,
    category: 'lesson' as EventCategory,
    start:    new Date(ls.start_time),
    end:      ls.end_time ? new Date(ls.end_time) : undefined,
    location: ls.location ?? undefined,
    meetLink: ls.meet_link ?? undefined,
    status:   ls.status,
    subtitle: childName,
  }));
}

function portalLessonsToEvents(lessons: Lesson[]): CalendarEvent[] {
  return lessons.map((ls) => ({
    id:       `lesson-${ls.id}`,
    title:    ls.title,
    category: 'lesson' as EventCategory,
    start:    new Date(ls.start_time),
    end:      new Date(ls.end_time),
    location: ls.location ?? undefined,
    meetLink: ls.meet_link ?? undefined,
    status:   ls.status,
    subtitle: ls.class_group_name,
  }));
}

// ---------------------------------------------------------------------------
// Detail popover component
// ---------------------------------------------------------------------------

interface EventDetailProps {
  event: CalendarEvent;
  onClose: () => void;
}

const EventDetail: React.FC<EventDetailProps> = ({ event, onClose }) => {
  const cfg  = CATEGORY_CONFIG[event.category];
  const Icon = cfg.icon;
  const ref  = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        ref={ref}
        className="bg-[#0a0f1e] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest ${cfg.color}`}>
            <Icon size={13} />
            {cfg.label}
          </div>
          <button
            onClick={onClose}
            className="ryze-text-muted hover:ryze-text-inverse transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <h3 className="font-bold ryze-text-inverse text-lg leading-tight mb-1">{event.title}</h3>
        {event.subtitle && (
          <p className="text-xs ryze-text-muted mb-4">{event.subtitle}</p>
        )}

        <div className="space-y-2 text-sm">
          {/* Date */}
          <div className="flex items-start gap-2 ryze-text-muted">
            <CalendarDays size={14} className="mt-0.5 shrink-0" />
            <span>{formatFullDate(event.start)}</span>
          </div>

          {/* Time */}
          {(formatTime(event.start.toISOString()) || (event.end && formatTime(event.end.toISOString()))) && (
            <div className="flex items-center gap-2 ryze-text-muted">
              <Clock size={14} className="shrink-0" />
              <span>
                {formatTime(event.start.toISOString())}
                {event.end && ` – ${formatTime(event.end.toISOString())}`}
              </span>
            </div>
          )}

          {/* Location */}
          {event.location && (
            <div className="flex items-center gap-2 ryze-text-muted">
              <MapPin size={14} className="shrink-0" />
              <span>{event.location}</span>
            </div>
          )}

          {/* Status */}
          {event.status && (
            <div className="flex items-center gap-2">
              <CheckCircle size={14} className={`shrink-0 ${cfg.color}`} />
              <span className={`capitalize ${cfg.color} font-semibold text-xs`}>
                {event.status.replace(/_/g, ' ')}
              </span>
            </div>
          )}
        </div>

        {/* Join link */}
        {event.meetLink && (
          <a
            href={event.meetLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-[#FFB000] text-[#0a0f1e] font-bold text-sm hover:bg-[#ffc133] transition-colors"
          >
            <Video size={15} />
            Join Session
          </a>
        )}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Category filter toggle
// ---------------------------------------------------------------------------

const CategoryToggle: React.FC<{
  category: EventCategory;
  active: boolean;
  count: number;
  onToggle: () => void;
}> = ({ category, active, count, onToggle }) => {
  const cfg  = CATEGORY_CONFIG[category];
  const Icon = cfg.icon;
  return (
    <button
      onClick={onToggle}
      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
        active
          ? `${cfg.bg} ${cfg.border} ${cfg.color}`
          : 'bg-transparent border-white/10 ryze-text-muted opacity-50 hover:opacity-75'
      }`}
    >
      <Icon size={12} />
      {cfg.label}
      {count > 0 && (
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
          active ? `${cfg.bg} ${cfg.color}` : 'bg-white/10'
        }`}>
          {count}
        </span>
      )}
    </button>
  );
};

// ---------------------------------------------------------------------------
// Day cell
// ---------------------------------------------------------------------------

const MAX_VISIBLE_EVENTS = 3;

const DayCell: React.FC<{
  day: number;
  year: number;
  month: number;
  events: CalendarEvent[];
  isToday: boolean;
  onEventClick: (e: CalendarEvent) => void;
}> = ({ day, year, month, events, isToday, onEventClick }) => {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? events : events.slice(0, MAX_VISIBLE_EVENTS);
  const overflow = events.length - MAX_VISIBLE_EVENTS;

  return (
    <div
      className={`min-h-[90px] md:min-h-[110px] p-1.5 md:p-2 rounded-xl border transition-colors ${
        isToday
          ? 'border-[#FFB000]/40 bg-[#FFB000]/5'
          : 'border-white/5 bg-white/[0.015] hover:bg-white/[0.03]'
      }`}
    >
      {/* Day number */}
      <div className={`text-xs font-bold mb-1.5 w-6 h-6 flex items-center justify-center rounded-full ${
        isToday
          ? 'bg-[#FFB000] text-[#0a0f1e]'
          : 'ryze-text-muted'
      }`}>
        {day}
      </div>

      {/* Event chips */}
      <div className="space-y-0.5">
        {visible.map((ev) => {
          const cfg = CATEGORY_CONFIG[ev.category];
          return (
            <button
              key={ev.id}
              onClick={() => onEventClick(ev)}
              className={`w-full text-left px-1.5 py-0.5 rounded-md text-[10px] font-semibold truncate transition-opacity hover:opacity-80 ${cfg.bg} ${cfg.color} border ${cfg.border}`}
              title={ev.title}
            >
              {ev.title}
            </button>
          );
        })}

        {!showAll && overflow > 0 && (
          <button
            onClick={(e) => { e.stopPropagation(); setShowAll(true); }}
            className="w-full text-left text-[10px] ryze-text-muted px-1.5 py-0.5 hover:ryze-text-inverse transition-colors"
          >
            +{overflow} more
          </button>
        )}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Main CalendarPage
// ---------------------------------------------------------------------------

const CalendarPage: React.FC = () => {
  const { user } = useAuth();
  const today     = useMemo(() => new Date(), []);

  const [year,  setYear]  = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const [allEvents,  setAllEvents]  = useState<CalendarEvent[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);

  // Which categories are currently visible
  const [activeCategories, setActiveCategories] = useState<Set<EventCategory>>(
    new Set(['lesson', 'tutor-meet', 'meeting', 'other']),
  );

  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // ── Google Calendar state ──────────────────────────────────────────────────

  const GOOGLE_CLIENT_ID = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID ?? '';
  const [gcalState,  setGcalState]  = useState<GcalState>(
    GOOGLE_CLIENT_ID ? 'idle' : 'no-client-id',
  );
  const [gcalEmail,  setGcalEmail]  = useState<string | null>(
    () => sessionStorage.getItem(GCAL_EMAIL_KEY),
  );
  const [gcalEvents, setGcalEvents] = useState<CalendarEvent[]>([]);
  const tokenClientRef = useRef<{ requestAccessToken: (opts?: { prompt?: string }) => void } | null>(null);

  const fetchGCalEventsForRange = useCallback(async (token: string, y: number, m: number) => {
    const timeMin = new Date(y, m, 1).toISOString();
    const timeMax = new Date(y, m + 1, 0, 23, 59, 59).toISOString();
    try {
      const res = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
        `timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}` +
        `&singleEvents=true&orderBy=startTime&maxResults=150`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (res.status === 401) {
        // Token expired — need re-auth
        setGcalState('idle');
        setGcalEvents([]);
        sessionStorage.removeItem(GCAL_TOKEN_KEY);
        sessionStorage.removeItem(GCAL_EMAIL_KEY);
        return;
      }
      if (!res.ok) throw new Error(res.statusText);
      const data = await res.json();
      const events = (data.items ?? [] as GoogleCalendarEvent[]).map(gcalEventToCalendarEvent);
      setGcalEvents(events);
      sessionStorage.setItem(GCAL_TOKEN_KEY, token);
      setGcalState('connected');
    } catch {
      setGcalEvents([]);
    }
  }, []);

  const initTokenClient = useCallback((clientId: string) => {
    if (!window.google?.accounts?.oauth2) return;
    tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: GCAL_SCOPE,
      callback: async (response) => {
        if (response.error || !response.access_token) {
          setGcalState('error');
          return;
        }
        setGcalState('connected');
        // Fetch user email
        try {
          const ui = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${response.access_token}` },
          });
          if (ui.ok) {
            const ud = await ui.json();
            setGcalEmail(ud.email ?? null);
            if (ud.email) sessionStorage.setItem(GCAL_EMAIL_KEY, ud.email);
          }
        } catch { /* ignore */ }
        fetchGCalEventsForRange(response.access_token, year, month);
      },
    });
    // Restore from session
    const stored = sessionStorage.getItem(GCAL_TOKEN_KEY);
    if (stored) {
      setGcalState('connected');
      fetchGCalEventsForRange(stored, year, month);
    }
  }, [fetchGCalEventsForRange, year, month]);

  // Load GIS on mount if client ID is available
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    if (window.google?.accounts?.oauth2) {
      initTokenClient(GOOGLE_CLIENT_ID);
      return;
    }
    loadScript('https://accounts.google.com/gsi/client')
      .then(() => initTokenClient(GOOGLE_CLIENT_ID))
      .catch(() => setGcalState('error'));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [GOOGLE_CLIENT_ID]);

  // Re-fetch gcal events when month/year changes
  useEffect(() => {
    const stored = sessionStorage.getItem(GCAL_TOKEN_KEY);
    if (stored && gcalState === 'connected') {
      fetchGCalEventsForRange(stored, year, month);
    }
  }, [year, month, gcalState, fetchGCalEventsForRange]);

  const handleGcalConnect = () => {
    if (!tokenClientRef.current) return;
    setGcalState('connecting');
    tokenClientRef.current.requestAccessToken({ prompt: '' });
  };

  const handleGcalDisconnect = () => {
    setGcalState('idle');
    setGcalEvents([]);
    setGcalEmail(null);
    sessionStorage.removeItem(GCAL_TOKEN_KEY);
    sessionStorage.removeItem(GCAL_EMAIL_KEY);
  };

  const handleGcalRefresh = () => {
    const stored = sessionStorage.getItem(GCAL_TOKEN_KEY);
    if (stored) fetchGCalEventsForRange(stored, year, month);
  };

  // ── Fetch data ────────────────────────────────────────────────────────────

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let events: CalendarEvent[] = [];

      if (user?.role === 'parent') {
        const data = await parentApi.getPortal();
        data.children.forEach((child) => {
          events.push(...parentLessonsToEvents(child.upcoming_lessons, child.student.full_name));
        });
      } else {
        // admin / tutor / student — fetch lessons from portalApi (large window)
        const res = await portalApi.getLessons({ limit: 200 });
        events = portalLessonsToEvents(res.items);
      }

      setAllEvents(events);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load calendar data.');
    } finally {
      setLoading(false);
    }
  }, [user?.role]);

  useEffect(() => { load(); }, [load]);

  // ── Derived state ─────────────────────────────────────────────────────────

  // Merge internal events with Google Calendar events
  const mergedEvents = useMemo(
    () => [...allEvents, ...gcalEvents],
    [allEvents, gcalEvents],
  );

  const filteredEvents = useMemo(
    () => mergedEvents.filter((ev) => activeCategories.has(ev.category)),
    [mergedEvents, activeCategories],
  );

  /** Count per category across ALL events (not just visible month) */
  const countByCategory = useMemo(() => {
    const counts: Record<EventCategory, number> = {
      lesson: 0, 'tutor-meet': 0, meeting: 0, other: 0,
    };
    mergedEvents.forEach((ev) => { counts[ev.category]++; });
    return counts;
  }, [mergedEvents]);

  /** Events grouped by "YYYY-M-D" key */
  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    filteredEvents.forEach((ev) => {
      const key = `${ev.start.getFullYear()}-${ev.start.getMonth()}-${ev.start.getDate()}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(ev);
    });
    // Sort events within each day by start time
    map.forEach((evs) => evs.sort((a, b) => a.start.getTime() - b.start.getTime()));
    return map;
  }, [filteredEvents]);

  const grid = useMemo(() => buildGrid(year, month), [year, month]);

  // ── Navigation ─────────────────────────────────────────────────────────────

  function prevMonth() {
    if (month === 0) { setYear((y) => y - 1); setMonth(11); }
    else             { setMonth((m) => m - 1); }
  }

  function nextMonth() {
    if (month === 11) { setYear((y) => y + 1); setMonth(0); }
    else              { setMonth((m) => m + 1); }
  }

  function goToday() {
    setYear(today.getFullYear());
    setMonth(today.getMonth());
  }

  // ── Category toggle ────────────────────────────────────────────────────────

  function toggleCategory(cat: EventCategory) {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else               next.add(cat);
      return next;
    });
  }

  // ── Month event count (for header) ─────────────────────────────────────────

  const monthEventCount = useMemo(() => {
    return filteredEvents.filter(
      (ev) => ev.start.getFullYear() === year && ev.start.getMonth() === month,
    ).length;
  }, [filteredEvents, year, month]);

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) return <LoadingState />;
  if (error)   return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="space-y-5">

      {/* ── Page header ── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold ryze-text-inverse">Calendar</h1>
          <p className="text-sm ryze-text-muted mt-0.5">
            View and manage all scheduled events in one place.
          </p>
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs ryze-text-muted flex items-center gap-1 mr-1">
            <Filter size={12} /> Filter:
          </span>
          {(Object.keys(CATEGORY_CONFIG) as EventCategory[]).map((cat) => (
            <CategoryToggle
              key={cat}
              category={cat}
              active={activeCategories.has(cat)}
              count={countByCategory[cat]}
              onToggle={() => toggleCategory(cat)}
            />
          ))}
        </div>
      </div>

      {/* ── Google Calendar sync banner ── */}
      <GoogleCalendarBanner
        gcalState={gcalState}
        gcalEmail={gcalEmail}
        gcalCount={gcalEvents.length}
        onConnect={handleGcalConnect}
        onDisconnect={handleGcalDisconnect}
        onRefresh={handleGcalRefresh}
      />

      {/* ── Calendar card ── */}
      <div className="bg-[#0a0f1e] border border-white/10 rounded-2xl overflow-hidden">

        {/* Month navigation bar */}
        <div className="flex items-center justify-between px-5 md:px-7 py-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <button
              onClick={prevMonth}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 ryze-text-muted hover:ryze-text-inverse transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={nextMonth}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 ryze-text-muted hover:ryze-text-inverse transition-colors"
              aria-label="Next month"
            >
              <ChevronRight size={16} />
            </button>
            <h2 className="text-lg font-bold ryze-text-inverse">
              {MONTH_NAMES[month]} {year}
            </h2>
            {monthEventCount > 0 && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#FFB000]/15 text-[#FFB000]">
                {monthEventCount} event{monthEventCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          <button
            onClick={goToday}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 ryze-text-muted hover:ryze-text-inverse transition-colors"
          >
            Today
          </button>
        </div>

        {/* Day-of-week headers */}
        <div className="grid grid-cols-7 border-b border-white/5">
          {DAY_NAMES.map((d) => (
            <div
              key={d}
              className="text-center text-[10px] font-bold ryze-text-muted uppercase tracking-widest py-2 md:py-3"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1 p-2 md:p-3">
          {grid.map((day, idx) => {
            if (day === null) {
              return <div key={`blank-${idx}`} />;
            }
            const key    = `${year}-${month}-${day}`;
            const dayEvs = eventsByDay.get(key) ?? [];
            const isToday =
              today.getFullYear() === year &&
              today.getMonth()    === month &&
              today.getDate()     === day;

            return (
              <DayCell
                key={key}
                day={day}
                year={year}
                month={month}
                events={dayEvs}
                isToday={isToday}
                onEventClick={setSelectedEvent}
              />
            );
          })}
        </div>
      </div>

      {/* ── Legend ── */}
      <div className="flex flex-wrap gap-4">
        {(Object.entries(CATEGORY_CONFIG) as [EventCategory, typeof CATEGORY_CONFIG[EventCategory]][]).map(
          ([cat, cfg]) => {
            const Icon = cfg.icon;
            return (
              <div key={cat} className={`flex items-center gap-1.5 text-xs ${cfg.color}`}>
                <span className={`w-3 h-3 rounded-sm ${cfg.bg} border ${cfg.border}`} />
                <Icon size={11} />
                {cfg.label}
              </div>
            );
          },
        )}
        {gcalState === 'connected' && gcalEvents.length > 0 && (
          <p className="text-xs ryze-text-muted ml-auto">
            Showing {gcalEvents.length} Google Calendar event{gcalEvents.length !== 1 ? 's' : ''} (shown as Other)
          </p>
        )}
      </div>

      {/* ── Upcoming events list (current month) ── */}
      {(() => {
        const upcoming = filteredEvents
          .filter(
            (ev) =>
              ev.start.getFullYear() === year &&
              ev.start.getMonth()    === month,
          )
          .sort((a, b) => a.start.getTime() - b.start.getTime());

        if (upcoming.length === 0) return null;

        return (
          <div className="bg-[#0a0f1e] border border-white/10 rounded-2xl overflow-hidden">
            <div className="px-5 md:px-7 py-4 border-b border-white/5">
              <h3 className="text-sm font-bold ryze-text-inverse">
                Events this month
              </h3>
            </div>
            <div className="divide-y divide-white/5">
              {upcoming.map((ev) => {
                const cfg  = CATEGORY_CONFIG[ev.category];
                const Icon = cfg.icon;
                return (
                  <button
                    key={ev.id}
                    onClick={() => setSelectedEvent(ev)}
                    className="w-full text-left flex items-start gap-4 px-5 md:px-7 py-4 hover:bg-white/[0.03] transition-colors group"
                  >
                    {/* Category dot */}
                    <div className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${cfg.bg} border ${cfg.border}`}>
                      <Icon size={14} className={cfg.color} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-0.5">
                        <span className="font-semibold ryze-text-inverse text-sm truncate">
                          {ev.title}
                        </span>
                        {ev.subtitle && (
                          <span className="text-xs ryze-text-muted">{ev.subtitle}</span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs ryze-text-muted">
                        <span className="flex items-center gap-1">
                          <CalendarDays size={11} />
                          {ev.start.toLocaleDateString('en-AU', {
                            weekday: 'short', day: 'numeric', month: 'short',
                          })}
                        </span>
                        {formatTime(ev.start.toISOString()) && (
                          <span className="flex items-center gap-1">
                            <Clock size={11} />
                            {formatTime(ev.start.toISOString())}
                            {ev.end && ` – ${formatTime(ev.end.toISOString())}`}
                          </span>
                        )}
                        {ev.location && (
                          <span className="flex items-center gap-1">
                            <MapPin size={11} /> {ev.location}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 flex flex-col items-end gap-1.5">
                      {ev.status && (
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${cfg.color}`}>
                          {ev.status.replace(/_/g, ' ')}
                        </span>
                      )}
                      {ev.meetLink && (
                        <span className="flex items-center gap-1 text-[10px] font-semibold text-[#FFB000] group-hover:text-[#ffc133]">
                          <Video size={10} /> Join
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* ── Event detail popover ── */}
      {selectedEvent && (
        <EventDetail
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
};

export default CalendarPage;
