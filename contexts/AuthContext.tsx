/**
 * AuthContext — global authentication state for the Ryze portal.
 *
 * Wrap the app in <AuthProvider> then consume with useAuth().
 *
 * On mount, the provider attempts to resolve the stored JWT via /auth/me so
 * the user stays logged in across page refreshes.  While resolving, isLoading
 * is true so ProtectedRoute can show a spinner instead of a flash to /login.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { AuthService, PortalUser } from '../services/auth';

// ---------------------------------------------------------------------------
// Context shape
// ---------------------------------------------------------------------------

interface AuthContextValue {
  /** Currently authenticated user, or null if unauthenticated. */
  user: PortalUser | null;
  /** True while the initial session check (or a login call) is in-flight. */
  isLoading: boolean;
  /** Convenience boolean. */
  isAuthenticated: boolean;

  /** Discord OAuth callback — exchange code for JWT. */
  loginDiscord: (code: string) => Promise<void>;
  /** Parent email + password login. */
  loginParent: (email: string, password: string) => Promise<void>;
  /**
   * Re-resolves the stored JWT via /auth/me and updates context state.
   * Use this after calling AuthService.setPassword() directly (invite flow).
   */
  refreshUser: () => Promise<void>;
  /** Clear session (calls server to clear httpOnly cookies, then clears local state). */
  logout: () => void;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const AuthContext = createContext<AuthContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser]       = useState<PortalUser | null>(null);
  const [isLoading, setLoading] = useState(true); // start true to resolve on mount

  /**
   * Tracks whether an explicit login call (loginDiscord / loginParent) has
   * already resolved a user in this session.  Used to guard against a race
   * condition where the silent mount-time getCurrentUser() probe completes
   * AFTER a login call and wipes the freshly-authenticated user with null.
   *
   * Scenario:
   *   1. App mounts on /auth/discord/callback → getCurrentUser() fires (async)
   *   2. loginDiscord(code) fires concurrently (slower — involves Discord API)
   *   3. loginDiscord wins, sets user, navigates to /dashboard
   *   4. getCurrentUser() resolves later (no cookies yet on its request) → null
   *   5. Without this guard: setUser(null) → ProtectedRoute redirects back to /login
   */
  const loginResolved = useRef(false);

  // On mount — try to restore session from stored JWT.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const resolved = await AuthService.getCurrentUser();
      if (!cancelled) {
        // Only overwrite state with null if no explicit login has already
        // resolved a user in this session.  If loginDiscord/loginParent already
        // set a user, trust that result — the probe fired before cookies existed.
        if (resolved !== null || !loginResolved.current) {
          setUser(resolved);
        }
        setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  const loginDiscord = useCallback(async (code: string) => {
    setLoading(true);
    try {
      const u = await AuthService.handleDiscordCallback(code);
      loginResolved.current = true;
      setUser(u);
    } finally {
      setLoading(false);
    }
  }, []);

  const loginParent = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const u = await AuthService.loginParent(email, password);
      loginResolved.current = true;
      setUser(u);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const resolved = await AuthService.getCurrentUser();
    setUser(resolved);
  }, []);

  const logout = useCallback(() => {
    // Clear local state immediately so the UI redirects to /login at once.
    // The server call to clear httpOnly cookies runs fire-and-forget in background.
    setUser(null);
    AuthService.logout();
  }, []);

  const value: AuthContextValue = {
    user,
    isLoading,
    isAuthenticated: !!user,
    loginDiscord,
    loginParent,
    refreshUser,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth() must be used inside <AuthProvider>');
  }
  return ctx;
}
