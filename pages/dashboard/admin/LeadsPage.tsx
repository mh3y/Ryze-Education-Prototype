/**
 * LeadsPage — /dashboard/admin/leads
 *
 * CRM-style list of all enquiries captured from the public contact form.
 * Admins can filter by status, update lead status, and add notes.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { Users, RefreshCw, Mail, Phone, MessageSquare, Calendar } from 'lucide-react';
import { leadsApi, Lead, LeadStatus } from '../../../services/adminApi';
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
    return new Date(iso).toLocaleString('en-AU', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch { return iso ?? '—'; }
}

const STATUS_OPTIONS: { value: LeadStatus | ''; label: string }[] = [
  { value: '',                  label: 'All statuses' },
  { value: 'new',               label: 'New' },
  { value: 'contacted',         label: 'Contacted' },
  { value: 'qualified',         label: 'Qualified' },
  { value: 'trial_scheduled',   label: 'Trial Scheduled' },
  { value: 'trial_done',        label: 'Trial Done' },
  { value: 'enrolled',          label: 'Enrolled' },
  { value: 'lost',              label: 'Lost' },
];

// Map lead statuses to StatusBadge-compatible keys
const STATUS_BADGE_MAP: Record<LeadStatus, string> = {
  new:              'open',
  contacted:        'pending',
  qualified:        'active',
  trial_scheduled:  'upcoming',
  trial_done:       'completed',
  enrolled:         'paid',
  lost:             'withdrawn',
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface LeadDetailPanelProps {
  lead: Lead;
  onClose: () => void;
  onUpdated: (updated: Lead) => void;
}

const LeadDetailPanel: React.FC<LeadDetailPanelProps> = ({ lead, onClose, onUpdated }) => {
  const [status, setStatus]   = useState<LeadStatus>(lead.status);
  const [notes, setNotes]     = useState(lead.notes ?? '');
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const updated = await leadsApi.updateLead(lead.id, { status, notes: notes || null });
      onUpdated(updated);
      onClose();
    } catch {
      setError('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-t-2xl bg-[var(--card)] p-6 shadow-2xl sm:rounded-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">{lead.name}</h2>
            <p className="text-sm text-[var(--text-muted)]">{lead.email}</p>
          </div>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">✕</button>
        </div>

        <div className="mb-4 space-y-2 text-sm">
          {lead.phone && (
            <div className="flex items-center gap-2 text-[var(--text-secondary)]">
              <Phone size={14} />
              <span>{lead.phone}</span>
            </div>
          )}
          {lead.message && (
            <div className="flex items-start gap-2 text-[var(--text-secondary)]">
              <MessageSquare size={14} className="mt-0.5 shrink-0" />
              <span className="leading-relaxed">{lead.message}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-[var(--text-muted)]">
            <Calendar size={14} />
            <span>Received {formatDate(lead.created_at)}</span>
          </div>
          {lead.page && (
            <div className="text-[var(--text-muted)]">
              Page: <span className="font-mono text-xs">{lead.page}</span>
            </div>
          )}
          {(lead.utm_source || lead.utm_campaign) && (
            <div className="text-[var(--text-muted)]">
              UTM: {[lead.utm_source, lead.utm_medium, lead.utm_campaign].filter(Boolean).join(' / ')}
            </div>
          )}
        </div>

        <div className="mb-3">
          <label className="mb-1 block text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">Status</label>
          <select
            value={status}
            onChange={e => setStatus(e.target.value as LeadStatus)}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--input-bg)] px-3 py-2 text-sm text-[var(--text-primary)]"
          >
            {STATUS_OPTIONS.slice(1).map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">Notes</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={3}
            placeholder="Add notes about this enquiry…"
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--input-bg)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] resize-none"
          />
        </div>

        {error && <p className="mb-3 text-sm" style={{ color: 'var(--danger)' }}>{error}</p>}

        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
          <button
            onClick={onClose}
            className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors"
          >
            Cancel
          </button>
          {lead.email && (
            <a
              href={`mailto:${lead.email}`}
              className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors"
              title="Email this lead"
            >
              <Mail size={15} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

const LeadsPage: React.FC = () => {
  const [leads, setLeads]           = useState<Lead[]>([]);
  const [total, setTotal]           = useState(0);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [search, setSearch]         = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | ''>('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await leadsApi.getLeads({
        status: statusFilter || undefined,
        limit: 200,
      });
      setLeads(res.items);
      setTotal(res.total);
    } catch {
      setError('Failed to load leads. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  const filteredLeads = search
    ? leads.filter(l =>
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.email.toLowerCase().includes(search.toLowerCase()) ||
        (l.phone ?? '').includes(search)
      )
    : leads;

  const handleUpdated = (updated: Lead) => {
    setLeads(prev => prev.map(l => l.id === updated.id ? updated : l));
  };

  // ── Table columns ────────────────────────────────────────────────────────

  const columns: Column<Lead>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (l) => (
        <div>
          <div className="font-medium text-[var(--text-primary)]">{l.name}</div>
          <div className="text-xs text-[var(--text-muted)]">{l.email}</div>
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'Phone',
      render: (l) => l.phone ?? '—',
    },
    {
      key: 'page',
      header: 'Source',
      render: (l) => (
        <span className="text-xs font-mono text-[var(--text-muted)]">
          {l.page ?? l.source ?? '—'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (l) => <StatusBadge value={STATUS_BADGE_MAP[l.status] ?? l.status} label={l.status.replace(/_/g, ' ')} />,
    },
    {
      key: 'created_at',
      header: 'Received',
      render: (l) => (
        <span className="text-xs text-[var(--text-muted)]">{formatDate(l.created_at)}</span>
      ),
    },
  ];

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6">
      <PageHeader
        title="Leads"
        description={`${total} enquir${total === 1 ? 'y' : 'ies'} captured from the website`}
        actions={
          <button
            onClick={load}
            disabled={loading}
            className="btn btn--secondary flex items-center gap-2"
            title="Refresh"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by name, email or phone…"
          className="max-w-xs"
        />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as LeadStatus | '')}
          className="rounded-lg border border-[var(--border)] bg-[var(--input-bg)] px-3 py-2 text-sm text-[var(--text-primary)]"
        >
          {STATUS_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingState message="Loading leads…" />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : filteredLeads.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No leads yet"
          description={search || statusFilter ? 'Try adjusting your filters.' : 'Enquiries submitted via the website will appear here.'}
        />
      ) : (
        <DataTable
          columns={columns}
          data={filteredLeads}
          rowKey={(l) => l.id}
          onRowClick={(l) => setSelectedLead(l)}
        />
      )}

      {/* Detail panel */}
      {selectedLead && (
        <LeadDetailPanel
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onUpdated={handleUpdated}
        />
      )}
    </div>
  );
};

export default LeadsPage;
