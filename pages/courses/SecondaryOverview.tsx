
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, ArrowRight, Brain, Calculator, GitBranch, Zap, Layers, BarChart3, GraduationCap, RefreshCw, BookOpen, PenTool, MessageCircle, Sigma, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const SecondaryOverview: React.FC = () => {
  const navigate = useNavigate();

  const secondaryCourses = [
    { name: 'Year 7 Maths', path: '/secondary/year-7-maths', desc: 'Transition' },
    { name: 'Year 8 Maths', path: '/secondary/year-8-maths', desc: 'Algebraic Foundations' },
    { name: 'Year 9 Maths', path: '/secondary/year-9-maths', desc: 'Stage 5.3 Mastery' },
    { name: 'Year 10 Maths', path: '/secondary/year-10-maths', desc: 'HSC Prep' },
    { name: 'Year 11 Maths', path: '/secondary/year-11-maths-advanced', desc: 'Preliminary Course' },
    { name: 'Year 12 Maths', path: '/secondary/year-12-maths-advanced', desc: 'HSC Excellence' },
  ];

  return (
    <div className="pt-20 font-sans bg-slate-50 min-h-screen">
      
      {/* 1. Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pt-24 pb-32 px-4 relative overflow-hidden text-white">
         <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-ryze rounded-full blur-[150px] opacity-10 pointer-events-none"></div>
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="inline-block px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-ryze text-xs font-bold uppercase tracking-widest mb-6"
               >
                 Secondary Education (Years 7-12)
               </motion.div>
               <motion.h1 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.1 }}
                 className="text-5xl md:text-7xl font-sans font-bold mb-6 tracking-tight leading-tight"
               >
                 Mastering Mathematics
               </motion.h1>
               <motion.p 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.2 }}
                 className="text-xl text-slate-300 font-light leading-relaxed mb-10 max-w-lg"
               >
                 From algebraic fluency to complex calculus. A rigorous, evidence-based approach to the HSC.
               </motion.p>
               
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.3 }}
                 className="flex flex-wrap gap-4"
               >
                  <button onClick={() => navigate('/contact')} className="px-8 py-4 bg-white text-slate-900 font-bold rounded-full hover:bg-ryze hover:text-white transition-all shadow-lg flex items-center gap-2">
                    Book Assessment <ArrowRight size={18} />
                  </button>
               </motion.div>
            </div>
            
            <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ duration: 0.8 }}
               className="relative hidden lg:block"
            >
               {/* Grid of Courses */}
               <div className="grid grid-cols-2 gap-4">
                  {secondaryCourses.map((course, idx) => (
                     <div 
                        key={idx} 
                        onClick={() => navigate(course.path)}
                        className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md cursor-pointer transition-transform hover:-translate-y-1 hover:bg-white/10 hover:border-ryze/50"
                     >
                        <div className="text-sm text-ryze opacity-80 uppercase tracking-widest mb-1">{course.desc}</div>
                        <div className="text-xl font-bold">{course.name}</div>
                        <div className="mt-4 flex justify-end"><ArrowRight size={20} className="text-slate-400" /></div>
                     </div>
                  ))}
               </div>
            </motion.div>
         </div>
      </section>

      {/* 2. Ryze Secondary Ecosystem */}
      <section className="py-24 bg-white">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-5xl font-sans font-bold text-slate-900 mb-6 text-center">
               The Secondary Roadmap
            </h2>
            <p className="text-center text-slate-500 max-w-2xl mx-auto mb-16 text-lg">
               High school mathematics is cumulative. A gap in Year 8 Algebra becomes a failure in Year 11 Calculus. We build rigour at every step.
            </p>

            <div className="relative">
               {/* Vertical Line */}
               <div className="absolute left-[20px] md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-900 to-slate-200 md:-translate-x-1/2 rounded-full"></div>

               <div className="space-y-12">
                  {[
                     { 
                        title: "Years 7-8: The Algebraic Shift", 
                        desc: "Moving from concrete numbers to abstract variables. Mastering indices, equations, and the logic of geometry.", 
                        icon: Calculator,
                        align: "left"
                     },
                     { 
                        title: "Year 9-10: Consolidation", 
                        desc: "The 'Golden Years'. Mastering Stage 5.3 content (non-linear graphs, trig, deductive geometry) to prepare for Extension courses.", 
                        icon: Layers,
                        align: "right"
                     },
                     { 
                        title: "Year 11: Preliminary Rigour", 
                        desc: "Introduction to Calculus, Vectors, and Combinatorics. The pace accelerates, and conceptual depth becomes critical.", 
                        icon: GitBranch,
                        align: "left"
                     },
                     { 
                        title: "Year 12: HSC Excellence", 
                        desc: "Targeted exam preparation. Error minimisation strategies, complex problem solving, and maximizing ATAR.", 
                        icon: GraduationCap,
                        align: "right"
                     }
                  ].map((item, i) => (
                     <div key={i} className={`flex flex-col md:flex-row items-center gap-8 ${item.align === 'right' ? 'md:flex-row-reverse' : ''}`}>
                        <div className={`w-full md:w-1/2 pl-16 md:pl-0 ${item.align === 'left' ? 'md:pr-16 md:text-right' : 'md:pl-16 md:text-left'}`}>
                           <h3 className="text-2xl font-bold text-slate-900 mb-2">{item.title}</h3>
                           <p className="text-slate-600 leading-relaxed">{item.desc}</p>
                        </div>
                        
                        <div className="absolute left-[4px] md:left-1/2 w-9 h-9 md:-translate-x-1/2 bg-white border-4 border-blue-900 rounded-full flex items-center justify-center z-10">
                           <div className="w-3 h-3 bg-blue-900 rounded-full"></div>
                        </div>

                        <div className="w-full md:w-1/2 hidden md:flex justify-center">
                           <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-900">
                              <item.icon size={32} />
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </section>

      {/* 3. The Weekly Learning Cycle */}
      <section className="py-24 bg-slate-50">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-5xl font-sans font-bold text-slate-900 mb-16 text-center">
              The Weekly Ryze Cycle
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
               <div className="hidden md:block absolute top-12 left-0 w-full h-1 bg-slate-200 -z-10"></div>
               {[
                  { title: "Review", icon: RefreshCw, desc: "Recap previous concepts to strengthen retention." },
                  { title: "Teach", icon: BookOpen, desc: "Explicit instruction of new theory and methods." },
                  { title: "Practice", icon: PenTool, desc: "Guided application with immediate tutor feedback." },
                  { title: "Analyse", icon: Zap, desc: "Ryze AI identifies specific error patterns." },
                  { title: "Feedback", icon: MessageCircle, desc: "Personalised homework and improvement steps." },
               ].map((step, i) => (
                  <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center text-center group hover:-translate-y-2 transition-transform duration-300">
                     <div className="w-12 h-12 bg-blue-900 text-white rounded-full flex items-center justify-center mb-4 font-bold text-lg shadow-lg shadow-blue-200 relative z-10">
                        <step.icon size={20} />
                     </div>
                     <h3 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h3>
                     <p className="text-sm text-slate-500">{step.desc}</p>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* 4. Why Ryze Secondary */}
      <section className="py-24 bg-white">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-5xl font-sans font-bold text-slate-900 mb-16 text-center">
              The Ryze Methodology
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { title: "Rigorous Materials", desc: "Scientific, spiral curriculum layouts designed by HSC high achievers.", icon: Layers },
                { title: "Small Group Focus", desc: "Max 6 students ensures individual attention and peer collaboration without the noise.", icon: Users },
                { title: "Effective Practice", desc: "Consolidated knowledge through structured in-class practice and error analysis.", icon: Target },
                { title: "Professional Tutors", desc: "Dedicated teaching team with proven track records in Extension Mathematics.", icon: GraduationCap }
              ].map((item, idx) => (
                <div key={idx} className="bg-slate-50 p-10 rounded-[2.5rem] border border-slate-100 flex flex-col md:flex-row gap-6 hover:shadow-lg transition-all duration-300 hover:border-blue-200 group">
                   <div className="shrink-0">
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-900 shadow-md group-hover:bg-blue-900 group-hover:text-white transition-colors">
                        <item.icon size={32} strokeWidth={1.5} />
                      </div>
                   </div>
                   <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                      <p className="text-slate-600 leading-relaxed">{item.desc}</p>
                   </div>
                </div>
              ))}
            </div>
         </div>
      </section>

      {/* 5. Course Links */}
      <section className="py-24 bg-slate-900 text-white">
          <div className="max-w-7xl mx-auto px-4">
             <h2 className="text-3xl font-bold mb-12 text-center">Select Your Year Level</h2>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {secondaryCourses.map((course, idx) => (
                   <div 
                      key={idx}
                      onClick={() => navigate(course.path)}
                      className="group p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 cursor-pointer transition-all hover:-translate-y-1"
                   >
                      <div className="flex justify-between items-start mb-4">
                         <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                            <Sigma size={20} />
                         </div>
                         <ArrowRight className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-400" />
                      </div>
                      <h3 className="text-2xl font-bold mb-2">{course.name}</h3>
                      <p className="text-slate-400">{course.desc}</p>
                   </div>
                ))}
             </div>
          </div>
      </section>
    </div>
  );
};

export default SecondaryOverview;
