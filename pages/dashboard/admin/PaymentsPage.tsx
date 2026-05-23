/**
 * PaymentsPage — /dashboard/admin/payments
 * Ryze Portal redesign — invoice table + chart panel.
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  Download, Plus, Search, Filter, Check, X, AlertCircle,
} from 'lucide-react';
import { adminApi, StudentPayment } from '../../../services/adminApi';
import { PageHeader } from '../../../components/dashboard/ui/PageHeader';
import { StatCard } from '../../../components/dashboard/ui/StatCard';
import { StatusBadge } from '../../../components/dashboard/ui/StatusBadge';

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
    amount_paid: String(payment.amount_due),  // dollars, displayed to user
    payment_method: '',
    received_by: '',
    reference: '',
    notes: payment.notes ?? '',
  });
  const [saving, setSaving]   = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setModalError(null);
    try {
      if (form.status === 'paid') {
        // Use the dedicated mark-paid endpoint for clean full-payment recording
        await adminApi.markPaymentPaid(payment.id, {
          payment_method: form.payment_method || 'other',
          received_by: form.received_by || undefined,
          reference:   form.reference   || undefined,
          notes:       form.notes       || undefined,
        });
      } else {
        // Partial payment or status change — use the generic update
        await adminApi.updateStudentPayment(payment.id, {
          status:           form.status,
          amount_paid_cents: Math.round(Number(form.amount_paid) * 100), // convert $ → cents
          payment_method:   form.payment_method || undefined,
          received_by:      form.received_by    || undefined,
          reference:        form.reference      || undefined,
          notes:            form.notes          || undefined,
        });
      }
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
    fontFamily: 'var(--font-sans)',
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
            {payment.term ? `${payment.term} · ` : ''}Due: {formatDate(payment.due_date)}
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 12 }}>
            <span>Due: <strong style={{ color: 'var(--fg-strong)' }}>{formatCurrency(payment.amount_due)}</strong></span>
            <span>Paid: <strong style={{ color: 'var(--ok)' }}>{formatCurrency(payment.amount_paid)}</strong></span>
            <span>Remaining: <strong style={{ color: 'var(--danger)' }}>{formatCurrency(payment.amount_remaining)}</strong></span>
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
          <div>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 6 }}>Payment method</label>
            <select value={form.payment_method} onChange={(e) => setForm(f => ({ ...f, payment_method: e.target.value }))} style={inp}>
              <option value="">— Select method —</option>
              <option value="bank_transfer">Bank transfer</option>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="eftpos">EFTPOS</option>
              <option value="bpay">BPAY</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 6 }}>Received by</label>
              <input type="text" placeholder="Admin name" style={inp} value={form.received_by}
                onChange={(e) => setForm(f => ({ ...f, received_by: e.target.value }))} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 6 }}>Reference / Receipt</label>
              <input type="text" placeholder="e.g. TXN-1234" style={inp} value={form.reference}
                onChange={(e) => setForm(f => ({ ...f, reference: e.target.value }))} />
            </div>
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
// Create invoice modal
// ---------------------------------------------------------------------------

const TERM_OPTIONS = (() => {
  const year = new Date().getFullYear();
  const terms: string[] = [];
  for (const y of [year - 1, year, year + 1]) {
    for (let t = 1; t <= 4; t++) terms.push(`Term ${t} ${y}`);
  }
  return terms;
})();

interface CreateInvoiceModalProps {
  onClose: () => void;
  onSaved: () => void;
}

const CreateInvoiceModal: React.FC<CreateInvoiceModalProps> = ({ onClose, onSaved }) => {
  const [students, setStudents] = useState<{ id: number; full_name: string }[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const defaultTerm = TERM_OPTIONS.find(t => t.includes(String(new Date().getFullYear()))) ?? TERM_OPTIONS[4];
  const [form, setForm] = useState({
    student_id:  '',
    description: '',
    term:        defaultTerm,
    frequency:   'termly' as 'yearly' | 'termly' | 'weekly' | 'custom',
    amount_due:  '',
    due_date:    '',
    notes:       '',
  });

  useEffect(() => {
    adminApi.getStudents({ limit: 500, active: true })
      .then(({ items }) => setStudents(items))
      .catch(() => {/* non-fatal */})
      .finally(() => setLoadingStudents(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.student_id)  { setFormError('Please select a student.'); return; }
    if (!form.amount_due || Number(form.amount_due) <= 0) { setFormError('Please enter a valid amount.'); return; }
    setSaving(true);
    setFormError(null);
    try {
      await adminApi.createStudentPayment({
        student_id:  Number(form.student_id),
        description: form.description || `${form.term} tuition`,
        amount_cents: Math.round(Number(form.amount_due) * 100), // convert $ → cents
        term:        form.term,
        frequency:   form.frequency,
        due_date:    form.due_date || undefined,
        notes:       form.notes   || undefined,
      });
      onSaved();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to create invoice.';
      setFormError(msg);
      setSaving(false);
    }
  };

  const inp: React.CSSProperties = {
    width: '100%', padding: '10px 16px',
    background: 'var(--bg-surface-2)',
    border: '1px solid var(--border-soft)',
    borderRadius: 9, fontSize: 13,
    color: 'var(--fg-default)', outline: 'none',
    fontFamily: 'var(--font-sans)',
    boxSizing: 'border-box',
  };
  const lbl: React.CSSProperties = {
    display: 'block', fontSize: 10, fontWeight: 700,
    letterSpacing: '0.12em', textTransform: 'uppercase',
    color: 'var(--fg-muted)', marginBottom: 6,
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} onClick={onClose} />
      <div style={{
        position: 'relative', zIndex: 10,
        background: 'var(--bg-surface)', border: '1px solid var(--border-soft)',
        borderRadius: 16, boxShadow: '0 32px 64px -24px rgba(0,0,0,0.6)',
        maxWidth: 460, width: '100%', padding: 24,
        maxHeight: '90vh', overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--fg-strong)' }}>New Invoice</div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--fg-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {formError && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--danger)', background: 'color-mix(in oklab, var(--danger) 12%, transparent)', border: '1px solid color-mix(in oklab, var(--danger) 26%, transparent)', borderRadius: 9, padding: 12, marginBottom: 16 }}>
            <AlertCircle size={14} /> {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={lbl}>Student</label>
            <select
              value={form.student_id}
              onChange={(e) => setForm(f => ({ ...f, student_id: e.target.value }))}
              style={inp}
              disabled={loadingStudents}
            >
              <option value="">{loadingStudents ? 'Loading students…' : 'Select student…'}</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.full_name}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={lbl}>Description</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="e.g. Term 2 — Maths Ext 1 group tuition"
              style={inp}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={lbl}>Term</label>
              <select
                value={form.term}
                onChange={(e) => setForm(f => ({ ...f, term: e.target.value }))}
                style={inp}
              >
                {TERM_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Frequency</label>
              <select
                value={form.frequency}
                onChange={(e) => setForm(f => ({ ...f, frequency: e.target.value as any }))}
                style={inp}
              >
                <option value="termly">Termly</option>
                <option value="weekly">Weekly</option>
                <option value="yearly">Yearly</option>
                <option value="custom">Custom</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={lbl}>Amount Due ($)</label>
              <input
                type="number" min="0" step="0.01"
                value={form.amount_due}
                onChange={(e) => setForm(f => ({ ...f, amount_due: e.target.value }))}
                placeholder="e.g. 480.00"
                style={inp}
              />
            </div>
            <div>
              <label style={lbl}>Due Date</label>
              <input
                type="date"
                value={form.due_date}
                onChange={(e) => setForm(f => ({ ...f, due_date: e.target.value }))}
                style={inp}
              />
            </div>
          </div>

          <div>
            <label style={lbl}>Notes (optional)</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="e.g. Instalment 1 of 4 for term package"
              rows={2}
              style={{ ...inp, resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
            <button type="button" onClick={onClose} style={{
              height: 38, padding: '0 20px', borderRadius: 9,
              fontSize: 13, fontWeight: 600,
              background: 'var(--bg-surface-2)', color: 'var(--fg-default)',
              border: '1px solid var(--border-soft)', cursor: 'pointer',
            }}>
              Cancel
            </button>
            <button type="submit" disabled={saving} style={{
              height: 38, padding: '0 20px', borderRadius: 9,
              fontSize: 13, fontWeight: 600,
              background: 'var(--accent)', color: 'var(--accent-fg)',
              border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.7 : 1,
            }}>
              {saving ? 'Creating…' : 'Create invoice'}
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

  const exportCsv = () => {
    const escape = (v: string | number | null | undefined) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const headers = ['Invoice ID', 'Student', 'Term', 'Amount Due', 'Amount Paid', 'Status', 'Due Date', 'Payment Method'];
    const lines = [
      headers.join(','),
      ...payments.map((p) => [
        escape(`INV-${p.id}`),
        escape(p.student_name),
        escape(p.term),
        escape(p.amount_due),
        escape(p.amount_paid),
        escape(p.status),
        escape(p.due_date ? new Date(p.due_date).toLocaleDateString('en-AU') : ''),
        escape(p.payment_method ?? ''),
      ].join(',')),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `ryze-payments-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

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
  const totalDue     = payments.reduce((sum, p) => sum + (p.amount_due || 0), 0);
  const totalPaid    = payments.reduce((sum, p) => sum + (p.amount_paid || 0), 0);
  const totalOverdue = payments.filter(p => p.status === 'overdue').reduce((sum, p) => sum + (p.amount_remaining || 0), 0);
  const pendingCount = payments.filter(p => p.status === 'pending' || p.status === 'partial').length;

  const btnStyle: React.CSSProperties = {
    height: 38, padding: '0 14px', borderRadius: 9,
    fontSize: 13, fontWeight: 600,
    display: 'flex', alignItems: 'center', gap: 8,
    cursor: 'pointer', border: 'none',
    transition: 'transform 140ms ease',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-lg)' }}>

      <PageHeader
        compact
        eyebrow="Finance"
        title="Payments"
        actions={<>
          <button
            onClick={exportCsv}
            style={{ ...btnStyle, background: 'var(--bg-surface)', color: 'var(--fg-default)', border: '1px solid var(--border-soft)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = ''; }}
            title="Export payment data as CSV"
          >
            <Download size={14} /> Export CSV
          </button>
          <button
            onClick={() => setShowCreate(true)}
            style={{ ...btnStyle, background: 'var(--accent)', color: 'var(--accent-fg)', boxShadow: '0 6px 18px -10px color-mix(in oklab, var(--accent) 70%, transparent)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = ''; }}>
            <Plus size={14} /> New invoice
          </button>
        </>}
      />

      {/* Stat row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--gap-md)' }}
           className="grid-cols-2 sm:grid-cols-4">
        <StatCard label="Revenue collected" value={loading ? '…' : `$${totalPaid.toFixed(0)}`} deltaText="+12% vs last" deltaDir="up" footRight={`${payments.length} invoices`} loading={loading} />
        <StatCard label="Outstanding"       value={loading ? '…' : `$${(totalDue - totalPaid).toFixed(0)}`} deltaDir="down" footRight="of total due" loading={loading} />
        <StatCard label="Overdue"           value={loading ? '…' : `$${totalOverdue.toFixed(0)}`} loading={loading} />
        <StatCard label="Pending"           value={loading ? '…' : `${pendingCount}`} loading={loading} />
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
              <button key={f} onClick={() => setFilter(f)} aria-pressed={filter === f} style={{
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
                  {['Invoice', 'Student', 'Amount', 'Paid', 'Frequency', 'Status', 'Due'].map((h) => (
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
                {!loading && payments.length === 0 && (
                  <tr><td colSpan={6} style={{ padding: '32px 22px', textAlign: 'center', color: 'var(--fg-muted)' }}>No payment records found.</td></tr>
                )}
                {!loading && payments.map((p) => {
                  const statusLower = p.status.toLowerCase();
                  const matchesFilter = filter === 'All'
                    || (filter === 'Due'     && (statusLower === 'pending' || statusLower === 'partial'))
                    || (filter === 'Overdue' && statusLower === 'overdue')
                    || (filter === 'Paid'    && statusLower === 'paid');
                  const matchesSearch = !query || p.student_name.toLowerCase().includes(query.toLowerCase());
                  if (!matchesFilter || !matchesSearch) return null;

                  const paidPct = p.amount_due > 0 ? Math.min(100, (p.amount_paid / p.amount_due) * 100) : 0;
                  const freqLabel: Record<string, string> = { termly: 'Termly', yearly: 'Yearly', weekly: 'Weekly', custom: 'Custom' };

                  return (
                    <tr key={p.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`Edit invoice INV-${p.id} for ${p.student_name}`}
                    onClick={() => setEditTarget(p)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setEditTarget(p); } }}
                    style={{
                      borderBottom: '1px solid var(--border-faint)', cursor: 'pointer',
                      transition: 'background 140ms ease',
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = ''; }}
                    >
                      <td style={{ padding: '14px 22px' }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, fontWeight: 600, color: 'var(--fg-strong)', fontFeatureSettings: '"tnum" 1' }}>
                          INV-{p.id}
                        </div>
                        {p.term && <div style={{ fontSize: 11, color: 'var(--fg-muted)', marginTop: 2 }}>{p.term}</div>}
                      </td>
                      <td style={{ padding: '14px 22px' }}>
                        <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--fg-strong)' }}>{p.student_name}</div>
                        {p.installment_number && p.total_installments && (
                          <div style={{ fontSize: 11, color: 'var(--fg-muted)', marginTop: 2 }}>
                            Instalment {p.installment_number} of {p.total_installments}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '14px 22px', fontSize: 13.5, fontWeight: 600, color: 'var(--fg-strong)', fontFamily: 'var(--font-mono)', fontFeatureSettings: '"tnum" 1' }}>
                        {formatCurrency(p.amount_due)}
                      </td>
                      <td style={{ padding: '14px 22px', minWidth: 130 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ flex: 1, height: 5, borderRadius: 999, background: 'var(--bg-surface-2)', border: '1px solid var(--border-faint)', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${paidPct}%`, background: paidPct >= 100 ? 'var(--ok)' : 'var(--accent)', borderRadius: 999, transition: 'width 400ms ease' }} />
                          </div>
                          <span style={{ fontSize: 11.5, fontFamily: 'var(--font-mono)', color: 'var(--fg-muted)', whiteSpace: 'nowrap', fontFeatureSettings: '"tnum" 1' }}>
                            {formatCurrency(p.amount_paid)}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 22px', fontSize: 12.5, color: 'var(--fg-muted)' }}>
                        {freqLabel[p.frequency] ?? p.frequency}
                      </td>
                      <td style={{ padding: '14px 22px' }}><StatusBadge value={p.status} /></td>
                      <td style={{ padding: '14px 22px', fontSize: 13, color: 'var(--fg-muted)' }}>{formatDate(p.due_date)}</td>
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
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          minHeight: 220,
        }}>
          <div style={{ textAlign: 'center', color: 'var(--fg-muted)' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📊</div>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6, color: 'var(--fg-default)' }}>Payment analytics coming soon</div>
            <div style={{ fontSize: 13 }}>Revenue trends and collection charts will appear here.</div>
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

      {/* Create invoice modal */}
      {showCreate && (
        <CreateInvoiceModal
          onClose={() => setShowCreate(false)}
          onSaved={() => { setShowCreate(false); load(); }}
        />
      )}
    </div>
  );
};

export default PaymentsPage;
