import 'dotenv/config';
import { db } from './prisma';
import { randomUUID } from 'crypto';

async function main() {
  console.log('Seeding Ryze Portal database...\n');

  // Admin user
  await db.user.upsert({
    where: { id: 1 },
    create: { full_name: 'Admin', email: 'admin@ryzeeducation.com.au', role: 'admin' },
    update: {},
  });

  // Tutor user
  await db.user.upsert({
    where: { id: 2 },
    create: { full_name: 'Daniel Kwok', email: 'daniel@ryzeeducation.com.au', role: 'tutor' },
    update: {},
  });

  // TutorProfile for Daniel
  await db.tutorProfile.upsert({
    where: { user_id: 2 },
    create: { user_id: 2, subjects: 'Mathematics' },
    update: {},
  });

  // Student users
  const [amelia, liam, noah] = await Promise.all([
    db.user.upsert({
      where: { id: 3 },
      create: {
        full_name: 'Amelia Tran',
        email: 'amelia@example.com',
        role: 'student',
        active: true,
        student_profile: { create: { year_level: 'Year 12', school: 'Sydney Girls High School' } },
      },
      update: {},
    }),
    db.user.upsert({
      where: { id: 4 },
      create: {
        full_name: 'Liam Tran',
        email: 'liam@example.com',
        role: 'student',
        active: true,
        student_profile: { create: { year_level: 'Year 9' } },
      },
      update: {},
    }),
    db.user.upsert({
      where: { id: 5 },
      create: {
        full_name: 'Noah Park',
        email: 'noah@example.com',
        role: 'student',
        active: true,
        student_profile: { create: { year_level: 'Year 11' } },
      },
      update: {},
    }),
  ]);

  // ClassGroup with Daniel as tutor
  const mathsClass = await db.classGroup.upsert({
    where: { id: 1 },
    create: { name: 'Maths Extension 1 — HSC', subject: 'Mathematics', tutor_id: 2 },
    update: {},
  });

  // Enroll Amelia
  await db.classEnrollment.upsert({
    where: { student_id_class_id: { student_id: amelia.id, class_id: mathsClass.id } },
    create: { student_id: amelia.id, class_id: mathsClass.id },
    update: {},
  });

  // Upcoming lesson
  const nextTuesday = new Date();
  nextTuesday.setDate(nextTuesday.getDate() + ((2 - nextTuesday.getDay() + 7) % 7 || 7));
  nextTuesday.setHours(17, 0, 0, 0);
  await db.lesson.upsert({
    where: { id: 1 },
    create: {
      class_id: mathsClass.id,
      title: 'Complex Numbers — Argand Diagram',
      scheduled_at: nextTuesday,
      duration_min: 60,
      status: 'scheduled',
    },
    update: {},
  });

  // Progress report for Amelia
  await db.progressReport.upsert({
    where: { id: 1 },
    create: {
      student_id: amelia.id,
      period: 'Term 1 2026',
      score: 86,
      grade: 'A',
      strengths: 'Strong algebraic manipulation and exam technique',
      improvements: 'Integration techniques need more practice',
      status: 'published',
    },
    update: {},
  });

  // Outstanding payment for Amelia
  const tomorrow = new Date(Date.now() + 86400000);
  await db.studentPayment.upsert({
    where: { id: 1 },
    create: {
      student_id: amelia.id,
      amount_cents: 54000,
      description: 'May 2026 — Maths Extension 1',
      due_date: tomorrow,
      status: 'pending',
    },
    update: {},
  });

  // Parent with pending invite
  const inviteToken = randomUUID();
  const parent = await db.parent.upsert({
    where: { email: 'sarah.tran@example.com' },
    create: {
      first_name: 'Sarah',
      last_name: 'Tran',
      email: 'sarah.tran@example.com',
      phone: '0412 345 678',
      invite_token: inviteToken,
      invite_expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000),
      invite_pending: true,
    },
    update: {},
  });

  // Link Sarah → Amelia (student_id: 3) and Liam (student_id: 4)
  for (const student of [amelia, liam]) {
    await db.parentStudent.upsert({
      where: { parent_id_student_id: { parent_id: parent.id, student_id: student.id } },
      create: { parent_id: parent.id, student_id: student.id, relationship: 'parent', is_primary_contact: true },
      update: {},
    });
  }

  const base = process.env.PORTAL_BASE_URL ?? 'http://localhost:3000';
  console.log('Seed complete!\n');
  console.log('Test accounts:');
  console.log(`  Admin (Discord stub):  visit ${base}/login and use Discord login`);
  console.log(`  Parent invite link:    ${base}/auth/invite?token=${inviteToken}`);
  console.log(`  Parent email:          sarah.tran@example.com`);
  console.log(`  (After activating via invite link, use the email + your chosen password to log in)\n`);
}

main()
  .then(() => db.$disconnect())
  .catch((e) => { console.error(e); db.$disconnect(); process.exit(1); });
