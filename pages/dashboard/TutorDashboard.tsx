/**
 * TutorDashboard — /dashboard/overview for tutors.
 * Redesigned to match design handoff: TutorOverview, TutorClasses,
 * TutorAttendance, TutorHomework (all in one file, rendered by role-aware route).
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardCheck, Plus, ArrowRight, ArrowUpRight,
  CalendarDays, ClipboardList, PenLine, BookOpen,
  Mail, Download, Search, Filter, ArrowUpDown, MoreHorizontal,
  TrendingUp, TrendingDown, AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

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
    <div style={{ fontFamily: '"Cormorant Garamond","Times New Roman",serif', fontStyle: 'italic', fontWeight: 500, fontSize: 44, color: 'var(--fg-strong)', lineHeight: 1, fontFeatureSettings: '"tnum" 1' }}>
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
// Mock data
// ---------------------------------------------------------------------------

const TUTOR_TODAY = [
  { id: 1, time: '16:00', end: '17:30', cls: 'Foundations · Year 10',    roster: 7,  state: 'upcoming', room: 'Studio A' },
  { id: 2, time: '18:00', end: '19:30', cls: 'Maths Advanced · Year 11', roster: 9,  state: 'upcoming', room: 'Studio A' },
];

const TUTOR_CLASSES = [
  { id: 'fnd-wed',  name: 'Foundations',       level: 'Year 10',       day: 'WED', time: '4:00 pm', size: '7 / 10', hw: '3 / 7 graded',  state: 'running' },
  { id: 'adv-mon',  name: 'Maths Advanced',    level: 'Year 11',       day: 'MON', time: '6:00 pm', size: '9 / 10', hw: 'All graded',    state: 'running' },
  { id: 'ext1-tue', name: 'Maths Extension 1', level: 'Year 12 — HSC', day: 'TUE', time: '5:00 pm', size: '8 / 8',  hw: '5 / 8 graded',  state: 'running' },
];

const TUTOR_ROSTER = [
  { id: 1, name: 'Amelia Tran',     yr: 'Year 12', initials: 'AT', colour: '',       last: 'Last lesson · present', state: 'present' },
  { id: 2, name: 'Mei Chen',        yr: 'Year 12', initials: 'MC', colour: 'blue',   last: 'Last lesson · present', state: 'present' },
  { id: 3, name: 'Hayden Wong',     yr: 'Year 12', initials: 'HW', colour: 'green',  last: 'Last lesson · present', state: 'present' },
  { id: 4, name: 'Sofia Reyes',     yr: 'Year 10', initials: 'SR', colour: 'rose',   last: 'Missed 2 lessons',      state: 'missing' },
  { id: 5, name: 'Eli Bernstein',   yr: 'Year 10', initials: 'EB', colour: 'rose',   last: 'Paused enrolment',      state: 'paused' },
  { id: 6, name: 'Priya Sharma',    yr: 'Year 9',  initials: 'PS', colour: 'purple', last: 'Last lesson · late',    state: 'late' },
  { id: 7, name: 'Lachlan O\'Brien',yr: 'Year 11', initials: 'LO', colour: 'blue',   last: 'Last lesson · present', state: 'present' },
];

const TUTOR_HOMEWORK = [
  { id: 'HW-318', title: 'Inverse trig derivatives',      cls: 'Maths Ext 1', due: 'Tomorrow',  submitted: 6, total: 8, state: 'open' },
  { id: 'HW-317', title: 'Combinatorics problem set',      cls: 'Maths Adv',  due: 'In 3 days', submitted: 4, total: 9, state: 'open' },
  { id: 'HW-316', title: 'Algebraic fractions worksheet',  cls: 'Foundations',due: 'Yesterday', submitted: 7, total: 7, state: 'grading' },
  { id: 'HW-315', title: 'Mechanics — projectile motion',  cls: 'Maths Ext 2',due: '1 week ago',submitted: 6, total: 6, state: 'graded' },
];

// ---------------------------------------------------------------------------
// Sub-pages
// ---------------------------------------------------------------------------

const TutorOverview: React.FC<{ firstName: string; todayLabel: string }> = ({ firstName, todayLabel }) => {
  const navigate = useNavigate();
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
            <h1 style={{ fontFamily: '"Cormorant Garamond","Times New Roman",serif', fontStyle: 'italic', fontWeight: 500, fontSize: 'clamp(38px, 3.5vw, 54px)', lineHeight: 1.08, letterSpacing: '-0.018em', color: 'var(--fg-strong)', margin: 0 }}>
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
        <StatTile label="Today's lessons"  value="02" footRight="Studio A · both" />
        <StatTile label="Students taught"  value="24" deltaText="+2 trial" deltaDir="up" footRight="across 3 classes" />
        <StatTile label="Hours this week"  value="12" footRight="of 16 booked" />
        <StatTile label="To grade"         value="03" deltaText="2 overdue" deltaDir="down" />
      </div>

      {/* 8-4 row */}
      <div style={{ display: 'grid', gridTemplateColumns: '8fr 4fr', gap: 'var(--gap-md)' }}>
        {/* Today's lessons */}
        <div style={cardFlushStyle}>
          <div style={cardHeadStyle}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg-strong)' }}>Your lessons today</div>
              <div style={{ fontSize: 12.5, color: 'var(--fg-muted)', marginTop: 2 }}>2 scheduled · take attendance from each row.</div>
            </div>
            <button style={btnQuiet}><span>Open week</span> <ArrowRight size={13} /></button>
          </div>
          {TUTOR_TODAY.map((l) => (
            <div key={l.id} style={{ display: 'grid', gridTemplateColumns: '76px 1fr auto', alignItems: 'center', gap: 16, padding: '14px 22px', borderBottom: '1px solid var(--border-faint)', transition: 'background 140ms ease' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--fg-strong)', fontFeatureSettings: '"tnum" 1' }}>{l.time}</div>
                <div style={{ fontSize: 11, color: 'var(--fg-muted)', marginTop: 2 }}>→ {l.end}</div>
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg-strong)' }}>{l.cls}</div>
                <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginTop: 2 }}>{l.room} · {l.roster} students enrolled</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button style={btnQuiet}><ClipboardCheck size={13} /> Mark</button>
                <Tag variant="info">Upcoming</Tag>
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
  const dayPillStyle = (day: string): React.CSSProperties => ({
    fontSize: 11, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase' as const,
    padding: '4px 10px', borderRadius: 8,
    background: 'var(--accent-soft)', color: 'var(--accent)',
    display: 'inline-block',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-lg)' }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 10 }}>My teaching</div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <h1 style={{ fontFamily: '"Cormorant Garamond","Times New Roman",serif', fontStyle: 'italic', fontWeight: 500, fontSize: 'clamp(38px, 3.5vw, 54px)', lineHeight: 1.08, letterSpacing: '-0.018em', color: 'var(--fg-strong)', margin: 0 }}>Classes</h1>
            <p style={{ fontSize: 14, color: 'var(--fg-muted)', margin: '10px 0 0' }}>Three recurring classes this term. Click any class to open the roster, attendance and homework tools.</p>
          </div>
          <button style={btnGhost}><CalendarDays size={14} /> Week view</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--gap-md)' }}>
        {TUTOR_CLASSES.map((c) => (
          <div
            key={c.id}
            style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: 0, transition: 'transform 140ms ease, border-color 140ms ease, box-shadow 140ms ease', cursor: 'pointer' }}
            onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(-2px)'; el.style.borderColor = 'var(--border-strong)'; }}
            onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.transform = ''; el.style.borderColor = 'var(--border-faint)'; }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ ...dayPillStyle(c.day) }}>{c.day}</div>
                <span style={{ fontSize: 12.5, fontFamily: 'var(--font-mono)', color: 'var(--fg-muted)', fontFeatureSettings: '"tnum" 1' }}>{c.time}</span>
              </div>
              <Tag variant="ok">Running</Tag>
            </div>
            <div style={{ fontFamily: '"Cormorant Garamond","Times New Roman",serif', fontStyle: 'italic', fontWeight: 500, fontSize: 26, color: 'var(--fg-strong)', lineHeight: 1.1, marginBottom: 6 }}>{c.name}</div>
            <div style={{ fontSize: 13, color: 'var(--fg-muted)', marginBottom: 18 }}>{c.level}</div>
            <div style={{ height: 1, background: 'var(--border-faint)', marginBottom: 18 }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 18 }}>
              {[['Size', c.size], ['Time', c.time], ['Homework', c.hw]].map(([label, val]) => (
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
        ))}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Tutor Attendance page
