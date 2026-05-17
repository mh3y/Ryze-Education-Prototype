/**
 * Ryze Education Portal — Auth Service
 *
 * Two authentication methods:
 *   1. Discord OAuth2 — students, tutors, admins (they must have Discord for classes)
 *   2. Email + password — parents only (parents don't need Discord)
 *
 * JWT tokens are issued by the FastAPI backend and stored in localStorage.
 * The backend exposes:
 *   GET  /api/auth/discord/url         → Discord OAuth2 redirect URL
 *   POST /api/auth/discord/callback    → Exchange code → JWT
 *   POST /api/auth/parent/login        → Email + password → JWT
 *   POST /api/auth/parent/set-password → Invite token + new password → JWT
 *   GET  /api/auth/me                  → Resolve current token → user info
 *   POST /auth/logout              → Stateless; client discards token
 */

const BASE_URL: string = (import.meta as any).env?.VITE_PORTAL_API_URL ?? 'http://localhost:8000';
const MOCK_AUTH: boolean = String((import.meta as any).env?.VITE_MOCK_AUTH ?? '').toLowerCase() === 'true';

const TOKEN_KEY = 'ryze_portal_token';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type UserRole = 'student' | 'parent' | 'tutor' | 'admin';

/** The resolved portal user — returned from /api/auth/me */
export interface PortalUser {
  role: UserRole;
  name: string;
  email: string | null;
  userId: number | null;          // users.id (Discord-linked users)
  parentProfileId: number | null; // parent_profiles.id (parents)
  discordUserId: number | null;
}

interface TokenResponse {
  access_token: string;
  token_type: string;
  role: string;
  name: string;
  user_id: number | null;
  parent_profile_id: number | null;
}

interface MeResponse {
  role: string;
  name: string;
  email: string | null;
  user_id: number | null;
  parent_profile_id: number | null;
  discord_user_id: number | null;
}

// ---------------------------------------------------------------------------
// Dev mock helpers (used when VITE_MOCK_AUTH=true)
// ---------------------------------------------------------------------------

const MOCK_USERS: Record<string, PortalUser> = {
  admin:   { role: 'admin',   name: 'Michael Hayes', email: 'admin@ryze.edu.au',   userId: 1, parentProfileId: null, discordUserId: null },
  tutor:   { role: 'tutor',   name: 'Daniel Kwok',   email: 'tutor@ryze.edu.au',   userId: 2, parentProfileId: null, discordUserId: null },
  student: { role: 'student', name: 'Amelia Tran',   email: 'student@ryze.edu.au', userId: 3, parentProfileId: null, discordUserId: null },
  parent:  { role: 'parent',  name: 'Sarah Tran',    email: 'parent@ryze.edu.au',  userId: null, parentProfileId: 1, discordUserId: null },
};

function mockRoleFromEmail(email: string): string {
  const e = email.toLowerCase();
  if (e.includes('admin'))   return 'admin';
  if (e.includes('tutor'))   return 'tutor';
  if (e.includes('student')) return 'student';
  return 'parent';
}

function storeMockToken(role: string): void {
  localStorage.setItem(TOKEN_KEY, `mock:${role}`);
}

function parseMockToken(token: string): PortalUser | null {
  if (!token.startsWith('mock:')) return null;
  const role = token.slice(5);
  return MOCK_USERS[role] ?? null;
}

// ---------------------------------------------------------------------------
// Token storage helpers
// ---------------------------------------------------------------------------

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

function storeToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// ---------------------------------------------------------------------------
// HTTP helpers
// ---------------------------------------------------------------------------

async function authPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const data = await res.json();
      detail = data.detail ?? detail;
    } catch { /* ignore */ }
    throw new Error(detail);
  }

  return res.json() as Promise<T>;
}

async function authGet<T>(path: string): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const data = await res.json();
      detail = data.detail ?? detail;
    } catch { /* ignore */ }
    throw new Error(detail);
  }

  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Auth API
// ---------------------------------------------------------------------------

function tokenToUser(data: TokenResponse): PortalUser {
  return {
    role: data.role as UserRole,
    name: data.name,
    email: null,
    userId: data.user_id ?? null,
    parentProfileId: data.parent_profile_id ?? null,
    discordUserId: null,
  };
}

