/**
 * TutorsPage — /dashboard/admin/tutors
 * Lists tutors (students with role=tutor) with delete confirmation.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Trash2, GraduationCap } from 'lucide-react';
import { adminApi, TutorListItem } from '../../../services/adminApi';
import { auditLog } from '../../../services/auditLog';
import { useAuth } from '../../../contexts/AuthContext';
import ConfirmDeleteModal from '../../../components/dashboard/modals/ConfirmDeleteModal';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const TutorsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [tutors, setTutors]           = useState<TutorListItem[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<TutorListItem | null>(null);
  const [deleting, setDeleting]         = useState(false);
  const [deleteError, setDeleteError]   = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { items } = await adminApi.getTutors({ limit: 500 });
      setTutors(items);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to load tutors.';
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

    try {
      await adminApi.deleteTutor(deleteTarget.id);
      auditLog.log('delete', 'tutor', deleteTarget.id, deleteTarget.full_name ?? deleteTarget.email ?? String(deleteTarget.id), adminName, 'Tutor account deleted');
      setTutors((prev) => prev.filter((t) => t.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (e: unknown) {
      setDeleteError(e instanceof Error ? e.message : 'Failed to delete tutor.');
    } finally {
      setDeleting(false);
    }
  };

  const filtered = tutors.filter((t) =>
    !searchQuery || t.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const btnStyle: React.CSSProperties = {
    height: 38, padding: '0 14px', borderRadius: 9,
    fontSize: 13, fontWeight: 600,
    display: 'flex', alignItems: 'center', gap: 8,
    cursor: 'pointer', border: 'none',
    transition: 'transform 140ms ease',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-lg)' }}>

      {/* Page head */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 10 }}>
            People
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic', fontWeight: 500,
            fontSize: 'clamp(38px, 3.5vw, 54px)',
            lineHeight: 1.08, letterSpacing: '-0.018em',
            color: 'var(--fg-strong)', margin: 0,
          }}>
            Tutors
          </h1>
          <p style={{ fontSize: 14, color: 'var(--fg-muted)', marginTop: 10, marginBottom: 0 }}>
            Manage tutor accounts and access.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            style={{ ...btnStyle, background: 'var(--accent)', color: 'var(--accent-fg)', boxShadow: '0 6px 18px -10px color-mix(in oklab, var(--accent) 70%, transparent)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = ''; }}>
            <Plus size={14} /> Add tutor
          </button>
        </div>
      </div>

      {/* Roster card */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-faint)',
        borderRadius: 'var(--radius-card, 16px)',
        boxShadow: 'var(--shadow-card)',
        overflow: 'hidden',
      }}>
        {/* Toolbar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '14px 22px',
          borderBottom: '1px solid var(--border-faint)',
        }}>
          <div style={{
            flex: 1, minWidth: 0,
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'var(--bg-surface-2)',
            border: '1px solid var(--border-soft)',
            borderRadius: 9, padding: '7px 12px',
          }}>
            <Search size={14} style={{ color: 'var(--fg-muted)', flexShrink: 0 }} />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tutors…"
              style={{
                background: 'transparent', border: 'none', outline: 'none',
                fontSize: 13, color: 'var(--fg-default)', width: '100%',
              }}
            />
          </div>
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
                {['Tutor', 'Email', 'Discord ID', 'Status', ''].map((h) => (
                  <th key={h} style={{
                    padding: 'var(--table-cell-pad, 12px 22px)',
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
                  <td colSpan={5} style={{ padding: '32px 22px', textAlign: 'center', color: 'var(--fg-muted)', fontSize: 14 }}>
                    Loading tutors…
                  </td>
                </tr>
              )}
              {error && !loading && (
                <tr>
                  <td colSpan={5} style={{ padding: '32px 22px', textAlign: 'center', color: 'var(--danger)', fontSize: 14 }}>
                    {error}
                  </td>
                </tr>
              )}
              {!loading && !error && filtered.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '48px 22px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, color: 'var(--fg-muted)' }}>
                      <GraduationCap size={32} style={{ color: 'var(--fg-faint)' }} />
                      <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--fg-strong)' }}>No tutors found</div>
                      <div style={{ fontSize: 13 }}>Add a tutor to get started.</div>
                    </div>
                  </td>
                </tr>
              )}
              {!loading && !error && filtered.map((t) => (
                <tr
                  key={t.id}
                  style={{
                    borderBottom: '1px solid var(--border-faint)',
                    transition: 'background 140ms ease',
                    cursor: 'pointer',
                  }}
                  onClick={() => navigate(`/dashboard/admin/tutors/${t.id}`)}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = ''; }}
                >
                  {/* Tutor */}
                  <td style={{ padding: 'var(--table-cell-pad, 14px 22px)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: '50%',
                        background: 'color-mix(in oklab, var(--accent) 22%, var(--bg-surface))',
                        color: '#b8841e',
                        display: 'grid', placeItems: 'center',
                        fontSize: 12.5, fontWeight: 700, flexShrink: 0,
                      }}>
                        {getInitials(t.full_name)}
                      </div>
                      <div>
                        <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--fg-strong)' }}>{t.full_name}</div>
                        <div style={{ fontSize: 12, color: 'var(--fg-muted)', fontFamily: 'var(--font-mono)', fontFeatureSettings: '"tnum" 1' }}>
                          {t.display_id ?? `RYZ-T-${String(t.id).padStart(4, '0')}`}
                        </div>
                      </div>
                    </div>
                  </td>
                  {/* Email */}
                  <td style={{ padding: 'var(--table-cell-pad, 14px 22px)', fontSize: 13, color: 'var(--fg-muted)' }}>
                    {t.email ?? '—'}
                  </td>
                  {/* Discord ID */}
                  <td style={{ padding: 'var(--table-cell-pad, 14px 22px)', fontSize: 12, color: 'var(--fg-muted)', fontFamily: 'var(--font-mono)' }}>
                    {t.discord_user_id ?? '—'}
                  </td>
                  {/* Status */}
                  <td style={{ padding: 'var(--table-cell-pad, 14px 22px)' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      fontSize: 11, fontWeight: 600, letterSpacing: '0.04em',
                      padding: '4px 9px', borderRadius: 999,
                      color: t.active ? 'var(--ok)' : 'var(--fg-muted)',
                      background: t.active ? 'color-mix(in oklab, var(--ok) 12%, transparent)' : 'var(--bg-hover)',
                      border: t.active ? '1px solid color-mix(in oklab, var(--ok) 26%, transparent)' : '1px solid var(--border-soft)',
                    }}>
                      {t.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  {/* Actions */}
                  <td style={{ padding: 'var(--table-cell-pad, 14px 22px)' }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteTarget(t); }}
                      title="Delete tutor"
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
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 22px',
          borderTop: '1px solid var(--border-faint)',
          fontSize: 13, color: 'var(--fg-muted)',
        }}>
          <div>
            Showing <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--fg-default)' }}>{filtered.length}</span> tutor{filtered.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      <ConfirmDeleteModal
        open={deleteTarget !== null}
        title="Delete tutor"
        description={
          deleteTarget
            ? <>Are you sure you want to permanently delete <strong>{deleteTarget.full_name}</strong>? This will remove their account and all associated data.</>
            : null
        }
        confirmLabel="Delete tutor"
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

export default TutorsPage;
