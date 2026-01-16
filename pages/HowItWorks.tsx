
import React from 'react';
// @ts-ignore
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check, X, Hand, BarChart3, Search, FileText, BookOpen, TrendingUp, MessageCircle, Target, Users, Laptop, User, Home, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';

const HowItWorks: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const principles = [
    { title: "Build Strong Foundations", desc: "Math is hierarchical. We identify gaps systematically and fill them first. You can\'t build on sand." },
    { title: "Understand the \"Why\"", desc: "Students need both conceptual understanding (why it works) and procedural fluency (how to do it). We teach both." },
    { title: "Meet Them Where They Are", desc: "Different students need different representations. We match the teaching to the student, not the other way around." },
    { title: "Explicit Instruction First", desc: "Students need to be shown and taught first. Success breeds confidence, not confusion." },
    { title: "Build Confidence, Not Anxiety", desc: "We sequence lessons in small, manageable steps. Confusion is a barrier to learning, not a feature of it." },
    { title: "Teacher Knowledge Matters", desc: "Our tutors aren\'t generic helpers—they\'re certified teachers who understand subject depth." }
  ];

  const journeySteps = [
    { number: 1, title: "Initial Consultation", desc: "We meet with you and your child to understand goals, struggles, and the full picture.", icon: Hand },
    { number: 2, title: "Comprehensive Assessment", desc: "We identify specific gaps, missing foundations, and formed misconceptions.", icon: BarChart3 },
    { number: 3, title: "Diagnosis & Feedback", desc: "Clear, actionable feedback on what we found and the realistic timeline to fix it.", icon: Search },
    { number: 4, title: "Personalized Learning Plan", desc: "Customized plan based on findings. Right content, right pacing.", icon: FileText },
    { number: 5, title: "Weekly Sessions", desc: "Structured sessions with explicit teaching and guided practice. Building independence.", icon: BookOpen },
    { number: 6, title: "Continuous Tracking", desc: "We track mastery. You get updates on what\'s improved and what needs work.", icon: TrendingUp },
    { number: 7, title: "Regular Check-ins", desc: "Ongoing communication to keep everyone aligned on progress.", icon: MessageCircle },
    { number: 8, title: "Exam Preparation", desc: "Shift to revision strategy and exam technique as assessments approach.", icon: Target }
  ];

  return (
    <div className="pt-20 font-sans bg-white">
      
      {/* Hero Header */}
      <section className="bg-white pt-24 pb-32 px-4 border-b border-slate-100 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:40px_40px] opacity-40 pointer-events-none"></div>
        <h1 className="text-5xl md:text-7xl font-sans font-bold text-slate-900 mb-8 tracking-tight relative z-10">{t("How Ryze Works")}</h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto font-light leading-relaxed relative z-10">
          {t("Our approach is simple but rigorous: diagnose the root cause, build a personalized plan, and teach for understanding.")}
        </p>
      </section>

      {/* The Real Problem */}
      <section className="py-24 max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
            <h2 className="text-4xl font-sans font-bold text-slate-900 mb-4">{t("The Real Problem")}</h2>
            <div className="w-20 h-1.5 bg-ryze rounded-full mx-auto"></div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-100">
           <div className="bg-slate-50 p-12 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-slate-200">
               <h3 className="text-2xl font-bold text-slate-400 mb-6 uppercase tracking-wider text-sm">{t("Expectation")}</h3>
               <p className="text-3xl font-bold text-slate-800 mb-6 leading-tight">
                 "{t("Tutoring is about doing homework together or cramming before tests.")}"
               </p>
               <p className="text-slate-500 font-medium">{t("Most people think hiring someone to help with current struggles is enough.")}</p>
           </div>

           <div className="bg-white p-12 flex flex-col justify-center relative">
               <div className="absolute top-0 left-0 w-full h-1 bg-ryze"></div>
               <h3 className="text-2xl font-bold text-ryze mb-6 uppercase tracking-wider text-sm">{t("Reality")}</h3>
               <p className="text-lg text-slate-600 mb-6 leading-relaxed" dangerouslySetInnerHTML={{ __html: t("When tutoring is done right, it's <strong>systematic skill-building</strong>. A student struggling with fractions in Year 5 often has gaps from Year 2. By Year 7, that gap snowballs into algebra struggles.") }}>
               </p>
               <p className="text-slate-900 font-bold text-xl">
                 {t("Real tutoring diagnoses the root and rebuilds from there.")}
               </p>
           </div>
        </div>
      </section>

      {/* Teaching Philosophy */}
      <section className="py-24 bg-slate-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
           <div className="text-center mb-20">
              <h2 className="text-4xl font-sans font-bold text-slate-900 mb-6">{t("Our Teaching Philosophy")}</h2>
              <p className="text-slate-600 max-w-3xl mx-auto text-lg" dangerouslySetInnerHTML={{ __html: t("Ryze Tutoring is built on evidence-based principles developed by <strong>certified NSW teachers.</strong> We don\'t create generic lesson plans. Every course is hand-crafted.") }}>
              </p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {principles.map((p, i) => (
               // @ts-ignore
               <motion.div 
                 key={i} 
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: i * 0.1 }}
                 className="bg-white rounded-3xl p-10 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-slate-100 relative group"
                >
                  <div className="w-12 h-1 bg-ryze mb-6 rounded-full group-hover:w-full transition-all duration-500"></div>
                  <h3 className="text-xl font-bold text-slate-900 mb-4">{t(p.title)}</h3>
                  <p className="text-slate-500 leading-relaxed text-sm">{t(p.desc)}</p>
               </motion.div>
             ))}
           </div>
        </div>
      </section>

      {/* Student Journey Timeline */}
      <section className="py-32 bg-white overflow-hidden">
        <div className="max-w-5xl mx-auto px-4">
           <div className="text-center mb-24">
             <h2 className="text-4xl font-sans font-bold text-slate-900 mb-4">{t("Your Child's Learning Journey")}</h2>
             <p className="text-slate-500 text-lg">{t("A structured approach to build skills systematically.")}</p>
           </div>

           <div className="relative">
              {/* Vertical Line */}
              <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-slate-200 md:-translate-x-1/2"></div>

              <div className="space-y-12">
                {journeySteps.map((step, i) => (
                  // @ts-ignore
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className={`flex flex-col md:flex-row items-center ${i % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
                  >
                     <div className="w-full md:w-1/2 pl-20 md:pl-0 md:px-16 mb-4 md:mb-0">
                        <div className={`bg-slate-50 p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow ${i % 2 === 0 ? 'text-left' : 'md:text-right text-left'}`}>
                           <h3 className="text-lg font-bold text-slate-900 mb-2">{t(step.title)}</h3>
                           <p className="text-slate-500 text-sm leading-relaxed">{t(step.desc)}</p>
                        </div>
                     </div>
                     
                     {/* Center Icon Node */}
                     <div className="absolute left-8 md:left-1/2 -translate-x-1/2 w-16 h-16 bg-white border-4 border-slate-50 rounded-full z-10 flex items-center justify-center shadow-lg">
                        <div className="w-12 h-12 bg-ryze rounded-full flex items-center justify-center text-white">
                            <step.icon size={20} strokeWidth={2.5} />
                        </div>
                     </div>

                     <div className="w-full md:w-1/2"></div>
                  </motion.div>
                ))}
              </div>
           </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-24 bg-slate-100 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <h2 className="text-4xl font-sans font-bold text-[#ffb000] mb-16 text-center">{t("What Sets Ryze Apart")}</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-12">
              
              {/* Traditional */}
              <div className="bg-slate-800 backdrop-blur-sm p-10 rounded-3xl border border-white">
                 <h3 className="text-xl font-bold text-red mb-8 uppercase tracking-widest border-b border-white/10 pb-4">{t("Traditional Tutoring")}</h3>
                 <ul className="space-y-6">
                    {[
                      "Generic materials and worksheets",
                      "Help with homework as assigned",
                      "Focus on getting the answer right",
                      "Limited feedback to parents",
                      "One approach fits all students",
                      "Reactive (crisis mode before exams)",
                      "Progress unclear"
                    ].map((item, i) => (
                      <li key={i} className="flex gap-4 text-red items-start">
                        <X className="shrink-0 text-red-400 mt-1" size={18} />
                        <span>{t(item)}</span>
                      </li>
                    ))}
                 </ul>
              </div>

              {/* Ryze Way */}
              <div className="bg-white text-slate-900 p-10 rounded-3xl shadow-2xl relative transform scale-105 z-10 border-4 border-ryze mt-12 lg:mt-0">
                 <div className="absolute top-0 right-0 bg-ryze text-white text-xs font-bold px-4 py-1.5 rounded-bl-2xl uppercase tracking-wider">{t("The Ryze Way")}</div>
                 <h3 className="text-2xl font-bold text-ryze mb-8 uppercase tracking-widest border-b border-slate-100 pb-4">{t("Ryze Tutoring")}</h3>
                 <ul className="space-y-6">
                    {[
                      "Custom curriculum from certified teachers",
                      "Systematic skill-building with diagnosed gaps",
                      "Focus on understanding and transferring skills",
                      "Regular progress reports and communication",
                      "Personalized to each child's learning stage",
                      "Proactive (long-term skill development)",
                      "Clear tracking and tangible progress"
                    ].map((item, i) => (
                      <li key={i} className="flex gap-4 text-slate-800 font-medium items-start">
                        <div className="w-6 h-6 rounded-full bg-ryze/10 flex items-center justify-center text-ryze shrink-0 mt-0.5">
                            <Check size={14} strokeWidth={4} />
                        </div>
                        <span>{t(item)}</span>
                      </li>
                    ))}
                 </ul>
              </div>

            </div>
        </div>
      </section>


      {/* Why This Matters Section */}
      <section className="py-24 px-4 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-sans font-bold text-slate-900 mb-12 text-center">{t("Why This Matters")}</h2>
            
            <div className="prose prose-lg prose-slate mx-auto font-sans text-slate-600 leading-relaxed">
                <p dangerouslySetInnerHTML={{ __html: t("Research is clear: <strong className=\"text-slate-900\">foundational skills in primary school predict achievement in secondary school and beyond.</strong> Students with strong number sense, procedural fluency, and conceptual understanding are more likely to succeed in advanced maths and science.") }}>
                </p>
                <p className="mt-6" dangerouslySetInnerHTML={{ __html: t("But here's what's important: <strong className=\"text-slate-900\">intervention only works if it's done right.</strong> Homework help doesn\'t work. Generic tutoring doesn\'t work. Guessing at what a student needs doesn\'t work.") }}>
                </p>
                <p className="mt-6" dangerouslySetInnerHTML={{ __html: t("Systematic, diagnostic, evidence-based tutoring works.</strong> It's the difference between your child getting through the next test versus actually understanding the subject. It's the difference between struggling and succeeding.") }}>
                </p>
                
                <p className="mt-12 text-2xl font-bold text-ryze text-center">
                   {t("That's what Ryze does.")}
                </p>
            </div>

            <div className="mt-16 bg-slate-50 p-8 rounded-3xl border border-slate-100 text-center">
                <h4 className="text-slate-400 font-bold mb-4 uppercase tracking-widest text-xs">{t("Backed By Research")}</h4>
                <p className="text-slate-500 text-sm leading-relaxed max-w-2xl mx-auto italic">
                   {t("Supported by longitudinal studies (Geary, 2011; Price, Mazzocco & Ansari, 2013), intervention research (Fuchs et al., 2021), and cognitive science on how expertise develops (Chi et al., 1981).")}
                </p>
            </div>
            <div className="mt-20 text-center">
             <div className="bg-ryze/5 border border-ryze/20 p-12 rounded-[3rem] inline-block max-w-4xl w-full">
                <h4 className="text-2xl font-bold text-slate-900 mb-4">{t("Ready to Get Started?")}</h4>
                <p className="text-slate-600 mb-8 text-lg max-w-2xl mx-auto">{t("Every student begins with a free consultation and assessment. We'll discuss which format works best for your situation.")}</p>
                <button 
                    onClick={() => navigate('/contact')}
                    className="px-10 py-4 bg-ryze text-white font-bold rounded-full shadow-lg hover:bg-ryze-600 transition-all transform hover:-translate-y-1"
                >
                    {t("Book Free Consultation")}
                </button>
             </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HowItWorks;