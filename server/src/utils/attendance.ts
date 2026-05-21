/**
 * Shared attendance utilities — used by both the student and parent portals
 * to ensure consistent calculation of attendance rate.
 *
 * Rule: 'present' and 'late' both count as ATTENDED.
 * 'absent', 'excused', 'unknown' do NOT count.
 */

/** Returns 0–100 rounded rate, or null if there are no records. */
export function attendanceRate(statuses: string[]): number | null {
  if (!statuses.length) return null;
  const attended = statuses.filter(s => s === 'present' || s === 'late').length;
  return Math.round((attended / statuses.length) * 100);
}
