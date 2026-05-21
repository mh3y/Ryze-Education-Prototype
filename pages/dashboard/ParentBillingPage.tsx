/**
 * ParentBillingPage — /dashboard/payments for parents.
 * Loads live invoice data from GET /api/parent/portal via parentApi.
 */

import React, { useEffect, useState } from 'react';
import { CreditCard, RefreshCw } from 'lucide-react';
import { parentApi, ParentPortalPayload } from '../../services/parentApi';

type TagVariant = 'ok' | 'warn' | 'danger' | 'default';

const tagStyles: Record<TagVariant, React.CSSProperties> = {
  ok:      { color: 'var(--ok)',     background: 'color-mix(in oklab, var(--ok) 12%, transparent)',     border: '1px solid color-mix(in oklab, var(--ok) 26%, transparent)' },
  warn:    { color: 'var(--warn)',   background: 'color-mix(in oklab, var(--warn) 12%, transparent)',   border: '1px solid color-mix(in oklab, var(--warn) 26%, transparent)' },
  danger:  { color: 'var(--danger)', background: 'color-mix(in oklab, var(--danger) 12%, transparent)', border: '1px solid color-mix(in oklab, var(--danger) 26%, transparent)' },
  default: { color: 'var(--fg-default)', background: 'var(--bg-hover)', border: '1px solid var(--border-soft)' },
};

const Tag: React.FC<{ variant: TagVariant; children: React.ReactNode }> = ({ variant, children }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', padding: '4px 9px', borderRadius: 999, ...tagStyles[variant] }}>
    {children}
  </span>
);

function payStatusVariant(status: string): TagVariant {
  if (status === 'paid')    return 'ok';
  if (status === 'overdue') return 'danger';
  if (status === 'pending') return 'warn';
  return 'default';
}

function payStatusLabel(status: string): string {
  const m: Record<string, string> = { paid: 'Paid', pending: 'Due', overdue: 'Overdue' };
  return m[status] ?? status;
}

function formatDueDate(iso: string | null): string {
  if (!iso) return '—';
  const d    = new Date(iso);
  const now  = new Date();
  const diff = d.getTime() - now.getTime();
  if (diff < 0) return 'Overdue';
  if (diff < 86_400_000)  return 'Today';
  if (diff < 172_800_000) return 'Tomorrow';
  if (diff < 604_800_000) return `In ${Math.round(diff / 86_400_000)} days`;
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
}

const btnGhost: React.CSSProperties   = { height: 38, padding: '0 14px', borderRadius: 9, fontSize: 13, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--bg-surface)', color: 'var(--fg-default)', border: '1px solid var(--border-soft)', cursor: 'pointer' };

type Filter = 'All' | 'Due' | 'Paid' | 'Overdue';
const FILTERS: Filter[] = ['All', 'Due', 'Paid', 'Overdue'];

