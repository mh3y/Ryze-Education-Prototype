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
  BookOpen, Clock,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { parentApi, ChildLesson } from '../../services/parentApi';
import { portalApi, Lesson } from '../../services/portalApi';
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

  const filteredEvents = useMemo(
    () => allEvents.filter((ev) => activeCategories.has(ev.category)),
    [allEvents, activeCategories],
  );

  /** Count per category across ALL events (not just visible month) */
  const countByCategory = useMemo(() => {
    const counts: Record<EventCategory, number> = {
      lesson: 0, 'tutor-meet': 0, meeting: 0, other: 0,
    };
    allEvents.forEach((ev) => { counts[ev.category]++; });
    return counts;
  }, [allEvents]);

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
        <p className="text-xs ryze-text-muted ml-auto">
          Tutor meets, meetings, and other event types will appear here once connected.
        </p>
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
