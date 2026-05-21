/**
 * StudentHomeworkPage — /dashboard/homework for students.
 * Loads live homework data from GET /api/student/portal via studentApi.
 */

import React, { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { studentApi, StudentPortalPayload } from '../../services/studentApi';

type TagVariant = 'ok' | 'warn' | 'info' | 'default';

const tagStyles: Record<TagVariant, React.CSSProperties> = {
  ok:      { color: 'var(--ok)',     background: 'color-mix(in oklab, var(--ok) 12%, transparent)',   border: '1px solid color-mix(in oklab, var(--ok) 26%, transparent)' },
  warn:    { color: 'var(--warn)',   background: 'color-mix(in oklab, var(--warn) 12%, transparent)', border: '1px solid color-mix(in oklab, var(--warn) 26%, transparent)' },
  info:    { color: 'var(--info)',   background: 'color-mix(in oklab, var(--info) 14%, transparent)', border: '1px solid color-mix(in oklab, var(--info) 28%, transparent)' },
  default: { color: 'var(--fg-default)', background: 'var(--bg-hover)', border: '1px solid var(--border-soft)' },
};

const Tag: React.FC<{ variant: TagVariant; children: React.ReactNode }> = ({ variant, children }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', padding: '4px 9px', borderRadius: 999, ...tagStyles[variant] }}>
    {children}
  </span>
);

function formatDueDate(iso: string | null): string {
  if (!iso) return '—';
  const d    = new Date(iso);
  const now  = new Date();
  const diff = d.getTime() - now.getTime();
  if (diff < 0) return 'Overdue';
  if (diff < 86_400_000)  return 'Today';
  if (diff < 172_800_000) return 'Tomorrow';
  if (diff < 604_800_000) return d.toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' });
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
}

const btnPrimary: React.CSSProperties = { height: 32, padding: '0 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--accent)', color: 'var(--accent-fg)', border: 'none', cursor: 'pointer' };
const btnQuiet: React.CSSProperties   = { height: 32, padding: '0 10px', borderRadius: 8, fontSize: 12, fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 6, background: 'transparent', color: 'var(--fg-muted)', border: 'none', cursor: 'pointer' };
const btnGhost: React.CSSProperties   = { height: 38, padding: '0 14px', borderRadius: 9, fontSize: 13, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--bg-surface)', color: 'var(--fg-default)', border: '1px solid var(--border-soft)', cursor: 'pointer' };

const StudentHomeworkPage: React.FC = () => {
  const [portal, setPortal]   = useState<StudentPortalPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    studentApi.getPortal()
      .then(setPortal)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed to load homework.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openHW      = portal?.homework.open      ?? [];
  const submittedHW = portal?.homework.submitted ?? [];
  const allHW = [
    ...openHW.map(h => ({ ...h, state: 'open' as const,      grade: null })),
    ...submittedHW.map(h => ({ ...h, state: 'submitted' as const })),
  ];

  const submittedGraded = submittedHW.filter(h => h.grade);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-lg)' }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 10 }}>Across your courses</div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'var(--font-display-style)', fontWeight: 'var(--font-display-weight)' as any, fontSize: 'clamp(38px, 3.5vw, 54px)', lineHeight: 1.08, letterSpacing: '-0.018em', color: 'var(--fg-strong)', margin: 0 }}>Homework</h1>
            <p style={{ fontSize: 14, color: 'var(--fg-muted)', margin: '10px 0 0' }}>What's due, what's submitted, and how you scored.</p>
          </div>
          {error && (
            <button onClick={load} style={{ ...btnGhost, gap: 6 }}>
              <RefreshCw size={13} /> Retry
            </button>
          )}
        </div>
      </div>

      {/* Stat row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--gap-md)' }}>
        {[
          { label: 'Due / open',  value: loading ? '…' : String(openHW.length).padStart(2, '0') },
          { label: 'Submitted',   value: loading ? '…' : String(submittedHW.length).padStart(2, '0'), footRight: 'this term' },
          { label: 'Graded',      value: loading ? '…' : String(submittedGraded.length).padStart(2, '0') },
        ].map(({ label, value, footRight }) => (
          <div key={label} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-faint)', borderRadius: 14, minHeight: 120, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 10, boxShadow: 'var(--shadow-card)' }}>
            <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--fg-muted)' }}>{label}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'var(--font-display-style)', fontWeight: 'var(--font-display-weight)' as any, fontSize: 44, color: 'var(--fg-strong)', lineHeight: 1, fontFeatureSettings: '"tnum" 1' }}>{value}</div>
            {footRight && <div style={{ fontSize: 12, color: 'var(--fg-faint)' }}>{footRight}</div>}
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-faint)', borderRadius: 16, overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 22px', borderBottom: '1px solid var(--border-faint)' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg-strong)' }}>All homework</div>
            <div style={{ fontSize: 12.5, color: 'var(--fg-muted)', marginTop: 2 }}>
              {loading ? 'Loading…' : `${openHW.length} open · ${submittedHW.length} submitted`}
            </div>
          </div>
        </div>

        {loading && (
          <div style={{ padding: '32px 22px', textAlign: 'center', color: 'var(--fg-muted)', fontSize: 14 }}>Loading homework…</div>
        )}
        {error && !loading && (
          <div style={{ padding: '32px 22px', textAlign: 'center', color: 'var(--danger)', fontSize: 14 }}>{error}</div>
        )}
        {!loading && !error && allHW.length === 0 && (
          <div style={{ padding: '32px 22px', textAlign: 'center', color: 'var(--fg-muted)', fontSize: 14 }}>No homework tasks yet.</div>
        )}

        {!loading && allHW.length > 0 && (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-surface-2)', borderBottom: '1px solid var(--border-soft)' }}>
                {['Assignment', 'Course', 'Due', 'Status', 'Grade', ''].map((h, i) => (
                  <th key={i} style={{ padding: '10px 22px', textAlign: 'left', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--fg-muted)', width: i === 5 ? 120 : undefined }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allHW.map((h, i) => (
                <tr key={h.id}
                  style={{ borderBottom: i < allHW.length - 1 ? '1px solid var(--border-faint)' : undefined, transition: 'background 140ms ease' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  <td style={{ padding: '14px 22px' }}>
                    <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--fg-strong)' }}>{h.title}</div>
                    <div style={{ fontSize: 11.5, fontFamily: 'var(--font-mono)', color: 'var(--fg-muted)', marginTop: 2 }}>#{h.id}</div>
                  </td>
                  <td style={{ padding: '14px 22px', color: 'var(--fg-muted)', fontSize: 13.5 }}>{h.class_name ?? '—'}</td>
                  <td style={{ padding: '14px 22px', color: 'var(--fg-muted)', fontSize: 13.5 }}>{formatDueDate(h.due_at)}</td>
                  <td style={{ padding: '14px 22px' }}>
                    <Tag variant={h.state === 'submitted' ? 'ok' : 'warn'}>
                      {h.state === 'submitted' ? 'Submitted' : 'Open'}
                    </Tag>
                  </td>
                  <td style={{ padding: '14px 22px', fontSize: 13.5, fontWeight: 600, color: 'var(--fg-strong)', fontFamily: 'var(--font-mono)', fontFeatureSettings: '"tnum" 1' }}>
                    {(h as any).grade ?? '—'}
                  </td>
                  <td style={{ padding: '14px 22px' }}>
                    {h.state === 'open'
                      ? <button style={btnPrimary}>Submit</button>
                      : <button style={btnQuiet}>View</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default StudentHomeworkPage;
