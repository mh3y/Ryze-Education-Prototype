/**
 * ParentDashboard — /dashboard/overview for parents.
 *
 * Loads live data from GET /api/parent/portal via parentApi.
 * Falls back gracefully when the API is unavailable (shows empty state).
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Mail, ArrowUpRight, ArrowRight, TrendingUp, TrendingDown, Users, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { parentApi, ParentPortalPayload, PortalChild } from '../../services/parentApi';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getFirstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

type TagVariant = 'ok' | 'warn' | 'info' | 'accent' | 'default';

const tagStyles: Record<TagVariant, React.CSSProperties> = {
  ok:      { color: 'var(--ok)',     background: 'color-mix(in oklab, var(--ok) 12%, transparent)',   border: '1px solid color-mix(in oklab, var(--ok) 26%, transparent)' },
  warn:    { color: 'var(--warn)',   background: 'color-mix(in oklab, var(--warn) 12%, transparent)', border: '1px solid color-mix(in oklab, var(--warn) 26%, transparent)' },
  info:    { color: 'var(--info)',   background: 'color-mix(in oklab, var(--info) 14%, transparent)', border: '1px solid color-mix(in oklab, var(--info) 28%, transparent)' },
  accent:  { color: 'var(--accent)', background: 'var(--accent-soft)', border: '1px solid color-mix(in oklab, var(--accent) 26%, transparent)' },
  default: { color: 'var(--fg-default)', background: 'var(--bg-hover)', border: '1px solid var(--border-soft)' },
};

const Tag: React.FC<{ variant: TagVariant; children: React.ReactNode }> = ({ variant, children }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', padding: '4px 9px', borderRadius: 999, ...tagStyles[variant] }}>
    {children}
  </span>
);

const StatTile: React.FC<{ label: string; value: string; deltaText?: string; deltaDir?: 'up' | 'down'; footRight?: string }> = ({ label, value, deltaText, deltaDir, footRight }) => (
  <div
    style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-faint)', borderRadius: 14, minHeight: 134, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14, boxShadow: 'var(--shadow-card)', transition: 'border-color 140ms ease', cursor: 'default' }}
    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-strong)'; }}
    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-faint)'; }}
  >
    <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--fg-muted)' }}>{label}</div>
    <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 500, fontSize: 44, color: 'var(--fg-strong)', lineHeight: 1, fontFeatureSettings: '"tnum" 1' }}>{value}</div>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
      {deltaText ? (
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: deltaDir === 'up' ? 'var(--ok)' : 'var(--danger)' }}>
          {deltaDir === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {deltaText}
        </span>
      ) : <span />}
      {footRight && <span style={{ color: 'var(--fg-faint)' }}>{footRight}</span>}
    </div>
  </div>
);

const btnPrimary: React.CSSProperties = { height: 38, padding: '0 14px', borderRadius: 9, fontSize: 13, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--accent)', color: 'var(--accent-fg)', border: 'none', cursor: 'pointer', boxShadow: '0 6px 18px -10px color-mix(in oklab, var(--accent) 70%, transparent)', transition: 'transform 140ms ease' };
const btnGhost: React.CSSProperties  = { height: 38, padding: '0 14px', borderRadius: 9, fontSize: 13, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--bg-surface)', color: 'var(--fg-default)', border: '1px solid var(--border-soft)', cursor: 'pointer', transition: 'transform 140ms ease' };
const btnQuiet: React.CSSProperties  = { height: 34, padding: '0 10px', borderRadius: 8, fontSize: 12, fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 6, background: 'transparent', color: 'var(--fg-muted)', border: 'none', cursor: 'pointer', transition: 'color 140ms ease' };

const AVATAR_COLOURS = [
  { bg: 'color-mix(in oklab, var(--accent) 22%, var(--bg-surface))', fg: '#b8841e' },
  { bg: 'color-mix(in oklab, var(--info) 22%, var(--bg-surface))',   fg: '#5e7fb3' },
  { bg: 'color-mix(in oklab, var(--ok) 22%, var(--bg-surface))',     fg: '#4f9b6a' },
  { bg: 'color-mix(in oklab, #8669c2 22%, var(--bg-surface))',       fg: '#8669c2' },
];

// ---------------------------------------------------------------------------
// Child card
// ---------------------------------------------------------------------------

const ChildCard: React.FC<{ child: PortalChild; index: number }> = ({ child, index }) => {
  const av = AVATAR_COLOURS[index % AVATAR_COLOURS.length];
  const nextClass = child.classes.find((c) => c.next_lesson);
  const latestReport = child.latest_reports[0];

  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-faint)', borderRadius: 16, padding: 'var(--card-pad)', boxShadow: 'var(--shadow-card)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: av.bg, color: av.fg, display: 'grid', placeItems: 'center', fontSize: 15, fontWeight: 700, flexShrink: 0 }}>
            {getInitials(child.student_name)}
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 500, fontSize: 22, color: 'var(--fg-strong)', lineHeight: 1.1 }}>{child.student_name}</div>
            <div style={{ fontSize: 12.5, color: 'var(--fg-muted)', marginTop: 2 }}>
              {[child.year_level, child.school].filter(Boolean).join(' · ') || 'No year/school set'}
            </div>
          </div>
        </div>
        <button style={btnQuiet}>Open profile <ArrowUpRight size={13} /></button>
      </div>

      <div style={{ height: 1, background: 'var(--border-faint)', margin: '18px 0' }} />

      {[
        ['Currently enrolled in', child.classes.length > 0 ? child.classes.map((c) => c.class_name).join(', ') : '—'],
        ['Next lesson', nextClass?.next_lesson ? `${formatDate(nextClass.next_lesson.scheduled_at)} at ${formatTime(nextClass.next_lesson.scheduled_at)}` : '—'],
      ].map(([label, val]) => (
        <div key={label as string} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 12.5, color: 'var(--fg-muted)' }}>{label}</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-strong)' }}>{val}</span>
        </div>
      ))}

      <div style={{ height: 1, background: 'var(--border-faint)', margin: '16px 0' }} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
        {[
          ['Latest grade', latestReport ? (latestReport.grade ?? `${latestReport.score}%`) : '—'],
          ['Attendance', child.attendance_rate != null ? `${child.attendance_rate}%` : '—'],
        ].map(([label, val]) => (
          <div key={label as string}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 6 }}>{label}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 500, fontSize: 32, color: 'var(--fg-strong)', fontFeatureSettings: '"tnum" 1' }}>{val}</div>
          </div>
        ))}
      </div>

      {latestReport && (
        <Tag variant="ok">{latestReport.period} — {latestReport.grade ?? `${latestReport.score}%`}</Tag>
      )}
      {!latestReport && child.classes.length > 0 && (
        <Tag variant="info">Enrolled in {child.classes.length} class{child.classes.length !== 1 ? 'es' : ''}</Tag>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

const ParentDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate  = useNavigate();

  const [data, setData]       = useState<ParentPortalPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = await parentApi.getPortal();
      setData(payload);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load your dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const firstName  = getFirstName(data?.parent.full_name ?? user?.name ?? 'there');
  const children   = data?.children ?? [];
  const totalOutstanding = children.reduce((sum, c) => sum + c.outstanding_payments.reduce((s, p) => s + p.amount, 0), 0);
  const nextLessonCount  = children.reduce((sum, c) => sum + c.classes.filter((cl) => cl.next_lesson).length, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-lg)' }}>

      {/* PageHead */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 10 }}>Family overview</div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 500, fontSize: 'clamp(38px, 3.5vw, 54px)', lineHeight: 1.08, letterSpacing: '-0.018em', color: 'var(--fg-strong)', margin: 0 }}>
              Welcome, <span style={{ color: 'var(--accent)' }}>{firstName}</span>.
            </h1>
            <p style={{ fontSize: 14, color: 'var(--fg-muted)', margin: '10px 0 0', lineHeight: 1.55 }}>
              {loading ? 'Loading your family dashboard…' : error ? 'Dashboard unavailable — check your connection.' : children.length === 0 ? 'No children linked yet. Ask your admin to link your account.' : `${children.length} child${children.length !== 1 ? 'ren' : ''} enrolled${totalOutstanding > 0 ? ` · $${totalOutstanding.toFixed(2)} outstanding` : ' · all payments up to date'}.`}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
            {totalOutstanding > 0 && (
              <button style={btnGhost} onClick={() => navigate('/dashboard/payments')}>
                <CreditCard size={14} /> Pay ${totalOutstanding.toFixed(2)} due
              </button>
            )}
            <button style={btnPrimary}>
              <Mail size={14} /> Message tutor
            </button>
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && !loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', background: 'color-mix(in oklab, var(--danger) 8%, transparent)', border: '1px solid color-mix(in oklab, var(--danger) 24%, transparent)', borderRadius: 12, fontSize: 13, color: 'var(--danger)' }}>
          <span style={{ flex: 1 }}>{error}</span>
          <button onClick={load} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, background: 'var(--bg-surface)', border: '1px solid var(--border-soft)', fontSize: 12, fontWeight: 600, color: 'var(--fg-default)', cursor: 'pointer' }}>
            <RefreshCw size={12} /> Retry
          </button>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--gap-md)' }}>
        <StatTile label="Children enrolled" value={loading ? '—' : String(children.length).padStart(2, '0')} footRight={children.map((c) => c.student_name.split(' ')[0]).join(' · ') || undefined} />
        <StatTile label="Upcoming lessons"  value={loading ? '—' : String(nextLessonCount).padStart(2, '0')} />
        <StatTile label="Avg attendance"    value={loading ? '—' : (() => { const rates = children.map((c) => c.attendance_rate).filter((r): r is number => r !== null); return rates.length ? `${Math.round(rates.reduce((a, b) => a + b, 0) / rates.length)}%` : '—'; })()} />
        <StatTile label="Outstanding"       value={loading ? '—' : totalOutstanding > 0 ? `$${totalOutstanding.toFixed(0)}` : '$0'} deltaText={totalOutstanding > 0 ? `${children.reduce((n, c) => n + c.outstanding_payments.length, 0)} invoice${children.reduce((n, c) => n + c.outstanding_payments.length, 0) !== 1 ? 's' : ''}` : undefined} deltaDir="down" />
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--gap-md)' }}>
          {[0, 1].map((i) => (
            <div key={i} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-faint)', borderRadius: 16, height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fg-faint)', fontSize: 13 }}>
              Loading…
            </div>
          ))}
        </div>
      )}

      {/* Empty state — no children */}
      {!loading && !error && children.length === 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '48px 24px', background: 'var(--bg-surface)', border: '1px solid var(--border-faint)', borderRadius: 16, color: 'var(--fg-muted)' }}>
          <Users size={36} style={{ color: 'var(--fg-faint)' }} />
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--fg-strong)' }}>No children linked yet</div>
          <div style={{ fontSize: 13, textAlign: 'center', maxWidth: 320 }}>Your account hasn't been linked to any students yet. Please contact Ryze Education to have your children added to your account.</div>
        </div>
      )}

      {/* Child cards */}
      {!loading && children.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: children.length === 1 ? '1fr' : 'repeat(2, 1fr)', gap: 'var(--gap-md)' }}>
          {children.map((child, i) => (
            <ChildCard key={child.link_id} child={child} index={i} />
          ))}
        </div>
      )}

      {/* Outstanding payments */}
      {!loading && totalOutstanding > 0 && (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-faint)', borderRadius: 16, padding: 'var(--card-pad)', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg-strong)', marginBottom: 4 }}>Outstanding payments</div>
          <div style={{ fontSize: 12.5, color: 'var(--fg-muted)', marginBottom: 18 }}>
            {children.reduce((n, c) => n + c.outstanding_payments.length, 0)} invoice{children.reduce((n, c) => n + c.outstanding_payments.length, 0) !== 1 ? 's' : ''} to settle
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {children.flatMap((c) =>
              c.outstanding_payments.map((p) => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: 'var(--bg-surface-2)', borderRadius: 10, border: '1px solid var(--border-faint)' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg-strong)' }}>{c.student_name}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--fg-muted)', marginTop: 2 }}>
                      {p.description}{p.due_date ? ` · due ${formatDate(p.due_date)}` : ''}
                    </div>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: p.status === 'overdue' ? 'var(--danger)' : 'var(--fg-strong)', fontFamily: 'var(--font-mono)', fontFeatureSettings: '"tnum" 1' }}>
                    ${p.amount.toFixed(2)}
                  </div>
                </div>
              ))
            )}
          </div>

          <button
            style={{ ...btnPrimary, width: '100%', justifyContent: 'center', height: 42 }}
            onClick={() => navigate('/dashboard/payments')}
          >
            <CreditCard size={14} /> Pay all ${totalOutstanding.toFixed(2)}
          </button>
        </div>
      )}
    </div>
  );
};

export default ParentDashboard;
