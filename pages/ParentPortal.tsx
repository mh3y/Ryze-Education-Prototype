
import React, { useState } from 'react';
import { ArrowLeft, Lock, Mail, ArrowRight, Users, AlertCircle } from 'lucide-react';
// @ts-ignore
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { AuthService } from '../services/auth';

const ParentPortal: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      await AuthService.login(email, password);
      navigate('/dashboard'); 
    } catch (err) {
      setError('Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-transparent text-slate-300 font-sans selection:bg-[#a855f7] selection:text-white"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Return to Portal Gateway */}
      <Link 
         to="/login" 
         className="absolute top-8 left-8 flex items-center gap-2 text-slate-500 hover:text-white transition-colors font-bold text-sm z-20"
      >
         <ArrowLeft size={16} /> {t("Back to Portal Selection")}
      </Link>

      <div className="relative z-20 w-full max-w-md px-6">
        <div className="bg-[#0a0f1e] border border-white/10 p-8 rounded-3xl shadow-2xl backdrop-blur-xl">
            <div className="text-center mb-8">
               <div className="w-16 h-16 bg-[#a855f7]/10 rounded-2xl flex items-center justify-center text-[#a855f7] mx-auto mb-6 border border-[#a855f7]/20">
                  <Users size={32} />
               </div>
               <h1 className="text-2xl font-bold text-white mb-2">{t("Parent Portal")}</h1>
               <p className="text-sm text-slate-500">{t("Manage billing, reports, and communication.")}</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-3">
                <AlertCircle size={18} className="shrink-0" />
                {t(error)}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">{t("Email Address")}</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-[#050510] border border-white/10 rounded-xl focus:outline-none focus:border-[#a855f7]/50 focus:ring-1 focus:ring-[#a855f7]/50 transition-all font-medium text-white placeholder-slate-600"
                    placeholder="parent@ryze.edu.au"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">{t("Password")}</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-[#050510] border border-white/10 rounded-xl focus:outline-none focus:border-[#a855f7]/50 focus:ring-1 focus:ring-[#a855f7]/50 transition-all font-medium text-white placeholder-slate-600"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-3 h-3 rounded border-slate-700 bg-[#050510] text-[#a855f7] focus:ring-[#a855f7]" />
                  <span className="text-slate-500 font-medium">{t("Remember me")}</span>
                </label>
                <a href="#" className="text-[#a855f7] hover:text-white transition-colors">{t("Forgot Password?")}</a>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-[#a855f7] text-white font-bold text-sm py-4 rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.2)] hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] hover:bg-[#9333ea] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 mt-4"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>{t("Sign In")} <ArrowRight size={18} /></>
                )}
              </button>
            </form>
            
            <div className="mt-8 pt-6 border-t border-white/5 text-center">
               <p className="text-xs text-slate-600">
                  {t("New to Ryze?")} <Link to="/contact" className="text-[#a855f7] hover:underline">{t("Contact Support")}</Link>
               </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ParentPortal;