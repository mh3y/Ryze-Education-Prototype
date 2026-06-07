/**
 * attendanceEngine.ts
 *
 * Pure business-logic for lesson-based attendance computation.
 * No DB calls — takes raw data from the DB layer and returns a structured report.
 *
 * Architecture:
 *   Scheduled Lesson
 *     → Attendance Engine
 *     → Raw Discord VoiceAttendance evidence
 *     → Final Attendance Result
 */

// ── Constants (all configurable here) ────────────────────────────────────────

export const THRESHOLDS = {
  /** Voice sessions starting this many ms before lesson start are in-scope */
  BUFFER_BEFORE_MS:  15 * 60 * 1000,
  /** Voice sessions ending this many ms after lesson end are in-scope */
  BUFFER_AFTER_MS:   15 * 60 * 1000,
  /** Two consecutive sessions < this gap are merged into one block */
  MERGE_GAP_MS:       5 * 60 * 1000,
  /** First join this many ms after scheduled start → "late" */
  LATE_THRESHOLD_MS: 10 * 60 * 1000,
  /** Last leave this many ms before scheduled end → "left_early" */
  EARLY_LEAVE_MS:    10 * 60 * 1000,
  /** Fraction of lesson duration required to be "present" (not "partial") */
  PRESENT_PCT:       0.70,
} as const;

// ── Input types (from DB rows) ────────────────────────────────────────────────

export interface RawVoiceFragment {
  id:               number;
  joined_at:        Date;
  left_at:          Date | null;
  duration_seconds: number | null;
  discord_channel:  string | null;
  discord_channel_id: string | null;
  status:           string;
}

export interface RawLesson {
  scheduled_at:  Date;
  duration_min:  number;
}

export interface RawAttendanceOverride {
  status:    string;
  notes:     string | null;
  marked_by: number | null;
  marked_at: Date | null;
}

// ── Output types ──────────────────────────────────────────────────────────────

/** A single contiguous voice block after merging fragments */
export interface MergedBlock {
  start: Date;
  end:   Date | null;
}

/** Full merged picture for one participant in one lesson */
export interface MergedAttendance {
  first_join:     Date;
  last_leave:     Date | null;
  /** Sum of all merged block durations in whole minutes */
  total_minutes:  number;
  /** Number of raw Discord fragments that were merged */
  fragment_count: number;
  blocks:         MergedBlock[];
  fragments:      RawVoiceFragment[];
}

export interface ComputedStatus {
  status:      string;   // present | absent | late | left_early | partial
  is_late:     boolean;
  left_early:  boolean;
}

export interface IssueReport {
  type:      string;   // tutor_absent | student_absent | tutor_late | student_late | student_left_early
  severity:  'warning' | 'error';
  message:   string;
  user_id?:  number;
  user_name?: string;
}

// ── Merge engine ──────────────────────────────────────────────────────────────

/**
 * Given an array of raw voice fragments (for one user, already filtered to the
 * lesson window), merge consecutive sessions whose gap is ≤ MERGE_GAP_MS.
 *
 * Returns null when the input is empty.
 */
export function mergeVoiceFragments(fragments: RawVoiceFragment[]): MergedAttendance | null {
  if (!fragments.length) return null;

  const sorted = [...fragments].sort(
    (a, b) => a.joined_at.getTime() - b.joined_at.getTime(),
  );

  type Block = { start: Date; end: Date | null; frags: RawVoiceFragment[] };
  const blocks: Block[] = [];
  let cur: Block = { start: sorted[0].joined_at, end: sorted[0].left_at, frags: [sorted[0]] };

  for (let i = 1; i < sorted.length; i++) {
    const s = sorted[i];
    // Use cur.end as the previous endpoint; if still active treat gap as 0
    const prevEndMs = cur.end ? cur.end.getTime() : s.joined_at.getTime();
    const gapMs = s.joined_at.getTime() - prevEndMs;

    if (gapMs <= THRESHOLDS.MERGE_GAP_MS) {
      // Extend the current block
      const sEnd = s.left_at;
      cur.end = !cur.end
        ? sEnd
        : !sEnd
        ? cur.end
        : sEnd > cur.end
        ? sEnd
        : cur.end;
      cur.frags.push(s);
    } else {
      blocks.push({ ...cur });
      cur = { start: s.joined_at, end: s.left_at, frags: [s] };
    }
  }
  blocks.push(cur);

  const totalMs = blocks.reduce((acc, b) => {
    const end = b.end ?? new Date();
    return acc + Math.max(0, end.getTime() - b.start.getTime());
  }, 0);

  return {
    first_join:     blocks[0].start,
    last_leave:     blocks[blocks.length - 1].end,
    total_minutes:  Math.round(totalMs / 60_000),
    fragment_count: sorted.length,
    blocks:         blocks.map(b => ({ start: b.start, end: b.end })),
    fragments:      sorted,
  };
}

