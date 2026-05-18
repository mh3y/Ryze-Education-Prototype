/**
 * ParentReportsPage — /dashboard/reports for parents.
 * Redesigned to match design handoff spec.
 */

import React from 'react';
import { Download, TrendingUp, TrendingDown } from 'lucide-react';

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

const StatTile: React.FC<{ label: string; value: string; deltaText?: string; deltaDir?: 'up' | 'down'; footRight?: string }> = ({ label, value, deltaText, deltaDir, footRight }) => (
  <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-faint)', borderRadius: 14, minHeight: 134, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14, boxShadow: 'var(--shadow-card)' }}>
    <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--fg-muted)' }}>{label}</div>
    <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'var(--font-display-style)', fontWeight: 'var(--font-display-weight)' as any, fontSize: 44, color: 'var(--fg-strong)', lineHeight: 1, fontFeatureSettings: '"tnum" 1' }}>{value}</div>
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

const btnPrimary: React.CSSProperties = { height: 32, padding: '0 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--accent)', color: 'var(--accent-fg)', border: 'none', cursor: 'pointer' };
const btnGhost: React.CSSProperties   = { height: 38, padding: '0 14px', borderRadius: 9, fontSize: 13, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--bg-surface)', color: 'var(--fg-default)', border: '1px solid var(--border-soft)', cursor: 'pointer' };
const btnQuiet: React.CSSProperties   = { height: 32, padding: '0 10px', borderRadius: 8, fontSize: 12, fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 6, background: 'transparent', color: 'var(--fg-muted)', border: 'none', cursor: 'pointer' };

const REPORTS = [
  { id: 'R-238', kid: 'Amelia Tran', term: 'Term 2 · 2026', tutor: 'Daniel Kwok',  state: 'ready',    when: '2d ago' },
  { id: 'R-235', kid: 'Liam Tran',   term: 'Term 2 · 2026', tutor: 'Priya Aiyar',  state: 'draft',    when: '—' },
  { id: 'R-211', kid: 'Amelia Tran', term: 'Term 1 · 2026', tutor: 'Daniel Kwok',  state: 'archived', when: '3 mo ago' },
  { id: 'R-209', kid: 'Liam Tran',   term: 'Term 1 · 2026', tutor: 'Priya Aiyar',  state: 'archived', when: '3 mo ago' },
  { id: 'R-187', kid: 'Amelia Tran', term: 'Term 4 · 2025', tutor: 'Daniel Kwok',  state: 'archived', when: '6 mo ago' },
];

const reportStateVariant = (state: string): TagVariant => {
  if (state === 'ready')    return 'ok';
  if (state === 'draft')    return 'info';
  return 'default';
};
const reportStateLabel = (state: string) => {
  if (state === 'ready')    return 'Ready';
  if (state === 'draft')    return 'In progress';
  return 'Archived';
};

const ParentReportsPage: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-lg)' }}>
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 10 }}>Across both children</div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'var(--font-display-style)', fontWeight: 'var(--font-display-weight)' as any, fontSize: 'clamp(38px, 3.5vw, 54px)', lineHeight: 1.08, letterSpacing: '-0.018em', color: 'var(--fg-strong)', margin: 0 }}>Progress reports</h1>
          <p style={{ fontSize: 14, color: 'var(--fg-muted)', margin: '10px 0 0' }}>Term-by-term reports written by your children's tutors. New reports appear automatically when finalised.</p>
        </div>
      </div>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--gap-md)' }}>
      <StatTile label="Ready to read" value="01" deltaText="new" deltaDir="up" footRight="Amelia · Term 2" />
      <StatTile label="In progress"   value="01" footRight="Liam · Term 2" />
      <StatTile label="Archived"      value="03" footRight="all terms" />
      <StatTile label="Avg sentiment" value="A−" footRight="encouraging" />
    </div>

    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-faint)', borderRadius: 16, overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 22px', borderBottom: '1px solid var(--border-faint)', flexWrap: 'wrap' }}>
        {['All', 'Amelia Tran', 'Liam Tran'].map((f, i) => (
          <button key={f} style={{ padding: '6px 14px', borderRadius: 9, fontSize: 12.5, fontWeight: 600, border: `1px solid ${i === 0 ? 'color-mix(in oklab, var(--accent) 28%, transparent)' : 'var(--border-soft)'}`, background: i === 0 ? 'var(--accent-soft)' : 'var(--bg-surface-2)', color: i === 0 ? 'var(--accent)' : 'var(--fg-muted)', cursor: 'pointer' }}>{f}</button>
        ))}
        <div style={{ flex: 1 }} />
        <button style={btnGhost}><Download size={14} /> Download all</button>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: 'var(--bg-surface-2)', borderBottom: '1px solid var(--border-soft)' }}>
            {['Report', 'Child', 'Tutor', 'Status', 'Updated', ''].map((h, i) => (
              <th key={i} style={{ padding: '10px 22px', textAlign: 'left', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--fg-muted)', width: i === 5 ? 120 : undefined }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {REPORTS.map((r, i) => (
            <tr key={r.id}
              style={{ borderBottom: i < REPORTS.length - 1 ? '1px solid var(--border-faint)' : undefined, transition: 'background 140ms ease' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              <td style={{ padding: '14px 22px' }}>
                <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--fg-strong)' }}>{r.term}</div>
                <div style={{ fontSize: 11.5, fontFamily: 'var(--font-mono)', color: 'var(--fg-muted)', marginTop: 2 }}>{r.id}</div>
              </td>
              <td style={{ padding: '14px 22px', fontSize: 13.5, color: 'var(--fg-default)' }}>{r.kid}</td>
              <td style={{ padding: '14px 22px', fontSize: 13.5, color: 'var(--fg-muted)' }}>{r.tutor}</td>
              <td style={{ padding: '14px 22px' }}><Tag variant={reportStateVariant(r.state)}>{reportStateLabel(r.state)}</Tag></td>
              <td style={{ padding: '14px 22px', fontSize: 13.5, color: 'var(--fg-muted)' }}>{r.when}</td>
              <td style={{ padding: '14px 22px' }}>
                {r.state === 'ready'
                  ? <button style={btnPrimary}>Read</button>
                  : r.state === 'draft'
                    ? <button style={{ ...btnQuiet, opacity: 0.6 }} disabled>Pending</button>
                    : <button style={btnQuiet}>Open</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default ParentReportsPage;
