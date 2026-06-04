/**
 * ParentsPage — /dashboard/admin/parents
 *
 * Lists all parent profiles. Admin can create a new parent (generates invite
 * link), search, and click through to ParentDetail.
 *
 * Parents access the portal via email + password (no Discord required).
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserPlus, Copy, Check, X, AlertCircle } from 'lucide-react';
import { adminApi, ParentListItem } from '../../../services/adminApi';
import { auditLog } from '../../../services/auditLog';
import { useAuth } from '../../../contexts/AuthContext';
import {
  PageHeader, SearchInput, DataTable, Column,
  StatusBadge, EmptyState, LoadingState, ErrorState,
} from '../../../components/dashboard/ui';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(iso: string): string {
  try { return new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }); }
  catch { return iso; }
}

// ---------------------------------------------------------------------------
// Create Parent Modal
// ---------------------------------------------------------------------------

interface CreateParentModalProps {
  onClose: () => void;
  onCreated: (inviteLink: string, parentName: string) => void;
}

const CreateParentModal: React.FC<CreateParentModalProps> = ({ onClose, onCreated }) => {
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', phone: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const result = await adminApi.createParent({
        first_name: form.first_name,
        last_name:  form.last_name,
        email:      form.email,
        phone:      form.phone  || undefined,
        notes:      form.notes  || undefined,
      });
      onCreated(result.invite_link, `${form.first_name} ${form.last_name}`);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to create parent.');
    } finally {
      setSaving(false);
    }
  };

  const inputCls = 'w-full px-4 py-2.5 bg-[#050510] border border-white/10 rounded-xl text-sm ryze-text-inverse focus:outline-none focus:border-[#FFB000]/40 focus:ring-1 focus:ring-[#FFB000]/20 transition-all placeholder-slate-600';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-[#0a0f1e] border border-white/10 rounded-2xl shadow-2xl max-w-lg w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold ryze-text-inverse text-lg">Add Parent</h3>
          <button onClick={onClose} className="ryze-text-muted hover:ryze-text-inverse transition-colors">
            <X size={20} />
          </button>
        </div>

        <p className="text-sm ryze-text-muted mb-5 leading-relaxed">
          Parents log in via <strong className="ryze-text-inverse">email + password</strong> — no Discord account needed.
          An invite link will be generated for them to set their password.
        </p>

        {error && (
          <div className="flex items-center gap-2 text-sm border rounded-xl p-3 mb-4" style={{ color: 'var(--danger)', background: 'color-mix(in oklab, var(--danger) 10%, transparent)', borderColor: 'color-mix(in oklab, var(--danger) 20%, transparent)' }}>
            <AlertCircle size={14} className="shrink-0" /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold ryze-text-muted uppercase tracking-widest mb-1.5">First Name *</label>
              <input required type="text" className={inputCls} value={form.first_name}
                onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))} placeholder="Sarah" />
            </div>
            <div>
              <label className="block text-[10px] font-bold ryze-text-muted uppercase tracking-widest mb-1.5">Last Name *</label>
              <input required type="text" className={inputCls} value={form.last_name}
                onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))} placeholder="Johnson" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold ryze-text-muted uppercase tracking-widest mb-1.5">Email Address *</label>
            <input required type="email" className={inputCls} value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="parent@example.com" />
          </div>
          <div>
            <label className="block text-[10px] font-bold ryze-text-muted uppercase tracking-widest mb-1.5">Phone</label>
            <input type="tel" className={inputCls} value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="0400 000 000" />
          </div>
          <div>
            <label className="block text-[10px] font-bold ryze-text-muted uppercase tracking-widest mb-1.5">Notes (admin only)</label>
            <textarea rows={2} className={`${inputCls} resize-none`} value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Internal notes…" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 bg-white/5 border border-white/10 ryze-text-inverse font-semibold rounded-xl hover:bg-white/10 transition-all text-sm">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 bg-[#FFB000] text-[#050510] font-bold rounded-xl hover:bg-[#ffc133] transition-all disabled:opacity-60 text-sm flex items-center justify-center gap-2">
              {saving
                ? <div className="w-4 h-4 border-2 border-[#050510]/30 border-t-[#050510] rounded-full animate-spin" />
                : <UserPlus size={14} />}
              Create & Get Invite Link
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Invite Link Banner
// ---------------------------------------------------------------------------

const InviteBanner: React.FC<{ link: string; name: string; onClose: () => void }> = ({ link, name, onClose }) => {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border rounded-2xl p-5" style={{ background: 'color-mix(in oklab, var(--ok) 10%, transparent)', borderColor: 'color-mix(in oklab, var(--ok) 20%, transparent)' }}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="font-bold flex items-center gap-2 mb-1" style={{ color: 'var(--ok)' }}>
            <Check size={16} /> Parent Created Successfully
          </div>
          <p className="text-sm ryze-text-muted">
            Share this invite link with <strong className="ryze-text-inverse">{name}</strong> so they can set their password and log in.
            The link expires in <strong className="ryze-text-inverse">48 hours</strong>.
          </p>
        </div>
        <button onClick={onClose} className="ryze-text-muted hover:ryze-text-inverse transition-colors ml-4 shrink-0">
          <X size={16} />
        </button>
      </div>
      <div className="flex gap-2">
        <code className="flex-1 bg-black/30 text-xs px-4 py-2.5 rounded-xl font-mono truncate border" style={{ color: 'var(--ok)', borderColor: 'color-mix(in oklab, var(--ok) 10%, transparent)' }}>
          {link}
        </code>
        <button
          onClick={copy}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all bg-white/5 border border-white/10 hover:bg-white/10"
          style={copied ? { color: 'var(--ok)' } : undefined}
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

const ParentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [items, setItems]     = useState<ParentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [query, setQuery]     = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [inviteBanner, setInviteBanner] = useState<{ link: string; name: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getParents({ limit: 500 });
      // Defensive filter: the production backend's GET /api/admin/parents
      // currently returns rows from the generic Discord users table instead of
      // the parent_profiles table, which means tutors and students can appear
      // here. Genuine parent records always have `invite_pending` as a boolean
      // (set when an invite is generated); Discord user records do not. This
      // guard removes the contaminating rows until the backend is fixed.
      //
      // TODO (backend): In bot/api/routes/admin.py, fix the GET /api/admin/parents
      // route to query the `parent_profiles` table (or equivalent) exclusively,
      // not the `users`/Discord user table. The query should JOIN or filter so
      // only users with role='parent' or entries in parent_profiles are returned.
      const parentRecords = data.items.filter(
        (item) => typeof item.invite_pending === 'boolean',
      );
      setItems(parentRecords);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load parents.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreated = (inviteLink: string, parentName: string) => {
    auditLog.log('create', 'parent', 'new', parentName, user?.name ?? 'Admin', 'Parent account created, invite link generated');
    setShowCreate(false);
    setInviteBanner({ link: inviteLink, name: parentName });
    load();
  };

  // ---------------------------------------------------------------------------
  // Table columns
  // ---------------------------------------------------------------------------

  const columns: Column<ParentListItem>[] = [
    {
      key: 'full_name',
      header: 'Name',
      sortable: true,
      sortValue: (r) => r.full_name,
      render: (r) => (
        <span className="font-medium ryze-text-inverse">{r.full_name}</span>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      render: (r) => <span className="text-sm ryze-text-muted">{r.email}</span>,
    },
    {
      key: 'phone',
      header: 'Phone',
      render: (r) => <span className="text-sm ryze-text-muted">{r.phone ?? '—'}</span>,
    },
    {
      key: 'portal_status',
      header: 'Portal Access',
      render: (r) => {
        if (r.has_set_password)  return <StatusBadge value="active" label="Can log in" />;
        if (r.invite_pending)    return <StatusBadge value="pending" label="Invite sent" />;
        return <StatusBadge value="unknown" label="No invite" />;
      },
    },
    {
      key: 'created_at',
      header: 'Added',
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
          onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/admin/parents/${r.id}`); }}
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
        title="Parents"
        description="Parent accounts use email + password login — no Discord required. Create a parent profile to generate their portal invite."
        actions={
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-[#FFB000] text-[#050510] font-bold text-sm px-4 py-2.5 rounded-xl hover:bg-[#ffc133] transition-all"
          >
            <UserPlus size={15} /> Add Parent
          </button>
        }
      />

      {/* Invite banner */}
      {inviteBanner && (
        <InviteBanner
          link={inviteBanner.link}
          name={inviteBanner.name}
          onClose={() => setInviteBanner(null)}
        />
      )}

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
          onRowClick={(r) => navigate(`/dashboard/admin/parents/${r.id}`)}
          emptyState={
            <EmptyState
              icon={Users}
              title="No parents yet"
              description="Click 'Add Parent' to create a parent profile and generate their portal invite link."
              action={
                <button
                  onClick={() => setShowCreate(true)}
                  className="flex items-center gap-2 text-sm font-semibold text-[#FFB000] bg-[#FFB000]/10 px-4 py-2 rounded-xl hover:bg-[#FFB000]/20 transition-all"
                >
                  <UserPlus size={14} /> Add First Parent
                </button>
              }
            />
          }
        />
      )}

      {/* Create modal */}
      {showCreate && (
        <CreateParentModal onClose={() => setShowCreate(false)} onCreated={handleCreated} />
      )}
    </div>
  );
};

export default ParentsPage;
