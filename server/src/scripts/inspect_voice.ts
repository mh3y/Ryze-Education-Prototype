import { db } from '../prisma';

async function main() {
  // Conrad|Sienna channel: 1504621748379979886
  // Berwyn|Thursday channel: 1499321041837887528

  // All voice sessions in both channels over May-June 2026
  const voiceSessions = await db.voiceAttendance.findMany({
    where: {
      discord_channel_id: { in: ['1504621748379979886', '1499321041837887528'] },
      joined_at: { gte: new Date('2026-05-01T00:00:00Z') }
    },
    orderBy: [{ discord_channel_id: 'asc' }, { joined_at: 'asc' }],
    include: {
      user: { select: { id: true, full_name: true, role: true } }
    }
  });

  console.log('\n=== VOICE SESSIONS IN CLASS CHANNELS (May 2026+) ===');
  for (const v of voiceSessions) {
    const joined = v.joined_at.toISOString();
    const left = v.left_at?.toISOString() ?? 'still active';
    const dur = v.duration_seconds ? `${Math.round(v.duration_seconds/60)}min` : 'null';
    console.log(`channel=${v.discord_channel_id} | joined=${joined} | left=${left} | dur=${dur} | discord_user=${v.discord_user_id} | discord_name=${v.discord_username} | crm_user=${v.crm_user_id} | crm_name=${v.user?.full_name ?? 'UNMATCHED'} | role=${v.user?.role ?? 'N/A'} | lesson_id=${v.lesson_id}`);
  }

  // Users by tutor_id for Conrad|Sienna (id=4, tutor_id=19)
  const user19 = await db.user.findUnique({
    where: { id: 19 },
    select: { id: true, full_name: true, role: true, discord_user_id: true }
  });
  console.log('\n=== USER ID=19 (Conrad|Sienna tutor) ===');
  console.log(JSON.stringify(user19, null, 2));

  // User ID=23 (Berwyn|Thursday tutor)
  const user23 = await db.user.findUnique({
    where: { id: 23 },
    select: { id: true, full_name: true, role: true, discord_user_id: true }
  });
  console.log('\n=== USER ID=23 (Berwyn|Thursday tutor) ===');
  console.log(JSON.stringify(user23, null, 2));

  // All users with role=tutor
  const tutors = await db.user.findMany({
    where: { role: 'tutor' },
    select: { id: true, full_name: true, role: true, discord_user_id: true }
  });
  console.log('\n=== ALL TUTORS ===');
  console.log(JSON.stringify(tutors, null, 2));

  // Enrollments for Conrad|Sienna (class_id=4) and Berwyn (class_id=5)
  const enrollments = await db.classEnrollment.findMany({
    where: { class_id: { in: [4, 5] } },
    include: { student: { select: { id: true, full_name: true, role: true } } }
  });
  console.log('\n=== ENROLLMENTS (classes 4 & 5) ===');
  console.log(JSON.stringify(enrollments, null, 2));
}
main().catch(console.error).finally(() => db.$disconnect());
