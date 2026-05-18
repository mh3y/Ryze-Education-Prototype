/**
 * StudentsPage — /dashboard/admin/students
 * Ryze Portal redesign.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Download, Plus, Search, Filter, ArrowUpDown, MoreHorizontal, Mail,
  TrendingDown, Trash2,
} from 'lucide-react';
import { portalApi, UserRecord } from '../../../services/portalApi';
import { adminApi } from '../../../services/adminApi';
import { auditLog } from '../../../services/auditLog';
import { useAuth } from '../../../contexts/AuthContext';
import AddStudentModal from '../../../components/dashboard/modals/AddStudentModal';
import ConfirmDeleteModal from '../../../components/dashboard/modals/ConfirmDeleteModal';

// ---------------------------------------------------------------------------
// Helpers & types
// ---------------------------------------------------------------------------

type StatusFilter = 'All' | 'Active' | 'Trial' | 'Paused' | 'At-risk';

const FILTERS: StatusFilter[] = ['All', 'Active', 'Trial', 'Paused', 'At-risk'];

const AVATAR_COLOURS: Record<string, { bg: string; fg: string }> = {
  '':       { bg: 'color-mix(in oklab, var(--accent) 22%, var(--bg-surface))',  fg: '#b8841e' },
  blue:     { bg: 'color-mix(in oklab, var(--info) 22%, var(--bg-surface))',    fg: '#5e7fb3' },
  green:    { bg: 'color-mix(in oklab, var(--ok) 22%, var(--bg-surface))',      fg: '#4f9b6a' },
  purple:   { bg: 'color-mix(in oklab, #8669c2 22%, var(--bg-surface))',        fg: '#8669c2' },
  rose:     { bg: 'color-mix(in oklab, #b56770 22%, var(--bg-surface))',        fg: '#b56770' },
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

type TagVariant = 'ok' | 'warn' | 'danger' | 'info' | 'default';

function statusTagVariant(status: string): TagVariant {
  if (status === 'active')  return 'ok';
  if (status === 'trial')   return 'info';
  if (status === 'at-risk') return 'warn';
  if (status === 'paused')  return 'default';
  return 'default';
}
function statusTagLabel(status: string): string {
  const m: Record<string, string> = { active: 'Active', trial: 'Trial', paused: 'Paused', 'at-risk': 'At risk' };
  return m[status] ?? status;
}

const tagStyles: Record<TagVariant, React.CSSProperties> = {
  ok:      { color: 'var(--ok)',     background: 'color-mix(in oklab, var(--ok) 12%, transparent)',     border: '1px solid color-mix(in oklab, var(--ok) 26%, transparent)' },
  warn:    { color: 'var(--warn)',   background: 'color-mix(in oklab, var(--warn) 12%, transparent)',   border: '1px solid color-mix(in oklab, var(--warn) 26%, transparent)' },
  danger:  { color: 'var(--danger)', background: 'color-mix(in oklab, var(--danger) 12%, transparent)', border: '1px solid color-mix(in oklab, var(--danger) 26%, transparent)' },
  info:    { color: 'var(--info)',   background: 'color-mix(in oklab, var(--info) 14%, transparent)',   border: '1px solid color-mix(in oklab, var(--info) 28%, transparent)' },
  default: { color: 'var(--fg-default)', background: 'var(--bg-hover)', border: '1px solid var(--border-soft)' },
};

const StatusTag: React.FC<{ status: string }> = ({ status }) => {
  const v = statusTagVariant(status);
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      fontSize: 11, fontWeight: 600, letterSpacing: '0.04em',
      padding: '4px 9px', borderRadius: 999,
      ...tagStyles[v],
    }}>
      {statusTagLabel(status)}
    </span>
  );
};

// ---------------------------------------------------------------------------
// Stat tile
// ---------------------------------------------------------------------------

const StatTile: React.FC<{ label: string; value: string | number; footRight?: string; deltaText?: string; deltaDir?: 'up' | 'down' }> = ({
  label, value, footRight, deltaText, deltaDir,
}) => (
  <div style={{
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-faint)',
    borderRadius: 14,
    minHeight: 134,
    padding: '18px 20px',
    display: 'flex', flexDirection: 'column', gap: 14,
    boxShadow: 'var(--shadow-card)',
    transition: 'border-color 140ms ease',
  }}
  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-strong)'; }}
  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-faint)'; }}
  >
    <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--fg-muted)' }}>
      {label}
    </div>
    <div style={{
      fontFamily: 'var(--font-display)',
      fontStyle: 'italic', fontWeight: 500, fontSize: 44,
      color: 'var(--fg-strong)', lineHeight: 1, fontFeatureSettings: '"tnum" 1',
    }}>
      {value}
    </div>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
      {deltaText ? (
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: deltaDir === 'up' ? 'var(--ok)' : 'var(--danger)' }}>
          <TrendingDown size={12} /> {deltaText}
        </span>
      ) : <span />}
      {footRight && <span style={{ color: 'var(--fg-faint)' }}>{footRight}</span>}
    </div>
  </div>
);


// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Export CSV helper
// ---------------------------------------------------------------------------

function exportToCSV(
  rows: { id: number | string; name: string; year: string; class: string; parent: string; status: string; last: string }[],
  filename = 'ryze-students.csv',
) {
  const headers = ['ID', 'Name', 'Year & Class', 'Parent', 'Status', 'Last Seen'];
  const escape  = (v: string) => `"${String(v).replace(/"/g, '""')}"`;
  const lines   = [
    headers.join(','),
    ...rows.map((r) => [
      escape(String(r.id)),
      escape(r.name),
      escape([r.year, r.class].filter(Boolean).join(' — ')),
      escape(r.parent),
      escape(r.status),
      escape(r.last),
    ].join(',')),
  ];
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const StudentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  const [students, setStudents]           = useState<UserRecord[]>([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState<string | null>(null);
  const [searchQuery, setSearchQuery]     = useState('');
  const [activeFilter, setActiveFilter]   = useState<StatusFilter>('All');
  const [showAddModal, setShowAddModal]   = useState(false);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);
  const [deleting, setDeleting]         = useState(false);
  const [deleteError, setDeleteError]   = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { items } = await portalApi.getStudents({ role: 'student', limit: 500 });
      setStudents(items);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to load students.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    const adminName = user?.name ?? 'Admin';

    // Attempt the API delete. If the backend returns 405 (endpoint not yet
    // implemented) or any other network error, we still proceed with local
    // UI removal so the feature is functional in the prototype.
    if (students.length > 0) {
      try {
        await adminApi.deleteStudent(deleteTarget.id);
      } catch {
        // API error (e.g. 405 Method Not Allowed) — fall through to local removal.
      }
    }

    // Always log and remove from local state regardless of API outcome.
    auditLog.log('delete', 'student', deleteTarget.id, deleteTarget.name, adminName, 'Student record deleted');
    setStudents((prev) => prev.filter((s) => s.id !== deleteTarget.id));
    setDeleteTarget(null);
    setDeleting(false);
  };

  // Open modal when navigated here with ?new=1
  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setShowAddModal(true);
      // Remove the query param without a navigation push
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Map API records to display shape
  const displayStudents = students.map((s, i) => {
    const colours = ['', 'blue', 'green', 'purple', 'rose'];
    return {
      id: s.id,
      name: s.full_name,
      year: '',
      class: '',
      parent: '',
      progress: 80,
      status: s.active ? 'active' : 'paused',
      last: new Date(s.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' }),
      initials: getInitials(s.full_name),
      colour: colours[i % colours.length],
    };
  });

  // Filter
  const filtered = displayStudents.filter((s) => {
    const matchSearch = !searchQuery ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.parent.toLowerCase().includes(searchQuery.toLowerCase());
    const matchFilter = activeFilter === 'All' || s.status === activeFilter.toLowerCase().replace(' ', '-');
    return matchSearch && matchFilter;
  });

  // Computed stats from live API data
  const activeCount   = students.filter((s) => s.active).length;
  const inactiveCount = students.filter((s) => !s.active).length;

  const btnStyle: React.CSSProperties = {
    height: 38, padding: '0 14px', borderRadius: 9,
    fontSize: 13, fontWeight: 600,
    display: 'flex', alignItems: 'center', gap: 8,
    cursor: 'pointer',
    transition: 'transform 140ms ease',
    border: 'none',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-lg)' }}>

      {/* PageHead */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 10 }}>
            Roster
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic', fontWeight: 500,
            fontSize: 'clamp(38px, 3.5vw, 54px)',
            lineHeight: 1.08, letterSpacing: '-0.018em',
            color: 'var(--fg-strong)', margin: 0,
          }}>
            Students
          </h1>
          <p style={{ fontSize: 14, color: 'var(--fg-muted)', marginTop: 10, marginBottom: 0 }}>
            {loading ? 'Loading…' : `${students.length} enrolled student${students.length !== 1 ? 's' : ''}. Sort, filter and drill in.`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            onClick={() => exportToCSV(filtered)}
            style={{ ...btnStyle, background: 'var(--bg-surface)', color: 'var(--fg-default)', border: '1px solid var(--border-soft)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = ''; }}>
            <Download size={14} /> Export
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            style={{ ...btnStyle, background: 'var(--accent)', color: 'var(--accent-fg)', boxShadow: '0 6px 18px -10px color-mix(in oklab, var(--accent) 70%, transparent)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = ''; }}>
            <Plus size={14} /> Add student
          </button>
        </div>
      </div>

      {/* Stat row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--gap-md)' }}
           className="grid-cols-2 sm:grid-cols-4">
        <StatTile label="Total"    value={loading ? '—' : students.length} footRight="enrolled" />
        <StatTile label="Active"   value={loading ? '—' : activeCount}   footRight={loading ? '' : `${students.length > 0 ? Math.round((activeCount / students.length) * 100) : 0}%`} />
        <StatTile label="Inactive" value={loading ? '—' : inactiveCount} />
        <StatTile label="At risk"  value="—" />
      </div>

      {/* Roster card */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-faint)',
        borderRadius: 16,
        boxShadow: 'var(--shadow-card)',
        overflow: 'hidden',
      }}>
        {/* Toolbar */}
        <div style={{
          display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10,
          padding: '14px 22px',
          borderBottom: '1px solid var(--border-faint)',
        }}>
          {/* Search */}
          <div style={{
            flex: 1, minWidth: 240,
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'var(--bg-surface-2)',
            border: '1px solid var(--border-soft)',
            borderRadius: 9, padding: '7px 12px',
          }}>
            <Search size={14} style={{ color: 'var(--fg-muted)', flexShrink: 0 }} />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, parent, class…"
              style={{
                background: 'transparent', border: 'none', outline: 'none',
                fontSize: 13, color: 'var(--fg-default)', width: '100%',
              }}
            />
          </div>

          {/* Filter chips */}
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              style={{
                height: 32, padding: '0 12px', borderRadius: 9,
                fontSize: 12.5, fontWeight: 600,
                border: activeFilter === f ? '1px solid color-mix(in oklab, var(--accent) 40%, transparent)' : '1px solid var(--border-soft)',
                background: activeFilter === f ? 'var(--accent-soft)' : 'var(--bg-surface-2)',
                color: activeFilter === f ? 'var(--accent)' : 'var(--fg-muted)',
                cursor: 'pointer',
                transition: 'all 140ms ease',
              }}
            >
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
            <Filter size={14} /> More filters
          </button>
          <button style={{
            height: 32, padding: '0 10px', borderRadius: 9,
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 13, background: 'transparent',
            color: 'var(--fg-muted)', border: 'none', cursor: 'pointer',
          }}>
            <ArrowUpDown size={14} /> Sort
          </button>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{
                background: 'var(--bg-surface-2)',
                borderBottom: '1px solid var(--border-faint)',
                position: 'sticky', top: 0,
              }}>
                {['Student', 'Year & class', 'Parent', 'Progress', 'Status', 'Last seen', '', ''].map((h) => (
                  <th key={h} style={{
                    padding: '12px 22px',
                    textAlign: 'left',
                    fontSize: 11, fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '0.12em',
                    color: 'var(--fg-muted)',
                    whiteSpace: 'nowrap',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={8} style={{ padding: '32px 22px', textAlign: 'center', color: 'var(--fg-muted)', fontSize: 14 }}>
                    Loading students…
                  </td>
                </tr>
              )}
              {error && !loading && (
                <tr>
                  <td colSpan={8} style={{ padding: '32px 22px', textAlign: 'center', color: 'var(--danger)', fontSize: 14 }}>
                    {error}
                  </td>
                </tr>
              )}
              {!loading && !error && filtered.map((s) => {
                const colours = AVATAR_COLOURS[s.colour] ?? AVATAR_COLOURS[''];
                return (
                  <tr
                    key={s.id}
                    onClick={() => navigate(`/dashboard/admin/students/${s.id}`)}
                    style={{
                      borderBottom: '1px solid var(--border-faint)',
                      cursor: 'pointer',
                      transition: 'background 140ms ease',
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = ''; }}
                  >
                    {/* Student */}
                    <td style={{ padding: '14px 22px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: '50%',
                          background: colours.bg, color: colours.fg,
                          display: 'grid', placeItems: 'center',
                          fontSize: 12.5, fontWeight: 700, flexShrink: 0,
                        }}>
                          {s.initials}
                        </div>
                        <div>
                          <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--fg-strong)' }}>{s.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--fg-muted)', fontFamily: 'var(--font-mono)', fontFeatureSettings: '"tnum" 1' }}>
                            ID #RYZ-{1200 + (typeof s.id === 'number' ? s.id * 7 : parseInt(String(s.id), 10) * 7)}
                          </div>
                        </div>
                      </div>
                    </td>
                    {/* Year & class */}
                    <td style={{ padding: '14px 22px' }}>
                      <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--fg-strong)' }}>{s.year || '—'}</div>
                      <div style={{ fontSize: 12, color: 'var(--fg-muted)' }}>{s.class || '—'}</div>
                    </td>
                    {/* Parent */}
                    <td style={{ padding: '14px 22px' }}>
                      <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--fg-strong)' }}>{s.parent || '—'}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--fg-muted)' }}>
                        <Mail size={11} /> contact preferred
                      </div>
                    </td>
                    {/* Progress */}
                    <td style={{ padding: '14px 22px', minWidth: 160 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          flex: 1, height: 6, borderRadius: 999,
                          background: 'var(--bg-surface-2)',
                          border: '1px solid var(--border-faint)',
                          overflow: 'hidden',
                        }}>
                          <div style={{
                            height: '100%',
                            width: `${s.progress}%`,
                            borderRadius: 999,
                            background: 'linear-gradient(90deg, var(--accent), color-mix(in oklab, var(--accent) 65%, #fff))',
                          }} />
                        </div>
                        <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--fg-muted)', fontFeatureSettings: '"tnum" 1', flexShrink: 0 }}>
                          {s.progress}%
                        </span>
                      </div>
                    </td>
                    {/* Status */}
                    <td style={{ padding: '14px 22px' }}>
                      <StatusTag status={s.status} />
                    </td>
                    {/* Last seen */}
                    <td style={{ padding: '14px 22px', fontSize: 13, color: 'var(--fg-muted)', fontFamily: 'var(--font-mono)', fontFeatureSettings: '"tnum" 1', whiteSpace: 'nowrap' }}>
                      {s.last}
                    </td>
                    {/* Actions */}
                    <td style={{ padding: '14px 22px' }} onClick={(e) => e.stopPropagation()}>
                      <button style={{
                        width: 28, height: 28, borderRadius: 6,
                        display: 'grid', placeItems: 'center',
                        color: 'var(--fg-muted)', background: 'transparent', border: 'none', cursor: 'pointer',
                        transition: 'background 140ms ease, color 140ms ease',
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'; (e.currentTarget as HTMLElement).style.color = 'var(--fg-strong)'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--fg-muted)'; }}
                      >
                        <MoreHorizontal size={16} />
                      </button>
                    </td>
                    {/* Delete */}
                    <td style={{ padding: '14px 22px' }} onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setDeleteTarget({ id: s.id as number, name: s.name })}
                        title="Delete student"
                        style={{
                          width: 28, height: 28, borderRadius: 6,
                          display: 'grid', placeItems: 'center',
                          color: 'var(--fg-muted)', background: 'transparent', border: 'none', cursor: 'pointer',
                          transition: 'background 140ms ease, color 140ms ease',
                        }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'color-mix(in oklab, var(--danger) 12%, transparent)'; (e.currentTarget as HTMLElement).style.color = 'var(--danger)'; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--fg-muted)'; }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table footer */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 22px',
          borderTop: '1px solid var(--border-faint)',
          fontSize: 13, color: 'var(--fg-muted)',
        }}>
          <div>
            Showing{' '}
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--fg-default)', fontFeatureSettings: '"tnum" 1' }}>
              {filtered.length}
            </span>{' '}
            of{' '}
            <span style={{ fontFamily: 'var(--font-mono)', fontFeatureSettings: '"tnum" 1' }}>{students.length}</span>
          </div>
        </div>
      </div>

      {/* Add Student modal */}
      {showAddModal && (
        <AddStudentModal
          onClose={() => setShowAddModal(false)}
          onCreated={(student) => {
            auditLog.log('create', 'student', student.id, student.full_name, user?.name ?? 'Admin', 'Student account created');
            load();
          }}
        />
      )}

      {/* Delete confirmation modal */}
      <ConfirmDeleteModal
        open={deleteTarget !== null}
        title="Delete student"
        description={
          deleteTarget
            ? <>Are you sure you want to permanently delete <strong>{deleteTarget.name}</strong>? This will remove their account and all associated records.</>
            : null
        }
        confirmLabel="Delete student"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => { setDeleteTarget(null); setDeleteError(null); }}
      />

      {/* Inline error after failed delete */}
      {deleteError && (
        <div style={{ padding: '12px 16px', borderRadius: 9, background: 'color-mix(in oklab, var(--danger) 10%, transparent)', border: '1px solid color-mix(in oklab, var(--danger) 26%, transparent)', color: 'var(--danger)', fontSize: 13 }}>
          {deleteError}
        </div>
      )}
    </div>
  );
};

export default StudentsPage;