// ── Status computation ────────────────────────────────────────────────────────

/**
 * Derive an attendance status from the merged voice evidence vs. the scheduled lesson.
 * Does NOT consider manual overrides — the caller applies those afterwards.
 */
export function computeStatus(
  lesson: RawLesson,
  merged: MergedAttendance | null,
): ComputedStatus {
  if (!merged || merged.total_minutes === 0) {
    return { status: 'absent', is_late: false, left_early: false };
  }

  const lessonStart   = lesson.scheduled_at;
  const lessonEnd     = new Date(lessonStart.getTime() + lesson.duration_min * 60_000);
  const { total_minutes, first_join, last_leave } = merged;

  const attendancePct  = total_minutes / lesson.duration_min;
  const lateMs         = first_join.getTime() - lessonStart.getTime();
  const earlyLeaveMs   = last_leave
    ? lessonEnd.getTime() - last_leave.getTime()
    : 0;

  const is_late    = lateMs > THRESHOLDS.LATE_THRESHOLD_MS;
  const left_early = earlyLeaveMs > THRESHOLDS.EARLY_LEAVE_MS;

  let status: string;
  if (attendancePct < THRESHOLDS.PRESENT_PCT) {
    status = 'partial';
  } else if (left_early) {
    status = 'left_early';
  } else if (is_late) {
    status = 'late';
  } else {
    status = 'present';
  }

  return { status, is_late, left_early };
}

// ── Issue detector ────────────────────────────────────────────────────────────

/**
 * Build a list of actionable issues for a lesson, given tutor and student results.
 */
export function detectIssues(params: {
  tutor:    { user_id: number; full_name: string; final_status: string; is_late: boolean; left_early: boolean } | null;
  students: { user_id: number; full_name: string; final_status: string; is_late: boolean; left_early: boolean }[];
}): IssueReport[] {
  const issues: IssueReport[] = [];

  if (params.tutor) {
    const t = params.tutor;
    if (t.final_status === 'absent') {
      issues.push({ type: 'tutor_absent', severity: 'error', message: `Tutor ${t.full_name} was absent`, user_id: t.user_id, user_name: t.full_name });
    } else {
      if (t.is_late) {
        issues.push({ type: 'tutor_late', severity: 'warning', message: `Tutor ${t.full_name} joined late`, user_id: t.user_id, user_name: t.full_name });
      }
      if (t.left_early) {
        issues.push({ type: 'tutor_left_early', severity: 'warning', message: `Tutor ${t.full_name} left early`, user_id: t.user_id, user_name: t.full_name });
      }
    }
  } else {
    issues.push({ type: 'no_tutor', severity: 'warning', message: 'No tutor assigned to this class' });
  }

  for (const s of params.students) {
    if (s.final_status === 'absent') {
      issues.push({ type: 'student_absent', severity: 'warning', message: `${s.full_name} was absent`, user_id: s.user_id, user_name: s.full_name });
    } else {
      if (s.is_late) {
        issues.push({ type: 'student_late', severity: 'warning', message: `${s.full_name} joined late`, user_id: s.user_id, user_name: s.full_name });
      }
      if (s.left_early) {
        issues.push({ type: 'student_left_early', severity: 'warning', message: `${s.full_name} left early`, user_id: s.user_id, user_name: s.full_name });
      }
    }
  }

  return issues;
}

// ── Unexpected participant detector ───────────────────────────────────────────

export type UnexpectedParticipantType = 'possible_substitute' | 'unexpected_student' | 'unknown_user';

export interface UnexpectedParticipant {
  type:             UnexpectedParticipantType;
  severity:         'warning';
  crm_user_id:      number | null;
  full_name:        string | null;
  role:             string | null;
  discord_user_id:  string;
  discord_username: string | null;
  total_minutes:    number;
  first_join:       string; // ISO
}

