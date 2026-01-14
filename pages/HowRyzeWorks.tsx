
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check, X, Hand, BarChart3, Search, FileText, BookOpen, TrendingUp, MessageCircle, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';

const HowRyzeWorks: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const principles = [
    { title: "Build Strong Foundations", desc: "Math is hierarchical. We identify gaps systematically and fill them first. You can't build on sand." },
    { title: "Understand the \"Why\"", desc: "Students need both conceptual understanding (why it works) and procedural fluency (how to do it). We teach both." },
    { title: "Meet Them Where They Are", desc: "Different students need different representations. We match the teaching to the student, not the other way around." },
    { title: "Explicit Instruction First", desc: "Students need to be shown and taught first. Success breeds confidence, not confusion." },
    { title: "Build Confidence, Not Anxiety", desc: "We sequence lessons in small, manageable steps. Confusion is a barrier to learning, not a feature of it." },
    { title: "Teacher Knowledge Matters", desc: "Our tutors aren't generic helpers—they're certified teachers who understand subject depth." }
  ];

  const journeySteps = [
    { number: 1, title: "Initial Consultation", desc: "We meet with you and your child to understand goals, struggles, and the full picture.", icon: Hand },
    { number: 2, title: "Comprehensive Assessment", desc: "We identify specific gaps, missing foundations, and formed misconceptions.", icon: BarChart3 },
    { number: 3, title: "Diagnosis & Feedback", desc: "Clear, actionable feedback on what we found and the realistic timeline to fix it.", icon: Search },
    { number: 4, title: "Personalized Learning Plan", desc: "Customized plan based on findings. Right content, right pacing.", icon: FileText },
    { number: 5, title: "Weekly Sessions", desc: "Structured sessions with explicit teaching and guided practice. Building independence.", icon: BookOpen },
    { number: 6, title: "Continuous Tracking", desc: "We track mastery. You get updates on what's improved and what needs work.", icon: TrendingUp },
    { number: 7, title: "Regular Check-ins", desc: "Ongoing communication to keep everyone aligned on progress.", icon: MessageCircle },
    { number: 8, title: "Exam Preparation", desc: "Shift to revision strategy and exam technique as assessments approach.", icon: Target }
  ];

  return (
    <div className="font-sans bg-black text-white pt-24">
      {/* Hero Header */}
      <header className="py-24 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.05),transparent_40%)]"></div>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">
          {t("How Ryze Works")}
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }} className="text-xl text-gray-400 max-w-3xl mx-auto">
          {t("Our approach is simple but rigorous: diagnose the root cause, build a personalized plan, and teach for deep, lasting understanding.")}
        </motion.p>
      </header>

      {/* The Ryze Method */}
      <section className="py-24 bg-gray-900/50 border-y border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">{t("The Ryze Method")}</h2>
              <p className="text-lg text-gray-400 max-w-3xl mx-auto">{t("Ryze is built on evidence-based principles developed by certified NSW teachers.")}</p>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {principles.map((p, i) => (
               <motion.div 
                 key={i} 
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true, margin: "-100px" }}
                 transition={{ duration: 0.6, delay: i * 0.05 }}
                 className="border border-gray-800/80 rounded-3xl p-8 bg-gray-900/40 backdrop-blur-sm h-full"
                >
                  <div className="w-12 h-1 bg-yellow-400 mb-6 rounded-full"></div>
                  <h3 className="text-xl font-bold text-white mb-3">{t(p.title)}</h3>
                  <p className="text-gray-400 leading-relaxed">{t(p.desc)}</p>
               </motion.div>
             ))}
           </div>
        </div>
      </section>

      {/* Student Journey Timeline */}
      <section className="py-32 overflow-hidden">
        <div className="max-w-5xl mx-auto px-4">
           <div className="text-center mb-24">
             <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">{t("The Student Journey")}</h2>
             <p className="text-lg text-gray-400">{t("A structured, transparent process from day one.")}</p>
           </div>

           <div className="relative">
              <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gray-800 md:-translate-x-1/2"></div>
              <div className="space-y-16">
                {journeySteps.map((step, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.5 }}
                    className={`flex flex-col md:items-center ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                  >
                     <div className={`w-full md:w-1/2 ${i % 2 === 0 ? 'md:pr-16' : 'md:pl-16'} relative`}>
                        <div className={`p-8 rounded-2xl bg-gray-900/60 border border-gray-800 shadow-lg`}>
                           <h3 className="text-xl font-bold text-white mb-2">{t(step.title)}</h3>
                           <p className="text-gray-400 leading-relaxed">{t(step.desc)}</p>
                        </div>
                     </div>
                     
                     <div className="absolute left-8 md:left-1/2 -translate-x-1/2 w-16 h-16 bg-black border-4 border-gray-800 rounded-full z-10 flex items-center justify-center shadow-lg shadow-yellow-400/10">
                        <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-black">
                            <step.icon size={20} strokeWidth={2.5} />
                        </div>
                     </div>

                     <div className="hidden md:block w-1/2"></div>
                  </motion.div>
                ))}
              </div>
           </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-24 bg-gray-900/50 border-y border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-16 text-center">{t("The Ryze Advantage")}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div>
                 <h3 className="text-2xl font-bold text-gray-500 mb-6 text-center">{t("Traditional Tutoring")}</h3>
                 <ul className="space-y-4">
                    {[
                      "Generic materials",
                      "Symptom-based help",
                      "Focus on rote memorisation",
                      "Passive learning",
                      "Reactive, last-minute cramming"
                    ].map((item, i) => (
                      <li key={i} className="flex gap-3 items-center p-4 bg-gray-800/40 border border-gray-700/60 rounded-lg">
                        <X className="shrink-0 text-red-500" size={20} />
                        <span className="text-gray-400">{t(item)}</span>
                      </li>
                    ))}
                 </ul>
              </div>
              <div>
                 <h3 className="text-2xl font-bold text-yellow-400 mb-6 text-center">{t("The Ryze Way")}</h3>
                 <ul className="space-y-4">
                    {[
                      "Custom, teacher-developed curriculum",
                      "Systematic, root-cause diagnosis",
                      "Focus on deep understanding",
                      "Active, hands-on learning",
                      "Proactive, long-term skill development"
                    ].map((item, i) => (
                      <li key={i} className="flex gap-3 items-center p-4 bg-yellow-400/10 border border-yellow-400/20 rounded-lg">
                        <Check className="shrink-0 text-yellow-400" size={20} strokeWidth={3}/>
                        <span className="font-semibold text-white">{t(item)}</span>
                      </li>
                    ))}
                 </ul>
              </div>
            </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">{t("Ready to See the Difference?")}</h2>
            <p className="text-lg text-gray-400 mb-10 leading-relaxed">
              {t("Experience our systematic approach firsthand. Book a free, no-obligation trial lesson and receive a complimentary diagnostic assessment.")}
            </p>
            <motion.button 
              onClick={() => navigate('/contact')}
              whileHover={{ y: -3, boxShadow: "0 10px 20px -5px rgba(250, 204, 21, 0.2)" }}
              className="px-8 py-4 bg-yellow-400 text-black font-bold text-lg rounded-full shadow-lg transition-all"
            >
              {t("Book Your Free Trial Lesson")} <ArrowRight className="inline-block ml-2" />
            </motion.button>
          </motion.div>
        </div>
      </section>

    </div>
  );
};

export default HowRyzeWorks;
