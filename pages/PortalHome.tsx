
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Users, BookOpen, ArrowRight, ArrowLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const PortalHome: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const roles = [
    {
      id: 'student',
      title: 'Student',
      description: 'Access your learning modules, assignments, and Ryze AI.',
      icon: GraduationCap,
      path: '/portal', 
      color: '#FFB000',
      gradient: 'from-orange-500 to-yellow-500'
    },
    {
      id: 'parent',
      title: 'Parent',
      description: 'View progress reports, manage billing, and contact tutors.',
      icon: Users,
      path: '/parent-portal',
      color: '#a855f7',
      gradient: 'from-purple-500 to-fuchsia-500'
    },
    {
      id: 'tutor',
      title: 'Tutor',
      description: 'Manage classes, mark assignments, and track progress.',
      icon: BookOpen,
      path: '/tutor-portal', 
      color: '#3b82f6',
      gradient: 'from-blue-500 to-cyan-500'
    }
  ];

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-transparent text-white font-sans selection:bg-[#FFB000] selection:text-black py-12 md:py-0"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Return Home */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 md:top-8 md:left-8 z-20 flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-medium group text-sm md:text-base"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        <span className="hidden md:inline">{t("Back to Home")}</span>
        <span className="md:hidden">{t("Home")}</span>
      </motion.button>

      <div className="relative z-10 w-full max-w-6xl px-4 md:px-6">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-10 md:mb-20 mt-12 md:mt-0"
        >
          <img 
             src="https://res.cloudinary.com/dsvjhemjd/image/upload/v1764105292/yellow_logo_png_bvs11z.png" 
             alt="Ryze" 
             className="h-12 md:h-16 w-auto mx-auto mb-6 md:mb-8"
          />
          <h1 className="text-3xl md:text-6xl font-bold mb-4 md:mb-6 tracking-tight">{t("Select Your Portal")}</h1>
          <p className="text-slate-400 text-base md:text-xl max-w-2xl mx-auto font-light px-4">
            {t("Welcome back. Please select your account type to continue.")}
          </p>
        </motion.div>

        {/* Role Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 max-w-lg md:max-w-none mx-auto">
          {roles.map((role, idx) => (
            <motion.div
              key={role.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + (idx * 0.1), duration: 0.5 }}
              whileHover={{ y: -5, scale: 1.02 }}
              onClick={() => navigate(role.path)}
              className="group cursor-pointer relative"
            >
              {/* Hover Glow Effect */}
              <div className={`absolute -inset-0.5 bg-gradient-to-b ${role.gradient} rounded-2xl md:rounded-[2rem] opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-500`}></div>
              
              <div className="relative bg-[#0a0f1e] border border-white/10 rounded-2xl md:rounded-[2rem] p-6 md:p-10 h-full flex flex-row md:flex-col items-center text-left md:text-center hover:border-white/20 transition-colors overflow-hidden">
                 
                 {/* Icon */}
                 <div className="w-14 h-14 md:w-20 md:h-20 rounded-xl md:rounded-2xl bg-white/5 flex items-center justify-center mb-0 md:mb-8 mr-5 md:mr-0 shrink-0 group-hover:scale-110 transition-transform duration-300 border border-white/5">
                    <role.icon size={28} className="md:w-9 md:h-9" style={{ color: role.color }} />
                 </div>

                 <div className="flex-1 min-w-0">
                    <h3 className="text-lg md:text-2xl font-bold text-white mb-1 md:mb-4">{t(role.title)}</h3>
                    <p className="text-slate-400 text-sm md:text-base md:mb-10 leading-relaxed md:block truncate md:whitespace-normal">
                      {t(role.description)}
                    </p>
                 </div>

                 {/* Mobile Chevron */}
                 <div className="md:hidden ml-4 text-slate-500 group-hover:text-white transition-colors">
                    <ChevronRight size={20} />
                 </div>

                 {/* Desktop Enter Link */}
                 <div className="hidden md:flex items-center gap-2 text-sm font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 mx-auto" style={{ color: role.color }}>
                    {t("Enter Portal")} <ArrowRight size={16} />
                 </div>

                 {/* Decor */}
                 <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-12 md:mt-16 text-center"
        >
           <p className="text-slate-500 text-xs md:text-sm">
             {t("Having trouble signing in?")} <button onClick={() => navigate('/contact')} className="text-[#FFB000] hover:underline">{t("Contact Support")}</button>
           </p>
        </motion.div>

      </div>
    </div>
  );
};

export default PortalHome;
