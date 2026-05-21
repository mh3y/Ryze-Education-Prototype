/**
 * Ryze Education Portal — Auth Service
 *
 * Two authentication methods:
 *   1. Discord OAuth2 — students, tutors, admins
 *   2. Email + password — parents only
 *
 * JWT tokens are stored in httpOnly cookies (ryze_token / ryze_refresh).
 * The browser sends them automatically on every same-origin request.
 * For cross-origin requests (dev proxy) we use credentials: 'include'.
 *
 * Token lifecycle:
 *   - Access token  15 min  (httpOnly cookie: ryze_token)
 *   - Refresh token 30 days (httpOnly cookie: ryze_refresh)
 *   - On 401, portalFetch() automatically calls /api/auth/refresh once,
 *     then retries the original request.
 *
 * Backend endpoints:
 *   GET  /api/auth/discord/url         → Discord OAuth2 redirect URL
 *   POST /api/auth/discord/callback    → Exchange code → set cookies
 *   POST /api/auth/parent/login        → Email + password → set cookies
 *   POST /api/auth/parent/set-password → Invite token + new password → set cookies
 *   POST /api/auth/refresh             → Rotate tokens using refresh cookie
 *   POST /api/auth/logout              → Clear both cookies
 *   GET  /api/auth/me                  → Resolve current session → user info
 */

const BASE_URL: string = (import.meta as any).env?.VITE_PORTAL_API_URL ?? '';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type UserRole = 'student' | 'parent' | 'tutor' | 'admin';

/** The resolved portal user — returned from /api/auth/me */
export interface PortalUser {
  role:               UserRole;
  name:               string;
  email:              string | null;
  userId:             number | null;          // users.id (Discord-linked)
  parentProfileId:    number | null;          // parent.id (parents)
  discordUserId:      number | null;
}

interface TokenResponse {
  access_token:       string;
  role:               string;
  name:               string;
  user_id:            number | null;
  parent_profile_id:  number | null;
}

interface MeResponse {
  role:               string;
  name:               string;
  email:              string | null;
  user_id:            number | null;
  parent_profile_id:  number | null;
}

// ---------------------------------------------------------------------------
// Token refresh — shared across all API clients
// ---------------------------------------------------------------------------

let _refreshing: Promise<boolean> | null = null;