/**
 * Given voice sessions in a class channel during a lesson window,
 * returns participants who are NOT in the expected set (tutor + enrolled students).
 *
 * Groups multiple fragments from the same user and classifies them:
 *   possible_substitute — tutor/admin role user, not the assigned tutor
 *   unexpected_student  — student-role user, not enrolled in this class
 *   unknown_user        — no crm_user_id (unmatched Discord account)
 */
export function detectUnexpectedParticipants(params: {
  expectedUserIds: Set<number>;
  channelSessions: Array<{
    crm_user_id:      number | null;
    discord_user_id:  string;
    discord_username: string | null;
    duration_seconds: number | null;
    joined_at:        Date;
    user: { id: number; full_name: string; role: string } | null;
  }>;
}): UnexpectedParticipant[] {
  // Aggregate sessions by crm_user_id (or discord_user_id for unmatched)
  const byKey = new Map<string, {
    crm_user_id:      number | null;
    discord_user_id:  string;
    discord_username: string | null;
    total_seconds:    number;
    first_join:       Date;
    user: { id: number; full_name: string; role: string } | null;
  }>();

  for (const s of params.channelSessions) {
    // Skip expected participants
    if (s.crm_user_id != null && params.expectedUserIds.has(s.crm_user_id)) continue;

    const key = s.crm_user_id != null ? `crm:${s.crm_user_id}` : `discord:${s.discord_user_id}`;
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, {
        crm_user_id:      s.crm_user_id,
        discord_user_id:  s.discord_user_id,
        discord_username: s.discord_username,
        total_seconds:    s.duration_seconds ?? 0,
        first_join:       s.joined_at,
        user:             s.user,
      });
    } else {
      existing.total_seconds += s.duration_seconds ?? 0;
      if (s.joined_at < existing.first_join) existing.first_join = s.joined_at;
    }
  }

  const result: UnexpectedParticipant[] = [];
  for (const entry of byKey.values()) {
    const total_minutes = Math.round(entry.total_seconds / 60);

    if (entry.crm_user_id == null) {
      result.push({
        type: 'unknown_user',
        severity: 'warning',
        crm_user_id: null,
        full_name: entry.discord_username,
        role: null,
        discord_user_id: entry.discord_user_id,
        discord_username: entry.discord_username,
        total_minutes,
        first_join: entry.first_join.toISOString(),
      });
    } else if (entry.user?.role === 'tutor' || entry.user?.role === 'admin') {
      result.push({
        type: 'possible_substitute',
        severity: 'warning',
        crm_user_id: entry.crm_user_id,
        full_name: entry.user?.full_name ?? null,
        role: entry.user?.role ?? null,
        discord_user_id: entry.discord_user_id,
        discord_username: entry.discord_username,
        total_minutes,
        first_join: entry.first_join.toISOString(),
      });
    } else {
      result.push({
        type: 'unexpected_student',
        severity: 'warning',
        crm_user_id: entry.crm_user_id,
        full_name: entry.user?.full_name ?? null,
        role: entry.user?.role ?? null,
        discord_user_id: entry.discord_user_id,
        discord_username: entry.discord_username,
        total_minutes,
        first_join: entry.first_join.toISOString(),
      });
    }
  }

  return result;
}

// ── Window helpers ────────────────────────────────────────────────────────────

/** Returns the start and end of the matching window for a lesson (includes buffers) */
export function lessonWindow(lesson: RawLesson): { windowStart: Date; windowEnd: Date; lessonEnd: Date } {
  const lessonEnd   = new Date(lesson.scheduled_at.getTime() + lesson.duration_min * 60_000);
  const windowStart = new Date(lesson.scheduled_at.getTime() - THRESHOLDS.BUFFER_BEFORE_MS);
  const windowEnd   = new Date(lessonEnd.getTime() + THRESHOLDS.BUFFER_AFTER_MS);
  return { windowStart, windowEnd, lessonEnd };
}

/**
 * True when a voice session (joined_at, left_at) overlaps a given window.
 * A session with left_at = null is considered still active.
 */
export function sessionOverlapsWindow(
  session: { joined_at: Date; left_at: Date | null },
  windowStart: Date,
  windowEnd:   Date,
): boolean {
  const sessionEnd = session.left_at ?? windowEnd; // still active → treat end as window end
  return session.joined_at < windowEnd && sessionEnd > windowStart;
}