// ---------------------------------------------------------------------------

const TutorAttendancePage: React.FC = () => {
  const [marks, setMarks] = useState<Record<number, string>>(() =>
    Object.fromEntries(TUTOR_ROSTER.map((s) => [s.id, s.state]))
  );

  const tally = Object.values(marks).reduce((a: Record<string, number>, v) => ({ ...a, [v]: (a[v] || 0) + 1 }), {});
  const pad = (n: number) => String(n).padStart(2, '0');

  const attendanceTagVariant = (state: string): TagVariant => {
    if (state === 'present') return 'ok';
    if (state === 'missing') return 'danger';
    if (state === 'late')    return 'warn';
    return 'default';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-lg)' }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 10 }}>
          {new Date().toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Australia/Sydney' }).toUpperCase()} · STUDIO A
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <h1 style={{ fontFamily: '"Cormorant Garamond","Times New Roman",serif', fontStyle: 'italic', fontWeight: 500, fontSize: 'clamp(38px, 3.5vw, 54px)', lineHeight: 1.08, letterSpacing: '-0.018em', color: 'var(--fg-strong)', margin: 0 }}>Attendance</h1>
            <p style={{ fontSize: 14, color: 'var(--fg-muted)', margin: '10px 0 0' }}>Foundations · Year 10 — mark who's in the room.</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button style={btnGhost}>Mark all present</button>
            <button style={btnPrimary}><ClipboardCheck size={14} /> Save roll</button>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--gap-md)' }}>
        <StatTile label="Roll size"  value={pad(TUTOR_ROSTER.length)} footRight="enrolled" />
        <StatTile label="Present"    value={pad(tally.present || 0)} deltaText="Looking good" deltaDir="up" />
        <StatTile label="Late"       value={pad(tally.late || 0)} footRight="counts as present" />
        <StatTile label="Absent"     value={pad((tally.missing || 0) + (tally.paused || 0))} deltaText={(tally.missing || 0) > 0 ? 'Reminder sent' : '—'} deltaDir="down" />
      </div>

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

        {/* Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-surface-2)', borderBottom: '1px solid var(--border-soft)' }}>
              {['Student', 'Year', 'Last seen', 'Today'].map((h) => (
                <th key={h} style={{ padding: '10px 22px', textAlign: 'left', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--fg-muted)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TUTOR_ROSTER.map((s) => {
              const av = AVATAR_COLOURS[s.colour] || AVATAR_COLOURS[''];
              return (
                <tr key={s.id} style={{ borderBottom: '1px solid var(--border-faint)', transition: 'background 140ms ease' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  <td style={{ padding: '14px 22px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: '50%', background: av.bg, color: av.fg, display: 'grid', placeItems: 'center', fontSize: 12.5, fontWeight: 700, flexShrink: 0 }}>{s.initials}</div>
                      <div>
                        <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--fg-strong)' }}>{s.name}</div>
                        <div style={{ fontSize: 11.5, color: 'var(--fg-muted)', marginTop: 1 }}>{s.last}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 22px', color: 'var(--fg-muted)', fontSize: 13.5 }}>{s.yr}</td>
                  <td style={{ padding: '14px 22px' }}><Tag variant={attendanceTagVariant(s.state)}>{s.state === 'present' ? 'Active' : s.state === 'missing' ? 'Absent' : s.state === 'late' ? 'Late' : 'Paused'}</Tag></td>
                  <td style={{ padding: '14px 22px' }}>
                    <div style={{ display: 'inline-flex', background: 'var(--bg-surface-2)', border: '1px solid var(--border-soft)', borderRadius: 9, padding: 3, gap: 2 }}>
                      {['present', 'late', 'missing', 'paused'].map((v) => (
                        <button
                          key={v}
                          onClick={() => setMarks((m) => ({ ...m, [s.id]: v }))}
                          style={{ padding: '6px 14px', borderRadius: 7, fontSize: 12.5, fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'background 140ms ease, color 140ms ease, box-shadow 140ms ease', background: marks[s.id] === v ? 'var(--bg-surface)' : 'transparent', color: marks[s.id] === v ? 'var(--fg-strong)' : 'var(--fg-muted)', boxShadow: marks[s.id] === v ? '0 1px 4px rgba(0,0,0,.18)' : 'none' }}
                        >
                          {v === 'missing' ? 'Absent' : v.charAt(0).toUpperCase() + v.slice(1)}
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
  const hwStateVariant = (state: string): TagVariant => {
    if (state === 'graded')  return 'ok';
    if (state === 'grading') return 'warn';
    return 'info';
  };
  const hwStateLabel = (state: string) => state === 'graded' ? 'Graded' : state === 'grading' ? 'To grade' : 'Upcoming';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-lg)' }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 10 }}>Across your classes</div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <h1 style={{ fontFamily: '"Cormorant Garamond","Times New Roman",serif', fontStyle: 'italic', fontWeight: 500, fontSize: 'clamp(38px, 3.5vw, 54px)', lineHeight: 1.08, letterSpacing: '-0.018em', color: 'var(--fg-strong)', margin: 0 }}>Homework</h1>
            <p style={{ fontSize: 14, color: 'var(--fg-muted)', margin: '10px 0 0' }}>Assignments you've set, ordered by due date. Drill in to grade or send a reminder.</p>
          </div>
          <button style={btnPrimary}><Plus size={14} /> New homework</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--gap-md)' }}>
        <StatTile label="Open"      value="02" footRight="this week" />
        <StatTile label="To grade"  value="01" deltaText="overdue 1d" deltaDir="down" />
        <StatTile label="Graded"    value="01" footRight="this term" />
        <StatTile label="Avg score" value="78%" deltaText="+4 vs last" deltaDir="up" />
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
            {TUTOR_HOMEWORK.map((h) => {
              const pct = (h.submitted / h.total) * 100;
              return (
                <tr key={h.id} style={{ borderBottom: '1px solid var(--border-faint)', transition: 'background 140ms ease' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  <td style={{ padding: '14px 22px' }}>
                    <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--fg-strong)' }}>{h.title}</div>
                    <div style={{ fontSize: 11.5, fontFamily: 'var(--font-mono)', color: 'var(--fg-muted)', marginTop: 2 }}>{h.id}</div>
                  </td>
                  <td style={{ padding: '14px 22px', color: 'var(--fg-muted)', fontSize: 13.5 }}>{h.cls}</td>
                  <td style={{ padding: '14px 22px', minWidth: 160 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ flex: 1, height: 6, borderRadius: 999, background: 'var(--bg-surface-2)', border: '1px solid var(--border-faint)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, var(--accent), color-mix(in oklab, var(--accent) 65%, #fff))', borderRadius: 999 }} />
                      </div>
                      <span style={{ fontSize: 12.5, fontFamily: 'var(--font-mono)', color: 'var(--fg-muted)', whiteSpace: 'nowrap', fontFeatureSettings: '"tnum" 1' }}>{h.submitted}/{h.total}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 22px', color: 'var(--fg-muted)', fontSize: 13.5 }}>{h.due}</td>
                  <td style={{ padding: '14px 22px' }}><Tag variant={hwStateVariant(h.state)}>{hwStateLabel(h.state)}</Tag></td>
                  <td style={{ padding: '14px 22px', textAlign: 'right' }}>
                    <button style={{ ...btnQuiet, padding: '4px 8px' }}><MoreHorizontal size={16} /></button>
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
// Main component (route to sub-page by URL)
// ---------------------------------------------------------------------------

const TutorDashboard: React.FC = () => {
  const { user } = useAuth();
  const firstName  = getFirstName(user?.name ?? 'there');
  const todayLabel = getTodayLabel();

  // For now, the sidebar routes tutors to:
  //   /dashboard/overview   → TutorOverview
  //   /dashboard/classes     → TutorClasses   (via admin/classes — shared)
  //   /dashboard/attendance  → TutorAttendance
  //   /dashboard/homework    → TutorHomework
  // This component renders TutorOverview (the default landing).
  return <TutorOverview firstName={firstName} todayLabel={todayLabel} />;
};

export default TutorDashboard;
export { TutorClassesPage, TutorAttendancePage, TutorHomeworkPage };