async function doRefresh(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method:      'POST',
      credentials: 'include',
      headers:     { 'Content-Type': 'application/json' },
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Deduplicated refresh — concurrent 401s share the same refresh call. */
function ensureRefresh(): Promise<boolean> {
  if (!_refreshing) {
    _refreshing = doRefresh().finally(() => { _refreshing = null; });
  }
  return _refreshing;
}

// ---------------------------------------------------------------------------
// portalFetch — shared authenticated fetch used by ALL API clients
//
// Handles:
//   • credentials: 'include' so cookies are sent on cross-origin dev requests
//   • Automatic single-attempt token refresh on 401
//   • Redirect to /login on second 401 (session truly expired)
//   • 204 No Content returns undefined
// ---------------------------------------------------------------------------

export async function portalFetch<T>(
  url: string,
  init: RequestInit = {},
): Promise<T> {
  const makeReq = () =>
    fetch(url, {
      ...init,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(init.headers ?? {}),
      },
    });

  let res = await makeReq();

  // On 401 attempt a silent token refresh, then retry once.
  if (res.status === 401) {
    const refreshed = await ensureRefresh();
    if (refreshed) {
      res = await makeReq();
    }
  }

  if (!res.ok) {
    // After a second 401 (refresh also failed) redirect to login.
    // Guard: never redirect if we are already on /login (prevents infinite reload loop
    // if the backend returns 401 during the initial session probe on app mount).
    if (res.status === 401 && window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
    let detail = res.statusText;
    try {
      const data = await res.json();
      detail = data.detail ?? detail;
    } catch { /* ignore */ }
    throw new Error(detail);
  }

  // 204 No Content — return undefined (common for DELETE endpoints).
  if (res.status === 204) return undefined as unknown as T;

  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function tokenToUser(data: TokenResponse): PortalUser {
  return {
    role:            data.role as UserRole,
    name:            data.name,
    email:           null,
    userId:          data.user_id ?? null,
    parentProfileId: data.parent_profile_id ?? null,
    discordUserId:   null,
  };
}

function meToUser(data: MeResponse): PortalUser {
  return {
    role:            data.role as UserRole,
    name:            data.name,
    email:           data.email ?? null,
    userId:          data.user_id ?? null,
    parentProfileId: data.parent_profile_id ?? null,
    discordUserId:   null,
  };
}

// ---------------------------------------------------------------------------
// AuthService
// ---------------------------------------------------------------------------

export const AuthService = {

  // ── Discord OAuth ──────────────────────────────────────────────────────── //

  /** Fetch the Discord OAuth2 authorise URL from the backend and redirect. */
  async redirectToDiscord(): Promise<void> {
    const res = await portalFetch<{ url: string }>(`${BASE_URL}/api/auth/discord/url`);
    window.location.href = res.url;
  },

  /**
   * Exchange a Discord OAuth2 code for session cookies.
   * Called by the /auth/discord/callback page after Discord redirects back.
   * Supports dev stubs: code=dev_admin, dev_tutor, dev_student.
   */
  async handleDiscordCallback(code: string): Promise<PortalUser> {
    const data = await portalFetch<TokenResponse>(`${BASE_URL}/api/auth/discord/callback`, {
      method: 'POST',
      body:   JSON.stringify({ code }),
    });
    return tokenToUser(data);
  },

  // ── Parent email / password ────────────────────────────────────────────── //

  /** Email + password login for parents. */
  async loginParent(email: string, password: string): Promise<PortalUser> {
    const data = await portalFetch<TokenResponse>(`${BASE_URL}/api/auth/parent/login`, {
      method: 'POST',
      body:   JSON.stringify({ email, password }),
    });
    return tokenToUser(data);
  },

  /**
   * Complete the invite flow — set password using the invite token.
   * Called from the /auth/invite?token=XXX page.
   */
  async setPassword(inviteToken: string, newPassword: string): Promise<PortalUser> {
    const data = await portalFetch<TokenResponse>(`${BASE_URL}/api/auth/parent/set-password`, {
      method: 'POST',
      body:   JSON.stringify({ invite_token: inviteToken, new_password: newPassword }),
    });
    return tokenToUser(data);
  },

  // ── Session ───────────────────────────────────────────────────────────── //

  /**
   * Resolve the current session cookies to a PortalUser via /api/auth/me.
   * Returns null if no valid session exists.
   * Called on every app mount to restore state across page refreshes.
   *
   * IMPORTANT: Uses plain fetch — NOT portalFetch — so that a 401 response
   * (meaning "not logged in") silently returns null instead of triggering
   * the portalFetch redirect-to-/login logic, which would cause an infinite
   * reload loop on the login page itself.
   */
  async getCurrentUser(): Promise<PortalUser | null> {
    try {
      const res = await fetch(`${BASE_URL}/api/auth/me`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) return null;
      const data = await res.json() as MeResponse;
      return meToUser(data);
    } catch {
      return null;
    }
  },

  /**
   * Clear session cookies via the server.
   * Fire-and-forget is intentional — UI clears state immediately, the
   * server call runs in background to clear the httpOnly cookies.
   */
  logout(): void {
    fetch(`${BASE_URL}/api/auth/logout`, {
      method:      'POST',
      credentials: 'include',
    }).catch(() => { /* ignore network errors on logout */ });
  },

  // ── Legacy compat shims ───────────────────────────────────────────────── //
  // Kept so existing pages still compile while they're migrated.

  /** @deprecated Use loginParent() instead. */
  async login(email: string, password: string): Promise<PortalUser> {
    return this.loginParent(email, password);
  },
};
