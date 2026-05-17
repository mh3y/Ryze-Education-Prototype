/**
 * PaymentsPage — /dashboard/admin/payments
 *
 * Lists student payment records. Admins can filter by status, mark payments
 * as paid/overdue/waived, and create new payment records.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { CreditCard, Plus, AlertCircle, Check, X, DollarSign } from 'lucide-react';
import { adminApi, StudentPayment } from '../../../services/adminApi';
import {
  PageHeader, SearchInput, DataTable, Column,
  StatusBadge, EmptyState, LoadingState, ErrorState, ConfirmDialog,
} from '../../../components/dashboard/ui';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-AU', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  } catch { return iso; }
}

function formatCurrency(val: string | number | null | undefined): string {
  if (val === null || val === undefined) return '—';
  const n = Number(val);
  return isNaN(n) ? String(val) : `$${n.toFixed(2)}`;
}

type StatusFilter = 'all' | 'pending' | 'partial' | 'paid' | 'overdue' | 'waived';
const STATUS_TABS: StatusFilter[] = ['all', 'pending', 'partial', 'paid', 'overdue', 'waived'];

// ---------------------------------------------------------------------------
// Mark Paid Modal
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
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await adminApi.updateStudentPayment(payment.id, {
        status:         form.status,
        amount_paid:    Number(form.amount_paid),
        payment_method: form.payment_method || undefined,
        notes:          form.notes || undefined,
      });
      onSaved();
    } catch (e: any) {
      setError(e?.message ?? 'Failed to update payment.');
    } finally {
      setSaving(false);
    }
  };

  const inputCls = 'w-full px-4 py-2.5 bg-[#050510] border border-white/10 rounded-xl text-sm ryze-text-inverse focus:outline-none focus:border-[#FFB000]/40 focus:ring-1 focus:ring-[#FFB000]/20 transition-all placeholder-slate-600';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-[#0a0f1e] border border-white/10 rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold ryze-text-inverse text-lg">Update Payment</h3>
          <button onClick={onClose} className="ryze-text-muted hover:ryze-text-inverse transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-5">
          <div className="font-semibold ryze-text-inverse text-sm">{payment.student_name}</div>
          <div className="text-xs ryze-text-muted mt-1">
            Term: {payment.term} · Due: {formatDate(payment.due_date)} · Amount: {formatCurrency(payment.amount_due)}
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4">
            <AlertCircle size={14} className="shrink-0" /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold ryze-text-muted uppercase tracking-widest mb-1.5">Status</label>
            <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              className={inputCls}>
              <option value="paid">Paid in full</option>
              <option value="partial">Partial payment</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
              <option value="waived">Waived</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold ryze-text-muted uppercase tracking-widest mb-1.5">Amount Paid ($)</label>
            <input type="number" min="0" step="0.01" className={inputCls}
              value={form.amount_paid}
              onChange={(e) => setForm((f) => ({ ...f, amount_paid: e.target.value }))} />
          </div>
          <div>
            <label className="block text-[10px] font-bold ryze-text-muted uppercase tracking-widest mb-1.5">Payment Method</label>
            <select value={form.payment_method} onChange={(e) => setForm((f) => ({ ...f, payment_method: e.target.value }))}
              className={inputCls}>
              <option value="">— Select —</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="stripe">Stripe</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold ryze-text-muted uppercase tracking-widest mb-1.5">Notes</label>
            <textarea rows={2} className={`${inputCls} resize-none`} value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Optional notes…" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 bg-white/5 border border-white/10 ryze-text-inverse font-semibold rounded-xl hover:bg-white/10 transition-all text-sm">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 bg-[#FFB000] text-[#050510] font-bold rounded-xl hover:bg-[#ffc133] transition-all disabled:opacity-60 text-sm flex items-center justify-center gap-2">
              {saving
                ? <div className="w-4 h-4 border-2 border-[#050510]/30 border-t-[#050510] rounded-full animate-spin" />
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
// Create Payment Modal
// ---------------------------------------------------------------------------

interface CreatePaymentModalProps {
  onClose: () => void;
  onCreated: () => void;
}

const CreatePaymentModal: React.FC<CreatePaymentModalProps> = ({ onClose, onCreated }) => {
  const [form, setForm] = useState({
    student_user_id: '',
    term: '',
    amount_due: '',
    due_date: '',
    notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.student_user_id || !form.term || !form.amount_due) {
      setError('Student ID, term, and amount are required.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await adminApi.createStudentPayment({
        student_user_id: Number(form.student_user_id),
        term:       form.term,
        amount_due: Number(form.amount_due),
        due_date:   form.due_date || undefined,
        notes:      form.notes || undefined,
      });
      onCreated();
    } catch (e: any) {
      setError(e?.message ?? 'Failed to create payment record.');
    } finally {
      setSaving(false);
    }
  };

  const inputCls = 'w-full px-4 py-2.5 bg-[#050510] border border-white/10 rounded-xl text-sm ryze-text-inverse focus:outline-none focus:border-[#FFB000]/40 focus:ring-1 focus:ring-[#FFB000]/20 transition-all placeholder-slate-600';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-[#0a0f1e] border border-white/10 rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold ryze-text-inverse text-lg">New Payment Record</h3>
          <button onClick={onClose} className="ryze-text-muted hover:ryze-text-inverse transition-colors">
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4">
            <AlertCircle size={14} className="shrink-0" /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold ryze-text-muted uppercase tracking-widest mb-1.5">Student ID *</label>
            <input required type="number" className={inputCls} value={form.student_user_id}
              onChange={(e) => setForm((f) => ({ ...f, student_user_id: e.target.value }))}
              placeholder="Find ID on the student's detail page" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold ryze-text-muted uppercase tracking-widest mb-1.5">Term *</label>
              <input required type="text" className={inputCls} value={form.term}
                onChange={(e) => setForm((f) => ({ ...f, term: e.target.value }))}
                placeholder="e.g. 2025 T2" />
            </div>
            <div>
              <label className="block text-[10px] font-bold ryze-text-muted uppercase tracking-widest mb-1.5">Amount Due ($) *</label>
              <input required type="number" min="0" step="0.01" className={inputCls} value={form.amount_due}
                onChange={(e) => setForm((f) => ({ ...f, amount_due: e.target.value }))}
                placeholder="0.00" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold ryze-text-muted uppercase tracking-widest mb-1.5">Due Date</label>
            <input type="date" className={inputCls} value={form.due_date}
              onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))} />
          </div>
          <div>
            <label className="block text-[10px] font-bold ryze-text-muted uppercase tracking-widest mb-1.5">Notes</label>
            <textarea rows={2} className={`${inputCls} resize-none`} value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Optional notes…" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 bg-white/5 border border-white/10 ryze-text-inverse font-semibold rounded-xl hover:bg-white/10 transition-all text-sm">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 bg-[#FFB000] text-[#050510] font-bold rounded-xl hover:bg-[#ffc133] transition-all disabled:opacity-60 text-sm flex items-center justify-center gap-2">
              {saving
                ? <div className="w-4 h-4 border-2 border-[#050510]/30 border-t-[#050510] rounded-full animate-spin" />
                : <Plus size={14} />}
              Create Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

const PaymentsPage: React.FC = () => {
  const [payments, setPayments]       = useState<StudentPayment[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [query, setQuery]             = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [editTarget, setEditTarget]   = useState<StudentPayment | null>(null);
  const [showCreate, setShowCreate]   = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, any> = { limit: 300 };
      if (statusFilter !== 'all') params.status = statusFilter;
      const data = await adminApi.getStudentPayments(params);
      setPayments(data.items);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load payments.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  // ---------------------------------------------------------------------------
  // Summary stats
  // ---------------------------------------------------------------------------

  const totalDue      = payments.reduce((s, p) => s + Number(p.amount_due), 0);
  const totalPaid     = payments.reduce((s, p) => s + Number(p.amount_paid), 0);
  const totalOutstanding = payments
    .filter((p) => !['paid', 'waived'].includes(p.status))
    .reduce((s, p) => s + Number(p.amount_remaining), 0);
  const overdueCount  = payments.filter((p) => p.status === 'overdue').length;

  // ---------------------------------------------------------------------------
  // Columns
  // ---------------------------------------------------------------------------

  const columns: Column<StudentPayment>[] = [
    {
      key: 'student_name',
      header: 'Student',
      sortable: true,
      sortValue: (r) => r.student_name,
      render: (r) => <span className="font-medium ryze-text-inverse">{r.student_name}</span>,
    },
    {
      key: 'term',
      header: 'Term',
      sortable: true,
      sortValue: (r) => r.term,
      render: (r) => <span className="text-sm ryze-text-muted">{r.term}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => <StatusBadge value={r.status} />,
    },
    {
      key: 'amount_due',
      header: 'Due',
      sortable: true,
      sortValue: (r) => Number(r.amount_due),
      render: (r) => <span className="text-sm ryze-text-muted">{formatCurrency(r.amount_due)}</span>,
    },
    {
      key: 'amount_remaining',
      header: 'Remaining',
      render: (r) => (
        <span className={`text-sm font-semibold ${
          Number(r.amount_remaining) > 0 && !['paid', 'waived'].includes(r.status)
            ? 'text-amber-400'
            : 'ryze-text-muted'
        }`}>
          {formatCurrency(r.amount_remaining)}
        </span>
      ),
    },
    {
      key: 'due_date',
      header: 'Due Date',
      sortable: true,
      sortValue: (r) => r.due_date ?? '',
      render: (r) => <span className="text-xs ryze-text-muted">{formatDate(r.due_date)}</span>,
    },
    {
      key: 'actions',
      header: '',
      cellClass: 'text-right',
      render: (r) => (
        <button
          onClick={(e) => { e.stopPropagation(); setEditTarget(r); }}
          className="bg-white/5 border border-white/10 ryze-text-inverse font-semibold px-3 py-1.5 rounded-lg hover:bg-white/10 transition-all text-xs"
        >
          Update
        </button>
      ),
    },
  ];

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-6">

      <PageHeader
        title="Payments"
        description="Student payment records. Mark payments as received, set overdue status, or waive outstanding amounts."
        actions={
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-[#FFB000] text-[#050510] font-bold text-sm px-4 py-2.5 rounded-xl hover:bg-[#ffc133] transition-all"
          >
            <Plus size={15} /> New Record
          </button>
        }
      />

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Due',       value: formatCurrency(totalDue),         color: 'ryze-text-inverse' },
          { label: 'Total Paid',      value: formatCurrency(totalPaid),         color: 'text-emerald-400' },
          { label: 'Outstanding',     value: formatCurrency(totalOutstanding),  color: 'text-amber-400' },
          { label: 'Overdue Records', value: String(overdueCount),              color: overdueCount > 0 ? 'text-red-400' : 'ryze-text-muted' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-[#0a0f1e] border border-white/10 rounded-2xl p-4">
            <div className="text-[10px] font-bold ryze-text-muted uppercase tracking-widest mb-1">{label}</div>
            <div className={`text-xl font-bold ${color}`}>{value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search by student name or term…"
          className="w-full sm:max-w-sm"
        />
        <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                statusFilter === tab
                  ? 'bg-white/10 ryze-text-inverse'
                  : 'ryze-text-muted hover:ryze-text-inverse'
              }`}
            >
              {tab === 'all' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {error && <ErrorState message={error} onRetry={load} />}
      {loading && <LoadingState />}

      {!loading && !error && (
        <DataTable
          columns={columns}
          data={payments}
          rowKey={(r) => r.id}
          searchQuery={query}
          loading={false}
          emptyState={
            <EmptyState
              icon={DollarSign}
              title="No payment records"
              description={
                statusFilter !== 'all'
                  ? `No ${statusFilter} payments found.`
                  : 'Create a payment record to start tracking.'
              }
              action={
                <button
                  onClick={() => setShowCreate(true)}
                  className="flex items-center gap-2 text-sm font-semibold text-[#FFB000] bg-[#FFB000]/10 px-4 py-2 rounded-xl hover:bg-[#FFB000]/20 transition-all"
                >
                  <Plus size={14} /> New Record
                </button>
              }
            />
          }
        />
      )}

      {/* Edit modal */}
      {editTarget && (
        <MarkPaidModal
          payment={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={() => { setEditTarget(null); load(); }}
        />
      )}

      {/* Create modal */}
      {showCreate && (
        <CreatePaymentModal
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); load(); }}
        />
      )}
    </div>
  );
};

export default PaymentsPage;
