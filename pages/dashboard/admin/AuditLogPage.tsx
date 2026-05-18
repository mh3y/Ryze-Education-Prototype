/**
 * AuditLogPage — /dashboard/admin/audit-log
 *
 * Displays the frontend audit trail of all admin actions (create, update,
 * delete, etc.) stored in localStorage by auditLog.ts.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { ClipboardList, Trash2, RefreshCw, Filter } from 'lucide-react';
import { auditLog, AuditEntry, AuditAction, AuditEntityType } from '../../../services/auditLog';
import { PageHeader, EmptyState, SearchInput } from '../../../components/dashboard/ui';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString('en-AU', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

const ACTION_COLOUR: Record<AuditAction, string> = {
  create:     '#4f9b6a',
  update:     '#5e7fb3',
  delete:     '#c25450',
  deactivate: '#c89e2b',
  enroll:     '#4f9b6a',
  withdraw:   '#c89e2b',
  publish:    '#4f9b6a',
  archive:    '#8a8b8e',
};

const ACTION_LABEL: Record<AuditAction, string> = {
  create:     'Created',
  update:     'Updated',
  delete:     'Deleted',
  deactivate: 'Deactivated',
  enroll:     'Enrolled',
  withdraw:   'Withdrawn',
  publish:    'Published',
  archive:    'Archived',
};

const ENTITY_LABEL: Record<AuditEntityType, string> = {
  student:      'Student',
  parent:       'Parent',
  tutor:        'Tutor',
  class:        'Class',
  lesson:       'Lesson',
  payment:      'Payment',
  announcement: 'Announcement',
  resource:     'Resource',
  homework:     'Homework',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const AuditLogPage: React.FC = () => {
  const [entries, setEntries]         = useState<AuditEntry[]>([]);
  const [query, setQuery]             = useState('');
  const [filterAction, setFilterAction] = useState<AuditAction | 'all'>('all');
  const [filterEntity, setFilterEntity] = useState<AuditEntityType | 'all'>('all');
  const [clearing, setClearing]       = useState(false);

  const load = () => setEntries(auditLog.getEntries());

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    let list = entries;
    if (filterAction !== 'all') list = list.filter((e) => e.action === filterAction);
    if (filterEntity !== 'all') list = list.filter((e) => e.entityType === filterEntity);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((e) =>
        e.entityName.toLowerCase().includes(q) ||
        e.adminName.toLowerCase().includes(q) ||
        e.details?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [entries, filterAction, filterEntity, query]);

  const handleClear = () => {
    if (!window.confirm('Clear the entire audit log? This cannot be undone.')) return;
    setClearing(true);
    auditLog.clear();
    setEntries([]);
    setClearing(false);
  };

  const selectStyle: React.CSSProperties = {
    height: 36, padding: '0 10px', borderRadius: 9,
    fontSize: 12.5, fontWeight: 600,
    background: 'var(--bg-surface-2)', border: '1px solid var(--border-soft)',
    color: 'var(--fg-default)', cursor: 'pointer', appearance: 'none' as React.CSSProperties['appearance'],
    paddingRight: 28,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Log"
        description="A record of all admin actions — creates, updates, deletes, and enrolment changes."
      />

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <SearchInput value={query} onChange={setQuery} placeholder="Search name, admin, details…" className="max-w-xs" />

        <div style={{ position: 'relative' }}>
          <Filter size={12} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--fg-muted)', pointerEvents: 'none' }} />
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value as AuditAction | 'all')}
            style={{ ...selectStyle, paddingLeft: 28 }}
          >
            <option value="all">All actions</option>
            {(Object.keys(ACTION_LABEL) as AuditAction[]).map((a) => (
              <option key={a} value={a}>{ACTION_LABEL[a]}</option>
            ))}
          </select>
        </div>

        <div style={{ position: 'relative' }}>
          <select
            value={filterEntity}
            onChange={(e) => setFilterEntity(e.target.value as AuditEntityType | 'all')}
            style={selectStyle}
          >
            <option value="all">All types</option>
            {(Object.keys(ENTITY_LABEL) as AuditEntityType[]).map((t) => (
              <option key={t} value={t}>{ENTITY_LABEL[t]}</option>
            ))}
          </select>
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button
            onClick={load}
            style={{ height: 36, padding: '0 12px', borderRadius: 9, fontSize: 13, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--bg-surface)', color: 'var(--fg-muted)', border: '1px solid var(--border-soft)', cursor: 'pointer' }}
          >
            <RefreshCw size={13} /> Refresh
          </button>
          <button
            onClick={handleClear}
            disabled={clearing || entries.length === 0}
            style={{ height: 36, padding: '0 12px', borderRadius: 9, fontSize: 13, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6, background: 'color-mix(in oklab, var(--danger) 10%, transparent)', color: 'var(--danger)', border: '1px solid color-mix(in oklab, var(--danger) 24%, transparent)', cursor: 'pointer' }}
          >
            <Trash2 size={13} /> Clear log
          </button>
        </div>
      </div>

      {/* Count */}
      {entries.length > 0 && (
        <div style={{ fontSize: 12, color: 'var(--fg-muted)' }}>
          Showing {filtered.length} of {entries.length} entries
        </div>
      )}

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No audit entries"
          description="Admin actions like creating students, deleting records, and changing enrolments will appear here."
        />
      ) : (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-faint)', borderRadius: 'var(--radius-card, 16px)', overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-surface-2)', borderBottom: '1px solid var(--border-soft)' }}>
                {['Timestamp', 'Action', 'Type', 'Name / ID', 'Details', 'Admin'].map((h) => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--fg-muted)', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((entry, i) => (
                <tr key={entry.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border-faint)' : undefined }}>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--fg-muted)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
                    {formatDate(entry.timestamp)}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                      padding: '3px 8px', borderRadius: 999,
                      background: `color-mix(in oklab, ${ACTION_COLOUR[entry.action]} 14%, transparent)`,
                      color: ACTION_COLOUR[entry.action],
                      border: `1px solid color-mix(in oklab, ${ACTION_COLOUR[entry.action]} 28%, transparent)`,
                    }}>
                      {ACTION_LABEL[entry.action]}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 12.5, color: 'var(--fg-muted)' }}>
                    {ENTITY_LABEL[entry.entityType]}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--fg-strong)' }}>{entry.entityName}</div>
                    <div style={{ fontSize: 11, color: 'var(--fg-faint)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>ID {entry.entityId}</div>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 12.5, color: 'var(--fg-muted)', maxWidth: 260 }}>
                    {entry.details ?? '—'}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 12.5, color: 'var(--fg-default)', whiteSpace: 'nowrap' }}>
                    {entry.adminName}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AuditLogPage;
