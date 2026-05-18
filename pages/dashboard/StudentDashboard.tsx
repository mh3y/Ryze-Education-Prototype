/**
 * StudentDashboard — /dashboard/overview for students.
 * Redesigned to match design handoff spec.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, ArrowRight, ArrowUpRight,
  CalendarDays, Star, TrendingUp, TrendingDown, Clock,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getFirstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name;
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

// Button helpers
const btnPrimary: React.CSSProperties = { height: 38, padding: '0 14px', borderRadius: 9, fontSize: 13, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--accent)', color: 'var(--accent-fg)', border: 'none', cursor: 'pointer', boxShadow: '0 6px 18px -10px color-mix(in oklab, var(--accent) 70%, transparent)', transition: 'transform 140ms ease' };
const btnGhost: React.CSSProperties  = { height: 38, padding: '0 14px', borderRadius: 9, fontSize: 13, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--bg-surface)', color: 'var(--fg-default)', border: '1px solid var(--border-soft)', cursor: 'pointer', transition: 'transform 140ms ease' };
const btnQuiet: React.CSSProperties  = { height: 34, padding: '0 10px', borderRadius: 8, fontSize: 12, fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 6, background: 'transparent', color: 'var(--fg-muted)', border: 'none', cursor: 'pointer', transition: 'color 140ms ease' };

const cardStyle: React.CSSProperties = { background: 'var(--bg-surface)', border: '1px solid var(--border-faint)', borderRadius: 16, padding: 'var(--card-pad)', boxShadow: 'var(--shadow-card)' };
const cardFlushStyle: React.CSSProperties = { ...cardStyle, padding: 0, overflow: 'hidden' };

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const STUDENT_COURSES = [
  { id: 'ext1', name: 'Maths Extension 1', tutor: 'Daniel Kwok', next: 'Tue 5:00pm', progress: 78, topic: 'Inverse trig differentiation' },
  { id: 'ext2', name: 'Maths Extension 2', tutor: 'Priya Aiyar', next: 'Thu 7:00pm', progress: 65, topic: 'Mechanics: projectile motion' },
];

const STUDENT_HOMEWORK = [
  { id: 'HW-318', title: 'Inverse trig derivatives',      course: 'Maths Ext 1', due: 'Tomorrow',  state: 'open',   score: undefined },
  { id: 'HW-314', title: 'Volumes of revolution',         course: 'Maths Ext 2', due: 'Friday',    state: 'open',   score: undefined },
  { id: 'HW-315', title: 'Mechanics — projectile motion', course: 'Maths Ext 2', due: 'Mon 12 May',state: 'graded', score: '9/10' },
  { id: 'HW-311', title: 'Vectors quick sheet',           course: 'Maths Ext 2', due: 'Mon 5 May', state: 'graded', score: '8/10' },
];

// ---------------------------------------------------------------------------
// StudentDashboard
// ---------------------------------------------------------------------------

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const firstName = getFirstName(user?.name ?? 'there');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-lg)' }}>
      {/* PageHead */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 10 }}>Year 12 — HSC</div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'var(--font-display-style)', fontWeight: 'var(--font-display-weight)' as any, fontSize: 'clamp(38px, 3.5vw, 54px)', lineHeight: 1.08, letterSpacing: '-0.018em', color: 'var(--fg-strong)', margin: 0 }}>
              Hey, <span style={{ color: 'var(--accent)' }}>{firstName}</span>.
            </h1>
            <p style={{ fontSize: 14, color: 'var(--fg-muted)', margin: '10px 0 0', lineHeight: 1.55 }}>
              Your next lesson is in 4 hours. Two homeworks are due this week, and you're in the top quartile across Extension 1 — keep it up.
            </p>
          </div>
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

      {/* Hero row: 12fr/5fr */}
      <div style={{ display: 'grid', gridTemplateColumns: '12fr 5fr', gap: 'var(--gap-md)' }}>
        {/* Up next hero card */}
        <div style={{ ...cardStyle, background: 'linear-gradient(135deg, color-mix(in oklab, var(--accent) 8%, var(--bg-surface)), var(--bg-surface))', display: 'flex', flexDirection: 'column', gap: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--accent)' }}>Up next · in 4h 12m</div>
          <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'var(--font-display-style)', fontWeight: 'var(--font-display-weight)' as any, fontSize: 36, color: 'var(--fg-strong)', marginTop: 10, lineHeight: 1.1 }}>
            Inverse trig differentiation
          </div>
          <div style={{ color: 'var(--fg-muted)', marginTop: 10, fontSize: 14 }}>
            <strong style={{ color: 'var(--fg-strong)', fontWeight: 600 }}>Maths Extension 1</strong> · Daniel Kwok · Studio B
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
            <button style={btnPrimary} onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }} onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = ''; }}>
              Open lesson plan <ArrowRight size={13} />
            </button>
            <button style={btnGhost} onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }} onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = ''; }}>
              <CalendarDays size={13} /> Add to calendar
            </button>
          </div>
        </div>

        {/* Mini stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-md)' }}>
          <StatTile label="Homework due" value="02" footRight="this week" />
          <StatTile label="Term average"  value="86%" deltaText="+4 vs last term" deltaDir="up" />
        </div>
      </div>

      {/* Course cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--gap-md)' }}>
        {STUDENT_COURSES.map((c) => (
          <div key={c.id} style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--fg-muted)' }}>{c.tutor}</div>
              <Tag variant="accent">Next · {c.next}</Tag>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'var(--font-display-style)', fontWeight: 'var(--font-display-weight)' as any, fontSize: 28, color: 'var(--fg-strong)', lineHeight: 1.1, letterSpacing: '-0.015em' }}>{c.name}</div>
            <div style={{ fontSize: 13, color: 'var(--fg-muted)' }}>Currently studying · <strong style={{ color: 'var(--fg-strong)', fontWeight: 600 }}>{c.topic}</strong></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
              <div style={{ flex: 1, height: 6, borderRadius: 999, background: 'var(--bg-surface-2)', border: '1px solid var(--border-faint)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${c.progress}%`, background: 'linear-gradient(90deg, var(--accent), color-mix(in oklab, var(--accent) 65%, #fff))', borderRadius: 999 }} />
              </div>
              <span style={{ fontSize: 12.5, fontFamily: 'var(--font-mono)', color: 'var(--fg-muted)', fontFeatureSettings: '"tnum" 1' }}>{c.progress}%</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
              <span style={{ fontSize: 12, color: 'var(--fg-faint)' }}>Through the term syllabus</span>
              <button style={btnQuiet} onClick={() => navigate('/dashboard/courses')}>Open <ArrowUpRight size={13} /></button>
            </div>
          </div>
        ))}
      </div>

      {/* Homework + streak: 8-4 */}
      <div style={{ display: 'grid', gridTemplateColumns: '8fr 4fr', gap: 'var(--gap-md)' }}>
        {/* Homework card */}
        <div style={cardFlushStyle}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '16px 22px', borderBottom: '1px solid var(--border-faint)' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg-strong)' }}>Homework</div>
              <div style={{ fontSize: 12.5, color: 'var(--fg-muted)', marginTop: 2 }}>2 due this week · 3 graded recently</div>
            </div>
            <button style={btnQuiet} onClick={() => navigate('/dashboard/homework')}>View all <ArrowRight size={13} /></button>
          </div>
          {STUDENT_HOMEWORK.slice(0, 4).map((h, i) => (
            <div key={h.id}
              style={{ display: 'grid', gridTemplateColumns: '76px 1fr auto', alignItems: 'center', gap: 16, padding: '14px 22px', borderBottom: i < 3 ? '1px solid var(--border-faint)' : undefined, transition: 'background 140ms ease' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-strong)' }}>{h.state === 'open' ? 'Open' : 'Graded'}</div>
                <div style={{ fontSize: 11, color: 'var(--fg-muted)', marginTop: 2 }}>{h.due}</div>
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--fg-strong)' }}>{h.title}</div>
                <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginTop: 2 }}>{h.course}{h.score ? ` · scored ${h.score}` : ''}</div>
              </div>
              <div>
                {h.state === 'open'
                  ? <button style={{ ...btnPrimary, height: 32, fontSize: 12 }}>Submit</button>
                  : <Tag variant="ok">{h.score}</Tag>}
              </div>
            </div>
          ))}
        </div>

        {/* Streak card */}
        <div style={cardStyle}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg-strong)', marginBottom: 4 }}>Streak</div>
          <div style={{ fontSize: 12.5, color: 'var(--fg-muted)', marginBottom: 16 }}>You're on a 12-week roll. Don't stop now.</div>
          <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'var(--font-display-style)', fontWeight: 'var(--font-display-weight)' as any, fontSize: 64, color: 'var(--accent)', letterSpacing: '-0.025em', lineHeight: 1, fontFeatureSettings: '"tnum" 1' }}>12</div>
          <div style={{ fontSize: 13, color: 'var(--fg-muted)', marginTop: 4 }}>weeks attended in a row</div>

          <div style={{ height: 1, background: 'var(--border-faint)', margin: '20px 0' }} />

          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg-strong)', marginBottom: 12 }}>This week's wins</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
            {[
              { label: 'Best score: HW-309', meta: '10/10', Icon: Star },
              { label: 'Topic mastered',     meta: 'Differentiation', Icon: TrendingUp },
              { label: 'Time on AI tutor',   meta: '2h 14m', Icon: Clock },
            ].map(({ label, meta, Icon }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--fg-default)' }}>
                  <Icon size={12} style={{ color: 'var(--accent)' }} /> {label}
                </span>
                <span style={{ fontWeight: 600, color: 'var(--fg-strong)', fontFamily: 'var(--font-mono)', fontSize: 12.5, fontFeatureSettings: '"tnum" 1' }}>{meta}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
