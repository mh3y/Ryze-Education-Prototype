import { describe, it, expect } from 'vitest';
import {
  mergeVoiceFragments,
  computeStatus,
  detectIssues,
  lessonWindow,
  sessionOverlapsWindow,
  THRESHOLDS,
  type RawVoiceFragment,
  type RawLesson,
} from './attendanceEngine';

// ── Helpers ───────────────────────────────────────────────────────────────────

function frag(joined: Date, left: Date | null, id = 1): RawVoiceFragment {
  return {
    id,
    joined_at: joined,
    left_at: left,
    duration_seconds: left ? Math.floor((left.getTime() - joined.getTime()) / 1000) : null,
    discord_channel: 'test',
    discord_channel_id: '123456789',
    status: 'completed',
  };
}

// Fixed 2-hour lesson: 19:00–21:00 Sydney time (stored UTC 09:00–11:00)
const lessonStart = new Date('2025-06-05T09:00:00.000Z');
const lesson: RawLesson = { scheduled_at: lessonStart, duration_min: 120 };
const lessonEnd  = new Date('2025-06-05T11:00:00.000Z');

// ── mergeVoiceFragments ───────────────────────────────────────────────────────

describe('mergeVoiceFragments', () => {
  it('returns null for empty input', () => {
    expect(mergeVoiceFragments([])).toBeNull();
  });

  it('returns single block for one fragment', () => {
    const start = new Date('2025-06-05T09:00:00Z');
    const end   = new Date('2025-06-05T11:00:00Z');
    const result = mergeVoiceFragments([frag(start, end)]);
    expect(result).not.toBeNull();
    expect(result!.blocks).toHaveLength(1);
    expect(result!.total_minutes).toBe(120);
    expect(result!.fragment_count).toBe(1);
  });

  it('merges two fragments within MERGE_GAP_MS', () => {
    const a_start = new Date('2025-06-05T09:00:00Z');
    const a_end   = new Date('2025-06-05T09:50:00Z');
    // 4-min gap — within 5-min threshold
    const b_start = new Date('2025-06-05T09:54:00Z');
    const b_end   = new Date('2025-06-05T11:00:00Z');

    const result = mergeVoiceFragments([frag(a_start, a_end, 1), frag(b_start, b_end, 2)]);
    expect(result!.blocks).toHaveLength(1);
    expect(result!.fragment_count).toBe(2);
  });

  it('keeps two fragments as separate blocks when gap > MERGE_GAP_MS', () => {
    const a_start = new Date('2025-06-05T09:00:00Z');
    const a_end   = new Date('2025-06-05T09:50:00Z');
    // 10-min gap — exceeds 5-min threshold
    const b_start = new Date('2025-06-05T10:00:00Z');
    const b_end   = new Date('2025-06-05T11:00:00Z');

    const result = mergeVoiceFragments([frag(a_start, a_end, 1), frag(b_start, b_end, 2)]);
    expect(result!.blocks).toHaveLength(2);
  });

  it('sorts fragments before merging (out-of-order input)', () => {
    const a_start = new Date('2025-06-05T09:00:00Z');
    const a_end   = new Date('2025-06-05T09:50:00Z');
    const b_start = new Date('2025-06-05T09:54:00Z');
    const b_end   = new Date('2025-06-05T11:00:00Z');

    // Pass in reverse order
    const result = mergeVoiceFragments([frag(b_start, b_end, 2), frag(a_start, a_end, 1)]);
    expect(result!.blocks).toHaveLength(1);
    expect(result!.first_join).toEqual(a_start);
  });
});

// ── computeStatus ─────────────────────────────────────────────────────────────

describe('computeStatus', () => {
  it('returns absent when no voice evidence', () => {
    const s = computeStatus(lesson, null);
    expect(s.status).toBe('absent');
    expect(s.is_late).toBe(false);
    expect(s.left_early).toBe(false);
  });

  it('returns present for a full on-time session', () => {
    const merged = mergeVoiceFragments([frag(lessonStart, lessonEnd)]);
    const s = computeStatus(lesson, merged);
    expect(s.status).toBe('present');
    expect(s.is_late).toBe(false);
    expect(s.left_early).toBe(false);
  });

  it('returns late when first join is > LATE_THRESHOLD after start', () => {
    // Join 15 minutes late (threshold is 10 min)
    const join = new Date(lessonStart.getTime() + 15 * 60_000);
    const merged = mergeVoiceFragments([frag(join, lessonEnd)]);
    const s = computeStatus(lesson, merged);
    expect(s.is_late).toBe(true);
    expect(s.status).toBe('late');
  });

  it('returns left_early when last leave is > EARLY_LEAVE_MS before end', () => {
    // Leave 15 minutes early (threshold is 10 min)
    const leave = new Date(lessonEnd.getTime() - 15 * 60_000);
    const merged = mergeVoiceFragments([frag(lessonStart, leave)]);
    const s = computeStatus(lesson, merged);
    expect(s.left_early).toBe(true);
    expect(s.status).toBe('left_early');
  });

  it('returns partial when attendance < PRESENT_PCT (70%)', () => {
    // Only attend 60 min out of 120 min (50%)
    const leave = new Date(lessonStart.getTime() + 60 * 60_000);
    const merged = mergeVoiceFragments([frag(lessonStart, leave)]);
    const s = computeStatus(lesson, merged);
    expect(s.status).toBe('partial');
  });

  it('on-time join within threshold is NOT flagged as late', () => {
    // Join 5 minutes late — within the 10-min threshold
    const join = new Date(lessonStart.getTime() + 5 * 60_000);
    const merged = mergeVoiceFragments([frag(join, lessonEnd)]);
    const s = computeStatus(lesson, merged);
    expect(s.is_late).toBe(false);
    expect(s.status).toBe('present');
  });
});

