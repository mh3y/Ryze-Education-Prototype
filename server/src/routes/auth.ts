import { Router } from 'express';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import { db } from '../prisma';
import {
  signJwt, signRefreshToken, verifyRefreshToken,
  ACCESS_COOKIE, REFRESH_COOKIE,
  accessCookieOptions, refreshCookieOptions,
  JwtPayload,
} from '../auth/jwt';
import { requireAuth } from '../auth/middleware';

export const authRouter = Router();

// ── Rate limiting ─────────────────────────────────────────────────────────────

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { detail: 'Too many login attempts. Please try again in 15 minutes.' },
  skip: () => process.env.NODE_ENV === 'development', // skip in dev
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function setAuthCookies(res: any, payload: JwtPayload) {
  const accessToken  = signJwt(payload);
  const refreshToken = signRefreshToken({
    sub: payload.sub,
    role: payload.role,
    user_id: payload.user_id,
    parent_profile_id: payload.parent_profile_id,
  });
  res.cookie(ACCESS_COOKIE,  accessToken,  accessCookieOptions);
  res.cookie(REFRESH_COOKIE, refreshToken, refreshCookieOptions);
  return { access_token: accessToken };
}

function clearAuthCookies(res: any) {
  res.clearCookie(ACCESS_COOKIE,  { path: '/' });
  res.clearCookie(REFRESH_COOKIE, { path: '/' });
}

// Dev-only stub — only active when NODE_ENV !== 'production'
function discordStubPayload(role: 'admin' | 'tutor' | 'student'): JwtPayload {
  const names: Record<string, string> = { admin: 'Admin User', tutor: 'Tutor User', student: 'Student User' };
  return {
    sub: `discord:0`,
    role,
    name: names[role] ?? 'User',
    email: `${role}@ryze.edu.au`,
    parent_profile_id: null,
    user_id: null,
  };
}

// ── GET /api/auth/discord/url ─────────────────────────────────────────────────

authRouter.get('/discord/url', (_req, res) => {
  const clientId    = process.env.DISCORD_CLIENT_ID;
  const redirectUri = process.env.DISCORD_REDIRECT_URI ?? 'http://localhost:3000/auth/discord/callback';
  if (!clientId) {
    res.json({ url: `${redirectUri}?code=dev_admin` });
    return;
  }
  const params = new URLSearchParams({
    client_id: clientId, redirect_uri: redirectUri,
    response_type: 'code', scope: 'identify email',
  });
  res.json({ url: `https://discord.com/api/oauth2/authorize?${params}` });
});

// ── POST /api/auth/discord/callback ──────────────────────────────────────────

