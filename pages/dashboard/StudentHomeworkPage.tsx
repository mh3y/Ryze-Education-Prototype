/**
 * StudentHomeworkPage — /dashboard/homework for students.
 * Redesigned to match design handoff spec.
 */

import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

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
    <div style={{ fontFamily: '"Cormorant Garamond","Times New Roman",serif', fontStyle: 'italic', fontWeight: 500, fontSize: 44, color: 'var(--fg-strong)', lineHeight: 1, fontFeatureSettings: '"tnum" 1' }}>{value}</div>
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
const btnQuiet: React.CSSProperties   = { height: 32, padding: '0 10px', borderRadius: 8, fontSize: 12, fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 6, background: 'transparent', color: 'var(--fg-muted)', border: 'none', cursor: 'pointer' };

const HOMEWORK = [
  { id: 'HW-318', title: 'Inverse trig derivatives',      course: 'Maths Ext 1', due: 'Tomorrow',   state: 'open',   score: undefined },
  { id: 'HW-314', title: 'Volumes of revolution',         course: 'Maths Ext 2', due: 'Friday',     state: 'open',   score: undefined },
  { id: 'HW-315', title: 'Mechanics — projectile motion', course: 'Maths Ext 2', due: 'Mon 12 May', state: 'graded', score: '9/10' },
  { id: 'HW-311', title: 'Vectors quick sheet',           course: 'Maths Ext 2', due: 'Mon 5 May',  state: 'graded', score: '8/10' },
  { id: 'HW-309', title: 'Combinatorics review',          course: 'Maths Ext 1', due: 'Fri 2 May',  state: 'graded', score: '10/10' },
];

const StudentHomeworkPage: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-lg)' }}>
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 10 }}>Across your courses</div>
      <h1 style={{ fontFamily: '"Cormorant Garamond","Times New Roman",serif', fontStyle: 'italic', fontWeight: 500, fontSize: 'clamp(38px, 3.5vw, 54px)', lineHeight: 1.08, letterSpacing: '-0.018em', color: 'var(--fg-strong)', margin: 0 }}>Homework</h1>
      <p style={{ fontSize: 14, color: 'var(--fg-muted)', margin: '10px 0 0' }}>What's due, what's graded, and how you scored. Click any row to open the assignment.</p>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--gap-md)' }}>
      <StatTile label="Due this week" value="02" />
      <StatTile label="Submitted"     value="03" footRight="this term" />
      <StatTile label="Average score" value="86%" deltaText="+4 vs last term" deltaDir="up" />
      <StatTile label="On time"       value="100%" footRight="all 12 weeks" />
    </div>

    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-faint)', borderRadius: 16, overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 22px', borderBottom: '1px solid var(--border-faint)' }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg-strong)' }}>All homework</div>
          <div style={{ fontSize: 12.5, color: 'var(--fg-muted)', marginTop: 2 }}>Most recent first</div>
        </div>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: 'var(--bg-surface-2)', borderBottom: '1px solid var(--border-soft)' }}>
            {['Assignment', 'Course', 'Due', 'Status', 'Score', ''].map((h, i) => (
              <th key={i} style={{ padding: '10px 22px', textAlign: 'left', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--fg-muted)', width: i === 5 ? 120 : undefined }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {HOMEWORK.map((h, i) => (
            <tr key={h.id}
              style={{ borderBottom: i < HOMEWORK.length - 1 ? '1px solid var(--border-faint)' : undefined, transition: 'background 140ms ease' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              <td style={{ padding: '14px 22px' }}>
                <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--fg-strong)' }}>{h.title}</div>
                <div style={{ fontSize: 11.5, fontFamily: 'var(--font-mono)', color: 'var(--fg-muted)', marginTop: 2 }}>{h.id}</div>
              </td>
              <td style={{ padding: '14px 22px', color: 'var(--fg-muted)', fontSize: 13.5 }}>{h.course}</td>
              <td style={{ padding: '14px 22px', color: 'var(--fg-muted)', fontSize: 13.5 }}>{h.due}</td>
              <td style={{ padding: '14px 22px' }}><Tag variant={h.state === 'graded' ? 'ok' : 'warn'}>{h.state === 'graded' ? 'Graded' : 'Due'}</Tag></td>
              <td style={{ padding: '14px 22px', fontSize: 13.5, fontWeight: 600, color: 'var(--fg-strong)', fontFamily: 'var(--font-mono)', fontFeatureSettings: '"tnum" 1' }}>{h.score || '—'}</td>
              <td style={{ padding: '14px 22px' }}>
                {h.state === 'open'
                  ? <button style={btnPrimary}>Submit</button>
                  : <button style={btnQuiet}>View</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default StudentHomeworkPage;
