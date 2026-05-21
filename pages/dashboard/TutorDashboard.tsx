/**
 * TutorDashboard — /dashboard/overview for tutors.
 * Redesigned to match design handoff: TutorOverview, TutorClasses,
 * TutorAttendance, TutorHomework (all in one file, rendered by role-aware route).
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ClipboardCheck, Plus, ArrowRight, ArrowUpRight,
  CalendarDays, ClipboardList, PenLine, BookOpen,
  Mail, Download, Search, Filter, ArrowUpDown, MoreHorizontal,
  TrendingUp, TrendingDown, AlertTriangle, Loader2, ChevronLeft,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {
  tutorApi,
  type TutorPortalPayload,
  type TutorAttendanceRoster,
  type TutorLesson,
} from '../../services/tutorApi';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

function getTodayLabel(): string {
  return new Date().toLocaleDateString('en-AU', {
    weekday: 'long', day: 'numeric', month: 'long',
    timeZone: 'Australia/Sydney',
  }).toUpperCase();
}

function getFirstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name;
}

// ---------------------------------------------------------------------------
// Shared tiny components
// ---------------------------------------------------------------------------

type TagVariant = 'ok' | 'warn' | 'danger' | 'info' | 'accent' | 'default';

const tagStyles: Record<TagVariant, React.CSSProperties> = {
  ok:      { color: 'var(--ok)',      background: 'color-mix(in oklab, var(--ok) 12%, transparent)',     border: '1px solid color-mix(in oklab, var(--ok) 26%, transparent)' },
  warn:    { color: 'var(--warn)',    background: 'color-mix(in oklab, var(--warn) 12%, transparent)',   border: '1px solid color-mix(in oklab, var(--warn) 26%, transparent)' },
  danger:  { color: 'var(--danger)',  background: 'color-mix(in oklab, var(--danger) 12%, transparent)', border: '1px solid color-mix(in oklab, var(--danger) 26%, transparent)' },
  info:    { color: 'var(--info)',    background: 'color-mix(in oklab, var(--info) 14%, transparent)',   border: '1px solid color-mix(in oklab, var(--info) 28%, transparent)' },
  accent:  { color: 'var(--accent)',  background: 'var(--accent-soft)', border: '1px solid color-mix(in oklab, var(--accent) 26%, transparent)' },
  default: { color: 'var(--fg-default)', background: 'var(--bg-hover)', border: '1px solid var(--border-soft)' },
};

const Tag: React.FC<{ variant: TagVariant; children: React.ReactNode }> = ({ variant, children }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: 6,
    fontSize: 11, fontWeight: 600, letterSpacing: '0.04em',
    padding: '4px 9px', borderRadius: 999,
    ...tagStyles[variant],
  }}>
    {children}
  </span>
);

interface StatTileProps {
  label: string;
  value: string | number;
  deltaText?: string;
  deltaDir?: 'up' | 'down';
  footRight?: string;
}

const StatTile: React.FC<StatTileProps> = ({ label, value, deltaText, deltaDir, footRight }) => (
  <div
    style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-faint)',
      borderRadius: 14, minHeight: 134,
      padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14,
      boxShadow: 'var(--shadow-card)', transition: 'border-color 140ms ease', cursor: 'default',
    }}
    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-strong)'; }}
    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-faint)'; }}
  >
    <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--fg-muted)' }}>
      {label}
    </div>
    <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'var(--font-display-style)', fontWeight: 'var(--font-display-weight)' as any, fontSize: 44, color: 'var(--fg-strong)', lineHeight: 1, fontFeatureSettings: '"tnum" 1' }}>
      {value}
    </div>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
      {deltaText ? (
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: deltaDir === 'up' ? 'var(--ok)' : 'var(--danger)' }}>
          {deltaDir === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {deltaText}
        </span>
      ) : <span />}
      {footRight && <span style={{ color: 'var(--fg-faint)', fontFeatureSettings: '"tnum" 1' }}>{footRight}</span>}
    </div>
  </div>
);

// Card helpers
const cardStyle: React.CSSProperties = {
  background: 'var(--bg-surface)',
  border: '1px solid var(--border-faint)',
  borderRadius: 16,
  padding: 'var(--card-pad)',
  boxShadow: 'var(--shadow-card)',
};

const cardFlushStyle: React.CSSProperties = {
  ...cardStyle,
  padding: 0,
  overflow: 'hidden',
};

const cardHeadStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
  padding: '16px 22px', borderBottom: '1px solid var(--border-faint)',
};

// Button helpers
const btnPrimary: React.CSSProperties = {
  height: 38, padding: '0 14px', borderRadius: 9,
  fontSize: 13, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 8,
  background: 'var(--accent)', color: 'var(--accent-fg)',
  border: 'none', cursor: 'pointer',
  boxShadow: '0 6px 18px -10px color-mix(in oklab, var(--accent) 70%, transparent)',
  transition: 'transform 140ms ease',
};
const btnGhost: React.CSSProperties = {
  height: 38, padding: '0 14px', borderRadius: 9,
  fontSize: 13, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 8,
  background: 'var(--bg-surface)', color: 'var(--fg-default)',
  border: '1px solid var(--border-soft)', cursor: 'pointer',
  transition: 'transform 140ms ease, border-color 140ms ease',
};
const btnQuiet: React.CSSProperties = {
  height: 34, padding: '0 10px', borderRadius: 8,
  fontSize: 12, fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 6,
  background: 'transparent', color: 'var(--fg-muted)',
  border: 'none', cursor: 'pointer', transition: 'color 140ms ease',
};

const AVATAR_COLOURS: Record<string, { bg: string; fg: string }> = {
  '':       { bg: 'color-mix(in oklab, var(--accent) 22%, var(--bg-surface))',  fg: '#b8841e' },
  blue:     { bg: 'color-mix(in oklab, var(--info) 22%, var(--bg-surface))',    fg: '#5e7fb3' },
  green:    { bg: 'color-mix(in oklab, var(--ok) 22%, var(--bg-surface))',      fg: '#4f9b6a' },
  purple:   { bg: 'color-mix(in oklab, #8669c2 22%, var(--bg-surface))',        fg: '#8669c2' },
  rose:     { bg: 'color-mix(in oklab, #b56770 22%, var(--bg-surface))',        fg: '#b56770' },
};

// ---------------------------------------------------------------------------
// Data hook
// ---------------------------------------------------------------------------

function useTutorPortal() {
  const [data, setData]       = useState<TutorPortalPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    tutorApi.getPortal()
      .then((d) => { if (!cancelled) { setData(d); setLoading(false); } })
      .catch((e) => { if (!cancelled) { setError(e?.message ?? 'Failed to load'); setLoading(false); } });
    return () => { cancelled = true; };
  }, []);

  return { data, loading, error };
}

// Helper: format a scheduled_at ISO string as HH:MM
function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', hour12: false });
}
function fmtEndTime(iso: string, durationMin?: number | null): string {
  if (!durationMin) return '';
  const end = new Date(new Date(iso).getTime() + durationMin * 60000);
  return end.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', hour12: false });
}
function isToday(iso: string): boolean {
  const d = new Date(iso);
  const t = new Date();
  return d.getDate() === t.getDate() && d.getMonth() === t.getMonth() && d.getFullYear() === t.getFullYear();
}
function initials(name: string): string {
  return name.trim().split(/\s+/).map(w => w[0] ?? '').join('').slice(0, 2).toUpperCase();
}

// ---------------------------------------------------------------------------
// Sub-pages
// ---------------------------------------------------------------------------

const TutorOverview: React.FC<{ firstName: string; todayLabel: string; portal: TutorPortalPayload | null }> = ({ firstName, todayLabel, portal }) => {
  const navigate = useNavigate();
  const todayLessons = (portal?.upcoming_lessons ?? []).filter(l => isToday(l.scheduled_at));
  const totalStudents = (portal?.classes ?? []).reduce((s, c) => s + c.student_count, 0);
  const ungradedHw = (portal?.recent_homework ?? []).filter(h => h.published && h.submission_count > 0).length;

  const QUICK_ACTIONS = [
    { key: 'attendance', label: 'Take attendance', icon: ClipboardCheck, accent: true,  path: '/dashboard/attendance' },
    { key: 'homework',   label: 'Assign homework',  icon: PenLine,        accent: false, path: '/dashboard/homework' },
    { key: 'report',     label: 'Write report',     icon: ClipboardList,  accent: false, path: '/dashboard/reports' },
    { key: 'plan',       label: 'Lesson plan',      icon: BookOpen,       accent: false, path: '/dashboard/classes' },
    { key: 'message',    label: 'Message parent',   icon: Mail,           accent: false, path: '/dashboard/overview' },
    { key: 'export',     label: 'Export grades',    icon: Download,       accent: false, path: '/dashboard/overview' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-lg)' }}>
      {/* PageHead */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 10 }}>
          {todayLabel}
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'var(--font-display-style)', fontWeight: 'var(--font-display-weight)' as any, fontSize: 'clamp(38px, 3.5vw, 54px)', lineHeight: 1.08, letterSpacing: '-0.018em', color: 'var(--fg-strong)', margin: 0 }}>
              Good {getGreeting()}, <span style={{ color: 'var(--accent)' }}>{firstName}</span>.
            </h1>
            <p style={{ fontSize: 14, color: 'var(--fg-muted)', margin: '10px 0 0', lineHeight: 1.55 }}>
              Two lessons today, three ungraded homeworks across your classes, and one student to check in on.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
            <button style={btnGhost} onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }} onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = ''; }}>
              <ClipboardCheck size={14} /> Take attendance
            </button>
            <button style={btnPrimary} onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }} onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = ''; }}>
              <Plus size={14} /> New homework
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--gap-md)' }}>
        <StatTile label="Today's lessons"  value={String(todayLessons.length).padStart(2, '0')} footRight={`across ${portal?.classes?.length ?? 0} classes`} />
        <StatTile label="Students taught"  value={String(totalStudents).padStart(2, '0')} footRight="enrolled across all classes" />
        <StatTile label="Classes"          value={String(portal?.classes?.length ?? 0).padStart(2, '0')} />
        <StatTile label="To grade"         value={String(ungradedHw).padStart(2, '0')} deltaText={ungradedHw > 0 ? 'Needs attention' : 'All caught up'} deltaDir={ungradedHw > 0 ? 'down' : 'up'} />
      </div>

      {/* 8-4 row */}
      <div style={{ display: 'grid', gridTemplateColumns: '8fr 4fr', gap: 'var(--gap-md)' }}>
        {/* Today's lessons */}
        <div style={cardFlushStyle}>
          <div style={cardHeadStyle}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg-strong)' }}>Your lessons today</div>
              <div style={{ fontSize: 12.5, color: 'var(--fg-muted)', marginTop: 2 }}>
                {todayLessons.length} scheduled · take attendance from each row.
              </div>
            </div>
            <button style={btnQuiet}><span>Open week</span> <ArrowRight size={13} /></button>
          </div>
          {todayLessons.length === 0 && (
            <div style={{ padding: '24px 22px', color: 'var(--fg-muted)', fontSize: 13.5 }}>No lessons scheduled for today.</div>
          )}
          {todayLessons.map((l) => (
            <div key={l.id} style={{ display: 'grid', gridTemplateColumns: '76px 1fr auto', alignItems: 'center', gap: 16, padding: '14px 22px', borderBottom: '1px solid var(--border-faint)', transition: 'background 140ms ease' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--fg-strong)', fontFeatureSettings: '"tnum" 1' }}>{fmtTime(l.scheduled_at)}</div>
                <div style={{ fontSize: 11, color: 'var(--fg-muted)', marginTop: 2 }}>→ {l.end_time ? fmtTime(l.end_time) : '—'}</div>
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg-strong)' }}>{l.title}</div>
                <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginTop: 2 }}>{l.class_name ?? 'Class'} · {l.meet_link ? 'Online' : 'In person'}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button style={btnQuiet} onClick={() => navigate(`/dashboard/attendance?lesson=${l.id}`)}><ClipboardCheck size={13} /> Mark</button>
                <Tag variant={l.status === 'live' ? 'ok' : 'info'}>{l.status === 'live' ? 'Live' : 'Upcoming'}</Tag>
              </div>
            </div>
          ))}
        </div>

        {/* Needs attention */}
        <div style={cardFlushStyle}>
          <div style={cardHeadStyle}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg-strong)' }}>Needs attention</div>
              <div style={{ fontSize: 12.5, color: 'var(--fg-muted)', marginTop: 2 }}>3 items across your classes</div>
            </div>
          </div>
          {[
            { pip: 'warn', icon: <AlertTriangle size={13} />, title: 'Sofia Reyes — 2 lessons missed', sub: 'Foundations · last absent Wed 8 May.', when: '3d' },
            { pip: 'info', icon: <PenLine size={13} />,       title: 'HW-317 — half the class hasn\'t submitted', sub: 'Maths Advanced · combinatorics set, due in 3 days.', when: '12h' },
            { pip: 'info', icon: <ClipboardList size={13} />, title: 'Progress report due — Amelia Tran', sub: 'Term 2 progress report waiting on you.', when: '1d' },
          ].map((a, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '32px 1fr auto', gap: 12, alignItems: 'flex-start', padding: '14px 22px', borderBottom: i < 2 ? '1px solid var(--border-faint)' : undefined }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, display: 'grid', placeItems: 'center', background: `color-mix(in oklab, var(--${a.pip}) 14%, transparent)`, color: `var(--${a.pip})` }}>
                {a.icon}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-strong)' }}>{a.title}</div>
                <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginTop: 2 }}>{a.sub}</div>
              </div>
              <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--fg-faint)', whiteSpace: 'nowrap' }}>{a.when}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
          <div style={{ width: 220, flexShrink: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--fg-muted)' }}>Shortcuts</div>
            <div style={{ fontSize: 13, color: 'var(--fg-muted)', marginTop: 8, lineHeight: 1.5 }}>Day-to-day tutor actions, one click away.</div>
          </div>
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10 }}>
            {QUICK_ACTIONS.map((a) => {
              const Icon = a.icon;
              return (
                <button
                  key={a.key}
                  onClick={() => navigate(a.path)}
                  style={{
                    height: 96, flexDirection: 'column', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    borderRadius: 12, border: `1px solid ${a.accent ? 'color-mix(in oklab, var(--accent) 28%, transparent)' : 'var(--border-faint)'}`,
                    background: a.accent ? 'var(--accent-soft-2)' : 'transparent',
                    cursor: 'pointer', transition: 'background 140ms ease, border-color 140ms ease, transform 140ms ease',
                    padding: 0,
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-strong)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.borderColor = a.accent ? 'color-mix(in oklab, var(--accent) 28%, transparent)' : 'var(--border-faint)'; }}
                >
                  <div style={{ width: 32, height: 32, borderRadius: 8, display: 'grid', placeItems: 'center', background: a.accent ? 'var(--accent-soft)' : 'var(--bg-surface-2)', color: a.accent ? 'var(--accent)' : 'var(--fg-muted)' }}>
                    <Icon size={16} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: a.accent ? 'var(--accent)' : 'var(--fg-default)', textAlign: 'center', lineHeight: 1.3 }}>{a.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Tutor Classes page
// ---------------------------------------------------------------------------

const TutorClassesPage: React.FC = () => {
  const { data: portal, loading, error } = useTutorPortal();
  const classes = portal?.classes ?? [];

  const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayPillStyle = (day: string): React.CSSProperties => ({
    fontSize: 11, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase' as const,
    padding: '4px 10px', borderRadius: 8,
    background: 'var(--accent-soft)', color: 'var(--accent)',
    display: 'inline-block',
  });

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 96 }}>
      <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--fg-muted)' }} />
    </div>
  );
  if (error) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 64, color: 'var(--danger)', fontSize: 14 }}>
      <AlertTriangle size={18} style={{ marginRight: 8 }} />{error}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-lg)' }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 10 }}>My teaching</div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'var(--font-display-style)', fontWeight: 'var(--font-display-weight)' as any, fontSize: 'clamp(38px, 3.5vw, 54px)', lineHeight: 1.08, letterSpacing: '-0.018em', color: 'var(--fg-strong)', margin: 0 }}>Classes</h1>
            <p style={{ fontSize: 14, color: 'var(--fg-muted)', margin: '10px 0 0' }}>{classes.length} active class{classes.length !== 1 ? 'es' : ''} this term. Click any class to open the roster, attendance and homework tools.</p>
          </div>
          <button style={btnGhost}><CalendarDays size={14} /> Week view</button>
        </div>
      </div>

      {classes.length === 0 && (
        <div style={{ padding: 48, textAlign: 'center', color: 'var(--fg-muted)', fontSize: 14 }}>No classes assigned yet.</div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--gap-md)' }}>
        {classes.map((c) => {
          const nextLessonDay = c.next_lesson
            ? DAY_LABELS[new Date(c.next_lesson.scheduled_at).getDay()]
            : null;
          const nextLessonTime = c.next_lesson ? fmtTime(c.next_lesson.scheduled_at) : null;
          return (
          <div
            key={c.class_id}
            style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: 0, transition: 'transform 140ms ease, border-color 140ms ease, box-shadow 140ms ease', cursor: 'pointer' }}
            onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(-2px)'; el.style.borderColor = 'var(--border-strong)'; }}
            onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.transform = ''; el.style.borderColor = 'var(--border-faint)'; }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {nextLessonDay && <div style={{ ...dayPillStyle(nextLessonDay) }}>{nextLessonDay.toUpperCase()}</div>}
                {nextLessonTime && <span style={{ fontSize: 12.5, fontFamily: 'var(--font-mono)', color: 'var(--fg-muted)', fontFeatureSettings: '"tnum" 1' }}>{nextLessonTime}</span>}
              </div>
              <Tag variant="ok">Active</Tag>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'var(--font-display-style)', fontWeight: 'var(--font-display-weight)' as any, fontSize: 26, color: 'var(--fg-strong)', lineHeight: 1.1, marginBottom: 6 }}>{c.class_name}</div>
            <div style={{ fontSize: 13, color: 'var(--fg-muted)', marginBottom: 18 }}>{c.subject ?? c.year_level ?? '—'}</div>
            <div style={{ height: 1, background: 'var(--border-faint)', marginBottom: 18 }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 18 }}>
              {[['Students', String(c.student_count)], ['Schedule', c.schedule ?? '—'], ['Next', nextLessonDay ? `${nextLessonDay} ${nextLessonTime}` : 'TBD']].map(([label, val]) => (
                <div key={label as string}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-strong)' }}>{val}</div>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'right', marginTop: 'auto' }}>
              <button style={btnQuiet}>Open class <ArrowUpRight size={13} /></button>
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Tutor Attendance page
// ---------------------------------------------------------------------------

/** Pick a colour bucket from the student's name so avatars aren't all the same. */
function avatarColour(name: string): { bg: string; fg: string } {
  const pool = Object.values(AVATAR_COLOURS);
  return pool[name.charCodeAt(0) % pool.length];
}

const TutorAttendancePage: React.FC = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const qs        = new URLSearchParams(location.search);
  const rawLesson = qs.get('lesson');
  const lessonId  = rawLesson ? parseInt(rawLesson, 10) : null;

  // ── Lesson picker (no ?lesson= in URL) ───────────────────────────────────
  const [lessons,       setLessons]       = useState<TutorLesson[]>([]);
  const [loadingList,   setLoadingList]   = useState(!lessonId);

  // ── Roster view ───────────────────────────────────────────────────────────
  const [roster,        setRoster]        = useState<TutorAttendanceRoster | null>(null);
  const [loadingRoster, setLoadingRoster] = useState(!!lessonId);
  const [marks,         setMarks]         = useState<Record<number, string>>({});
  const [saving,        setSaving]        = useState(false);
  const [saveOk,        setSaveOk]        = useState(false);
  const [saveError,     setSaveError]     = useState<string | null>(null);

  // Load lesson list when no lesson selected
  useEffect(() => {
    if (lessonId) return;
    setLoadingList(true);
    tutorApi.getLessons()
      .then((ls) => { setLessons(ls); setLoadingList(false); })
      .catch(() => setLoadingList(false));
  }, [lessonId]);

  // Load roster when lesson is selected
  useEffect(() => {
    if (!lessonId) return;
    setLoadingRoster(true);
    setSaveOk(false);
    setSaveError(null);
    tutorApi.getAttendance(lessonId)
      .then((r) => {
        setRoster(r);
        const init: Record<number, string> = {};
        r.roster.forEach((s) => { init[s.student_id] = s.status ?? 'unknown'; });
        setMarks(init);
        setLoadingRoster(false);
      })
      .catch(() => setLoadingRoster(false));
  }, [lessonId]);

  const handleSave = async () => {
    if (!lessonId || !roster) return;
    setSaving(true); setSaveOk(false); setSaveError(null);
    try {
      await Promise.all(
        roster.roster.map((s) =>
          tutorApi.markAttendance(lessonId, { student_id: s.student_id, status: marks[s.student_id] ?? 'unknown' })
        )
      );
      setSaveOk(true);
    } catch (e: any) {
      setSaveError(e?.message ?? 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const markAll = (status: string) => {
    if (!roster) return;
    const all: Record<number, string> = {};
    roster.roster.forEach((s) => { all[s.student_id] = status; });
    setMarks(all);
  };

  const pad = (n: number) => String(n).padStart(2, '0');
  const tally = Object.values(marks).reduce<Record<string, number>>(
    (a, v) => ({ ...a, [v]: (a[v] || 0) + 1 }), {}
  );

  const statusVariant = (st: string): TagVariant => {
    if (st === 'present') return 'ok';
    if (st === 'late')    return 'warn';
    if (st === 'absent')  return 'danger';
    return 'default';
  };
  const statusLabel = (st: string) =>
    st === 'present' ? 'Present' : st === 'late' ? 'Late' : st === 'absent' ? 'Absent' : 'Unknown';

  const h1Style: React.CSSProperties = {
    fontFamily: 'var(--font-display)', fontStyle: 'var(--font-display-style)',
    fontWeight: 'var(--font-display-weight)' as any,
    fontSize: 'clamp(38px, 3.5vw, 54px)', lineHeight: 1.08,
    letterSpacing: '-0.018em', color: 'var(--fg-strong)', margin: 0,
  };

  // ── Lesson picker ──────────────────────────────────────────────────────────
  if (!lessonId) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-lg)' }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 10 }}>
            MARK THE ROLL
          </div>
          <h1 style={h1Style}>Attendance</h1>
          <p style={{ fontSize: 14, color: 'var(--fg-muted)', margin: '10px 0 0' }}>
            Pick a lesson below to open its roll.
          </p>
        </div>

        {loadingList ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 64 }}>
            <Loader2 size={28} className="spin" style={{ color: 'var(--fg-muted)', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : (
          <div style={cardFlushStyle}>
            {lessons.length === 0 && (
              <div style={{ padding: '24px 22px', color: 'var(--fg-muted)', fontSize: 13.5 }}>No lessons found.</div>
            )}
            {lessons.map((l, i) => (
              <div
                key={l.id}
                onClick={() => navigate(`/dashboard/attendance?lesson=${l.id}`)}
                style={{ display: 'grid', gridTemplateColumns: '86px 1fr auto', alignItems: 'center', gap: 16, padding: '14px 22px', borderBottom: i < lessons.length - 1 ? '1px solid var(--border-faint)' : undefined, cursor: 'pointer', transition: 'background 140ms ease' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--fg-strong)', fontFeatureSettings: '"tnum" 1' }}>{fmtTime(l.scheduled_at)}</div>
                  <div style={{ fontSize: 11, color: 'var(--fg-muted)', marginTop: 2 }}>
                    {new Date(l.scheduled_at).toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg-strong)' }}>{l.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginTop: 2 }}>
                    {l.class_name ?? 'Class'}{l.student_count ? ` · ${l.student_count} students` : ''}
                  </div>
                </div>
                <Tag variant={isToday(l.scheduled_at) ? 'ok' : 'default'}>
                  {isToday(l.scheduled_at) ? 'Today' : l.status}
                </Tag>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── Loading roster ─────────────────────────────────────────────────────────
  if (loadingRoster) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 96 }}>
        <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--fg-muted)' }} />
      </div>
    );
  }

  const entries = roster?.roster ?? [];

  // ── Roster view ────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-lg)' }}>
      <div>
        <button
          style={{ ...btnQuiet, marginBottom: 10, paddingLeft: 0 }}
          onClick={() => navigate('/dashboard/attendance')}
        >
          <ChevronLeft size={14} /> Back to lessons
        </button>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 10 }}>
          {new Date().toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Australia/Sydney' }).toUpperCase()}
          {roster?.class_name ? ` · ${roster.class_name.toUpperCase()}` : ''}
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <h1 style={h1Style}>Attendance</h1>
            <p style={{ fontSize: 14, color: 'var(--fg-muted)', margin: '10px 0 0' }}>
              {roster?.class_name ?? 'Class'} — mark who's in the room.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            {saveOk && <span style={{ fontSize: 13, color: 'var(--ok)', fontWeight: 600 }}>Roll saved ✓</span>}
            {saveError && <span style={{ fontSize: 13, color: 'var(--danger)' }}>{saveError}</span>}
            <button style={btnGhost} onClick={() => markAll('present')}>Mark all present</button>
            <button style={btnPrimary} onClick={handleSave} disabled={saving}>
              {saving
                ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                : <ClipboardCheck size={14} />}
              {saving ? 'Saving…' : 'Save roll'}
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--gap-md)' }}>
        <StatTile label="Roll size" value={pad(entries.length)} footRight="enrolled" />
        <StatTile label="Present"   value={pad(tally.present || 0)} deltaText="Looking good" deltaDir="up" />
        <StatTile label="Late"      value={pad(tally.late || 0)} footRight="counts as present" />
        <StatTile label="Absent"    value={pad(tally.absent || 0)} deltaText={(tally.absent || 0) > 0 ? 'Follow up' : '—'} deltaDir="down" />
      </div>

      {/* Roster table */}
      <div style={cardFlushStyle}>
        {/* Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 22px', borderBottom: '1px solid var(--border-faint)', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 240, background: 'var(--bg-surface-2)', border: '1px solid var(--border-soft)', borderRadius: 9, padding: '8px 12px' }}>
            <Search size={14} style={{ color: 'var(--fg-muted)', flexShrink: 0 }} />
            <input placeholder="Search by name…" style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 13, color: 'var(--fg-default)', flex: 1 }} />
          </div>
          {['All', 'Present', 'Late', 'Absent'].map((f, i) => (
            <button key={f} style={{ padding: '6px 14px', borderRadius: 9, fontSize: 12.5, fontWeight: 600, border: `1px solid ${i === 0 ? 'color-mix(in oklab, var(--accent) 28%, transparent)' : 'var(--border-soft)'}`, background: i === 0 ? 'var(--accent-soft)' : 'var(--bg-surface-2)', color: i === 0 ? 'var(--accent)' : 'var(--fg-muted)', cursor: 'pointer' }}>{f}</button>
          ))}
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-surface-2)', borderBottom: '1px solid var(--border-soft)' }}>
              {['Student', 'Previous status', 'Marked at', 'Today'].map((h) => (
                <th key={h} style={{ padding: '10px 22px', textAlign: 'left', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--fg-muted)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 && (
              <tr><td colSpan={4} style={{ padding: '24px 22px', color: 'var(--fg-muted)', fontSize: 13.5 }}>No students enrolled in this lesson.</td></tr>
            )}
            {entries.map((s) => {
              const av  = avatarColour(s.student_name);
              const ini = initials(s.student_name);
              const cur = marks[s.student_id] ?? 'unknown';
              return (
                <tr key={s.student_id}
                  style={{ borderBottom: '1px solid var(--border-faint)', transition: 'background 140ms ease' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  <td style={{ padding: '14px 22px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: '50%', background: av.bg, color: av.fg, display: 'grid', placeItems: 'center', fontSize: 12.5, fontWeight: 700, flexShrink: 0 }}>
                        {ini}
                      </div>
                      <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--fg-strong)' }}>{s.student_name}</div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 22px' }}>
                    <Tag variant={statusVariant(s.status)}>{statusLabel(s.status)}</Tag>
                  </td>
                  <td style={{ padding: '14px 22px', color: 'var(--fg-muted)', fontSize: 12.5, fontFamily: 'var(--font-mono)', fontFeatureSettings: '"tnum" 1' }}>
                    {s.marked_at ? new Date(s.marked_at).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' }) : '—'}
                  </td>
                  <td style={{ padding: '14px 22px' }}>
                    <div style={{ display: 'inline-flex', background: 'var(--bg-surface-2)', border: '1px solid var(--border-soft)', borderRadius: 9, padding: 3, gap: 2 }}>
                      {(['present', 'late', 'absent', 'unknown'] as const).map((v) => (
                        <button
                          key={v}
                          onClick={() => setMarks((m) => ({ ...m, [s.student_id]: v }))}
                          style={{
                            padding: '6px 14px', borderRadius: 7, fontSize: 12.5, fontWeight: 600,
                            border: 'none', cursor: 'pointer',
                            transition: 'background 140ms ease, color 140ms ease, box-shadow 140ms ease',
                            background: cur === v ? 'var(--bg-surface)' : 'transparent',
                            color:      cur === v ? 'var(--fg-strong)' : 'var(--fg-muted)',
                            boxShadow:  cur === v ? '0 1px 4px rgba(0,0,0,.18)' : 'none',
                          }}
                        >
                          {v === 'unknown' ? '—' : v.charAt(0).toUpperCase() + v.slice(1)}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Tutor Homework page
// ---------------------------------------------------------------------------

const TutorHomeworkPage: React.FC = () => {
  const { data: portal, loading, error } = useTutorPortal();
  const homework = portal?.recent_homework ?? [];

  const hwStateVariant = (hw: { published: boolean; submission_count: number }): TagVariant => {
    if (!hw.published) return 'default';
    if (hw.submission_count > 0) return 'warn';
    return 'info';
  };
  const hwStateLabel = (hw: { published: boolean; submission_count: number }) => {
    if (!hw.published) return 'Draft';
    if (hw.submission_count > 0) return 'To grade';
    return 'Published';
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 96 }}>
      <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--fg-muted)' }} />
    </div>
  );
  if (error) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 64, color: 'var(--danger)', fontSize: 14 }}>
      <AlertTriangle size={18} style={{ marginRight: 8 }} />{error}
    </div>
  );

  const pad = (n: number) => String(n).padStart(2, '0');
  const openCount    = homework.filter((h) => h.published && !h.submission_count).length;
  const toGradeCount = homework.filter((h) => h.published && h.submission_count > 0).length;
  const draftCount   = homework.filter((h) => !h.published).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-lg)' }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 10 }}>Across your classes</div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'var(--font-display-style)', fontWeight: 'var(--font-display-weight)' as any, fontSize: 'clamp(38px, 3.5vw, 54px)', lineHeight: 1.08, letterSpacing: '-0.018em', color: 'var(--fg-strong)', margin: 0 }}>Homework</h1>
            <p style={{ fontSize: 14, color: 'var(--fg-muted)', margin: '10px 0 0' }}>Assignments you've set, ordered by due date. Drill in to grade or send a reminder.</p>
          </div>
          <button style={btnPrimary}><Plus size={14} /> New homework</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--gap-md)' }}>
        <StatTile label="Published"  value={pad(openCount)}    footRight="awaiting submissions" />
        <StatTile label="To grade"   value={pad(toGradeCount)} deltaText={toGradeCount > 0 ? 'Needs attention' : 'All caught up'} deltaDir={toGradeCount > 0 ? 'down' : 'up'} />
        <StatTile label="Drafts"     value={pad(draftCount)}   footRight="not yet published" />
        <StatTile label="Total"      value={pad(homework.length)} footRight="recent assignments" />
      </div>

      <div style={cardFlushStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 22px', borderBottom: '1px solid var(--border-faint)', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 240, background: 'var(--bg-surface-2)', border: '1px solid var(--border-soft)', borderRadius: 9, padding: '8px 12px' }}>
            <Search size={14} style={{ color: 'var(--fg-muted)', flexShrink: 0 }} />
            <input placeholder="Search homework…" style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 13, color: 'var(--fg-default)', flex: 1 }} />
          </div>
          {['All', 'Open', 'To grade', 'Graded'].map((f, i) => (
            <button key={f} style={{ padding: '6px 14px', borderRadius: 9, fontSize: 12.5, fontWeight: 600, border: `1px solid ${i === 0 ? 'color-mix(in oklab, var(--accent) 28%, transparent)' : 'var(--border-soft)'}`, background: i === 0 ? 'var(--accent-soft)' : 'var(--bg-surface-2)', color: i === 0 ? 'var(--accent)' : 'var(--fg-muted)', cursor: 'pointer' }}>{f}</button>
          ))}
          <button style={btnGhost}><Filter size={14} /> Filters</button>
          <button style={btnQuiet}><ArrowUpDown size={14} /> Sort</button>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-surface-2)', borderBottom: '1px solid var(--border-soft)' }}>
              {['Assignment', 'Class', 'Submitted', 'Due', 'Status', ''].map((h, i) => (
                <th key={i} style={{ padding: '10px 22px', textAlign: 'left', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--fg-muted)', width: i === 5 ? 40 : undefined }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {homework.length === 0 && (
              <tr><td colSpan={6} style={{ padding: '24px 22px', color: 'var(--fg-muted)', fontSize: 13.5 }}>No homework assignments yet.</td></tr>
            )}
            {homework.map((hw) => (
              <tr key={hw.id} style={{ borderBottom: '1px solid var(--border-faint)', transition: 'background 140ms ease' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                <td style={{ padding: '14px 22px' }}>
                  <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--fg-strong)' }}>{hw.title}</div>
                  <div style={{ fontSize: 11.5, fontFamily: 'var(--font-mono)', color: 'var(--fg-muted)', marginTop: 2 }}>#{hw.id}</div>
                </td>
                <td style={{ padding: '14px 22px', color: 'var(--fg-muted)', fontSize: 13.5 }}>{hw.class_name ?? '—'}</td>
                <td style={{ padding: '14px 22px' }}>
                  <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--fg-muted)', fontFeatureSettings: '"tnum" 1' }}>
                    {hw.submission_count} submitted
                  </span>
                </td>
                <td style={{ padding: '14px 22px', color: 'var(--fg-muted)', fontSize: 13.5 }}>
                  {hw.due_date
                    ? new Date(hw.due_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })
                    : '—'}
                </td>
                <td style={{ padding: '14px 22px' }}>
                  <Tag variant={hwStateVariant(hw)}>{hwStateLabel(hw)}</Tag>
                </td>
                <td style={{ padding: '14px 22px', textAlign: 'right' }}>
                  <button style={{ ...btnQuiet, padding: '4px 8px' }}><MoreHorizontal size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Main component (route to sub-page by URL)
// ---------------------------------------------------------------------------

const TutorDashboard: React.FC = () => {
  const { user } = useAuth();
  const { data: portal, loading, error } = useTutorPortal();
  const firstName  = getFirstName(user?.name ?? 'there');
  const todayLabel = getTodayLabel();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--fg-muted)' }} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: 12 }}>
        <AlertTriangle size={28} style={{ color: 'var(--danger)' }} />
        <p style={{ fontSize: 14, color: 'var(--fg-muted)' }}>{error}</p>
      </div>
    );
  }

  // Sidebar routes tutors to:
  //   /dashboard/overview   → TutorOverview   (this component)
  //   /dashboard/classes    → TutorClassesPage
  //   /dashboard/attendance → TutorAttendancePage
  //   /dashboard/homework   → TutorHomeworkPage
  return <TutorOverview firstName={firstName} todayLabel={todayLabel} portal={portal} />;
};

export default TutorDashboard;
export { TutorClassesPage, TutorAttendancePage, TutorHomeworkPage };
