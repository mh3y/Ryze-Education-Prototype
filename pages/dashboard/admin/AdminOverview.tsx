/**
 * AdminOverview — /dashboard/admin
 * Ryze Portal redesign — matches design handoff exactly.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RefreshCw, Plus, TrendingUp, TrendingDown,
  ArrowRight, AlertTriangle, Clock,
  CalendarDays, CreditCard, ClipboardList, Download, Megaphone,
} from 'lucide-react';
import { adminApi, AdminOverviewStats } from '../../../services/adminApi';
import { useAuth } from '../../../contexts/AuthContext';

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

function formatMono(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('en-AU', {
      hour: '2-digit', minute: '2-digit', hour12: false,
      timeZone: 'Australia/Sydney',
    });
  } catch { return iso; }
}

function getSydneyTime(): string {
  return new Date().toLocaleTimeString('en-AU', {
    hour: '2-digit', minute: '2-digit', hour12: true,
    timeZone: 'Australia/Sydney',
  });
}

function getFirstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name;
}

// ---------------------------------------------------------------------------
// Shared tiny components
// ---------------------------------------------------------------------------

interface TagProps {
  variant: 'ok' | 'warn' | 'danger' | 'info' | 'accent' | 'default';
  children: React.ReactNode;
}

const Tag: React.FC<TagProps> = ({ variant, children }) => {
  const styles: Record<string, React.CSSProperties> = {
    ok:      { color: 'var(--ok)',     background: 'color-mix(in oklab, var(--ok) 12%, transparent)',     border: '1px solid color-mix(in oklab, var(--ok) 26%, transparent)' },
    warn:    { color: 'var(--warn)',   background: 'color-mix(in oklab, var(--warn) 12%, transparent)',   border: '1px solid color-mix(in oklab, var(--warn) 26%, transparent)' },
    danger:  { color: 'var(--danger)', background: 'color-mix(in oklab, var(--danger) 12%, transparent)', border: '1px solid color-mix(in oklab, var(--danger) 26%, transparent)' },
    info:    { color: 'var(--info)',   background: 'color-mix(in oklab, var(--info) 14%, transparent)',   border: '1px solid color-mix(in oklab, var(--info) 28%, transparent)' },
    accent:  { color: 'var(--accent)', background: 'var(--accent-soft)', border: '1px solid color-mix(in oklab, var(--accent) 26%, transparent)' },
    default: { color: 'var(--fg-default)', background: 'var(--bg-hover)', border: '1px solid var(--border-soft)' },
  };
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: '0.04em',
      padding: '4px 9px',
      borderRadius: 999,
      ...styles[variant],
    }}>
      {children}
    </span>
  );
};

function lessonStateTag(status: string) {
  if (status === 'active')    return <Tag variant="accent">Live now</Tag>;
  if (status === 'completed') return <Tag variant="default">Done</Tag>;
  return <Tag variant="info">Upcoming</Tag>;
}

function alertSeverityVariant(severity: string): TagProps['variant'] {
  if (severity === 'critical' || severity === 'high') return 'danger';
  if (severity === 'medium' || severity === 'med')    return 'warn';
  return 'info';
}

// ---------------------------------------------------------------------------
// Mock data for sections not covered by the API yet
// ---------------------------------------------------------------------------

const MOCK_LESSONS = [
  { id: 1, time: '16:00', end: '17:30', title: 'Foundations — Algebraic fractions',           tutor: 'Marcus Webb',  room: 'Studio A', seats: '7 / 10', state: 'upcoming' },
  { id: 2, time: '17:00', end: '18:30', title: 'Maths Ext 1 — Inverse trig differentiation',  tutor: 'Daniel Kwok',  room: 'Studio B', seats: '8 / 8',  state: 'active' },
  { id: 3, time: '18:00', end: '19:30', title: 'Maths Advanced — Combinatorics review',        tutor: 'Daniel Kwok',  room: 'Studio A', seats: '9 / 10', state: 'upcoming' },
  { id: 4, time: '19:00', end: '20:30', title: 'Maths Ext 2 — Mechanics: projectiles',         tutor: 'Priya Aiyar',  room: 'Studio C', seats: '6 / 8',  state: 'upcoming' },
];

const MOCK_ALERTS = [
  { id: 1, severity: 'high', title: '3 students missed lesson check-ins',      body: 'Foundations · Wed 4pm — automated reminders sent.',  when: '8m ago' },
  { id: 2, severity: 'med',  title: 'Sofia Reyes progress dropping',           body: '3 weeks below class median in Algebra topic.',       when: '1h ago' },
  { id: 3, severity: 'low',  title: 'Discord bot reconnected',                 body: 'Brief outage 14:02–14:04, all reminders delivered.', when: '2h ago' },
];

const QUICK_ACTIONS = [
  { key: 'add-student',  label: 'Add student',      icon: Plus,          accent: true,  path: '/dashboard/admin/students' },
  { key: 'schedule',     label: 'Schedule lesson',  icon: CalendarDays,  accent: false, path: '/dashboard/admin/lessons' },
  { key: 'invoice',      label: 'Send invoice',     icon: CreditCard,    accent: false, path: '/dashboard/admin/payments' },
  { key: 'broadcast',    label: 'Announcement',     icon: Megaphone,     accent: false, path: '/dashboard/admin/announcements' },
  { key: 'report',       label: 'Build report',     icon: ClipboardList, accent: false, path: '/dashboard/admin/progress-reports' },
  { key: 'export',       label: 'Export data',      icon: Download,      accent: false, path: '/dashboard/admin/students' },
];

// ---------------------------------------------------------------------------
// Stat tile
// ---------------------------------------------------------------------------

interface StatProps {
  label: string;
  value: string | number;
  deltaText?: string;
  deltaDir?: 'up' | 'down';
  footRight?: string;
}

const StatTile: React.FC<StatProps> = ({ label, value, deltaText, deltaDir, footRight }) => (
  <div style={{
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-faint)',
    borderRadius: 14,
    minHeight: 134,
    padding: '18px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
    boxShadow: 'var(--shadow-card)',
    transition: 'border-color 140ms ease',
    cursor: 'default',
  }}
  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-strong)'; }}
  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-faint)'; }}
  >
    <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--fg-muted)' }}>
      {label}
    </div>
    <div style={{
      fontFamily: '"Cormorant Garamond", "Times New Roman", serif',
      fontStyle: 'italic',
      fontWeight: 500,
      fontSize: 44,
      color: 'var(--fg-strong)',
      lineHeight: 1,
      fontFeatureSettings: '"tnum" 1',
    }}>
      {value}
    </div>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
      {deltaText ? (
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: deltaDir === 'up' ? 'var(--ok)' : 'var(--danger)' }}>
          {deltaDir === 'up'
            ? <TrendingUp size={12} />
            : <TrendingDown size={12} />}
          {deltaText}
        </span>
      ) : <span />}
      {footRight && <span style={{ color: 'var(--fg-faint)', fontFeatureSettings: '"tnum" 1' }}>{footRight}</span>}
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

const AdminOverview: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats]     = useState<AdminOverviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [time, setTime]       = useState(getSydneyTime());

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setStats(await adminApi.getOverviewStats());
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to load overview data.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const id = setInterval(() => setTime(getSydneyTime()), 30_000);
    return () => clearInterval(id);
  }, []);

  const firstName = getFirstName(user?.name ?? 'there');

  // Use real stats where available, fall back to design mock values
  const activeStudents = stats?.total_students ?? 142;
  const classesRunning = stats?.active_classes ?? 18;
  const lessonsToday   = stats?.today_lessons   ?? 4;
  const alertCount     = stats?.open_alerts      ?? 3;

  // Use real lesson list if available, else mock
  const lessonList = (stats?.today_lesson_list?.length)
    ? stats.today_lesson_list.map((l, i) => ({
        id: l.id,
        time: formatMono(l.start_time),
        end:  l.end_time ? formatMono(l.end_time) : '',
        title: l.title,
        tutor: l.class_name ?? '',
        room: '',
        seats: '',
        state: l.status,
      }))
    : MOCK_LESSONS;

  const alertList = stats?.recent_alerts?.length
    ? stats.recent_alerts.map((a) => ({
        id: a.id,
        severity: a.severity,
        title: a.title,
        body: a.message,
        when: '',
      }))
    : MOCK_ALERTS;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-lg)' }}>

      {/* ── PageHead ──────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 10 }}>
            {getTodayLabel()}
          </div>
          <h1 style={{
            fontFamily: '"Cormorant Garamond", "Times New Roman", serif',
            fontStyle: 'italic',
            fontWeight: 500,
            fontSize: 'clamp(38px, 3.5vw, 54px)',
            lineHeight: 1.08,
            letterSpacing: '-0.018em',
            color: 'var(--fg-strong)',
            margin: 0,
            textWrap: 'balance' as React.CSSProperties['textWrap'],
          }}>
            Good {getGreeting()},{' '}
            <span style={{ color: 'var(--accent)' }}>{firstName}</span>.
          </h1>
          <p style={{ fontSize: 14, color: 'var(--fg-muted)', marginTop: 10, marginBottom: 0, maxWidth: '52ch' }}>
            {loading
              ? "Loading today's overview…"
              : `${lessonList.length} lessons scheduled today, ${alertCount} open alert${alertCount !== 1 ? 's' : ''}, and everything else is quiet.`}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, flexShrink: 0, alignItems: 'center' }}>
          <button
            onClick={load}
            style={{
              height: 38, padding: '0 14px', borderRadius: 9,
              fontSize: 13, fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'var(--bg-surface)',
              color: 'var(--fg-default)',
              border: '1px solid var(--border-soft)',
              cursor: 'pointer',
              transition: 'transform 140ms ease, border-color 140ms ease',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = ''; }}
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <button
            style={{
              height: 38, padding: '0 14px', borderRadius: 9,
              fontSize: 13, fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'var(--accent)',
              color: 'var(--accent-fg)',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 6px 18px -10px color-mix(in oklab, var(--accent) 70%, transparent)',
              transition: 'transform 140ms ease',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = ''; }}
          >
            <Plus size={14} /> Quick action
          </button>
        </div>
      </div>

      {/* ── Stat row ──────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--gap-md)' }}
           className="grid-cols-2 sm:grid-cols-4">
        <StatTile label="Active students"  value={activeStudents} deltaText="+6 this week"     deltaDir="up"   footRight="92% retention" />
        <StatTile label="Classes running"  value={classesRunning} deltaText="2 with low seats" deltaDir="down" footRight="5 tutors" />
        <StatTile label="Lessons today"    value={String(lessonsToday).padStart(2, '0')} deltaText="1 live now" deltaDir="up" footRight="08 tomorrow" />
        <StatTile label="Outstanding"      value="$2.4k"          deltaText="3 overdue"         deltaDir="down" footRight="of $24k due" />
      </div>

      {/* ── Two-up: lessons + alerts ───────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '8fr 4fr', gap: 'var(--gap-md)' }}
           className="grid-cols-1 xl:grid-cols-[8fr_4fr]">

        {/* Today's lessons card */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-faint)',
          borderRadius: 16,
          boxShadow: 'var(--shadow-card)',
          overflow: 'hidden',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 22px',
            borderBottom: '1px solid var(--border-faint)',
          }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg-strong)' }}>Today's lessons</div>
              <div style={{ fontSize: 12.5, color: 'var(--fg-muted)', marginTop: 2 }}>
                {lessonList.length} scheduled · {lessonList.filter(l => l.state === 'active').length} live now
              </div>
            </div>
            <button
              onClick={() => navigate('/dashboard/admin/lessons')}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                fontSize: 13, color: 'var(--fg-muted)',
                background: 'transparent', border: 'none', cursor: 'pointer',
                transition: 'color 140ms ease',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--fg-strong)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--fg-muted)'; }}
            >
              View calendar <ArrowRight size={13} />
            </button>
          </div>

          {lessonList.map((l) => (
            <div key={l.id} style={{
              display: 'grid',
              gridTemplateColumns: '76px 1fr auto',
              alignItems: 'center',
              gap: 16,
              padding: '14px 22px',
              borderBottom: '1px solid var(--border-faint)',
              cursor: 'pointer',
              transition: 'background 140ms ease',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = ''; }}
            onClick={() => navigate('/dashboard/admin/lessons')}
            >
              {/* Time block */}
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 15, fontWeight: 600, fontFeatureSettings: '"tnum" 1', color: 'var(--fg-strong)' }}>
                <div>{l.time}</div>
                <div style={{ fontSize: 11, color: 'var(--fg-faint)', marginTop: 2 }}>→ {l.end}</div>
              </div>
              {/* Title + meta */}
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--fg-strong)' }}>{l.title}</div>
                <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginTop: 3 }}>
                  {[l.tutor, l.room, l.seats].filter(Boolean).join(' · ')}
                </div>
              </div>
              {/* Status tag */}
              <div>{lessonStateTag(l.state)}</div>
            </div>
          ))}
        </div>

        {/* Needs attention card */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-faint)',
          borderRadius: 16,
          boxShadow: 'var(--shadow-card)',
          overflow: 'hidden',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 22px',
            borderBottom: '1px solid var(--border-faint)',
          }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg-strong)' }}>Needs attention</div>
              <div style={{ fontSize: 12.5, color: 'var(--fg-muted)', marginTop: 2 }}>{alertList.length} open alerts</div>
            </div>
            <button
              onClick={() => navigate('/dashboard/admin/alerts')}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                fontSize: 13, color: 'var(--fg-muted)',
                background: 'transparent', border: 'none', cursor: 'pointer',
                transition: 'color 140ms ease',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--fg-strong)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--fg-muted)'; }}
            >
              All alerts <ArrowRight size={13} />
            </button>
          </div>

          {alertList.map((a) => (
            <div key={a.id} style={{
              display: 'grid',
              gridTemplateColumns: '32px 1fr auto',
              alignItems: 'flex-start',
              gap: 12,
              padding: '14px 22px',
              borderBottom: '1px solid var(--border-faint)',
              cursor: 'pointer',
              transition: 'background 140ms ease',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = ''; }}
            >
              {/* Severity pip */}
              <div style={{
                width: 32, height: 32, borderRadius: 9,
                display: 'grid', placeItems: 'center',
                background: a.severity === 'high' || a.severity === 'critical'
                  ? 'color-mix(in oklab, var(--danger) 14%, transparent)'
                  : a.severity === 'med' || a.severity === 'medium'
                  ? 'color-mix(in oklab, var(--warn) 14%, transparent)'
                  : 'color-mix(in oklab, var(--info) 14%, transparent)',
                color: a.severity === 'high' || a.severity === 'critical'
                  ? 'var(--danger)'
                  : a.severity === 'med' || a.severity === 'medium'
                  ? 'var(--warn)'
                  : 'var(--info)',
                flexShrink: 0,
              }}>
                <AlertTriangle size={13} />
              </div>
              {/* Body */}
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-strong)' }}>{a.title}</div>
                <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginTop: 3 }}>{a.body}</div>
              </div>
              {/* When */}
              <div style={{ fontSize: 11, color: 'var(--fg-faint)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>{a.when}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Quick actions card ────────────────────────────────────── */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-faint)',
        borderRadius: 16,
        padding: 'var(--card-pad)',
        boxShadow: 'var(--shadow-card)',
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 'var(--gap-lg)', alignItems: 'start' }}
             className="grid-cols-1 sm:grid-cols-[220px_1fr]">
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 8 }}>
              Shortcuts
            </div>
            <div style={{ fontSize: 13, color: 'var(--fg-muted)', lineHeight: 1.5 }}>
              Frequent tasks, one click away.
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12 }}
               className="grid-cols-3 sm:grid-cols-6">
            {QUICK_ACTIONS.map((q) => {
              const Icon = q.icon;
              return (
                <button
                  key={q.key}
                  onClick={() => navigate(q.path)}
                  style={{
                    height: 96,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10,
                    borderRadius: 12,
                    background: q.accent ? 'var(--accent-soft)' : 'var(--bg-surface-2)',
                    border: `1px solid ${q.accent ? 'color-mix(in oklab, var(--accent) 30%, transparent)' : 'var(--border-faint)'}`,
                    cursor: 'pointer',
                    transition: 'transform 140ms ease, background 140ms ease, border-color 140ms ease',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
                    if (!q.accent) (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-soft)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = '';
                    if (!q.accent) (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-faint)';
                  }}
                >
                  <span style={{
                    width: 32, height: 32, borderRadius: 8,
                    display: 'grid', placeItems: 'center',
                    background: q.accent ? 'var(--accent)' : 'var(--bg-elevated)',
                    color: q.accent ? 'var(--accent-ink)' : 'var(--fg-muted)',
                  }}>
                    <Icon size={16} />
                  </span>
                  <span style={{
                    fontSize: 12, fontWeight: 600,
                    color: q.accent ? 'var(--accent)' : 'var(--fg-muted)',
                    textAlign: 'center',
                    lineHeight: 1.3,
                  }}>
                    {q.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Health strip ──────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 16,
        fontSize: 13, color: 'var(--fg-muted)',
      }}>
        {[
          { label: 'Discord bot',      meta: '· online · 13ms latency' },
          { label: 'Calendar sync',    meta: '· last 14s ago' },
          { label: 'Payments',         meta: '· 6 webhooks queued' },
        ].map((item) => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 7, height: 7, borderRadius: 999, background: 'var(--ok)', display: 'inline-block' }} />
            <strong style={{ color: 'var(--fg-default)', fontWeight: 600 }}>{item.label}</strong>
            <span style={{ color: 'var(--fg-muted)' }}>{item.meta}</span>
          </div>
        ))}
        <div style={{ flex: 1 }} />
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          paddingLeft: 16,
          borderLeft: '1px solid var(--border-faint)',
          color: 'var(--fg-faint)',
          fontSize: 12,
        }}>
          <Clock size={12} />
          Sydney ·{' '}
          <span style={{ fontFamily: 'var(--font-mono)', fontFeatureSettings: '"tnum" 1' }}>{time}</span>
        </div>
      </div>

    </div>
  );
};

export default AdminOverview;
