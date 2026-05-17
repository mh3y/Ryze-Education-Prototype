/**
 * ProgressReportsPage — /dashboard/admin/progress-reports
 *
 * Lists all progress reports. Admins can filter by status, view summaries,
 * and toggle visibility for parents/students.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { ClipboardCheck, Eye, EyeOff, X, AlertCircle, Check } from 'lucide-react';
import { adminApi, ProgressReport } from '../../../services/adminApi';
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

type StatusFilter = 'all' | 'draft' | 'submitted' | 'approved';
const STATUS_TABS: StatusFilter[] = ['all', 'draft', 'submitted', 'approved'];

// ---------------------------------------------------------------------------
// Report Detail Drawer (inline panel)
// ---------------------------------------------------------------------------

interface ReportDrawerProps {
  report: ProgressReport;
  onClose: () => void;
  onUpdated: () => void;
}

const ReportDrawer: React.FC<ReportDrawerProps> = ({ report, onClose, onUpdated }) => {
  const [visibleParent, setVisibleParent]   = useState(report.visible_to_parent);
  const [visibleStudent, setVisibleStudent] = useState(report.visible_to_student);
  const [saving, setSaving]                 = useState(false);
  const [error, setError]                   = useState<string | null>(null);
  const [saved, setSaved]                   = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await adminApi.updateProgressReport(report.id, {
        visible_to_parent:  visibleParent,
        visible_to_student: visibleStudent,
      });
      setSaved(true);
      onUpdated();
      setTimeout(() => setSaved(false), 2000);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-[#0a0f1e] border border-white/10 rounded-t-2xl sm:rounded-2xl shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold ryze-text-inverse">Progress Report</h3>
          <button onClick={onClose} className="ryze-text-muted hover:ryze-text-inverse transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Meta */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-[10px] font-bold ryze-text-muted uppercase tracking-widest mb-1">Student</div>
              <div className="ryze-text-inverse">{report.student_name}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold ryze-text-muted uppercase tracking-widest mb-1">Tutor</div>
              <div className="ryze-text-inverse">{report.tutor_name}</div>
            </div>
            {report.class_name && (
              <div>
                <div className="text-[10px] font-bold ryze-text-muted uppercase tracking-widest mb-1">Class</div>
                <div className="ryze-text-inverse">{report.class_name}</div>
              </div>
            )}
            <div>
              <div className="text-[10px] font-bold ryze-text-muted uppercase tracking-widest mb-1">Status</div>
              <StatusBadge value={report.status} />
            </div>
            <div>
              <div className="text-[10px] font-bold ryze-text-muted uppercase tracking-widest mb-1">Submitted</div>
              <div className="ryze-text-muted text-xs">{formatDate(report.submitted_at)}</div>
            </div>
          </div>

          {/* Summary */}
          <div>
            <div className="text-[10px] font-bold ryze-text-muted uppercase tracking-widest mb-2">Report Summary</div>
            {report.summary ? (
              <div className="bg-white/3 border border-white/5 rounded-xl p-4 text-sm ryze-text-inverse leading-relaxed">
                {report.summary}
              </div>
            ) : (
              <div className="bg-white/3 border border-white/5 rounded-xl p-4 text-sm ryze-text-muted italic">
                No summary written yet.
              </div>
            )}
          </div>

          {/* Visibility controls */}
          <div>
            <div className="text-[10px] font-bold ryze-text-muted uppercase tracking-widest mb-3">Visibility</div>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer bg-white/3 border border-white/5 rounded-xl p-3">
                <div
                  onClick={() => setVisibleParent((v) => !v)}
                  className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${
                    visibleParent ? 'bg-[#FFB000]' : 'bg-white/10'
                  }`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                    visibleParent ? 'translate-x-4' : ''
                  }`} />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold ryze-text-inverse flex items-center gap-1.5">
                    {visibleParent ? <Eye size={13} /> : <EyeOff size={13} />}
                    Visible to Parent
                  </div>
                  <div className="text-xs ryze-text-muted">Parent can view this report in their portal</div>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer bg-white/3 border border-white/5 rounded-xl p-3">
                <div
                  onClick={() => setVisibleStudent((v) => !v)}
                  className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${
                    visibleStudent ? 'bg-[#FFB000]' : 'bg-white/10'
                  }`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                    visibleStudent ? 'translate-x-4' : ''
                  }`} />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold ryze-text-inverse flex items-center gap-1.5">
                    {visibleStudent ? <Eye size={13} /> : <EyeOff size={13} />}
                    Visible to Student
                  </div>
                  <div className="text-xs ryze-text-muted">Student can view this report in their portal</div>
                </div>
              </label>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
              <AlertCircle size={14} className="shrink-0" /> {error}
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-2.5 bg-[#FFB000] text-[#050510] font-bold rounded-xl hover:bg-[#ffc133] transition-all disabled:opacity-60 text-sm flex items-center justify-center gap-2"
          >
            {saving
              ? <div className="w-4 h-4 border-2 border-[#050510]/30 border-t-[#050510] rounded-full animate-spin" />
              : saved
                ? <><Check size={14} /> Saved!</>
                : 'Save Visibility Settings'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

const ProgressReportsPage: React.FC = () => {
  const [reports, setReports]         = useState<ProgressReport[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [query, setQuery]             = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedReport, setSelectedReport] = useState<ProgressReport | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, any> = { limit: 300 };
      if (statusFilter !== 'all') params.status = statusFilter;
      const data = await adminApi.getProgressReports(params);
      setReports(data.items);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load reports.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  // Summary stats
  const draftCount     = reports.filter((r) => r.status === 'draft').length;
  const submittedCount = reports.filter((r) => r.status === 'submitted').length;

  // ---------------------------------------------------------------------------
  // Columns
  // ---------------------------------------------------------------------------

  const columns: Column<ProgressReport>[] = [
    {
      key: 'student_name',
      header: 'Student',
      sortable: true,
      sortValue: (r) => r.student_name,
      render: (r) => <span className="font-medium ryze-text-inverse">{r.student_name}</span>,
    },
    {
      key: 'tutor_name',
      header: 'Tutor',
      render: (r) => <span className="text-sm ryze-text-muted">{r.tutor_name}</span>,
    },
    {
      key: 'class_name',
      header: 'Class',
      render: (r) => (
        <span className="text-sm ryze-text-muted">{r.class_name ?? '—'}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => <StatusBadge value={r.status} />,
    },
    {
      key: 'visibility',
      header: 'Visibility',
      render: (r) => (
        <div className="flex items-center gap-1.5">
          {r.visible_to_parent  && <span title="Visible to parent"><Eye size={12} className="text-emerald-400" /></span>}
          {r.visible_to_student && <span title="Visible to student"><Eye size={12} className="text-blue-400" /></span>}
          {!r.visible_to_parent && !r.visible_to_student && (
            <span title="Hidden"><EyeOff size={12} className="ryze-text-muted opacity-40" /></span>
          )}
        </div>
      ),
    },
    {
      key: 'submitted_at',
      header: 'Submitted',
      sortable: true,
      sortValue: (r) => r.submitted_at ?? '',
      render: (r) => <span className="text-xs ryze-text-muted">{formatDate(r.submitted_at)}</span>,
    },
    {
      key: 'actions',
      header: '',
      cellClass: 'text-right',
      render: (r) => (
        <button
          onClick={(e) => { e.stopPropagation(); setSelectedReport(r); }}
          className="bg-white/5 border border-white/10 ryze-text-inverse font-semibold px-3 py-1.5 rounded-lg hover:bg-white/10 transition-all text-xs"
        >
          View
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
        title="Progress Reports"
        description="Tutor-submitted progress reports for students. Control visibility for parents and students."
      />

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: 'Draft',     value: draftCount,     color: 'text-slate-400' },
          { label: 'Submitted', value: submittedCount, color: 'text-[#FFB000]' },
          { label: 'Total',     value: reports.length, color: 'ryze-text-inverse' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-[#0a0f1e] border border-white/10 rounded-2xl p-4">
            <div className="text-[10px] font-bold ryze-text-muted uppercase tracking-widest mb-1">{label}</div>
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search by student, tutor, or class…"
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
          data={reports}
          rowKey={(r) => r.id}
          searchQuery={query}
          loading={false}
          onRowClick={(r) => setSelectedReport(r)}
          emptyState={
            <EmptyState
              icon={ClipboardCheck}
              title="No progress reports"
              description={
                statusFilter !== 'all'
                  ? `No ${statusFilter} reports found.`
                  : 'Progress reports are submitted by tutors after each lesson.'
              }
            />
          }
        />
      )}

      {/* Detail drawer */}
      {selectedReport && (
        <ReportDrawer
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onUpdated={load}
        />
      )}
    </div>
  );
};

export default ProgressReportsPage;
