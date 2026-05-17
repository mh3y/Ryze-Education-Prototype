/**
 * PaymentsPage — /dashboard/admin/payments
 * Ryze Portal redesign — invoice table + chart panel.
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  Download, Plus, Search, Filter, Check, X, AlertCircle,
  TrendingUp, TrendingDown,
} from 'lucide-react';
import { adminApi, StudentPayment } from '../../../services/adminApi';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCurrency(val: string | number | null | undefined): string {
  if (val === null || val === undefined) return '—';
  const n = Number(val);
  return isNaN(n) ? String(val) : `$${n.toFixed(2)}`;
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch { return iso; }
}

type PayStatusFilter = 'All' | 'Due' | 'Overdue' | 'Paid';
const PAY_FILTERS: PayStatusFilter[] = ['All', 'Due', 'Overdue', 'Paid'];

type TagVariant = 'ok' | 'warn' | 'danger' | 'info' | 'default';
const tagStyles: Record<TagVariant, React.CSSProperties> = {
  ok:      { color: 'var(--ok)',     background: 'color-mix(in oklab, var(--ok) 12%, transparent)',     border: '1px solid color-mix(in oklab, var(--ok) 26%, transparent)' },
  warn:    { color: 'var(--warn)',   background: 'color-mix(in oklab, var(--warn) 12%, transparent)',   border: '1px solid color-mix(in oklab, var(--warn) 26%, transparent)' },
  danger:  { color: 'var(--danger)', background: 'color-mix(in oklab, var(--danger) 12%, transparent)', border: '1px solid color-mix(in oklab, var(--danger) 26%, transparent)' },
  info:    { color: 'var(--info)',   background: 'color-mix(in oklab, var(--info) 14%, transparent)',   border: '1px solid color-mix(in oklab, var(--info) 28%, transparent)' },
  default: { color: 'var(--fg-default)', background: 'var(--bg-hover)', border: '1px solid var(--border-soft)' },
};

function payStatusVariant(status: string): TagVariant {
  if (status === 'paid')    return 'ok';
  if (status === 'due' || status === 'pending' || status === 'partial') return 'warn';
  if (status === 'overdue') return 'danger';
  return 'default';
}
function payStatusLabel(status: string): string {
  const m: Record<string, string> = { paid: 'Paid', due: 'Due', pending: 'Due', overdue: 'Overdue', partial: 'Partial', waived: 'Waived', paused: 'Paused' };
  return m[status] ?? status;
}

const StatusTag: React.FC<{ status: string }> = ({ status }) => {
  const v = payStatusVariant(status);
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      fontSize: 11, fontWeight: 600, letterSpacing: '0.04em',
      padding: '4px 9px', borderRadius: 999,
      ...tagStyles[v],
    }}>
      {payStatusLabel(status)}
    </span>
  );
};

// ---------------------------------------------------------------------------
// Stat tile
// ---------------------------------------------------------------------------

const StatTile: React.FC<{
  label: string; value: string;
  deltaText?: string; deltaDir?: 'up' | 'down'; footRight?: string;
}> = ({ label, value, deltaText, deltaDir, footRight }) => (
  <div style={{
    background: 'var(--bg-surface)', border: '1px solid var(--border-faint)',
    borderRadius: 14, minHeight: 134, padding: '18px 20px',
    display: 'flex', flexDirection: 'column', gap: 14,
    boxShadow: 'var(--shadow-card)', transition: 'border-color 140ms ease',
  }}
  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-strong)'; }}
  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-faint)'; }}
  >
    <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--fg-muted)' }}>{label}</div>
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
      {footRight && <span style={{ color: 'var(--fg-faint)' }}>{footRight}</span>}
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Bar chart
// ---------------------------------------------------------------------------

const BarChart: React.FC = () => {
  const heights  = [44, 60, 52, 71, 58, 66, 78, 82];
  const labels   = ['W1','W2','W3','W4','W5','W6','W7','W8'];
  const maxH     = 130;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: maxH, paddingBottom: 24, position: 'relative' }}>
      {heights.map((h, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
          <div style={{
            width: '100%',
            height: `${(h / 100) * maxH}px`,
            borderRadius: '5px 5px 3px 3px',
            background: i === heights.length - 1
              ? 'color-mix(in oklab, var(--accent) 40%, transparent)'
              : 'linear-gradient(180deg, var(--accent), color-mix(in oklab, var(--accent) 60%, #5b3d10))',
            transition: 'opacity 140ms ease',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = '0.8'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
          />
          <div style={{
            position: 'absolute', bottom: 0,
            fontSize: 10.5, color: 'var(--fg-faint)',
            fontFamily: 'var(--font-mono)',
            left: `calc(${(i / heights.length) * 100}% + ${(1 / heights.length) * 50}%)`,
            transform: 'translateX(-50%)',
          }}>
            {labels[i]}
          </div>
        </div>
      ))}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const MOCK_PAYMENTS = [
  { id: 'INV-2841', student: 'Hayden Wong',   parent: 'Cindy Wong',      amount: 480, due: 'Tomorrow',   state: 'due',     method: 'Direct debit' },
  { id: 'INV-2840', student: 'Noah Park',     parent: 'Jin Park',        amount: 360, due: 'In 3 days',  state: 'due',     method: 'Card' },
  { id: 'INV-2839', student: 'Sofia Reyes',   parent: 'Maria Reyes',     amount: 420, due: 'Overdue 2d', state: 'overdue', method: 'Direct debit' },
  { id: 'INV-2838', student: 'Amelia Tran',   parent: 'Linda Tran',      amount: 540, due: 'Paid',       state: 'paid',    method: 'Card' },
  { id: 'INV-2837', student: 'Priya Sharma',  parent: 'Anjali Sharma',   amount: 320, due: 'Paid',       state: 'paid',    method: 'BPAY' },
  { id: 'INV-2836', student: 'Mei Chen',      parent: 'Wei Chen',        amount: 540, due: 'Paid',       state: 'paid',    method: 'Direct debit' },
  { id: 'INV-2835', student: 'Eli Bernstein', parent: 'Hannah Bernstein',amount: 280, due: 'Paused',     state: 'paused',  method: '—' },
];

const TOP_EARNERS = [
  { who: 'Maths Ext 1',    v: '$3,200' },
  { who: 'Maths Ext 2',    v: '$2,400' },
  { who: 'Maths Advanced', v: '$2,700' },
  { who: 'Selective Prep', v: '$2,500' },
];

// ---------------------------------------------------------------------------
// Update payment modal (kept from original)
// ---------------------------------------------------------------------------

interface MarkPaidModalProps {
  payment: StudentPayment;
  onClose: () => void;
  onSaved: () => void;
}

const MarkPaidModal: React.FC<MarkPaidModalProps> = ({ payment, onClose, onSaved }) => {
  const [form, setForm] = useState({
    status: 'paid',
    amount_paid: payment.amount_due,
    payment_method: '',
    notes: payment.notes ?? '',
  });
  const [saving, setSaving]   = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setModalError(null);
    try {
      await adminApi.updateStudentPayment(payment.id, {
        status:         form.status,
        amount_paid:    Number(form.amount_paid),
        payment_method: form.payment_method || undefined,
        notes:          form.notes || undefined,
      });
      onSaved();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to update payment.';
      setModalError(msg);
    } finally {
      setSaving(false);
    }
  };

  const inp: React.CSSProperties = {
    width: '100%', padding: '10px 16px',
    background: 'var(--bg-surface-2)',
    border: '1px solid var(--border-soft)',
    borderRadius: 9, fontSize: 13,
    color: 'var(--fg-default)', outline: 'none',
    fontFamily: '"Manrope", system-ui, sans-serif',
    transition: 'border-color 140ms ease',
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} onClick={onClose} />
      <div style={{
        position: 'relative', zIndex: 10,
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-soft)',
        borderRadius: 16, boxShadow: '0 32px 64px -24px rgba(0,0,0,0.6)',
        maxWidth: 440, width: '100%', padding: 24,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--fg-strong)' }}>Update Payment</div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--fg-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border-soft)', borderRadius: 9, padding: 16, marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-strong)' }}>{payment.student_name}</div>
          <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginTop: 4 }}>
            Term: {payment.term} · Due: {formatDate(payment.due_date)} · Amount: {formatCurrency(payment.amount_due)}
          </div>
        </div>

        {modalError && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--danger)', background: 'color-mix(in oklab, var(--danger) 12%, transparent)', border: '1px solid color-mix(in oklab, var(--danger) 26%, transparent)', borderRadius: 9, padding: 12, marginBottom: 16 }}>
            <AlertCircle size={14} /> {modalError}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 6 }}>Status</label>
            <select value={form.status} onChange={(e) => setForm(f => ({ ...f, status: e.target.value }))} style={inp}>
              <option value="paid">Paid in full</option>
              <option value="partial">Partial payment</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
              <option value="waived">Waived</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 6 }}>Amount Paid ($)</label>
            <input type="number" min="0" step="0.01" style={inp} value={form.amount_paid}
              onChange={(e) => setForm(f => ({ ...f, amount_paid: e.target.value }))} />
          </div>
          <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
            <button type="button" onClick={onClose} style={{
              flex: 1, height: 38, borderRadius: 9, fontSize: 13, fontWeight: 600,
              background: 'var(--bg-surface-2)', color: 'var(--fg-default)',
              border: '1px solid var(--border-soft)', cursor: 'pointer',
            }}>Cancel</button>
            <button type="submit" disabled={saving} style={{
              flex: 1, height: 38, borderRadius: 9, fontSize: 13, fontWeight: 600,
              background: 'var(--accent)', color: 'var(--accent-fg)',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              opacity: saving ? 0.6 : 1,
            }}>
              {saving
                ? <div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                : <Check size={14} />}
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

const PaymentsPage: React.FC = () => {
  const [payments, setPayments]       = useState<StudentPayment[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [query, setQuery]             = useState('');
  const [filter, setFilter]           = useState<PayStatusFilter>('All');
  const [editTarget, setEditTarget]   = useState<StudentPayment | null>(null);
  const [showCreate, setShowCreate]   = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getStudentPayments({ limit: 300 });
      setPayments(data.items);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to load payments.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Summary stats from real data
  const totalDue    = payments.reduce((s, p) => s + Number(p.amount_due), 0);
  const totalPaid   = payments.reduce((s, p) => s + Number(p.amount_paid), 0);
  const overdueCount = payments.filter(p => p.status === 'overdue').length;

  // Display data: real if available, else mock
  const displayPayments = payments.length > 0
    ? payments
    : null; // null = show mock

  const btnStyle: React.CSSProperties = {
    height: 38, padding: '0 14px', borderRadius: 9,
    fontSize: 13, fontWeight: 600,
    display: 'flex', alignItems: 'center', gap: 8,
    cursor: 'pointer', border: 'none',
    transition: 'transform 140ms ease',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-lg)' }}>

      {/* PageHead */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 10 }}>
            Finance
          </div>
          <h1 style={{
            fontFamily: '"Cormorant Garamond","Times New Roman",serif',
            fontStyle: 'italic', fontWeight: 500,
            fontSize: 'clamp(38px, 3.5vw, 54px)',
            lineHeight: 1.08, letterSpacing: '-0.018em',
            color: 'var(--fg-strong)', margin: 0,
          }}>
            Payments
          </h1>
          <p style={{ fontSize: 14, color: 'var(--fg-muted)', marginTop: 10, marginBottom: 0 }}>
            Invoices, direct debits and outstanding balances. Run a chase, mark paid, or export to Xero.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button style={{ ...btnStyle, background: 'var(--bg-surface)', color: 'var(--fg-default)', border: '1px solid var(--border-soft)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = ''; }}>
            <Download size={14} /> Export to Xero
          </button>
          <button
            onClick={() => setShowCreate(true)}
            style={{ ...btnStyle, background: 'var(--accent)', color: 'var(--accent-fg)', boxShadow: '0 6px 18px -10px color-mix(in oklab, var(--accent) 70%, transparent)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = ''; }}>
            <Plus size={14} /> New invoice
          </button>
        </div>
      </div>

      {/* Stat row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--gap-md)' }}
           className="grid-cols-2 sm:grid-cols-4">
        <StatTile label="This week"    value={payments.length ? `$${totalPaid.toFixed(0)}` : '$8,420'} deltaText="+12% vs last" deltaDir="up" footRight="22 invoices" />
        <StatTile label="Outstanding"  value={payments.length ? `$${(totalDue - totalPaid).toFixed(0)}` : '$2,400'} deltaText="3 overdue" deltaDir="down" footRight="of $24k due" />
        <StatTile label="Overdue"      value={payments.length ? String(overdueCount).padStart(2,'0') : '03'} footRight="$1,260" />
        <StatTile label="Auto-collect" value="78%"  deltaText="Direct debit" deltaDir="up" />
      </div>

      {/* Two-up: table + charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '7fr 5fr', gap: 'var(--gap-md)', alignItems: 'start' }}
           className="grid-cols-1 xl:grid-cols-[7fr_5fr]">

        {/* Invoice table */}
        <div style={{
          background: 'var(--bg-surface)', border: '1px solid var(--border-faint)',
          borderRadius: 16, boxShadow: 'var(--shadow-card)', overflow: 'hidden',
        }}>
          {/* Toolbar */}
          <div style={{
            display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10,
            padding: '14px 22px', borderBottom: '1px solid var(--border-faint)',
          }}>
            <div style={{
              flex: 1, minWidth: 200,
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'var(--bg-surface-2)', border: '1px solid var(--border-soft)',
              borderRadius: 9, padding: '7px 12px',
            }}>
              <Search size={14} style={{ color: 'var(--fg-muted)', flexShrink: 0 }} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search invoices, students, parents…"
                style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: 13, color: 'var(--fg-default)', width: '100%' }}
              />
            </div>
            {PAY_FILTERS.map((f) => (
              <button key={f} onClick={() => setFilter(f)} style={{
                height: 32, padding: '0 12px', borderRadius: 9,
                fontSize: 12.5, fontWeight: 600,
                border: filter === f ? '1px solid color-mix(in oklab, var(--accent) 40%, transparent)' : '1px solid var(--border-soft)',
                background: filter === f ? 'var(--accent-soft)' : 'var(--bg-surface-2)',
                color: filter === f ? 'var(--accent)' : 'var(--fg-muted)',
                cursor: 'pointer', transition: 'all 140ms ease',
              }}>
                {f}
              </button>
            ))}
            <button style={{
              height: 32, padding: '0 12px', borderRadius: 9,
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 13, fontWeight: 600,
              background: 'var(--bg-surface)', color: 'var(--fg-default)',
              border: '1px solid var(--border-soft)', cursor: 'pointer',
            }}>
              <Filter size={14} /> Filters
            </button>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-surface-2)', borderBottom: '1px solid var(--border-faint)' }}>
                  {['Invoice', 'Student / Parent', 'Amount', 'Method', 'Status', 'Due'].map((h) => (
                    <th key={h} style={{
                      padding: '12px 22px', textAlign: 'left',
                      fontSize: 11, fontWeight: 700,
                      textTransform: 'uppercase', letterSpacing: '0.12em',
                      color: 'var(--fg-muted)', whiteSpace: 'nowrap',
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={6} style={{ padding: '32px 22px', textAlign: 'center', color: 'var(--fg-muted)' }}>Loading payments…</td></tr>
                )}
                {error && !loading && (
                  <tr><td colSpan={6} style={{ padding: '32px 22px', textAlign: 'center', color: 'var(--danger)' }}>{error}</td></tr>
                )}
                {!loading && (displayPayments ? displayPayments : MOCK_PAYMENTS).map((p) => {
                  const isReal = displayPayments !== null;
                  const student = isReal ? (p as StudentPayment).student_name : (p as typeof MOCK_PAYMENTS[0]).student;
                  const parent  = isReal ? '' : (p as typeof MOCK_PAYMENTS[0]).parent;
                  const amount  = isReal ? formatCurrency((p as StudentPayment).amount_due) : `$${(p as typeof MOCK_PAYMENTS[0]).amount.toLocaleString()}`;
                  const method  = isReal ? ((p as StudentPayment).payment_method ?? '—') : (p as typeof MOCK_PAYMENTS[0]).method;
                  const status  = isReal ? (p as StudentPayment).status : (p as typeof MOCK_PAYMENTS[0]).state;
                  const due     = isReal ? formatDate((p as StudentPayment).due_date) : (p as typeof MOCK_PAYMENTS[0]).due;
                  const id      = isReal ? `INV-${(p as StudentPayment).id}` : (p as typeof MOCK_PAYMENTS[0]).id;

                  const matchesFilter = filter === 'All' || status === filter.toLowerCase();
                  const matchesSearch = !query || student.toLowerCase().includes(query.toLowerCase()) || parent.toLowerCase().includes(query.toLowerCase());
                  if (!matchesFilter || !matchesSearch) return null;

                  return (
                    <tr key={String(p.id)} style={{
                      borderBottom: '1px solid var(--border-faint)', cursor: 'pointer',
                      transition: 'background 140ms ease',
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = ''; }}
                    onClick={() => isReal ? setEditTarget(p as StudentPayment) : undefined}
                    >
                      <td style={{ padding: '14px 22px', fontFamily: 'var(--font-mono)', fontSize: 12.5, fontWeight: 600, color: 'var(--fg-strong)', fontFeatureSettings: '"tnum" 1' }}>
                        {id}
                      </td>
                      <td style={{ padding: '14px 22px' }}>
                        <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--fg-strong)' }}>{student}</div>
                        {parent && <div style={{ fontSize: 12, color: 'var(--fg-muted)' }}>{parent}</div>}
                      </td>
                      <td style={{ padding: '14px 22px', fontSize: 13.5, fontWeight: 600, color: 'var(--fg-strong)', fontFamily: 'var(--font-mono)', fontFeatureSettings: '"tnum" 1' }}>
                        {amount}
                      </td>
                      <td style={{ padding: '14px 22px', fontSize: 13, color: 'var(--fg-muted)' }}>{method}</td>
                      <td style={{ padding: '14px 22px' }}><StatusTag status={status} /></td>
                      <td style={{ padding: '14px 22px', fontSize: 13, color: 'var(--fg-muted)' }}>{due}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Charts card */}
        <div style={{
          background: 'var(--bg-surface)', border: '1px solid var(--border-faint)',
          borderRadius: 16, padding: 'var(--card-pad)', boxShadow: 'var(--shadow-card)',
        }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg-strong)', marginBottom: 4 }}>Cash collected</div>
          <div style={{ fontSize: 12.5, color: 'var(--fg-muted)', marginBottom: 20 }}>Last 8 weeks</div>

          <BarChart />

          <div style={{ height: 1, background: 'var(--border-faint)', margin: '20px 0' }} />

          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg-strong)', marginBottom: 14 }}>Top earners</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {TOP_EARNERS.map((r, i) => (
              <div key={r.who} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600,
                  color: 'var(--fg-faint)', fontFeatureSettings: '"tnum" 1', flexShrink: 0, width: 24,
                }}>
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div style={{ flex: 1, fontSize: 13, color: 'var(--fg-default)' }}>{r.who}</div>
                <div style={{
                  fontSize: 13, fontWeight: 600, color: 'var(--accent)',
                  fontFamily: 'var(--font-mono)', fontFeatureSettings: '"tnum" 1',
                }}>
                  {r.v}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Edit modal */}
      {editTarget && (
        <MarkPaidModal
          payment={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={() => { setEditTarget(null); load(); }}
        />
      )}

      {/* Create modal placeholder */}
      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} onClick={() => setShowCreate(false)} />
          <div style={{
            position: 'relative', zIndex: 10,
            background: 'var(--bg-surface)', border: '1px solid var(--border-soft)',
            borderRadius: 16, padding: 24, maxWidth: 440, width: '100%',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--fg-strong)' }}>New Invoice</div>
              <button onClick={() => setShowCreate(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--fg-muted)' }}>
                <X size={20} />
              </button>
            </div>
            <p style={{ fontSize: 14, color: 'var(--fg-muted)' }}>Invoice creation form — coming in next iteration.</p>
            <button onClick={() => setShowCreate(false)} style={{
              marginTop: 16, height: 38, padding: '0 20px', borderRadius: 9,
              fontSize: 13, fontWeight: 600,
              background: 'var(--accent)', color: 'var(--accent-fg)', border: 'none', cursor: 'pointer',
            }}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsPage;
