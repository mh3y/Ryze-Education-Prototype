/**
 * cleanup_class3.ts — Production DB cleanup
 *
 * DRY-RUN MODE (default): prints all intended mutations, touches nothing.
 * EXECUTE MODE: pass --execute to write to production.
 *
 * Actions:
 *  1. Reassign lessons 1-6 from class_id=3 → class_id=5 (Berwyn|Thursday Group)
 *  2. Set google_calendar_id='ryzeeducationhq@gmail.com' on class 5
 *  3. Deactivate class 3: active=false, archived_at=NOW(), discord_channel_id=null, google_calendar_id=null
 *  4. Create Conrad|Sienna lesson: 2026-05-30 16:00 AEST (06:00 UTC), 120 min, class_id=4
 *  5. Create Conrad|Sienna lesson: 2026-06-06 16:00 AEST (06:00 UTC), 120 min, class_id=4, substitute_tutor_id=16
 */

import { db } from '../prisma';

const EXECUTE = process.argv.includes('--execute');

function log(label: string, data: Record<string, any>) {
  console.log(`\n[${EXECUTE ? 'EXECUTE' : 'DRY-RUN'}] ${label}`);
  console.log(JSON.stringify(data, null, 2));
}

async function main() {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`RYZE CLASS CLEANUP — ${EXECUTE ? '🔴 EXECUTE MODE' : '🟡 DRY-RUN MODE (pass --execute to write)'}`);
  console.log(`${'='.repeat(70)}`);

  // ── Read current state ──────────────────────────────────────────────────────

  const class3 = await db.classGroup.findUnique({ where: { id: 3 } });
  const class4 = await db.classGroup.findUnique({ where: { id: 4 } });
  const class5 = await db.classGroup.findUnique({ where: { id: 5 } });
  const lessons123 = await db.lesson.findMany({ where: { class_id: 3 }, orderBy: { scheduled_at: 'asc' } });

  console.log('\n── CURRENT STATE ──────────────────────────────────────────────────────');
  console.log('Class 3 (ghost):', { name: class3?.name, active: class3?.active, discord_channel_id: class3?.discord_channel_id, google_calendar_id: class3?.google_calendar_id });
  console.log('Class 4 (Conrad|Sienna):', { name: class4?.name, active: class4?.active, discord_channel_id: class4?.discord_channel_id, google_calendar_id: class4?.google_calendar_id });
  console.log('Class 5 (Berwyn|Thursday):', { name: class5?.name, active: class5?.active, discord_channel_id: class5?.discord_channel_id, google_calendar_id: class5?.google_calendar_id });
  console.log(`Lessons on class 3: ${lessons123.length} records (IDs: ${lessons123.map(l => l.id).join(', ')})`);
  for (const l of lessons123) {
    const syd = new Date(l.scheduled_at.getTime() + 10 * 3600 * 1000);
    const sydStr = `${syd.toISOString().replace('T', ' ').slice(0, 16)} AEST`;
    console.log(`  Lesson ${l.id}: ${l.title} | ${sydStr} | google_event_id=${l.google_event_id?.slice(0, 30)}…`);
  }

  console.log('\n── PLANNED MUTATIONS ──────────────────────────────────────────────────');

  // Action 1: Reassign lessons 1-6 to class_id=5
  log('ACTION 1 — Reassign 6 lessons from class 3 → class 5', {
    lesson_ids: lessons123.map(l => l.id),
    before: { class_id: 3 },
    after: { class_id: 5 },
  });
  if (EXECUTE) {
    await db.lesson.updateMany({
      where: { class_id: 3 },
      data: { class_id: 5 },
    });
    console.log('  ✓ Done');
  }

  // Action 2: Set google_calendar_id on class 5
  log('ACTION 2 — Set google_calendar_id on class 5 (Berwyn|Thursday)', {
    class_id: 5,
    before: { google_calendar_id: class5?.google_calendar_id ?? null },
    after: { google_calendar_id: 'ryzeeducationhq@gmail.com' },
  });
  if (EXECUTE) {
    await db.classGroup.update({
      where: { id: 5 },
      data: { google_calendar_id: 'ryzeeducationhq@gmail.com' },
    });
    console.log('  ✓ Done');
  }

  // Action 3: Deactivate class 3
  const archiveAt = new Date();
  log('ACTION 3 — Deactivate class 3 (ryzeeducationhq@gmail.com ghost)', {
    class_id: 3,
    before: {
      active: class3?.active,
      archived_at: null,
      discord_channel_id: class3?.discord_channel_id,
      google_calendar_id: class3?.google_calendar_id,
    },
    after: {
      active: false,
      archived_at: archiveAt.toISOString(),
      discord_channel_id: null,
      google_calendar_id: null,
    },
  });
  if (EXECUTE) {
    await db.classGroup.update({
      where: { id: 3 },
      data: {
        active: false,
        archived_at: archiveAt,
        discord_channel_id: null,
        google_calendar_id: null,
        name: 'ryzeeducationhq@gmail.com [ARCHIVED — do not use]',
      },
    });
    console.log('  ✓ Done');
  }

  // Action 4: Create Conrad|Sienna May 30 lesson
  const may30 = new Date('2026-05-30T06:00:00.000Z'); // 16:00 AEST
  log('ACTION 4 — Create Conrad|Sienna lesson (May 30)', {
    class_id: 4,
    scheduled_at: may30.toISOString(),
    scheduled_aest: '2026-05-30 16:00 AEST',
    duration_min: 120,
    title: 'Conrad | Sienna | 4PM - 6PM',
    recurrence_key: 'manual_class4_2026-05-30',
  });
  if (EXECUTE) {
    const newLesson1 = await db.lesson.create({
      data: {
        class_id: 4,
        title: 'Conrad | Sienna | 4PM - 6PM',
        scheduled_at: may30,
        duration_min: 120,
        status: 'scheduled',
        recurrence_key: 'manual_class4_2026-05-30',
      },
    });
    console.log(`  ✓ Created lesson ID=${newLesson1.id}`);
  }

  // Action 5: Create Conrad|Sienna June 6 lesson (with substitute Daniel|Tutor ID=16)
  const june6 = new Date('2026-06-06T06:00:00.000Z'); // 16:00 AEST
  log('ACTION 5 — Create Conrad|Sienna lesson (June 6, substitute tutor Daniel|Tutor ID=16)', {
    class_id: 4,
    scheduled_at: june6.toISOString(),
    scheduled_aest: '2026-06-06 16:00 AEST',
    duration_min: 120,
    title: 'Conrad | Sienna | 4PM - 6PM',
    substitute_tutor_id: 16,
    recurrence_key: 'manual_class4_2026-06-06',
    note: 'Conrad (ID=19) absent. Daniel|Tutor (ID=16) covered as substitute (joined 06:09Z, 130 min). Daniel Kim (ID=33) also present — possibly co-tutor.',
  });
  if (EXECUTE) {
    const newLesson2 = await db.lesson.create({
      data: {
        class_id: 4,
        title: 'Conrad | Sienna | 4PM - 6PM',
        scheduled_at: june6,
        duration_min: 120,
        status: 'scheduled',
        substitute_tutor_id: 16,
        recurrence_key: 'manual_class4_2026-06-06',
      },
    });
    console.log(`  ✓ Created lesson ID=${newLesson2.id}`);
  }

  // ── Summary ─────────────────────────────────────────────────────────────────
  console.log('\n── SUMMARY ────────────────────────────────────────────────────────────');
  if (!EXECUTE) {
    console.log('DRY-RUN complete — no data was written.');
    console.log('Run with --execute to apply changes.');
  } else {
    console.log('EXECUTE complete — all mutations applied.');
    // Verify final state
    const [c3, c4, c5, berwynLessons, conradLessons] = await Promise.all([
      db.classGroup.findUnique({ where: { id: 3 }, select: { active: true, discord_channel_id: true, google_calendar_id: true, archived_at: true } }),
      db.classGroup.findUnique({ where: { id: 4 }, select: { name: true, discord_channel_id: true } }),
      db.classGroup.findUnique({ where: { id: 5 }, select: { name: true, discord_channel_id: true, google_calendar_id: true } }),
      db.lesson.findMany({ where: { class_id: 5 }, orderBy: { scheduled_at: 'asc' }, select: { id: true, scheduled_at: true, title: true } }),
      db.lesson.findMany({ where: { class_id: 4 }, orderBy: { scheduled_at: 'asc' }, select: { id: true, scheduled_at: true, title: true, substitute_tutor_id: true } }),
    ]);
    console.log('\nFinal class 3:', c3);
    console.log('Final class 4 (Conrad|Sienna):', c4);
    console.log('Final class 5 (Berwyn):', c5);
    console.log(`\nBerwyn lessons (${berwynLessons.length}):`, berwynLessons.map(l => ({
      id: l.id,
      scheduled_aest: new Date(l.scheduled_at.getTime() + 10*3600000).toISOString().slice(0,16) + ' AEST'
    })));
    console.log(`Conrad|Sienna lessons (${conradLessons.length}):`, conradLessons.map(l => ({
      id: l.id,
      scheduled_aest: new Date(l.scheduled_at.getTime() + 10*3600000).toISOString().slice(0,16) + ' AEST',
      substitute: l.substitute_tutor_id
    })));
  }
}

main().catch(console.error).finally(() => db.$disconnect());
