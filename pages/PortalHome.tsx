
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Users, BookOpen, ArrowRight, ArrowLeft } from 'lucide-react';

const PortalHome: React.FC = () => {
  const navigate = useNavigate();

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
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-transparent text-white font-sans selection:bg-[#FFB000] selection:text-black"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Return Home */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        onClick={() => navigate('/')}
        className="absolute top-8 left-8 z-20 flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-medium group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        Back to Home
      </motion.button>

      <div className="relative z-10 w-full max-w-6xl px-4">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <img 
             src="https://res.cloudinary.com/dsvjhemjd/image/upload/v1764105292/yellow_logo_png_bvs11z.png" 
             alt="Ryze" 
             className="h-16 w-auto mx-auto mb-8"
          />
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">Select Your Portal</h1>
          <p className="text-slate-400 text-xl max-w-2xl mx-auto font-light">
            Welcome back. Please select your account type to continue.
          </p>
        </motion.div>

        {/* Role Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {roles.map((role, idx) => (
            <motion.div
              key={role.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + (idx * 0.1), duration: 0.5 }}
              whileHover={{ y: -10, scale: 1.02 }}
              onClick={() => navigate(role.path)}
              className="group cursor-pointer relative"
            >
              {/* Hover Glow Effect */}
              <div className={`absolute -inset-0.5 bg-gradient-to-b ${role.gradient} rounded-[2rem] opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-500`}></div>
              
              <div className="relative bg-[#0a0f1e] border border-white/10 rounded-[2rem] p-10 h-full flex flex-col items-center text-center hover:border-white/20 transition-colors overflow-hidden">
                 
                 {/* Icon */}
                 <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 border border-white/5">
                    <role.icon size={36} style={{ color: role.color }} />
                 </div>

                 <h3 className="text-2xl font-bold text-white mb-4">{role.title}</h3>
                 <p className="text-slate-400 mb-10 leading-relaxed flex-grow">
                   {role.description}
                 </p>

                 <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0" style={{ color: role.color }}>
                    Enter Portal <ArrowRight size={16} />
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
          className="mt-16 text-center"
        >
           <p className="text-slate-500 text-sm">
             Having trouble signing in? <button onClick={() => navigate('/contact')} className="text-[#FFB000] hover:underline">Contact Support</button>
           </p>
        </motion.div>

      </div>
    </div>
  );
};

export default PortalHome;
