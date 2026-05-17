/**
 * StudentProgressPage — /dashboard/reports for students.
 * Redesigned to match design handoff spec.
 */

import React from 'react';
import { Download, TrendingUp, TrendingDown } from 'lucide-react';

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

const btnGhost: React.CSSProperties = { height: 38, padding: '0 14px', borderRadius: 9, fontSize: 13, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--bg-surface)', color: 'var(--fg-default)', border: '1px solid var(--border-soft)', cursor: 'pointer', transition: 'transform 140ms ease' };

const GRADES = [
  { topic: 'Differentiation', mark: 92, cls: 84 },
  { topic: 'Integration',     mark: 86, cls: 78 },
  { topic: 'Vectors',         mark: 88, cls: 82 },
  { topic: 'Combinatorics',   mark: 78, cls: 72 },
  { topic: 'Mechanics',       mark: 81, cls: 76 },
  { topic: 'Complex numbers', mark: 74, cls: 70 },
];

const PAST_REPORTS = ['Term 1 · 2026', 'Term 4 · 2025', 'Term 3 · 2025'];

const StudentProgressPage: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-lg)' }}>
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 10 }}>Term 2 · 2026</div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: '"Cormorant Garamond","Times New Roman",serif', fontStyle: 'italic', fontWeight: 500, fontSize: 'clamp(38px, 3.5vw, 54px)', lineHeight: 1.08, letterSpacing: '-0.018em', color: 'var(--fg-strong)', margin: 0 }}>Progress</h1>
          <p style={{ fontSize: 14, color: 'var(--fg-muted)', margin: '10px 0 0' }}>Topic-by-topic mastery, your class rank, and tutor-written progress reports.</p>
        </div>
        <button style={btnGhost} onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }} onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = ''; }}>
          <Download size={14} /> Download report
        </button>
      </div>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--gap-md)' }}>
      <StatTile label="Term average"    value="86%" deltaText="+4 vs last term" deltaDir="up" />
      <StatTile label="Class rank"      value="3"   footRight="of 8 students" />
      <StatTile label="Topics mastered" value="04"  footRight="of 6 covered" />
      <StatTile label="Tutor sentiment" value="A"   footRight="excellent" />
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '8fr 4fr', gap: 'var(--gap-md)' }}>
      {/* Topic mastery */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-faint)', borderRadius: 16, overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
        <div style={{ padding: '16px 22px', borderBottom: '1px solid var(--border-faint)' }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg-strong)' }}>Topic mastery</div>
          <div style={{ fontSize: 12.5, color: 'var(--fg-muted)', marginTop: 2 }}>Your mark vs the class average for each topic covered this term.</div>
        </div>
        <div style={{ padding: '8px 22px 22px' }}>
          {GRADES.map((g) => (
            <div key={g.topic} style={{ display: 'grid', gridTemplateColumns: '200px 1fr 80px', alignItems: 'center', gap: 16, padding: '12px 0', borderBottom: '1px solid var(--border-faint)' }}>
              <div style={{ fontSize: 13.5, color: 'var(--fg-default)' }}>{g.topic}</div>
              <div style={{ position: 'relative', height: 8, borderRadius: 999, background: 'var(--bg-surface-2)' }}>
                {/* Class avg bar */}
                <div style={{ position: 'absolute', inset: 0, width: `${g.cls}%`, background: 'var(--bg-elevated)', borderRadius: 999 }} />
                {/* Your bar */}
                <div style={{ position: 'absolute', inset: 0, width: `${g.mark}%`, background: 'linear-gradient(90deg, var(--accent), color-mix(in oklab, var(--accent) 65%, #fff))', borderRadius: 999 }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-strong)', fontFamily: 'var(--font-mono)', fontFeatureSettings: '"tnum" 1' }}>{g.mark}%</span>
                <span style={{ fontSize: 11.5, color: 'var(--fg-muted)', fontFamily: 'var(--font-mono)', fontFeatureSettings: '"tnum" 1' }}>cls {g.cls}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tutor note */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-faint)', borderRadius: 16, padding: 'var(--card-pad)', boxShadow: 'var(--shadow-card)' }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg-strong)', marginBottom: 4 }}>Tutor note</div>
        <div style={{ fontSize: 12.5, color: 'var(--fg-muted)', marginBottom: 16 }}>From Daniel Kwok · 2 days ago</div>
        <p style={{ fontFamily: '"Cormorant Garamond","Times New Roman",serif', fontStyle: 'italic', fontSize: 18, color: 'var(--fg-strong)', lineHeight: 1.4, margin: 0 }}>
          "Amelia continues to lead the class on differentiation. Push her on harder integration cases next term — the foundation is there."
        </p>
        <div style={{ height: 1, background: 'var(--border-faint)', margin: '20px 0' }} />
        <div style={{ fontSize: 13, color: 'var(--fg-muted)', marginBottom: 12 }}>Past reports</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {PAST_REPORTS.map((t) => (
            <button key={t} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-faint)', background: 'none', border: 'none', cursor: 'pointer', borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: 'var(--border-faint)' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-strong)' }}>{t}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--fg-muted)' }}><Download size={12} /> PDF</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default StudentProgressPage;
