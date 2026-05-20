import { Router } from 'express';
import { parentsRouter } from './parents';
import { studentsRouter } from './students';
import { overviewRouter } from './overview';

export const adminRouter = Router();

adminRouter.use('/', overviewRouter);
adminRouter.use('/parents', parentsRouter);
adminRouter.use('/students', studentsRouter);
