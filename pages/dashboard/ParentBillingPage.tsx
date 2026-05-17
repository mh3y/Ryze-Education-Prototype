/**
 * ParentBillingPage — /dashboard/payments for parents.
 * Redesigned to match design handoff spec.
 */

import React from 'react';
import { Download, CreditCard, MoreHorizontal, TrendingUp, TrendingDown } from 'lucide-react';

type TagVariant = 'ok' | 'warn' | 'default';

const tagStyles: Record<TagVariant, React.CSSProperties> = {
  ok:      { color: 'var(--ok)',     background: 'color-mix(in oklab, var(--ok) 12%, transparent)',   border: '1px solid color-mix(in oklab, var(--ok) 26%, transparent)' },
  warn:    { color: 'var(--warn)',   background: 'color-mix(in oklab, var(--warn) 12%, transparent)', border: '1px solid color-mix(in oklab, var(--warn) 26%, transparent)' },
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

const btnPrimary: React.CSSProperties = { height: 38, padding: '0 14px', borderRadius: 9, fontSize: 13, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--accent)', color: 'var(--accent-fg)', border: 'none', cursor: 'pointer', boxShadow: '0 6px 18px -10px color-mix(in oklab, var(--accent) 70%, transparent)' };
const btnGhost: React.CSSProperties  = { height: 38, padding: '0 14px', borderRadius: 9, fontSize: 13, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--bg-surface)', color: 'var(--fg-default)', border: '1px solid var(--border-soft)', cursor: 'pointer' };
const btnQuiet: React.CSSProperties  = { height: 34, padding: '0 8px', borderRadius: 8, fontSize: 12, fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 6, background: 'transparent', color: 'var(--fg-muted)', border: 'none', cursor: 'pointer' };

const INVOICES = [
  { id: 'INV-2840', kid: 'Amelia Tran', amount: 540, due: 'Tomorrow',  state: 'due',  period: 'May 2026' },
  { id: 'INV-2841', kid: 'Liam Tran',   amount: 320, due: 'In 3 days', state: 'due',  period: 'May 2026' },
  { id: 'INV-2820', kid: 'Amelia Tran', amount: 540, due: 'Paid',      state: 'paid', period: 'Apr 2026' },
  { id: 'INV-2819', kid: 'Liam Tran',   amount: 320, due: 'Paid',      state: 'paid', period: 'Apr 2026' },
  { id: 'INV-2799', kid: 'Amelia Tran', amount: 540, due: 'Paid',      state: 'paid', period: 'Mar 2026' },
  { id: 'INV-2798', kid: 'Liam Tran',   amount: 320, due: 'Paid',      state: 'paid', period: 'Mar 2026' },
];

// Simple bar chart mock
const MONTHLY_SPEND = [480, 520, 640, 860, 860, 720, 860, 860];

const ParentBillingPage: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-lg)' }}>
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 10 }}>Your account</div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: '"Cormorant Garamond","Times New Roman",serif', fontStyle: 'italic', fontWeight: 500, fontSize: 'clamp(38px, 3.5vw, 54px)', lineHeight: 1.08, letterSpacing: '-0.018em', color: 'var(--fg-strong)', margin: 0 }}>Billing</h1>
          <p style={{ fontSize: 14, color: 'var(--fg-muted)', margin: '10px 0 0' }}>Tuition invoices, payment method and your monthly billing history with Ryze.</p>
        </div>
        <button style={btnGhost}><Download size={14} /> Statement (PDF)</button>
      </div>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--gap-md)' }}>
      <StatTile label="Outstanding" value="$860"   deltaText="due tomorrow" deltaDir="down" />
      <StatTile label="This month"  value="$860"   footRight="2 invoices" />
      <StatTile label="YTD spend"   value="$3,140" footRight="across both" />
      <StatTile label="Auto-pay"    value="On"     footRight="Visa •• 4242" />
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '12fr 5fr', gap: 'var(--gap-md)' }}>
      {/* Invoice table */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-faint)', borderRadius: 16, overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 22px', borderBottom: '1px solid var(--border-faint)', flexWrap: 'wrap' }}>
          {['All', 'Due', 'Paid'].map((f, i) => (
            <button key={f} style={{ padding: '6px 14px', borderRadius: 9, fontSize: 12.5, fontWeight: 600, border: `1px solid ${i === 0 ? 'color-mix(in oklab, var(--accent) 28%, transparent)' : 'var(--border-soft)'}`, background: i === 0 ? 'var(--accent-soft)' : 'var(--bg-surface-2)', color: i === 0 ? 'var(--accent)' : 'var(--fg-muted)', cursor: 'pointer' }}>{f}</button>
          ))}
          <div style={{ flex: 1 }} />
          <button style={btnPrimary}><CreditCard size={14} /> Pay $860</button>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-surface-2)', borderBottom: '1px solid var(--border-soft)' }}>
              {['Invoice', 'Child', 'Period', 'Amount', 'Status', 'Due', ''].map((h, i) => (
                <th key={i} style={{ padding: '10px 22px', textAlign: 'left', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--fg-muted)', width: i === 6 ? 40 : undefined }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {INVOICES.map((iv, i) => (
              <tr key={iv.id}
                style={{ borderBottom: i < INVOICES.length - 1 ? '1px solid var(--border-faint)' : undefined, transition: 'background 140ms ease' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                <td style={{ padding: '14px 22px', fontFamily: 'var(--font-mono)', fontSize: 12.5, fontWeight: 600, color: 'var(--fg-strong)', fontFeatureSettings: '"tnum" 1' }}>{iv.id}</td>
                <td style={{ padding: '14px 22px', fontSize: 13.5, color: 'var(--fg-default)' }}>{iv.kid}</td>
                <td style={{ padding: '14px 22px', fontSize: 13.5, color: 'var(--fg-muted)' }}>{iv.period}</td>
                <td style={{ padding: '14px 22px', fontSize: 13.5, fontWeight: 600, color: 'var(--fg-strong)', fontFamily: 'var(--font-mono)', fontFeatureSettings: '"tnum" 1' }}>${iv.amount}</td>
                <td style={{ padding: '14px 22px' }}><Tag variant={iv.state === 'paid' ? 'ok' : 'warn'}>{iv.state === 'paid' ? 'Paid' : 'Due'}</Tag></td>
                <td style={{ padding: '14px 22px', fontSize: 13.5, color: 'var(--fg-muted)' }}>{iv.due}</td>
                <td style={{ padding: '14px 22px' }}><button style={btnQuiet}><MoreHorizontal size={16} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Side panel */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-faint)', borderRadius: 16, padding: 'var(--card-pad)', boxShadow: 'var(--shadow-card)' }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg-strong)', marginBottom: 4 }}>Spend by month</div>
        <div style={{ fontSize: 12.5, color: 'var(--fg-muted)', marginBottom: 18 }}>Last 8 months</div>

        {/* Mini bar chart */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 100, marginBottom: 8 }}>
          {MONTHLY_SPEND.map((val, i) => {
            const maxVal = Math.max(...MONTHLY_SPEND);
            const h = (val / maxVal) * 100;
            const isLast = i === MONTHLY_SPEND.length - 1;
            return (
              <div key={i} style={{ flex: 1, borderRadius: '4px 4px 0 0', height: `${h}%`, background: isLast ? 'color-mix(in oklab, var(--accent) 50%, transparent)' : 'linear-gradient(180deg, var(--accent), color-mix(in oklab, var(--accent) 65%, #5b3d10))' }} />
            );
          })}
        </div>

        <div style={{ height: 1, background: 'var(--border-faint)', margin: '20px 0' }} />

        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg-strong)', marginBottom: 4 }}>Payment method</div>
        <div style={{ fontSize: 12.5, color: 'var(--fg-muted)', marginBottom: 14 }}>Used for automatic monthly billing.</div>

        {/* Credit card panel */}
        <div style={{ padding: 18, borderRadius: 12, background: 'linear-gradient(135deg, #0d1119, #1a2030)', color: '#fff', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div style={{ fontFamily: '"Cormorant Garamond","Times New Roman",serif', fontStyle: 'italic', fontSize: 20, fontWeight: 500 }}>Visa</div>
            <button style={{ ...btnQuiet, color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>Change</button>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, letterSpacing: '0.12em', margin: '20px 0 10px', fontFeatureSettings: '"tnum" 1' }}>•••• •••• •••• 4242</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>Expires 08 / 28</div>
        </div>
      </div>
    </div>
  </div>
);

export default ParentBillingPage;
