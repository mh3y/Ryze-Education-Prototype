import { Router } from 'express';
import { overviewRouter } from './overview';
import { parentsRouter } from './parents';
import { studentsRouter } from './students';
import { classesRouter } from './classes';
import { lessonsRouter } from './lessons';
import { attendanceRouter } from './attendance';
import { studentPaymentsRouter, tutorPaymentsRouter } from './payments';
import { progressReportsRouter } from './progress-reports';
import { homeworkRouter } from './homework';
import { announcementsRouter } from './announcements';
import { resourcesRouter } from './resources';
import { auditRouter } from './audit';

export const adminRouter = Router();

adminRouter.use('/', overviewRouter);
adminRouter.use('/parents', parentsRouter);
adminRouter.use('/students', studentsRouter);
adminRouter.use('/classes', classesRouter);
adminRouter.use('/lessons', lessonsRouter);
adminRouter.use('/attendance', attendanceRouter);
adminRouter.use('/', studentPaymentsRouter);
adminRouter.use('/', tutorPaymentsRouter);
adminRouter.use('/progress-reports', progressReportsRouter);
adminRouter.use('/homework', homeworkRouter);
adminRouter.use('/announcements', announcementsRouter);
adminRouter.use('/resources', resourcesRouter);
adminRouter.use('/', auditRouter);
