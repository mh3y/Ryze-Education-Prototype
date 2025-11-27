
import React, { useState } from 'react';
import { ArrowLeft, Lock, Mail, ArrowRight, BookOpen, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { AuthService } from '../services/auth';

const TutorLogin: React.FC = () => {
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
      setError('Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-transparent text-slate-300 font-sans selection:bg-[#3b82f6] selection:text-white"
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
               <div className="w-16 h-16 bg-[#3b82f6]/10 rounded-2xl flex items-center justify-center text-[#3b82f6] mx-auto mb-6 border border-[#3b82f6]/20">
                  <BookOpen size={32} />
               </div>
               <h1 className="text-2xl font-bold text-white mb-2">{t("Tutor Workspace")}</h1>
               <p className="text-sm text-slate-500">{t("Access class management and marking tools.")}</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-3">
                <AlertCircle size={18} className="shrink-0" />
                {t(error)}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">{t("Staff ID")}</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-[#050510] border border-white/10 rounded-xl focus:outline-none focus:border-[#3b82f6]/50 focus:ring-1 focus:ring-[#3b82f6]/50 transition-all font-medium text-white placeholder-slate-600"
                    placeholder="tutor@ryze.edu.au"
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
                    className="w-full pl-11 pr-4 py-3.5 bg-[#050510] border border-white/10 rounded-xl focus:outline-none focus:border-[#3b82f6]/50 focus:ring-1 focus:ring-[#3b82f6]/50 transition-all font-medium text-white placeholder-slate-600"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-[#3b82f6] text-white font-bold text-sm py-4 rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.2)] hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] hover:bg-[#2563eb] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 mt-4"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>{t("Secure Login")} <ArrowRight size={18} /></>
                )}
              </button>
            </form>
            
            <div className="mt-8 pt-6 border-t border-white/5 text-center">
               <p className="text-xs text-slate-600">
                  {t("System access is restricted to authorised staff.")}
               </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default TutorLogin;