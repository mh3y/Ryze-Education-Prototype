/**
 * LessonDetail — /dashboard/admin/lessons/:id
 *
 * Fetches the lesson from GET /api/admin/lessons/{id} (returns full lesson
 * detail + class/tutor info + attendance summary).  Attendance records are
 * fetched separately so tutors can mark them inline.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, CalendarDays, Clock, MapPin, Video,
  CheckCircle, XCircle, AlertTriangle, MinusCircle,
  Users, ExternalLink, BookOpen, User,
} from 'lucide-react';
import { adminApi, LessonDetail, AttendanceRecord } from '../../../services/adminApi';
import {
  StatusBadge, LoadingState, ErrorState,
} from '../../../components/dashboard/ui';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('en-AU', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch { return iso; }
}

function formatTime(iso: string | null | undefined): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' });
  } catch { return ''; }
}

function AttendanceIcon({ status }: { status: string }) {
  const cls = 'shrink-0';
  switch (status) {
    case 'present':    return <CheckCircle   size={16} className={`${cls} text-emerald-400`} />;
    case 'late':       return <Clock         size={16} className={`${cls} text-amber-400`} />;
    case 'left_early': return <MinusCircle   size={16} className={`${cls} text-orange-400`} />;
    case 'absent':     return <XCircle       size={16} className={`${cls} text-red-400`} />;
    default:           return <AlertTriangle size={16} className={`${cls} text-slate-400`} />;
  }
}

interface SummaryPill {
  label: string;
  count: number;
  color: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const LessonDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [lesson, setLesson]         = useState<LessonDetail | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading]       = useState(true);
  const [attLoading, setAttLoading] = useState(false);
  const [error, setError]           = useState<string | null>(null);

  // Mark attendance state
  const [markTarget, setMarkTarget] = useState<{ userId: number; name: string } | null>(null);
  const [markStatus, setMarkStatus] = useState('present');
  const [markSaving, setMarkSaving] = useState(false);

  // ---------------------------------------------------------------------------
  // Fetch lesson detail
  // ---------------------------------------------------------------------------

  const loadLesson = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getLesson(Number(id));
      setLesson(data);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load lesson.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  // ---------------------------------------------------------------------------
  // Fetch attendance records (separate call for student-level detail)
  // ---------------------------------------------------------------------------

  const loadAttendance = useCallback(async () => {
    if (!id) return;
    setAttLoading(true);
    try {
      const data = await adminApi.getAttendance({ lesson_id: Number(id), limit: 100 });
      setAttendance(data.items);
    } catch {
      setAttendance([]);
    } finally {
      setAttLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadLesson();
    loadAttendance();
  }, [loadLesson, loadAttendance]);

  // ---------------------------------------------------------------------------
  // Mark attendance
  // ---------------------------------------------------------------------------

  const handleMarkAttendance = async () => {
    if (!id || !markTarget) return;
    setMarkSaving(true);
    try {
      await adminApi.markAttendance(Number(id), markTarget.userId, { status: markStatus });
      setMarkTarget(null);
      // Refresh both: attendance list + lesson summary counts
      await Promise.all([loadAttendance(), loadLesson()]);
    } catch {
      // swallow
    } finally {
      setMarkSaving(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={loadLesson} />;
  if (!lesson) return <LoadingState />;

  const mismatchedRecords = attendance.filter((a) => a.has_mismatch);

  const summaryPills: SummaryPill[] = [
    { label: 'Present',    count: lesson.attendance_summary.present,    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    { label: 'Late',       count: lesson.attendance_summary.late,        color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
    { label: 'Left Early', count: lesson.attendance_summary.left_early,  color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
    { label: 'Absent',     count: lesson.attendance_summary.absent,      color: 'text-red-400 bg-red-500/10 border-red-500/20' },
    { label: 'Unknown',    count: lesson.attendance_summary.unknown,      color: 'text-slate-400 bg-slate-500/10 border-slate-500/20' },
  ].filter((p) => p.count > 0);

  return (
    <div className="space-y-6">

      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 ryze-text-muted hover:ryze-text-inverse transition-colors text-sm font-medium"
      >
        <ArrowLeft size={16} /> Back to Lessons
      </button>

      {/* Lesson header card */}
      <div className="bg-[#0a0f1e] border border-white/10 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#FFB000]/10 border border-[#FFB000]/20 flex items-center justify-center shrink-0">
            <CalendarDays size={24} className="text-[#FFB000]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h2 className="text-xl font-bold ryze-text-inverse">{lesson.title}</h2>
              <StatusBadge value={lesson.status} />
            </div>

            {/* Meta row */}
            <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm ryze-text-muted">
              {lesson.class_group_name && (
                <span className="flex items-center gap-1.5">
                  <BookOpen size={13} /> {lesson.class_group_name}
                </span>
              )}
              {lesson.tutor_name && (
                <span className="flex items-center gap-1.5">
                  <User size={13} /> {lesson.tutor_name}
                </span>
              )}
              {lesson.start_time && (
                <span className="flex items-center gap-1.5">
                  <CalendarDays size={13} />
                  {formatDateTime(lesson.start_time)}
                </span>
              )}
              {lesson.end_time && (
                <span className="flex items-center gap-1.5">
                  <Clock size={13} />
                  ends {formatTime(lesson.end_time)}
                </span>
              )}
              {lesson.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin size={13} /> {lesson.location}
                </span>
              )}
            </div>

            {lesson.description && (
              <p className="text-sm ryze-text-muted mt-2 leading-relaxed">{lesson.description}</p>
            )}
          </div>

          {/* Right column: ID + meet link */}
          <div className="shrink-0 text-right space-y-2">
            <div>
              <div className="text-[10px] font-bold ryze-text-muted uppercase tracking-widest mb-0.5">Lesson ID</div>
              <div className="font-mono text-sm ryze-text-inverse">#{id}</div>
            </div>
            {lesson.meet_link && (
              <a
                href={lesson.meet_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#FFB000] hover:text-[#ffc133] transition-colors"
              >
                <Video size={12} /> Join Meeting <ExternalLink size={10} />
              </a>
            )}
          </div>
        </div>

        {/* Attendance summary pills */}
        {lesson.attendance_total > 0 && (
          <div className="flex flex-wrap gap-2 mt-5 pt-5 border-t border-white/5">
            <span className="text-xs ryze-text-muted self-center">Attendance:</span>
            {summaryPills.map((p) => (
              <span
                key={p.label}
                className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${p.color}`}
              >
                {p.count} {p.label}
              </span>
            ))}
            <span className="text-xs ryze-text-muted self-center ml-1">
              of {lesson.attendance_total} recorded
            </span>
          </div>
        )}
      </div>

      {/* Mismatch warning */}
      {mismatchedRecords.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-400">Attendance Mismatches Detected</p>
            <p className="text-xs ryze-text-muted mt-0.5">
              {mismatchedRecords.length} student{mismatchedRecords.length !== 1 ? 's' : ''} have a
              discrepancy between tutor-marked and Discord-verified attendance.
            </p>
          </div>
        </div>
      )}

      {/* Attendance records */}
      <div className="bg-[#0a0f1e] border border-white/10 rounded-2xl p-6">
        <h3 className="font-bold ryze-text-inverse flex items-center gap-2 mb-5">
          <Users size={16} className="text-[#FFB000]" />
          Attendance Records
          {!attLoading && (
            <span className="text-xs font-normal ryze-text-muted">({attendance.length})</span>
          )}
        </h3>

        {attLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-white/10 border-t-[#FFB000] rounded-full animate-spin" />
          </div>
        ) : attendance.length === 0 ? (
          <div className="text-center py-8">
            <Users size={28} className="mx-auto ryze-text-muted mb-2 opacity-40" />
            <p className="text-sm ryze-text-muted">No attendance records for this lesson yet.</p>
            <p className="text-xs ryze-text-muted mt-1 opacity-60">
              Records appear once the lesson is marked or Discord data is synced.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {attendance.map((ar) => {
              const effectiveStatus = ar.tutor_marked_status ?? ar.status;
              return (
                <div
                  key={ar.id}
                  className={`flex items-center gap-4 bg-white/3 border rounded-xl p-4 ${
                    ar.has_mismatch ? 'border-amber-500/20' : 'border-white/5'
                  }`}
                >
                  <AttendanceIcon status={effectiveStatus} />

                  <div className="flex-1 min-w-0">
                    <div className="font-medium ryze-text-inverse text-sm">{ar.student_name}</div>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs ryze-text-muted mt-0.5">
                      <span>
                        Tutor:{' '}
                        <span className="capitalize">
                          {ar.tutor_marked_status?.replace('_', ' ') ?? 'not marked'}
                        </span>
                      </span>
                      <span>
                        Discord:{' '}
                        <span className="capitalize">
                          {ar.discord_verification_status.replace('_', ' ')}
                        </span>
                      </span>
                      {ar.duration_minutes != null && (
                        <span>{ar.duration_minutes} min</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge value={effectiveStatus} />
                    {ar.has_mismatch && (
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-full">
                        Mismatch
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => setMarkTarget({ userId: ar.user_id, name: ar.student_name })}
                    className="shrink-0 text-xs font-semibold bg-white/5 border border-white/10 ryze-text-muted hover:ryze-text-inverse px-2.5 py-1.5 rounded-lg transition-all"
                  >
                    Mark
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Mark attendance modal */}
      {markTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMarkTarget(null)}
          />
          <div className="relative z-10 bg-[#0a0f1e] border border-white/10 rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <h3 className="font-bold ryze-text-inverse mb-1">Mark Attendance</h3>
            <p className="text-sm ryze-text-muted mb-5">{markTarget.name}</p>

            <div className="space-y-2 mb-5">
              {['present', 'late', 'left_early', 'absent', 'unknown'].map((s) => (
                <label key={s} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="att_status"
                    value={s}
                    checked={markStatus === s}
                    onChange={() => setMarkStatus(s)}
                    className="accent-[#FFB000]"
                  />
                  <span className="text-sm ryze-text-inverse capitalize">{s.replace('_', ' ')}</span>
                </label>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setMarkTarget(null)}
                className="flex-1 py-2.5 bg-white/5 border border-white/10 ryze-text-inverse font-semibold rounded-xl hover:bg-white/10 transition-all text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleMarkAttendance}
                disabled={markSaving}
                className="flex-1 py-2.5 bg-[#FFB000] text-[#050510] font-bold rounded-xl hover:bg-[#ffc133] transition-all disabled:opacity-60 text-sm flex items-center justify-center gap-2"
              >
                {markSaving
                  ? <div className="w-4 h-4 border-2 border-[#050510]/30 border-t-[#050510] rounded-full animate-spin" />
                  : <CheckCircle size={14} />}
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonDetailPage;
