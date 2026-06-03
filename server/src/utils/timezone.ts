/**
 * Australia/Sydney timezone utilities.
 *
 * Sydney observes:
 *   AEST  UTC+10:00  ~first Sunday in April  → ~first Sunday in October
 *   AEDT  UTC+11:00  ~first Sunday in October → ~first Sunday in April
 *
 * All helpers use Intl.DateTimeFormat with timeZone: 'Australia/Sydney' so
 * the runtime IANA database handles DST transitions automatically — no
 * hardcoded +10:00 offsets.
 */

/**
 * Returns the UTC timestamp for midnight (00:00:00.000) in Australia/Sydney
 * on the given YYYY-MM-DD date string.
 *
 * Algorithm:
 *   1. Construct the AEST (+10) candidate for midnight on that date.
 *   2. Ask Intl what Sydney hour this UTC moment actually falls at.
 *   3. If hour === 0 → AEST period, candidate is correct.
 *      If hour === 1 → AEDT period, shift back 1 hour to reach true midnight.
 *
 * Note: Sydney only ever uses +10 or +11, so the hour at the AEST candidate
 * is always 0 (correct) or 1 (needs -1h correction). The shift amount is
 * read from Intl rather than hardcoded so it is robust against future changes.
 */
export function sydneyMidnight(dateStr: string): Date {
  const aestCandidate = new Date(`${dateStr}T00:00:00+10:00`);

  // Get the Sydney local hour at this UTC moment.
  // hour12: false → 0-23 scale; midnight returns 0.
  const hour = Number(
    new Intl.DateTimeFormat('en-AU', {
      timeZone: 'Australia/Sydney',
      hour:     'numeric',
      hour12:   false,
    }).format(aestCandidate),
  ) % 24; // % 24 guards against the rare h24-cycle "24" value for midnight

  return hour === 0
    ? aestCandidate
    : new Date(aestCandidate.getTime() - hour * 3_600_000);
}

/**
 * Returns today's date in Australia/Sydney as a YYYY-MM-DD string.
 * Replaces any use of toLocaleDateString / hardcoded offset for "today".
 */
export function todaySydney(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Australia/Sydney' });
}

/**
 * Returns { start, end } UTC Date objects for a Sydney calendar day.
 *
 * @param daysOffset  0 = today in Sydney, 1 = tomorrow, 7 = 7 days ahead, etc.
 * @param dateStr     Optional YYYY-MM-DD base date (Sydney). Defaults to today in Sydney.
 *
 * start  = 00:00:00.000 Sydney local time as UTC
 * end    = 23:59:59.999 Sydney local time as UTC (+24h - 1ms from start)
 *
 * Day offset is applied via Date.UTC arithmetic so DST transitions during the
 * offset period never corrupt the result.
 */
export function sydneyDayBounds(
  daysOffset = 0,
  dateStr?: string,
): { start: Date; end: Date } {
  const base = dateStr ?? todaySydney();

  // Apply offset via UTC so DST drift cannot affect date arithmetic
  const [y, m, d] = base.split('-').map(Number);
  const target    = new Date(Date.UTC(y, m - 1, d + daysOffset))
    .toISOString()
    .slice(0, 10); // YYYY-MM-DD

  const start = sydneyMidnight(target);
  const end   = new Date(start.getTime() + 86_400_000 - 1); // +24h - 1ms

  return { start, end };
}
