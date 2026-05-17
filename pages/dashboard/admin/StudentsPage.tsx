/**
 * StudentsPage — /dashboard/admin/students
 *
 * Lists all students with search, role-filter tabs, active toggle,
 * and a sortable DataTable. Clicking a row or "View" navigates to
 * the student detail page.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserPlus, Info } from 'lucide-react';
import { adminApi, StudentListItem } from '../../../services/adminApi';
import {
  PageHeader,
  SearchInput,
  DataTable,
  Column,
  StatusBadge,
  EmptyState,
  LoadingState,
  ErrorState,
} from '../../../components/dashboard/ui';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-AU', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

const ROLE_TABS = ['all', 'student', 'tutor', 'admin'] as const;
type RoleTab = (typeof ROLE_TABS)[number];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const StudentsPage: React.FC = () => {
  const navigate = useNavigate();

  const [students, setStudents]       = useState<StudentListItem[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleTab, setRoleTab]         = useState<RoleTab>('all');
  const [showInactive, setShowInactive] = useState(false);
  const [addBanner, setAddBanner]     = useState(false);

  // ── Fetch ────────────────────────────────────────────────────────────────//
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, any> = {};
      if (!showInactive) params.active = true;
      if (roleTab !== 'all') params.role = roleTab;
      const { items } = await adminApi.getStudents({ ...params, limit: 500 });
      setStudents(items);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load students.');
    } finally {
      setLoading(false);
    }
  }, [roleTab, showInactive]);

  useEffect(() => { load(); }, [load]);

  // ── Columns ──────────────────────────────────────────────────────────────//
  const columns: Column<StudentListItem>[] = [
    {
      key: 'full_name',
      header: 'Name',
      sortable: true,
      sortValue: (r) => r.full_name,
      render: (r) => (
        <div className="flex items-center gap-2">
          <span className="font-medium ryze-text-inverse">{r.full_name}</span>
          {!r.active && (
            <span className="text-[10px] font-semibold bg-slate-500/20 text-slate-400 px-1.5 py-0.5 rounded-full">
              inactive
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'discord_user_id',
      header: 'Discord ID',
      sortable: true,
      sortValue: (r) => r.discord_user_id,
      render: (r) => (
        <span className="font-mono text-xs ryze-text-muted">{r.discord_user_id}</span>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (r) => <StatusBadge value={r.role} />,
    },
    {
      key: 'class_count',
      header: 'Classes',
      sortable: true,
      sortValue: (r) => r.class_count,
      render: (r) => (
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-white/5 text-xs font-bold ryze-text-inverse">
          {r.class_count}
        </span>
      ),
    },
    {
      key: 'created_at',
      header: 'Joined',
      sortable: true,
      sortValue: (r) => new Date(r.created_at).getTime(),
      render: (r) => (
        <span className="text-xs ryze-text-muted">{formatDate(r.created_at)}</span>
      ),
    },
    {
      key: 'actions',
      header: '',
      cellClass: 'text-right',
      render: (r) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/dashboard/admin/students/${r.id}`);
          }}
          className="bg-white/5 border border-white/10 ryze-text-inverse font-semibold px-3 py-1.5 rounded-lg hover:bg-white/10 transition-all text-xs"
        >
          View
        </button>
      ),
    },
  ];

  // ── Render ───────────────────────────────────────────────────────────────//
  return (
    <div className="space-y-6">

      {/* Header */}
      <PageHeader
        title="Students"
        description="View and manage all students, tutors, and admins in the portal."
        actions={
          <button
            onClick={() => setAddBanner(true)}
            className="flex items-center gap-2 bg-[#FFB000] text-[#050510] font-bold px-4 py-2.5 rounded-xl hover:bg-[#ffc133] transition-all text-sm"
          >
            <UserPlus size={15} />
            Add Student
          </button>
        }
      />

      {/* Add student info banner */}
      {addBanner && (
        <div className="flex items-start gap-3 bg-[#FFB000]/10 border border-[#FFB000]/20 rounded-2xl p-4">
          <Info size={16} className="text-[#FFB000] shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-[#FFB000]">Students are added via Discord</p>
            <p className="text-xs ryze-text-muted mt-0.5">
              Use the Discord bot command <code className="bg-white/10 px-1.5 py-0.5 rounded text-[#FFB000]">/addstudent</code> to
              register a new student. They will appear here once created.
            </p>
          </div>
          <button
            onClick={() => setAddBanner(false)}
            className="text-xs ryze-text-muted hover:ryze-text-inverse transition-colors shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filters row */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by name, Discord ID, email…"
          className="w-full sm:max-w-xs"
        />

        {/* Role tabs */}
        <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
          {ROLE_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setRoleTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                roleTab === tab
                  ? 'bg-white/10 ryze-text-inverse'
                  : 'ryze-text-muted hover:ryze-text-inverse'
              }`}
            >
              {tab === 'all' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1) + 's'}
            </button>
          ))}
        </div>

        {/* Active toggle */}
        <label className="flex items-center gap-2 cursor-pointer ml-auto sm:ml-0">
          <div
            onClick={() => setShowInactive((v) => !v)}
            className={`relative w-9 h-5 rounded-full transition-colors ${
              showInactive ? 'bg-[#FFB000]' : 'bg-white/10'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                showInactive ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </div>
          <span className="text-xs ryze-text-muted">Show inactive</span>
        </label>
      </div>

      {/* Error */}
      {error && !loading && (
        <ErrorState message={error} onRetry={load} />
      )}

      {/* Loading */}
      {loading && <LoadingState />}

      {/* Table */}
      {!loading && !error && (
        <DataTable
          columns={columns}
          data={students}
          rowKey={(r) => r.id}
          searchQuery={searchQuery}
          loading={false}
          onRowClick={(r) => navigate(`/dashboard/admin/students/${r.id}`)}
          emptyState={
            <EmptyState
              icon={Users}
              title="No students found"
              description={
                searchQuery
                  ? `No results for "${searchQuery}". Try a different search.`
                  : 'No students match the current filters.'
              }
            />
          }
        />
      )}
    </div>
  );
};

export default StudentsPage;
