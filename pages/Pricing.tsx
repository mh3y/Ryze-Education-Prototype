
import React, { useState, useEffect } from 'react';
import { Check, Star, MapPin, Laptop, HelpCircle, Layers, GraduationCap, Zap } from 'lucide-react';
// @ts-ignore
import { useNavigate } from 'react-router-dom';
import { motion as motionOriginal, AnimatePresence } from 'framer-motion';
const motion = motionOriginal as any;

// --- Pricing Logic Configuration ---

type Category = 'Primary' | 'Secondary';
type YearLevel = 
  | 'Year 3' | 'Year 4' | 'Year 5' | 'Year 6' 
  | 'OC Exam Preparation' | 'Selective Exam Preparation'
  | 'Year 7' | 'Year 8' | 'Year 9' | 'Year 10' | 'Year 11' | 'Year 12';

interface PriceConfig {
  baseRate: number; // Private In-Person Hourly Rate
  lessonDuration: number; // Hours per lesson
}

const PRICING_DB: Record<string, Record<string, PriceConfig>> = {
  // Primary
  'Year 3': { 
    'Mathematics': { baseRate: 70, lessonDuration: 1.5 }, 
    'English': { baseRate: 70, lessonDuration: 1.5 }
  },
  'Year 4': { 
    'Mathematics': { baseRate: 70, lessonDuration: 1.5 }, 
    'English': { baseRate: 70, lessonDuration: 1.5 }
  },
  'Year 5': { 
    'Mathematics': { baseRate: 70, lessonDuration: 1.5 }, 
    'English': { baseRate: 70, lessonDuration: 1.5 }
  },
  'Year 6': { 
    'Mathematics': { baseRate: 70, lessonDuration: 1.5 }, 
    'English': { baseRate: 70, lessonDuration: 1.5 }
  },
  'OC Exam Preparation': { 
    'Mathematics': { baseRate: 75, lessonDuration: 2 },
    'English': { baseRate: 75, lessonDuration: 2 },
    'Thinking Skills': { baseRate: 75, lessonDuration: 2 },
    'Full Course (Bundle)': { baseRate: 75, lessonDuration: 4 }
  },
  'Selective Exam Preparation': { 
    'Mathematics': { baseRate: 80, lessonDuration: 2 },
    'English': { baseRate: 80, lessonDuration: 2 },
    'Thinking Skills': { baseRate: 80, lessonDuration: 2 },
    'Full Course (Bundle)': { baseRate: 80, lessonDuration: 4 }
  },
  
  // Secondary
  'Year 7': { 'Mathematics': { baseRate: 80, lessonDuration: 2 } },
  'Year 8': { 'Mathematics': { baseRate: 80, lessonDuration: 2 } },
  'Year 9': { 'Mathematics': { baseRate: 90, lessonDuration: 2 } },
  'Year 10': { 'Mathematics': { baseRate: 90, lessonDuration: 2 } },
  
  // Senior
  'Year 11': { 
    'Mathematics Advanced': { baseRate: 100, lessonDuration: 3 }, 
    'Maths Ext 1': { baseRate: 120, lessonDuration: 3 }
  },
  'Year 12': { 
    'Mathematics Advanced': { baseRate: 120, lessonDuration: 3 }, 
    'Maths Ext 1': { baseRate: 135, lessonDuration: 3 },
    'Maths Ext 2': { baseRate: 150, lessonDuration: 3 }
  }
};

const CATEGORY_MAP: Record<Category, YearLevel[]> = {
  'Primary': ['Year 3', 'Year 4', 'Year 5', 'Year 6', 'OC Exam Preparation', 'Selective Exam Preparation'],
  'Secondary': ['Year 7', 'Year 8', 'Year 9', 'Year 10', 'Year 11', 'Year 12']
};

// FAQ Data
const FAQS = [
  { q: "What is the difference between Campus and Online?", a: "On-campus classes are held at our Sydney centre with a tutor physically present. Online classes are live-streamed with the same tutor, materials, and interactivity, but at a reduced rate." },
  { q: "Do you offer trial lessons?", a: "Yes. We offer a First Lesson Money-Back Guarantee for on-campus courses. If you are a new student or enrolling in a new subject, you can try the first lesson risk-free. If you feel Ryze isn't the right fit, simply notify us within 4 days and return your resources within 6 days for a full refund. This applies to on-campus term courses only." },
  { q: "Are materials included?", a: "Yes. All term fees include our printed theory books (for campus students) or digital/shipped books (for online students) and access to our LMS." },
  { q: "What happens if I miss a lesson?", a: "We provide recording access for all lessons via the student portal, so you never fall behind." },
];