const ParentBillingPage: React.FC = () => {
  const [portal, setPortal]     = useState<ParentPortalPayload | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [filter, setFilter]     = useState<Filter>('All');

  const load = () => {
    setLoading(true);
    setError(null);
    parentApi.getPortal()
      .then(setPortal)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed to load billing data.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  // Flatten all outstanding payments across all children
  interface FlatPayment {
    id: number;
    child_name: string;
    amount: number;
    description: string;
    due_date: string | null;
    status: string;
  }

  const allPayments: FlatPayment[] = (portal?.children ?? []).flatMap((child) =>
    child.outstanding_payments.map((p) => ({
      id: p.id,
      child_name: child.student_name,
      amount: p.amount_due,
      description: p.term,
      due_date: p.due_date,
      status: p.status,
    }))
  );

  const filtered = allPayments.filter((p) => {
    if (filter === 'All')     return true;
    if (filter === 'Due')     return p.status === 'pending';
    if (filter === 'Paid')    return p.status === 'paid';
    if (filter === 'Overdue') return p.status === 'overdue';
    return true;
  });

  const totalOutstanding = allPayments
    .filter(p => p.status !== 'paid')
    .reduce((s, p) => s + p.amount, 0);
  const overdueTotal = allPayments
    .filter(p => p.status === 'overdue')
    .reduce((s, p) => s + p.amount, 0);
  const pendingCount = allPayments.filter(p => p.status === 'pending' || p.status === 'overdue').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-lg)' }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 10 }}>Your account</div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'var(--font-display-style)', fontWeight: 'var(--font-display-weight)' as any, fontSize: 'clamp(38px, 3.5vw, 54px)', lineHeight: 1.08, letterSpacing: '-0.018em', color: 'var(--fg-strong)', margin: 0 }}>Billing</h1>
            <p style={{ fontSize: 14, color: 'var(--fg-muted)', margin: '10px 0 0' }}>Tuition invoices and outstanding balances for your children.</p>
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
          { label: 'Outstanding',  value: loading ? '…' : `$${totalOutstanding.toFixed(2)}`, footRight: `${pendingCount} invoice${pendingCount === 1 ? '' : 's'}` },
          { label: 'Overdue',      value: loading ? '…' : `$${overdueTotal.toFixed(2)}` },
          { label: 'Children',     value: loading ? '…' : String(portal?.children.length ?? 0), footRight: 'enrolled' },
        ].map(({ label, value, footRight }) => (
          <div key={label} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-faint)', borderRadius: 14, minHeight: 134, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14, boxShadow: 'var(--shadow-card)' }}>
            <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--fg-muted)' }}>{label}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'var(--font-display-style)', fontWeight: 'var(--font-display-weight)' as any, fontSize: 44, color: 'var(--fg-strong)', lineHeight: 1, fontFeatureSettings: '"tnum" 1' }}>{value}</div>
            {footRight && <div style={{ fontSize: 12, color: 'var(--fg-faint)' }}>{footRight}</div>}
          </div>
        ))}
      </div>

      {/* Invoice table */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-faint)', borderRadius: 16, overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 22px', borderBottom: '1px solid var(--border-faint)', flexWrap: 'wrap' }}>
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{ padding: '6px 14px', borderRadius: 9, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', transition: 'all 140ms ease', border: `1px solid ${filter === f ? 'color-mix(in oklab, var(--accent) 28%, transparent)' : 'var(--border-soft)'}`, background: filter === f ? 'var(--accent-soft)' : 'var(--bg-surface-2)', color: filter === f ? 'var(--accent)' : 'var(--fg-muted)' }}
            >
              {f}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          {totalOutstanding > 0 && (
            <button style={{ height: 38, padding: '0 14px', borderRadius: 9, fontSize: 13, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--accent)', color: 'var(--accent-fg)', border: 'none', cursor: 'pointer', boxShadow: '0 6px 18px -10px color-mix(in oklab, var(--accent) 70%, transparent)' }}>
              <CreditCard size={14} /> Pay ${totalOutstanding.toFixed(2)}
            </button>
          )}
        </div>

        {loading && (
          <div style={{ padding: '32px 22px', textAlign: 'center', color: 'var(--fg-muted)', fontSize: 14 }}>Loading invoices…</div>
        )}
        {error && !loading && (
          <div style={{ padding: '32px 22px', textAlign: 'center', color: 'var(--danger)', fontSize: 14 }}>{error}</div>
        )}
        {!loading && filtered.length === 0 && (
          <div style={{ padding: '32px 22px', textAlign: 'center', color: 'var(--fg-muted)', fontSize: 14 }}>
            {allPayments.length === 0 ? 'No outstanding invoices.' : `No ${filter.toLowerCase()} invoices.`}
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-surface-2)', borderBottom: '1px solid var(--border-soft)' }}>
                {['Invoice', 'Child', 'Description', 'Amount', 'Status', 'Due'].map((h, i) => (
                  <th key={i} style={{ padding: '10px 22px', textAlign: 'left', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--fg-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr key={p.id}
                  style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border-faint)' : undefined, transition: 'background 140ms ease' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  <td style={{ padding: '14px 22px', fontFamily: 'var(--font-mono)', fontSize: 12.5, fontWeight: 600, color: 'var(--fg-strong)', fontFeatureSettings: '"tnum" 1' }}>
                    INV-{p.id}
                  </td>
                  <td style={{ padding: '14px 22px', fontSize: 13.5, color: 'var(--fg-default)' }}>{p.child_name}</td>
                  <td style={{ padding: '14px 22px', fontSize: 13.5, color: 'var(--fg-muted)', maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.description}</td>
                  <td style={{ padding: '14px 22px', fontSize: 13.5, fontWeight: 600, color: 'var(--fg-strong)', fontFamily: 'var(--font-mono)', fontFeatureSettings: '"tnum" 1' }}>
                    ${p.amount.toFixed(2)}
                  </td>
                  <td style={{ padding: '14px 22px' }}>
                    <Tag variant={payStatusVariant(p.status)}>{payStatusLabel(p.status)}</Tag>
                  </td>
                  <td style={{ padding: '14px 22px', fontSize: 13.5, color: 'var(--fg-muted)' }}>
                    {formatDueDate(p.due_date)}
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

export default ParentBillingPage;
