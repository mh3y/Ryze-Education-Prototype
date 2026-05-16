/**
 * SetPassword.tsx — Parent invite flow (first-time password setup).
 *
 * Route: /auth/invite?token=XXX
 *
 * When admin creates a parent profile, they receive a URL like:
 *   https://portal.ryzeeducation.com.au/auth/invite?token=abc123
 *
 * This page lets them set their password, after which they're logged in.
 */

import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { AuthService } from '../services/auth';

const SetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const inviteToken = searchParams.get('token') ?? '';

  const [password, setPassword]     = useState('');
  const [confirm, setConfirm]       = useState('');
  const [isLoading, setLoading]     = useState(false);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState(false);

  if (!inviteToken) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-transparent ryze-text-inverse font-sans px-6">
        <div className="bg-[#0a0f1e] border border-red-500/20 rounded-2xl p-8 max-w-md text-center shadow-xl">
          <h2 className="text-lg font-bold mb-2">Invalid Invite Link</h2>
          <p className="text-sm ryze-text-muted mb-6">
            This invite link is missing a token. Please check your email and use the
            link provided by Ryze Education.
          </p>
          <Link
            to="/login"
            className="inline-block px-6 py-3 bg-[#FFB000] text-[#050510] font-bold rounded-xl text-sm hover:bg-[#ffc133] transition-all"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      // Store token in localStorage then sync context state
      await AuthService.setPassword(inviteToken, password);
      await refreshUser();
      setSuccess(true);
      setTimeout(() => navigate('/dashboard', { replace: true }), 1500);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to set password. Your invite link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-transparent ryze-text-inverse font-sans selection:bg-[#FFB000] selection:ryze-text-primary py-12"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <div className="relative z-10 w-full max-w-md px-4 md:px-0">
        {/* Logo */}
        <div className="text-center mb-8">
          <img
            src="https://res.cloudinary.com/dsvjhemjd/image/upload/f_auto,q_auto:good,c_limit,w_320,dpr_auto/v1764105292/yellow_logo_png_bvs11z.png"
            alt="Ryze Education"
            className="h-10 w-auto mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold ryze-text-inverse">Set Your Password</h1>
          <p className="ryze-text-muted text-sm mt-1">
            Welcome to Ryze Education. Create a password to activate your parent account.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0a0f1e] border border-white/10 rounded-3xl shadow-2xl p-8"
        >
          {success ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={28} className="text-green-400" />
              </div>
              <h3 className="font-bold ryze-text-inverse mb-1">Account Activated!</h3>
              <p className="text-sm ryze-text-muted">Redirecting to your dashboard…</p>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-3">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-[10px] font-bold ryze-text-muted uppercase tracking-widest mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2 ryze-text-muted pointer-events-none"
                    />
                    <input
                      type="password"
                      required
                      minLength={8}
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 bg-[#050510] border border-white/10 rounded-xl focus:outline-none focus:border-[#a855f7]/50 focus:ring-1 focus:ring-[#a855f7]/50 transition-all text-sm ryze-text-inverse placeholder-slate-600"
                      placeholder="Minimum 8 characters"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold ryze-text-muted uppercase tracking-widest mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2 ryze-text-muted pointer-events-none"
                    />
                    <input
                      type="password"
                      required
                      autoComplete="new-password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 bg-[#050510] border border-white/10 rounded-xl focus:outline-none focus:border-[#a855f7]/50 focus:ring-1 focus:ring-[#a855f7]/50 transition-all text-sm ryze-text-inverse placeholder-slate-600"
                      placeholder="Re-enter your password"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-sm text-white bg-[#a855f7] hover:bg-[#9333ea] transition-all disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98] mt-2"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>Activate Account <ArrowRight size={16} /></>
                  )}
                </button>
              </form>

              <p className="text-xs ryze-text-muted text-center mt-6">
                Already set your password?{' '}
                <Link to="/login" className="text-[#a855f7] hover:underline">
                  Sign in here
                </Link>
              </p>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default SetPassword;
