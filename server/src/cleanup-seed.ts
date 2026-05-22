/**
 * cleanup-seed.ts
 *
 * Removes all mock/seed data from the database so the Discord bot
 * can populate it with real data from the Ryze Education server.
 *
 * Run with:  npx ts-node src/cleanup-seed.ts
 *
 * After running this:
 *   1. Go to Discord → type /scan_members  → populates real users
 *   2. Go to Discord → type /discover_classes → populates real classes from Google Calendar
 *   3. Go to Discord → type /sync_calendar → populates real lessons
 */

import 'dotenv/config';
import { db } from './prisma';

async function main() {
  console.log('\n🧹  Cleaning mock seed data from database…\n');

  // Delete in dependency order (children before parents)

  const auditLogs = await db.auditLog.deleteMany({});
  console.log(`  ✔  Audit log entries deleted:   ${auditLogs.count}`);

  const alerts = await db.alert.deleteMany({});
  console.log(`  ✔  Alerts deleted:              ${alerts.count}`);

  const announcements = await db.announcement.deleteMany({});
  console.log(`  ✔  Announcements deleted:       ${announcements.count}`);

  const resources = await db.lessonResource.deleteMany({});
  console.log(`  ✔  Resources deleted:           ${resources.count}`);

  const homeworkSubmissions = await db.homeworkSubmission.deleteMany({});
  console.log(`  ✔  Homework submissions deleted:${homeworkSubmissions.count}`);

  const homework = await db.homework.deleteMany({});
  console.log(`  ✔  Homework tasks deleted:      ${homework.count}`);

  const progressReports = await db.progressReport.deleteMany({});
  console.log(`  ✔  Progress reports deleted:    ${progressReports.count}`);

  const tutorPaymentItems = await db.tutorPaymentItem.deleteMany({});
  console.log(`  ✔  Tutor payment items deleted: ${tutorPaymentItems.count}`);

  const tutorPayments = await db.tutorPayment.deleteMany({});
  console.log(`  ✔  Tutor payments deleted:      ${tutorPayments.count}`);

  const studentPayments = await db.studentPayment.deleteMany({});
  console.log(`  ✔  Student payments deleted:    ${studentPayments.count}`);

  const attendance = await db.attendance.deleteMany({});
  console.log(`  ✔  Attendance records deleted:  ${attendance.count}`);

  const lessons = await db.lesson.deleteMany({});
  console.log(`  ✔  Lessons deleted:             ${lessons.count}`);

  const parentStudents = await db.parentStudent.deleteMany({});
  console.log(`  ✔  Parent-student links deleted:${parentStudents.count}`);

  const parents = await db.parent.deleteMany({});
  console.log(`  ✔  Parents deleted:             ${parents.count}`);

  const enrolments = await db.classEnrollment.deleteMany({});
  console.log(`  ✔  Enrolments deleted:          ${enrolments.count}`);

  const classes = await db.classGroup.deleteMany({});
  console.log(`  ✔  Classes deleted:             ${classes.count}`);

  const tutorProfiles = await db.tutorProfile.deleteMany({});
  console.log(`  ✔  Tutor profiles deleted:      ${tutorProfiles.count}`);

  const studentProfiles = await db.studentProfile.deleteMany({});
  console.log(`  ✔  Student profiles deleted:    ${studentProfiles.count}`);

  const users = await db.user.deleteMany({});
  console.log(`  ✔  Users deleted:               ${users.count}`);

  console.log('\n✅  Database cleared.\n');
  console.log('Next steps — run these slash commands in your Discord server:');
  console.log('');
  console.log('  /scan_members      → scans all guild members → creates real admin/tutor/student records');
  console.log('  /discover_classes  → scans Google Calendar → creates real class groups + Discord channels');
  console.log('  /sync_calendar     → pulls lessons from Google Calendar into each class');
  console.log('');
  console.log('The bot runs /scan_members automatically on startup and every 6 hours.');
  console.log('Payments, reports, homework, and parents are entered through the Admin Portal.\n');
}

main()
  .then(() => db.$disconnect())
  .catch((e) => {
    console.error('Cleanup failed:', e);
    db.$disconnect();
    process.exit(1);
  });
