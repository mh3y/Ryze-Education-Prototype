/**
 * ClassDetail — /dashboard/admin/classes/:id
 *
 * Shows a class group's info, student roster, lessons, and health warnings.
 * Supports inline editing of class fields, enrollment management, and Discord sync.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, BookOpen, Users, CalendarDays,
  User, ExternalLink, Clock, Edit2, Check, X, AlertTriangle,
  RefreshCw, Plus, UserMinus, Wifi, WifiOff, Hash,
} from 'lucide-react';
import { adminApi, ClassGroupDetail, LessonListItem } from '../../../services/adminApi';
import {
  StatusBadge, LoadingState, ErrorState,
} from '../../../components/dashboard/ui';

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-AU', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  } catch { return iso; }
}

function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('en-AU', {
      weekday: 'short', day: 'numeric', month: 'short',
      hour: '2-digit', minute: '2-digit',
    });
  } catch { return iso; }
}

function formatTime(iso: string | null | undefined): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleTimeString('en-AU', {
      hour: '2-digit', minute: '2-digit',
    });
  } catch { return ''; }
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function formatSchedule(cls: ClassGroupDetail): string {
  if (cls.schedule) return cls.schedule;
  if (cls.schedule_day != null && cls.schedule_hour != null) {
    const day = DAY_NAMES[cls.schedule_day] ?? '?';
    const h = String(cls.schedule_hour).padStart(2, '0');
    const m = String(cls.schedule_minute ?? 0).padStart(2, '0');
    return `${day} ${h}:${m}`;
  }
  return '—';
}

const WARNING_LABELS: Record<string, string> = {
  no_tutor_assigned:       'No tutor assigned',
  no_students_enrolled:    'No students enrolled',
  no_discord_channel:      'No Discord channel',
  no_schedule_or_calendar: 'No schedule or calendar',
  email_as_class_name:     'Class name looks like an email',
  tutor_missing_discord:   'Tutor has no Discord link',
  no_upcoming_lessons:     'No upcoming lessons',
};

type Tab = 'roster' | 'lessons' | 'settings' | 'health';

const LESSON_STATUS_ORDER: Record<string, number> = {
  active: 0, scheduled: 1, completed: 2, cancelled: 3,
};

// ── Inline field editor ───────────────────────────────────────────────────────

interface InlineFieldProps {
  label: string;
  value: string;
  onSave: (val: string) => Promise<void>;
  placeholder?: string;
}

const InlineField: React.FC<InlineFieldProps> = ({ label, value, onSave, placeholder }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try { await onSave(draft); setEditing(false); } finally { setSaving(false); }
  };

  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 4 }}>{label}</div>
      {editing ? (
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <input
            style={{ flex: 1, padding: '6px 10px', background: 'var(--bg-surface-2)', border: '1px solid var(--border-soft)', borderRadius: 7, fontSize: 13, color: 'var(--fg-default)', outline: 'none' }}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={placeholder}
            autoFocus
            onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') setEditing(false); }}
          />
          <button onClick={handleSave} disabled={saving} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', padding: '4px' }}>
            <Check size={14} />
          </button>
          <button onClick={() => { setEditing(false); setDraft(value); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-muted)', padding: '4px' }}>
            <X size={14} />
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, color: value ? 'var(--fg-default)' : 'var(--fg-muted)' }}>
            {value || placeholder || '—'}
          </span>
          <button onClick={() => { setEditing(true); setDraft(value); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-muted)', padding: '2px', opacity: 0.6 }}>
            <Edit2 size={11} />
          </button>
        </div>
      )}
    </div>
  );
};

// ── Enroll student modal ──────────────────────────────────────────────────────

interface EnrollModalProps {
  classId: number;
  onClose: () => void;
  onEnrolled: () => void;
}

const EnrollModal: React.FC<EnrollModalProps> = ({ classId, onClose, onEnrolled }) => {
  const [studentId, setStudentId] = useState('');
  const [isTrial, setIsTrial] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = Number(studentId);
    if (!id) { setError('Enter a valid student ID.'); return; }
    setSaving(true);
    setError(null);
    try {
      await adminApi.enrollStudentInClass(classId, { student_id: id, is_trial: isTrial });
      onEnrolled();
    } catch (err: any) {
      setError(err?.message ?? 'Failed to enroll student.');
      setSaving(false);
    }
  };

  const inp: React.CSSProperties = {
    width: '100%', padding: '10px 14px',
    background: 'var(--bg-surface-2)', border: '1px solid var(--border-soft)',
    borderRadius: 8, fontSize: 13, color: 'var(--fg-default)', outline: 'none',
    boxSizing: 'border-box',
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} onClick={onClose} />
      <div style={{ position: 'relative', zIndex: 10, background: 'var(--bg-surface)', border: '1px solid var(--border-soft)', borderRadius: 14, maxWidth: 400, width: '100%', padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--fg-strong)' }}>Enrol Student</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-muted)' }}><X size={18} /></button>
        </div>
        {error && (
          <div style={{ fontSize: 13, color: 'var(--danger)', background: 'color-mix(in oklab, var(--danger) 10%, transparent)', border: '1px solid color-mix(in oklab, var(--danger) 22%, transparent)', borderRadius: 8, padding: '10px 14px', marginBottom: 14 }}>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 6 }}>Student ID</div>
            <input type="number" value={studentId} onChange={(e) => setStudentId(e.target.value)} placeholder="e.g. 12" style={inp} autoFocus />
            <div style={{ fontSize: 11, color: 'var(--fg-muted)', marginTop: 4 }}>Find the ID on the Students page.</div>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--fg-default)', cursor: 'pointer' }}>
            <input type="checkbox" checked={isTrial} onChange={(e) => setIsTrial(e.target.checked)} />
            Trial enrolment
          </label>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={{ height: 36, padding: '0 16px', borderRadius: 8, fontSize: 13, background: 'var(--bg-surface-2)', color: 'var(--fg-default)', border: '1px solid var(--border-soft)', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" disabled={saving} style={{ height: 36, padding: '0 16px', borderRadius: 8, fontSize: 13, background: 'var(--accent)', color: 'var(--accent-fg)', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Enrolling…' : 'Enrol'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────

const ClassDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [classGroup, setClassGroup] = useState<ClassGroupDetail | null>(null);
  const [lessons, setLessons]       = useState<LessonListItem[]>([]);
  const [health, setHealth]         = useState<{ warnings: string[]; healthy: boolean; details?: any } | null>(null);
  const [loading, setLoading]       = useState(true);
  const [lessonsLoading, setLessonsLoading] = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [activeTab, setActiveTab]   = useState<Tab>('roster');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [syncMsg, setSyncMsg]       = useState('');
  const [showEnrollModal, setShowEnrollModal] = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const loadClass = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getClass(Number(id));
      setClassGroup(data);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load class.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const loadLessons = useCallback(async () => {
    if (!id) return;
    setLessonsLoading(true);
    try {
      const data = await adminApi.getLessons({ class_group_id: Number(id), limit: 100 });
      setLessons(data.items);
    } catch {
      setLessons([]);
    } finally {
      setLessonsLoading(false);
    }
  }, [id]);

  const loadHealth = useCallback(async () => {
    if (!id) return;
    try {
      const data = await adminApi.getClassHealthById(Number(id));
      setHealth(data);
    } catch {
      setHealth(null);
    }
  }, [id]);

  useEffect(() => { loadClass(); }, [loadClass]);
  useEffect(() => { if (activeTab === 'lessons') loadLessons(); }, [activeTab, loadLessons]);
  useEffect(() => { if (activeTab === 'health') loadHealth(); }, [activeTab, loadHealth]);

  // ── Save field helper ──────────────────────────────────────────────────────

  const saveField = async (field: string, value: string) => {
    if (!id) return;
    const body: any = {};
    if (field === 'tutor_user_id') body.tutor_user_id = value ? Number(value) : null;
    else if (['schedule_day', 'schedule_hour', 'schedule_minute', 'duration_min', 'max_students'].includes(field))
      body[field] = value !== '' ? Number(value) : null;
    else body[field] = value || null;
    await adminApi.updateClass(Number(id), body);
    await loadClass();
  };

  // ── Discord sync ───────────────────────────────────────────────────────────

  const handleSyncDiscord = async () => {
    if (!id) return;
    setSyncStatus('syncing');
    setSyncMsg('');
    try {
      const res = await adminApi.syncClassDiscord(Number(id));
      setSyncStatus('success');
      setSyncMsg(`Discord sync queued (job #${res.job_id}). The bot will apply permissions within 30 s.`);
    } catch (e: any) {
      setSyncStatus('error');
      setSyncMsg(e?.message ?? 'Sync failed.');
    }
  };

  // ── Unenroll ───────────────────────────────────────────────────────────────

  const handleUnenroll = async (studentId: number, studentName: string) => {
    if (!confirm(`Remove ${studentName} from this class? Historical attendance will be preserved.`)) return;
    try {
      await adminApi.updateClassEnrollment(Number(id), studentId, { active: false });
      await loadClass();
    } catch (e: any) {
      alert(e?.message ?? 'Failed to unenroll student.');
    }
  };

  // ── Guards ─────────────────────────────────────────────────────────────────

  if (loading) return <LoadingState />;
  if (error || !classGroup) return <ErrorState message={error ?? 'Class not found.'} onRetry={loadClass} />;

  const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'roster',   label: `Roster (${classGroup.roster.filter(r => r.enrollment_status === 'active').length})`, icon: Users },
    { key: 'lessons',  label: 'Lessons', icon: CalendarDays },
    { key: 'settings', label: 'Settings', icon: Edit2 },
    { key: 'health',   label: 'Health', icon: AlertTriangle },
  ];

  const enrolledRoster  = classGroup.roster.filter((s) => s.enrollment_status === 'active');
  const withdrawnRoster = classGroup.roster.filter((s) => s.enrollment_status !== 'active');

  const sortedLessons = [...lessons].sort((a, b) => {
    const aOrd = LESSON_STATUS_ORDER[a.status] ?? 9;
    const bOrd = LESSON_STATUS_ORDER[b.status] ?? 9;
    if (aOrd !== bOrd) return aOrd - bOrd;
    return new Date(b.start_time).getTime() - new Date(a.start_time).getTime();
  });

  // ── Render ─────────────────────────────────────────────────────────────────

  const card: React.CSSProperties = {
    background: 'var(--bg-surface)', border: '1px solid var(--border-faint)',
    borderRadius: 14, padding: 20,
  };

  return (
    <div className="space-y-6">

      {/* Back */}
      <button
        onClick={() => navigate('/dashboard/admin/classes')}
        className="flex items-center gap-2 ryze-text-muted hover:ryze-text-inverse transition-colors text-sm font-medium"
      >
        <ArrowLeft size={16} /> Back to Classes
      </button>

      {/* Identity strip */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-faint)', borderRadius: 16, padding: 24 }}>
        <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: 'color-mix(in oklab, var(--accent) 15%, transparent)', border: '1px solid color-mix(in oklab, var(--accent) 22%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <BookOpen size={24} style={{ color: 'var(--accent)' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--fg-strong)', margin: 0 }}>{classGroup.name}</h2>
              <StatusBadge value={classGroup.active ? 'active' : 'inactive'} />
              <span style={{ fontSize: 11, background: 'var(--bg-surface-2)', color: 'var(--fg-muted)', border: '1px solid var(--border-faint)', borderRadius: 6, padding: '2px 8px' }}>
                {classGroup.class_type}
              </span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 20px', fontSize: 13, color: 'var(--fg-muted)' }}>
              {classGroup.subject && <span>{classGroup.subject}</span>}
              {classGroup.year_level && <span>Year {classGroup.year_level}</span>}
              {classGroup.tutor && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <User size={12} /> {classGroup.tutor.full_name}
                </span>
              )}
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Clock size={12} /> {formatSchedule(classGroup)}
              </span>
              {classGroup.discord_channel_id && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Hash size={12} /> {classGroup.discord_channel_id}
                </span>
              )}
            </div>
          </div>

          {/* Discord sync button */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
            <button
              onClick={handleSyncDiscord}
              disabled={syncStatus === 'syncing' || !classGroup.discord_channel_id}
              title={!classGroup.discord_channel_id ? 'Set a Discord channel first' : 'Sync Discord channel permissions'}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                height: 34, padding: '0 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                background: syncStatus === 'success' ? 'color-mix(in oklab, #22c55e 18%, transparent)' : 'var(--bg-surface-2)',
                color: syncStatus === 'success' ? '#22c55e' : syncStatus === 'error' ? 'var(--danger)' : 'var(--fg-default)',
                border: `1px solid ${syncStatus === 'success' ? '#22c55e44' : syncStatus === 'error' ? 'var(--danger)44' : 'var(--border-soft)'}`,
                cursor: (syncStatus === 'syncing' || !classGroup.discord_channel_id) ? 'not-allowed' : 'pointer',
                opacity: !classGroup.discord_channel_id ? 0.5 : 1,
              }}
            >
              {syncStatus === 'syncing'
                ? <RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} />
                : classGroup.discord_channel_id
                ? <Wifi size={13} />
                : <WifiOff size={13} />
              }
              {syncStatus === 'syncing' ? 'Syncing…' : 'Sync Discord'}
            </button>
            {syncMsg && (
              <span style={{ fontSize: 11, color: syncStatus === 'success' ? '#22c55e' : 'var(--danger)', maxWidth: 220, textAlign: 'right' }}>
                {syncMsg}
              </span>
            )}
            <span style={{ fontSize: 11, color: 'var(--fg-muted)' }}>Class #{classGroup.id}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: 'var(--bg-surface)', border: '1px solid var(--border-faint)', borderRadius: 12, padding: 4, width: 'fit-content' }}>
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 14px', borderRadius: 9, fontSize: 13, fontWeight: 600,
              background: activeTab === key ? 'var(--bg-surface-2)' : 'transparent',
              color: activeTab === key ? 'var(--fg-strong)' : 'var(--fg-muted)',
              border: 'none', cursor: 'pointer',
            }}
          >
            <Icon size={13} /> {label}
          </button>
        ))}
      </div>

      {/* ── Roster Tab ──────────────────────────────────────────────────── */}
      {activeTab === 'roster' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={card}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--fg-strong)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Users size={14} style={{ color: 'var(--accent)' }} />
                Enrolled Students
                <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--fg-muted)' }}>({enrolledRoster.length})</span>
              </h3>
              <button
                onClick={() => setShowEnrollModal(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, height: 32, padding: '0 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: 'var(--accent)', color: 'var(--accent-fg)', border: 'none', cursor: 'pointer' }}
              >
                <Plus size={12} /> Enrol student
              </button>
            </div>

            {enrolledRoster.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <Users size={28} style={{ color: 'var(--fg-muted)', margin: '0 auto 8px', opacity: 0.4, display: 'block' }} />
                <p style={{ fontSize: 13, color: 'var(--fg-muted)', margin: '0 0 4px' }}>No active students enrolled.</p>
                <p style={{ fontSize: 12, color: 'var(--fg-muted)', margin: 0, opacity: 0.6 }}>Click "Enrol student" above to add one.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {enrolledRoster.map((s) => (
                  <div
                    key={s.membership_id}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--bg-surface-2)', border: '1px solid var(--border-faint)', borderRadius: 10, padding: '10px 14px' }}
                  >
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--border-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--fg-strong)' }}>
                        {s.student_name?.charAt(0)?.toUpperCase() ?? '?'}
                      </span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-strong)' }}>{s.student_name}</div>
                      <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--fg-muted)' }}>
                        {s.start_date && <span>Since {formatDate(s.start_date)}</span>}
                        {s.is_trial && <span style={{ color: 'var(--accent)' }}>Trial</span>}
                        {s.discord_user_id
                          ? <span style={{ color: '#22c55e' }}>Discord ✓</span>
                          : <span style={{ color: 'var(--danger)', opacity: 0.8 }}>No Discord</span>
                        }
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <button
                        onClick={() => navigate(`/dashboard/admin/students/${s.user_id}`)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-muted)', padding: 4 }}
                        title="View student profile"
                      >
                        <ExternalLink size={13} />
                      </button>
                      <button
                        onClick={() => handleUnenroll(s.user_id, s.student_name)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-muted)', padding: 4 }}
                        title="Unenrol student"
                      >
                        <UserMinus size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Former students */}
          {withdrawnRoster.length > 0 && (
            <div style={{ ...card, opacity: 0.7 }}>
              <h3 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 600, color: 'var(--fg-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Users size={13} /> Former Students ({withdrawnRoster.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {withdrawnRoster.map((s) => (
                  <div
                    key={s.membership_id}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--bg-surface-2)', border: '1px solid var(--border-faint)', borderRadius: 9, padding: '8px 12px', opacity: 0.6, cursor: 'pointer' }}
                    onClick={() => navigate(`/dashboard/admin/students/${s.user_id}`)}
                  >
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--border-faint)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: 11, color: 'var(--fg-muted)' }}>{s.student_name?.charAt(0)?.toUpperCase() ?? '?'}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, color: 'var(--fg-muted)' }}>{s.student_name}</div>
                      {s.end_date && <div style={{ fontSize: 11, color: 'var(--fg-muted)', opacity: 0.6 }}>Left {formatDate(s.end_date)}</div>}
                    </div>
                    <StatusBadge value="inactive" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Lessons Tab ─────────────────────────────────────────────────── */}
      {activeTab === 'lessons' && (
        <div style={card}>
          <h3 style={{ margin: '0 0 18px', fontSize: 14, fontWeight: 700, color: 'var(--fg-strong)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <CalendarDays size={14} style={{ color: 'var(--accent)' }} />
            Lessons
            {!lessonsLoading && <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--fg-muted)' }}>({lessons.length})</span>}
          </h3>

          {lessonsLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}>
              <div style={{ width: 22, height: 22, border: '2px solid var(--border-soft)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            </div>
          ) : sortedLessons.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <CalendarDays size={28} style={{ color: 'var(--fg-muted)', margin: '0 auto 8px', opacity: 0.4, display: 'block' }} />
              <p style={{ fontSize: 13, color: 'var(--fg-muted)', margin: 0 }}>No lessons scheduled.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {sortedLessons.map((ls) => (
                <div
                  key={ls.id}
                  style={{ display: 'flex', alignItems: 'flex-start', gap: 14, background: 'var(--bg-surface-2)', border: '1px solid var(--border-faint)', borderRadius: 10, padding: 14 }}
                >
                  <div style={{ width: 8, height: 8, borderRadius: '50%', marginTop: 5, flexShrink: 0, background: ls.status === 'completed' ? '#64748b' : ls.status === 'cancelled' ? '#ef4444' : '#3b82f6' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-strong)' }}>{ls.title}</span>
                      <StatusBadge value={ls.status} />
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px 16px', fontSize: 12, color: 'var(--fg-muted)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><CalendarDays size={10} />{formatDateTime(ls.start_time)}</span>
                      {ls.end_time && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={10} />ends {formatTime(ls.end_time)}</span>}
                    </div>
                  </div>
                  <div style={{ flexShrink: 0, textAlign: 'right' }}>
                    <div style={{ fontSize: 11, color: 'var(--fg-muted)', fontFamily: 'monospace' }}>#{ls.id}</div>
                    <button
                      onClick={() => navigate(`/dashboard/admin/lessons/${ls.id}`)}
                      style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--fg-muted)', background: 'none', border: 'none', cursor: 'pointer', marginTop: 4 }}
                    >
                      <ExternalLink size={10} /> Detail
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Settings Tab ────────────────────────────────────────────────── */}
      {activeTab === 'settings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={card}>
            <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700, color: 'var(--fg-strong)' }}>Class Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
              <InlineField label="Class Name" value={classGroup.name} onSave={(v) => saveField('name', v)} placeholder="e.g. Berwyn | Thursday Group" />
              <InlineField label="Subject" value={classGroup.subject ?? ''} onSave={(v) => saveField('subject', v)} placeholder="e.g. HSC Mathematics" />
              <InlineField label="Year Level" value={classGroup.year_level ?? ''} onSave={(v) => saveField('year_level', v)} placeholder="e.g. Year 12" />
              <InlineField label="Primary Tutor (user ID)" value={classGroup.tutor ? String(classGroup.tutor.id) : ''} onSave={(v) => saveField('tutor_user_id', v)} placeholder="User ID of tutor" />
              <InlineField label="Class Type" value={classGroup.class_type ?? 'group'} onSave={(v) => saveField('class_type', v)} placeholder="private | group" />
              <InlineField label="Max Students" value={classGroup.max_students ? String(classGroup.max_students) : ''} onSave={(v) => saveField('max_students', v)} placeholder="e.g. 10" />
            </div>
          </div>

          <div style={card}>
            <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700, color: 'var(--fg-strong)' }}>Schedule</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
              <InlineField label="Schedule Day (0=Sun…6=Sat)" value={classGroup.schedule_day != null ? String(classGroup.schedule_day) : ''} onSave={(v) => saveField('schedule_day', v)} placeholder="e.g. 4 (Thursday)" />
              <InlineField label="Hour (local, 0–23)" value={classGroup.schedule_hour != null ? String(classGroup.schedule_hour) : ''} onSave={(v) => saveField('schedule_hour', v)} placeholder="e.g. 19" />
              <InlineField label="Minute" value={classGroup.schedule_minute != null ? String(classGroup.schedule_minute) : ''} onSave={(v) => saveField('schedule_minute', v)} placeholder="e.g. 0" />
              <InlineField label="Duration (min)" value={String(classGroup.duration_min ?? 60)} onSave={(v) => saveField('duration_min', v)} placeholder="e.g. 120" />
              <InlineField label="Human-readable Schedule" value={classGroup.schedule ?? ''} onSave={(v) => saveField('schedule', v)} placeholder="e.g. Thursday 7–9 PM" />
            </div>
          </div>

          <div style={card}>
            <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700, color: 'var(--fg-strong)' }}>Integrations</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
              <InlineField label="Discord Channel ID" value={classGroup.discord_channel_id ?? ''} onSave={(v) => saveField('discord_channel_id', v)} placeholder="e.g. 1504621748379979886" />
              <InlineField label="Discord Role ID" value={classGroup.discord_role_id ?? ''} onSave={(v) => saveField('discord_role_id', v)} placeholder="Snowflake role ID" />
              <InlineField label="Google Calendar ID" value={classGroup.google_calendar_id ?? ''} onSave={(v) => saveField('google_calendar_id', v)} placeholder="e.g. ryzeeducationhq@gmail.com" />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {classGroup.active ? (
              <button
                onClick={async () => {
                  if (!confirm('Archive this class? Enrollments and lessons will be preserved.')) return;
                  await adminApi.archiveClass(Number(id));
                  navigate('/dashboard/admin/classes');
                }}
                style={{ height: 36, padding: '0 16px', borderRadius: 8, fontSize: 13, background: 'color-mix(in oklab, var(--danger) 12%, transparent)', color: 'var(--danger)', border: '1px solid color-mix(in oklab, var(--danger) 30%, transparent)', cursor: 'pointer' }}
              >
                Archive class
              </button>
            ) : (
              <button
                onClick={async () => { await adminApi.updateClass(Number(id), { active: true }); loadClass(); }}
                style={{ height: 36, padding: '0 16px', borderRadius: 8, fontSize: 13, background: 'var(--bg-surface-2)', color: 'var(--fg-default)', border: '1px solid var(--border-soft)', cursor: 'pointer' }}
              >
                Reactivate class
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Health Tab ──────────────────────────────────────────────────── */}
      {activeTab === 'health' && (
        <div style={card}>
          <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700, color: 'var(--fg-strong)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={14} style={{ color: 'var(--accent)' }} /> Class Health
          </h3>
          {!health ? (
            <div style={{ textAlign: 'center', padding: '24px 0', fontSize: 13, color: 'var(--fg-muted)' }}>Loading health data…</div>
          ) : health.healthy ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 20px', background: 'color-mix(in oklab, #22c55e 10%, transparent)', border: '1px solid #22c55e44', borderRadius: 10 }}>
              <Check size={16} style={{ color: '#22c55e', flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: '#22c55e' }}>No warnings — this class is fully configured.</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {health.warnings.map((w) => (
                <div key={w} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: 'color-mix(in oklab, #f59e0b 10%, transparent)', border: '1px solid #f59e0b44', borderRadius: 9 }}>
                  <AlertTriangle size={14} style={{ color: '#f59e0b', flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: '#f59e0b' }}>{WARNING_LABELS[w] ?? w}</span>
                </div>
              ))}
            </div>
          )}
          {health?.details && (
            <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
              {Object.entries(health.details).map(([k, v]) => (
                <div key={k} style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border-faint)', borderRadius: 9, padding: '10px 14px' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 4 }}>
                    {k.replace(/_/g, ' ')}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: v ? '#22c55e' : 'var(--danger)' }}>
                    {typeof v === 'boolean' ? (v ? 'Yes' : 'No') : String(v)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Enroll modal */}
      {showEnrollModal && (
        <EnrollModal
          classId={Number(id)}
          onClose={() => setShowEnrollModal(false)}
          onEnrolled={() => { setShowEnrollModal(false); loadClass(); }}
        />
      )}
    </div>
  );
};

export default ClassDetail;
