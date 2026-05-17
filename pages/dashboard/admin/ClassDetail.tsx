/**
 * ClassDetail — /dashboard/admin/classes/:id
 *
 * Shows a class group's info, student roster, and upcoming/recent lessons.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, BookOpen, Users, CalendarDays,
  User, ExternalLink, Clock,
} from 'lucide-react';
import { adminApi, ClassGroupDetail, LessonListItem } from '../../../services/adminApi';
import {
  StatusBadge, LoadingState, ErrorState,
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

type Tab = 'roster' | 'lessons';

const LESSON_STATUS_ORDER: Record<string, number> = {
  active: 0, scheduled: 1, completed: 2, cancelled: 3,
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const ClassDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [classGroup, setClassGroup] = useState<ClassGroupDetail | null>(null);
  const [lessons, setLessons]       = useState<LessonListItem[]>([]);
  const [loading, setLoading]       = useState(true);
  const [lessonsLoading, setLessonsLoading] = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [activeTab, setActiveTab]   = useState<Tab>('roster');

  // ---------------------------------------------------------------------------
  // Fetch
  // ---------------------------------------------------------------------------

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

  useEffect(() => { loadClass(); }, [loadClass]);
  useEffect(() => { if (activeTab === 'lessons') loadLessons(); }, [activeTab, loadLessons]);

  // ---------------------------------------------------------------------------
  // Render guards
  // ---------------------------------------------------------------------------

  if (loading) return <LoadingState />;
  if (error || !classGroup) return <ErrorState message={error ?? 'Class not found.'} onRetry={loadClass} />;

  const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'roster',  label: `Roster (${classGroup.roster.length})`, icon: Users },
    { key: 'lessons', label: 'Lessons', icon: CalendarDays },
  ];

  const enrolledRoster = classGroup.roster.filter(
    (s) => !['withdrawn', 'cancelled'].includes(s.enrollment_status),
  );
  const withdrawnRoster = classGroup.roster.filter(
    (s) => ['withdrawn', 'cancelled'].includes(s.enrollment_status),
  );

  const sortedLessons = [...lessons].sort((a, b) => {
    const aOrd = LESSON_STATUS_ORDER[a.status] ?? 9;
    const bOrd = LESSON_STATUS_ORDER[b.status] ?? 9;
    if (aOrd !== bOrd) return aOrd - bOrd;
    return new Date(b.start_time).getTime() - new Date(a.start_time).getTime();
  });

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

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
      <div className="bg-[#0a0f1e] border border-white/10 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          <div className="w-16 h-16 rounded-2xl bg-[#FFB000]/15 border border-[#FFB000]/20 flex items-center justify-center shrink-0">
            <BookOpen size={28} className="text-[#FFB000]" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h2 className="text-xl font-bold ryze-text-inverse">{classGroup.name}</h2>
              {classGroup.active
                ? <StatusBadge value="active" label="Active" />
                : <StatusBadge value="inactive" label="Inactive" />}
            </div>

            <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm ryze-text-muted">
              {classGroup.year_level && (
                <span>Year {classGroup.year_level}</span>
              )}
              {classGroup.subject && (
                <span>{classGroup.subject}</span>
              )}
              {classGroup.tutor && (
                <span className="flex items-center gap-1.5">
                  <User size={13} /> {classGroup.tutor.full_name}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs ryze-text-muted mt-2">
              <span className="flex items-center gap-1.5">
                <Users size={11} /> {classGroup.member_count} active student{classGroup.member_count !== 1 ? 's' : ''}
              </span>
              <span>Created {formatDate(classGroup.created_at)}</span>
            </div>
          </div>

          <div className="shrink-0 text-right">
            <div className="text-[10px] font-bold ryze-text-muted uppercase tracking-widest mb-0.5">Class ID</div>
            <div className="font-mono text-sm ryze-text-inverse">#{classGroup.id}</div>
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

      {/* ── Roster Tab ──────────────────────────────────────────────────── */}
      {activeTab === 'roster' && (
        <div className="space-y-4">
          {/* Active enrollments */}
          <div className="bg-[#0a0f1e] border border-white/10 rounded-2xl p-6">
            <h3 className="font-bold ryze-text-inverse flex items-center gap-2 mb-4">
              <Users size={16} className="text-[#FFB000]" />
              Enrolled Students
              <span className="text-xs font-normal ryze-text-muted">({enrolledRoster.length})</span>
            </h3>

            {enrolledRoster.length === 0 ? (
              <div className="text-center py-8">
                <Users size={28} className="mx-auto ryze-text-muted mb-2 opacity-40" />
                <p className="text-sm ryze-text-muted">No active students enrolled.</p>
                <p className="text-xs ryze-text-muted mt-1 opacity-60">
                  Use the Discord bot to enrol students in this class.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {enrolledRoster.map((s) => (
                  <div
                    key={s.membership_id}
                    className="flex items-center gap-4 bg-white/3 border border-white/5 rounded-xl p-3 hover:bg-white/5 transition-colors cursor-pointer group"
                    onClick={() => navigate(`/dashboard/admin/students/${s.user_id}`)}
                  >
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold ryze-text-inverse">
                        {s.student_name?.charAt(0)?.toUpperCase() ?? '?'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium ryze-text-inverse text-sm">
                        {s.student_name ?? `Student #${s.user_id}`}
                      </div>
                      <div className="text-xs ryze-text-muted">
                        {s.start_date ? `Since ${formatDate(s.start_date)}` : 'Start date unknown'}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusBadge value={s.enrollment_status} />
                      <ExternalLink
                        size={14}
                        className="ryze-text-muted opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Withdrawn / cancelled */}
          {withdrawnRoster.length > 0 && (
            <div className="bg-[#0a0f1e] border border-white/10 rounded-2xl p-6">
              <h3 className="font-bold ryze-text-muted text-sm flex items-center gap-2 mb-4">
                <Users size={14} /> Former Students ({withdrawnRoster.length})
              </h3>
              <div className="space-y-2">
                {withdrawnRoster.map((s) => (
                  <div
                    key={s.membership_id}
                    className="flex items-center gap-4 bg-white/2 border border-white/5 rounded-xl p-3 opacity-60 hover:opacity-80 transition-opacity cursor-pointer"
                    onClick={() => navigate(`/dashboard/admin/students/${s.user_id}`)}
                  >
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold ryze-text-muted">
                        {s.student_name?.charAt(0)?.toUpperCase() ?? '?'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium ryze-text-muted text-sm">
                        {s.student_name ?? `Student #${s.user_id}`}
                      </div>
                      {s.end_date && (
                        <div className="text-xs ryze-text-muted opacity-60">
                          Left {formatDate(s.end_date)}
                        </div>
                      )}
                    </div>
                    <StatusBadge value={s.enrollment_status} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Lessons Tab ─────────────────────────────────────────────────── */}
      {activeTab === 'lessons' && (
        <div className="bg-[#0a0f1e] border border-white/10 rounded-2xl p-6">
          <h3 className="font-bold ryze-text-inverse flex items-center gap-2 mb-5">
            <CalendarDays size={16} className="text-[#FFB000]" />
            Lessons
            {!lessonsLoading && (
              <span className="text-xs font-normal ryze-text-muted">({lessons.length})</span>
            )}
          </h3>

          {lessonsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-white/10 border-t-[#FFB000] rounded-full animate-spin" />
            </div>
          ) : sortedLessons.length === 0 ? (
            <div className="text-center py-8">
              <CalendarDays size={28} className="mx-auto ryze-text-muted mb-2 opacity-40" />
              <p className="text-sm ryze-text-muted">No lessons scheduled for this class.</p>
              <p className="text-xs ryze-text-muted mt-1 opacity-60">
                Lessons are created via the Discord bot.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {sortedLessons.map((ls) => (
                <div
                  key={ls.id}
                  className="flex items-start gap-4 bg-white/3 border border-white/5 rounded-xl p-4"
                >
                  {/* Status indicator */}
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                    ls.status === 'active'    ? 'bg-emerald-400 animate-pulse' :
                    ls.status === 'scheduled' ? 'bg-blue-400' :
                    ls.status === 'completed' ? 'bg-slate-500' :
                    'bg-red-400'
                  }`} />

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-medium ryze-text-inverse text-sm">{ls.title}</span>
                      <StatusBadge value={ls.status} />
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs ryze-text-muted">
                      <span className="flex items-center gap-1">
                        <CalendarDays size={11} />
                        {formatDateTime(ls.start_time)}
                      </span>
                      {ls.end_time && (
                        <span className="flex items-center gap-1">
                          <Clock size={11} />
                          ends {formatTime(ls.end_time)}
                        </span>
                      )}
                      {ls.location && <span>{ls.location}</span>}
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <div className="font-mono text-xs ryze-text-muted">#{ls.id}</div>
                    <button
                      onClick={() => navigate(`/dashboard/admin/lessons/${ls.id}`)}
                      className="mt-1 text-xs ryze-text-muted hover:ryze-text-inverse transition-colors flex items-center gap-1"
                    >
                      <ExternalLink size={11} /> Detail
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ClassDetail;
