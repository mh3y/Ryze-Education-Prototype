/**
 * ParentDashboard — /dashboard/overview for parents.
 * Redesigned to match design handoff spec.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Mail, ArrowUpRight, ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

function getFirstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name;
}

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

const btnPrimary: React.CSSProperties = { height: 38, padding: '0 14px', borderRadius: 9, fontSize: 13, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--accent)', color: 'var(--accent-fg)', border: 'none', cursor: 'pointer', boxShadow: '0 6px 18px -10px color-mix(in oklab, var(--accent) 70%, transparent)', transition: 'transform 140ms ease' };
const btnGhost: React.CSSProperties  = { height: 38, padding: '0 14px', borderRadius: 9, fontSize: 13, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--bg-surface)', color: 'var(--fg-default)', border: '1px solid var(--border-soft)', cursor: 'pointer', transition: 'transform 140ms ease' };
const btnQuiet: React.CSSProperties  = { height: 34, padding: '0 10px', borderRadius: 8, fontSize: 12, fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 6, background: 'transparent', color: 'var(--fg-muted)', border: 'none', cursor: 'pointer', transition: 'color 140ms ease' };

const AVATAR_COLOURS: Record<string, { bg: string; fg: string }> = {
  '':     { bg: 'color-mix(in oklab, var(--accent) 22%, var(--bg-surface))', fg: '#b8841e' },
  blue:   { bg: 'color-mix(in oklab, var(--info) 22%, var(--bg-surface))',   fg: '#5e7fb3' },
};

const KIDS = [
  { id: 1, name: 'Amelia Tran', year: 'Year 12 — HSC', initials: 'AT', colour: '',     course: 'Maths Extension 1', next: 'Tue 5:00pm with Daniel Kwok', avg: 86, attend: 100, recent: 'Scored 10/10 on HW-309' },
  { id: 2, name: 'Liam Tran',   year: 'Year 9',        initials: 'LT', colour: 'blue', course: 'Selective Prep',    next: 'Sat 9:00am with Priya Aiyar',  avg: 74, attend: 92,  recent: 'Missed one practice paper' },
];

const SCHEDULE = [
  { day: 'Mon 13', time: '—',    title: 'No lessons today',             kid: '—',      type: 'free' },
  { day: 'Tue 14', time: '17:00',title: 'Maths Extension 1',            kid: 'Amelia', type: 'lesson' },
  { day: 'Wed 15', time: '—',    title: 'Progress check-in (online)',   kid: 'Amelia', type: 'checkin' },
  { day: 'Thu 16', time: '—',    title: 'No lessons today',             kid: '—',      type: 'free' },
  { day: 'Fri 17', time: '—',    title: 'Selective Prep — homework due',kid: 'Liam',   type: 'due' },
  { day: 'Sat 18', time: '09:00',title: 'Selective Prep',               kid: 'Liam',   type: 'lesson' },
  { day: 'Sun 19', time: '—',    title: 'Free',                         kid: '—',      type: 'free' },
];

const INVOICES_DUE = [
  { id: 'INV-2840', kid: 'Amelia Tran', amount: 540, due: 'Tomorrow',  period: 'May 2026' },
  { id: 'INV-2841', kid: 'Liam Tran',   amount: 320, due: 'In 3 days', period: 'May 2026' },
];

const ParentDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const firstName = getFirstName(user?.name ?? 'there');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-lg)' }}>
      {/* PageHead */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 10 }}>Family overview</div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'var(--font-display-style)', fontWeight: 'var(--font-display-weight)' as any, fontSize: 'clamp(38px, 3.5vw, 54px)', lineHeight: 1.08, letterSpacing: '-0.018em', color: 'var(--fg-strong)', margin: 0 }}>
              Welcome, <span style={{ color: 'var(--accent)' }}>{firstName}</span>.
            </h1>
            <p style={{ fontSize: 14, color: 'var(--fg-muted)', margin: '10px 0 0', lineHeight: 1.55 }}>
              Two children enrolled, three lessons this week, and one invoice due tomorrow. Everything else is on track.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
            <button style={btnGhost} onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }} onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = ''; }} onClick={() => navigate('/dashboard/payments')}>
              <CreditCard size={14} /> Pay $860 due
            </button>
            <button style={btnPrimary} onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }} onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = ''; }}>
              <Mail size={14} /> Message tutor
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--gap-md)' }}>
        <StatTile label="Children enrolled" value="02" footRight="Amelia · Liam" />
        <StatTile label="Lessons this week" value="03" footRight="next: Tue 5pm" />
        <StatTile label="Term average"      value="80%" deltaText="across both" deltaDir="up" />
        <StatTile label="Outstanding"       value="$860" deltaText="2 invoices" deltaDir="down" />
      </div>

      {/* Kid cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--gap-md)' }}>
        {KIDS.map((k) => {
          const av = AVATAR_COLOURS[k.colour] || AVATAR_COLOURS[''];
          return (
            <div key={k.id} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-faint)', borderRadius: 16, padding: 'var(--card-pad)', boxShadow: 'var(--shadow-card)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: av.bg, color: av.fg, display: 'grid', placeItems: 'center', fontSize: 15, fontWeight: 700, flexShrink: 0 }}>{k.initials}</div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'var(--font-display-style)', fontWeight: 'var(--font-display-weight)' as any, fontSize: 22, color: 'var(--fg-strong)', lineHeight: 1.1 }}>{k.name}</div>
                    <div style={{ fontSize: 12.5, color: 'var(--fg-muted)', marginTop: 2 }}>{k.year}</div>
                  </div>
                </div>
                <button style={btnQuiet}>Open profile <ArrowUpRight size={13} /></button>
              </div>

              <div style={{ height: 1, background: 'var(--border-faint)', margin: '18px 0' }} />

              {[['Currently enrolled in', k.course], ['Next lesson', k.next]].map(([label, val]) => (
                <div key={label as string} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontSize: 12.5, color: 'var(--fg-muted)' }}>{label}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-strong)' }}>{val}</span>
                </div>
              ))}

              <div style={{ height: 1, background: 'var(--border-faint)', margin: '16px 0' }} />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
                {[['Term avg', `${k.avg}%`], ['Attendance', `${k.attend}%`]].map(([label, val]) => (
                  <div key={label as string}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 6 }}>{label}</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'var(--font-display-style)', fontWeight: 'var(--font-display-weight)' as any, fontSize: 32, color: 'var(--fg-strong)', fontFeatureSettings: '"tnum" 1' }}>{val}</div>
                  </div>
                ))}
              </div>

              <Tag variant="ok">{k.recent}</Tag>
            </div>
          );
        })}
      </div>

      {/* Schedule + outstanding: 8-4 */}
      <div style={{ display: 'grid', gridTemplateColumns: '8fr 4fr', gap: 'var(--gap-md)' }}>
        {/* Schedule card */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-faint)', borderRadius: 16, overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 22px', borderBottom: '1px solid var(--border-faint)' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg-strong)' }}>This week's schedule</div>
              <div style={{ fontSize: 12.5, color: 'var(--fg-muted)', marginTop: 2 }}>Across both children — Mon to Sun.</div>
            </div>
            <button style={btnQuiet}>Calendar view <ArrowRight size={13} /></button>
          </div>
          {SCHEDULE.map((s, i) => (
            <div key={i}
              style={{ display: 'grid', gridTemplateColumns: '76px 1fr auto', alignItems: 'center', gap: 16, padding: '14px 22px', borderBottom: i < SCHEDULE.length - 1 ? '1px solid var(--border-faint)' : undefined, transition: 'background 140ms ease' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-strong)' }}>{s.day}</div>
                <div style={{ fontSize: 11, color: 'var(--fg-muted)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>{s.time}</div>
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: s.type === 'free' ? 'var(--fg-muted)' : 'var(--fg-strong)' }}>{s.title}</div>
                <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginTop: 2 }}>{s.kid !== '—' ? s.kid : '—'}</div>
              </div>
              <div>
                {s.type === 'lesson'  && <Tag variant="info">Upcoming</Tag>}
                {s.type === 'due'     && <Tag variant="warn">Due</Tag>}
                {s.type === 'checkin' && <Tag variant="accent">Trial</Tag>}
                {s.type === 'free'    && <Tag variant="default">Free</Tag>}
              </div>
            </div>
          ))}
        </div>

        {/* Outstanding card */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-faint)', borderRadius: 16, padding: 'var(--card-pad)', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg-strong)', marginBottom: 4 }}>Outstanding</div>
          <div style={{ fontSize: 12.5, color: 'var(--fg-muted)', marginBottom: 18 }}>2 invoices to settle</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {INVOICES_DUE.map((iv) => (
              <div key={iv.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: 'var(--bg-surface-2)', borderRadius: 10, border: '1px solid var(--border-faint)' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg-strong)' }}>{iv.kid}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--fg-muted)', marginTop: 2 }}>{iv.period} · due {iv.due.toLowerCase()}</div>
                </div>
                <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--fg-strong)', fontFeatureSettings: '"tnum" 1', fontFamily: 'var(--font-mono)' }}>${iv.amount}</div>
              </div>
            ))}
          </div>

          <div style={{ height: 1, background: 'var(--border-faint)', margin: '20px 0' }} />

          <button
            style={{ ...btnPrimary, width: '100%', justifyContent: 'center', height: 42 }}
            onClick={() => navigate('/dashboard/payments')}
          >
            <CreditCard size={14} /> Pay all $860
          </button>
          <button style={{ ...btnQuiet, width: '100%', justifyContent: 'center', marginTop: 8 }}>
            Update payment method
          </button>
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;
