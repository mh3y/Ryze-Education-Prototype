import { db } from '../prisma';

async function main() {
  // Class ID=3 record
  const cls = await db.classGroup.findUnique({
    where: { id: 3 },
    include: {
      tutor: { select: { id: true, full_name: true, role: true } },
      enrollments: {
        include: { student: { select: { id: true, full_name: true, role: true } } }
      }
    }
  });
  console.log('\n=== CLASS ID=3 ===');
  console.log(JSON.stringify(cls, null, 2));

  // Lessons for class ID=3
  const lessons = await db.lesson.findMany({
    where: { class_id: 3 },
    orderBy: { scheduled_at: 'asc' }
  });
  console.log('\n=== LESSONS FOR CLASS ID=3 ===');
  console.log(JSON.stringify(lessons, null, 2));

  // All classes
  const allClasses = await db.classGroup.findMany({
    select: {
      id: true, name: true, active: true, archived_at: true,
      discord_channel_id: true, google_calendar_id: true,
      tutor_id: true
    },
    orderBy: { id: 'asc' }
  });
  console.log('\n=== ALL CLASSES ===');
  console.log(JSON.stringify(allClasses, null, 2));

  // AuditLog (entity_id is String in schema)
  const auditLogs = await db.auditLog.findMany({
    where: { entity_type: 'ClassGroup', entity_id: '3' },
    orderBy: { created_at: 'desc' },
    take: 20
  });
  console.log('\n=== AUDIT LOG FOR CLASS ID=3 ===');
  console.log(JSON.stringify(auditLogs, null, 2));

  // BotSyncLog for lessons sync (last 5)
  const syncLogs = await db.botSyncLog.findMany({
    where: { sync_type: 'lessons' },
    orderBy: { created_at: 'desc' },
    take: 5,
    select: {
      id: true, status: true, error_message: true,
      records_created: true, records_updated: true, records_failed: true,
      started_at: true, completed_at: true, created_at: true
    }
  });
  console.log('\n=== BOT SYNC LOGS (LESSONS, last 5) ===');
  console.log(JSON.stringify(syncLogs, null, 2));
}
main().catch(console.error).finally(() => db.$disconnect());
