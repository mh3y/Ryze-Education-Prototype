
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { courses } from '../../data/courses';
import { ArrowRight, Award, Target, Brain, GraduationCap, CheckCircle2, Users, BarChart3, Lightbulb, Zap, Compass, Sigma, GitBranch, RefreshCw, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';

const SecondaryCourse: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const course = courses[courseId || ''];
  const [activeStreamIndex, setActiveStreamIndex] = useState(0);
  const [activeTermIndex, setActiveTermIndex] = useState(0);

  useEffect(() => {
    setActiveStreamIndex(0);
    setActiveTermIndex(0);
  }, [courseId]);

  if (!course) {
    return <div className="pt-32 text-center font-sans">{t("Course not found.")}</div>;
  }

  const hasStreams = course.streams && course.streams.length > 0;
  const currentStreamIndex = hasStreams && course.streams && activeStreamIndex < course.streams.length ? activeStreamIndex : 0;
  const activeModules = hasStreams && course.streams ? course.streams[currentStreamIndex]?.modules : course.subjects;
  const activeDescription = hasStreams && course.streams ? course.streams[currentStreamIndex]?.description : course.description;

  // Flatten topics from all modules to simulate a term-based timeline structure
  const allTopics = activeModules ? activeModules.flatMap(m => m.topics) : [];
  
  // Group topics into "Terms" for display purposes
  const topicsPerTerm = Math.ceil(allTopics.length / 4);
  const terms = [
    { name: t("Term 1"), topics: allTopics.slice(0, topicsPerTerm) },
    { name: t("Term 2"), topics: allTopics.slice(topicsPerTerm, topicsPerTerm * 2) },
    { name: t("Term 3"), topics: allTopics.slice(topicsPerTerm * 2, topicsPerTerm * 3) },
    { name: t("Term 4"), topics: allTopics.slice(topicsPerTerm * 3) }
  ];

  // Pricing Logic Helper
  const getPricingInfo = (gradeLevel: string) => {
    let baseRate = 80;
    let duration = 2;

    if (gradeLevel.includes('7') || gradeLevel.includes('8')) {
        baseRate = 80;
        duration = 2;
    } else if (gradeLevel.includes('9') || gradeLevel.includes('10')) {
        baseRate = 90;
        duration = 2;
    } else if (gradeLevel.includes('11')) {
        baseRate = 100;
        duration = 3;
    } else if (gradeLevel.includes('12')) {
        baseRate = 120;
        duration = 3;
    }

    const groupRate = Math.round(baseRate * 0.7);
    return { groupRate, duration };
  };

  const { groupRate, duration } = getPricingInfo(course.gradeLevel);

  if (!activeModules) {
    return <div className="pt-32 text-center font-sans">{t("Loading course data...")}</div>;
  }

  return (
    <div className="pt-20 font-sans bg-slate-50 min-h-screen">
      
      {/* 1. Overview / Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pt-24 pb-32 px-4 relative overflow-hidden text-white">
         <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-ryze rounded-full blur-[150px] opacity-10 pointer-events-none"></div>
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="inline-block px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-ryze text-xs font-bold uppercase tracking-widest mb-6"
               >
                 {course.gradeLevel} &bull; {course.category}
               </motion.div>
               <motion.h1 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.1 }}
                 className="text-5xl md:text-7xl font-sans font-bold mb-6 tracking-tight leading-tight"
               >
                 {t(course.title)}
               </motion.h1>
               <motion.p 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.2 }}
                 className="text-xl text-slate-300 font-light leading-relaxed mb-10 max-w-lg"
               >
                 {t(activeDescription || course.description)}
               </motion.p>
               
               {hasStreams && (
                 <div className="flex flex-wrap gap-3 mb-10">
                    {course.streams!.map((stream, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveStreamIndex(idx)}
                        className={`px-6 py-3 rounded-full text-sm font-bold transition-all border ${
                          currentStreamIndex === idx 
                          ? 'bg-ryze border-ryze text-slate-900' 
                          : 'bg-transparent border-slate-700 text-slate-400 hover:border-white hover:text-white'
                        }`}
                      >
                        {stream.name}
                      </button>
                    ))}
                 </div>
               )}

               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.3 }}
                 className="flex flex-wrap gap-4"
               >
                  <button onClick={() => navigate('/contact')} className="px-8 py-4 bg-white text-slate-900 font-bold rounded-full hover:bg-ryze hover:text-white transition-all shadow-lg flex items-center gap-2">
                    {t("Book Trial Class")} <ArrowRight size={18} />
                  </button>
                  <button onClick={() => document.getElementById('details')?.scrollIntoView({behavior:'smooth'})} className="px-8 py-4 border border-white/20 text-white font-bold rounded-full hover:bg-white/10 transition-all">
                    {t("Course Details")}
                  </button>
               </motion.div>
            </div>
            
            <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ duration: 0.8 }}
               className="relative hidden lg:block"
            >
               <div className="aspect-square rounded-[3rem] overflow-hidden border-8 border-white/10 shadow-2xl relative z-10 rotate-3">
                  <img src={course.heroImage} alt={course.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
                  <div className="absolute bottom-10 left-10 right-10">
                     <div className="flex gap-4 mb-4">
                        <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl flex-1 border border-white/10">
                           <div className="text-2xl font-bold text-white mb-1">36+</div>
                           <div className="text-xs text-slate-300 uppercase tracking-widest">{t("lessons / year")}</div>
                        </div>
                        <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl flex-1 border border-white/10">
                           <div className="text-2xl font-bold text-white mb-1">Max 6</div>
                           <div className="text-xs text-slate-300 uppercase tracking-widest">{t("Small Group Focus")}</div>
                        </div>
                     </div>
                  </div>
               </div>
               {/* Decorative elements behind */}
               <div className="absolute top-10 -right-10 w-full h-full border-4 border-ryze/30 rounded-[3rem] -z-10"></div>
            </motion.div>
         </div>
      </section>

      {/* 2. Characteristics Section (Grid Layout) */}
      {course.whyChoose && (
      <section className="py-24 bg-white">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-5xl font-sans font-bold text-slate-900 mb-16 text-center">
              {t(`Why Choose Ryze ${course.gradeLevel}?`)}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {course.whyChoose.map((item, idx) => (
                <div key={idx} className="bg-slate-50 p-10 rounded-[2.5rem] border border-slate-100 flex flex-col md:flex-row gap-6 hover:shadow-lg transition-all duration-300 hover:border-ryze/30 group">
                   <div className="shrink-0">
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-900 shadow-md group-hover:bg-ryze group-hover:text-white transition-colors">
                        <item.icon size={32} strokeWidth={1.5} />
                      </div>
                   </div>
                   <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-3">{t(item.title)}</h3>
                      <p className="text-slate-600 leading-relaxed">{t(item.description)}</p>
                   </div>
                </div>
              ))}
            </div>
         </div>
      </section>
      )}

      {/* 3. Learning Targets & Capability */}
      <section className="py-24 bg-slate-50">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-5xl font-sans font-bold text-slate-900 mb-16 text-center">
              {t("Learning Targets")}
            </h2>
            
            <div className="bg-white rounded-[3rem] p-8 md:p-16 shadow-xl border border-slate-100">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                  {/* Goals */}
                  <div className="text-center">
                     <div className="w-24 h-24 bg-blue-900 rounded-full flex items-center justify-center text-white mx-auto mb-8 shadow-lg shadow-blue-900/30">
                        <Target size={40} />
                     </div>
                     <h4 className="text-xl font-bold text-slate-900 mb-8">{t("Goals to be Achieved")}</h4>
                     <ul className="text-left space-y-6">
                        {activeModules.slice(0, 4).map((mod, i) => (
                           <li key={i} className="flex gap-4">
                              <div className="w-8 h-8 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold text-sm shrink-0">{i+1}</div>
                              <p className="text-slate-600 text-sm leading-relaxed">{t(mod.description)}</p>
                           </li>
                        ))}
                     </ul>
                  </div>

                  {/* Competencies */}
                  <div className="text-center">
                     <div className="w-24 h-24 bg-blue-900 rounded-full flex items-center justify-center text-white mx-auto mb-8 shadow-lg shadow-blue-900/30">
                        <Award size={40} />
                     </div>
                     <h4 className="text-xl font-bold text-slate-900 mb-8">{t("Competencies to be Reached")}</h4>
                     <ul className="text-left space-y-6">
                        {activeModules[0]?.keyOutcomes.slice(0, 5).map((outcome, i) => (
                           <li key={i} className="flex gap-4">
                              <div className="w-8 h-8 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold text-sm shrink-0">{i+1}</div>
                              <p className="text-slate-600 text-sm leading-relaxed">{t(`Students can proficiently demonstrate ${outcome} in complex problem-solving scenarios.`)}</p>
                           </li>
                        ))}
                     </ul>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* 4. Course Structure (Timeline) */}
      <section id="details" className="py-24 bg-white">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-16">{t("Course Structure")}</h2>
            
            {/* Timeline Selector */}
            <div className="relative mb-16">
               <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -z-10"></div>
               <div className="flex justify-between max-w-4xl mx-auto">
                  {terms.map((term, idx) => (
                     <button 
                        key={idx}
                        onClick={() => setActiveTermIndex(idx)}
                        className={`flex flex-col items-center gap-4 group focus:outline-none`}
                     >
                        <div className={`w-6 h-6 rounded-full border-4 transition-all duration-300 ${activeTermIndex === idx ? 'bg-white border-blue-900 scale-125' : 'bg-slate-200 border-white group-hover:bg-blue-200'}`}></div>
                        <span className={`text-sm font-bold transition-colors ${activeTermIndex === idx ? 'text-blue-900' : 'text-slate-400'}`}>{term.name}</span>
                     </button>
                  ))}
               </div>
            </div>

            {/* Term Content */}
            <motion.div 
               key={activeTermIndex}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.4 }}
               className="bg-slate-50 rounded-[2.5rem] p-12 md:p-16 border border-slate-100"
            >
               <h3 className="text-2xl font-bold text-slate-900 mb-10 text-center">{terms[activeTermIndex].name} {t("Curriculum")}</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 max-w-4xl mx-auto">
                  {terms[activeTermIndex].topics.length > 0 ? terms[activeTermIndex].topics.map((topic, i) => (
                     <div key={i} className="flex items-start gap-3">
                        <div className="text-slate-400 font-mono text-sm mt-1">{t("Lesson")} {i + 1}:</div>
                        <div className="font-bold text-slate-700">{t(topic.title)}</div>
                     </div>
                  )) : (
                     <div className="col-span-2 text-center text-slate-400">{t("Content for this term is being finalised.")}</div>
                  )}
               </div>
            </motion.div>
         </div>
      </section>

      {/* 5. Pricing Section */}
      <section className="py-24 bg-white">
         <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-[#1e3a8a] rounded-[3rem] overflow-hidden shadow-2xl relative text-white">
               {/* Header */}
               <div className="bg-[#1e3a8a] pt-16 pb-12 text-center relative z-10">
                   <h2 className="text-4xl font-bold mb-4">{t(course.title)} {t("Pricing")}</h2>
                   <p className="text-blue-200 text-lg">{t("Offline Courses / Live Streaming Courses")}</p>
                   <div className="mt-8 text-blue-200 font-bold">{duration} {t("hours per lesson")} &bull; 36 {t("lessons / year")}</div>
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
                     <span className="text-7xl font-bold text-[#e57373]">${groupRate}</span>
                     <span className="text-2xl font-bold text-[#e57373]">/hour</span>
                  </div>
                  
                  <div className="bg-blue-50 rounded-3xl p-10 max-w-3xl mx-auto mb-12">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                        {[
                           "Experienced maths teachers",
                           "3-Step Cycle teaching model",
                           "Scientific teaching materials",
                           "Closely aligned with NSW curriculum",
                           "Access to Online Learning Portal",
                           "Complementary tests and assignments",
                           "Small class size (Max 6)",
                           "Learning report feedback"
                        ].map((item, i) => (
                           <div key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                              <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                              {t(item)}
                           </div>
                        ))}
                     </div>
                  </div>
                  
                  <button onClick={() => navigate('/contact')} className="w-full md:w-auto px-16 py-4 bg-[#3b82f6] text-white font-bold rounded-xl shadow-lg hover:bg-blue-600 transition-colors">
                     {t("Free Trial")}
                  </button>
                  <p className="mt-4 text-xs text-slate-400">*{t("Click to inquire for the latest details and discounts")}</p>
               </div>
            </div>
         </div>
      </section>

    </div>
  );
};

export default SecondaryCourse;
