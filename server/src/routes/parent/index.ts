import { Router } from 'express';
import { portalRouter } from './portal';

export const parentRouter = Router();
parentRouter.use('/', portalRouter);
