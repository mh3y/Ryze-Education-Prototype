import { Request, Response, NextFunction } from 'express';
import { verifyJwt, JwtPayload } from './jwt';

declare global {
  namespace Express {
    interface Request {
      jwtPayload?: JwtPayload;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ detail: 'Unauthorised' });
    return;
  }
  try {
    req.jwtPayload = verifyJwt(header.slice(7));
    next();
  } catch {
    res.status(401).json({ detail: 'Invalid or expired token' });
  }
}

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

export function requireParent(req: Request, res: Response, next: NextFunction): void {
  requireAuth(req, res, () => {
    if (req.jwtPayload?.role !== 'parent') {
      res.status(403).json({ detail: 'Parent access required' });
      return;
    }
    next();
  });
}
