/**
 * dry-run-voice-match.ts
 *
 * READ-ONLY diagnostic script.
 * Shows what attendance would be computed for unmatched voice sessions
 * once Lesson rows exist — without modifying any data.
 *
 * Usage (from server/):
 *   npx ts-node --esm src/scripts/dry-run-voice-match.ts [YYYY-MM-DD] [YYYY-MM-DD]
 *
 *   Default range: last 30 days.
 *
 * Output:
 *   - Lists all VoiceAttendance records with lesson_id = null (unmatched)
 *   - Groups by channel + date (Sydney calendar day)
 *   - Runs the attendance engine per user using any matching Lesson rows
 *   - If no Lesson exists, reports "NO LESSON — fix Google token first"
 *
 * This script is safe to run against production. It never writes.
 */

import { db } from '../prisma';
import {
  mergeVoiceFragments,
  computeStatus,
  sessionOverlapsWindow,
  lessonWindow,
  type RawVoiceFragment,
} from '../services/attendanceEngine';

const SYDNEY_OFFSET_MS = 10 * 60 * 60 * 1000; // AEST UTC+10 (for display only)

function toSydneyDisplay(d: Date): string {
  return new Date(d.getTime() + SYDNEY_OFFSET_MS).toISOString().replace('T', ' ').slice(0, 19) + ' AEST';
}

