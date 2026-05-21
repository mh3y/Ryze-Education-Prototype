/**
 * GET /api/student/portal
 *
 * Returns everything the student dashboard needs in a single request:
 * — profile (year level, school)
 * — enrolled classes with tutor and next upcoming lesson
 * — recent + open homework assignments
 * — attendance stats and last 20 records
 * — published progress reports
 */

import { Router } from 'express';
import { db } from '../../prisma';
import { requireStudent } from '../../auth/middleware';
import { attendanceRate } from '../../utils/attendance';

export const studentPortalRouter = Router();

studentPortalRouter.get('/portal', requireStudent, async (req, res) => {
  try {
    const studentId = req.jwtPayload!.user_id!;
    const now = new Date();

    const student = await db.user.findUnique({
      where: { id: studentId },
      include: {
        student_profile: true,
        enrollments: {
          where: { active: true },
          include: {
            class: {
              include: {
                tutor: { select: { id: true, full_name: true } },
                lessons: {
                  where: { scheduled_at: { gt: now }, status: { not: 'cancelled' } },
                  orderBy: { scheduled_at: 'asc' },
                  take: 1,
                },
              },
            },
          },
        },
        attendance: {
          orderBy: { lesson: { scheduled_at: 'desc' } },
          take: 20,
          include: {
            lesson: { select: { title: true, scheduled_at: true } },
          },
        },
        progress_reports: {
          where: { status: 'published' },
          orderBy: { created_at: 'desc' },
          take: 5,
          include: { class: { select: { name: true } } },
        },
      },
    });

    if (!student) { res.status(404).json({ detail: 'Student not found' }); return; }

    // Homework — find all published homework tasks for classes this student is enrolled in
    const classIds = student.enrollments.map((e: any) => e.class_id);
    const homework = await db.homework.findMany({
      where: { class_id: { in: classIds }, published: true },
      orderBy: { due_date: 'asc' },
      take: 20,
      include: { class: { select: { name: true, subject: true } } },
    });

    // Find submissions by this student for those homework tasks
    const taskIds = homework.map((h: any) => h.id);
    const submissions = await db.homeworkSubmission.findMany({
      where: { homework_id: { in: taskIds }, student_id: studentId },
    });
    const submissionsByTask = new Map(submissions.map((s: any) => [s.homework_id, s]));

    // Attendance stats (shared utility — present + late count as attended)
    const rate = attendanceRate(student.attendance.map((a: any) => a.status));

    // Next lesson across all enrolled classes
    const allNextLessons = student.enrollments
      .flatMap((e: any) => e.class.lessons.map((l: any) => ({ ...l, class_name: e.class.name, tutor_name: e.class.tutor?.full_name ?? null })))
      .sort((a: any, b: any) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());
    const nextLesson = allNextLessons[0] ?? null;

    // Open homework (not submitted yet, due in the future or recent)
    const openHomework = homework
      .filter((h: any) => !submissionsByTask.has(h.id))
      .slice(0, 10);
    const recentHomework = homework
      .filter((h: any) => submissionsByTask.has(h.id))
      .slice(0, 5);

    res.json({
      student: {
        id: student.id,
        full_name: student.full_name,
        year_level: student.student_profile?.year_level ?? null,
        school: student.student_profile?.school ?? null,
      },
      next_lesson: nextLesson
        ? {
            id: nextLesson.id,
            title: nextLesson.title,
            scheduled_at: nextLesson.scheduled_at instanceof Date
              ? nextLesson.scheduled_at.toISOString()
              : nextLesson.scheduled_at,
            class_name: nextLesson.class_name,
            tutor_name: nextLesson.tutor_name,
          }
        : null,
      classes: student.enrollments.map((e: any) => ({
        class_id: e.class_id,
        class_name: e.class.name,
        subject: e.class.subject ?? null,
        tutor_name: e.class.tutor?.full_name ?? null,
        next_lesson: e.class.lessons[0]
          ? {
              id: e.class.lessons[0].id,
              title: e.class.lessons[0].title,
              scheduled_at: e.class.lessons[0].scheduled_at instanceof Date
                ? e.class.lessons[0].scheduled_at.toISOString()
                : e.class.lessons[0].scheduled_at,
            }
          : null,
      })),
      homework: {
        open: openHomework.map((h: any) => ({
          id: h.id,
          title: h.title,
          class_name: h.class?.name ?? null,
          due_at: h.due_date instanceof Date ? h.due_date.toISOString() : (h.due_date ?? null),
        })),
        submitted: recentHomework.map((h: any) => {
          const sub = submissionsByTask.get(h.id) as any;
          return {
            id: h.id,
            title: h.title,
            class_name: h.class?.name ?? null,
            due_at: h.due_date instanceof Date ? h.due_date.toISOString() : (h.due_date ?? null),
            submitted_at: sub?.submitted_at instanceof Date ? sub.submitted_at.toISOString() : (sub?.submitted_at ?? null),
            grade: sub?.score !== null && sub?.score !== undefined ? String(sub.score) : null,
            feedback: sub?.feedback ?? null,
          };
        }),
      },
      attendance: {
        rate,
        total_lessons: student.attendance.length,
        recent: student.attendance.slice(0, 10).map((a: any) => ({
          lesson_title: a.lesson.title,
          scheduled_at: a.lesson.scheduled_at instanceof Date
            ? a.lesson.scheduled_at.toISOString()
            : a.lesson.scheduled_at,
          status: a.status,
        })),
      },
      reports: student.progress_reports.map((r: any) => ({
        id: r.id,
        period: r.period ?? null,
        score: r.score ?? null,
        grade: r.grade ?? null,
        class_name: r.class?.name ?? null,
        published_at: r.published_at instanceof Date ? r.published_at.toISOString() : (r.published_at ?? null),
      })),
    });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});

// ── POST /api/student/homework/:id/submit ─────────────────────────────────────

studentPortalRouter.post('/homework/:id/submit', requireStudent, async (req, res) => {
  try {
    const studentId  = req.jwtPayload!.user_id!;
    const homeworkId = Number(req.params.id);
    const { file_url, notes } = req.body as { file_url?: string; notes?: string };

    if (isNaN(homeworkId)) { res.status(400).json({ detail: 'Invalid homework id' }); return; }

    // Verify the homework belongs to a class this student is enrolled in
    const hw = await db.homework.findUnique({
      where: { id: homeworkId },
      include: { class: { include: { enrollments: { where: { student_id: studentId, active: true } } } } },
    });
    if (!hw) { res.status(404).json({ detail: 'Homework not found' }); return; }
    if (!hw.class.enrollments.length) {
      res.status(403).json({ detail: 'You are not enrolled in this class' });
      return;
    }

    const isLate = hw.due_date ? new Date() > hw.due_date : false;

    const submission = await db.homeworkSubmission.upsert({
      where:  { homework_id_student_id: { homework_id: homeworkId, student_id: studentId } },
      update: {
        file_url: file_url ?? undefined,
        notes:          notes ?? undefined,
        status:         isLate ? 'late' : 'submitted',
        submitted_at:   new Date(),
      },
      create: {
        homework_id:    homeworkId,
        student_id:     studentId,
        file_url: file_url ?? null,
        notes:          notes ?? null,
        status:         isLate ? 'late' : 'submitted',
        submitted_at:   new Date(),
      },
    });

    res.json({ submitted: true, submission_id: submission.id });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'Internal server error' });
  }
});
