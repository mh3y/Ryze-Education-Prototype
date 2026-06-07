/**
 * AttendanceView — lesson-first attendance module
 *
 * Architecture: Schedules drive attendance. Discord validates attendance.
 *
 * Default view: lessons grouped by date with participant-level status derived
 *               from merged Discord voice evidence.
 * Audit view:   expandable raw Discord fragment log per participant.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ClipboardList,
  Clock,
  Mic,
  RefreshCw,
  UserCheck,
  Users,
  XCircle,
  Pencil,
  X,
  LayoutDashboard,
  BookOpen,
  Wifi,
  WifiOff,
  UserX,
  UserPlus,
  Shield,
  TrendingUp,
} from 'lucide-react';
import { portalApi, AttendanceRecord } from '../../../services/portalApi';

// ── Constants ─────────────────────────────────────────────────────────────────

const AEST_ZONE = 'Australia/Sydney';

// ── Status definitions ────────────────────────────────────────────────────────

const STATUS_META: Record<string, { label: string; color: string; icon?: React.ReactNode }> = {
  present:    { label: 'Present',    color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/20' },
  absent:     { label: 'Absent',     color: 'bg-red-500/20 text-red-300 border-red-500/20' },
  late:       { label: 'Late',       color: 'bg-amber-500/20 text-amber-300 border-amber-500/20' },
  left_early: { label: 'Left Early', color: 'bg-orange-500/20 text-orange-300 border-orange-500/20' },
  partial:    { label: 'Partial',    color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/20' },
  excused:    { label: 'Excused',    color: 'bg-blue-500/20 text-blue-300 border-blue-500/20' },
  unknown:    { label: 'Unknown',    color: 'bg-slate-500/20 text-slate-400 border-slate-500/20' },
};

const LESSON_STATUS_META: Record<string, { label: string; color: string }> = {
  scheduled:  { label: 'Scheduled',    color: 'bg-blue-500/20 text-blue-300' },
  live:       { label: 'Live',         color: 'bg-emerald-500/20 text-emerald-300' },
  completed:  { label: 'Completed',    color: 'bg-slate-500/20 text-slate-400' },
  cancelled:  { label: 'Cancelled',    color: 'bg-red-500/20 text-red-400' },
};

const ISSUE_META: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  tutor_absent:        { label: 'Tutor absent',     icon: <XCircle size={13} />,      color: 'text-red-400' },
  tutor_late:          { label: 'Tutor late',        icon: <Clock size={13} />,        color: 'text-amber-400' },
  tutor_left_early:    { label: 'Tutor left early',  icon: <Clock size={13} />,        color: 'text-orange-400' },
  no_tutor:            { label: 'No tutor assigned', icon: <AlertTriangle size={13} />, color: 'text-amber-400' },
  student_absent:      { label: 'Student absent',    icon: <XCircle size={13} />,      color: 'text-amber-400' },
  student_late:        { label: 'Student late',      icon: <Clock size={13} />,        color: 'text-yellow-400' },
  student_left_early:  { label: 'Student left early', icon: <Clock size={13} />,       color: 'text-orange-400' },
};

// ── API types ─────────────────────────────────────────────────────────────────

interface Fragment {
  id:               number;
  joined_at:        string;
  left_at:          string | null;
  duration_minutes: number | null;
  discord_channel:  string | null;
  status:           string;
}

interface ParticipantReport {
  user_id:         number;
  full_name:       string;
  role:            string;
  discord_user_id: string | null;
  enrolled:        boolean;
  first_join:      string | null;
  last_leave:      string | null;
  total_minutes:   number;
  computed_status: string;
  is_late:         boolean;
  left_early:      boolean;
  is_override:     boolean;
  override_status: string | null;
  override_notes:  string | null;
  override_by:     number | null;
  override_at:     string | null;
  final_status:    string;
  fragments:       Fragment[];
}

interface IssueReport {
  type:      string;
  severity:  'warning' | 'error';
  message:   string;
  user_id?:  number;
  user_name?: string;
}

interface LessonReport {
  id:              number;
  class_id:        number;
  class_name:      string;
  subject:         string | null;
  year_level:      string | null;
  title:           string;
  scheduled_at:    string;
  scheduled_end:   string;
  duration_min:    number;
  lesson_status:   string;
  meet_link:       string | null;
  tutor:           ParticipantReport | null;
  students:        ParticipantReport[];
  issues:          IssueReport[];
  has_issues:      boolean;
  enrolled_count:  number;
  present_count:   number;
  attendance_rate: number;
}

interface UnmatchedSession {
  id:               number;
  discord_user_id:  string;
  discord_username: string | null;
  discord_channel:  string | null;
  joined_at:        string;
  left_at:          string | null;
  duration_minutes: number | null;
  status:           string;
  crm_user_id:      number | null;
  crm_user_name:    string | null;
  crm_user_role:    string | null;
}

interface LessonsResponse {
  date: string;
  summary: {
    total_lessons:      number;
    completed_lessons:  number;
    issues_count:       number;
    attendance_rate:    number;
    sessions_unmatched: number;
  };
  lessons:             LessonReport[];
  unmatched_sessions:  UnmatchedSession[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function todayAEST(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: AEST_ZONE });
}

function fmtTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('en-AU', {
    hour: '2-digit', minute: '2-digit', timeZone: AEST_ZONE,
  });
}

function fmtTimeRange(start: string, end: string): string {
  return `${fmtTime(start)} – ${fmtTime(end)}`;
}

// ── Sub-components ────────────────────────────────────────────────────────────

const StatusBadge: React.FC<{ status: string; override?: boolean }> = ({ status, override }) => {
  const meta = STATUS_META[status] ?? { label: status, color: 'bg-white/10 text-slate-300 border-white/10' };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-semibold border ${meta.color}`}>
      {meta.label}
      {override && <Pencil size={10} className="opacity-60" />}
    </span>
  );
};

// ── Override form ─────────────────────────────────────────────────────────────

interface OverrideFormProps {
  lessonId:   number;
  userId:     number;
  current:    string;
  notes:      string | null;
  onSave:     (status: string, notes: string) => Promise<void>;
  onClose:    () => void;
}

const OverrideForm: React.FC<OverrideFormProps> = ({ current, notes, onSave, onClose }) => {
  const [status, setStatus] = useState(current);
  const [note,   setNote]   = useState(notes ?? '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try { await onSave(status, note); } finally { setSaving(false); }
  };

  const options = [
    { value: 'present',    label: 'Present' },
    { value: 'absent',     label: 'Absent' },
    { value: 'late',       label: 'Late' },
    { value: 'left_early', label: 'Left Early' },
    { value: 'partial',    label: 'Partial' },
    { value: 'excused',    label: 'Excused' },
    { value: 'unknown',    label: 'Unknown' },
  ];

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-2 p-3 bg-white/5 border border-white/10 rounded-xl space-y-2"
      onClick={e => e.stopPropagation()}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium ryze-text-muted">Manual Override</span>
        <button type="button" onClick={onClose} className="p-0.5 hover:text-white ryze-text-muted transition">
          <X size={13} />
        </button>
      </div>
      <select
        value={status}
        onChange={e => setStatus(e.target.value)}
        className="w-full px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs ryze-text-inverse focus:border-[#FFB000]/40 outline-none"
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <input
        type="text"
        placeholder="Reason (optional)"
        value={note}
        onChange={e => setNote(e.target.value)}
        className="w-full px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs ryze-text-inverse placeholder:text-slate-600 focus:border-[#FFB000]/40 outline-none"
      />
      <button
        type="submit"
        disabled={saving}
        className="w-full py-1.5 rounded-lg bg-[#FFB000]/20 border border-[#FFB000]/30 text-[#FFB000] text-xs font-semibold hover:bg-[#FFB000]/30 disabled:opacity-50 transition"
      >
        {saving ? 'Saving…' : 'Save Override'}
      </button>
    </form>
  );
};

// ── Participant row ───────────────────────────────────────────────────────────

interface ParticipantRowProps {
  participant: ParticipantReport;
  lessonId:    number;
  isLast:      boolean;
  onOverride:  (userId: number, status: string, notes: string) => Promise<void>;
}

const ParticipantRow: React.FC<ParticipantRowProps> = ({ participant: p, lessonId, isLast, onOverride }) => {
  const [showFragments, setShowFragments] = useState(false);
  const [showOverride,  setShowOverride]  = useState(false);

  return (
    <div className={`${!isLast ? 'border-b border-white/5' : ''}`}>
      <div className="flex items-start gap-3 py-3 px-1">
        {/* Name + role */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium ryze-text-inverse truncate">{p.full_name}</span>
            {p.is_override && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-500/20 text-purple-300 border border-purple-500/20">
                Override
              </span>
            )}
          </div>
          {/* Join / leave / total */}
          {p.total_minutes > 0 ? (
            <p className="text-xs ryze-text-muted mt-0.5">
              Joined {fmtTime(p.first_join)} · Left {fmtTime(p.last_leave)} · {p.total_minutes} min
            </p>
          ) : (
            <p className="text-xs text-red-400/70 mt-0.5">No voice activity detected</p>
          )}
          {p.override_notes && (
            <p className="text-xs text-purple-300/60 mt-0.5 italic">Note: {p.override_notes}</p>
          )}
        </div>

        {/* Status badges */}
        <div className="flex items-center gap-2 shrink-0">
          <StatusBadge status={p.final_status} override={p.is_override} />

          {/* Override edit button */}
          <button
            onClick={() => setShowOverride(v => !v)}
            title="Override status"
            className="p-1 rounded hover:bg-white/10 ryze-text-muted hover:ryze-text-inverse transition"
          >
            <Pencil size={13} />
          </button>

          {/* Audit log toggle */}
          {p.fragments.length > 0 && (
            <button
              onClick={() => setShowFragments(v => !v)}
              title="Show raw Discord log"
              className="p-1 rounded hover:bg-white/10 ryze-text-muted hover:ryze-text-inverse transition"
            >
              {showFragments ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
          )}
        </div>
      </div>

      {/* Override form */}
      <AnimatePresence>
        {showOverride && (
          <motion.div
            key="override"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden px-1 pb-2"
          >
            <OverrideForm
              lessonId={lessonId}
              userId={p.user_id}
              current={p.final_status}
              notes={p.override_notes}
              onSave={async (status, notes) => {
                await onOverride(p.user_id, status, notes);
                setShowOverride(false);
              }}
              onClose={() => setShowOverride(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Raw Discord audit log */}
      <AnimatePresence>
        {showFragments && (
          <motion.div
            key="fragments"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mx-1 mb-3 p-3 bg-black/20 border border-white/5 rounded-xl">
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Raw Discord Log ({p.fragments.length} session{p.fragments.length !== 1 ? 's' : ''})
              </p>
              <div className="space-y-1">
                {p.fragments.map((f, i) => (
                  <div key={f.id} className="flex items-center gap-2 text-xs ryze-text-muted">
                    <span className="text-slate-600 w-4 text-right">{i + 1}.</span>
                    <span>Joined {fmtTime(f.joined_at)}</span>
                    {f.left_at && <span>→ Left {fmtTime(f.left_at)}</span>}
                    {f.duration_minutes != null && (
                      <span className="text-slate-600">({f.duration_minutes} min)</span>
                    )}
                    {f.discord_channel && (
                      <span className="text-slate-600 truncate max-w-[120px]"># {f.discord_channel}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Lesson card ───────────────────────────────────────────────────────────────

interface LessonCardProps {
  lesson:   LessonReport;
  onRefresh: () => void;
}

const LessonCard: React.FC<LessonCardProps> = ({ lesson, onRefresh }) => {
  const [expanded, setExpanded] = useState(lesson.has_issues); // auto-expand if issues

  const handleOverride = useCallback(async (userId: number, status: string, notes: string) => {
    await fetch(`/api/admin/attendance/lessons/${lesson.id}/participants/${userId}/override`, {
      method:      'POST',
      credentials: 'include',
      headers:     { 'Content-Type': 'application/json' },
      body:        JSON.stringify({ status, notes }),
    });
    onRefresh();
  }, [lesson.id, onRefresh]);

  const lessonStatusMeta  = LESSON_STATUS_META[lesson.lesson_status] ?? LESSON_STATUS_META.scheduled;
  const allParticipants   = [
    ...(lesson.tutor ? [lesson.tutor] : []),
    ...lesson.students,
  ];

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
      {/* Card header — always visible, clickable */}
      <button
        className="w-full text-left px-6 py-4 flex items-start gap-4 hover:bg-white/[0.02] transition-colors"
        onClick={() => setExpanded(v => !v)}
      >
        {/* Left: class info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-base font-bold ryze-text-inverse">{lesson.class_name}</span>
            {lesson.year_level && (
              <span className="px-2 py-0.5 rounded text-xs bg-white/5 ryze-text-muted">{lesson.year_level}</span>
            )}
            {lesson.subject && (
              <span className="px-2 py-0.5 rounded text-xs bg-white/5 ryze-text-muted">{lesson.subject}</span>
            )}
          </div>
          <div className="flex items-center gap-3 text-sm ryze-text-muted flex-wrap">
            <span>{fmtTimeRange(lesson.scheduled_at, lesson.scheduled_end)}</span>
            <span className="text-slate-700">·</span>
            <span>{lesson.duration_min} min</span>
            {lesson.tutor && (
              <>
                <span className="text-slate-700">·</span>
                <span>Tutor: {lesson.tutor.full_name}</span>
              </>
            )}
          </div>
        </div>

        {/* Right: badges + metrics */}
        <div className="flex items-center gap-3 shrink-0 flex-wrap justify-end">
          {/* Attendance fraction */}
          <div className="text-right">
            <p className="text-sm font-semibold ryze-text-inverse">
              {lesson.present_count}/{lesson.enrolled_count}
            </p>
            <p className="text-xs ryze-text-muted">students</p>
          </div>

          {/* Issues badge */}
          {lesson.has_issues && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/20">
              <AlertTriangle size={11} />
              {lesson.issues.length} issue{lesson.issues.length !== 1 ? 's' : ''}
            </span>
          )}

          {/* Lesson status */}
          <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${lessonStatusMeta.color}`}>
            {lessonStatusMeta.label}
          </span>

          {/* Expand chevron */}
          <span className="ryze-text-muted">
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </span>
        </div>
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            key="body"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/10 px-6 py-4 space-y-5">
              {/* Issues list */}
              {lesson.has_issues && (
                <div className="flex flex-wrap gap-2">
                  {lesson.issues.map((issue, i) => {
                    const meta = ISSUE_META[issue.type] ?? { label: issue.message, icon: <AlertTriangle size={12} />, color: 'text-amber-400' };
                    return (
                      <span key={i} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-white/5 border border-white/10 ${meta.color}`}>
                        {meta.icon}
                        {issue.message}
                      </span>
                    );
                  })}
                </div>
              )}

              {/* Tutor section */}
              {lesson.tutor && (
                <div>
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Tutor</p>
                  <div className="bg-white/[0.02] border border-white/5 rounded-xl px-4">
                    <ParticipantRow
                      participant={lesson.tutor}
                      lessonId={lesson.id}
                      isLast={true}
                      onOverride={handleOverride}
                    />
                  </div>
                </div>
              )}

              {/* Students section */}
              {lesson.students.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Students ({lesson.students.length})
                  </p>
                  <div className="bg-white/[0.02] border border-white/5 rounded-xl px-4">
                    {lesson.students.map((s, i) => (
                      <ParticipantRow
                        key={s.user_id}
                        participant={s}
                        lessonId={lesson.id}
                        isLast={i === lesson.students.length - 1}
                        onOverride={handleOverride}
                      />
                    ))}
                  </div>
                </div>
              )}

              {!lesson.tutor && lesson.students.length === 0 && (
                <p className="text-sm ryze-text-muted italic text-center py-4">
                  No participants found — ensure the class has a tutor and enrolled students.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Unmatched sessions section ────────────────────────────────────────────────

const UnmatchedSection: React.FC<{ sessions: UnmatchedSession[] }> = ({ sessions }) => {
  const [expanded, setExpanded] = useState(false);
  if (!sessions.length) return null;

  return (
    <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl overflow-hidden">
      <button
        className="w-full text-left px-6 py-4 flex items-center gap-3 hover:bg-amber-500/5 transition-colors"
        onClick={() => setExpanded(v => !v)}
      >
        <AlertTriangle size={16} className="text-amber-400 shrink-0" />
        <div className="flex-1">
          <span className="text-sm font-semibold text-amber-300">
            Unmatched Voice Activity
          </span>
          <span className="ml-2 text-xs text-amber-400/60">
            {sessions.length} session{sessions.length !== 1 ? 's' : ''} not linked to any scheduled lesson
          </span>
        </div>
        <span className="text-amber-400/60">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            key="unmatched"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="border-t border-amber-500/20 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left px-6 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">User</th>
                    <th className="text-left px-6 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Channel</th>
                    <th className="text-left px-6 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Joined</th>
                    <th className="text-left px-6 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Left</th>
                    <th className="text-left px-6 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map(s => (
                    <tr key={s.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-3">
                        <p className={`font-medium text-xs ${s.crm_user_id ? 'ryze-text-inverse' : 'text-amber-400/80'}`}>
                          {s.crm_user_name ?? s.discord_username ?? s.discord_user_id}
                        </p>
                        {!s.crm_user_id && (
                          <p className="text-[10px] text-amber-400/50 mt-0.5">Unmatched Discord user</p>
                        )}
                        {s.crm_user_role && (
                          <p className="text-[10px] text-slate-500 mt-0.5 capitalize">{s.crm_user_role}</p>
                        )}
                      </td>
                      <td className="px-6 py-3 ryze-text-muted text-xs hidden sm:table-cell">
                        {s.discord_channel ?? '—'}
                      </td>
                      <td className="px-6 py-3 ryze-text-muted text-xs">{fmtTime(s.joined_at)}</td>
                      <td className="px-6 py-3 ryze-text-muted text-xs hidden md:table-cell">{fmtTime(s.left_at)}</td>
                      <td className="px-6 py-3 ryze-text-muted text-xs hidden md:table-cell">
                        {s.duration_minutes != null ? `${s.duration_minutes} min` : s.status === 'active' ? '⏱ Active' : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Summary bar ───────────────────────────────────────────────────────────────

const SummaryBar: React.FC<{ summary: LessonsResponse['summary'] }> = ({ summary }) => {
  const metrics = [
    { label: 'Lessons',     value: summary.total_lessons,     icon: <ClipboardList size={16} />, color: 'text-blue-300' },
    { label: 'Completed',   value: summary.completed_lessons,  icon: <CheckCircle2  size={16} />, color: 'text-emerald-300' },
    { label: 'Issues',      value: summary.issues_count,       icon: <AlertTriangle size={16} />, color: summary.issues_count > 0 ? 'text-amber-300' : 'text-slate-500' },
    { label: 'Attendance',  value: `${summary.attendance_rate}%`, icon: <UserCheck  size={16} />, color: 'text-purple-300' },
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {metrics.map(m => (
        <div key={m.label} className="bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 flex items-center gap-3">
          <span className={m.color}>{m.icon}</span>
          <div>
            <p className="text-lg font-bold ryze-text-inverse">{m.value}</p>
            <p className="text-xs ryze-text-muted">{m.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

// ── Lessons tab ───────────────────────────────────────────────────────────────

const LessonsTab: React.FC = () => {
  const [date,    setDate]    = useState(todayAEST());
  const [data,    setData]    = useState<LessonsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const [tick,    setTick]    = useState(0); // increment to trigger reload

  const load = useCallback((d: string) => {
    setLoading(true);
    setError(null);
    fetch(`/api/admin/attendance/lessons?date=${d}`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : r.json().then((e: any) => Promise.reject(e.detail ?? 'Error')))
      .then(setData)
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(date); }, [date, tick, load]);

  const refresh = () => setTick(t => t + 1);

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm ryze-text-inverse focus:border-[#FFB000]/40 outline-none"
        />
        <button
          onClick={() => setDate(d => {
            const prev = new Date(d + 'T00:00:00');
            prev.setDate(prev.getDate() - 1);
            return prev.toLocaleDateString('en-CA');
          })}
          className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition ryze-text-muted"
          title="Previous day"
        >
          <ChevronLeft size={15} />
        </button>
        <button
          onClick={() => setDate(d => {
            const next = new Date(d + 'T00:00:00');
            next.setDate(next.getDate() + 1);
            return next.toLocaleDateString('en-CA');
          })}
          className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition ryze-text-muted"
          title="Next day"
        >
          <ChevronRight size={15} />
        </button>
        <button
          onClick={refresh}
          className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition ryze-text-muted"
          title="Refresh"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
        </button>
        <span className="ryze-text-muted text-xs ml-auto">
          {data ? `${data.lessons.length} lesson${data.lessons.length !== 1 ? 's' : ''} on this day` : ''}
        </span>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-red-300">{error}</div>
      )}

      {/* Summary bar */}
      {data && !loading && <SummaryBar summary={data.summary} />}

      {/* Loading skeletons */}
      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
              <div className="h-5 bg-white/5 rounded animate-pulse w-1/3 mb-2" />
              <div className="h-4 bg-white/5 rounded animate-pulse w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Lesson cards */}
      {!loading && data && (
        <>
          {data.lessons.length === 0 ? (
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-16 text-center">
              <ClipboardList size={36} className="mx-auto mb-4 opacity-20" />
              <p className="ryze-text-muted text-sm">No scheduled lessons for {date}.</p>
              <p className="ryze-text-muted text-xs mt-1 opacity-60">
                Lessons are synced from Google Calendar. Check the bot calendar sync if you expect lessons here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.lessons.map(lesson => (
                <LessonCard key={lesson.id} lesson={lesson} onRefresh={refresh} />
              ))}
            </div>
          )}

          {/* Unmatched voice sessions */}
          <UnmatchedSection sessions={data.unmatched_sessions} />
        </>
      )}
    </div>
  );
};

// ── Raw voice tab (audit) ─────────────────────────────────────────────────────

const PAGE_SIZE = 25;

const DiscordVoiceTab: React.FC = () => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [total,    setTotal]    = useState(0);
  const [page,     setPage]     = useState(0);
  const [date,     setDate]     = useState(todayAEST());
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  const load = (d: string, p: number) => {
    setLoading(true);
    setError(null);
    fetch(`/api/admin/attendance/voice-sessions?date=${d}&skip=${p * PAGE_SIZE}&limit=${PAGE_SIZE}`, {
      credentials: 'include',
    })
      .then(r => r.ok ? r.json() : r.json().then((e: any) => Promise.reject(e.detail ?? 'Error')))
      .then((d: any) => { setSessions(d.items); setTotal(d.total); })
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(date, page); }, [date, page]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <p className="ryze-text-muted text-xs flex-1">
          {total} raw session{total !== 1 ? 's' : ''} — unmerged Discord fragments
        </p>
        <input
          type="date" value={date}
          onChange={e => { setDate(e.target.value); setPage(0); }}
          className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm ryze-text-inverse focus:border-[#FFB000]/40 outline-none"
        />
        <button onClick={() => load(date, page)} className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition ryze-text-muted">
          <RefreshCw size={15} />
        </button>
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-red-300">{error}</div>}

      <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left px-6 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">User</th>
              <th className="text-left px-6 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Channel</th>
              <th className="text-left px-6 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Joined</th>
              <th className="text-left px-6 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Left</th>
              <th className="text-left px-6 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Duration</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-white/5">
                    <td colSpan={5} className="px-6 py-4"><div className="h-4 bg-white/5 rounded animate-pulse w-3/4" /></td>
                  </tr>
                ))
              : sessions.map((s: any) => (
                  <tr key={s.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-3">
                      <p className={`font-medium text-xs ${s.crm_user_id ? 'ryze-text-inverse' : 'text-amber-400/80'}`}>
                        {s.crm_user_name ?? s.discord_username ?? s.discord_user_id}
                      </p>
                      {!s.crm_user_id && <p className="text-[10px] text-amber-400/50 mt-0.5">Unmatched</p>}
                    </td>
                    <td className="px-6 py-3 ryze-text-muted text-xs hidden sm:table-cell">{s.discord_channel ?? '—'}</td>
                    <td className="px-6 py-3 ryze-text-muted text-xs">{fmtTime(s.joined_at)}</td>
                    <td className="px-6 py-3 ryze-text-muted text-xs hidden md:table-cell">{fmtTime(s.left_at)}</td>
                    <td className="px-6 py-3 ryze-text-muted text-xs hidden lg:table-cell">
                      {s.duration_minutes != null ? `${s.duration_minutes} min` : s.status === 'active' ? '⏱ Active' : '—'}
                    </td>
                  </tr>
                ))}
            {!loading && sessions.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center ryze-text-muted">
                  <Mic size={32} className="mx-auto mb-3 opacity-30" />
                  No raw voice sessions for {date}.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm ryze-text-muted">
          <span>Page {page + 1} of {totalPages}</span>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
              className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 transition">
              <ChevronLeft size={15} />
            </button>
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
              className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 transition">
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ── CRM Attendance tab ────────────────────────────────────────────────────────

const CrmTab: React.FC = () => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [total,   setTotal]   = useState(0);
  const [page,    setPage]    = useState(0);
  const [filter,  setFilter]  = useState('');
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    portalApi
      .getAttendance({ status: filter || undefined, skip: page * PAGE_SIZE, limit: PAGE_SIZE })
      .then(res => { setRecords(res.items); setTotal(res.total); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [page, filter]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="ryze-text-muted text-xs">{total} manual attendance records</p>
        <select
          value={filter}
          onChange={e => { setFilter(e.target.value); setPage(0); }}
          className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm ryze-text-inverse focus:border-[#FFB000]/40 outline-none"
        >
          <option value="">All</option>
          <option value="present">Present</option>
          <option value="absent">Absent</option>
          <option value="late">Late</option>
          <option value="left_early">Left Early</option>
          <option value="partial">Partial</option>
          <option value="excused">Excused</option>
          <option value="unknown">Unknown</option>
        </select>
      </div>
      {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-red-300">{error}</div>}
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left px-6 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Student</th>
              <th className="text-left px-6 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Lesson</th>
              <th className="text-left px-6 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-white/5">
                    <td colSpan={3} className="px-6 py-4"><div className="h-4 bg-white/5 rounded animate-pulse w-3/4" /></td>
                  </tr>
                ))
              : records.map(r => (
                  <tr key={r.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-3 ryze-text-inverse font-medium text-sm">{r.student_name}</td>
                    <td className="px-6 py-3 ryze-text-muted text-xs hidden md:table-cell">{r.lesson_title}</td>
                    <td className="px-6 py-3"><StatusBadge status={r.status} /></td>
                  </tr>
                ))}
            {!loading && records.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center ryze-text-muted">
                  <ClipboardList size={32} className="mx-auto mb-3 opacity-30" />
                  No attendance records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm ryze-text-muted">
          <span>Page {page + 1} of {totalPages}</span>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
              className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 transition">
              <ChevronLeft size={15} />
            </button>
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
              className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 transition">
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Overview API types ────────────────────────────────────────────────────────

interface OverviewLesson {
  id:             number;
  scheduled_at:   string;
  scheduled_end:  string;
  duration_min:   number;
  lesson_status:  string;
  tutor:          { user_id: number; full_name: string; final_status: string; is_late: boolean; left_early: boolean } | null;
  students:       { user_id: number; full_name: string; final_status: string }[];
  issues:         IssueReport[];
  unexpected_participants: { type: string; severity: string; full_name: string | null; discord_username: string | null; total_minutes: number }[];
  has_issues:     boolean;
  present_count:  number;
  enrolled_count: number;
}

interface ClassOverview {
  id:                 number;
  name:               string;
  class_type:         string;
  schedule_day:       number | null;
  schedule_hour:      number | null;
  schedule_minute:    number | null;
  duration_min:       number;
  timezone:           string;
  subject:            string;
  year_level:         string | null;
  tutor:              { id: number; full_name: string } | null;
  enrolled_students:  { id: number; full_name: string }[];
  discord_channel_id: string | null;
  next_lesson:        { id: number; scheduled_at: string } | null;
  recent_lessons:     OverviewLesson[];
  health_status:      'healthy' | 'critical' | 'issue' | 'no_recent_lessons' | 'misconfigured';
  health_message:     string;
  issue_count:        number;
  config_warnings:    string[];
}

interface OverviewMetrics {
  active_classes:      number;
  lessons_this_week:   number;
  lessons_completed:   number;
  healthy_lessons:     number;
  lessons_with_issues: number;
  missing_tutor:       number;
  missing_student:     number;
  unmatched_voice:     number;
  possible_substitute: number;
}

interface OverviewResponse {
  metrics: OverviewMetrics;
  classes: ClassOverview[];
}

interface AggregatedIssue {
  type:        string;
  severity:    'error' | 'warning';
  message:     string;
  class_id:    number;
  class_name:  string;
  lesson_id:   number;
  lesson_date: string;
  user_id:     number | null;
  user_name:   string | null;
}

// ── Overview helpers ──────────────────────────────────────────────────────────

function scheduleLabel(cls: ClassOverview): string {
  if (cls.schedule_day == null || cls.schedule_hour == null) return 'No schedule set';
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const h    = cls.schedule_hour;
  const m    = cls.schedule_minute ?? 0;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12  = h % 12 || 12;
  const mStr = m > 0 ? `:${String(m).padStart(2, '0')}` : '';
  return `${days[cls.schedule_day]}s ${h12}${mStr} ${ampm}`;
}

function fmtShortDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-AU', {
    timeZone: AEST_ZONE, day: 'numeric', month: 'short', year: 'numeric',
  });
}

function healthBadge(status: ClassOverview['health_status']) {
  switch (status) {
    case 'healthy':           return { label: 'Healthy',        color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
    case 'critical':          return { label: 'Critical',       color: 'bg-red-500/20 text-red-300 border-red-500/30' };
    case 'issue':             return { label: 'Issues',         color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
    case 'no_recent_lessons': return { label: 'No recent data', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30' };
    case 'misconfigured':     return { label: 'Misconfigured',  color: 'bg-orange-500/20 text-orange-300 border-orange-500/30' };
    default:                  return { label: status,           color: 'bg-slate-500/20 text-slate-400 border-slate-500/30' };
  }
}

// ── Class card (used in OverviewTab) ─────────────────────────────────────────

interface ClassCardProps {
  cls:           ClassOverview;
  onViewHistory: (classId: number) => void;
}

const ClassCard: React.FC<ClassCardProps> = ({ cls, onViewHistory }) => {
  const [expanded, setExpanded] = useState(cls.health_status === 'critical' || cls.health_status === 'issue');
  const badge = healthBadge(cls.health_status);

  return (
    <div className={`bg-white/[0.03] border rounded-2xl overflow-hidden transition-colors ${
      cls.health_status === 'critical' ? 'border-red-500/30' :
      cls.health_status === 'issue'    ? 'border-amber-500/25' :
      'border-white/10'
    }`}>
      {/* Card header */}
      <div
        className="px-5 py-4 flex items-start gap-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
        onClick={() => setExpanded(v => !v)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-sm font-bold ryze-text-inverse">{cls.name}</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-white/5 ryze-text-muted capitalize">{cls.class_type}</span>
            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold border ${badge.color}`}>{badge.label}</span>
          </div>
          <div className="flex items-center gap-3 text-xs ryze-text-muted flex-wrap">
            <span>{scheduleLabel(cls)} · {cls.duration_min} min</span>
            {cls.tutor && <span>· {cls.tutor.full_name}</span>}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {cls.issue_count > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/20">
              <AlertTriangle size={10} />
              {cls.issue_count}
            </span>
          )}
          <span className="ryze-text-muted">{expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}</span>
        </div>
      </div>

      {/* Expanded detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            key="detail"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/10 px-5 py-4 space-y-4">
              {/* Config info row */}
              <div className="flex items-center gap-4 flex-wrap text-xs ryze-text-muted">
                <span>
                  <span className="font-medium ryze-text-inverse">Students:</span>{' '}
                  {cls.enrolled_students.length > 0
                    ? cls.enrolled_students.map(s => s.full_name).join(', ')
                    : <span className="text-orange-400">None enrolled</span>}
                </span>
                <span>
                  {cls.discord_channel_id
                    ? <span className="flex items-center gap-1"><Wifi size={11} className="text-emerald-400" /> Discord set</span>
                    : <span className="flex items-center gap-1 text-orange-400"><WifiOff size={11} /> No channel</span>}
                </span>
                {cls.next_lesson && (
                  <span>
                    <span className="font-medium ryze-text-inverse">Next:</span>{' '}
                    {fmtShortDate(cls.next_lesson.scheduled_at)}
                  </span>
                )}
              </div>

              {/* Config warnings */}
              {cls.config_warnings.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {cls.config_warnings.map((w, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-medium bg-orange-500/10 border border-orange-500/20 text-orange-300">
                      <AlertTriangle size={10} />
                      {w}
                    </span>
                  ))}
                </div>
              )}

              {/* Recent lessons mini-table */}
              {cls.recent_lessons.length > 0 ? (
                <div>
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Recent lessons</p>
                  <div className="space-y-2">
                    {cls.recent_lessons.map(l => {
                      const tutorStatus = l.tutor?.final_status ?? 'absent';
                      const tutorOk     = ['present', 'late', 'left_early'].includes(tutorStatus);
                      const hasTutorAbsent = l.issues.some((i: IssueReport) => i.type === 'tutor_absent');
                      return (
                        <div key={l.id} className={`rounded-xl px-3 py-2.5 border text-xs ${
                          hasTutorAbsent                                     ? 'bg-red-500/5 border-red-500/20' :
                          l.has_issues                                       ? 'bg-amber-500/5 border-amber-500/20' :
                          'bg-white/[0.02] border-white/5'
                        }`}>
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="font-medium ryze-text-inverse">{fmtShortDate(l.scheduled_at)}</span>
                            <span className="ryze-text-muted">{fmtTime(l.scheduled_at)}</span>
                            {/* Tutor indicator */}
                            <span className={`flex items-center gap-1 ${tutorOk ? 'text-emerald-400' : 'text-red-400'}`}>
                              {tutorOk ? <UserCheck size={11} /> : <UserX size={11} />}
                              {l.tutor ? l.tutor.full_name : 'No tutor'}
                            </span>
                            {/* Student count */}
                            <span className="ryze-text-muted">{l.present_count}/{l.enrolled_count} students</span>
                            {/* Unexpected participants */}
                            {l.unexpected_participants.length > 0 && (
                              <span className="flex items-center gap-1 text-purple-400">
                                <UserPlus size={11} />
                                {l.unexpected_participants.length} unexpected
                              </span>
                            )}
                            {/* Issue pills */}
                            {l.issues.map((issue: IssueReport, i: number) => {
                              const meta = ISSUE_META[issue.type] ?? { label: issue.message, icon: <AlertTriangle size={10} />, color: 'text-amber-400' };
                              return (
                                <span key={i} className={`flex items-center gap-1 ${meta.color}`}>
                                  {React.cloneElement(meta.icon as React.ReactElement, { size: 10 })}
                                  {meta.label}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p className="text-xs ryze-text-muted italic">No recent lessons found (last 60 days).</p>
              )}

              {/* Action */}
              <button
                onClick={(e) => { e.stopPropagation(); onViewHistory(cls.id); }}
                className="text-xs font-medium text-[#FFB000]/80 hover:text-[#FFB000] transition flex items-center gap-1.5"
              >
                <BookOpen size={12} />
                View full class history →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Overview tab ──────────────────────────────────────────────────────────────

interface OverviewTabProps {
  onViewClassHistory: (classId: number) => void;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ onViewClassHistory }) => {
  const [data,    setData]    = useState<OverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    fetch('/api/admin/attendance/overview', { credentials: 'include' })
      .then(r => r.ok ? r.json() : r.json().then((e: any) => Promise.reject(e.detail ?? 'Error')))
      .then(setData)
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map(i => (
          <div key={i} className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 space-y-2 animate-pulse">
            <div className="h-4 bg-white/5 rounded w-1/3" />
            <div className="h-3 bg-white/5 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-red-300 flex items-center justify-between">
        <span>{error}</span>
        <button onClick={load} className="ml-4 px-3 py-1 rounded-lg bg-red-500/20 text-red-300 text-xs hover:bg-red-500/30 transition">Retry</button>
      </div>
    );
  }

  if (!data) return null;

  const { metrics, classes } = data;

  const metricCards = [
    { label: 'Active classes',   value: metrics.active_classes,      icon: <LayoutDashboard size={16} />, color: 'text-blue-300' },
    { label: 'Lessons this wk',  value: metrics.lessons_this_week,   icon: <ClipboardList   size={16} />, color: 'text-purple-300' },
    { label: 'Completed',        value: metrics.lessons_completed,    icon: <CheckCircle2    size={16} />, color: 'text-emerald-300' },
    { label: 'With issues',      value: metrics.lessons_with_issues,  icon: <AlertTriangle   size={16} />, color: metrics.lessons_with_issues > 0 ? 'text-amber-300' : 'text-slate-500' },
    { label: 'Missing tutor',    value: metrics.missing_tutor,        icon: <UserX           size={16} />, color: metrics.missing_tutor > 0 ? 'text-red-300' : 'text-slate-500' },
    { label: 'Missing student',  value: metrics.missing_student,      icon: <Users           size={16} />, color: metrics.missing_student > 0 ? 'text-amber-300' : 'text-slate-500' },
    { label: 'Possible sub',     value: metrics.possible_substitute,  icon: <Shield          size={16} />, color: metrics.possible_substitute > 0 ? 'text-purple-300' : 'text-slate-500' },
    { label: 'Unknown voice',    value: metrics.unmatched_voice,      icon: <TrendingUp      size={16} />, color: metrics.unmatched_voice > 0 ? 'text-orange-300' : 'text-slate-500' },
  ];

  return (
    <div className="space-y-5">
      {/* Refresh */}
      <div className="flex items-center justify-between">
        <p className="text-xs ryze-text-muted">{classes.length} active class{classes.length !== 1 ? 'es' : ''} · metrics cover last 7 days</p>
        <button onClick={load} className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition ryze-text-muted">
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {metricCards.map(m => (
          <div key={m.label} className="bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 flex items-center gap-3">
            <span className={m.color}>{m.icon}</span>
            <div>
              <p className="text-lg font-bold ryze-text-inverse">{m.value}</p>
              <p className="text-[10px] ryze-text-muted">{m.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Class cards */}
      {classes.length === 0 ? (
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-16 text-center">
          <LayoutDashboard size={36} className="mx-auto mb-4 opacity-20" />
          <p className="ryze-text-muted text-sm">No active classes found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {classes.map(cls => (
            <ClassCard key={cls.id} cls={cls} onViewHistory={onViewClassHistory} />
          ))}
        </div>
      )}
    </div>
  );
};

// ── Class history tab ─────────────────────────────────────────────────────────

interface ClassHistoryTabProps {
  classId:  number;
  onBack:   () => void;
}

const ClassHistoryTab: React.FC<ClassHistoryTabProps> = ({ classId, onBack }) => {
  const [data,    setData]    = useState<{ class: ClassOverview; lessons: LessonReport[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const [tick,    setTick]    = useState(0);

  const load = () => {
    setLoading(true);
    setError(null);
    fetch(`/api/admin/attendance/classes/${classId}`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : r.json().then((e: any) => Promise.reject(e.detail ?? 'Error')))
      .then(setData)
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [classId, tick]);

  const refresh = () => setTick(t => t + 1);

  return (
    <div className="space-y-5">
      {/* Back button + header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs ryze-text-muted hover:ryze-text-inverse transition"
        >
          <ChevronLeft size={14} />
          Back to overview
        </button>
        {data?.class && (
          <>
            <span className="text-slate-700">·</span>
            <span className="text-sm font-bold ryze-text-inverse">{data.class.name}</span>
            <span className="text-xs ryze-text-muted">{scheduleLabel(data.class as any)}</span>
          </>
        )}
        <button onClick={refresh} className="ml-auto p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition ryze-text-muted">
          <RefreshCw size={14} />
        </button>
      </div>

      {loading && (
        <div className="space-y-3">
          {[0, 1, 2].map(i => (
            <div key={i} className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 animate-pulse">
              <div className="h-4 bg-white/5 rounded w-1/3 mb-2" />
              <div className="h-3 bg-white/5 rounded w-1/2" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-red-300">{error}</div>
      )}

      {!loading && data && (
        <>
          {data.lessons.length === 0 ? (
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-16 text-center">
              <ClipboardList size={36} className="mx-auto mb-4 opacity-20" />
              <p className="ryze-text-muted text-sm">No lessons in the last 90 days for this class.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs ryze-text-muted">Showing last {data.lessons.length} lesson{data.lessons.length !== 1 ? 's' : ''} (up to 8)</p>
              {data.lessons.map(lesson => (
                <LessonCard key={lesson.id} lesson={lesson} onRefresh={refresh} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ── Issues tab ────────────────────────────────────────────────────────────────

const AGGR_ISSUE_META: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  ...ISSUE_META,
  possible_substitute:  { label: 'Possible substitute', icon: <Shield     size={13} />, color: 'text-purple-400' },
  unexpected_student:   { label: 'Unexpected student',  icon: <UserPlus   size={13} />, color: 'text-orange-400' },
  unknown_user:         { label: 'Unknown voice user',  icon: <UserX      size={13} />, color: 'text-amber-400' },
  // admin_test_activity is filtered server-side and will not appear in the Issues tab,
  // but the entry is here so ClassCard mini-rows can render it if shown in overview context
  admin_test_activity:  { label: 'Admin/test activity', icon: <Shield     size={13} />, color: 'text-slate-400' },
};

const IssuesTab: React.FC = () => {
  const [data,       setData]       = useState<{ total: number; items: AggregatedIssue[] } | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [genResult,  setGenResult]  = useState<{ created: number } | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    fetch('/api/admin/attendance/issues', { credentials: 'include' })
      .then(r => r.ok ? r.json() : r.json().then((e: any) => Promise.reject(e.detail ?? 'Error')))
      .then(setData)
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false));
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setGenResult(null);
    try {
      const r = await fetch('/api/admin/attendance/generate-alerts', {
        method: 'POST', credentials: 'include',
      });
      if (r.ok) {
        const d = await r.json();
        setGenResult({ created: d.created });
      }
    } catch {
      // best-effort — failure is non-critical
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <div className="space-y-2">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="bg-white/[0.03] border border-white/10 rounded-xl p-4 animate-pulse">
            <div className="h-4 bg-white/5 rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-red-300 flex items-center justify-between">
        <span>{error}</span>
        <button onClick={load} className="ml-4 px-3 py-1 rounded-lg bg-red-500/20 text-red-300 text-xs hover:bg-red-500/30 transition">Retry</button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs ryze-text-muted">
          {data.total} computed issue{data.total !== 1 ? 's' : ''} · last 14 days
        </p>
        <button onClick={load} className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition ryze-text-muted">
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Computed-only notice — clearly distinguish from persisted Alerts */}
      <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl px-4 py-3 flex items-start gap-3">
        <AlertTriangle size={14} className="text-blue-400 mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs text-blue-300 font-semibold">Computed issues — not persisted</p>
          <p className="text-xs ryze-text-muted mt-0.5">
            These are calculated live from attendance data on each page load.
            They are <em>not</em> saved as alerts. To create persistent, trackable records in the Alerts system, run the generator below.
          </p>
          {genResult != null && genResult.created > 0 && (
            <p className="text-xs text-emerald-400 mt-1 font-medium">
              ✓ {genResult.created} new alert{genResult.created !== 1 ? 's' : ''} created in the Alerts system.
            </p>
          )}
          {genResult != null && genResult.created === 0 && (
            <p className="text-xs text-slate-400 mt-1">
              No new alerts — no unresolved attendance issues found in the last 14 days, or all open alerts already exist. Check back after the next lesson runs.
            </p>
          )}
        </div>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-300 text-xs font-semibold hover:bg-blue-500/30 disabled:opacity-50 transition whitespace-nowrap"
        >
          <Shield size={12} />
          {generating ? 'Generating…' : 'Generate Alerts'}
        </button>
      </div>

      {data.items.length === 0 ? (
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-16 text-center">
          <CheckCircle2 size={36} className="mx-auto mb-4 text-emerald-400 opacity-60" />
          <p className="ryze-text-muted text-sm">No issues in the last 14 days.</p>
        </div>
      ) : (
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Issue</th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Class</th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Date</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((issue, i) => {
                const meta = AGGR_ISSUE_META[issue.type] ?? { label: issue.type, icon: <AlertTriangle size={13} />, color: 'text-amber-400' };
                return (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3">
                      <div className={`flex items-center gap-2 ${meta.color}`}>
                        {meta.icon}
                        <span className="font-medium text-xs">{issue.message}</span>
                      </div>
                      {issue.severity === 'error' && (
                        <span className="mt-1 inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-red-500/20 text-red-300 border border-red-500/20">Critical</span>
                      )}
                    </td>
                    <td className="px-5 py-3 ryze-text-muted text-xs hidden sm:table-cell">
                      <a href={`/dashboard/admin/classes/${issue.class_id}`} className="hover:text-[#FFB000] transition">
                        {issue.class_name}
                      </a>
                    </td>
                    <td className="px-5 py-3 ryze-text-muted text-xs hidden md:table-cell">
                      {fmtShortDate(issue.lesson_date)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────

type TabId = 'overview' | 'lessons' | 'voice' | 'crm' | 'issues';

export const AttendanceView: React.FC = () => {
  const [tab,             setTab]            = useState<TabId>('overview');
  const [focusedClassId,  setFocusedClassId] = useState<number | null>(null);

  // When a class card fires "View full history", switch to class-history sub-view
  const handleViewClassHistory = (classId: number) => {
    setFocusedClassId(classId);
    setTab('overview'); // stays in overview tree; ClassHistoryTab replaces OverviewTab
  };

  const handleBackToOverview = () => {
    setFocusedClassId(null);
  };

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview',          icon: <LayoutDashboard size={15} /> },
    { id: 'lessons',  label: 'By Date',           icon: <ClipboardList   size={15} /> },
    { id: 'voice',    label: 'Discord Voice Log', icon: <Mic             size={15} /> },
    { id: 'crm',      label: 'CRM Records',       icon: <Users           size={15} /> },
    { id: 'issues',   label: 'Issues',            icon: <AlertTriangle   size={15} /> },
  ];

  // Reset class focus when switching tabs
  const handleTabChange = (id: TabId) => {
    setTab(id);
    if (id !== 'overview') setFocusedClassId(null);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold ryze-text-inverse">Attendance</h2>
        <p className="ryze-text-muted mt-1 text-sm">
          Class-centric attendance control centre. Discord voice evidence reconciled against scheduled lessons.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-white/5 border border-white/10 rounded-xl w-fit overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => handleTabChange(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              tab === t.id
                ? 'bg-[#FFB000]/20 text-[#FFB000] border border-[#FFB000]/30'
                : 'ryze-text-muted hover:ryze-text-inverse hover:bg-white/5'
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'overview' && focusedClassId != null && (
        <ClassHistoryTab classId={focusedClassId} onBack={handleBackToOverview} />
      )}
      {tab === 'overview' && focusedClassId == null && (
        <OverviewTab onViewClassHistory={handleViewClassHistory} />
      )}
      {tab === 'lessons'  && <LessonsTab />}
      {tab === 'voice'    && <DiscordVoiceTab />}
      {tab === 'crm'      && <CrmTab />}
      {tab === 'issues'   && <IssuesTab />}
    </motion.div>
  );
};