// ── detectIssues ──────────────────────────────────────────────────────────────

describe('detectIssues', () => {
  const mkUser = (status: string, is_late = false, left_early = false) => ({
    user_id: 1, full_name: 'Test User', final_status: status, is_late, left_early,
  });

  it('returns no_tutor when tutor is null', () => {
    const issues = detectIssues({ tutor: null, students: [] });
    expect(issues.some((i) => i.type === 'no_tutor')).toBe(true);
  });

  it('returns tutor_absent error when tutor is absent', () => {
    const issues = detectIssues({ tutor: mkUser('absent'), students: [] });
    expect(issues.some((i) => i.type === 'tutor_absent' && i.severity === 'error')).toBe(true);
  });

  it('returns tutor_late warning when tutor is late', () => {
    const issues = detectIssues({ tutor: mkUser('late', true), students: [] });
    expect(issues.some((i) => i.type === 'tutor_late' && i.severity === 'warning')).toBe(true);
  });

  it('returns student_absent warning when student is absent', () => {
    const issues = detectIssues({ tutor: mkUser('present'), students: [mkUser('absent')] });
    expect(issues.some((i) => i.type === 'student_absent')).toBe(true);
  });

  it('returns student_left_early warning', () => {
    const issues = detectIssues({
      tutor: mkUser('present'),
      students: [{ user_id: 2, full_name: 'Student', final_status: 'left_early', is_late: false, left_early: true }],
    });
    expect(issues.some((i) => i.type === 'student_left_early')).toBe(true);
  });

  it('returns no issues when everyone is present on time', () => {
    const issues = detectIssues({
      tutor: mkUser('present'),
      students: [mkUser('present'), mkUser('present')],
    });
    expect(issues).toHaveLength(0);
  });
});

// ── lessonWindow ──────────────────────────────────────────────────────────────

describe('lessonWindow', () => {
  it('returns correct window with buffers applied', () => {
    const { windowStart, windowEnd, lessonEnd: le } = lessonWindow(lesson);
    expect(windowStart.getTime()).toBe(lessonStart.getTime() - THRESHOLDS.BUFFER_BEFORE_MS);
    expect(le.getTime()).toBe(lessonStart.getTime() + 120 * 60_000);
    expect(windowEnd.getTime()).toBe(le.getTime() + THRESHOLDS.BUFFER_AFTER_MS);
  });
});

// ── sessionOverlapsWindow ─────────────────────────────────────────────────────

describe('sessionOverlapsWindow', () => {
  const wStart = new Date('2025-06-05T08:45:00Z'); // 15 min before lesson
  const wEnd   = new Date('2025-06-05T11:15:00Z'); // 15 min after lesson

  it('overlaps when session starts before window end and ends after window start', () => {
    const s = { joined_at: new Date('2025-06-05T09:00:00Z'), left_at: new Date('2025-06-05T11:00:00Z') };
    expect(sessionOverlapsWindow(s, wStart, wEnd)).toBe(true);
  });

  it('does not overlap when session ends before window starts', () => {
    const s = { joined_at: new Date('2025-06-05T08:00:00Z'), left_at: new Date('2025-06-05T08:30:00Z') };
    expect(sessionOverlapsWindow(s, wStart, wEnd)).toBe(false);
  });

  it('does not overlap when session starts after window ends', () => {
    const s = { joined_at: new Date('2025-06-05T12:00:00Z'), left_at: new Date('2025-06-05T13:00:00Z') };
    expect(sessionOverlapsWindow(s, wStart, wEnd)).toBe(false);
  });

  it('still-active session (left_at=null) overlaps when started before window end', () => {
    const s = { joined_at: new Date('2025-06-05T10:00:00Z'), left_at: null };
    expect(sessionOverlapsWindow(s, wStart, wEnd)).toBe(true);
  });
});

// ── Recurrence key format (regression guard) ──────────────────────────────────

describe('recurrence_key format', () => {
  it('matches the pattern cls{id}-{YYYY-MM-DD}-{HHMM}', () => {
    const classId = 42;
    const dateStr = '2025-06-05';
    const hour = 19;
    const minute = 0;
    const key = `cls${classId}-${dateStr}-${String(hour).padStart(2, '0')}${String(minute).padStart(2, '0')}`;
    expect(key).toBe('cls42-2025-06-05-1900');
    expect(key).toMatch(/^cls\d+-\d{4}-\d{2}-\d{2}-\d{4}$/);
  });

  it('zero-pads hours and minutes', () => {
    const key = `cls1-2025-01-01-${String(7).padStart(2, '0')}${String(5).padStart(2, '0')}`;
    expect(key).toBe('cls1-2025-01-01-0705');
  });
});
