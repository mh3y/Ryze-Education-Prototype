import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { healthRouter } from './routes/health';
import { authRouter } from './routes/auth';
import { adminRouter } from './routes/admin';
import { parentRouter } from './routes/parent';
import { portalRouter } from './routes/portal';

const app = express();
const PORT = Number(process.env.PORT ?? 8000);

app.use(cors({ origin: process.env.CORS_ORIGIN ?? '*', credentials: true }));
app.use(express.json());

// Mount routes
app.use('/api', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);
app.use('/api/parent', parentRouter);
app.use('/api', portalRouter);

// 404
app.use((_req: Request, res: Response) => {
  res.status(404).json({ detail: 'Not found' });
});

// Global error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ detail: err.message ?? 'Internal server error' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Ryze Portal API running on :${PORT}`);
});
