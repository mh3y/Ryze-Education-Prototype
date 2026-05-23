/**
 * ParentReportsPage — /dashboard/reports for parents.
 * Loads live report data from GET /api/parent/portal via parentApi.
 */

import React, { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { parentApi, ParentPortalPayload } from '../../services/parentApi';

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

function formatRelativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 86_400_000)   return 'Today';
  if (diff < 172_800_000)  return 'Yesterday';
  if (diff < 604_800_000)  return `${Math.round(diff / 86_400_000)} days ago`;
  if (diff < 2_592_000_000) return `${Math.round(diff / 604_800_000)} wk ago`;
  return new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
}

const btnGhost: React.CSSProperties   = { height: 38, padding: '0 14px', borderRadius: 9, fontSize: 13, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--bg-surface)', color: 'var(--fg-default)', border: '1px solid var(--border-soft)', cursor: 'pointer' };
const btnQuiet: React.CSSProperties   = { height: 32, padding: '0 10px', borderRadius: 8, fontSize: 12, fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 6, background: 'transparent', color: 'var(--fg-muted)', border: 'none', cursor: 'pointer' };

const ParentReportsPage: React.FC = () => {
  const [portal, setPortal]       = useState<ParentPortalPayload | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [childFilter, setChildFilter] = useState<string>('all');

  const load = () => {
    setLoading(true);
    setError(null);
    parentApi.getPortal()
      .then(setPortal)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed to load reports.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const children = portal?.children ?? [];

  // Flatten all reports across all children
  interface FlatReport {
    id: number;
    child_name: string;
    period: string | null;
    score: number | null;
    grade: string | null;
    created_at: string;
  }

  const allReports: FlatReport[] = children.flatMap((child) =>
    child.latest_reports.map((r) => ({
      id: r.id,
      child_name: child.student_name,
      period: r.period,
      score: r.score,
      grade: r.grade,
      created_at: r.created_at,
    }))
  );

  const filtered = childFilter === 'all'
    ? allReports
    : allReports.filter(r => r.child_name === childFilter);

  const reportsCount = allReports.length;
  const withGrades   = allReports.filter(r => r.grade || r.score !== null).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-lg)' }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 10 }}>
          {loading ? '…' : `Across ${children.length} child${children.length === 1 ? '' : 'ren'}`}
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'var(--font-display-style)', fontWeight: 'var(--font-display-weight)' as any, fontSize: 'clamp(38px, 3.5vw, 54px)', lineHeight: 1.08, letterSpacing: '-0.018em', color: 'var(--fg-strong)', margin: 0 }}>Progress reports</h1>
            <p style={{ fontSize: 14, color: 'var(--fg-muted)', margin: '10px 0 0' }}>
              Term-by-term reports written by your children's tutors. New reports appear automatically when finalised.
            </p>
          </div>
          {error && (
            <button onClick={load} style={{ ...btnGhost, gap: 6 }}>
              <RefreshCw size={13} /> Retry
            </button>
          )}
        </div>
      </div>

      {/* Stat row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 160px), 1fr))', gap: 'var(--gap-md)' }}>
        {[
          { label: 'Reports',     value: loading ? '…' : String(reportsCount).padStart(2, '0') },
          { label: 'With grades', value: loading ? '…' : String(withGrades).padStart(2, '0') },
          { label: 'Children',   value: loading ? '…' : String(children.length), footRight: 'in system' },
        ].map(({ label, value, footRight }) => (
          <div key={label} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-faint)', borderRadius: 14, minHeight: 134, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14, boxShadow: 'var(--shadow-card)' }}>
            <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--fg-muted)' }}>{label}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'var(--font-display-style)', fontWeight: 'var(--font-display-weight)' as any, fontSize: 44, color: 'var(--fg-strong)', lineHeight: 1, fontFeatureSettings: '"tnum" 1' }}>{value}</div>
            {footRight && <div style={{ fontSize: 12, color: 'var(--fg-faint)' }}>{footRight}</div>}
          </div>
        ))}
      </div>

      {/* Reports table */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-faint)', borderRadius: 16, overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 22px', borderBottom: '1px solid var(--border-faint)', flexWrap: 'wrap' }}>
          <button
            onClick={() => setChildFilter('all')}
            style={{ padding: '6px 14px', borderRadius: 9, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', border: `1px solid ${childFilter === 'all' ? 'color-mix(in oklab, var(--accent) 28%, transparent)' : 'var(--border-soft)'}`, background: childFilter === 'all' ? 'var(--accent-soft)' : 'var(--bg-surface-2)', color: childFilter === 'all' ? 'var(--accent)' : 'var(--fg-muted)' }}
          >
            All
          </button>
          {children.map((c) => (
            <button
              key={c.student_id}
              onClick={() => setChildFilter(c.student_name)}
              style={{ padding: '6px 14px', borderRadius: 9, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', border: `1px solid ${childFilter === c.student_name ? 'color-mix(in oklab, var(--accent) 28%, transparent)' : 'var(--border-soft)'}`, background: childFilter === c.student_name ? 'var(--accent-soft)' : 'var(--bg-surface-2)', color: childFilter === c.student_name ? 'var(--accent)' : 'var(--fg-muted)' }}
            >
              {c.student_name}
            </button>
          ))}
        </div>

        {loading && (
          <div style={{ padding: '32px 22px', textAlign: 'center', color: 'var(--fg-muted)', fontSize: 14 }}>Loading reports…</div>
        )}
        {error && !loading && (
          <div style={{ padding: '32px 22px', textAlign: 'center', color: 'var(--danger)', fontSize: 14 }}>{error}</div>
        )}
        {!loading && !error && filtered.length === 0 && (
          <div style={{ padding: '48px 22px', textAlign: 'center', color: 'var(--fg-muted)' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>📋</div>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>No reports yet</div>
            <div style={{ fontSize: 14 }}>Reports will appear here once your children's tutors have published them.</div>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: 480, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-surface-2)', borderBottom: '1px solid var(--border-soft)' }}>
                {['Report', 'Child', 'Score', 'Grade', 'Published', ''].map((h, i) => (
                  <th key={i} style={{ padding: '10px 22px', textAlign: 'left', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--fg-muted)', width: i === 5 ? 100 : undefined }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={r.id}
                  style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border-faint)' : undefined, transition: 'background 140ms ease' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  <td style={{ padding: '14px 22px' }}>
                    <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--fg-strong)' }}>
                      {r.period ?? `Report #${r.id}`}
                    </div>
                    <div style={{ fontSize: 11.5, fontFamily: 'var(--font-mono)', color: 'var(--fg-muted)', marginTop: 2 }}>#{r.id}</div>
                  </td>
                  <td style={{ padding: '14px 22px', fontSize: 13.5, color: 'var(--fg-default)' }}>{r.child_name}</td>
                  <td style={{ padding: '14px 22px', fontSize: 13.5, fontWeight: 600, color: 'var(--fg-strong)', fontFamily: 'var(--font-mono)', fontFeatureSettings: '"tnum" 1' }}>
                    {r.score !== null ? `${r.score}%` : '—'}
                  </td>
                  <td style={{ padding: '14px 22px' }}>
                    {r.grade
                      ? <Tag variant="ok">{r.grade}</Tag>
                      : <span style={{ color: 'var(--fg-muted)', fontSize: 13 }}>—</span>}
                  </td>
                  <td style={{ padding: '14px 22px', fontSize: 13.5, color: 'var(--fg-muted)' }}>
                    {formatRelativeDate(r.created_at)}
                  </td>
                  <td style={{ padding: '14px 22px' }}>
                    <button style={btnQuiet}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParentReportsPage;
