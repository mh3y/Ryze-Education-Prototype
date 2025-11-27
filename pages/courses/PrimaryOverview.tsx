
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, Brain, Target, ArrowRight, Layers, Check, Calculator, PenTool, MessageCircle, RefreshCw, Zap, Compass, Puzzle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';

const PrimaryOverview: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const primaryCourses = [
    { 
      name: 'Year 3', 
      desc: 'Foundation', 
      subLinks: [
        { name: 'Mathematics', path: '/primary/year-3-maths' },
        { name: 'English', path: '/primary/year-3-english' }
      ]
    },
    { 
      name: 'Year 4', 
      desc: 'OC Exam Preparation', 
      subLinks: [
        { name: 'Mathematics', path: '/primary/year-4-maths' },
        { name: 'English', path: '/primary/year-4-english' }
      ]
    },
    { 
      name: 'Year 5', 
      desc: 'Selective Exam Preparation', 
      subLinks: [
        { name: 'Mathematics', path: '/primary/year-5-maths' },
        { name: 'English', path: '/primary/year-5-english' }
      ]
    },
    { 
      name: 'Year 6', 
      desc: 'High School Transition', 
      subLinks: [
        { name: 'Mathematics', path: '/primary/year-6-maths' },
        { name: 'English', path: '/primary/year-6-english' }
      ]
    },
    { name: 'OC Exam Preparation', path: '/primary/oc-preparation', desc: 'Specialised', highlight: true },
    { name: 'Selective Exam Preparation', path: '/primary/selective-preparation', desc: 'Intensive', highlight: true },
  ];

  return (
    <div className="pt-20 font-sans bg-slate-50 min-h-screen">
      
      {/* 1. Hero Section */}
      <section className="bg-gradient-to-br from-[#FFB000] via-orange-400 to-[#FFB000] pt-24 pb-32 px-4 relative overflow-hidden text-white">
         <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white rounded-full blur-[150px] opacity-20 pointer-events-none"></div>
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="inline-block px-4 py-1.5 rounded-full bg-white/20 border border-white/40 text-white text-xs font-bold uppercase tracking-widest mb-6"
               >
                 {t("Primary Education (Years 3-6)")}
               </motion.div>
               <motion.h1 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.1 }}
                 className="text-5xl md:text-7xl font-sans font-bold mb-6 tracking-tight leading-tight text-white drop-shadow-sm"
               >
                 {t("Building the Foundation")}
               </motion.h1>
               <motion.p 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.2 }}
                 className="text-xl text-white/90 font-medium leading-relaxed mb-10 max-w-lg"
               >
                 {t("A structured journey from fundamental literacy and numeracy to advanced critical thinking and exam readiness.")}
               </motion.p>
               
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.3 }}
                 className="flex flex-wrap gap-4"
               >
                  <button onClick={() => navigate('/contact')} className="px-8 py-4 bg-white text-[#FFB000] font-bold rounded-full hover:bg-slate-50 transition-all shadow-lg flex items-center gap-2">
                    {t("Book Assessment")} <ArrowRight size={18} />
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
                  {primaryCourses.slice(0, 4).map((course, idx) => (
                     <div 
                        key={idx} 
                        className="p-6 rounded-3xl backdrop-blur-md border border-white/20 text-white bg-white/10"
                     >
                        <div className="text-sm opacity-80 uppercase tracking-widest mb-1">{course.desc}</div>
                        <div className="text-xl font-bold mb-4">{t(course.name)}</div>
                        
                        {/* Sub-buttons for Maths/English */}
                        <div className="flex gap-2">
                          {course.subLinks?.map((sub, sIdx) => (
                             <button 
                               key={sIdx}
                               onClick={(e) => { e.stopPropagation(); navigate(sub.path); }}
                               className="px-3 py-1.5 bg-white/20 hover:bg-white text-white hover:text-[#FFB000] rounded-lg text-xs font-bold transition-all"
                             >
                               {sub.name}
                             </button>
                          ))}
                        </div>
                     </div>
                  ))}
               </div>
            </motion.div>
         </div>
      </section>

      {/* 2. Ryze Primary Ecosystem */}
      <section className="py-24 bg-white">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-5xl font-sans font-bold text-slate-900 mb-6 text-center">
               {t("The Ryze Primary Ecosystem")}
            </h2>
            <p className="text-center text-slate-500 max-w-2xl mx-auto mb-16 text-lg">
               We don't just teach subjects; we build intelligent learners. Our K-6 roadmap is designed to transition students from concrete operational thinking to abstract reasoning.
            </p>

            <div className="relative">
               {/* Vertical Line */}
               <div className="absolute left-[20px] md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-[#FFB000] to-orange-200 md:-translate-x-1/2 rounded-full"></div>

               <div className="space-y-12">
                  {[
                     { 
                        title: "Years 1-2: Curiosity & Basics", 
                        desc: "Developing core number sense and phonics. We turn maths into play and reading into discovery.", 
                        icon: Puzzle,
                        align: "left"
                     },
                     { 
                        title: "Years 3-4: The Foundation", 
                        desc: "Transitioning to structured learning. Mastery of arithmetic fluency, paragraphing, and early algebra concepts.", 
                        icon: Layers,
                        align: "right"
                     },
                     { 
                        title: "OC Exam Preparation: Critical Thinking", 
                        desc: "Introduction to non-verbal reasoning and complex problem solving. We teach students *how* to think, not just what to think.", 
                        icon: Brain,
                        align: "left"
                     },
                     { 
                        title: "Years 5-6: Exam Readiness", 
                        desc: "High-intensity preparation for Selective High Schools and the transition to Year 7. Focus on speed, accuracy, and exam technique.", 
                        icon: Target,
                        align: "right"
                     }
                  ].map((item, i) => (
                     <div key={i} className={`flex flex-col md:flex-row items-center gap-8 ${item.align === 'right' ? 'md:flex-row-reverse' : ''}`}>
                        <div className={`w-full md:w-1/2 pl-16 md:pl-0 ${item.align === 'left' ? 'md:pr-16 md:text-right' : 'md:pl-16 md:text-left'}`}>
                           <h3 className="text-2xl font-bold text-slate-900 mb-2">{item.title}</h3>
                           <p className="text-slate-600 leading-relaxed">{item.desc}</p>
                        </div>
                        
                        <div className="absolute left-[4px] md:left-1/2 w-9 h-9 md:-translate-x-1/2 bg-white border-4 border-[#FFB000] rounded-full flex items-center justify-center z-10">
                           <div className="w-3 h-3 bg-[#FFB000] rounded-full"></div>
                        </div>

                        <div className="w-full md:w-1/2 hidden md:flex justify-center">
                           <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-[#FFB000]">
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
              {t("The Weekly Ryze Cycle")}
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
                     <div className="w-12 h-12 bg-[#FFB000] text-white rounded-full flex items-center justify-center mb-4 font-bold text-lg shadow-lg shadow-orange-200 relative z-10">
                        <step.icon size={20} />
                     </div>
                     <h3 className="text-lg font-bold text-slate-900 mb-2">{t(step.title)}</h3>
                     <p className="text-sm text-slate-500">{step.desc}</p>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* 4. Core Competencies Grid */}
      <section className="py-24 bg-white">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-5xl font-sans font-bold text-slate-900 mb-16 text-center">
              {t("Core Competencies")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { title: "Critical Thinking", desc: "Students are guided to question sources, explore viewpoints, and reflect through discussion.", icon: Brain },
                { title: "Logical Reasoning", desc: "Through structured training in modelling and inquiry, students learn to identify cause-and-effect.", icon: Layers },
                { title: "Creative Thinking", desc: "By encouraging open-ended questions, students break fixed patterns and turn imagination into outcomes.", icon: Compass },
                { title: "Lifelong Learning", desc: "Personalised pathways build curiosity and a growth mindset, expanding knowledge beyond the classroom.", icon: Check }
              ].map((item, idx) => (
                <div key={idx} className="bg-slate-50 p-10 rounded-[2.5rem] border border-slate-100 flex flex-col md:flex-row gap-6 hover:shadow-lg transition-all duration-300 hover:border-[#FFB000]/30 group">
                   <div className="shrink-0">
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-900 shadow-md group-hover:bg-[#FFB000] group-hover:text-white transition-colors">
                        <item.icon size={32} strokeWidth={1.5} />
                      </div>
                   </div>
                   <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-3">{t(item.title)}</h3>
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
             <h2 className="text-3xl font-bold mb-12 text-center">{t("Select Your Year Level")}</h2>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {primaryCourses.map((course, idx) => (
                   <div 
                      key={idx}
                      className="group p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all hover:-translate-y-1"
                   >
                      <div className="flex justify-between items-start mb-4">
                         <div className="w-10 h-10 rounded-full bg-[#FFB000] flex items-center justify-center text-slate-900 font-bold">
                            {idx + 3 > 6 ? <Target size={20}/> : idx + 3}
                         </div>
                      </div>
                      <h3 className="text-2xl font-bold mb-2">{t(course.name)}</h3>
                      <p className="text-slate-400 mb-6">{course.desc}</p>

                      {/* Subject Selection Buttons */}
                      {course.subLinks ? (
                        <div className="flex flex-col gap-3">
                           {course.subLinks.map((sub, sIdx) => (
                              <button 
                                 key={sIdx}
                                 onClick={() => navigate(sub.path)}
                                 className="w-full flex items-center justify-between px-4 py-3 bg-white/10 hover:bg-[#FFB000] rounded-xl text-sm font-bold transition-all text-white hover:text-slate-900"
                              >
                                 {sub.name} <ArrowRight size={16} />
                              </button>
                           ))}
                        </div>
                      ) : (
                         <button 
                           onClick={() => navigate(course.path || '#')}
                           className="w-full flex items-center justify-between px-4 py-3 bg-white/10 hover:bg-[#FFB000] rounded-xl text-sm font-bold transition-all text-white hover:text-slate-900"
                        >
                           {t("View Course")} <ArrowRight size={16} />
                        </button>
                      )}
                   </div>
                ))}
             </div>
          </div>
      </section>
    </div>
  );
};

export default PrimaryOverview;
