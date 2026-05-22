/**
 * Login.tsx — Unified portal login page.
 *
 * Routes:
 *   /login     → shown to everyone (student/tutor/admin via Discord, parent via email)
 *   /admin     → same page; pre-selects the "admin" path (still Discord OAuth)
 *
 * Auth flows:
 *   • Discord OAuth (students / tutors / admins)
 *       1. Click "Login with Discord"
 *       2. Redirect to Discord → redirected back to /auth/discord/callback?code=XXX
 *       3. DiscordCallback component exchanges the code for a JWT
 *   • Parent email + password
 *       1. Enter email + password → POST /auth/parent/login → JWT stored → redirect
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  MessageSquare,
  Users,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { AuthService } from '../services/auth';

// Discord brand colour
const DISCORD_COLOUR = '#5865F2';

type LoginTab = 'discord' | 'parent';

const Login: React.FC = () => {
  const { loginParent, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // If redirected here with a "from" location, go back there after login
  const from: string = (location.state as any)?.from?.pathname ?? '/dashboard';

  const [tab, setTab] = useState<LoginTab>('discord');

  // Parent form state
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]     = useState('');
  const [discordLoading, setDiscordLoading] = useState(false);
  const [parentLoading, setParentLoading]   = useState(false);

  // Pick up any auth error forwarded from DiscordCallback via router state
  useEffect(() => {
    const authError = (location.state as any)?.authError;
    if (authError) {
      setError(authError);
      // Clear it from router state so it doesn't reappear on back-navigation
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Discord login ─────────────────────────────────────────────────────── //
  const handleDiscordLogin = async () => {
    setDiscordLoading(true);
    setError('');
    try {
      await AuthService.redirectToDiscord();
      // Page will navigate away — no need to reset loading
    } catch (err: any) {
      setError(err?.message ?? 'Failed to connect to Discord. Please try again.');
      setDiscordLoading(false);
    }
  };

  // ── Parent email login ────────────────────────────────────────────────── //
  const handleParentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setParentLoading(true);
    setError('');
    try {
      await loginParent(email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err?.message ?? 'Invalid email or password.');
    } finally {
      setParentLoading(false);
    }
  };

  const busy = isLoading || discordLoading || parentLoading;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-transparent ryze-text-inverse font-sans selection:bg-[#FFB000] selection:ryze-text-primary py-12 md:py-0"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Back to home */}
      <Link
        to="/"
        className="absolute top-6 left-6 md:top-8 md:left-8 z-20 flex items-center gap-2 ryze-text-muted hover:ryze-text-inverse transition-colors font-medium group text-sm"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        <span>Back to Home</span>
      </Link>

      <div className="relative z-10 w-full max-w-md px-4 md:px-0">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <img
            src="https://res.cloudinary.com/dsvjhemjd/image/upload/f_auto,q_auto:good,c_limit,w_320,dpr_auto/v1764105292/yellow_logo_png_bvs11z.png"
            alt="Ryze Education"
            className="h-10 w-auto mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold ryze-text-inverse">Portal Login</h1>
          <p className="ryze-text-muted text-sm mt-1">Sign in to your Ryze Education account</p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#0a0f1e] border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Tabs */}
          <div className="flex border-b border-white/10">
            <button
              onClick={() => { setTab('discord'); setError(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-all ${
                tab === 'discord'
                  ? 'text-[#5865F2] border-b-2 border-[#5865F2] bg-[#5865F2]/5'
                  : 'ryze-text-muted hover:ryze-text-inverse'
              }`}
            >
              <MessageSquare size={16} />
              Student / Tutor / Admin
            </button>
            <button
              onClick={() => { setTab('parent'); setError(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-all ${
                tab === 'parent'
                  ? 'text-[#a855f7] border-b-2 border-[#a855f7] bg-[#a855f7]/5'
                  : 'ryze-text-muted hover:ryze-text-inverse'
              }`}
            >
              <Users size={16} />
              Parent
            </button>
          </div>

          <div className="p-8">
            {/* Error banner */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-3"
                >
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {/* ── Discord tab ── */}
              {tab === 'discord' && (
                <motion.div
                  key="discord"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-6"
                >
                  <div className="text-center space-y-2">
                    <p className="ryze-text-muted text-sm leading-relaxed">
                      All Ryze classes take place on Discord. Sign in with your Discord
                      account to access the portal.
                    </p>
                  </div>

                  <button
                    onClick={handleDiscordLogin}
                    disabled={busy}
                    className="w-full flex items-center justify-center gap-3 py-4 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-70 disabled:cursor-not-allowed hover:opacity-90 active:scale-[0.98]"
                    style={{ backgroundColor: DISCORD_COLOUR }}
                  >
                    {discordLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        {/* Discord logo SVG */}
                        <svg width="20" height="20" viewBox="0 0 71 55" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M60.1045 4.8978C55.5792 2.8214 50.7265 1.2916 45.6527 0.41542C45.5603 0.39851 45.468 0.440769 45.4204 0.525289C44.7963 1.6353 44.105 3.0834 43.6209 4.2216C38.1637 3.4046 32.7345 3.4046 27.3892 4.2216C26.905 3.0581 26.1886 1.6353 25.5617 0.525289C25.5141 0.443589 25.4218 0.40133 25.3294 0.41542C20.2584 1.2888 15.4057 2.8186 10.8776 4.8978C10.8384 4.9147 10.8048 4.9429 10.7825 4.9795C1.57795 18.7309 -0.943561 32.1443 0.293408 45.3914C0.299005 45.4562 0.335386 45.5182 0.385761 45.5576C6.45866 50.0174 12.3413 52.7249 18.1147 54.5195C18.2071 54.5477 18.305 54.5139 18.3638 54.4378C19.7295 52.5728 20.9469 50.6063 21.9907 48.5383C22.0523 48.4172 21.9935 48.2735 21.8676 48.2256C19.9366 47.4931 18.0979 46.6 16.3292 45.5858C16.1893 45.5041 16.1781 45.304 16.3068 45.2082C16.679 44.9293 17.0513 44.6391 17.4067 44.3461C17.471 44.2926 17.5606 44.2813 17.6362 44.3151C29.2558 49.6202 41.8354 49.6202 53.3179 44.3151C53.3935 44.2785 53.4831 44.2898 53.5502 44.3433C53.9057 44.6363 54.2779 44.9293 54.6529 45.2082C54.7816 45.304 54.7732 45.5041 54.6333 45.5858C52.8646 46.6197 51.0259 47.4931 49.0921 48.2228C48.9662 48.2707 48.9102 48.4172 48.9718 48.5383C50.038 50.6034 51.2554 52.5699 52.5959 54.435C52.6519 54.5139 52.7526 54.5477 52.845 54.5195C58.6464 52.7249 64.529 50.0174 70.6019 45.5576C70.6551 45.5182 70.6887 45.459 70.6943 45.3942C72.1747 30.0791 68.2147 16.7757 60.1968 4.9823C60.1772 4.9429 60.1437 4.9147 60.1045 4.8978ZM23.7259 37.3253C20.2276 37.3253 17.3451 34.1136 17.3451 30.1693C17.3451 26.225 20.1717 23.0133 23.7259 23.0133C27.308 23.0133 30.1626 26.2532 30.1066 30.1693C30.1066 34.1136 27.28 37.3253 23.7259 37.3253ZM47.3178 37.3253C43.8196 37.3253 40.9371 34.1136 40.9371 30.1693C40.9371 26.225 43.7636 23.0133 47.3178 23.0133C50.9 23.0133 53.7545 26.2532 53.6986 30.1693C53.6986 34.1136 50.9 37.3253 47.3178 37.3253Z" fill="white"/>
                        </svg>
                        Login with Discord
                      </>
                    )}
                  </button>

                  <p className="text-xs ryze-text-muted text-center leading-relaxed">
                    You'll be redirected to Discord to authorise access. Only Ryze
                    Education students, tutors, and admins can log in.
                  </p>
                </motion.div>
              )}

              {/* ── Parent tab ── */}
              {tab === 'parent' && (
                <motion.div
                  key="parent"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                >
                  <form onSubmit={handleParentLogin} className="space-y-5">
                    <div>
                      <label className="block text-[10px] font-bold ryze-text-muted uppercase tracking-widest mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail
                          size={16}
                          className="absolute left-4 top-1/2 -translate-y-1/2 ryze-text-muted pointer-events-none"
                        />
                        <input
                          type="email"
                          required
                          autoComplete="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-11 pr-4 py-3.5 bg-[#050510] border border-white/10 rounded-xl focus:outline-none focus:border-[#a855f7]/50 focus:ring-1 focus:ring-[#a855f7]/50 transition-all text-sm ryze-text-inverse placeholder-slate-600"
                          placeholder="parent@example.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold ryze-text-muted uppercase tracking-widest mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <Lock
                          size={16}
                          className="absolute left-4 top-1/2 -translate-y-1/2 ryze-text-muted pointer-events-none"
                        />
                        <input
                          type="password"
                          required
                          autoComplete="current-password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-11 pr-4 py-3.5 bg-[#050510] border border-white/10 rounded-xl focus:outline-none focus:border-[#a855f7]/50 focus:ring-1 focus:ring-[#a855f7]/50 transition-all text-sm ryze-text-inverse placeholder-slate-600"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={busy}
                      className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-sm text-white bg-[#a855f7] hover:bg-[#9333ea] transition-all disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98] mt-2"
                    >
                      {parentLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          Sign In <ArrowRight size={16} />
                        </>
                      )}
                    </button>
                  </form>

                  <p className="text-xs ryze-text-muted text-center mt-5 leading-relaxed">
                    First time? Check your email for an invite from Ryze Education.
                    <br />
                    Need help?{' '}
                    <Link to="/contact" className="text-[#a855f7] hover:underline">
                      Contact us
                    </Link>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <p className="text-xs ryze-text-muted text-center mt-6">
          Don't have an account?{' '}
          <Link to="/contact" className="text-[#FFB000] hover:underline font-medium">
            Contact your tutor or admin
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
