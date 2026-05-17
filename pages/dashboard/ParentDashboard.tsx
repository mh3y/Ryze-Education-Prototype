/**
 * ParentDashboard — /dashboard/overview (for parent role)
 *
 * Shows each linked child's upcoming lessons, recent attendance,
 * payments, and visible progress reports.
 *
 * Parents log in via email + password (no Discord required).
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  Home, CalendarDays, ClipboardCheck, CreditCard,
  Clock, MapPin, Video, CheckCircle, XCircle,
  AlertTriangle, MinusCircle, Users,
} from 'lucide-react';
import { parentApi, ParentPortalPayload, ChildSummary } from '../../services/parentApi';
import { StatusBadge, LoadingState, ErrorState } from '../../components/dashboard/ui';

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

function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('en-AU', {
      weekday: 'short', day: 'numeric', month: 'short',
      hour: '2-digit', minute: '2-digit',
    });
  } catch { return iso; }
}

function formatCurrency(val: string | undefined): string {
  if (!val) return '—';
  const n = Number(val);
  return isNaN(n) ? val : `$${n.toFixed(2)}`;
}

function AttendanceIcon({ status }: { status: string }) {
  switch (status) {
    case 'present':    return <CheckCircle size={14} className="text-emerald-400 shrink-0" />;
    case 'late':       return <Clock        size={14} className="text-amber-400 shrink-0" />;
    case 'absent':     return <XCircle      size={14} className="text-red-400 shrink-0" />;
    case 'left_early': return <MinusCircle  size={14} className="text-orange-400 shrink-0" />;
    default:           return <AlertTriangle size={14} className="ryze-text-muted shrink-0" />;
  }
}

// ---------------------------------------------------------------------------
// Child card component
// ---------------------------------------------------------------------------

type ChildTab = 'lessons' | 'attendance' | 'payments' | 'reports';

const ChildCard: React.FC<{ child: ChildSummary }> = ({ child }) => {
  const [tab, setTab] = useState<ChildTab>('lessons');

  const pendingPayments = child.payments.filter(
    (p) => !['paid', 'waived'].includes(p.status),
  );
  const totalOutstanding = pendingPayments.reduce(
    (s, p) => s + Number(p.amount_remaining), 0,
  );

  const TABS: { key: ChildTab; label: string; icon: React.ElementType; badge?: string }[] = [
    {
      key: 'lessons', label: 'Upcoming',
      icon: CalendarDays,
      badge: child.upcoming_lessons.length > 0 ? String(child.upcoming_lessons.length) : undefined,
    },
    { key: 'attendance', label: 'Attendance', icon: CheckCircle },
    {
      key: 'payments', label: 'Payments',
      icon: CreditCard,
      badge: pendingPayments.length > 0 ? String(pendingPayments.length) : undefined,
    },
    { key: 'reports', label: 'Reports', icon: ClipboardCheck },
  ];

  return (
    <div className="bg-[#0a0f1e] border border-white/10 rounded-2xl overflow-hidden">
      {/* Child header */}
      <div className="p-6 border-b border-white/5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#FFB000]/15 border border-[#FFB000]/20 flex items-center justify-center shrink-0">
            <span className="text-lg font-bold text-[#FFB000]">
              {child.student.full_name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="font-bold ryze-text-inverse text-lg">{child.student.full_name}</h3>
              {child.is_primary_contact && (
                <span className="text-[10px] font-bold text-[#FFB000] bg-[#FFB000]/10 px-2 py-0.5 rounded-full">
                  Primary contact
                </span>
              )}
              {child.relationship && (
                <span className="text-xs ryze-text-muted">{child.relationship}</span>
              )}
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              {child.classes.map((c) => (
                <span key={c.id} className="text-xs ryze-text-muted flex items-center gap-1">
                  <CalendarDays size={10} />
                  {c.name}
                </span>
              ))}
              {child.classes.length === 0 && (
                <span className="text-xs ryze-text-muted opacity-60">No active classes</span>
              )}
            </div>
          </div>

          {/* Quick stats */}
          {totalOutstanding > 0 && (
            <div className="shrink-0 text-right">
              <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Outstanding</div>
              <div className="text-sm font-bold text-amber-400">{formatCurrency(String(totalOutstanding))}</div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5 overflow-x-auto">
        {TABS.map(({ key, label, icon: Icon, badge }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold transition-all whitespace-nowrap border-b-2 ${
              tab === key
                ? 'border-[#FFB000] text-[#FFB000]'
                : 'border-transparent ryze-text-muted hover:ryze-text-inverse'
            }`}
          >
            <Icon size={13} />
            {label}
            {badge && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                tab === key ? 'bg-[#FFB000]/20 text-[#FFB000]' : 'bg-white/10 ryze-text-muted'
              }`}>
                {badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-5">

        {/* ── Upcoming Lessons ── */}
        {tab === 'lessons' && (
          child.upcoming_lessons.length === 0 ? (
            <div className="text-center py-6">
              <CalendarDays size={24} className="mx-auto ryze-text-muted mb-2 opacity-40" />
              <p className="text-sm ryze-text-muted">No upcoming lessons in the next 14 days.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {child.upcoming_lessons.map((ls) => (
                <div key={ls.id} className="bg-white/3 border border-white/5 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold ryze-text-inverse text-sm">{ls.title}</div>
                      {ls.class_name && (
                        <div className="text-xs ryze-text-muted mt-0.5">{ls.class_name}</div>
                      )}
                      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs ryze-text-muted">
                        <span className="flex items-center gap-1">
                          <CalendarDays size={11} />
                          {formatDateTime(ls.start_time)}
                        </span>
                        {ls.location && (
                          <span className="flex items-center gap-1">
                            <MapPin size={11} /> {ls.location}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <StatusBadge value={ls.status} />
                      {ls.meet_link && (
                        <a
                          href={ls.meet_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs font-semibold text-[#FFB000] hover:text-[#ffc133] transition-colors"
                        >
                          <Video size={12} /> Join
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* ── Attendance ── */}
        {tab === 'attendance' && (
          child.recent_attendance.length === 0 ? (
            <div className="text-center py-6">
              <CheckCircle size={24} className="mx-auto ryze-text-muted mb-2 opacity-40" />
              <p className="text-sm ryze-text-muted">No attendance records in the last 30 days.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {child.recent_attendance.map((ar) => (
                <div key={ar.id} className="flex items-center gap-3 bg-white/3 border border-white/5 rounded-xl p-3">
                  <AttendanceIcon status={ar.status} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm ryze-text-inverse truncate">{ar.lesson_title}</div>
                    {ar.lesson_start && (
                      <div className="text-xs ryze-text-muted">{formatDate(ar.lesson_start)}</div>
                    )}
                  </div>
                  <StatusBadge value={ar.status} />
                </div>
              ))}
            </div>
          )
        )}

        {/* ── Payments ── */}
        {tab === 'payments' && (
          child.payments.length === 0 ? (
            <div className="text-center py-6">
              <CreditCard size={24} className="mx-auto ryze-text-muted mb-2 opacity-40" />
              <p className="text-sm ryze-text-muted">No payment records found.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {child.payments.map((p) => (
                <div key={p.id} className="bg-white/3 border border-white/5 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold ryze-text-inverse text-sm">{p.term}</div>
                      <div className="text-xs ryze-text-muted mt-0.5">
                        Due: {formatDate(p.due_date)}
                        {p.paid_at && ` · Paid: ${formatDate(p.paid_at)}`}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-2 mb-1">
                        <StatusBadge value={p.status} />
                      </div>
                      <div className="text-xs ryze-text-muted">
                        {formatCurrency(p.amount_paid)} / {formatCurrency(p.amount_due)}
                      </div>
                      {Number(p.amount_remaining) > 0 && !['paid', 'waived'].includes(p.status) && (
                        <div className="text-xs font-semibold text-amber-400 mt-0.5">
                          {formatCurrency(p.amount_remaining)} remaining
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* ── Progress Reports ── */}
        {tab === 'reports' && (
          child.progress_reports.length === 0 ? (
            <div className="text-center py-6">
              <ClipboardCheck size={24} className="mx-auto ryze-text-muted mb-2 opacity-40" />
              <p className="text-sm ryze-text-muted">No progress reports available yet.</p>
              <p className="text-xs ryze-text-muted mt-1 opacity-60">
                Reports are written by tutors after sessions and shared here when approved.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {child.progress_reports.map((r) => (
                <div key={r.id} className="bg-white/3 border border-white/5 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      {r.class_name && (
                        <div className="text-xs ryze-text-muted mb-1">{r.class_name}</div>
                      )}
                      <div className="text-sm ryze-text-muted">
                        By {r.tutor_name ?? 'Tutor'} · {formatDate(r.submitted_at)}
                      </div>
                    </div>
                    <StatusBadge value={r.status} />
                  </div>
                  {r.summary ? (
                    <p className="text-sm ryze-text-inverse leading-relaxed">{r.summary}</p>
                  ) : (
                    <p className="text-sm ryze-text-muted italic">No summary written.</p>
                  )}
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Main parent dashboard
// ---------------------------------------------------------------------------

const ParentDashboard: React.FC = () => {
  const [data, setData]     = useState<ParentPortalPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await parentApi.getPortal();
      setData(result);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load your portal data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <LoadingState />;
  if (error || !data) return <ErrorState message={error ?? 'Failed to load.'} onRetry={load} />;

  return (
    <div className="space-y-6">

      {/* Welcome header */}
      <div>
        <h1 className="text-2xl font-bold ryze-text-inverse">
          Welcome, {data.parent.full_name.split(' ')[0]}
        </h1>
        <p className="text-sm ryze-text-muted mt-1">
          {data.children.length === 0
            ? 'No children linked to your account yet. Contact your admin.'
            : `You have ${data.children.length} child${data.children.length !== 1 ? 'ren' : ''} linked to your portal.`}
        </p>
      </div>

      {/* No children state */}
      {data.children.length === 0 && (
        <div className="bg-[#0a0f1e] border border-white/10 rounded-2xl p-12 text-center">
          <Users size={40} className="mx-auto ryze-text-muted mb-4 opacity-40" />
          <h3 className="font-bold ryze-text-inverse mb-2">No Children Linked</h3>
          <p className="text-sm ryze-text-muted max-w-md mx-auto">
            Your account hasn't been linked to any students yet. Please contact your tutor or administrator to get this set up.
          </p>
        </div>
      )}

      {/* Child cards */}
      {data.children.map((child) => (
        <ChildCard key={child.link_id} child={child} />
      ))}
    </div>
  );
};

export default ParentDashboard;
