/**
 * HomeworkPage — /dashboard/admin/homework
 *
 * Lists homework tasks across all classes. Admins and tutors can create tasks,
 * view per-student submission summaries, and update individual submission statuses.
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  Plus, X, AlertCircle, BookOpen, Clock, CheckCircle,
  XCircle, Eye, ChevronDown, ChevronUp, User, Trash2,
  CalendarDays, ClipboardList,
} from 'lucide-react';
import {
  adminApi, HomeworkTask, HomeworkTaskDetail,
  HomeworkSubmission, ClassGroupListItem,
} from '../../../services/adminApi';
import { auditLog } from '../../../services/auditLog';
import { useAuth } from '../../../contexts/AuthContext';
import {
  PageHeader, SearchInput, EmptyState, LoadingState,
  ErrorState, ConfirmDialog,
} from '../../../components/dashboard/ui';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDue(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-AU', {
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
    });
  } catch { return iso; }
}

function isOverdue(iso: string): boolean {
  return new Date(iso) < new Date();
}

function SubmissionStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string; Icon: React.ElementType }> = {
    submitted: { label: 'Submitted', cls: 'tag tag--ok',     Icon: CheckCircle },
    late:      { label: 'Late',      cls: 'tag tag--warn',   Icon: Clock },
    missing:   { label: 'Missing',   cls: 'tag tag--danger', Icon: XCircle },
    reviewed:  { label: 'Reviewed',  cls: 'tag tag--info',   Icon: Eye },
  };
  const cfg = map[status] ?? { label: status, cls: 'tag', Icon: AlertCircle };
  return (
    <span className={cfg.cls}>
      <cfg.Icon size={11} />
      {cfg.label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Create Homework Modal
// ---------------------------------------------------------------------------

interface CreateModalProps {
  classes: ClassGroupListItem[];
  onClose: () => void;
  onCreated: (title: string) => void;
}

const CreateModal: React.FC<CreateModalProps> = ({ classes, onClose, onCreated }) => {
  const [form, setForm] = useState({
    title: '', description: '', class_group_id: '',
    due_date: '', due_time: '23:59',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.class_group_id || !form.due_date) {
      setError('Title, class, and due date are required.');
      return;
    }
    setSaving(true); setError(null);
    try {
      const due_at = new Date(`${form.due_date}T${form.due_time}:00`).toISOString();
      await adminApi.createHomework({
        title: form.title,
        class_group_id: Number(form.class_group_id),
        due_at,
        description: form.description || undefined,
      });
      onCreated(form.title);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to create homework task.');
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
          <h3 className="font-bold ryze-text-inverse text-lg">Create Homework Task</h3>
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
              required type="text" className={inputCls}
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Chapter 4 — Quadratic Equations"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold ryze-text-muted uppercase tracking-widest mb-1.5">Class *</label>
              <select
                required value={form.class_group_id}
                onChange={(e) => setForm((f) => ({ ...f, class_group_id: e.target.value }))}
                className={inputCls}
              >
                <option value="">Select class…</option>
                {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold ryze-text-muted uppercase tracking-widest mb-1.5">Due Date *</label>
              <input
                required type="date" className={inputCls}
                value={form.due_date}
                onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold ryze-text-muted uppercase tracking-widest mb-1.5">Due Time</label>
            <input
              type="time" className={inputCls}
              value={form.due_time}
              onChange={(e) => setForm((f) => ({ ...f, due_time: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold ryze-text-muted uppercase tracking-widest mb-1.5">Description</label>
            <textarea
              rows={3} className={`${inputCls} resize-none`}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Instructions, page numbers, expectations…"
            />
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
                : <Plus size={14} />}
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Submission Detail Drawer (inline expand)
// ---------------------------------------------------------------------------

interface SubmissionRowProps {
  sub: HomeworkSubmission;
  taskId: number;
  onUpdated: () => void;
}

const SubmissionRow: React.FC<SubmissionRowProps> = ({ sub, taskId, onUpdated }) => {
  const [editing, setEditing] = useState(false);
  const [status, setStatus]   = useState(sub.status);
  const [feedback, setFeedback] = useState(sub.tutor_feedback ?? '');
  const [saving, setSaving]   = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminApi.updateSubmission(taskId, sub.id, {
        status,
        tutor_feedback: feedback || undefined,
      });
      setEditing(false);
      onUpdated();
    } catch { /* swallow */ }
    finally { setSaving(false); }
  };

  return (
    <div className="bg-white/3 border border-white/5 rounded-xl p-3">
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center shrink-0">
          <User size={13} className="ryze-text-muted" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium ryze-text-inverse">{sub.student_name ?? `Student #${sub.student_user_id}`}</div>
          {sub.submitted_at && (
            <div className="text-xs ryze-text-muted">
              Submitted {new Date(sub.submitted_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
            </div>
          )}
        </div>
        <SubmissionStatusBadge status={sub.status} />
        <button
          onClick={() => setEditing((e) => !e)}
          className="text-xs ryze-text-muted hover:ryze-text-inverse bg-white/5 border border-white/10 px-2 py-1 rounded-lg transition-all"
        >
          {editing ? 'Cancel' : 'Edit'}
        </button>
      </div>

      {editing && (
        <div className="mt-3 space-y-2 pt-3 border-t border-white/5">
          <div className="flex gap-2 flex-wrap">
            {(['submitted', 'late', 'missing', 'reviewed'] as const).map((s) => (
              <label key={s} className="flex items-center gap-1.5 cursor-pointer text-xs">
                <input
                  type="radio" name={`sub-${sub.id}`} value={s}
                  checked={status === s}
                  onChange={() => setStatus(s)}
                  className="accent-[#FFB000]"
                />
                <span className="ryze-text-inverse capitalize">{s}</span>
              </label>
            ))}
          </div>
          <textarea
            rows={2}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Tutor feedback (optional)…"
            className="w-full px-3 py-2 bg-[#050510] border border-white/10 rounded-xl text-xs ryze-text-inverse resize-none focus:outline-none focus:border-[#FFB000]/40 placeholder-slate-600"
          />
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 bg-[#FFB000] text-[#050510] font-bold text-xs px-3 py-1.5 rounded-lg hover:bg-[#ffc133] transition-all disabled:opacity-60"
          >
            {saving
              ? <div className="w-3 h-3 border border-[#050510]/30 border-t-[#050510] rounded-full animate-spin" />
              : <CheckCircle size={11} />}
            Save
          </button>
        </div>
      )}

      {!editing && sub.tutor_feedback && (
        <p className="mt-2 text-xs ryze-text-muted italic pl-10">{sub.tutor_feedback}</p>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Homework Task Card (expandable)
// ---------------------------------------------------------------------------

interface TaskCardProps {
  task: HomeworkTask;
  onDelete: (task: HomeworkTask) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onDelete }) => {
  const [expanded, setExpanded]           = useState(false);
  const [detail, setDetail]               = useState<HomeworkTaskDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const overdue = isOverdue(task.due_at);
  const { submitted, late, missing, reviewed } = task.submission_summary;
  const total = task.submission_total;

  const handleExpand = async () => {
    if (expanded) { setExpanded(false); return; }
    setExpanded(true);
    if (detail) return;
    setDetailLoading(true);
    try {
      const d = await adminApi.getHomeworkTask(task.id);
      setDetail(d);
    } catch { /* swallow */ }
    finally { setDetailLoading(false); }
  };

  const refreshDetail = async () => {
    setDetailLoading(true);
    try {
      const d = await adminApi.getHomeworkTask(task.id);
      setDetail(d);
    } catch { /* swallow */ }
    finally { setDetailLoading(false); }
  };

  return (
    <div className="bg-[#0a0f1e] border rounded-2xl overflow-hidden transition-colors"
      style={{ borderColor: overdue && missing > 0 ? 'color-mix(in oklab, var(--danger) 20%, transparent)' : 'rgba(255,255,255,0.1)' }}
    >
      {/* Card header */}
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#FFB000]/10 border border-[#FFB000]/20 flex items-center justify-center shrink-0">
            <ClipboardList size={18} className="text-[#FFB000]" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="font-semibold ryze-text-inverse text-sm">{task.title}</h3>
              {overdue && missing > 0 && (
                <span className="text-[10px] font-bold border px-1.5 py-0.5 rounded-full" style={{ color: 'var(--danger)', background: 'color-mix(in oklab, var(--danger) 10%, transparent)', borderColor: 'color-mix(in oklab, var(--danger) 20%, transparent)' }}>
                  Overdue
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs ryze-text-muted">
              {task.class_group_name && (
                <span className="flex items-center gap-1">
                  <BookOpen size={11} /> {task.class_group_name}
                </span>
              )}
              <span className="flex items-center gap-1" style={overdue ? { color: 'var(--danger)' } : undefined}>
                <CalendarDays size={11} /> Due {formatDue(task.due_at)}
              </span>
            </div>
            {task.description && (
              <p className="text-xs ryze-text-muted mt-1.5 leading-relaxed line-clamp-2">{task.description}</p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onDelete(task)}
              className="border p-1.5 rounded-lg transition-all hover:opacity-80"
              style={{ color: 'var(--danger)', background: 'color-mix(in oklab, var(--danger) 5%, transparent)', borderColor: 'color-mix(in oklab, var(--danger) 10%, transparent)' }}
            >
              <Trash2 size={13} />
            </button>
            <button
              onClick={handleExpand}
              className="flex items-center gap-1.5 text-xs font-semibold ryze-text-muted hover:ryze-text-inverse bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl transition-all"
            >
              {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              {total} submission{total !== 1 ? 's' : ''}
            </button>
          </div>
        </div>

        {/* Submission summary pills */}
        {total > 0 && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/5">
            {submitted > 0 && (
              <span className="tag tag--ok">{submitted} submitted</span>
            )}
            {late > 0 && (
              <span className="tag tag--warn">{late} late</span>
            )}
            {missing > 0 && (
              <span className="tag tag--danger">{missing} missing</span>
            )}
            {reviewed > 0 && (
              <span className="tag tag--info">{reviewed} reviewed</span>
            )}
          </div>
        )}
      </div>

      {/* Expanded submissions */}
      {expanded && (
        <div className="border-t border-white/5 bg-white/2 p-5">
          {detailLoading ? (
            <div className="flex items-center justify-center py-6">
              <div className="w-5 h-5 border-2 border-white/10 border-t-[#FFB000] rounded-full animate-spin" />
            </div>
          ) : !detail || detail.submissions.length === 0 ? (
            <div className="text-center py-6">
              <User size={24} className="mx-auto ryze-text-muted mb-2 opacity-40" />
              <p className="text-sm ryze-text-muted">No submissions recorded yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {detail.submissions.map((sub) => (
                <SubmissionRow
                  key={sub.id}
                  sub={sub}
                  taskId={task.id}
                  onUpdated={refreshDetail}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

const HomeworkPage: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks]         = useState<HomeworkTask[]>([]);
  const [classes, setClasses]     = useState<ClassGroupListItem[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [query, setQuery]         = useState('');
  const [classFilter, setClassFilter] = useState<number | null>(null);
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [showCreate, setShowCreate]   = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<HomeworkTask | null>(null);
  const [deleting, setDeleting]         = useState(false);

  useEffect(() => {
    adminApi.getClasses({ limit: 200, active: true })
      .then((d) => setClasses(d.items))
      .catch(() => {});
  }, []);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const params: Record<string, any> = { limit: 200 };
      if (classFilter) params.class_group_id = classFilter;
      if (overdueOnly) params.overdue_only = true;
      const data = await adminApi.getHomework(params);
      setTasks(data.items);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load homework tasks.');
    } finally {
      setLoading(false);
    }
  }, [classFilter, overdueOnly]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminApi.deleteHomework(deleteTarget.id);
    } catch { /* API error — proceed with local removal */ }
    auditLog.log('delete', 'homework', deleteTarget.id, deleteTarget.title, user?.name ?? 'Admin', 'Homework task deleted');
    setTasks((prev) => prev.filter((t) => t.id !== deleteTarget.id));
    setDeleteTarget(null);
    setDeleting(false);
  };

  const filtered = query
    ? tasks.filter((t) =>
        t.title.toLowerCase().includes(query.toLowerCase()) ||
        (t.description ?? '').toLowerCase().includes(query.toLowerCase()) ||
        (t.class_group_name ?? '').toLowerCase().includes(query.toLowerCase()))
    : tasks;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Homework"
        description="Manage homework tasks and track student submissions across all classes."
        actions={
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-[#FFB000] text-[#050510] font-bold text-sm px-4 py-2.5 rounded-xl hover:bg-[#ffc133] transition-all"
          >
            <Plus size={15} /> New Task
          </button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search tasks…"
          className="w-full sm:max-w-xs"
        />
        <select
          value={classFilter ?? ''}
          onChange={(e) => setClassFilter(e.target.value ? Number(e.target.value) : null)}
          className="px-3 py-2.5 bg-[#050510] border border-white/10 rounded-xl text-sm ryze-text-inverse focus:outline-none focus:border-[#FFB000]/40 transition-all"
        >
          <option value="">All classes</option>
          {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <label className="flex items-center gap-2 cursor-pointer self-center text-sm ryze-text-muted hover:ryze-text-inverse transition-colors">
          <input
            type="checkbox"
            checked={overdueOnly}
            onChange={(e) => setOverdueOnly(e.target.checked)}
            className="accent-[#FFB000]"
          />
          Overdue only
        </label>
      </div>

      {error && <ErrorState message={error} onRetry={load} />}
      {loading && <LoadingState />}

      {!loading && !error && (
        filtered.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No homework tasks found"
            description="Create a task to assign homework to a class."
            action={
              <button
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-2 text-sm font-semibold text-[#FFB000] bg-[#FFB000]/10 px-4 py-2 rounded-xl hover:bg-[#FFB000]/20 transition-all"
              >
                <Plus size={14} /> New Task
              </button>
            }
          />
        ) : (
          <div className="space-y-4">
            {filtered.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onDelete={setDeleteTarget}
              />
            ))}
          </div>
        )
      )}

      {showCreate && (
        <CreateModal
          classes={classes}
          onClose={() => setShowCreate(false)}
          onCreated={(title) => {
            auditLog.log('create', 'homework', 'new', title, user?.name ?? 'Admin', 'Homework task created');
            setShowCreate(false);
            load();
          }}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Homework Task"
        message={`Delete "${deleteTarget?.title}"? All student submissions will also be removed. This cannot be undone.`}
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

export default HomeworkPage;
