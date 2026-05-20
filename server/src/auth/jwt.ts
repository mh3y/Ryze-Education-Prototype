import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET ?? 'ryze-dev-secret-change-in-production';
const EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '7d';

export interface JwtPayload {
  sub: string;
  role: 'parent' | 'admin' | 'tutor' | 'student';
  name: string;
  email: string | null;
  parent_profile_id: number | null;
  user_id: number | null;
}

export function signJwt(payload: JwtPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN } as jwt.SignOptions);
}

export function verifyJwt(token: string): JwtPayload {
  return jwt.verify(token, SECRET) as JwtPayload;
}
