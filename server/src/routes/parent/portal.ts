import { Router } from 'express';
import { db } from '../../prisma';
import { requireParent } from '../../auth/middleware';

export const portalRouter = Router();

portalRouter.get('/portal', requireParent, async (req, res) => {
  const parentId = req.jwtPayload!.parent_profile_id!;
  const parent = await db.parent.findUnique({
    where: { id: parentId },
    include: {
      children: {
        include: {
          student: {
            include: {
              enrollments: {
                where: { active: true },
                include: {
                  class: {
                    include: {
                      lessons: { orderBy: { scheduled_at: 'asc' }, where: { scheduled_at: { gt: new Date() } }, take: 1 },
                    },
                  },
                },
              },
              attendance: {
                orderBy: { lesson: { scheduled_at: 'desc' } },
                take: 20,
                include: { lesson: { select: { title: true, scheduled_at: true } } },
              },
              reports: { orderBy: { created_at: 'desc' }, take: 3 },
              payments: { where: { status: { not: 'paid' } }, orderBy: { due_date: 'asc' } },
            },
          },
        },
      },
    },
  });

  if (!parent) { res.status(404).json({ detail: 'Parent not found' }); return; }

  const children = parent.children.map((link: any) => {
    const s = link.student;
    const total = s.attendance.length;
    const present = s.attendance.filter((a: any) => a.status === 'present').length;

    return {
      link_id: link.id,
      student_id: s.id,
      student_name: s.full_name,
      year_level: s.year_level,
      school: s.school,
      relationship: link.relationship,
      is_primary_contact: link.is_primary_contact,
      classes: s.enrollments.map((e: any) => ({
        class_id: e.class_id,
        class_name: e.class.name,
        subject: e.class.subject,
        tutor_name: e.class.tutor_name,
        next_lesson: e.class.lessons[0]
          ? { title: e.class.lessons[0].title, scheduled_at: e.class.lessons[0].scheduled_at.toISOString() }
          : null,
      })),
      attendance_rate: total > 0 ? Math.round((present / total) * 100) : null,
      recent_attendance: s.attendance.slice(0, 10).map((a: any) => ({
        lesson_title: a.lesson.title,
        scheduled_at: a.lesson.scheduled_at.toISOString(),
        status: a.status,
      })),
      latest_reports: s.reports.map((r: any) => ({
        id: r.id,
        period: r.period,
        score: r.score,
        grade: r.grade,
        created_at: r.created_at.toISOString(),
      })),
      outstanding_payments: s.payments.map((p: any) => ({
        id: p.id,
        amount: p.amount,
        description: p.description,
        due_date: p.due_date?.toISOString() ?? null,
        status: p.status,
      })),
    };
  });

  res.json({
    parent: { id: parent.id, full_name: `${parent.first_name} ${parent.last_name}`, email: parent.email },
    children,
  });
});
