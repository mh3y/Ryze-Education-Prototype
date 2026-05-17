/**
 * CalendarPage.tsx
 *
 * Unified calendar for all roles. Shows portal lessons plus any manually-added
 * events from the shared Google Calendar (fetched server-side via service account
 * — no per-user OAuth required).
 *
 * Event categories
 * ────────────────
 *  lessons       amber   — from DB (portal lessons)
 *  tutor-meets   emerald — placeholder
 *  meetings      blue    — placeholder
 *  other         slate   — manually-added Google Calendar events
 *
 * Route: /dashboard/calendar
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronLeft, ChevronRight, CalendarDays, Video,
  MapPin, X, Filter, CheckCircle, Users, Briefcase,
  BookOpen, Clock, RefreshCw, ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { parentApi, ChildLesson } from '../../services/parentApi';
import { portalApi, Lesson } from '../../services/portalApi';
import { adminApi } from '../../services/adminApi';
import { LoadingState, ErrorState } from '../../components/dashboard/ui';

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
  /** Extra label shown below the title */
  subtitle?: string;
  /** Google Calendar web link for manually-added events */
  htmlLink?: string;
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
// Google Calendar sync status banner (no OAuth — purely server-side)
// ---------------------------------------------------------------------------

const GCalSyncBanner: React.FC<{
  gcalCount: number;
  gcalLoading: boolean;
  onRefresh: () => void;
}> = ({ gcalCount, gcalLoading, onRefresh }) => (
  <div style={{
    display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 12,
    padding: '10px 16px',
    background: 'color-mix(in oklab, var(--ok) 6%, var(--bg-surface))',
    border: '1px solid color-mix(in oklab, var(--ok) 20%, transparent)',
    borderRadius: 12,
  }}>
    {/* Google logo */}
    <svg width="16" height="16" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>

    <span style={{ width: 7, height: 7, borderRadius: 999, background: 'var(--ok)', display: 'inline-block', flexShrink: 0 }} />

    <div style={{ flex: 1, minWidth: 0 }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-strong)' }}>
        Google Calendar synced
      </span>
      <span style={{ fontSize: 12, color: 'var(--fg-muted)', marginLeft: 8 }}>
        ryzeeducationhq@gmail.com
      </span>
      {gcalCount > 0 && (
        <span style={{
          marginLeft: 8,
          fontSize: 11, fontWeight: 700,
          padding: '1px 7px', borderRadius: 999,
          background: 'color-mix(in oklab, var(--ok) 14%, transparent)',
          color: 'var(--ok)',
          border: '1px solid color-mix(in oklab, var(--ok) 28%, transparent)',
        }}>
          {gcalCount} extra event{gcalCount !== 1 ? 's' : ''} from Google Calendar
        </span>
      )}
    </div>

    <button
      onClick={onRefresh}
      disabled={gcalLoading}
      title="Refresh Google Calendar events"
      style={{
        height: 28, padding: '0 10px', borderRadius: 7,
        display: 'flex', alignItems: 'center', gap: 5,
        fontSize: 12, fontWeight: 600,
        background: 'transparent',
        color: 'var(--fg-muted)',
        border: '1px solid var(--border-soft)', cursor: gcalLoading ? 'default' : 'pointer',
        transition: 'all 120ms ease',
        opacity: gcalLoading ? 0.5 : 1,
      }}
      onMouseEnter={(e) => {
        if (!gcalLoading) {
          (e.currentTarget as HTMLElement).style.color = 'var(--fg-strong)';
          (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-strong)';
        }
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.color = 'var(--fg-muted)';
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-soft)';
      }}
    >
      <RefreshCw size={11} style={{ animation: gcalLoading ? 'spin 1s linear infinite' : 'none' }} />
      {gcalLoading ? 'Syncing…' : 'Refresh'}
    </button>
  </div>
);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function endOfMonth(year: number, month: number): Date {
  return new Date(year, month + 1, 0);
}