function meToUser(data: MeResponse): PortalUser {
  return {
    role: data.role as UserRole,
    name: data.name,
    email: data.email ?? null,
    userId: data.user_id ?? null,
    parentProfileId: data.parent_profile_id ?? null,
    discordUserId: data.discord_user_id ?? null,
  };
}

export const AuthService = {
  // ── Discord OAuth ──────────────────────────────────────────────────────── //

  /** Fetch the Discord OAuth2 authorise URL from the backend and redirect. */
  async redirectToDiscord(): Promise<void> {
    if (MOCK_AUTH) {
      // In mock mode, skip Discord and go straight to callback with a mock admin code.
      // To log in as a different Discord role, visit /auth/discord/callback?code=mock_tutor etc.
      window.location.href = '/auth/discord/callback?code=mock_admin';
      return;
    }
    const res = await authGet<{ url: string }>('/api/auth/discord/url');
    window.location.href = res.url;
  },

  /**
   * Exchange a Discord OAuth2 code for a portal JWT.
   * Called by the /api/auth/discord/callback route after Discord redirects back.
   */
  async handleDiscordCallback(code: string): Promise<PortalUser> {
    if (MOCK_AUTH) {
      // code is "mock_admin", "mock_tutor", "mock_student", etc.
      const role = code.startsWith('mock_') ? code.slice(5) : 'admin';
      storeMockToken(role);
      return MOCK_USERS[role] ?? MOCK_USERS.admin;
    }
    const data = await authPost<TokenResponse>('/api/auth/discord/callback', { code });
    storeToken(data.access_token);
    return tokenToUser(data);
  },

  // ── Parent email / password ────────────────────────────────────────────── //

  /** Email + password login for parents. */
  async loginParent(email: string, password: string): Promise<PortalUser> {
    if (MOCK_AUTH) {
      // Any password accepted. Role is inferred from the email address:
      //   admin@...  → admin   |  tutor@...  → tutor
      //   student@... → student  |  anything else → parent
      const role = mockRoleFromEmail(email);
      storeMockToken(role);
      return { ...MOCK_USERS[role], email };
    }
    const data = await authPost<TokenResponse>('/api/auth/parent/login', { email, password });
    storeToken(data.access_token);
    return tokenToUser(data);
  },

  /**
   * Complete the invite flow — set password using the invite token.
   * Called from the /auth/invite?token=XXX page.
   */
  async setPassword(inviteToken: string, newPassword: string): Promise<PortalUser> {
    if (MOCK_AUTH) {
      storeMockToken('parent');
      return MOCK_USERS.parent;
    }
    const data = await authPost<TokenResponse>('/api/auth/parent/set-password', {
      invite_token: inviteToken,
      new_password: newPassword,
    });
    storeToken(data.access_token);
    return tokenToUser(data);
  },

  // ── Session ───────────────────────────────────────────────────────────── //

  /**
   * Resolve the current stored JWT to a PortalUser by calling /api/auth/me.
   * Returns null if no token or token is invalid/expired.
   */
  async getCurrentUser(): Promise<PortalUser | null> {
    const token = getToken();
    if (!token) return null;

    if (MOCK_AUTH) {
      return parseMockToken(token);
    }

    try {
      const data = await authGet<MeResponse>('/api/auth/me');
      return meToUser(data);
    } catch {
      clearToken();
      return null;
    }
  },

  /** Returns true if a JWT is stored locally (does not validate it). */
  isAuthenticated(): boolean {
    return !!getToken();
  },

  /** Clear the stored JWT. The backend is stateless so no server call needed. */
  logout(): void {
    clearToken();
  },

  // ── Legacy compat shim ────────────────────────────────────────────────── //
  // The old mock AuthService exposed login(email, password) which was used by
  // legacy portal pages (AdminLogin, TutorLogin, etc.).  Those pages are now
  // unreachable (replaced by /login), but we keep this shim so the TypeScript
  // compiler is happy while the legacy files still exist in the project.
  /** @deprecated Use loginParent() or redirectToDiscord() instead. */
  async login(email: string, password: string): Promise<PortalUser> {
    return this.loginParent(email, password);
  },
};
