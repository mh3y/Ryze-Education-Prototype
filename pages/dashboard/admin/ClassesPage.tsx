/**
 * ClassesPage — /dashboard/admin/classes
 *
 * Lists all class groups. Admins can search, filter by active status,
 * and click through to ClassDetail.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Users } from 'lucide-react';
import { adminApi, ClassGroupListItem } from '../../../services/adminApi';
import {
  PageHeader, SearchInput, DataTable, Column,
  StatusBadge, EmptyState, LoadingState, ErrorState,
} from '../../../components/dashboard/ui';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-AU', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  } catch { return iso; }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const ClassesPage: React.FC = () => {
  const navigate = useNavigate();

  const [items, setItems]         = useState<ClassGroupListItem[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [query, setQuery]         = useState('');
  const [showInactive, setShowInactive] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, any> = { limit: 500 };
      if (!showInactive) params.active = true;
      const data = await adminApi.getClasses(params);
      setItems(data.items);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load classes.');
    } finally {
      setLoading(false);
    }
  }, [showInactive]);

  useEffect(() => { load(); }, [load]);

  // ---------------------------------------------------------------------------
  // Columns
  // ---------------------------------------------------------------------------

  const columns: Column<ClassGroupListItem>[] = [
    {
      key: 'name',
      header: 'Class Name',
      sortable: true,
      sortValue: (r) => r.name,
      render: (r) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#FFB000]/10 border border-[#FFB000]/20 flex items-center justify-center shrink-0">
            <BookOpen size={14} className="text-[#FFB000]" />
          </div>
          <div>
            <div className="font-medium ryze-text-inverse">{r.name}</div>
            {(r.year_level || r.subject) && (
              <div className="text-xs ryze-text-muted mt-0.5">
                {[r.year_level, r.subject].filter(Boolean).join(' · ')}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'tutor',
      header: 'Tutor',
      render: (r) => (
        <span className="text-sm ryze-text-muted">
          {r.tutor?.full_name ?? <span className="opacity-40">—</span>}
        </span>
      ),
    },
    {
      key: 'member_count',
      header: 'Students',
      sortable: true,
      sortValue: (r) => r.member_count,
      render: (r) => (
        <span className="inline-flex items-center gap-1.5 text-sm ryze-text-muted">
          <Users size={13} />
          {r.member_count}
        </span>
      ),
    },
    {
      key: 'active',
      header: 'Status',
      render: (r) => (
        r.active
          ? <StatusBadge value="active" label="Active" />
          : <StatusBadge value="inactive" label="Inactive" />
      ),
    },
    {
      key: 'created_at',
      header: 'Created',
      sortable: true,
      sortValue: (r) => r.created_at,
      render: (r) => <span className="text-xs ryze-text-muted">{formatDate(r.created_at)}</span>,
    },
    {
      key: 'actions',
      header: '',
      cellClass: 'text-right',
      render: (r) => (
        <button
          onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/admin/classes/${r.id}`); }}
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
        title="Classes"
        description="All class groups managed through the Discord bot. Click a class to view its roster and upcoming lessons."
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search by class name, tutor, subject…"
          className="w-full sm:max-w-sm"
        />
        <label className="flex items-center gap-2 cursor-pointer sm:ml-auto">
          <div
            onClick={() => setShowInactive((v) => !v)}
            className={`relative w-9 h-5 rounded-full transition-colors ${
              showInactive ? 'bg-[#FFB000]' : 'bg-white/10'
            }`}
          >
            <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
              showInactive ? 'translate-x-4' : 'translate-x-0'
            }`} />
          </div>
          <span className="text-xs ryze-text-muted">Show inactive</span>
        </label>
      </div>

      {error && <ErrorState message={error} onRetry={load} />}
      {loading && <LoadingState />}

      {!loading && !error && (
        <DataTable
          columns={columns}
          data={items}
          rowKey={(r) => r.id}
          searchQuery={query}
          loading={false}
          onRowClick={(r) => navigate(`/dashboard/admin/classes/${r.id}`)}
          emptyState={
            <EmptyState
              icon={BookOpen}
              title="No classes found"
              description={
                showInactive
                  ? 'No classes exist yet. Create a class using the Discord bot.'
                  : 'No active classes found. Toggle "Show inactive" to see all classes.'
              }
            />
          }
        />
      )}
    </div>
  );
};

export default ClassesPage;
