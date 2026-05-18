/**
 * TutorsPage — /dashboard/admin/tutors
 *
 * Lists all tutor accounts. Admin can view tutors, their assigned classes,
 * and Discord connection status.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { GraduationCap, BookOpen } from 'lucide-react';
import { adminApi, StudentListItem } from '../../../services/adminApi';
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
  } catch {
    return iso;
  }
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

const TutorsPage: React.FC = () => {
  const [items, setItems]     = useState<StudentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [query, setQuery]     = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getStudents({ role: 'tutor', limit: 200, active: true });
      setItems(data.items);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load tutors.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ---------------------------------------------------------------------------
  // Stats
  // ---------------------------------------------------------------------------

  const activeTutors  = items.filter((t) => t.active).length;
  const totalClasses  = items.reduce((sum, t) => sum + (t.class_count ?? 0), 0);

  // ---------------------------------------------------------------------------
  // Table columns
  // ---------------------------------------------------------------------------

  const columns: Column<StudentListItem>[] = [
    {
      key: 'full_name',
      header: 'Tutor',
      sortable: true,
      sortValue: (r) => r.full_name,
      render: (r) => (
        <div className="flex items-center gap-3">
          <div
            style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'rgba(245,158,11,0.15)',
              border: '1px solid rgba(245,158,11,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700, color: '#f59e0b',
              flexShrink: 0,
            }}
          >
            {r.full_name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
          </div>
          <div>
            <div className="font-medium ryze-text-inverse text-sm">{r.full_name}</div>
            {r.email && (
              <div className="text-xs ryze-text-muted">{r.email}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'discord',
      header: 'Discord',
      render: (r) => (
        <span className="text-sm ryze-text-muted font-mono">
          {r.discord_user_id ? `#${r.discord_user_id}` : '—'}
        </span>
      ),
    },
    {
      key: 'class_count',
      header: 'Classes',
      sortable: true,
      sortValue: (r) => r.class_count,
      render: (r) => (
        <span className="text-sm ryze-text-inverse font-semibold">
          {r.class_count ?? 0}
        </span>
      ),
    },
    {
      key: 'active',
      header: 'Status',
      render: (r) => (
        <StatusBadge value={r.active ? 'active' : 'inactive'} label={r.active ? 'Active' : 'Inactive'} />
      ),
    },
    {
      key: 'created_at',
      header: 'Joined',
      sortable: true,
      sortValue: (r) => r.created_at,
      render: (r) => (
        <span className="text-xs ryze-text-muted">{formatDate(r.created_at)}</span>
      ),
    },
  ];

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tutors"
        description="Manage tutor accounts. Tutors log in with Discord and are assigned to one or more class groups."
      />

      {/* Summary stats */}
      <div style={{ display: 'flex', gap: 16 }}>
        {[
          { label: 'ACTIVE TUTORS',   value: activeTutors,  icon: <GraduationCap size={18} /> },
          { label: 'CLASSES ASSIGNED', value: totalClasses, icon: <BookOpen size={18} /> },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              flex: 1, background: 'var(--bg-surface)', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 16, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16,
            }}
          >
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b',
            }}>
              {s.icon}
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--fg-muted)', marginBottom: 4 }}>
                {s.label}
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--fg-inverse)', lineHeight: 1 }}>
                {loading ? '—' : s.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <SearchInput
        value={query}
        onChange={setQuery}
        placeholder="Search by name or email…"
        className="max-w-sm"
      />

      {error && <ErrorState message={error} onRetry={load} />}
      {loading && <LoadingState />}

      {!loading && !error && (
        <DataTable
          columns={columns}
          data={items}
          rowKey={(r) => r.id}
          searchQuery={query}
          loading={false}
          emptyState={
            <EmptyState
              icon={GraduationCap}
              title="No tutors found"
              description="Tutor accounts are created by adding a Discord user with the tutor role through the backend."
            />
          }
        />
      )}
    </div>
  );
};

export default TutorsPage;
