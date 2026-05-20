import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../prisma';
import { signJwt } from '../auth/jwt';
import { requireAuth } from '../auth/middleware';

export const authRouter = Router();

// ── Helpers ──────────────────────────────────────────────────────────────────

function discordStubToken(role: 'admin' | 'tutor' | 'student') {
  const names: Record<string, string> = { admin: 'Admin User', tutor: 'Tutor User', student: 'Student User' };
  const token = signJwt({
    sub: `discord:0`,
    role,
    name: names[role] ?? 'User',
    email: `${role}@ryze.edu.au`,
    parent_profile_id: null,
    user_id: null,
  });
  return { access_token: token, token_type: 'bearer', role, name: names[role], user_id: null, parent_profile_id: null };
}

// ── GET /api/auth/discord/url ─────────────────────────────────────────────────
authRouter.get('/discord/url', (_req, res) => {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const redirectUri = process.env.DISCORD_REDIRECT_URI ?? 'http://localhost:3000/auth/discord/callback';
  if (!clientId) {
    // Dev stub: send straight to callback with a dev code
    res.json({ url: `${redirectUri}?code=dev_admin` });
    return;
  }
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'identify email',
  });
  res.json({ url: `https://discord.com/api/oauth2/authorize?${params}` });
});

// ── POST /api/auth/discord/callback ──────────────────────────────────────────
authRouter.post('/discord/callback', async (req, res) => {
  const { code } = req.body as { code?: string };
  if (!code) { res.status(400).json({ detail: 'code is required' }); return; }

  // Dev/mock stub
  if (code.startsWith('dev_') || code.startsWith('mock_')) {
    const rolePart = code.startsWith('dev_') ? code.slice(4) : code.slice(5);
    const role = (['admin', 'tutor', 'student'] as const).includes(rolePart as any) ? rolePart as 'admin' | 'tutor' | 'student' : 'admin';
    res.json(discordStubToken(role));
    return;
  }

  // Real Discord OAuth
  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  const redirectUri = process.env.DISCORD_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) {
    res.status(501).json({ detail: 'Discord OAuth not configured on this server. Set DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, DISCORD_REDIRECT_URI.' });
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

    let adminUser = await db.adminUser.findUnique({ where: { discord_user_id: du.id } });
    if (!adminUser) {
      adminUser = await db.adminUser.create({
        data: { discord_user_id: du.id, full_name: du.global_name ?? du.username, email: du.email ?? null, role: 'admin' },
      });
    }

    const token = signJwt({
      sub: `discord:${du.id}`,
      role: adminUser.role as 'admin' | 'tutor',
      name: adminUser.full_name,
      email: adminUser.email ?? null,
      parent_profile_id: null,
      user_id: adminUser.id,
    });
    res.json({ access_token: token, token_type: 'bearer', role: adminUser.role, name: adminUser.full_name, user_id: adminUser.id, parent_profile_id: null });
  } catch (e: any) {
    res.status(500).json({ detail: e?.message ?? 'OAuth exchange failed' });
  }
});

// ── POST /api/auth/parent/login ───────────────────────────────────────────────
authRouter.post('/parent/login', async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) { res.status(400).json({ detail: 'email and password are required' }); return; }

  const parent = await db.parent.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (!parent?.password_hash) { res.status(401).json({ detail: 'Invalid email or password' }); return; }

  const valid = await bcrypt.compare(password, parent.password_hash);
  if (!valid) { res.status(401).json({ detail: 'Invalid email or password' }); return; }

  if (!parent.active) { res.status(403).json({ detail: 'Account deactivated. Contact your admin.' }); return; }

  await db.parent.update({ where: { id: parent.id }, data: { last_login_at: new Date() } });

  const token = signJwt({
    sub: `parent:${parent.id}`,
    role: 'parent',
    name: `${parent.first_name} ${parent.last_name}`,
    email: parent.email,
    parent_profile_id: parent.id,
    user_id: null,
  });
  res.json({ access_token: token, token_type: 'bearer', role: 'parent', name: `${parent.first_name} ${parent.last_name}`, user_id: null, parent_profile_id: parent.id });
});

// ── POST /api/auth/parent/set-password ───────────────────────────────────────
authRouter.post('/parent/set-password', async (req, res) => {
  const { invite_token, new_password } = req.body as { invite_token?: string; new_password?: string };
  if (!invite_token || !new_password) { res.status(400).json({ detail: 'invite_token and new_password are required' }); return; }
  if (new_password.length < 8) { res.status(400).json({ detail: 'Password must be at least 8 characters' }); return; }

  const parent = await db.parent.findUnique({ where: { invite_token } });
  if (!parent) { res.status(400).json({ detail: 'Invalid or already-used invite link' }); return; }
  if (parent.invite_expires_at && parent.invite_expires_at < new Date()) {
    res.status(400).json({ detail: 'Invite link has expired. Ask your admin to resend it.' }); return;
  }

  const password_hash = await bcrypt.hash(new_password, 12);
  await db.parent.update({
    where: { id: parent.id },
    data: { password_hash, invite_token: null, invite_expires_at: null, invite_pending: false, has_set_password: true, last_login_at: new Date() },
  });

  const token = signJwt({
    sub: `parent:${parent.id}`,
    role: 'parent',
    name: `${parent.first_name} ${parent.last_name}`,
    email: parent.email,
    parent_profile_id: parent.id,
    user_id: null,
  });
  res.json({ access_token: token, token_type: 'bearer', role: 'parent', name: `${parent.first_name} ${parent.last_name}`, user_id: null, parent_profile_id: parent.id });
});

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
authRouter.get('/me', requireAuth, (req, res) => {
  const p = req.jwtPayload!;
  res.json({ role: p.role, name: p.name, email: p.email, user_id: p.user_id, parent_profile_id: p.parent_profile_id, discord_user_id: null });
});