function buildGrid(year: number, month: number): (number | null)[] {
  const first = new Date(year, month, 1).getDay();
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

function gcalEventsToCalendarEvents(
  raw: Array<{ google_event_id: string; title: string; start: string; end: string; location?: string; html_link?: string }>,
  existingGcalIds: Set<string>,
): CalendarEvent[] {
  return raw
    .filter((e) => !existingGcalIds.has(e.google_event_id)) // deduplicate with DB lessons
    .map((e) => ({
      id:       `gcal-${e.google_event_id}`,
      title:    e.title,
      category: 'other' as EventCategory,
      start:    new Date(e.start),
      end:      e.end ? new Date(e.end) : undefined,
      location: e.location,
      subtitle: 'Google Calendar',
      htmlLink: e.html_link,
    }));
}

// ---------------------------------------------------------------------------
// Event detail popover
// ---------------------------------------------------------------------------

const EventDetail: React.FC<{ event: CalendarEvent; onClose: () => void }> = ({ event, onClose }) => {
  const cfg  = CATEGORY_CONFIG[event.category];
  const Icon = cfg.icon;
  const ref  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [onClose]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div ref={ref} className="bg-[#0a0f1e] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest ${cfg.color}`}>
            <Icon size={13} />
            {cfg.label}
          </div>
          <button onClick={onClose} className="ryze-text-muted hover:ryze-text-inverse transition-colors" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <h3 className="font-bold ryze-text-inverse text-lg leading-tight mb-1">{event.title}</h3>
        {event.subtitle && <p className="text-xs ryze-text-muted mb-4">{event.subtitle}</p>}

        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2 ryze-text-muted">
            <CalendarDays size={14} className="mt-0.5 shrink-0" />
            <span>{formatFullDate(event.start)}</span>
          </div>

          {(formatTime(event.start.toISOString()) || (event.end && formatTime(event.end.toISOString()))) && (
            <div className="flex items-center gap-2 ryze-text-muted">
              <Clock size={14} className="shrink-0" />
              <span>
                {formatTime(event.start.toISOString())}
                {event.end && ` – ${formatTime(event.end.toISOString())}`}
              </span>
            </div>
          )}

          {event.location && (
            <div className="flex items-center gap-2 ryze-text-muted">
              <MapPin size={14} className="shrink-0" />
              <span>{event.location}</span>
            </div>
          )}

          {event.status && (
            <div className="flex items-center gap-2">
              <CheckCircle size={14} className={`shrink-0 ${cfg.color}`} />
              <span className={`capitalize ${cfg.color} font-semibold text-xs`}>
                {event.status.replace(/_/g, ' ')}
              </span>
            </div>
          )}
        </div>

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

        {event.htmlLink && !event.meetLink && (
          <a
            href={event.htmlLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl border border-white/10 ryze-text-muted hover:ryze-text-inverse hover:border-white/20 text-sm font-semibold transition-colors"
          >
            <ExternalLink size={14} />
            View in Google Calendar
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
  category: EventCategory; active: boolean; count: number; onToggle: () => void;
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

const MAX_VISIBLE = 3;

const DayCell: React.FC<{
  day: number; year: number; month: number;
  events: CalendarEvent[]; isToday: boolean;
  onEventClick: (e: CalendarEvent) => void;
}> = ({ day, year, month, events, isToday, onEventClick }) => {
  const [showAll, setShowAll] = useState(false);
  const visible  = showAll ? events : events.slice(0, MAX_VISIBLE);
  const overflow = events.length - MAX_VISIBLE;

  return (
    <div className={`min-h-[90px] md:min-h-[110px] p-1.5 md:p-2 rounded-xl border transition-colors ${
      isToday ? 'border-[#FFB000]/40 bg-[#FFB000]/5' : 'border-white/5 bg-white/[0.015] hover:bg-white/[0.03]'
    }`}>
      <div className={`text-xs font-bold mb-1.5 w-6 h-6 flex items-center justify-center rounded-full ${
        isToday ? 'bg-[#FFB000] text-[#0a0f1e]' : 'ryze-text-muted'
      }`}>
        {day}
      </div>
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
  const today    = useMemo(() => new Date(), []);

  const [year,  setYear]  = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const [allEvents,  setAllEvents]  = useState<CalendarEvent[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);

  // Google Calendar events fetched from backend
  const [gcalEvents,   setGcalEvents]   = useState<CalendarEvent[]>([]);
  const [gcalLoading,  setGcalLoading]  = useState(false);

  const [activeCategories, setActiveCategories] = useState<Set<EventCategory>>(
    new Set(['lesson', 'tutor-meet', 'meeting', 'other']),
  );

  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // ── Fetch portal lessons ──────────────────────────────────────────────────

  const loadLessons = useCallback(async () => {
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
        const res = await portalApi.getLessons({ limit: 300 });
        events = portalLessonsToEvents(res.items);
      }

      setAllEvents(events);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load calendar data.');
    } finally {
      setLoading(false);
    }
  }, [user?.role]);

  useEffect(() => { loadLessons(); }, [loadLessons]);

  // ── Fetch Google Calendar events from backend ─────────────────────────────

  const loadGCalEvents = useCallback(async (y: number, m: number) => {
    // Only admin/tutor roles use the shared GCal; parents see their own lessons already
    if (user?.role === 'parent' || user?.role === 'student') return;

    setGcalLoading(true);
    try {
      const start = new Date(y, m, 1).toISOString();
      const end   = new Date(y, m + 1, 0, 23, 59, 59).toISOString();
      const raw   = await adminApi.getCalendarEvents(start, end);

      // Build set of google_event_ids already represented in DB lessons
      const existingIds = new Set(
        allEvents
          .filter((e) => e.id.startsWith('lesson-'))
          .map((e) => {
            // We don't store gcal IDs on the client-side lesson objects,
            // so we just pass an empty set — the backend already filters
            return '';
          })
          .filter(Boolean),
      );

      setGcalEvents(gcalEventsToCalendarEvents(raw, existingIds));
    } catch {
      // Silently fail — GCal events are supplementary
      setGcalEvents([]);
    } finally {
      setGcalLoading(false);
    }
  }, [user?.role, allEvents]);

  // Load GCal events when month changes or after lessons load
  useEffect(() => {
    if (!loading) loadGCalEvents(year, month);
  }, [year, month, loading, loadGCalEvents]);

  // ── Derived state ─────────────────────────────────────────────────────────

  const mergedEvents = useMemo(
    () => [...allEvents, ...gcalEvents],
    [allEvents, gcalEvents],
  );

  const filteredEvents = useMemo(
    () => mergedEvents.filter((ev) => activeCategories.has(ev.category)),
    [mergedEvents, activeCategories],
  );

  const countByCategory = useMemo(() => {
    const counts: Record<EventCategory, number> = {
      lesson: 0, 'tutor-meet': 0, meeting: 0, other: 0,
    };
    mergedEvents.forEach((ev) => { counts[ev.category]++; });
    return counts;
  }, [mergedEvents]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    filteredEvents.forEach((ev) => {
      const key = `${ev.start.getFullYear()}-${ev.start.getMonth()}-${ev.start.getDate()}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(ev);
    });
    map.forEach((evs) => evs.sort((a, b) => a.start.getTime() - b.start.getTime()));
    return map;
  }, [filteredEvents]);

  const grid = useMemo(() => buildGrid(year, month), [year, month]);

  const monthEventCount = useMemo(() => (
    filteredEvents.filter(
      (ev) => ev.start.getFullYear() === year && ev.start.getMonth() === month,
    ).length
  ), [filteredEvents, year, month]);

  // ── Navigation ─────────────────────────────────────────────────────────────

  function prevMonth() {
    if (month === 0) { setYear((y) => y - 1); setMonth(11); }
    else             { setMonth((m) => m - 1); }
  }

  function nextMonth() {
    if (month === 11) { setYear((y) => y + 1); setMonth(0); }
    else              { setMonth((m) => m + 1); }
  }

  function toggleCategory(cat: EventCategory) {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat); else next.add(cat);
      return next;
    });
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) return <LoadingState />;
  if (error)   return <ErrorState message={error} onRetry={loadLessons} />;

  const isAdminOrTutor = user?.role === 'admin' || user?.role === 'tutor';

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

      {/* ── Google Calendar sync banner (admin/tutor only) ── */}
      {isAdminOrTutor && (
        <GCalSyncBanner
          gcalCount={gcalEvents.length}
          gcalLoading={gcalLoading}
          onRefresh={() => loadGCalEvents(year, month)}
        />
      )}

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
            onClick={() => { setYear(today.getFullYear()); setMonth(today.getMonth()); }}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 ryze-text-muted hover:ryze-text-inverse transition-colors"
          >
            Today
          </button>
        </div>

        {/* Day-of-week headers */}
        <div className="grid grid-cols-7 border-b border-white/5">
          {DAY_NAMES.map((d) => (
            <div key={d} className="text-center text-[10px] font-bold ryze-text-muted uppercase tracking-widest py-2 md:py-3">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1 p-2 md:p-3">
          {grid.map((day, idx) => {
            if (day === null) return <div key={`blank-${idx}`} />;
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
        {gcalEvents.length > 0 && (
          <p className="text-xs ryze-text-muted ml-auto">
            {gcalEvents.length} additional event{gcalEvents.length !== 1 ? 's' : ''} from Google Calendar shown as Other
          </p>
        )}
      </div>

      {/* ── Upcoming events list (current month) ── */}
      {(() => {
        const upcoming = filteredEvents
          .filter((ev) => ev.start.getFullYear() === year && ev.start.getMonth() === month)
          .sort((a, b) => a.start.getTime() - b.start.getTime());

        if (upcoming.length === 0) return null;

        return (
          <div className="bg-[#0a0f1e] border border-white/10 rounded-2xl overflow-hidden">
            <div className="px-5 md:px-7 py-4 border-b border-white/5">
              <h3 className="text-sm font-bold ryze-text-inverse">Events this month</h3>
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
                    <div className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${cfg.bg} border ${cfg.border}`}>
                      <Icon size={14} className={cfg.color} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-0.5">
                        <span className="font-semibold ryze-text-inverse text-sm truncate">{ev.title}</span>
                        {ev.subtitle && <span className="text-xs ryze-text-muted">{ev.subtitle}</span>}
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs ryze-text-muted">
                        <span className="flex items-center gap-1">
                          <CalendarDays size={11} />
                          {ev.start.toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' })}
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
        <EventDetail event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </div>
  );
};

export default CalendarPage;
