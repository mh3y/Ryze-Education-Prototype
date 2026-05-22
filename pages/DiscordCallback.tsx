/**
 * DiscordCallback.tsx
 *
 * Handles the Discord OAuth2 redirect back to:
 *   /auth/discord/callback?code=XXX
 *
 * Flow:
 *   1. Read the `code` query param
 *   2. POST it to the backend /auth/discord/callback
 *   3. On success → redirect to /dashboard
 *   4. On failure → redirect to /login with a specific error message in
 *      router state so the login page can display it in context.
 */

import React, { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Maps raw API/OAuth error strings to user-facing messages with
 * scenario-specific guidance.
 */
function mapAuthError(raw: string): string {
  const msg = raw.toLowerCase();

  if (msg.includes('not a member') || msg.includes('not in the guild')) {
    return 'Your Discord account is not a member of the Ryze Education server. You need to join the server before you can log in.';
  }
  if (msg.includes('not linked to an approved') || msg.includes('no recognised role') || msg.includes('role')) {
    return 'Your Discord account does not have a student, tutor, or admin role in the Ryze Education server. Please ask your admin to assign you the correct role.';
  }
  if (msg.includes('deactivated')) {
    return 'Your account has been deactivated. Please contact your admin for assistance.';
  }
  if (msg.includes('cancelled') || msg.includes('denied') || msg.includes('access_denied')) {
    return 'Discord login was cancelled. Please try again.';
  }
  if (msg.includes('too many login attempts') || msg.includes('rate limit')) {
    return raw; // keep rate-limit message verbatim — it already explains the wait time
  }
  if (msg.includes('no authorisation code') || msg.includes('no authorization code')) {
    return 'No authorisation code was received from Discord. Please try logging in again.';
  }
  // Fallback for unexpected errors
  return 'Login failed. Please try again. If the problem persists, contact your admin.';
}

const DiscordCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { loginDiscord } = useAuth();
  const navigate = useNavigate();

  const attempted = useRef(false); // prevent double-invoke in React Strict Mode

  useEffect(() => {
    if (attempted.current) return;
    attempted.current = true;

    const code       = searchParams.get('code');
    const oauthError = searchParams.get('error');

    // User cancelled or denied the Discord OAuth prompt
    if (oauthError) {
      navigate('/login', {
        replace: true,
        state: { authError: mapAuthError(oauthError) },
      });
      return;
    }

    if (!code) {
      navigate('/login', {
        replace: true,
        state: { authError: mapAuthError('no authorisation code') },
      });
      return;
    }

    loginDiscord(code)
      .then(() => navigate('/dashboard', { replace: true }))
      .catch((err: any) => {
        const raw = err?.message ?? '';
        navigate('/login', {
          replace: true,
          state: { authError: mapAuthError(raw) },
        });
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Show a spinner while the exchange is in-flight
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-transparent ryze-text-inverse font-sans"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-[#5865F2]/30 border-t-[#5865F2] rounded-full animate-spin" />
        <p className="text-sm ryze-text-muted">Signing you in with Discord…</p>
      </div>
    </div>
  );
};

export default DiscordCallback;
