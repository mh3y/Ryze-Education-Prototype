/**
 * DiscordCallback.tsx
 *
 * Handles the Discord OAuth2 redirect back to:
 *   /auth/discord/callback?code=XXX
 *
 * Flow:
 *   1. Read the `code` query param
 *   2. POST it to the backend /auth/discord/callback
 *   3. Backend returns a JWT → stored via AuthContext
 *   4. Redirect to /dashboard (or wherever the user was trying to go)
 */

import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const DiscordCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { loginDiscord } = useAuth();
  const navigate = useNavigate();

  const [error, setError] = useState<string | null>(null);
  const attempted = useRef(false); // prevent double-invoke in React Strict Mode

  useEffect(() => {
    if (attempted.current) return;
    attempted.current = true;

    const code  = searchParams.get('code');
    const oauthError = searchParams.get('error');

    if (oauthError) {
      // User denied access or another OAuth error
      setError('Discord login was cancelled or denied. Please try again.');
      return;
    }

    if (!code) {
      setError('No authorisation code received from Discord.');
      return;
    }

    loginDiscord(code)
      .then(() => navigate('/dashboard', { replace: true }))
      .catch((err: any) => {
        setError(
          err?.message ??
            'Authentication failed. Please return to the login page and try again.'
        );
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (error) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center bg-transparent ryze-text-inverse font-sans px-6"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        <div className="bg-[#0a0f1e] border border-red-500/20 rounded-2xl p-8 max-w-md text-center shadow-xl">
          <div className="w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-red-400"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2 className="text-lg font-bold ryze-text-inverse mb-2">Login Failed</h2>
          <p className="text-sm ryze-text-muted mb-6 leading-relaxed">{error}</p>
          <button
            onClick={() => navigate('/login', { replace: true })}
            className="px-6 py-3 bg-[#FFB000] text-[#050510] font-bold rounded-xl text-sm hover:bg-[#ffc133] transition-all"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

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
