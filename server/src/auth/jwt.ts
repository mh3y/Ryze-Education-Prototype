import jwt from 'jsonwebtoken';

const SECRET       = process.env.JWT_SECRET       ?? 'ryze-dev-secret-change-in-production';
const ACCESS_TTL   = process.env.JWT_ACCESS_TTL   ?? '15m';   // short-lived access token
const REFRESH_TTL  = process.env.JWT_REFRESH_TTL  ?? '30d';   // long-lived refresh token

export interface JwtPayload {
  sub:                string;
  role:               'parent' | 'admin' | 'tutor' | 'student';
  name:               string;
  email:              string | null;
  parent_profile_id:  number | null;
  user_id:            number | null;
}

/** Short-lived access token (15 min). Stored in httpOnly cookie. */
export function signJwt(payload: JwtPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: ACCESS_TTL } as jwt.SignOptions);
}

/** Long-lived refresh token (30 days). Stored in separate httpOnly cookie. */
export function signRefreshToken(payload: Pick<JwtPayload, 'sub' | 'role' | 'user_id' | 'parent_profile_id'>): string {
  return jwt.sign({ ...payload, type: 'refresh' }, SECRET, { expiresIn: REFRESH_TTL } as jwt.SignOptions);
}

export function verifyJwt(token: string): JwtPayload {
  return jwt.verify(token, SECRET) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload & { type: string } {
  const payload = jwt.verify(token, SECRET) as any;
  if (payload.type !== 'refresh') throw new Error('Not a refresh token');
  return payload;
}

// ── Cookie helpers ────────────────────────────────────────────────────────────

const IS_PROD = process.env.NODE_ENV === 'production';

export const ACCESS_COOKIE  = 'ryze_token';
export const REFRESH_COOKIE = 'ryze_refresh';

export const cookieOptions = {
  httpOnly:  true,
  secure:    IS_PROD,           // HTTPS only in production
  // Use 'none' in production so cookies are sent on cross-origin fetch requests
  // (credentials: 'include') from the frontend domain to the API domain.
  // SameSite=Strict / Lax blocks cookies on cross-origin subresource requests,
  // which breaks auth when the API lives on a different domain (e.g. Render vs Vercel).
  // SameSite=None requires Secure=true (already enforced above in production).
  sameSite:  (IS_PROD ? 'none' : 'lax') as 'none' | 'lax',
  path:      '/',
};

export const accessCookieOptions  = { ...cookieOptions, maxAge: 15 * 60 * 1000 };           // 15 min
export const refreshCookieOptions = { ...cookieOptions, maxAge: 30 * 24 * 60 * 60 * 1000 }; // 30 days
