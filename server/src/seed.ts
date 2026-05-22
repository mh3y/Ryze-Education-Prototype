/**
 * Ryze Education — Comprehensive Dev/Staging Seed
 *
 * Run with:  npx ts-node src/seed.ts
 *
 * Idempotent — safe to run multiple times (uses upsert throughout).
 *
 * Admin Discord ID bootstrap:
 *   Set ADMIN_DISCORD_ID in your .env to wire your real Discord account
 *   to the admin user. Leave blank to skip (you can still log in via
 *   the ADMIN_DISCORD_IDS mechanism in auth.ts).
 */

import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { db } from './prisma';

// ── Helpers ──────────────────────────────────────────────────────────────────

function daysFromNow(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

function nextWeekday(dayOfWeek: number, hour: number, minute = 0): Date {
  // dayOfWeek: 0=Sun, 1=Mon, … 6=Sat
  const d = new Date();
  const diff = (dayOfWeek - d.getDay() + 7) % 7 || 7;
  d.setDate(d.getDate() + diff);
  d.setHours(hour, minute, 0, 0);
  return d;
}

function pastDate(daysAgo: number, hour = 17): Date {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, 0, 0, 0);
  return d;
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🌱  Seeding Ryze Education database…\n');

  const adminDiscordId = process.env.ADMIN_DISCORD_ID?.trim() || null;

  // ── 1. Users — Admin ──────────────────────────────────────────────────────

  const admin = await db.user.upsert({
    where:  { email: 'michael@ryzeeducation.com.au' },
    create: {
      full_name:       'Michael (Ryze Admin)',
      preferred_name:  'Michael',
      email:           'michael@ryzeeducation.com.au',
      role:            'admin',
      discord_user_id: adminDiscordId,
      active:          true,
    },
    update: {
      role:            'admin',
      discord_user_id: adminDiscordId ?? undefined,
    },
  });
  console.log(`  ✔  Admin:  ${admin.full_name} (id=${admin.id}${adminDiscordId ? `, discord=${adminDiscordId}` : ', no discord ID set'})`);

  // ── 2. Users — Tutors ─────────────────────────────────────────────────────

  const [daniel, priya] = await Promise.all([
    db.user.upsert({
      where:  { email: 'daniel@ryzeeducation.com.au' },
      create: { full_name: 'Daniel Kwok', email: 'daniel@ryzeeducation.com.au', role: 'tutor', active: true },
      update: {},
    }),
    db.user.upsert({
      where:  { email: 'priya@ryzeeducation.com.au' },
      create: { full_name: 'Priya Sharma', email: 'priya@ryzeeducation.com.au', role: 'tutor', active: true },
      update: {},
    }),
  ]);

  await Promise.all([
    db.tutorProfile.upsert({
      where:  { user_id: daniel.id },
      create: { user_id: daniel.id, bio: 'HSC Mathematics specialist with 5 years tutoring experience.', subjects: 'Mathematics,Extension 1,Extension 2', hourly_rate: 85 },
      update: {},
    }),
    db.tutorProfile.upsert({
      where:  { user_id: priya.id },
      create: { user_id: priya.id, bio: 'Primary and junior maths specialist.', subjects: 'Mathematics,Primary Maths', hourly_rate: 75 },
      update: {},
    }),
  ]);
  console.log(`  ✔  Tutors: ${daniel.full_name}, ${priya.full_name}`);

  // ── 3. Users — Students ───────────────────────────────────────────────────

  const studentData = [
    { email: 'amelia.tran@student.ryze',   full_name: 'Amelia Tran',    year_level: 'Year 12', school: 'Sydney Girls High School' },
    { email: 'liam.chen@student.ryze',     full_name: 'Liam Chen',      year_level: 'Year 12', school: 'James Ruse Agricultural High School' },
    { email: 'noah.park@student.ryze',     full_name: 'Noah Park',      year_level: 'Year 11', school: 'North Sydney Boys High School' },
    { email: 'zara.ibrahim@student.ryze',  full_name: 'Zara Ibrahim',   year_level: 'Year 10', school: 'Pymble Ladies College' },
    { email: 'ethan.wu@student.ryze',      full_name: 'Ethan Wu',       year_level: 'Year 9',  school: 'Shore School' },
    { email: 'olivia.lee@student.ryze',    full_name: 'Olivia Lee',     year_level: 'Year 7',  school: 'Strathfield Girls High School' },
  ];

  const students = await Promise.all(
    studentData.map(({ email, full_name, year_level, school }) =>
      db.user.upsert({
        where:  { email },
        create: {
          email, full_name, role: 'student', active: true,
          student_profile: { create: { year_level, school } },
        },
        update: {},
      })
    )
  );
  const [amelia, liam, noah, zara, ethan, olivia] = students;
  console.log(`  ✔  Students: ${students.map(s => s.full_name).join(', ')}`);

  // ── 4. Class Groups ───────────────────────────────────────────────────────

  const [ext1Class, advClass, yr10Class, primaryClass] = await Promise.all([
    db.classGroup.upsert({
      where:  { id: 1 },
      create: {
        id: 1, name: 'Year 12 Extension 1 Maths', subject: 'Mathematics Extension 1',
        year_level: 'Year 12', schedule: 'Tuesdays 5:00 PM', schedule_day: 2,
        schedule_hour: 17, duration_min: 90, max_students: 8,
        description: 'HSC Extension 1 Mathematics — focus on exam technique and hard problems.',
        tutor_id: daniel.id, active: true,
      },
      update: {},
    }),
    db.classGroup.upsert({
      where:  { id: 2 },
      create: {
        id: 2, name: 'Year 12 Advanced Maths', subject: 'Mathematics Advanced',
        year_level: 'Year 12', schedule: 'Thursdays 5:00 PM', schedule_day: 4,
        schedule_hour: 17, duration_min: 90, max_students: 8,
        description: 'HSC Advanced Mathematics — covering all Band 6 content.',
        tutor_id: daniel.id, active: true,
      },
      update: {},
    }),
    db.classGroup.upsert({
      where:  { id: 3 },
      create: {
        id: 3, name: 'Year 10 Maths', subject: 'Mathematics',
        year_level: 'Year 10', schedule: 'Wednesdays 4:00 PM', schedule_day: 3,
        schedule_hour: 16, duration_min: 60, max_students: 6,
        tutor_id: priya.id, active: true,
      },
      update: {},
    }),
    db.classGroup.upsert({
      where:  { id: 4 },
      create: {
        id: 4, name: 'Year 7 Foundations Maths', subject: 'Mathematics',
        year_level: 'Year 7', schedule: 'Saturdays 10:00 AM', schedule_day: 6,
        schedule_hour: 10, duration_min: 60, max_students: 6,
        tutor_id: priya.id, active: true,
      },
      update: {},
    }),
  ]);
  console.log(`  ✔  Classes: 4 created`);

  // ── 5. Enrolments ─────────────────────────────────────────────────────────

  const enrolments: { student_id: number; class_id: number }[] = [
    { student_id: amelia.id, class_id: ext1Class.id },
    { student_id: liam.id,   class_id: ext1Class.id },
    { student_id: noah.id,   class_id: advClass.id  },
    { student_id: zara.id,   class_id: yr10Class.id },
    { student_id: ethan.id,  class_id: yr10Class.id },
    { student_id: olivia.id, class_id: primaryClass.id },
  ];

  await Promise.all(
    enrolments.map(({ student_id, class_id }) =>
      db.classEnrollment.upsert({
        where:  { student_id_class_id: { student_id, class_id } },
        create: { student_id, class_id, active: true },
        update: {},
      })
    )
  );
  console.log(`  ✔  Enrolments: ${enrolments.length} created`);

  // ── 6. Lessons — upcoming ─────────────────────────────────────────────────

  const upcomingLessons = [
    { id: 1,  class_id: ext1Class.id,   title: 'Complex Numbers — Argand Diagram & Modulus',   scheduled_at: nextWeekday(2, 17), duration_min: 90 },
    { id: 2,  class_id: advClass.id,    title: 'Calculus — Integration by Substitution',        scheduled_at: nextWeekday(4, 17), duration_min: 90 },
    { id: 3,  class_id: yr10Class.id,   title: 'Trigonometry — Sine and Cosine Rules',          scheduled_at: nextWeekday(3, 16), duration_min: 60 },
    { id: 4,  class_id: primaryClass.id,title: 'Fractions — Adding & Subtracting',              scheduled_at: nextWeekday(6, 10), duration_min: 60 },
    { id: 5,  class_id: ext1Class.id,   title: 'Polynomials — Factor Theorem',                  scheduled_at: daysFromNow(8),     duration_min: 90 },
    { id: 6,  class_id: advClass.id,    title: 'Statistics — Normal Distribution',              scheduled_at: daysFromNow(10),    duration_min: 90 },
  ];

  // past lessons
  const pastLessons = [
    { id: 7,  class_id: ext1Class.id,   title: 'Binomial Theorem',                              scheduled_at: pastDate(7),  duration_min: 90,  status: 'completed' as const },
    { id: 8,  class_id: advClass.id,    title: 'Differential Equations — Introduction',         scheduled_at: pastDate(10), duration_min: 90,  status: 'completed' as const },
    { id: 9,  class_id: yr10Class.id,   title: 'Algebra — Linear Equations Review',             scheduled_at: pastDate(7),  duration_min: 60,  status: 'completed' as const },
    { id: 10, class_id: ext1Class.id,   title: 'Mathematical Induction',                        scheduled_at: pastDate(14), duration_min: 90,  status: 'completed' as const },
  ];

  const allLessons = [...upcomingLessons, ...pastLessons];
  await Promise.all(
    allLessons.map(({ id, class_id, title, scheduled_at, duration_min, status }) =>
      db.lesson.upsert({
        where:  { id },
        create: { id, class_id, title, scheduled_at, duration_min, status: status ?? 'scheduled', meet_link: 'https://meet.google.com/ryze-class' },
        update: {},
      })
    )
  );
  console.log(`  ✔  Lessons: ${allLessons.length} created (${upcomingLessons.length} upcoming, ${pastLessons.length} past)`);

  // ── 7. Attendance — for past lessons ─────────────────────────────────────

  const attendanceRecords = [
    // Lesson 7: Binomial Theorem (ext1 class — amelia + liam)
    { lesson_id: 7, student_id: amelia.id, status: 'present' as const },
    { lesson_id: 7, student_id: liam.id,   status: 'present' as const },
    // Lesson 8: Differential Equations (adv class — noah)
    { lesson_id: 8, student_id: noah.id,   status: 'late'    as const, notes: 'Arrived 10 min late' },
    // Lesson 9: Algebra review (yr10 class — zara + ethan)
    { lesson_id: 9, student_id: zara.id,   status: 'present' as const },
    { lesson_id: 9, student_id: ethan.id,  status: 'absent'  as const, notes: 'Sick — parent notified' },
    // Lesson 10: Mathematical Induction (ext1 class — amelia + liam)
    { lesson_id: 10, student_id: amelia.id, status: 'present' as const },
    { lesson_id: 10, student_id: liam.id,   status: 'excused' as const, notes: 'School excursion' },
  ];

  await Promise.all(
    attendanceRecords.map(({ lesson_id, student_id, status, notes }) =>
      db.attendance.upsert({
        where:  { lesson_id_student_id: { lesson_id, student_id } },
        create: { lesson_id, student_id, status, notes: notes ?? null },
        update: {},
      })
    )
  );
  console.log(`  ✔  Attendance: ${attendanceRecords.length} records`);

  // ── 8. Homework ───────────────────────────────────────────────────────────

  const [hw1, hw2, hw3] = await Promise.all([
    db.homework.upsert({
      where:  { id: 1 },
      create: {
        id: 1, class_id: ext1Class.id,
        title: 'Complex Numbers — Problem Set 3',
        description: 'Complete all questions from the provided worksheet.',
        due_date: daysFromNow(6),
        published: true, published_at: daysFromNow(-1),
      },
      update: {},
    }),
    db.homework.upsert({
      where:  { id: 2 },
      create: {
        id: 2, class_id: advClass.id,
        title: 'Integration Practice — Chapter 7',
        description: 'Questions 1–20 from Chapter 7, show all working.',
        due_date: daysFromNow(8),
        published: true, published_at: daysFromNow(-2),
      },
      update: {},
    }),
    db.homework.upsert({
      where:  { id: 3 },
      create: {
        id: 3, class_id: yr10Class.id,
        title: 'Trigonometry Worksheet',
        due_date: daysFromNow(5),
        published: true, published_at: daysFromNow(-1),
      },
      update: {},
    }),
  ]);

  // Homework submissions
  await Promise.all([
    db.homeworkSubmission.upsert({
      where:  { homework_id_student_id: { homework_id: hw1.id, student_id: amelia.id } },
      create: { homework_id: hw1.id, student_id: amelia.id, status: 'submitted', submitted_at: daysFromNow(-1) },
      update: {},
    }),
    db.homeworkSubmission.upsert({
      where:  { homework_id_student_id: { homework_id: hw2.id, student_id: noah.id } },
      create: { homework_id: hw2.id, student_id: noah.id, status: 'marked', score: 88, feedback: 'Great work on substitution. Review partial fractions.', submitted_at: daysFromNow(-3), marked_at: daysFromNow(-1) },
      update: {},
    }),
  ]);
  console.log(`  ✔  Homework: 3 tasks, 2 submissions`);

  // ── 9. Payments — student ─────────────────────────────────────────────────

  const studentPayments = [
    { id: 1,  student_id: amelia.id, amount_cents: 54000, description: 'Term 2 2026 — Ext 1 Maths',  due_date: daysFromNow(7),   status: 'pending'  as const, frequency: 'termly' as const },
    { id: 2,  student_id: liam.id,   amount_cents: 54000, description: 'Term 2 2026 — Ext 1 Maths',  due_date: daysFromNow(7),   status: 'pending'  as const, frequency: 'termly' as const },
    { id: 3,  student_id: noah.id,   amount_cents: 54000, description: 'Term 2 2026 — Advanced Maths', due_date: daysFromNow(-3), status: 'overdue'  as const, frequency: 'termly' as const },
    { id: 4,  student_id: zara.id,   amount_cents: 36000, description: 'Term 2 2026 — Year 10 Maths', due_date: daysFromNow(14),  status: 'paid'     as const, frequency: 'termly' as const, paid_at: daysFromNow(-5), amount_paid_cents: 36000 },
    { id: 5,  student_id: ethan.id,  amount_cents: 36000, description: 'Term 2 2026 — Year 10 Maths', due_date: daysFromNow(14),  status: 'pending'  as const, frequency: 'termly' as const },
    { id: 6,  student_id: olivia.id, amount_cents: 36000, description: 'Term 2 2026 — Year 7 Maths',  due_date: daysFromNow(21),  status: 'pending'  as const, frequency: 'termly' as const },
  ];

  await Promise.all(
    studentPayments.map(({ id, student_id, amount_cents, description, due_date, status, frequency, paid_at, amount_paid_cents }) =>
      db.studentPayment.upsert({
        where:  { id },
        create: { id, student_id, amount_cents, amount_paid_cents: amount_paid_cents ?? 0, description, due_date, status, frequency, paid_at: paid_at ?? null },
        update: {},
      })
    )
  );
  console.log(`  ✔  Student payments: ${studentPayments.length} records`);

  // ── 10. Tutor payments ────────────────────────────────────────────────────

  const tutorProfile1 = await db.tutorProfile.findUnique({ where: { user_id: daniel.id } });
  const tutorProfile2 = await db.tutorProfile.findUnique({ where: { user_id: priya.id } });

  if (tutorProfile1) {
    const tp = await db.tutorPayment.upsert({
      where:  { id: 1 },
      create: { id: 1, tutor_id: tutorProfile1.id, amount_cents: 340000, description: 'Term 1 2026 — All classes', period: 'Term 1 2026', status: 'paid', paid_at: daysFromNow(-30) },
      update: {},
    });
    await db.tutorPaymentItem.upsert({
      where:  { id: 1 },
      create: { id: 1, payment_id: tp.id, class_id: ext1Class.id, description: 'Ext 1 Maths — 10 sessions', hours: 15, rate_cents: 8500, amount_cents: 127500 },
      update: {},
    });
  }
  if (tutorProfile2) {
    await db.tutorPayment.upsert({
      where:  { id: 2 },
      create: { id: 2, tutor_id: tutorProfile2.id, amount_cents: 180000, description: 'Term 1 2026 — Junior classes', period: 'Term 1 2026', status: 'pending' },
      update: {},
    });
  }
  console.log(`  ✔  Tutor payments: 2 records`);

  // ── 11. Progress reports ──────────────────────────────────────────────────

  const reports = [
    { id: 1, student_id: amelia.id, class_id: ext1Class.id, period: 'Term 1 2026', score: 91, grade: 'A', strengths: 'Exceptional algebraic manipulation and exam technique. Consistently working at E4 level.', improvements: 'Integration techniques — needs more practice with by-parts.', status: 'published' },
    { id: 2, student_id: liam.id,   class_id: ext1Class.id, period: 'Term 1 2026', score: 78, grade: 'B+', strengths: 'Strong problem-solving approach and shows good mathematical reasoning.', improvements: 'Needs to work on speed — timing is tight in exam conditions.', status: 'published' },
    { id: 3, student_id: noah.id,   class_id: advClass.id,  period: 'Term 1 2026', score: 84, grade: 'A-', strengths: 'Good conceptual understanding across all topics.', improvements: 'Statistics section needs revision.', status: 'published' },
  ];

  await Promise.all(
    reports.map(({ id, student_id, class_id, period, score, grade, strengths, improvements, status }) =>
      db.progressReport.upsert({
        where:  { id },
        create: { id, student_id, class_id, period, score, grade, strengths, improvements, status, published_at: daysFromNow(-14) },
        update: {},
      })
    )
  );
  console.log(`  ✔  Progress reports: ${reports.length} published`);

  // ── 12. Parents ───────────────────────────────────────────────────────────

  const parentHash = await bcrypt.hash('parent123', 12);

  const [sarah, david, karen] = await Promise.all([
    db.parent.upsert({
      where:  { email: 'sarah.tran@example.com' },
      create: { first_name: 'Sarah', last_name: 'Tran',   email: 'sarah.tran@example.com',  phone: '0412 345 678', password_hash: parentHash, has_set_password: true, invite_pending: false, active: true },
      update: {},
    }),
    db.parent.upsert({
      where:  { email: 'david.chen@example.com' },
      create: { first_name: 'David', last_name: 'Chen',   email: 'david.chen@example.com',  phone: '0423 456 789', password_hash: parentHash, has_set_password: true, invite_pending: false, active: true },
      update: {},
    }),
    db.parent.upsert({
      where:  { email: 'karen.wu@example.com' },
      create: { first_name: 'Karen', last_name: 'Wu',     email: 'karen.wu@example.com',    phone: '0434 567 890', invite_pending: true, has_set_password: false, active: true },
      update: {},
    }),
  ]);

  await Promise.all([
    db.parentStudent.upsert({ where: { parent_id_student_id: { parent_id: sarah.id, student_id: amelia.id } }, create: { parent_id: sarah.id, student_id: amelia.id }, update: {} }),
    db.parentStudent.upsert({ where: { parent_id_student_id: { parent_id: david.id, student_id: liam.id }   }, create: { parent_id: david.id, student_id: liam.id   }, update: {} }),
    db.parentStudent.upsert({ where: { parent_id_student_id: { parent_id: karen.id, student_id: ethan.id }  }, create: { parent_id: karen.id, student_id: ethan.id  }, update: {} }),
  ]);
  console.log(`  ✔  Parents: ${[sarah, david, karen].map(p => `${p.first_name} ${p.last_name}`).join(', ')}`);

  // ── 13. Announcements ─────────────────────────────────────────────────────

  await Promise.all([
    db.announcement.upsert({
      where:  { id: 1 },
      create: {
        id: 1, title: 'Term 2 2026 Schedule Now Live',
        body: 'All Term 2 lessons have been added to the schedule. Please check your class calendar for times.',
        author_id: admin.id, audience: 'all', published: true, published_at: daysFromNow(-3),
      },
      update: {},
    }),
    db.announcement.upsert({
      where:  { id: 2 },
      create: {
        id: 2, title: 'Trial Lesson Offer — Year 9 & 10',
        body: 'We are offering free 30-minute trial lessons for Year 9 and 10 students this term. Contact us to book.',
        author_id: admin.id, audience: 'all', published: true, published_at: daysFromNow(-7), pinned: true,
      },
      update: {},
    }),
  ]);
  console.log(`  ✔  Announcements: 2 published`);

  // ── 14. Resources ─────────────────────────────────────────────────────────

  await Promise.all([
    db.lessonResource.upsert({
      where:  { id: 1 },
      create: { id: 1, class_id: ext1Class.id, title: 'HSC Extension 1 Formula Sheet', resource_type: 'document', external_url: 'https://educationstandards.nsw.edu.au/', audience: 'enrolled' },
      update: {},
    }),
    db.lessonResource.upsert({
      where:  { id: 2 },
      create: { id: 2, class_id: advClass.id,  title: 'Advanced Maths Study Notes — Calculus', resource_type: 'document', external_url: 'https://educationstandards.nsw.edu.au/', audience: 'enrolled' },
      update: {},
    }),
    db.lessonResource.upsert({
      where:  { id: 3 },
      create: { id: 3, class_id: ext1Class.id, title: 'Past Paper — 2024 HSC Extension 1', resource_type: 'document', external_url: 'https://educationstandards.nsw.edu.au/', audience: 'enrolled' },
      update: {},
    }),
  ]);
  console.log(`  ✔  Resources: 3 created`);

  // ── 15. Alerts ────────────────────────────────────────────────────────────

  await Promise.all([
    db.alert.upsert({
      where:  { id: 1 },
      create: { id: 1, alert_type: 'overdue_payment', severity: 'high', title: 'Overdue Payment — Noah Park', message: 'Noah Park has a Term 2 payment overdue by 3 days ($540.00).', related_entity_type: 'payment', related_entity_id: 3, status: 'open' },
      update: {},
    }),
    db.alert.upsert({
      where:  { id: 2 },
      create: { id: 2, alert_type: 'missing_attendance', severity: 'medium', title: 'Attendance Not Marked — Year 10 Maths', message: 'Ethan Wu was absent from last week\'s session — no parent notification sent.', related_entity_type: 'student', related_entity_id: ethan.id, status: 'open' },
      update: {},
    }),
    db.alert.upsert({
      where:  { id: 3 },
      create: { id: 3, alert_type: 'pending_homework', severity: 'low', title: 'Homework Overdue — Liam Chen', message: 'Liam Chen has not submitted Complex Numbers Problem Set 3 (due in 2 days).', related_entity_type: 'student', related_entity_id: liam.id, status: 'open' },
      update: {},
    }),
  ]);
  console.log(`  ✔  Alerts: 3 open alerts`);

  // ── 16. Audit log ─────────────────────────────────────────────────────────

  await Promise.all([
    db.auditLog.upsert({
      where:  { id: 1 },
      create: { id: 1, actor_id: admin.id, actor_type: 'user', actor_name: 'Michael', action: 'create', entity_type: 'student', entity_id: String(amelia.id), entity_name: 'Amelia Tran' },
      update: {},
    }),
    db.auditLog.upsert({
      where:  { id: 2 },
      create: { id: 2, actor_id: admin.id, actor_type: 'user', actor_name: 'Michael', action: 'publish', entity_type: 'report', entity_id: '1', entity_name: 'Progress Report — Amelia Tran' },
      update: {},
    }),
    db.auditLog.upsert({
      where:  { id: 3 },
      create: { id: 3, actor_id: admin.id, actor_type: 'user', actor_name: 'Michael', action: 'create', entity_type: 'payment', entity_id: '1', entity_name: 'Term 2 2026 — Amelia Tran' },
      update: {},
    }),
  ]);
  console.log(`  ✔  Audit log: 3 entries`);

  // ── Done ──────────────────────────────────────────────────────────────────

  console.log('\n✅  Seed complete!\n');
  console.log('Test accounts:');
  console.log('  Admin (Discord):    Log in via Discord — your Discord ID must be in ADMIN_DISCORD_IDS on Render');
  if (adminDiscordId) {
    console.log(`                      OR it is now seeded for Discord ID: ${adminDiscordId}`);
  } else {
    console.log('  ⚠️   Set ADMIN_DISCORD_ID=<your_discord_user_id> in .env before running seed');
    console.log('      to wire your Discord account to the admin user.');
  }
  console.log('\n  Parent login:       sarah.tran@example.com / parent123');
  console.log('  Parent login:       david.chen@example.com / parent123');
  console.log('\n  Run the seed:       cd server && npx ts-node src/seed.ts\n');
}

main()
  .then(() => db.$disconnect())
  .catch((e) => { console.error('Seed failed:', e); db.$disconnect(); process.exit(1); });
