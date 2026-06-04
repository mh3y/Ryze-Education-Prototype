/**
 * ParentDetail — /dashboard/admin/parents/:id
 *
 * Shows a parent's profile, portal access status, linked students,
 * and a payments placeholder. Admins can edit the profile, resend the
 * invite link, and manage student links from this page.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Home, Mail, Phone, FileText, Users,
  CreditCard, Check, Copy, RefreshCw, AlertCircle,
  UserPlus, Unlink, ExternalLink, X, Edit2, Save,
} from 'lucide-react';
import { adminApi, ParentDetail as ParentDetailType } from '../../../services/adminApi';
import {
  StatusBadge, LoadingState, ErrorState, ConfirmDialog, PageHeader,
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

function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return 'Never';
  try {
    return new Date(iso).toLocaleString('en-AU', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch { return iso; }
}

type Tab = 'profile' | 'students' | 'payments';

// ---------------------------------------------------------------------------
// Invite Link Banner (after resend)
// ---------------------------------------------------------------------------

const InviteLinkBanner: React.FC<{ link: string; expiresAt: string; onClose: () => void }> = ({
  link, expiresAt, onClose,
}) => {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const expires = formatDate(expiresAt);

  return (
    <div className="border rounded-2xl p-5 mb-6" style={{ background: 'color-mix(in oklab, var(--ok) 10%, transparent)', borderColor: 'color-mix(in oklab, var(--ok) 20%, transparent)' }}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="font-bold flex items-center gap-2 mb-1" style={{ color: 'var(--ok)' }}>
            <Check size={16} /> New Invite Link Generated
          </div>
          <p className="text-sm ryze-text-muted">
            Share this link with the parent. It expires on{' '}
            <strong className="ryze-text-inverse">{expires}</strong>.
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
// Link Student Modal
// ---------------------------------------------------------------------------

interface LinkStudentModalProps {
  parentId: number;
  onClose: () => void;
  onLinked: () => void;
}

const LinkStudentModal: React.FC<LinkStudentModalProps> = ({ parentId, onClose, onLinked }) => {
  const [form, setForm] = useState({
    student_user_id: '',
    relationship: '',
    is_primary_contact: false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.student_user_id) { setError('Student ID is required.'); return; }
    setSaving(true);
    setError(null);
    try {
      await adminApi.linkStudentToParent(parentId, {
        student_user_id: Number(form.student_user_id),
        relationship: form.relationship || undefined,
        is_primary_contact: form.is_primary_contact,
      });
      onLinked();
    } catch (e: any) {
      setError(e?.message ?? 'Failed to link student.');
    } finally {
      setSaving(false);
    }
  };

  const inputCls = 'w-full px-4 py-2.5 bg-[#050510] border border-white/10 rounded-xl text-sm ryze-text-inverse focus:outline-none focus:border-[#FFB000]/40 focus:ring-1 focus:ring-[#FFB000]/20 transition-all placeholder-slate-600';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-[#0a0f1e] border border-white/10 rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold ryze-text-inverse text-lg">Link Student</h3>
          <button onClick={onClose} className="ryze-text-muted hover:ryze-text-inverse transition-colors">
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm border rounded-xl p-3 mb-4" style={{ color: 'var(--danger)', background: 'color-mix(in oklab, var(--danger) 10%, transparent)', borderColor: 'color-mix(in oklab, var(--danger) 20%, transparent)' }}>
            <AlertCircle size={14} className="shrink-0" /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold ryze-text-muted uppercase tracking-widest mb-1.5">
              Student ID *
            </label>
            <input
              required type="number" className={inputCls}
              value={form.student_user_id}
              onChange={(e) => setForm((f) => ({ ...f, student_user_id: e.target.value }))}
              placeholder="Enter the student's user ID"
            />
            <p className="text-xs ryze-text-muted mt-1">Find this on the student's detail page.</p>
          </div>
          <div>
            <label className="block text-[10px] font-bold ryze-text-muted uppercase tracking-widest mb-1.5">
              Relationship
            </label>
            <input type="text" className={inputCls} value={form.relationship}
              onChange={(e) => setForm((f) => ({ ...f, relationship: e.target.value }))}
              placeholder="e.g. Mother, Father, Guardian" />
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => setForm((f) => ({ ...f, is_primary_contact: !f.is_primary_contact }))}
              className={`relative w-9 h-5 rounded-full transition-colors ${
                form.is_primary_contact ? 'bg-[#FFB000]' : 'bg-white/10'
              }`}
            >
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                form.is_primary_contact ? 'translate-x-4' : 'translate-x-0'
              }`} />
            </div>
            <span className="text-sm ryze-text-muted">Primary contact</span>
          </label>

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
              Link Student
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

const ParentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [parent, setParent]     = useState<ParentDetailType | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  // Profile edit state
  const [editMode, setEditMode]   = useState(false);
  const [form, setForm]           = useState({ first_name: '', last_name: '', email: '', phone: '', notes: '' });
  const [saving, setSaving]       = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Invite state
  const [resending, setResending] = useState(false);
  const [newInvite, setNewInvite] = useState<{ link: string; expiresAt: string } | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);

  // Student link/unlink state
  const [showLinkModal, setShowLinkModal]       = useState(false);
  const [unlinkTarget, setUnlinkTarget]         = useState<{ linkId: number; name: string } | null>(null);
  const [unlinkConfirmOpen, setUnlinkConfirmOpen] = useState(false);
  const [unlinking, setUnlinking]               = useState(false);

  // ---------------------------------------------------------------------------
  // Data fetch
  // ---------------------------------------------------------------------------

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getParent(Number(id));
      setParent(data);
      setForm({
        first_name: data.first_name,
        last_name:  data.last_name,
        email:      data.email,
        phone:      data.phone ?? '',
        notes:      data.notes ?? '',
      });
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load parent.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  // ---------------------------------------------------------------------------
  // Profile save
  // ---------------------------------------------------------------------------

  const handleSave = async () => {
    if (!parent) return;
    setSaving(true);
    setSaveError(null);
    try {
      await adminApi.updateParent(parent.id, {
        first_name: form.first_name,
        last_name:  form.last_name,
        email:      form.email,
        phone:      form.phone || undefined,
        notes:      form.notes || undefined,
      });
      setEditMode(false);
      load();
    } catch (e: any) {
      setSaveError(e?.message ?? 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (!parent) return;
    setForm({ first_name: parent.first_name, last_name: parent.last_name, email: parent.email, phone: parent.phone ?? '', notes: parent.notes ?? '' });
    setEditMode(false);
    setSaveError(null);
  };

  // ---------------------------------------------------------------------------
  // Resend invite
  // ---------------------------------------------------------------------------

  const handleResendInvite = async () => {
    if (!parent) return;
    setResending(true);
    setResendError(null);
    setNewInvite(null);
    try {
      const result = await adminApi.resendParentInvite(parent.id);
      setNewInvite({ link: result.invite_link, expiresAt: result.invite_expires_at });
      load(); // refresh invite_pending status
    } catch (e: any) {
      setResendError(e?.message ?? 'Failed to resend invite.');
    } finally {
      setResending(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Unlink student
  // ---------------------------------------------------------------------------

  const handleUnlinkConfirm = async () => {
    if (!parent || !unlinkTarget) return;
    setUnlinking(true);
    try {
      await adminApi.unlinkStudentFromParent(parent.id, unlinkTarget.linkId);
      setUnlinkConfirmOpen(false);
      setUnlinkTarget(null);
      load();
    } catch {
      // swallow — DataTable will show stale data, user can retry
    } finally {
      setUnlinking(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Portal access status
  // ---------------------------------------------------------------------------

  const portalStatus = parent?.has_set_password
    ? { badge: <StatusBadge value="active" label="Can log in" />, text: 'This parent has set their password and can access the portal.' }
    : parent?.invite_pending
      ? { badge: <StatusBadge value="pending" label="Invite sent" />, text: 'An invite link has been sent but the parent has not yet set their password.' }
      : { badge: <StatusBadge value="unknown" label="No invite" />, text: 'No invite link has been generated for this parent yet.' };

  // ---------------------------------------------------------------------------
  // Render guards
  // ---------------------------------------------------------------------------

  if (loading) return <LoadingState />;
  if (error || !parent) return <ErrorState message={error ?? 'Parent not found.'} onRetry={load} />;

  const inputCls = 'w-full px-4 py-2.5 bg-[#050510] border border-white/10 rounded-xl text-sm ryze-text-inverse focus:outline-none focus:border-[#FFB000]/40 focus:ring-1 focus:ring-[#FFB000]/20 transition-all placeholder-slate-600 disabled:opacity-50';

  const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'profile',  label: 'Profile',  icon: Home },
    { key: 'students', label: 'Students', icon: Users },
    { key: 'payments', label: 'Payments', icon: CreditCard },
  ];

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-6">

      {/* Back link */}
      <button
        onClick={() => navigate('/dashboard/admin/parents')}
        className="flex items-center gap-2 ryze-text-muted hover:ryze-text-inverse transition-colors text-sm font-medium"
      >
        <ArrowLeft size={16} /> Back to Parents
      </button>

      {/* Invite banner (after resend) */}
      {newInvite && (
        <InviteLinkBanner
          link={newInvite.link}
          expiresAt={newInvite.expiresAt}
          onClose={() => setNewInvite(null)}
        />
      )}

      {/* Identity strip */}
      <div className="bg-[#0a0f1e] border border-white/10 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row items-start gap-5">

          {/* Avatar */}
          <div className="w-16 h-16 rounded-2xl bg-[#FFB000]/15 border border-[#FFB000]/20 flex items-center justify-center shrink-0">
            <span className="text-2xl font-bold text-[#FFB000]">
              {parent.full_name.charAt(0).toUpperCase()}
            </span>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h2 className="text-xl font-bold ryze-text-inverse">{parent.full_name}</h2>
              {portalStatus.badge}
              {!parent.active && <StatusBadge value="inactive" label="Inactive" />}
            </div>

            <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm ryze-text-muted">
              <span className="flex items-center gap-1.5">
                <Mail size={13} /> {parent.email}
              </span>
              {parent.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone size={13} /> {parent.phone}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs ryze-text-muted mt-2">
              <span>Added {formatDate(parent.created_at)}</span>
              <span>Last login: {formatDateTime(parent.last_login_at)}</span>
            </div>
          </div>

          {/* ID chip */}
          <div className="shrink-0 text-right">
            <div className="text-[10px] font-bold ryze-text-muted uppercase tracking-widest mb-0.5">Parent ID</div>
            <div className="font-mono text-sm ryze-text-inverse">#{parent.id}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/5 border border-white/10 rounded-xl p-1 w-fit">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === key
                ? 'bg-white/10 ryze-text-inverse'
                : 'ryze-text-muted hover:ryze-text-inverse'
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* ── Profile Tab ─────────────────────────────────────────────────── */}
      {activeTab === 'profile' && (
        <div className="space-y-5">

          {/* Profile card */}
          <div className="bg-[#0a0f1e] border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold ryze-text-inverse flex items-center gap-2">
                <FileText size={16} className="text-[#FFB000]" /> Profile Info
              </h3>
              {!editMode ? (
                <button
                  onClick={() => setEditMode(true)}
                  className="flex items-center gap-2 text-xs font-semibold ryze-text-muted hover:ryze-text-inverse transition-colors bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg"
                >
                  <Edit2 size={12} /> Edit
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleCancelEdit}
                    className="text-xs font-semibold ryze-text-muted hover:ryze-text-inverse transition-colors bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-1.5 text-xs font-bold bg-[#FFB000] text-[#050510] px-3 py-1.5 rounded-lg hover:bg-[#ffc133] transition-all disabled:opacity-60"
                  >
                    {saving
                      ? <div className="w-3 h-3 border-2 border-[#050510]/30 border-t-[#050510] rounded-full animate-spin" />
                      : <Save size={12} />}
                    Save
                  </button>
                </div>
              )}
            </div>

            {saveError && (
              <div className="flex items-center gap-2 text-sm border rounded-xl p-3 mb-4" style={{ color: 'var(--danger)', background: 'color-mix(in oklab, var(--danger) 10%, transparent)', borderColor: 'color-mix(in oklab, var(--danger) 20%, transparent)' }}>
                <AlertCircle size={14} className="shrink-0" /> {saveError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold ryze-text-muted uppercase tracking-widest mb-1.5">First Name</label>
                <input
                  type="text" className={inputCls}
                  value={form.first_name}
                  disabled={!editMode}
                  onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold ryze-text-muted uppercase tracking-widest mb-1.5">Last Name</label>
                <input
                  type="text" className={inputCls}
                  value={form.last_name}
                  disabled={!editMode}
                  onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold ryze-text-muted uppercase tracking-widest mb-1.5">Email Address</label>
                <input
                  type="email" className={inputCls}
                  value={form.email}
                  disabled={!editMode}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold ryze-text-muted uppercase tracking-widest mb-1.5">Phone</label>
                <input
                  type="tel" className={inputCls}
                  value={form.phone}
                  disabled={!editMode}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder={editMode ? '0400 000 000' : '—'}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold ryze-text-muted uppercase tracking-widest mb-1.5">Notes (admin only)</label>
                <textarea
                  rows={3} className={`${inputCls} resize-none`}
                  value={form.notes}
                  disabled={!editMode}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder={editMode ? 'Internal notes…' : '—'}
                />
              </div>
            </div>
          </div>

          {/* Portal access card */}
          <div className="bg-[#0a0f1e] border border-white/10 rounded-2xl p-6">
            <h3 className="font-bold ryze-text-inverse flex items-center gap-2 mb-4">
              <Mail size={16} className="text-[#FFB000]" /> Portal Access
            </h3>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <div className="mb-2">{portalStatus.badge}</div>
                <p className="text-sm ryze-text-muted">{portalStatus.text}</p>
              </div>

              {!parent.has_set_password && (
                <div className="shrink-0">
                  {resendError && (
                    <p className="text-xs mb-2" style={{ color: 'var(--danger)' }}>{resendError}</p>
                  )}
                  <button
                    onClick={handleResendInvite}
                    disabled={resending}
                    className="flex items-center gap-2 bg-white/5 border border-white/10 ryze-text-inverse font-semibold px-4 py-2.5 rounded-xl hover:bg-white/10 transition-all text-sm disabled:opacity-60"
                  >
                    {resending
                      ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      : <RefreshCw size={14} />}
                    {parent.invite_pending ? 'Resend Invite Link' : 'Generate Invite Link'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Students Tab ─────────────────────────────────────────────────── */}
      {activeTab === 'students' && (
        <div className="bg-[#0a0f1e] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold ryze-text-inverse flex items-center gap-2">
              <Users size={16} className="text-[#FFB000]" />
              Linked Students
              <span className="text-xs font-normal ryze-text-muted">({parent.students.length})</span>
            </h3>
            <button
              onClick={() => setShowLinkModal(true)}
              className="flex items-center gap-2 bg-[#FFB000] text-[#050510] font-bold px-3 py-1.5 rounded-xl hover:bg-[#ffc133] transition-all text-xs"
            >
              <UserPlus size={13} /> Link Student
            </button>
          </div>

          {parent.students.length === 0 ? (
            <div className="text-center py-12">
              <Users size={32} className="mx-auto ryze-text-muted mb-3 opacity-40" />
              <p className="font-semibold ryze-text-muted text-sm">No students linked</p>
              <p className="text-xs ryze-text-muted mt-1 opacity-60">
                Link a student to this parent to associate their records.
              </p>
              <button
                onClick={() => setShowLinkModal(true)}
                className="mt-4 flex items-center gap-2 text-sm font-semibold text-[#FFB000] bg-[#FFB000]/10 px-4 py-2 rounded-xl hover:bg-[#FFB000]/20 transition-all mx-auto"
              >
                <UserPlus size={14} /> Link First Student
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {parent.students.map((s) => (
                <div
                  key={s.link_id}
                  className="flex items-center gap-4 bg-white/3 border border-white/5 rounded-xl p-4"
                >
                  <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold ryze-text-inverse">
                      {s.student_name?.charAt(0)?.toUpperCase() ?? '?'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold ryze-text-inverse text-sm truncate">
                      {s.student_name ?? `Student #${s.student_user_id}`}
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs ryze-text-muted mt-0.5">
                      {s.relationship && <span>{s.relationship}</span>}
                      {s.is_primary_contact && (
                        <span className="text-[#FFB000] font-semibold">Primary contact</span>
                      )}
                      <span className="font-mono">ID #{s.student_user_id}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => navigate(`/dashboard/admin/students/${s.student_user_id}`)}
                      className="flex items-center gap-1.5 text-xs font-semibold ryze-text-muted hover:ryze-text-inverse bg-white/5 border border-white/10 px-2.5 py-1.5 rounded-lg transition-all"
                      title="View student"
                    >
                      <ExternalLink size={12} /> View
                    </button>
                    <button
                      onClick={() => {
                        setUnlinkTarget({ linkId: s.link_id, name: s.student_name ?? `#${s.student_user_id}` });
                        setUnlinkConfirmOpen(true);
                      }}
                      className="flex items-center gap-1.5 text-xs font-semibold border px-2.5 py-1.5 rounded-lg transition-all hover:opacity-80"
                      style={{ color: 'var(--danger)', background: 'color-mix(in oklab, var(--danger) 5%, transparent)', borderColor: 'color-mix(in oklab, var(--danger) 10%, transparent)' }}
                      title="Unlink student"
                    >
                      <Unlink size={12} /> Unlink
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Payments Tab ─────────────────────────────────────────────────── */}
      {activeTab === 'payments' && (
        <div className="bg-[#0a0f1e] border border-white/10 rounded-2xl p-6">
          <h3 className="font-bold ryze-text-inverse flex items-center gap-2 mb-4">
            <CreditCard size={16} className="text-[#FFB000]" /> Payment Records
          </h3>
          <div className="text-center py-12">
            <CreditCard size={32} className="mx-auto ryze-text-muted mb-3 opacity-40" />
            <p className="font-semibold ryze-text-muted text-sm">Payments managed from the Payments section</p>
            <p className="text-xs ryze-text-muted mt-1 opacity-60 max-w-xs mx-auto">
              View and manage all payment records, including those linked to this parent's students, from the Payments admin section.
            </p>
            <button
              onClick={() => navigate('/dashboard/admin/payments')}
              className="mt-4 flex items-center gap-2 text-sm font-semibold text-[#FFB000] bg-[#FFB000]/10 px-4 py-2 rounded-xl hover:bg-[#FFB000]/20 transition-all mx-auto"
            >
              <ExternalLink size={14} /> Go to Payments
            </button>
          </div>
        </div>
      )}

      {/* Link student modal */}
      {showLinkModal && (
        <LinkStudentModal
          parentId={parent.id}
          onClose={() => setShowLinkModal(false)}
          onLinked={() => { setShowLinkModal(false); load(); }}
        />
      )}

      {/* Unlink confirm dialog */}
      <ConfirmDialog
        open={unlinkConfirmOpen}
        title="Unlink Student"
        message={`Remove the link between ${parent.full_name} and ${unlinkTarget?.name ?? 'this student'}? This does not delete either record.`}
        confirmLabel="Unlink"
        danger
        loading={unlinking}
        onConfirm={handleUnlinkConfirm}
        onCancel={() => { setUnlinkConfirmOpen(false); setUnlinkTarget(null); }}
      />
    </div>
  );
};

export default ParentDetail;
