/**
 * TutorPaymentsPage — /dashboard/admin/tutor-payments
 *
 * Lists tutor pay periods. Admins can create pay periods, mark them as
 * paid, and view the lesson items included in each period.
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  DollarSign, Plus, X, AlertCircle, Check,
  ChevronDown, ChevronUp, Clock,
} from 'lucide-react';
import { adminApi, TutorPayment, StudentListItem } from '../../../services/adminApi';
import {
  PageHeader, SearchInput, DataTable, Column,
  StatusBadge, EmptyState, LoadingState, ErrorState,
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

type StatusFilter = 'all' | 'pending' | 'paid' | 'processing';
const STATUS_TABS: StatusFilter[] = ['all', 'pending', 'processing', 'paid'];

// ---------------------------------------------------------------------------
// Pay Period Row (expandable)
// ---------------------------------------------------------------------------

const PayPeriodRow: React.FC<{
  payment: TutorPayment;
  onMarkPaid: (p: TutorPayment) => void;
}> = ({ payment, onMarkPaid }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white/3 border border-white/5 rounded-xl overflow-hidden">
      <div
        className="flex items-center gap-4 p-4 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Tutor */}
        <div className="flex-1 min-w-0">
          <div className="font-medium ryze-text-inverse text-sm">{payment.tutor_name}</div>
          <div className="text-xs ryze-text-muted mt-0.5">
            {formatDate(payment.pay_period_start)} → {formatDate(payment.pay_period_end)}
          </div>
        </div>

        {/* Amounts */}
        <div className="text-right shrink-0">
          <div className="font-bold ryze-text-inverse">{formatCurrency(payment.amount_due)}</div>
          {Number(payment.amount_paid) > 0 && (
            <div className="text-xs text-emerald-400">{formatCurrency(payment.amount_paid)} paid</div>
          )}
        </div>

        {/* Status */}
        <StatusBadge value={payment.status} />

        {/* Action */}
        {payment.status !== 'paid' && (
          <button
            onClick={(e) => { e.stopPropagation(); onMarkPaid(payment); }}
            className="flex items-center gap-1.5 text-xs font-semibold bg-[#FFB000]/10 text-[#FFB000] border border-[#FFB000]/20 px-2.5 py-1.5 rounded-lg hover:bg-[#FFB000]/20 transition-all shrink-0"
          >
            <Check size={12} /> Mark Paid
          </button>
        )}

        {/* Expand icon */}
        <div className="text-slate-500 shrink-0">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {/* Expanded items */}
      {expanded && (
        <div className="border-t border-white/5 p-4">
          {payment.items.length === 0 ? (
            <p className="text-xs ryze-text-muted text-center py-2">No lesson items in this pay period.</p>
          ) : (
            <div className="space-y-2">
              <div className="grid grid-cols-4 text-[10px] font-bold ryze-text-muted uppercase tracking-widest pb-1 border-b border-white/5">
                <span>Lesson</span>
                <span className="text-right">Hours</span>
                <span className="text-right">Rate</span>
                <span className="text-right">Amount</span>
              </div>
              {payment.items.map((item) => (
                <div key={item.id} className="grid grid-cols-4 text-sm">
                  <span className="ryze-text-muted text-xs flex items-center gap-1">
                    <Clock size={10} /> Lesson #{item.lesson_id}
                  </span>
                  <span className="text-right text-xs ryze-text-muted">{item.hours}h</span>
                  <span className="text-right text-xs ryze-text-muted">{formatCurrency(item.rate)}/hr</span>
                  <span className="text-right text-xs font-semibold ryze-text-inverse">{formatCurrency(item.amount)}</span>
                </div>
              ))}
              <div className="border-t border-white/5 pt-2 flex justify-between">
                <span className="text-xs font-bold ryze-text-muted">Total</span>
                <span className="text-sm font-bold text-[#FFB000]">{formatCurrency(payment.amount_due)}</span>
              </div>
            </div>
          )}
          {payment.notes && (
            <p className="text-xs ryze-text-muted mt-3 italic border-t border-white/5 pt-2">{payment.notes}</p>
          )}
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Mark Paid Modal
// ---------------------------------------------------------------------------

interface MarkPaidModalProps {
  payment: TutorPayment;
  onClose: () => void;
  onSaved: () => void;
}

const MarkPaidModal: React.FC<MarkPaidModalProps> = ({ payment, onClose, onSaved }) => {
  const [form, setForm] = useState({
    status: 'paid',
    amount_paid: payment.amount_due,
    notes: payment.notes ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await adminApi.updateTutorPayment(payment.id, {
        status:      form.status,
        amount_paid: Number(form.amount_paid),
        paid_at:     new Date().toISOString(),
        notes:       form.notes || undefined,
      });
      onSaved();
    } catch (e: any) {
      setError(e?.message ?? 'Failed to update payment.');
    } finally {
      setSaving(false);
    }
  };

  const inputCls = 'w-full px-4 py-2.5 bg-[#050510] border border-white/10 rounded-xl text-sm ryze-text-inverse focus:outline-none focus:border-[#FFB000]/40 focus:ring-1 focus:ring-[#FFB000]/20 transition-all';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-[#0a0f1e] border border-white/10 rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold ryze-text-inverse text-lg">Update Tutor Payment</h3>
          <button onClick={onClose} className="ryze-text-muted hover:ryze-text-inverse transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-5">
          <div className="font-semibold ryze-text-inverse text-sm">{payment.tutor_name}</div>
          <div className="text-xs ryze-text-muted mt-1">
            {formatDate(payment.pay_period_start)} – {formatDate(payment.pay_period_end)} ·
            Due: {formatCurrency(payment.amount_due)}
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
            <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} className={inputCls}>
              <option value="paid">Paid</option>
              <option value="processing">Processing</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold ryze-text-muted uppercase tracking-widest mb-1.5">Amount Paid ($)</label>
            <input type="number" min="0" step="0.01" className={inputCls}
              value={form.amount_paid}
              onChange={(e) => setForm((f) => ({ ...f, amount_paid: e.target.value }))} />
          </div>
          <div>
            <label className="block text-[10px] font-bold ryze-text-muted uppercase tracking-widest mb-1.5">Notes</label>
            <textarea rows={2} className={`${inputCls} resize-none`} value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Optional…" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 bg-white/5 border border-white/10 ryze-text-inverse font-semibold rounded-xl hover:bg-white/10 transition-all text-sm">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 bg-[#FFB000] text-[#050510] font-bold rounded-xl hover:bg-[#ffc133] transition-all disabled:opacity-60 text-sm flex items-center justify-center gap-2">
              {saving ? <div className="w-4 h-4 border-2 border-[#050510]/30 border-t-[#050510] rounded-full animate-spin" /> : <Check size={14} />}
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Create Pay Period Modal
// ---------------------------------------------------------------------------

const CreatePayPeriodModal: React.FC<{ onClose: () => void; onCreated: () => void }> = ({ onClose, onCreated }) => {
  const [form, setForm] = useState({ tutor_user_id: '', pay_period_start: '', pay_period_end: '', notes: '' });
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [tutors, setTutors]     = useState<StudentListItem[]>([]);
  const [loadingTutors, setLoadingTutors] = useState(true);

  useEffect(() => {
    adminApi.getStudents({ role: 'tutor', limit: 200, active: true })
      .then(({ items }) => setTutors(items))
      .catch(() => {/* non-fatal */})
      .finally(() => setLoadingTutors(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.tutor_user_id || !form.pay_period_start || !form.pay_period_end) {
      setError('All fields are required.');
      return;
    }
    setSaving(true); setError(null);
    try {
      await adminApi.createTutorPayment({
        tutor_user_id:    Number(form.tutor_user_id),
        pay_period_start: form.pay_period_start,
        pay_period_end:   form.pay_period_end,
        notes:            form.notes || undefined,
      });
      onCreated();
    } catch (e: any) {
      setError(e?.message ?? 'Failed to create pay period.');
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
          <h3 className="font-bold ryze-text-inverse text-lg">New Pay Period</h3>
          <button onClick={onClose} className="ryze-text-muted hover:ryze-text-inverse transition-colors"><X size={20} /></button>
        </div>
        {error && (
          <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4">
            <AlertCircle size={14} className="shrink-0" /> {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold ryze-text-muted uppercase tracking-widest mb-1.5">Tutor *</label>
            <select
              required
              className={inputCls}
              value={form.tutor_user_id}
              onChange={(e) => setForm((f) => ({ ...f, tutor_user_id: e.target.value }))}
              disabled={loadingTutors}
            >
              <option value="">{loadingTutors ? 'Loading tutors…' : 'Select tutor…'}</option>
              {tutors.map((t) => (
                <option key={t.id} value={t.id}>{t.full_name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold ryze-text-muted uppercase tracking-widest mb-1.5">Period Start *</label>
              <input required type="date" className={inputCls} value={form.pay_period_start}
                onChange={(e) => setForm((f) => ({ ...f, pay_period_start: e.target.value }))} />
            </div>
            <div>
              <label className="block text-[10px] font-bold ryze-text-muted uppercase tracking-widest mb-1.5">Period End *</label>
              <input required type="date" className={inputCls} value={form.pay_period_end}
                onChange={(e) => setForm((f) => ({ ...f, pay_period_end: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold ryze-text-muted uppercase tracking-widest mb-1.5">Notes</label>
            <textarea rows={2} className={`${inputCls} resize-none`} value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Optional…" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 bg-white/5 border border-white/10 ryze-text-inverse font-semibold rounded-xl hover:bg-white/10 transition-all text-sm">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 bg-[#FFB000] text-[#050510] font-bold rounded-xl hover:bg-[#ffc133] transition-all disabled:opacity-60 text-sm flex items-center justify-center gap-2">
              {saving ? <div className="w-4 h-4 border-2 border-[#050510]/30 border-t-[#050510] rounded-full animate-spin" /> : <Plus size={14} />}
              Create
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

const TutorPaymentsPage: React.FC = () => {
  const [payments, setPayments]       = useState<TutorPayment[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [query, setQuery]             = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [markTarget, setMarkTarget]   = useState<TutorPayment | null>(null);
  const [showCreate, setShowCreate]   = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const params: Record<string, any> = { limit: 200 };
      if (statusFilter !== 'all') params.status = statusFilter;
      const data = await adminApi.getTutorPayments(params);
      setPayments(data.items);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load tutor payments.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  const totalDue  = payments.reduce((s, p) => s + Number(p.amount_due), 0);
  const totalPaid = payments.reduce((s, p) => s + Number(p.amount_paid), 0);
  const pendingCount = payments.filter((p) => p.status !== 'paid').length;

  const filtered = query
    ? payments.filter((p) => p.tutor_name.toLowerCase().includes(query.toLowerCase()))
    : payments;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tutor Payments"
        description="Manage tutor pay periods and track lesson-based earnings."
        actions={
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-[#FFB000] text-[#050510] font-bold text-sm px-4 py-2.5 rounded-xl hover:bg-[#ffc133] transition-all">
            <Plus size={15} /> New Pay Period
          </button>
        }
      />

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: 'Total Due',     value: formatCurrency(totalDue),  color: 'ryze-text-inverse' },
          { label: 'Total Paid',    value: formatCurrency(totalPaid), color: 'text-emerald-400' },
          { label: 'Pending / Processing', value: String(pendingCount), color: pendingCount > 0 ? 'text-amber-400' : 'ryze-text-muted' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-[#0a0f1e] border border-white/10 rounded-2xl p-4">
            <div className="text-[10px] font-bold ryze-text-muted uppercase tracking-widest mb-1">{label}</div>
            <div className={`text-xl font-bold ${color}`}>{value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <SearchInput value={query} onChange={setQuery} placeholder="Search by tutor name…" className="w-full sm:max-w-sm" />
        <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
          {STATUS_TABS.map((tab) => (
            <button key={tab} onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                statusFilter === tab ? 'bg-white/10 ryze-text-inverse' : 'ryze-text-muted hover:ryze-text-inverse'
              }`}>
              {tab === 'all' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {error && <ErrorState message={error} onRetry={load} />}
      {loading && <LoadingState />}

      {!loading && !error && (
        filtered.length === 0 ? (
          <EmptyState
            icon={DollarSign}
            title="No pay periods found"
            description={statusFilter !== 'all' ? `No ${statusFilter} pay periods.` : 'Create a pay period to start tracking tutor earnings.'}
            action={
              <button onClick={() => setShowCreate(true)}
                className="flex items-center gap-2 text-sm font-semibold text-[#FFB000] bg-[#FFB000]/10 px-4 py-2 rounded-xl hover:bg-[#FFB000]/20 transition-all">
                <Plus size={14} /> New Pay Period
              </button>
            }
          />
        ) : (
          <div className="space-y-3">
            {filtered.map((p) => (
              <PayPeriodRow key={p.id} payment={p} onMarkPaid={setMarkTarget} />
            ))}
          </div>
        )
      )}

      {markTarget && (
        <MarkPaidModal payment={markTarget} onClose={() => setMarkTarget(null)} onSaved={() => { setMarkTarget(null); load(); }} />
      )}
      {showCreate && (
        <CreatePayPeriodModal onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); load(); }} />
      )}
    </div>
  );
};

export default TutorPaymentsPage;
