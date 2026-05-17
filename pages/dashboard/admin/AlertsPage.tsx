/**
 * AlertsPage — /dashboard/admin/alerts
 *
 * System alert centre. Admins can view open/resolved alerts,
 * generate new alerts from the backend check, and resolve/dismiss them.
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  ShieldAlert, RefreshCw, CheckCircle, XCircle,
  AlertTriangle, Info, Zap,
} from 'lucide-react';
import { adminApi, SystemAlert } from '../../../services/adminApi';
import {
  PageHeader, SearchInput, DataTable, Column,
  StatusBadge, EmptyState, LoadingState, ErrorState, ConfirmDialog,
} from '../../../components/dashboard/ui';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('en-AU', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch { return iso; }
}

function SeverityIcon({ severity }: { severity: string }) {
  const cls = 'shrink-0';
  switch (severity) {
    case 'critical': return <ShieldAlert size={16} className={`${cls} text-red-400`} />;
    case 'high':     return <AlertTriangle size={16} className={`${cls} text-orange-400`} />;
    case 'medium':   return <AlertTriangle size={16} className={`${cls} text-amber-400`} />;
    default:         return <Info size={16} className={`${cls} text-blue-400`} />;
  }
}

type AlertStatusFilter = 'open' | 'resolved' | 'dismissed';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const AlertsPage: React.FC = () => {
  const [alerts, setAlerts]           = useState<SystemAlert[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [query, setQuery]             = useState('');
  const [statusFilter, setStatusFilter] = useState<AlertStatusFilter>('open');
  const [generating, setGenerating]   = useState(false);
  const [generateMsg, setGenerateMsg] = useState<string | null>(null);

  // Resolve / dismiss state
  const [resolveTarget, setResolveTarget]   = useState<SystemAlert | null>(null);
  const [dismissTarget, setDismissTarget]   = useState<SystemAlert | null>(null);
  const [actionLoading, setActionLoading]   = useState(false);
  const [actionError, setActionError]       = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getAlerts({ status: statusFilter, limit: 200 });
      setAlerts(data.items);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load alerts.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  // ---------------------------------------------------------------------------
  // Generate alerts
  // ---------------------------------------------------------------------------

  const handleGenerate = async () => {
    setGenerating(true);
    setGenerateMsg(null);
    try {
      const result = await adminApi.generateAlerts();
      setGenerateMsg(`${result.created} new alert${result.created !== 1 ? 's' : ''} generated.`);
      load();
    } catch (e: any) {
      setGenerateMsg(e?.message ?? 'Failed to generate alerts.');
    } finally {
      setGenerating(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Resolve / Dismiss
  // ---------------------------------------------------------------------------

  const handleResolve = async () => {
    if (!resolveTarget) return;
    setActionLoading(true);
    setActionError(null);
    try {
      await adminApi.resolveAlert(resolveTarget.id);
      setResolveTarget(null);
      load();
    } catch (e: any) {
      setActionError(e?.message ?? 'Failed to resolve alert.');
    } finally { setActionLoading(false); }
  };

  const handleDismiss = async () => {
    if (!dismissTarget) return;
    setActionLoading(true);
    setActionError(null);
    try {
      await adminApi.dismissAlert(dismissTarget.id);
      setDismissTarget(null);
      load();
    } catch (e: any) {
      setActionError(e?.message ?? 'Failed to dismiss alert.');
    } finally { setActionLoading(false); }
  };

  // ---------------------------------------------------------------------------
  // Stats
  // ---------------------------------------------------------------------------

  const openCount     = alerts.filter((a) => a.status === 'open').length;
  const criticalCount = alerts.filter((a) => a.severity === 'critical' && a.status === 'open').length;

  // ---------------------------------------------------------------------------
  // Columns
  // ---------------------------------------------------------------------------

  const columns: Column<SystemAlert>[] = [
    {
      key: 'severity',
      header: 'Severity',
      render: (r) => (
        <div className="flex items-center gap-2">
          <SeverityIcon severity={r.severity} />
          <StatusBadge value={r.severity} />
        </div>
      ),
    },
    {
      key: 'title',
      header: 'Alert',
      render: (r) => (
        <div>
          <div className="font-medium ryze-text-inverse text-sm">{r.title}</div>
          <div className="text-xs ryze-text-muted mt-0.5 line-clamp-1">{r.message}</div>
        </div>
      ),
    },
    {
      key: 'alert_type',
      header: 'Type',
      render: (r) => (
        <span className="text-xs ryze-text-muted capitalize">{r.alert_type.replace(/_/g, ' ')}</span>
      ),
    },
    {
      key: 'created_at',
      header: 'Raised',
      sortable: true,
      sortValue: (r) => r.created_at,
      render: (r) => <span className="text-xs ryze-text-muted">{formatDateTime(r.created_at)}</span>,
    },
    {
      key: 'actions',
      header: '',
      cellClass: 'text-right',
      render: (r) => r.status === 'open' ? (
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={(e) => { e.stopPropagation(); setResolveTarget(r); }}
            className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1.5 rounded-lg hover:bg-emerald-500/20 transition-all"
          >
            <CheckCircle size={12} /> Resolve
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setDismissTarget(r); }}
            className="flex items-center gap-1.5 text-xs font-semibold ryze-text-muted bg-white/5 border border-white/10 px-2.5 py-1.5 rounded-lg hover:bg-white/10 transition-all"
          >
            <XCircle size={12} /> Dismiss
          </button>
        </div>
      ) : (
        <span className="text-xs ryze-text-muted capitalize">{r.status}</span>
      ),
    },
  ];

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-6">

      <PageHeader
        title="Alerts"
        description="System-generated alerts for overdue payments, missing attendance, and other issues requiring attention."
        actions={
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-2 bg-white/5 border border-white/10 ryze-text-inverse font-semibold text-sm px-4 py-2.5 rounded-xl hover:bg-white/10 transition-all disabled:opacity-60"
          >
            {generating
              ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              : <RefreshCw size={15} />}
            Run Alert Check
          </button>
        }
      />

      {/* Generate message */}
      {generateMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-sm text-emerald-400 flex items-center gap-2">
          <Zap size={14} /> {generateMsg}
        </div>
      )}

      {/* Summary */}
      {statusFilter === 'open' && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#0a0f1e] border border-white/10 rounded-2xl p-4">
            <div className="text-[10px] font-bold ryze-text-muted uppercase tracking-widest mb-1">Open Alerts</div>
            <div className={`text-2xl font-bold ${openCount > 0 ? 'text-amber-400' : 'ryze-text-inverse'}`}>
              {openCount}
            </div>
          </div>
          <div className="bg-[#0a0f1e] border border-white/10 rounded-2xl p-4">
            <div className="text-[10px] font-bold ryze-text-muted uppercase tracking-widest mb-1">Critical</div>
            <div className={`text-2xl font-bold ${criticalCount > 0 ? 'text-red-400' : 'ryze-text-inverse'}`}>
              {criticalCount}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search alerts…"
          className="w-full sm:max-w-sm"
        />
        <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
          {(['open', 'resolved', 'dismissed'] as AlertStatusFilter[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                statusFilter === tab
                  ? 'bg-white/10 ryze-text-inverse'
                  : 'ryze-text-muted hover:ryze-text-inverse'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {error && <ErrorState message={error} onRetry={load} />}
      {loading && <LoadingState />}

      {!loading && !error && (
        <DataTable
          columns={columns}
          data={alerts}
          rowKey={(r) => r.id}
          searchQuery={query}
          loading={false}
          emptyState={
            <EmptyState
              icon={ShieldAlert}
              title={`No ${statusFilter} alerts`}
              description={
                statusFilter === 'open'
                  ? 'No open alerts. Click "Run Alert Check" to scan for new issues.'
                  : `No ${statusFilter} alerts found.`
              }
              action={statusFilter === 'open' ? (
                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="flex items-center gap-2 text-sm font-semibold text-[#FFB000] bg-[#FFB000]/10 px-4 py-2 rounded-xl hover:bg-[#FFB000]/20 transition-all"
                >
                  <RefreshCw size={14} /> Run Alert Check
                </button>
              ) : undefined}
            />
          }
        />
      )}

      {/* Action error toast */}
      {actionError && !resolveTarget && !dismissTarget && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl text-sm font-medium text-red-400 bg-red-500/10 border border-red-500/20 backdrop-blur-sm"
          style={{ maxWidth: 440 }}>
          <span className="shrink-0">⚠</span>
          {actionError}
          <button onClick={() => setActionError(null)} className="ml-2 opacity-60 hover:opacity-100 transition-opacity">✕</button>
        </div>
      )}

      {/* Resolve confirm */}
      <ConfirmDialog
        open={!!resolveTarget}
        title="Resolve Alert"
        message={`Mark "${resolveTarget?.title}" as resolved? This indicates the underlying issue has been addressed.`}
        confirmLabel="Resolve"
        loading={actionLoading}
        onConfirm={handleResolve}
        onCancel={() => { setResolveTarget(null); setActionError(null); }}
      />

      {/* Dismiss confirm */}
      <ConfirmDialog
        open={!!dismissTarget}
        title="Dismiss Alert"
        message={`Dismiss "${dismissTarget?.title}"? The alert will be hidden but the underlying issue may not be resolved.`}
        confirmLabel="Dismiss"
        loading={actionLoading}
        onConfirm={handleDismiss}
        onCancel={() => { setDismissTarget(null); setActionError(null); }}
      />
    </div>
  );
};

export default AlertsPage;
