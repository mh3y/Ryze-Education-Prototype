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

// ── Main component ────────────────────────────────────────────────────────────

type TabId = 'lessons' | 'voice' | 'crm';

export const AttendanceView: React.FC = () => {
  const [tab, setTab] = useState<TabId>('lessons');

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'lessons', label: 'Scheduled Lessons', icon: <ClipboardList size={15} /> },
    { id: 'voice',   label: 'Discord Voice Log', icon: <Mic           size={15} /> },
    { id: 'crm',     label: 'CRM Records',       icon: <Users         size={15} /> },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold ryze-text-inverse">Attendance</h2>
        <p className="ryze-text-muted mt-1 text-sm">
          Scheduled lessons are the source of truth. Discord voice activity is evidence used to verify attendance.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-white/5 border border-white/10 rounded-xl w-fit overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
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
      {tab === 'lessons' && <LessonsTab />}
      {tab === 'voice'   && <DiscordVoiceTab />}
      {tab === 'crm'     && <CrmTab />}
    </motion.div>
  );
};
