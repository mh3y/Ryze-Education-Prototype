/**
 * LessonsPage — /dashboard/admin/lessons
 *
 * Lists lessons with filters for status and class. Admins and tutors
 * can view lesson details and navigate to attendance marking.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, Clock, MapPin } from 'lucide-react';
import { adminApi, LessonListItem, ClassGroupListItem } from '../../../services/adminApi';
import {
  PageHeader, SearchInput, DataTable, Column,
  StatusBadge, EmptyState, LoadingState, ErrorState,
} from '../../../components/dashboard/ui';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('en-AU', {
      weekday: 'short', day: 'numeric', month: 'short',
      hour: '2-digit', minute: '2-digit',
    });
  } catch { return iso; }
}

function formatTime(iso: string | null | undefined): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleTimeString('en-AU', {
      hour: '2-digit', minute: '2-digit',
    });
  } catch { return ''; }
}

type StatusFilter = 'all' | 'active' | 'scheduled' | 'completed' | 'cancelled';
const STATUS_TABS: StatusFilter[] = ['all', 'active', 'scheduled', 'completed', 'cancelled'];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const LessonsPage: React.FC = () => {
  const navigate = useNavigate();

  const [lessons, setLessons]         = useState<LessonListItem[]>([]);
  const [classes, setClasses]         = useState<ClassGroupListItem[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [query, setQuery]             = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [classFilter, setClassFilter]   = useState<number | null>(null);
  const [upcomingOnly, setUpcomingOnly] = useState(false);

  // ── Fetch classes for dropdown ───────────────────────────────────────────
  useEffect(() => {
    adminApi.getClasses({ limit: 200, active: true })
      .then((d) => setClasses(d.items))
      .catch(() => {/* non-critical */});
  }, []);

  // ── Fetch lessons ─────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, any> = { limit: 300 };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (classFilter) params.class_group_id = classFilter;
      if (upcomingOnly) params.upcoming_only = true;
      const data = await adminApi.getLessons(params);
      setLessons(data.items);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load lessons.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, classFilter, upcomingOnly]);

  useEffect(() => { load(); }, [load]);

  // ---------------------------------------------------------------------------
  // Columns
  // ---------------------------------------------------------------------------

  const columns: Column<LessonListItem>[] = [
    {
      key: 'title',
      header: 'Lesson',
      sortable: true,
      sortValue: (r) => r.title,
      render: (r) => (
        <div>
          <div className="font-medium ryze-text-inverse">{r.title}</div>
          {r.class_group_name && (
            <div className="text-xs ryze-text-muted mt-0.5">{r.class_group_name}</div>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => <StatusBadge value={r.status} />,
    },
    {
      key: 'start_time',
      header: 'Start',
      sortable: true,
      sortValue: (r) => r.start_time,
      render: (r) => (
        <div className="text-xs ryze-text-muted">
          <div className="flex items-center gap-1.5">
            <CalendarDays size={11} />
            {formatDateTime(r.start_time)}
          </div>
          {r.end_time && (
            <div className="flex items-center gap-1.5 mt-0.5 opacity-60">
              <Clock size={11} />
              ends {formatTime(r.end_time)}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'location',
      header: 'Location',
      render: (r) => (
        r.location
          ? (
            <span className="flex items-center gap-1.5 text-xs ryze-text-muted">
              <MapPin size={11} /> {r.location}
            </span>
          )
          : <span className="text-xs ryze-text-muted opacity-40">—</span>
      ),
    },
    {
      key: 'actions',
      header: '',
      cellClass: 'text-right',
      render: (r) => (
        <button
          onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/admin/lessons/${r.id}`); }}
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
        title="Lessons"
        description="All scheduled and past lessons across every class group."
      />

      {/* Filters */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search by lesson title or class…"
            className="w-full sm:max-w-sm"
          />

          {/* Class filter dropdown */}
          <select
            value={classFilter ?? ''}
            onChange={(e) => setClassFilter(e.target.value ? Number(e.target.value) : null)}
            className="px-3 py-2.5 bg-[#050510] border border-white/10 rounded-xl text-sm ryze-text-inverse focus:outline-none focus:border-[#FFB000]/40 transition-all"
          >
            <option value="">All classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {/* Upcoming toggle */}
          <label className="flex items-center gap-2 cursor-pointer sm:ml-auto">
            <div
              onClick={() => setUpcomingOnly((v) => !v)}
              className={`relative w-9 h-5 rounded-full transition-colors ${
                upcomingOnly ? 'bg-[#FFB000]' : 'bg-white/10'
              }`}
            >
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                upcomingOnly ? 'translate-x-4' : 'translate-x-0'
              }`} />
            </div>
            <span className="text-xs ryze-text-muted">Upcoming only</span>
          </label>
        </div>

        {/* Status tabs */}
        <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1 w-fit">
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
          data={lessons}
          rowKey={(r) => r.id}
          searchQuery={query}
          loading={false}
          onRowClick={(r) => navigate(`/dashboard/admin/lessons/${r.id}`)}
          emptyState={
            <EmptyState
              icon={CalendarDays}
              title="No lessons found"
              description={
                statusFilter !== 'all' || classFilter
                  ? 'Try adjusting your filters.'
                  : 'Lessons are created via the Discord bot.'
              }
            />
          }
        />
      )}
    </div>
  );
};

export default LessonsPage;
