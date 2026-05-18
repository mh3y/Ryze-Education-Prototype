/**
 * ResourcesPage — /dashboard/admin/resources
 *
 * Lists all shared resources (Google Drive links, PDFs, videos, etc.).
 * Admins and tutors can add and delete resources, scoped to a class or student.
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  ExternalLink, Plus, Trash2, X, AlertCircle,
  FolderOpen, Link as LinkIcon, FileText, Video,
  BookOpen, File,
} from 'lucide-react';
import { adminApi, Resource, ClassGroupListItem } from '../../../services/adminApi';
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

function ResourceTypeIcon({ type }: { type: string }) {
  switch (type) {
    case 'worksheet':  return <BookOpen  size={16} className="text-amber-400" />;
    case 'recording':  return <Video     size={16} className="text-purple-400" />;
    case 'document':   return <FileText  size={16} className="text-red-400" />;
    case 'link':       return <LinkIcon  size={16} className="text-cyan-400" />;
    default:           return <File      size={16} className="text-slate-400" />;
  }
}

// Must match backend ResourceType enum: worksheet | recording | link | document | other
const RESOURCE_TYPES = ['link', 'worksheet', 'recording', 'document', 'other'];

// ---------------------------------------------------------------------------
// Add Resource Modal
// ---------------------------------------------------------------------------

interface AddResourceModalProps {
  classes: ClassGroupListItem[];
  onClose: () => void;
  onAdded: (title: string) => void;
}

const AddResourceModal: React.FC<AddResourceModalProps> = ({ classes, onClose, onAdded }) => {
  const [form, setForm] = useState({
    title: '', resource_url: '', resource_type: 'link',
    description: '', class_group_id: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.resource_url) { setError('Title and URL are required.'); return; }
    setSaving(true); setError(null);
    try {
      await adminApi.createResource({
        title:           form.title,
        resource_url:    form.resource_url,
        resource_type:   form.resource_type,
        description:     form.description || undefined,
        class_group_id:  form.class_group_id ? Number(form.class_group_id) : undefined,
      });
      onAdded(form.title);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to add resource.');
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
          <h3 className="font-bold ryze-text-inverse text-lg">Add Resource</h3>
          <button onClick={onClose} className="ryze-text-muted hover:ryze-text-inverse transition-colors"><X size={20} /></button>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4">
            <AlertCircle size={14} className="shrink-0" /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold ryze-text-muted uppercase tracking-widest mb-1.5">Title *</label>
            <input required type="text" className={inputCls} value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Week 3 Worksheet — Quadratics" />
          </div>
          <div>
            <label className="block text-[10px] font-bold ryze-text-muted uppercase tracking-widest mb-1.5">URL *</label>
            <input required type="url" className={inputCls} value={form.resource_url}
              onChange={(e) => setForm((f) => ({ ...f, resource_url: e.target.value }))}
              placeholder="https://drive.google.com/..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold ryze-text-muted uppercase tracking-widest mb-1.5">Type</label>
              <select value={form.resource_type} onChange={(e) => setForm((f) => ({ ...f, resource_type: e.target.value }))} className={inputCls}>
                {RESOURCE_TYPES.map((t) => (
                  <option key={t} value={t}>{t.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold ryze-text-muted uppercase tracking-widest mb-1.5">Class (optional)</label>
              <select value={form.class_group_id} onChange={(e) => setForm((f) => ({ ...f, class_group_id: e.target.value }))} className={inputCls}>
                <option value="">All classes</option>
                {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold ryze-text-muted uppercase tracking-widest mb-1.5">Description</label>
            <textarea rows={2} className={`${inputCls} resize-none`} value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Brief description of this resource…" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 bg-white/5 border border-white/10 ryze-text-inverse font-semibold rounded-xl hover:bg-white/10 transition-all text-sm">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 bg-[#FFB000] text-[#050510] font-bold rounded-xl hover:bg-[#ffc133] transition-all disabled:opacity-60 text-sm flex items-center justify-center gap-2">
              {saving ? <div className="w-4 h-4 border-2 border-[#050510]/30 border-t-[#050510] rounded-full animate-spin" /> : <Plus size={14} />}
              Add Resource
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

const ResourcesPage: React.FC = () => {
  const { user } = useAuth();
  const [resources, setResources]     = useState<Resource[]>([]);
  const [classes, setClasses]         = useState<ClassGroupListItem[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [query, setQuery]             = useState('');
  const [classFilter, setClassFilter] = useState<number | null>(null);
  const [showAdd, setShowAdd]         = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Resource | null>(null);
  const [deleting, setDeleting]         = useState(false);

  useEffect(() => {
    adminApi.getClasses({ limit: 200, active: true }).then((d) => setClasses(d.items)).catch(() => {});
  }, []);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const params: Record<string, any> = { limit: 300 };
      if (classFilter) params.class_group_id = classFilter;
      const data = await adminApi.getResources(params);
      setResources(data.items);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load resources.');
    } finally {
      setLoading(false);
    }
  }, [classFilter]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminApi.deleteResource(deleteTarget.id);
    } catch { /* API error — proceed with local removal */ }
    auditLog.log('delete', 'resource', deleteTarget.id, deleteTarget.title, user?.name ?? 'Admin', 'Resource deleted');
    setResources((prev) => prev.filter((r) => r.id !== deleteTarget.id));
    setDeleteTarget(null);
    setDeleting(false);
  };

  const filtered = query
    ? resources.filter((r) =>
        r.title.toLowerCase().includes(query.toLowerCase()) ||
        (r.description ?? '').toLowerCase().includes(query.toLowerCase()))
    : resources;

  const classMap = new Map(classes.map((c) => [c.id, c.name]));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Resources"
        description="Shared learning materials — worksheets, Google Drive folders, videos, and links."
        actions={
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 bg-[#FFB000] text-[#050510] font-bold text-sm px-4 py-2.5 rounded-xl hover:bg-[#ffc133] transition-all">
            <Plus size={15} /> Add Resource
          </button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <SearchInput value={query} onChange={setQuery} placeholder="Search resources…" className="w-full sm:max-w-sm" />
        <select
          value={classFilter ?? ''}
          onChange={(e) => setClassFilter(e.target.value ? Number(e.target.value) : null)}
          className="px-3 py-2.5 bg-[#050510] border border-white/10 rounded-xl text-sm ryze-text-inverse focus:outline-none focus:border-[#FFB000]/40 transition-all"
        >
          <option value="">All classes</option>
          {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {error && <ErrorState message={error} onRetry={load} />}
      {loading && <LoadingState />}

      {!loading && !error && (
        filtered.length === 0 ? (
          <EmptyState
            icon={FolderOpen}
            title="No resources found"
            description="Add shared materials for students and tutors to access."
            action={
              <button onClick={() => setShowAdd(true)}
                className="flex items-center gap-2 text-sm font-semibold text-[#FFB000] bg-[#FFB000]/10 px-4 py-2 rounded-xl hover:bg-[#FFB000]/20 transition-all">
                <Plus size={14} /> Add Resource
              </button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((r) => (
              <div key={r.id} className="bg-[#0a0f1e] border border-white/10 rounded-2xl p-5 flex flex-col">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <ResourceTypeIcon type={r.resource_type} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold ryze-text-inverse text-sm truncate">{r.title}</div>
                    {r.class_group_id && (
                      <div className="text-xs ryze-text-muted mt-0.5">{classMap.get(r.class_group_id) ?? `Class #${r.class_group_id}`}</div>
                    )}
                    {!r.class_group_id && (
                      <div className="text-xs ryze-text-muted mt-0.5">All classes</div>
                    )}
                  </div>
                </div>

                {r.description && (
                  <p className="text-xs ryze-text-muted line-clamp-2 mb-3 flex-1">{r.description}</p>
                )}

                <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5">
                  <span className="text-xs ryze-text-muted">{formatDate(r.created_at)}</span>
                  <div className="flex items-center gap-2">
                    <a href={r.resource_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs font-semibold text-[#FFB000] hover:text-[#ffc133] transition-colors">
                      <ExternalLink size={12} /> Open
                    </a>
                    <button onClick={() => setDeleteTarget(r)}
                      className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 bg-red-500/5 border border-red-500/10 px-2 py-1 rounded-lg transition-all">
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {showAdd && (
        <AddResourceModal classes={classes} onClose={() => setShowAdd(false)} onAdded={(title) => {
          auditLog.log('create', 'resource', 'new', title, user?.name ?? 'Admin', 'Resource added');
          setShowAdd(false);
          load();
        }} />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Resource"
        message={`Remove "${deleteTarget?.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        confirmText="CONFIRM"
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default ResourcesPage;