authRouter.post('/discord/callback', authLimiter, async (req, res) => {
  const { code } = req.body as { code?: string };
  if (!code) { res.status(400).json({ detail: 'code is required' }); return; }

  // Dev stub — never active in production
  if (process.env.NODE_ENV !== 'production' && (code.startsWith('dev_') || code.startsWith('mock_'))) {
    const rolePart = code.startsWith('dev_') ? code.slice(4) : code.slice(5);
    const role = (['admin', 'tutor', 'student'] as const).includes(rolePart as any)
      ? rolePart as 'admin' | 'tutor' | 'student'
      : 'admin';
    const payload = discordStubPayload(role);
    const { access_token } = setAuthCookies(res, payload);
    res.json({ access_token, role: payload.role, name: payload.name, user_id: null, parent_profile_id: null });
    return;
  }

  const clientId     = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  const redirectUri  = process.env.DISCORD_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) {
    res.status(501).json({ detail: 'Discord OAuth not configured. Set DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, DISCORD_REDIRECT_URI.' });
    return;
  }

  try {
    const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, grant_type: 'authorization_code', code, redirect_uri: redirectUri }),
    });
    if (!tokenRes.ok) throw new Error('Discord token exchange failed');
    const { access_token: discordToken } = await tokenRes.json() as { access_token: string };

    const userRes = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${discordToken}` },
    });
    if (!userRes.ok) throw new Error('Discord user fetch failed');
    const du = await userRes.json() as { id: string; username: string; global_name?: string; email?: string };

    let user = await db.user.findFirst({ where: { discord_user_id: du.id } });
    if (!user) {
      user = await db.user.create({
        data: { discord_user_id: du.id, full_name: du.global_name ?? du.username, email: du.email ?? null, role: 'student' },
      });
    }

    if (!user.active) { res.status(403).json({ detail: 'Account deactivated. Contact your admin.' }); return; }
    await db.user.update({ where: { id: user.id }, data: { last_login_at: new Date() } });

    const payload: JwtPayload = {
      sub: `discord:${du.id}`, role: user.role as 'admin' | 'tutor' | 'student',
      name: user.full_name, email: user.email ?? null,
      parent_profile_id: null, user_id: user.id,
    };
    const { access_token } = setAuthCookies(res, payload);
    res.json({ access_token, role: user.role, name: user.full_name, user_id: user.id, parent_profile_id: null });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'OAuth exchange failed' });
  }
});

// ── POST /api/auth/parent/login ───────────────────────────────────────────────

authRouter.post('/parent/login', authLimiter, async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) { res.status(400).json({ detail: 'email and password are required' }); return; }

  const parent = await db.parent.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (!parent?.password_hash) { res.status(401).json({ detail: 'Invalid email or password' }); return; }

  const valid = await bcrypt.compare(password, parent.password_hash);
  if (!valid) { res.status(401).json({ detail: 'Invalid email or password' }); return; }
  if (!parent.active) { res.status(403).json({ detail: 'Account deactivated. Contact your admin.' }); return; }

  await db.parent.update({ where: { id: parent.id }, data: { last_login_at: new Date() } });

  const payload: JwtPayload = {
    sub: `parent:${parent.id}`, role: 'parent',
    name: `${parent.first_name} ${parent.last_name}`, email: parent.email,
    parent_profile_id: parent.id, user_id: null,
  };
  const { access_token } = setAuthCookies(res, payload);
  res.json({ access_token, role: 'parent', name: payload.name, user_id: null, parent_profile_id: parent.id });
});

// ── POST /api/auth/parent/set-password ───────────────────────────────────────

authRouter.post('/parent/set-password', authLimiter, async (req, res) => {
  const { invite_token, new_password } = req.body as { invite_token?: string; new_password?: string };
  if (!invite_token || !new_password) { res.status(400).json({ detail: 'invite_token and new_password are required' }); return; }
  if (new_password.length < 8) { res.status(400).json({ detail: 'Password must be at least 8 characters' }); return; }

  const parent = await db.parent.findUnique({ where: { invite_token } });
  if (!parent) { res.status(400).json({ detail: 'Invalid or already-used invite link' }); return; }
  if (parent.invite_expires_at && parent.invite_expires_at < new Date()) {
    res.status(400).json({ detail: 'Invite link has expired. Ask your admin to resend it.' });
    return;
  }

  const password_hash = await bcrypt.hash(new_password, 12);
  await db.parent.update({
    where: { id: parent.id },
    data: { password_hash, invite_token: null, invite_expires_at: null, invite_pending: false, has_set_password: true, last_login_at: new Date() },
  });

  const payload: JwtPayload = {
    sub: `parent:${parent.id}`, role: 'parent',
    name: `${parent.first_name} ${parent.last_name}`, email: parent.email,
    parent_profile_id: parent.id, user_id: null,
  };
  const { access_token } = setAuthCookies(res, payload);
  res.json({ access_token, role: 'parent', name: payload.name, user_id: null, parent_profile_id: parent.id });
});

// ── POST /api/auth/refresh ────────────────────────────────────────────────────
// Accepts the refresh cookie, re-checks the user is still active,
// and issues a fresh pair of access + refresh tokens.

authRouter.post('/refresh', async (req, res) => {
  const refreshToken = req.cookies?.[REFRESH_COOKIE];
  if (!refreshToken) { res.status(401).json({ detail: 'No refresh token' }); return; }

  try {
    const decoded = verifyRefreshToken(refreshToken);

    // Re-check active status from DB
    let payload: JwtPayload;
    if (decoded.role === 'parent' && decoded.parent_profile_id) {
      const parent = await db.parent.findUnique({ where: { id: decoded.parent_profile_id } });
      if (!parent?.active) { clearAuthCookies(res); res.status(403).json({ detail: 'Account deactivated' }); return; }
      payload = {
        sub: decoded.sub, role: 'parent',
        name: `${parent.first_name} ${parent.last_name}`, email: parent.email,
        parent_profile_id: parent.id, user_id: null,
      };
    } else if (decoded.user_id) {
      const user = await db.user.findUnique({ where: { id: decoded.user_id } });
      if (!user?.active) { clearAuthCookies(res); res.status(403).json({ detail: 'Account deactivated' }); return; }
      payload = {
        sub: decoded.sub, role: user.role as 'admin' | 'tutor' | 'student',
        name: user.full_name, email: user.email ?? null,
        parent_profile_id: null, user_id: user.id,
      };
    } else {
      // Dev stub user (no DB record)
      payload = { sub: decoded.sub, role: decoded.role, name: decoded.name ?? 'Dev User', email: decoded.email ?? null, parent_profile_id: null, user_id: null };
    }

    const { access_token } = setAuthCookies(res, payload);
    res.json({ access_token, role: payload.role, name: payload.name });
  } catch {
    clearAuthCookies(res);
    res.status(401).json({ detail: 'Invalid or expired refresh token' });
  }
});

// ── POST /api/auth/logout ─────────────────────────────────────────────────────

authRouter.post('/logout', (_req, res) => {
  clearAuthCookies(res);
  res.json({ logged_out: true });
});

// ── GET /api/auth/me ──────────────────────────────────────────────────────────

authRouter.get('/me', requireAuth, (req, res) => {
  const p = req.jwtPayload!;
  res.json({ role: p.role, name: p.name, email: p.email, user_id: p.user_id, parent_profile_id: p.parent_profile_id });
});