async function main() {
  const args = process.argv.slice(2);
  const now  = new Date();
  const from = args[0] ? new Date(`${args[0]}T00:00:00Z`) : new Date(now.getTime() - 30 * 86_400_000);
  const to   = args[1] ? new Date(`${args[1]}T23:59:59Z`) : now;

  console.log(`\n=== Voice Attendance Dry-Run (READ-ONLY) ===`);
  console.log(`Range: ${from.toISOString()} → ${to.toISOString()}\n`);

  // 1. Fetch all unmatched VoiceAttendance records in the date range
  const unmatched = await db.voiceAttendance.findMany({
    where: {
      lesson_id: null,
      joined_at: { gte: from, lte: to },
    },
    orderBy: [{ discord_channel_id: 'asc' }, { crm_user_id: 'asc' }, { joined_at: 'asc' }],
  });

  if (!unmatched.length) {
    console.log('✅  No unmatched voice sessions in this range. All sessions are linked to lessons.');
    await db.$disconnect();
    return;
  }

  // 2. Pre-fetch CRM users for the crm_user_ids that appear
  const userIds = [...new Set(unmatched.map(s => s.crm_user_id).filter((id): id is number => id !== null))];
  const users   = userIds.length
    ? await db.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, full_name: true, role: true },
      })
    : [];
  const userMap = new Map(users.map(u => [u.id, u]));

  console.log(`Found ${unmatched.length} unmatched session(s).\n`);

  // 3. Group by channel + date (Sydney calendar day)
  type GroupKey = string;
  const groups = new Map<GroupKey, typeof unmatched>();

  for (const s of unmatched) {
    const sydneyDay = new Date(s.joined_at.getTime() + SYDNEY_OFFSET_MS)
      .toISOString()
      .slice(0, 10);
    const key: GroupKey = `${s.discord_channel_id ?? 'unknown'}::${sydneyDay}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(s);
  }

  // 4. For each group, look for a matching Lesson in Supabase
  for (const [key, sessions] of groups) {
    const [channelId, dateStr] = key.split('::');
    const dayStartUtc = new Date(`${dateStr}T00:00:00+10:00`); // Sydney midnight as UTC
    const dayEndUtc   = new Date(dayStartUtc.getTime() + 24 * 3_600_000);

    // Find the class group for this channel
    const classGroup = await db.classGroup.findFirst({
      where: { discord_channel_id: channelId },
      select: { id: true, name: true },
    });

    // Find any lessons for this class on this day
    const lessons = classGroup
      ? await db.lesson.findMany({
          where: {
            class_id:     classGroup.id,
            scheduled_at: { gte: dayStartUtc, lt: dayEndUtc },
          },
          orderBy: { scheduled_at: 'asc' },
        })
      : [];

    const channelLabel = sessions[0].discord_channel ?? channelId;
    console.log(`─────────────────────────────────────────────────────────`);
    console.log(`Channel : ${channelLabel}  (id=${channelId})`);
    console.log(`Date    : ${dateStr} (Sydney)`);
    console.log(`Class   : ${classGroup?.name ?? '⚠️  NO CLASS MAPPED TO THIS CHANNEL'}`);

    if (!lessons.length) {
      console.log(`Lesson  : ❌  NONE FOUND — fix GOOGLE_REFRESH_TOKEN and re-sync, then run this script again.\n`);

      // Still print raw sessions so you can create a lesson manually with the correct time
      const byUser = new Map<string, typeof sessions>();
      for (const s of sessions) {
        const uid = String(s.crm_user_id ?? `anon:${s.discord_user_id}`);
        if (!byUser.has(uid)) byUser.set(uid, []);
        byUser.get(uid)!.push(s);
      }
      for (const [uid, uSessions] of byUser) {
        const user = uSessions[0].crm_user_id ? userMap.get(uSessions[0].crm_user_id) : null;
        const name = user?.full_name ?? uSessions[0].discord_username ?? uid;
        console.log(`  ${name}:`);
        for (const s of uSessions) {
          const mins = s.duration_seconds != null ? Math.round(s.duration_seconds / 60) : '?';
          const leftStr = s.left_at ? toSydneyDisplay(s.left_at) : 'still active';
          console.log(`    ${toSydneyDisplay(s.joined_at)} → ${leftStr}  (${mins} min)  id=${s.id}`);
        }
      }
      console.log('');
      continue;
    }

    // 5. For each lesson, run the engine per user
    for (const lesson of lessons) {
      const { windowStart, windowEnd } = lessonWindow({
        scheduled_at: lesson.scheduled_at,
        duration_min:  lesson.duration_min,
      });
      console.log(
        `Lesson  : "${lesson.title}"  (id=${lesson.id})  ` +
        `${toSydneyDisplay(lesson.scheduled_at)}  ${lesson.duration_min} min`,
      );

      // Group sessions for this lesson window by crm_user_id
      const byUser = new Map<string, typeof sessions>();
      for (const s of sessions) {
        if (!sessionOverlapsWindow({ joined_at: s.joined_at, left_at: s.left_at }, windowStart, windowEnd)) {
          continue;
        }
        const uid = String(s.crm_user_id ?? `anon:${s.discord_user_id}`);
        if (!byUser.has(uid)) byUser.set(uid, []);
        byUser.get(uid)!.push(s);
      }

      if (!byUser.size) {
        console.log('  (no sessions overlap this lesson window)\n');
        continue;
      }

      for (const [, uSessions] of byUser) {
        const user = uSessions[0].crm_user_id ? userMap.get(uSessions[0].crm_user_id) : null;
        const name = user?.full_name ?? uSessions[0].discord_username ?? uSessions[0].discord_user_id;
        const role = user?.role ?? 'unknown';

        const fragments: RawVoiceFragment[] = uSessions.map(s => ({
          id:                s.id,
          joined_at:         s.joined_at,
          left_at:           s.left_at,
          duration_seconds:  s.duration_seconds,
          discord_channel:   s.discord_channel,
          discord_channel_id: s.discord_channel_id,
          status:            s.status,
        }));

        const merged   = mergeVoiceFragments(fragments);
        const computed = computeStatus(
          { scheduled_at: lesson.scheduled_at, duration_min: lesson.duration_min },
          merged,
        );

        const statusIcon: Record<string, string> = {
          present:    '✅',
          late:       '🟡',
          left_early: '🟠',
          partial:    '🔶',
          absent:     '❌',
        };
        const icon = statusIcon[computed.status] ?? '❓';

        console.log(
          `  ${icon} ${name} (${role})  →  ${computed.status.toUpperCase()}` +
          `  (${merged?.total_minutes ?? 0} min / ${lesson.duration_min} min)` +
          `  fragments=${fragments.length}` +
          (computed.is_late    ? '  [LATE]'       : '') +
          (computed.left_early ? '  [LEFT_EARLY]' : ''),
        );

        if (fragments.length > 1 && merged) {
          console.log(`       Merged into ${merged.blocks.length} block(s):`);
          for (const b of merged.blocks) {
            const dur = b.end ? Math.round((b.end.getTime() - b.start.getTime()) / 60_000) : null;
            const endStr = b.end ? toSydneyDisplay(b.end) : 'active';
            console.log(`         ${toSydneyDisplay(b.start)} → ${endStr}  (${dur ?? '?'} min)`);
          }
        }
      }
      console.log('');
    }
  }

  console.log('=== End of dry-run (no data was modified) ===\n');
  await db.$disconnect();
}

main().catch(err => {
  console.error('Error:', err);
  db.$disconnect().catch(() => {});
  process.exit(1);
});