const Pricing: React.FC = () => {
  const navigate = useNavigate();

  // State
  const [category, setCategory] = useState<Category>('Secondary');
  const [selectedYear, setSelectedYear] = useState<YearLevel>('Year 10');
  const [selectedSubject, setSelectedSubject] = useState<string>('Mathematics');
  const [learningMode, setLearningMode] = useState<'campus' | 'online'>('campus');
  const [billingPeriod, setBillingPeriod] = useState<'quarterly' | 'monthly'>('quarterly');

  // Logic to handle Category switch
  const handleCategoryChange = (cat: Category) => {
    setCategory(cat);
    const defaultYear = CATEGORY_MAP[cat][0];
    setSelectedYear(defaultYear);
  };

  // Logic to handle Year switch
  useEffect(() => {
    const available = Object.keys(PRICING_DB[selectedYear]);
    if (!available.includes(selectedSubject)) {
      setSelectedSubject(available[0]);
    }
  }, [selectedYear]);

  // Derived State
  const availableSubjects = Object.keys(PRICING_DB[selectedYear]);
  const config = PRICING_DB[selectedYear][selectedSubject] || PRICING_DB[selectedYear][availableSubjects[0]];
  const WEEKS_PER_TERM = 9;
  
  // Pricing Calcs
  const basePrivateRate = config.baseRate;
  const groupCampusHourly = basePrivateRate * 0.70;
  const groupOnlineHourly = groupCampusHourly * 0.70;
  const currentHourlyRate = learningMode === 'campus' ? groupCampusHourly : groupOnlineHourly;
  const costPerLesson = currentHourlyRate * config.lessonDuration;
  const totalTermCost = costPerLesson * WEEKS_PER_TERM;
  
  const displayPrice = billingPeriod === 'quarterly' 
    ? Math.round(totalTermCost) 
    : Math.round(totalTermCost / 3);

  return (
    <div className="bg-slate-50 min-h-screen font-sans pb-32">
      
      {/* Header - Standardized */}
      <div className="bg-white pt-32 md:pt-40 pb-48 px-4 border-b border-slate-100 relative">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-sans font-bold text-slate-900 mb-6 tracking-tight">
            Transparent Pricing
          </h1>
          <p className="text-xl md:text-2xl text-slate-500 font-light max-w-2xl mx-auto leading-relaxed">
            Invest in results, not promises. <span className="font-medium text-slate-900">Simple, term-based pricing</span> with no hidden fees.
          </p>
        </div>
      </div>

      {/* Main Calculator Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-20">
        
        {/* Controls Container */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/20 p-8 mb-12 relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FFB000] to-orange-500"></div>
           
           <div className="flex flex-col gap-8">
              
              {/* 1. Category & Billing Row */}
              <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                 {/* Category Toggle */}
                 <div className="bg-slate-100 p-1.5 rounded-2xl inline-flex relative">
                    {(['Primary', 'Secondary'] as Category[]).map((cat) => (
                       <button
                          key={cat}
                          onClick={() => handleCategoryChange(cat)}
                          className={`relative px-8 py-3 rounded-xl text-sm font-bold transition-all z-10 ${category === cat ? 'text-white' : 'text-slate-500 hover:text-slate-700'}`}
                       >
                          {cat}
                          {category === cat && (
                             <motion.div 
                                layoutId="category-pill"
                                className="absolute inset-0 bg-[#0f172a] rounded-xl -z-10 shadow-lg"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                             />
                          )}
                       </button>
                    ))}
                 </div>

                 {/* Billing Toggle */}
                 <div className="bg-slate-100 p-1.5 rounded-2xl inline-flex relative">
                    <button 
                       onClick={() => setBillingPeriod('quarterly')}
                       className={`relative px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all z-10 ${billingPeriod === 'quarterly' ? 'text-[#0f172a]' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                       Quarterly
                       {billingPeriod === 'quarterly' && (
                          <motion.div 
                             layoutId="billing-pill"
                             className="absolute inset-0 bg-white rounded-xl -z-10 shadow-sm border border-slate-200"
                             transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                          />
                       )}
                    </button>
                    <button 
                       onClick={() => setBillingPeriod('monthly')}
                       className={`relative px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all z-10 ${billingPeriod === 'monthly' ? 'text-[#0f172a]' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                       Monthly
                       {billingPeriod === 'monthly' && (
                          <motion.div 
                             layoutId="billing-pill"
                             className="absolute inset-0 bg-white rounded-xl -z-10 shadow-sm border border-slate-200"
                             transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                          />
                       )}
                    </button>
                 </div>
              </div>

              {/* 2. Year Selection */}
              <div className="space-y-3">
                 <div className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Select Year Group</div>
                 <div className="flex flex-wrap gap-3">
                    {CATEGORY_MAP[category].map((year) => (
                       <button
                          key={year}
                          onClick={() => setSelectedYear(year)}
                          className={`relative px-5 py-3 rounded-xl text-sm font-bold transition-all border ${
                             selectedYear === year 
                             ? 'text-[#0f172a] border-[#FFB000]/50 bg-[#FFB000]/10' 
                             : 'text-slate-500 border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                          }`}
                       >
                          {year}
                          {selectedYear === year && (
                             <motion.div 
                                layoutId="year-outline"
                                className="absolute inset-0 border-2 border-[#FFB000] rounded-xl pointer-events-none"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                             />
                          )}
                       </button>
                    ))}
                 </div>
              </div>

              {/* 3. Subject Selection */}
              <div className="space-y-3">
                 <div className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Select Subject</div>
                 <div className="flex flex-wrap gap-3">
                    {availableSubjects.map((sub) => (
                       <button
                          key={sub}
                          onClick={() => setSelectedSubject(sub)}
                          className={`relative px-6 py-3 rounded-xl text-sm font-bold transition-all ${
                             selectedSubject === sub 
                             ? 'text-white' 
                             : 'text-slate-600 bg-slate-100 hover:bg-slate-200'
                          }`}
                       >
                          {sub}
                          {selectedSubject === sub && (
                             <motion.div 
                                layoutId="subject-pill"
                                className="absolute inset-0 bg-[#FFB000] rounded-xl -z-10 shadow-lg shadow-orange-200"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                             />
                          )}
                       </button>
                    ))}
                 </div>
              </div>

           </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            
            {/* 1. Group / Term Card */}
            <div className="bg-[#FFFDF5] border border-[#FFB000]/20 rounded-[2.5rem] p-10 flex flex-col relative overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300 group">
               <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFB000] rounded-full blur-[100px] opacity-10 group-hover:opacity-20 transition-opacity"></div>
               
               {/* Header */}
               <div className="flex justify-between items-start mb-8 relative z-10">
                  <div>
                     <div className="text-xs font-bold text-[#FFB000] uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Layers size={14} /> During the Term
                     </div>
                     <h3 className="text-3xl font-bold text-slate-900">Term course</h3>
                     <p className="text-slate-500 mt-2 text-sm font-medium">{WEEKS_PER_TERM} lessons over 9 weeks <br/> ({config.lessonDuration} hours per lesson)</p>
                  </div>
                  <div className="w-12 h-12 bg-[#FFB000]/10 rounded-2xl flex items-center justify-center text-[#FFB000]">
                     <MapPin size={24} />
                  </div>
               </div>

               {/* Mode Switcher */}
               <div className="flex gap-8 border-b-2 border-[#FFB000]/10 mb-8 relative z-10">
                  <button 
                    onClick={() => setLearningMode('campus')}
                    className={`pb-4 text-sm font-bold flex items-center gap-2 transition-colors relative ${learningMode === 'campus' ? 'text-[#FFB000]' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                     <MapPin size={16} /> on-campus
                     {learningMode === 'campus' && <motion.div layoutId="underline" className="absolute bottom-[-2px] left-0 w-full h-[2px] bg-[#FFB000]" />}
                  </button>
                  <button 
                    onClick={() => setLearningMode('online')}
                    className={`pb-4 text-sm font-bold flex items-center gap-2 transition-colors relative ${learningMode === 'online' ? 'text-[#FFB000]' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                     <Laptop size={16} /> online
                     {learningMode === 'online' && <motion.div layoutId="underline" className="absolute bottom-[-2px] left-0 w-full h-[2px] bg-[#FFB000]" />}
                  </button>
               </div>

               {/* Price */}
               <div className="mb-8 relative z-10">
                  <div className="flex items-baseline gap-2">
                     <span className="text-xl font-bold text-slate-900">$</span>
                     <span className="text-6xl font-bold text-slate-900 tracking-tight">{displayPrice}</span>
                  </div>
                  <span className="text-slate-500 font-medium bg-[#FFB000]/5 px-3 py-1 rounded-lg text-xs">
                     per {billingPeriod === 'quarterly' ? 'term' : 'month'} &bull; Inc GST
                  </span>
               </div>

               {/* Features */}
               <ul className="space-y-4 mb-10 flex-grow relative z-10">
                  <li className="flex gap-3 items-start text-sm text-slate-700 font-bold bg-[#FFB000]/5 p-2 rounded-lg -mx-2">
                      <div className="p-0.5 bg-[#FFB000] rounded text-white mt-0.5"><Zap size={12} fill="currentColor"/></div>
                      <span className="text-[#FFB000]">Includes Beta Access to Ryze AI</span>
                  </li>
                  {[
                    "Taught by experienced Ryze teachers",
                    "Maximum of 6 students per class",
                    "NSW new-syllabus Theory Book",
                    "Access to Online Learning Portal",
                    "Weekly homework marking & feedback",
                    "Progress tracking for students and parents"
                  ].map((feat, i) => (
                    <li key={i} className="flex gap-3 items-start text-sm text-slate-700">
                        <Check size={16} className="text-[#FFB000] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                    </li>
                  ))}
               </ul>

               <button 
                 onClick={() => navigate('/contact')}
                 className="w-full bg-[#FFB000] text-white font-bold py-4 rounded-2xl shadow-lg shadow-orange-200 hover:bg-[#e6a000] hover:-translate-y-1 transition-all relative z-10"
               >
                 Enrol now
               </button>
            </div>

            {/* 2. Private Tuition Card */}
            <div className="bg-[#0f172a] text-white rounded-[2.5rem] p-10 flex flex-col relative overflow-hidden shadow-2xl group">
               {/* Background Gradient */}
               <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 group-hover:bg-blue-600/30 transition-colors duration-500"></div>
               
               <div className="flex justify-between items-start mb-8 relative z-10">
                  <div>
                     <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Star size={14} className="text-[#FFB000]" /> Private Tuition
                     </div>
                     <h3 className="text-3xl font-bold text-white">1-on-1 Mentorship</h3>
                     <p className="text-slate-400 mt-2 text-sm font-medium">Completely personalised attention</p>
                  </div>
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white border border-white/10">
                     <GraduationCap size={24} />
                  </div>
               </div>

               <div className="mb-8 relative z-10">
                  <div className="inline-block px-4 py-2 border border-[#FFB000] text-[#FFB000] text-xs font-bold rounded-lg uppercase tracking-wider mb-6 bg-[#FFB000]/10">
                     Premium
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed border-l-2 border-white/20 pl-4">
                     We deliberately limit our private intake to ensure the highest quality of service and mentor availability.
                  </p>
               </div>

               <ul className="space-y-4 mb-10 flex-grow relative z-10">
                  <li className="flex gap-3 items-start text-sm font-bold bg-white/5 p-2 rounded-lg -mx-2">
                      <div className="p-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded text-white mt-0.5"><Zap size={12} fill="currentColor"/></div>
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300">Includes Beta Access to Ryze AI</span>
                  </li>
                  {[
                    "Direct access to senior mentors",
                    "Curriculum tailored to your school's pace",
                    "Intensive exam preparation",
                    "Flexible scheduling",
                    "Detailed weekly feedback reports",
                    "Support available between lessons"
                  ].map((feat, i) => (
                    <li key={i} className="flex gap-3 items-start text-sm text-slate-300">
                        <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-0.5 border border-white/10">
                           <Check size={10} className="text-white" />
                        </div>
                        <span>{feat}</span>
                    </li>
                  ))}
               </ul>

               <button 
                 onClick={() => navigate('/contact')}
                 className="w-full bg-white text-[#0f172a] font-bold py-4 rounded-2xl shadow-lg hover:bg-slate-100 hover:-translate-y-1 transition-all relative z-10"
               >
                 Enquire for Private
               </button>
               <p className="text-center text-xs text-slate-500 mt-4 relative z-10">*Private pricing available upon application</p>
            </div>

        </div>

      </div>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 pt-24 pb-12">
         <h2 className="text-3xl font-bold text-slate-900 text-center mb-16 font-sans">Frequently Asked Questions</h2>
         <div className="grid gap-6">
            {FAQS.map((faq, idx) => (
               <div key={idx} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="font-bold text-slate-900 mb-3 flex items-start gap-3 text-lg">
                     <HelpCircle size={24} className="text-[#FFB000] shrink-0" />
                     {faq.q}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed pl-9">
                     {faq.a}
                  </p>
               </div>
            ))}
         </div>
      </section>

    </div>
  );
};

export default Pricing;
