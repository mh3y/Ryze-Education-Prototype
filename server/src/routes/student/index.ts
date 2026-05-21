import { Router } from 'express';
import { studentPortalRouter } from './portal';

export const studentRouter = Router();

studentRouter.use('/', studentPortalRouter);
