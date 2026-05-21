import { Router } from 'express';
import { db } from '../../prisma';
import { requireParent } from '../../auth/middleware';
import { attendanceRate } from '../../utils/attendance';

export const portalRouter = Router();

portalRouter.get('/portal', requireParent, async (req, res) => {
  try {
    const parentId = req.jwtPayload!.parent_profile_id!;
    const parent = await db.parent.findUnique({
      where: { id: parentId },
      include: {
        children: {
          include: {
            student: {
              include: {
                student_profile: true,
                enrollments: {
                  where: { active: true },
                  include: {
                    class: {
                      include: {
                        tutor: { select: { full_name: true } },
                        lessons: {
                          orderBy: { scheduled_at: 'asc' },
                          where: { scheduled_at: { gt: new Date() }, status: { not: 'cancelled' } },
                          take: 20,
                        },
                      },
                    },
                  },
                },
                attendance: {
                  orderBy: { lesson: { scheduled_at: 'desc' } },
                  take: 20,
                  include: { lesson: { select: { title: true, scheduled_at: true } } },
                },
                progress_reports: { where: { status: 'published' }, orderBy: { created_at: 'desc' }, take: 3 },
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

      return {
        link_id: link.id,
        student_id: s.id,
        student_name: s.full_name,
        year_level: s.student_profile?.year_level ?? null,
        school: s.student_profile?.school ?? null,
        relationship: link.relationship,
        is_primary_contact: link.is_primary_contact,
        classes: s.enrollments.map((e: any) => ({
          class_id: e.class_id,
          class_name: e.class.name,
          subject: e.class.subject,
          tutor_name: (e.class as any).tutor?.full_name ?? null,
          next_lesson: e.class.lessons[0]
            ? {
                title: e.class.lessons[0].title,
                scheduled_at: e.class.lessons[0].scheduled_at.toISOString(),
              }
            : null,
        })),
        // Flat list of all upcoming lessons across all classes — used by CalendarPage
        upcoming_lessons: s.enrollments.flatMap((e: any) =>
          e.class.lessons.map((l: any) => ({
            id: l.id,
            title: `${e.class.name} — ${l.title}`,
            start_time: l.scheduled_at.toISOString(),
            end_time: l.duration_min
              ? new Date(l.scheduled_at.getTime() + l.duration_min * 60000).toISOString()
              : null,
            location: l.meet_link ? 'Online (Google Meet)' : null,
            meet_link: l.meet_link ?? null,
            status: l.status,
            class_name: e.class.name,
          }))
        ).sort((a: any, b: any) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()),
        // Shared attendance utility: present + late = attended
        attendance_rate: attendanceRate(s.attendance.map((a: any) => a.status)),
        recent_attendance: s.attendance.slice(0, 10).map((a: any) => ({
          lesson_title: a.lesson.title,
          scheduled_at: a.lesson.scheduled_at.toISOString(),
          status: a.status,
        })),
        latest_reports: s.progress_reports.map((r: any) => ({
          id: r.id,
          period: r.period ?? null,
          score: r.score ?? null,
          grade: r.grade ?? null,
          created_at: r.created_at.toISOString(),
        })),
        outstanding_payments: s.payments.map((p: any) => ({
          id: p.id,
          term: p.term ?? p.description ?? '',
          frequency: p.frequency,
          amount_due: p.amount_cents / 100,
          amount_paid: p.amount_paid_cents / 100,
          due_date: p.due_date?.toISOString() ?? null,
          status: p.status,
          notes: p.notes ?? null,
        })),
      };
    });

    res.json({
      parent: { id: parent.id, full_name: `${parent.first_name} ${parent.last_name}`, email: parent.email },
      children,
    });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});
