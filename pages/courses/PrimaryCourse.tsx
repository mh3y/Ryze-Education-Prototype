
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { courses } from '../../data/courses';
import { BookOpen, ArrowRight, Award, Target, Check, Layers, Users, Star, BarChart3, GraduationCap, Calculator, PenTool, MessageCircle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

const PrimaryCourse: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const course = courses[courseId || ''];
  const [activeTermIndex, setActiveTermIndex] = useState(0);

  useEffect(() => {
    setActiveTermIndex(0);
  }, [courseId]);

  if (!course) {
    return <div className="pt-32 text-center font-sans">Course not found.</div>;
  }

  // Flatten topics from all subjects for the timeline
  const allTopics = course.subjects.flatMap(s => s.topics);
  const topicsPerTerm = Math.ceil(allTopics.length / 4);
  const terms = [
    { name: "Term 1", topics: allTopics.slice(0, topicsPerTerm) },
    { name: "Term 2", topics: allTopics.slice(topicsPerTerm, topicsPerTerm * 2) },
    { name: "Term 3", topics: allTopics.slice(topicsPerTerm * 2, topicsPerTerm * 3) },
    { name: "Term 4", topics: allTopics.slice(topicsPerTerm * 3) }
  ];

  // Logic for Learning Targets based on Term
  const allOutcomes = course.subjects[0].keyOutcomes;
  const outcomesPerTerm = Math.ceil(allOutcomes.length / 4);
  const termOutcomes = allOutcomes.slice(activeTermIndex * outcomesPerTerm, (activeTermIndex + 1) * outcomesPerTerm);
  
  // Use representative topics as Goals
  const termGoals = terms[activeTermIndex].topics.slice(0, 5);

  return (
    <div className="pt-20 font-sans bg-slate-50 min-h-screen">
      {/* 1. Overview / Hero Section */}
      <section className="bg-gradient-to-br from-[#FFB000] via-orange-400 to-[#FFB000] pt-24 pb-32 px-4 relative overflow-hidden text-white">
         <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white rounded-full blur-[150px] opacity-20 pointer-events-none"></div>
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="inline-block px-4 py-1.5 rounded-full bg-white/20 border border-white/40 text-white text-xs font-bold uppercase tracking-widest mb-6"
               >
                 {course.category} Education &bull; {course.gradeLevel}
               </motion.div>
               <motion.h1 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.1 }}
                 className="text-5xl md:text-7xl font-sans font-bold mb-6 tracking-tight leading-tight text-white drop-shadow-sm"
               >
                 {course.title}
               </motion.h1>
               <motion.p 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.2 }}
                 className="text-xl text-white/90 font-medium leading-relaxed mb-10 max-w-lg"
               >
                 {course.description}
               </motion.p>
               
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.3 }}
                 className="flex flex-wrap gap-4"
               >
                  <button onClick={() => navigate('/contact')} className="px-8 py-4 bg-white text-[#FFB000] font-bold rounded-full hover:bg-slate-50 transition-all shadow-lg flex items-center gap-2">
                    Book Trial Class <ArrowRight size={18} />
                  </button>
                  <button onClick={() => document.getElementById('details')?.scrollIntoView({behavior:'smooth'})} className="px-8 py-4 border border-white/40 text-white font-bold rounded-full hover:bg-white/10 transition-all">
                    Course Details
                  </button>
               </motion.div>
            </div>
            
            <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ duration: 0.8 }}
               className="relative hidden lg:block"
            >
               <div className="aspect-square rounded-[3rem] overflow-hidden border-8 border-white/20 shadow-2xl relative z-10 -rotate-2">
                  <img src={course.heroImage} alt={course.title} className="w-full h-full object-cover" />
               </div>
            </motion.div>
         </div>
      </section>

      {/* 2. Characteristics Section (Grid Layout) - Specific to Course */}
      {course.whyChoose && (
      <section className="py-24 bg-white">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-5xl font-sans font-bold text-slate-900 mb-16 text-center">
              Why Choose Ryze {course.gradeLevel}?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {course.whyChoose.map((item, idx) => (
                <div key={idx} className="bg-slate-50 p-10 rounded-[2.5rem] border border-slate-100 flex flex-col md:flex-row gap-6 hover:shadow-lg transition-all duration-300 hover:border-[#FFB000]/30 group">
                   <div className="shrink-0">
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-900 shadow-md group-hover:bg-[#FFB000] group-hover:text-white transition-colors">
                        <item.icon size={32} strokeWidth={1.5} />
                      </div>
                   </div>
                   <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                      <p className="text-slate-600 leading-relaxed">{item.description}</p>
                   </div>
                </div>
              ))}
            </div>
         </div>
      </section>
      )}

      {/* 3. Learning Targets & Course Structure */}
      <section id="details" className="py-24 bg-slate-50">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-5xl font-sans font-bold text-slate-900 mb-4 text-center">
               {course.gradeLevel} Course Details
            </h2>
            <p className="text-center text-slate-500 mb-16 max-w-2xl mx-auto">Explore the detailed curriculum and capabilities built each term.</p>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
               
               {/* Left Sidebar: Term Selector */}
               <div className="lg:col-span-3 sticky top-28">
                  <div className="space-y-2">
                     {terms.map((term, idx) => (
                        <button 
                           key={idx}
                           onClick={() => setActiveTermIndex(idx)}
                           className={`w-full text-left px-6 py-4 rounded-xl font-bold transition-all duration-300 flex items-center justify-between group ${
                              activeTermIndex === idx 
                              ? 'bg-[#0f172a] text-white shadow-lg' 
                              : 'bg-white text-slate-500 hover:bg-slate-100'
                           }`}
                        >
                           <div className="flex items-center gap-3">
                              <div className={`w-2 h-8 rounded-full ${activeTermIndex === idx ? 'bg-[#FFB000]' : 'bg-slate-200 group-hover:bg-slate-300'}`}></div>
                              <span>{term.name}</span>
                           </div>
                           {activeTermIndex === idx && <ArrowRight size={16} className="text-[#FFB000]" />}
                        </button>
                     ))}
                  </div>
               </div>

               {/* Right Content: Goals & Timeline */}
               <div className="lg:col-span-9 space-y-8">
                  
                  {/* Learning Targets Card */}
                  <motion.div 
                     key={`goals-${activeTermIndex}`}
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ duration: 0.3 }}
                     className="bg-[#0f172a] rounded-[2.5rem] p-8 md:p-12 text-white shadow-xl relative overflow-hidden"
                  >
                     {/* Decor */}
                     <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#FFB000] rounded-full blur-[120px] opacity-10 pointer-events-none"></div>
                     
                     <div className="flex items-center gap-4 mb-8">
                        <div className="px-4 py-1.5 rounded-full bg-[#FFB000] text-[#0f172a] text-xs font-bold uppercase tracking-widest">
                           {terms[activeTermIndex].name}
                        </div>
                        <h3 className="text-2xl font-bold">Focus & Outcomes</h3>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div>
                           <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-[#FFB000] mb-6">
                              <Target size={32} />
                           </div>
                           <h4 className="text-xl font-bold mb-6">Goals to be Achieved</h4>
                           <ul className="space-y-4">
                              {termGoals.map((topic, i) => (
                                 <li key={i} className="flex gap-4 items-start">
                                    <div className="w-6 h-6 rounded-full bg-[#FFB000] text-[#0f172a] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">{i+1}</div>
                                    <p className="text-slate-300 text-sm leading-relaxed">{topic.description}</p>
                                 </li>
                              ))}
                           </ul>
                        </div>

                        <div>
                           <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-[#FFB000] mb-6">
                              <Award size={32} />
                           </div>
                           <h4 className="text-xl font-bold mb-6">Competencies to be Reached</h4>
                           <ul className="space-y-4">
                              {termOutcomes.map((outcome, i) => (
                                 <li key={i} className="flex gap-4 items-start">
                                    <div className="w-6 h-6 rounded-full bg-[#FFB000] text-[#0f172a] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">{i+1}</div>
                                    <p className="text-slate-300 text-sm leading-relaxed">{outcome}.</p>
                                 </li>
                              ))}
                           </ul>
                        </div>
                     </div>
                  </motion.div>

                  {/* Course Structure Timeline */}
                  <motion.div 
                     key={`timeline-${activeTermIndex}`}
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ duration: 0.3, delay: 0.1 }}
                     className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-slate-100"
                  >
                     <h3 className="text-2xl font-bold text-slate-900 mb-8 text-center">{terms[activeTermIndex].name} Lesson Plan</h3>
                     
                     <div className="relative pl-8 border-l-2 border-slate-100 space-y-8">
                        {terms[activeTermIndex].topics.length > 0 ? terms[activeTermIndex].topics.map((topic, i) => (
                           <div key={i} className="relative group">
                              <div className="absolute -left-[41px] top-1.5 w-5 h-5 rounded-full bg-white border-4 border-slate-200 group-hover:border-[#FFB000] transition-colors"></div>
                              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                                 <span className="text-xs font-bold text-slate-400 uppercase tracking-widest min-w-[80px]">Lesson {i + 1}</span>
                                 <h4 className="text-lg font-bold text-slate-800">{topic.title}</h4>
                              </div>
                              <p className="text-sm text-slate-500 mt-1 md:ml-[96px] max-w-2xl">{topic.description}</p>
                           </div>
                        )) : (
                           <div className="text-center text-slate-400 italic">Curriculum detailed upon assessment.</div>
                        )}
                     </div>
                  </motion.div>

               </div>
            </div>

         </div>
      </section>

      {/* 5. Pricing Section */}
      <section className="py-24 bg-white border-t border-slate-100">
         <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-[#FFB000] rounded-[3rem] overflow-hidden shadow-2xl relative text-white">
               {/* Header */}
               <div className="bg-[#FFB000] pt-16 pb-12 text-center relative z-10">
                   <h2 className="text-4xl font-bold mb-4">{course.title} Pricing</h2>
                   <p className="text-white/80 text-lg">Small Group / Personalised</p>
                   <div className="mt-8 text-white/90 font-bold">1.5 hours per lesson &bull; 36 lessons / year</div>
               </div>
               
               {/* Wave Divider */}
               <div className="relative">
                  <svg className="fill-white w-full h-12" viewBox="0 0 1440 120" preserveAspectRatio="none">
                     <path d="M0,0 C240,120 480,120 720,60 C960,0 1200,0 1440,60 L1440,120 L0,120 Z"></path>
                  </svg>
               </div>

               {/* Content */}
               <div className="bg-white px-8 pb-16 pt-8 text-center">
                  <div className="mb-12">
                     <span className="text-7xl font-bold text-slate-800">$49</span>
                     <span className="text-2xl font-bold text-slate-400">/hour</span>
                  </div>
                  
                  <div className="bg-orange-50 rounded-3xl p-10 max-w-3xl mx-auto mb-12">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                        {[
                           "Expert primary teachers",
                           "Engaging learning materials",
                           "Homework marking included",
                           "Term assessments",
                           "Access to Online Student Portal",
                           "Feedback reports",
                           "Small class size (Max 6)",
                           "Comfortable learning environment"
                        ].map((item, i) => (
                           <div key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                              <div className="w-2 h-2 rounded-full bg-[#FFB000]"></div>
                              {item}
                           </div>
                        ))}
                     </div>
                  </div>
                  
                  <button onClick={() => navigate('/contact')} className="w-full md:w-auto px-16 py-4 bg-[#FFB000] text-white font-bold rounded-xl shadow-lg hover:bg-orange-400 transition-colors">
                     Free Trial
                  </button>
               </div>
            </div>
         </div>
      </section>
    </div>
  );
};

export default PrimaryCourse;
