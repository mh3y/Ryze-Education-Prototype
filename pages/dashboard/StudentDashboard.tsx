/**
 * StudentDashboard — /dashboard/overview for students.
 * Loads live data from GET /api/student/portal via studentApi.
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, ArrowRight, ArrowUpRight,
  CalendarDays, TrendingUp, TrendingDown, RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { studentApi, StudentPortalPayload } from '../../services/studentApi';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getFirstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name;
}

function formatRelativeTime(iso: string): string {
  const diff = new Date(iso).getTime() - Date.now();
  const abs  = Math.abs(diff);
  if (abs < 60_000)      return 'just now';
  if (abs < 3_600_000)   return `${Math.round(abs / 60_000)}m`;
  if (abs < 86_400_000)  return `${Math.round(abs / 3_600_000)}h ${Math.round((abs % 3_600_000) / 60_000)}m`;
  if (abs < 604_800_000) return `${Math.round(abs / 86_400_000)}d`;
  return new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
}

function formatDueDate(iso: string | null): string {
  if (!iso) return '—';
  const d    = new Date(iso);
  const now  = new Date();
  const diff = d.getTime() - now.getTime();
  if (diff < 0) return 'Overdue';
  if (diff < 86_400_000)   return 'Due today';
  if (diff < 172_800_000)  return 'Due tomorrow';
  if (diff < 604_800_000)  return `Due ${d.toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' })}`;
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
}

// ---------------------------------------------------------------------------
// Shared tiny components
// ---------------------------------------------------------------------------

type TagVariant = 'ok' | 'warn' | 'danger' | 'info' | 'accent' | 'default';

const tagStyles: Record<TagVariant, React.CSSProperties> = {
  ok:      { color: 'var(--ok)',     background: 'color-mix(in oklab, var(--ok) 12%, transparent)',     border: '1px solid color-mix(in oklab, var(--ok) 26%, transparent)' },
  warn:    { color: 'var(--warn)',   background: 'color-mix(in oklab, var(--warn) 12%, transparent)',   border: '1px solid color-mix(in oklab, var(--warn) 26%, transparent)' },
  danger:  { color: 'var(--danger)', background: 'color-mix(in oklab, var(--danger) 12%, transparent)', border: '1px solid color-mix(in oklab, var(--danger) 26%, transparent)' },
  info:    { color: 'var(--info)',   background: 'color-mix(in oklab, var(--info) 14%, transparent)',   border: '1px solid color-mix(in oklab, var(--info) 28%, transparent)' },
  accent:  { color: 'var(--accent)', background: 'var(--accent-soft)', border: '1px solid color-mix(in oklab, var(--accent) 26%, transparent)' },
  default: { color: 'var(--fg-default)', background: 'var(--bg-hover)', border: '1px solid var(--border-soft)' },
};

const Tag: React.FC<{ variant: TagVariant; children: React.ReactNode }> = ({ variant, children }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', padding: '4px 9px', borderRadius: 999, ...tagStyles[variant] }}>
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
    style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-faint)', borderRadius: 14, minHeight: 134, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14, boxShadow: 'var(--shadow-card)', transition: 'border-color 140ms ease', cursor: 'default' }}
    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-strong)'; }}
    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-faint)'; }}
  >
    <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--fg-muted)' }}>{label}</div>
    <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'var(--font-display-style)', fontWeight: 'var(--font-display-weight)' as any, fontSize: 44, color: 'var(--fg-strong)', lineHeight: 1, fontFeatureSettings: '"tnum" 1' }}>{value}</div>
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

const btnPrimary: React.CSSProperties = { height: 38, padding: '0 14px', borderRadius: 9, fontSize: 13, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--accent)', color: 'var(--accent-fg)', border: 'none', cursor: 'pointer', boxShadow: '0 6px 18px -10px color-mix(in oklab, var(--accent) 70%, transparent)', transition: 'transform 140ms ease' };
const btnGhost: React.CSSProperties  = { height: 38, padding: '0 14px', borderRadius: 9, fontSize: 13, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--bg-surface)', color: 'var(--fg-default)', border: '1px solid var(--border-soft)', cursor: 'pointer', transition: 'transform 140ms ease' };
const btnQuiet: React.CSSProperties  = { height: 34, padding: '0 10px', borderRadius: 8, fontSize: 12, fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 6, background: 'transparent', color: 'var(--fg-muted)', border: 'none', cursor: 'pointer', transition: 'color 140ms ease' };

const cardStyle: React.CSSProperties        = { background: 'var(--bg-surface)', border: '1px solid var(--border-faint)', borderRadius: 16, padding: 'var(--card-pad)', boxShadow: 'var(--shadow-card)' };
const cardFlushStyle: React.CSSProperties   = { ...cardStyle, padding: 0, overflow: 'hidden' };

// ---------------------------------------------------------------------------
// StudentDashboard
// ---------------------------------------------------------------------------

const StudentDashboard: React.FC = () => {
  const { user }  = useAuth();
  const navigate  = useNavigate();
  const firstName = getFirstName(user?.name ?? 'there');

  const [portal, setPortal]   = useState<StudentPortalPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    studentApi.getPortal()
      .then(setPortal)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed to load dashboard.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openHomework  = portal?.homework.open   ?? [];
  const doneHomework  = portal?.homework.submitted ?? [];
  const classes       = portal?.classes          ?? [];
  const nextLesson    = portal?.next_lesson       ?? null;
  const attendanceRate = portal?.attendance.rate  ?? null;
  const reports       = portal?.reports           ?? [];
  const yearLevel     = portal?.student.year_level ?? user?.name ? 'Student' : '…';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-lg)' }}>

      {/* PageHead */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 10 }}>
          {loading ? '…' : (portal?.student.year_level ?? 'Student')}
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'var(--font-display-style)', fontWeight: 'var(--font-display-weight)' as any, fontSize: 'clamp(38px, 3.5vw, 54px)', lineHeight: 1.08, letterSpacing: '-0.018em', color: 'var(--fg-strong)', margin: 0 }}>
              Hey, <span style={{ color: 'var(--accent)' }}>{firstName}</span>.
            </h1>
            <p style={{ fontSize: 14, color: 'var(--fg-muted)', margin: '10px 0 0', lineHeight: 1.55 }}>
              {loading
                ? 'Loading your dashboard…'
                : error
                  ? error
                  : nextLesson
                    ? `Your next lesson is in ${formatRelativeTime(nextLesson.scheduled_at)}. ${openHomework.length > 0 ? `${openHomework.length} homework task${openHomework.length === 1 ? '' : 's'} outstanding.` : 'No outstanding homework.'}`
                    : openHomework.length > 0
                      ? `${openHomework.length} homework task${openHomework.length === 1 ? '' : 's'} outstanding. No upcoming lessons scheduled.`
                      : "No upcoming lessons or outstanding homework. You're all caught up!"}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {error && (
              <button onClick={load} style={{ ...btnGhost, gap: 6 }}>
                <RefreshCw size={13} /> Retry
              </button>
            )}
            <button
              style={btnPrimary}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = ''; }}
              onClick={() => navigate('/dashboard/ryze-ai')}
            >
              <BookOpen size={14} /> Open AI tutor
            </button>
          </div>
        </div>
      </div>

      {/* Hero row: 12fr/5fr */}
      <div style={{ display: 'grid', gridTemplateColumns: '12fr 5fr', gap: 'var(--gap-md)' }}>
        {/* Up next hero card */}
        <div style={{ ...cardStyle, background: 'linear-gradient(135deg, color-mix(in oklab, var(--accent) 8%, var(--bg-surface)), var(--bg-surface))', display: 'flex', flexDirection: 'column', gap: 0 }}>
          {loading ? (
            <div style={{ color: 'var(--fg-muted)', fontSize: 14 }}>Loading…</div>
          ) : nextLesson ? (
            <>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--accent)' }}>
                Up next · in {formatRelativeTime(nextLesson.scheduled_at)}
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'var(--font-display-style)', fontWeight: 'var(--font-display-weight)' as any, fontSize: 36, color: 'var(--fg-strong)', marginTop: 10, lineHeight: 1.1 }}>
                {nextLesson.title}
              </div>
              <div style={{ color: 'var(--fg-muted)', marginTop: 10, fontSize: 14 }}>
                <strong style={{ color: 'var(--fg-strong)', fontWeight: 600 }}>{nextLesson.class_name}</strong>
                {nextLesson.tutor_name ? ` · ${nextLesson.tutor_name}` : ''}
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
                <button
                  style={btnPrimary}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = ''; }}
                  onClick={() => navigate(`/dashboard/courses`)}
                >
                  Open lesson plan <ArrowRight size={13} />
                </button>
                <button
                  style={btnGhost}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = ''; }}
                  onClick={() => navigate('/dashboard/calendar')}
                >
                  <CalendarDays size={13} /> Calendar
                </button>
              </div>
            </>
          ) : (
            <>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--fg-muted)' }}>No upcoming lessons</div>
              <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'var(--font-display-style)', fontWeight: 'var(--font-display-weight)' as any, fontSize: 28, color: 'var(--fg-strong)', marginTop: 10, lineHeight: 1.1 }}>
                All clear for now
              </div>
              <div style={{ color: 'var(--fg-muted)', marginTop: 10, fontSize: 14 }}>No lessons scheduled — check back later or contact your admin.</div>
            </>
          )}
        </div>

        {/* Mini stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-md)' }}>
          <StatTile
            label="Homework due"
            value={loading ? '…' : String(openHomework.length).padStart(2, '0')}
            footRight="open tasks"
          />
          <StatTile
            label="Attendance"
            value={loading ? '…' : attendanceRate !== null ? `${attendanceRate}%` : '—'}
            footRight={portal ? `${portal.attendance.total_lessons} lessons` : undefined}
          />
        </div>
      </div>

      {/* Course cards */}
      {(loading || classes.length > 0) && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--gap-md)' }}>
          {loading
            ? [1, 2].map((i) => (
                <div key={i} style={{ ...cardStyle, minHeight: 160, opacity: 0.4 }} />
              ))
            : classes.map((c) => (
                <div key={c.class_id} style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--fg-muted)' }}>
                      {c.tutor_name ?? 'Tutor TBA'}
                    </div>
                    {c.next_lesson && (
                      <Tag variant="accent">
                        Next · {formatRelativeTime(c.next_lesson.scheduled_at)}
                      </Tag>
                    )}
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'var(--font-display-style)', fontWeight: 'var(--font-display-weight)' as any, fontSize: 26, color: 'var(--fg-strong)', lineHeight: 1.1, letterSpacing: '-0.015em' }}>
                    {c.class_name}
                  </div>
                  {c.subject && (
                    <div style={{ fontSize: 13, color: 'var(--fg-muted)' }}>{c.subject}</div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginTop: 4 }}>
                    <button style={btnQuiet} onClick={() => navigate('/dashboard/courses')}>
                      Open <ArrowUpRight size={13} />
                    </button>
                  </div>
                </div>
              ))}
        </div>
      )}

      {/* Homework + reports: 8-4 */}
      <div style={{ display: 'grid', gridTemplateColumns: '8fr 4fr', gap: 'var(--gap-md)' }}>
        {/* Homework card */}
        <div style={cardFlushStyle}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '16px 22px', borderBottom: '1px solid var(--border-faint)' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg-strong)' }}>Homework</div>
              <div style={{ fontSize: 12.5, color: 'var(--fg-muted)', marginTop: 2 }}>
                {loading ? 'Loading…' : `${openHomework.length} open · ${doneHomework.length} submitted recently`}
              </div>
            </div>
            <button style={btnQuiet} onClick={() => navigate('/dashboard/homework')}>
              View all <ArrowRight size={13} />
            </button>
          </div>

          {loading && (
            <div style={{ padding: '32px 22px', textAlign: 'center', color: 'var(--fg-muted)', fontSize: 14 }}>
              Loading homework…
            </div>
          )}

          {!loading && openHomework.length === 0 && doneHomework.length === 0 && (
            <div style={{ padding: '32px 22px', textAlign: 'center', color: 'var(--fg-muted)', fontSize: 14 }}>
              No homework tasks yet.
            </div>
          )}

          {!loading && [...openHomework.slice(0, 3), ...doneHomework.slice(0, 2)].map((h, i, arr) => {
            const isOpen = openHomework.some(oh => oh.id === h.id);
            const submitted = !isOpen ? doneHomework.find(dh => dh.id === h.id) : null;
            return (
              <div
                key={h.id}
                style={{ display: 'grid', gridTemplateColumns: '80px 1fr auto', alignItems: 'center', gap: 16, padding: '14px 22px', borderBottom: i < arr.length - 1 ? '1px solid var(--border-faint)' : undefined, transition: 'background 140ms ease' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: isOpen ? 'var(--warn)' : 'var(--ok)' }}>
                    {isOpen ? 'Open' : 'Submitted'}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--fg-muted)', marginTop: 2 }}>
                    {isOpen ? formatDueDate(h.due_at) : submitted?.submitted_at ? formatRelativeTime(submitted.submitted_at) + ' ago' : '—'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--fg-strong)' }}>{h.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginTop: 2 }}>
                    {h.class_name}
                    {submitted?.grade ? ` · grade: ${submitted.grade}` : ''}
                  </div>
                </div>
                <div>
                  {isOpen
                    ? <button style={{ ...btnPrimary, height: 32, fontSize: 12 }} onClick={() => navigate('/dashboard/homework')}>Submit</button>
                    : <Tag variant="ok">{submitted?.grade ?? '✓'}</Tag>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Reports / attendance card */}
        <div style={cardStyle}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg-strong)', marginBottom: 4 }}>Progress reports</div>
          <div style={{ fontSize: 12.5, color: 'var(--fg-muted)', marginBottom: 16 }}>
            {loading ? 'Loading…' : reports.length > 0 ? `${reports.length} published report${reports.length === 1 ? '' : 's'}` : 'No reports published yet.'}
          </div>

          {!loading && reports.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {reports.slice(0, 3).map((r) => (
                <div key={r.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'var(--fg-default)' }}>
                    {r.period ?? r.class_name ?? `Report ${r.id}`}
                  </span>
                  <span style={{ fontWeight: 600, color: 'var(--fg-strong)', fontFamily: 'var(--font-mono)', fontSize: 12.5, fontFeatureSettings: '"tnum" 1' }}>
                    {r.grade ?? (r.score !== null ? `${r.score}%` : '—')}
                  </span>
                </div>
              ))}
            </div>
          )}

          {!loading && reports.length > 0 && (
            <>
              <div style={{ height: 1, background: 'var(--border-faint)', margin: '16px 0' }} />
              <button
                style={{ ...btnQuiet, width: '100%', justifyContent: 'center' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--fg-strong)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--fg-muted)'; }}
                onClick={() => navigate('/dashboard/reports')}
              >
                View all reports <ArrowRight size={13} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
