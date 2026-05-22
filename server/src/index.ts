import 'dotenv/config';

// ── Global error guard ────────────────────────────────────────────────────────
// Prevent unhandled promise rejections (e.g. Prisma connection errors in dev)
// from crashing the process. Log them clearly instead.
process.on('unhandledRejection', (reason) => {
  console.error('[UNHANDLED REJECTION]', reason);
  // Do NOT exit — let the request finish with a 500 returned by the route handler
});

// ── Startup environment validation ────────────────────────────────────────────
// Must run before anything else so we never start with a broken/insecure config.
(function validateEnv() {
  const IS_PROD = process.env.NODE_ENV === 'production';

  const REQUIRED_IN_PROD = [
    'DATABASE_URL',
    'DATABASE_DIRECT_URL',
    'JWT_SECRET',
    'CORS_ORIGIN',
    'PORTAL_BASE_URL',
    'DISCORD_CLIENT_ID',
    'DISCORD_CLIENT_SECRET',
    'DISCORD_REDIRECT_URI',
  ];
  const INSECURE_DEFAULTS: Record<string, string> = {
    JWT_SECRET: 'ryze-dev-secret-change-in-production',
  };

  if (IS_PROD) {
    const missing = REQUIRED_IN_PROD.filter((k) => !process.env[k]);
    if (missing.length) {
      console.error(`[STARTUP] ✖ Missing required env vars in production: ${missing.join(', ')}`);
      process.exit(1);
    }
    for (const [key, insecureVal] of Object.entries(INSECURE_DEFAULTS)) {
      if (process.env[key] === insecureVal) {
        console.error(`[STARTUP] ✖ CRITICAL SECURITY: ${key} is set to its insecure development default in production. Set a strong secret and restart.`);
        process.exit(1);
      }
    }
    console.log('[STARTUP] ✔ Environment validation passed.');
  } else {
    // Dev: emit warnings for missing variables, but don't crash
    if (!process.env.JWT_SECRET)    console.warn('[STARTUP] ⚠ JWT_SECRET not set — using insecure dev default');
    if (!process.env.DATABASE_URL)  console.warn('[STARTUP] ⚠ DATABASE_URL not set — Prisma will fail to connect');
    if (!process.env.PORTAL_BASE_URL) console.warn('[STARTUP] ⚠ PORTAL_BASE_URL not set — parent invite links will use localhost fallback');
  }
})();

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { healthRouter } from './routes/health';
import { authRouter } from './routes/auth';
import { adminRouter } from './routes/admin';
import { parentRouter } from './routes/parent';
import { studentRouter } from './routes/student';
import { tutorRouter } from './routes/tutor/index';
import { portalRouter } from './routes/portal';
import { botRouter } from './routes/bot';
import { notificationsRouter } from './routes/notifications';
import { uploadRouter } from './routes/upload';
import { messagesRouter } from './routes/messages';

const app = express();
const PORT = Number(process.env.PORT ?? 8000);

// Trust the first proxy hop (required on Render/Heroku/etc so that
// express-rate-limit and req.ip see the real client IP from X-Forwarded-For,
// not the internal load-balancer address).
app.set('trust proxy', 1);

// ── Determine allowed origin ──────────────────────────────────────────────────
// In production, CORS_ORIGIN must be the exact portal URL (no wildcard).
// We also accept the www. variant so users on either subdomain are not blocked.
// In dev, allow any origin so the local Vite dev server works without config.
const rawCorsOrigin = process.env.CORS_ORIGIN ?? '';
const corsOrigin: string | string[] | boolean = rawCorsOrigin
  ? [rawCorsOrigin, rawCorsOrigin.replace(/^https:\/\//, 'https://www.')]
  : (process.env.NODE_ENV === 'production' ? false : true);

// Security headers — must be before any route handlers
app.use(helmet({
  // Allow cross-origin resource sharing needed by the frontend
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  // Content-Security-Policy is off here — set it at the CDN/reverse-proxy level
  // since the frontend is served separately and will need its own CSP.
  contentSecurityPolicy: false,
}));

app.use(cors({
  origin: corsOrigin,
  credentials: true,        // required for httpOnly cookie exchange
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(cookieParser());
app.use(express.json());

// Mount routes
app.use('/api', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);
app.use('/api/parent', parentRouter);
app.use('/api/student', studentRouter);
app.use('/api/tutor', tutorRouter);
app.use('/api', portalRouter);
app.use('/api/bot', botRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/messages', messagesRouter);

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
