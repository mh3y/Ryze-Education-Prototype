import { Request, Response, NextFunction } from 'express';
import { verifyJwt, JwtPayload, ACCESS_COOKIE } from './jwt';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      jwtPayload?: JwtPayload;
    }
  }
}

// ── Token extraction ──────────────────────────────────────────────────────────
// Prefer httpOnly cookie. Fall back to Authorization: Bearer for bot/API callers.

function extractToken(req: Request): string | null {
  const cookie = req.cookies?.[ACCESS_COOKIE];
  if (cookie) return cookie;
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) return header.slice(7);
  return null;
}

// ── requireAuth ───────────────────────────────────────────────────────────────

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token = extractToken(req);
  if (!token) {
    res.status(401).json({ detail: 'Unauthorised' });
    return;
  }
  try {
    req.jwtPayload = verifyJwt(token);
    next();
  } catch {
    res.status(401).json({ detail: 'Invalid or expired token' });
  }
}

// ── requireAdmin — admin OR tutor (read-heavy routes) ─────────────────────────
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  requireAuth(req, res, () => {
    const role = req.jwtPayload?.role;
    if (role !== 'admin' && role !== 'tutor') {
      res.status(403).json({ detail: 'Admin access required' });
      return;
    }
    next();
  });
}

// ── requireAdminOnly — ONLY admin role ────────────────────────────────────────
export function requireAdminOnly(req: Request, res: Response, next: NextFunction): void {
  requireAuth(req, res, () => {
    if (req.jwtPayload?.role !== 'admin') {
      res.status(403).json({ detail: 'Admin-only access required' });
      return;
    }
    next();
  });
}

// ── requireTutor — tutor OR admin ─────────────────────────────────────────────
export function requireTutor(req: Request, res: Response, next: NextFunction): void {
  requireAuth(req, res, () => {
    const role = req.jwtPayload?.role;
    if (role !== 'tutor' && role !== 'admin') {
      res.status(403).json({ detail: 'Tutor access required' });
      return;
    }
    next();
  });
}

// ── requireParent ─────────────────────────────────────────────────────────────
export function requireParent(req: Request, res: Response, next: NextFunction): void {
  requireAuth(req, res, () => {
    if (req.jwtPayload?.role !== 'parent') {
      res.status(403).json({ detail: 'Parent access required' });
      return;
    }
    next();
  });
}

// ── requireStudent ────────────────────────────────────────────────────────────
export function requireStudent(req: Request, res: Response, next: NextFunction): void {
  requireAuth(req, res, () => {
    if (req.jwtPayload?.role !== 'student') {
      res.status(403).json({ detail: 'Student access required' });
      return;
    }
    next();
  });
}

// ── requireBot ────────────────────────────────────────────────────────────────
// Discord bot uses a static API key passed as Bearer token (not a JWT).
export function requireBot(req: Request, res: Response, next: NextFunction): void {
  const botSecret = process.env.BOT_API_SECRET;
  if (!botSecret) {
    res.status(501).json({ detail: 'Bot API not configured (BOT_API_SECRET not set)' });
    return;
  }
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ') || header.slice(7) !== botSecret) {
    res.status(401).json({ detail: 'Invalid bot API key' });
    return;
  }
  next();
}
