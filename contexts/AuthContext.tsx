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
  /** Clear session. */
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

  // On mount — try to restore session from stored JWT.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const resolved = await AuthService.getCurrentUser();
      if (!cancelled) {
        setUser(resolved);
        setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  const loginDiscord = useCallback(async (code: string) => {
    setLoading(true);
    try {
      const u = await AuthService.handleDiscordCallback(code);
      setUser(u);
    } finally {
      setLoading(false);
    }
  }, []);

  const loginParent = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const u = await AuthService.loginParent(email, password);
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
    AuthService.logout();
    setUser(null);
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
