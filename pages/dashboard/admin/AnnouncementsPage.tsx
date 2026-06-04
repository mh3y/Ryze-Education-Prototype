/**
 * AnnouncementsPage — /dashboard/admin/announcements
 *
 * Create, publish, and archive announcements targeting all users,
 * specific roles, or specific classes.
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  Plus, X, AlertCircle, Megaphone,
  CheckCircle2, Archive, Clock, Eye,
} from 'lucide-react';
import { adminApi, Announcement, ClassGroupListItem } from '../../../services/adminApi';
import { auditLog } from '../../../services/auditLog';
import { useAuth } from '../../../contexts/AuthContext';
import {
  PageHeader, SearchInput, EmptyState, LoadingState,
  ErrorState, ConfirmDialog,
} from '../../../components/dashboard/ui';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch { return iso; }
}

const STATUS_TABS = ['all', 'draft', 'published', 'archived'] as const;
type StatusTab = typeof STATUS_TABS[number];

function StatusChip({ status }: { status: string }) {
  switch (status) {
    case 'published':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-semibold">
          <CheckCircle2 size={10} /> Published
        </span>
      );
    case 'archived':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-500/15 text-slate-400 text-xs font-semibold">
          <Archive size={10} /> Archived
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 text-xs font-semibold">
          <Clock size={10} /> Draft
        </span>
      );
  }
}

// ---------------------------------------------------------------------------
// Create Announcement Modal
// ---------------------------------------------------------------------------

interface CreateModalProps {
  classes: ClassGroupListItem[];
  onClose: () => void;
  onCreated: (title: string, published: boolean) => void;
}

const TARGET_ROLES = ['all', 'student', 'parent', 'tutor', 'admin'];

const CreateModal: React.FC<CreateModalProps> = ({ classes, onClose, onCreated }) => {
  const [form, setForm] = useState({
    title: '',
    body: '',
    target_role: 'all',
    target_class_group_id: '',
  });
  const [saving, setSaving]  = useState(false);
  const [error, setError]    = useState<string | null>(null);
  const [publish, setPublish] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.body.trim()) {
      setError('Title and body are required.');
      return;
    }
    setSaving(true); setError(null);
    try {
      const res = await adminApi.createAnnouncement({
        title: form.title,
        body: form.body,
        target_role: form.target_role === 'all' ? undefined : form.target_role,
        target_class_group_id: form.target_class_group_id
          ? Number(form.target_class_group_id)
          : undefined,
      });
      if (publish) {
        await adminApi.publishAnnouncement(res.id);
      }
      onCreated(form.title, publish);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to create announcement.');
    } finally {
      setSaving(false);
    }
  };

  const inputCls = 'w-full px-4 py-2.5 bg-[#050510] border border-white/10 rounded-xl text-sm ryze-text-inverse focus:outline-none focus:border-[#FFB000]/40 focus:ring-1 focus:ring-[#FFB000]/20 transition-all placeholder-slate-600';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-[#0a0f1e] border border-white/10 rounded-2xl shadow-2xl max-w-lg w-full p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold ryze-text-inverse text-lg">New Announcement</h3>
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
            <label className="block text-[10px] font-bold ryze-text-muted uppercase tracking-widest mb-1.5">Title *</label>
            <input
              required type="text" className={inputCls} value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Term 2 Schedule Update"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold ryze-text-muted uppercase tracking-widest mb-1.5">Body *</label>
            <textarea
              required rows={5} className={`${inputCls} resize-none`} value={form.body}
              onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
              placeholder="Write your announcement here…"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold ryze-text-muted uppercase tracking-widest mb-1.5">Target Role</label>
              <select
                value={form.target_role}
                onChange={(e) => setForm((f) => ({ ...f, target_role: e.target.value }))}
                className={inputCls}
              >
                {TARGET_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r === 'all' ? 'All Roles' : r.charAt(0).toUpperCase() + r.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold ryze-text-muted uppercase tracking-widest mb-1.5">Class (optional)</label>
              <select
                value={form.target_class_group_id}
                onChange={(e) => setForm((f) => ({ ...f, target_class_group_id: e.target.value }))}
                className={inputCls}
              >
                <option value="">All classes</option>
                {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          {/* Publish toggle */}
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div
              onClick={() => setPublish((v) => !v)}
              className={`relative w-10 h-6 rounded-full transition-colors ${publish ? 'bg-[#FFB000]' : 'bg-white/10'}`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${publish ? 'translate-x-5' : 'translate-x-1'}`} />
            </div>
            <span className="text-sm ryze-text-inverse font-medium">Publish immediately</span>
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
                : <Plus size={14} />}
              {publish ? 'Create & Publish' : 'Save Draft'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Announcement Detail / Preview Drawer
// ---------------------------------------------------------------------------

interface PreviewDrawerProps {
  announcement: Announcement;
  classMap: Map<number, string>;
  onClose: () => void;
  onPublish: () => void;
  onArchive: () => void;
  publishing: boolean;
  archiving: boolean;
  publishError?: string | null;
}

const PreviewDrawer: React.FC<PreviewDrawerProps> = ({
  announcement: a, classMap, onClose, onPublish, onArchive, publishing, archiving, publishError,
}) => {
  const target = a.target_role
    ? a.target_role.charAt(0).toUpperCase() + a.target_role.slice(1) + 's'
    : 'Everyone';

  const classLabel = a.target_class_group_id
    ? classMap.get(a.target_class_group_id) ?? `Class #${a.target_class_group_id}`
    : null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-[#0a0f1e] border border-white/10 rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FFB000]/10 border border-[#FFB000]/20 flex items-center justify-center">
              <Megaphone size={16} className="text-[#FFB000]" />
            </div>
            <div>
              <div className="font-bold ryze-text-inverse text-sm">{a.title}</div>
              <div className="text-xs ryze-text-muted mt-0.5">
                {target}{classLabel ? ` · ${classLabel}` : ''}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="ryze-text-muted hover:ryze-text-inverse transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="flex items-center gap-3 mb-4">
            <StatusChip status={a.status} />
            <span className="text-xs ryze-text-muted">
              Created {formatDate(a.created_at)}
              {a.published_at ? ` · Published ${formatDate(a.published_at)}` : ''}
            </span>
          </div>
          <p className="text-sm ryze-text-inverse leading-relaxed whitespace-pre-wrap">{a.body}</p>
        </div>

        {/* Actions */}
        {a.status !== 'archived' && (
          <div className="p-6 border-t border-white/5 space-y-3">
            {publishError && (
              <div className="flex items-center gap-2 text-sm border rounded-xl p-3" style={{ color: 'var(--danger)', background: 'color-mix(in oklab, var(--danger) 10%, transparent)', borderColor: 'color-mix(in oklab, var(--danger) 20%, transparent)' }}>
                <span className="shrink-0">⚠</span> {publishError}
              </div>
            )}
            <div className="flex gap-3">
            {a.status === 'draft' && (
              <button
                onClick={onPublish}
                disabled={publishing}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#FFB000] text-[#050510] font-bold text-sm rounded-xl hover:bg-[#ffc133] transition-all disabled:opacity-60"
              >
                {publishing
                  ? <div className="w-4 h-4 border-2 border-[#050510]/30 border-t-[#050510] rounded-full animate-spin" />
                  : <CheckCircle2 size={14} />}
                Publish
              </button>
            )}
            <button
              onClick={onArchive}
              disabled={archiving}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 ryze-text-muted font-semibold text-sm rounded-xl hover:bg-white/10 transition-all disabled:opacity-60"
            >
              {archiving
                ? <div className="w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
                : <Archive size={14} />}
              Archive
            </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

const AnnouncementsPage: React.FC = () => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [classes, setClasses]             = useState<ClassGroupListItem[]>([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState<string | null>(null);
  const [query, setQuery]                 = useState('');
  const [tab, setTab]                     = useState<StatusTab>('all');
  const [showCreate, setShowCreate]       = useState(false);
  const [preview, setPreview]             = useState<Announcement | null>(null);
  const [publishing, setPublishing]       = useState(false);
  const [publishError, setPublishError]   = useState<string | null>(null);
  const [archiving, setArchiving]         = useState(false);
  const [archiveError, setArchiveError]   = useState<string | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<Announcement | null>(null);

  useEffect(() => {
    adminApi.getClasses({ limit: 200, active: true }).then((d) => setClasses(d.items)).catch(() => {});
  }, []);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const params: Record<string, any> = { limit: 200 };
      if (tab !== 'all') params.status = tab;
      const data = await adminApi.getAnnouncements(params);
      setAnnouncements(data.items);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load announcements.');
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => { load(); }, [load]);

  const handlePublish = async () => {
    if (!preview) return;
    setPublishing(true);
    setPublishError(null);
    try {
      await adminApi.publishAnnouncement(preview.id);
      auditLog.log('publish', 'announcement', preview.id, preview.title, user?.name ?? 'Admin', 'Announcement published');
      setPreview(null);
      load();
    } catch (e: any) {
      setPublishError(e?.message ?? 'Failed to publish announcement.');
    } finally { setPublishing(false); }
  };

  const handleArchive = async () => {
    if (!archiveTarget) return;
    setArchiving(true);
    setArchiveError(null);
    try {
      await adminApi.archiveAnnouncement(archiveTarget.id);
      auditLog.log('archive', 'announcement', archiveTarget.id, archiveTarget.title, user?.name ?? 'Admin', 'Announcement archived');
      setArchiveTarget(null);
      setPreview(null);
      load();
    } catch (e: any) {
      setArchiveError(e?.message ?? 'Failed to archive announcement.');
    } finally { setArchiving(false); }
  };

  const classMap = new Map(classes.map((c) => [c.id, c.name]));

  const filtered = announcements.filter((a) => {
    if (!query) return true;
    return (
      a.title.toLowerCase().includes(query.toLowerCase()) ||
      a.body.toLowerCase().includes(query.toLowerCase())
    );
  });

  // Count per tab
  const counts = {
    all: announcements.length,
    draft: announcements.filter((a) => a.status === 'draft').length,
    published: announcements.filter((a) => a.status === 'published').length,
    archived: announcements.filter((a) => a.status === 'archived').length,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Announcements"
        description="Send updates to students, parents, or tutors."
        actions={
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-[#FFB000] text-[#050510] font-bold text-sm px-4 py-2.5 rounded-xl hover:bg-[#ffc133] transition-all"
          >
            <Plus size={15} /> New Announcement
          </button>
        }
      />

      {/* Status tabs */}
      <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1 w-fit">
        {STATUS_TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 ${
              tab === t
                ? 'bg-[#FFB000] text-[#050510]'
                : 'ryze-text-muted hover:ryze-text-inverse'
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
            {counts[t] > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                tab === t ? 'bg-[#050510]/20 text-[#050510]' : 'bg-white/10'
              }`}>
                {counts[t]}
              </span>
            )}
          </button>
        ))}
      </div>

      <SearchInput value={query} onChange={setQuery} placeholder="Search announcements…" className="w-full sm:max-w-sm" />

      {error && <ErrorState message={error} onRetry={load} />}
      {loading && <LoadingState />}

      {!loading && !error && (
        filtered.length === 0 ? (
          <EmptyState
            icon={Megaphone}
            title="No announcements"
            description="Create your first announcement to notify students and parents."
            action={
              <button
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-2 text-sm font-semibold text-[#FFB000] bg-[#FFB000]/10 px-4 py-2 rounded-xl hover:bg-[#FFB000]/20 transition-all"
              >
                <Plus size={14} /> New Announcement
              </button>
            }
          />
        ) : (
          <div className="space-y-3">
            {filtered.map((a) => {
              const classLabel = a.target_class_group_id
                ? classMap.get(a.target_class_group_id) ?? `Class #${a.target_class_group_id}`
                : null;
              const target = a.target_role
                ? a.target_role.charAt(0).toUpperCase() + a.target_role.slice(1) + 's'
                : 'Everyone';

              return (
                <div
                  key={a.id}
                  className="bg-[#0a0f1e] border border-white/10 rounded-2xl p-5 flex items-start gap-4 hover:border-white/20 transition-all cursor-pointer group"
                  onClick={() => setPreview(a)}
                >
                  <div className="w-10 h-10 rounded-xl bg-[#FFB000]/10 border border-[#FFB000]/20 flex items-center justify-center shrink-0">
                    <Megaphone size={18} className="text-[#FFB000]" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="font-semibold ryze-text-inverse text-sm">{a.title}</div>
                      <StatusChip status={a.status} />
                    </div>
                    <p className="text-xs ryze-text-muted mt-1 line-clamp-2">{a.body}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs ryze-text-muted">{target}</span>
                      {classLabel && (
                        <span className="text-xs ryze-text-muted">· {classLabel}</span>
                      )}
                      <span className="text-xs ryze-text-muted">· {formatDate(a.created_at)}</span>
                    </div>
                  </div>

                  <button
                    className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-xs ryze-text-muted hover:ryze-text-inverse px-2 py-1 rounded-lg bg-white/5 transition-all shrink-0"
                    onClick={(e) => { e.stopPropagation(); setPreview(a); }}
                  >
                    <Eye size={12} /> View
                  </button>
                </div>
              );
            })}
          </div>
        )
      )}

      {showCreate && (
        <CreateModal
          classes={classes}
          onClose={() => setShowCreate(false)}
          onCreated={(title, published) => {
            auditLog.log(published ? 'publish' : 'create', 'announcement', 'new', title, user?.name ?? 'Admin', published ? 'Announcement created and published' : 'Announcement created as draft');
            setShowCreate(false);
            load();
          }}
        />
      )}

      {preview && (
        <PreviewDrawer
          announcement={preview}
          classMap={classMap}
          onClose={() => { setPreview(null); setPublishError(null); }}
          onPublish={handlePublish}
          onArchive={() => { setArchiveTarget(preview); }}
          publishing={publishing}
          archiving={archiving}
          publishError={publishError}
        />
      )}

      {archiveError && !archiveTarget && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl text-sm font-medium border backdrop-blur-sm"
          style={{ maxWidth: 440, color: 'var(--danger)', background: 'color-mix(in oklab, var(--danger) 10%, transparent)', borderColor: 'color-mix(in oklab, var(--danger) 20%, transparent)' }}>
          <span className="shrink-0">⚠</span>
          {archiveError}
          <button onClick={() => setArchiveError(null)} className="ml-2 opacity-60 hover:opacity-100 transition-opacity">✕</button>
        </div>
      )}

      <ConfirmDialog
        open={!!archiveTarget}
        title="Archive Announcement"
        message={`Archive "${archiveTarget?.title}"? It will no longer be visible to users.`}
        confirmLabel="Archive"
        danger={false}
        loading={archiving}
        onConfirm={handleArchive}
        onCancel={() => { setArchiveTarget(null); setArchiveError(null); }}
      />
    </div>
  );
};

export default AnnouncementsPage;
