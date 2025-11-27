
import React, { useState, useEffect } from 'react';
import { Check, Star, HelpCircle, MapPin, Laptop } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// --- Pricing Logic Configuration ---

type YearLevel = 'Year 3' | 'Year 4' | 'Year 5' | 'Year 6' | 'Year 7' | 'Year 8' | 'Year 9' | 'Year 10' | 'Year 11' | 'Year 12';
type Subject = 'Mathematics' | 'English' | 'Maths Ext 1' | 'Maths Ext 2';

interface PriceConfig {
  baseRate: number; // Private In-Person Hourly Rate
  lessonDuration: number; // Hours per lesson
}

// Configuration based on user prompt
// Primary: 1.5 hours
// Yr 7-10: 2 hours
// Yr 11-12: 3 hours
const PRICING_DB: Record<string, Record<string, PriceConfig>> = {
  // Primary (Base $70 Private -> ~$49 Group)
  'Year 3': { 'Mathematics': { baseRate: 70, lessonDuration: 1.5 }, 'English': { baseRate: 70, lessonDuration: 1.5 } },
  'Year 4': { 'Mathematics': { baseRate: 70, lessonDuration: 1.5 }, 'English': { baseRate: 70, lessonDuration: 1.5 } },
  'Year 5': { 'Mathematics': { baseRate: 70, lessonDuration: 1.5 }, 'English': { baseRate: 70, lessonDuration: 1.5 } },
  'Year 6': { 'Mathematics': { baseRate: 70, lessonDuration: 1.5 }, 'English': { baseRate: 70, lessonDuration: 1.5 } },
  
  // Junior Secondary (Base $80 Private -> $56 Group)
  'Year 7': { 'Mathematics': { baseRate: 80, lessonDuration: 2 }, 'English': { baseRate: 80, lessonDuration: 2 } },
  'Year 8': { 'Mathematics': { baseRate: 80, lessonDuration: 2 }, 'English': { baseRate: 80, lessonDuration: 2 } },
  
  // Intermediate Secondary (Base $90 Private -> $63 Group)
  'Year 9': { 'Mathematics': { baseRate: 90, lessonDuration: 2 }, 'English': { baseRate: 90, lessonDuration: 2 } },
  'Year 10': { 'Mathematics': { baseRate: 90, lessonDuration: 2 }, 'English': { baseRate: 90, lessonDuration: 2 } },
  
  // Senior Secondary (Base $100-$150 Private)
  'Year 11': { 
    'Mathematics': { baseRate: 100, lessonDuration: 3 }, // Advanced
    'Maths Ext 1': { baseRate: 120, lessonDuration: 3 },
    'English': { baseRate: 100, lessonDuration: 3 } 
  },
  'Year 12': { 
    'Mathematics': { baseRate: 120, lessonDuration: 3 }, // Advanced
    'Maths Ext 1': { baseRate: 135, lessonDuration: 3 },
    'Maths Ext 2': { baseRate: 150, lessonDuration: 3 },
    'English': { baseRate: 120, lessonDuration: 3 }
  }
};

const Pricing: React.FC = () => {
  const navigate = useNavigate();

  // State
  const [selectedYear, setSelectedYear] = useState<YearLevel>('Year 10');
  const [selectedSubject, setSelectedSubject] = useState<Subject>('Mathematics');
  const [learningMode, setLearningMode] = useState<'campus' | 'online'>('campus');
  const [billingPeriod, setBillingPeriod] = useState<'quarterly' | 'monthly'>('quarterly');

  // Derived State
  const availableSubjects = Object.keys(PRICING_DB[selectedYear]) as Subject[];
  
  // Ensure selected subject exists for the new year when switching years
  useEffect(() => {
    if (!availableSubjects.includes(selectedSubject)) {
      setSelectedSubject(availableSubjects[0]);
    }
  }, [selectedYear]);

  // Calculations
  const config = PRICING_DB[selectedYear][selectedSubject];
  const WEEKS_PER_TERM = 9;
  
  // 1. Base Rate (Private In-Person)
  const basePrivateRate = config.baseRate;
  
  // 2. Group In-Person (70% of Base)
  const groupCampusHourly = basePrivateRate * 0.70;
  
  // 3. Group Online (70% of Group In-Person)
  const groupOnlineHourly = groupCampusHourly * 0.70;

  // Select Rate based on Mode
  const currentHourlyRate = learningMode === 'campus' ? groupCampusHourly : groupOnlineHourly;
  
  // Calculate Totals
  const costPerLesson = currentHourlyRate * config.lessonDuration;
  const totalTermCost = costPerLesson * WEEKS_PER_TERM;
  
  // Display Price (Quarterly or Monthly)
  const displayPrice = billingPeriod === 'quarterly' 
    ? Math.round(totalTermCost) 
    : Math.round(totalTermCost / 3);

  return (
    <div className="bg-white bg-slate-50 min-h-screen font-sans pt-20">
      
      {/* Header - White background, adjusted padding */}
      <div className="bg-white pt-24 pb-32 px-4 border-b border-slate-100 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-sans font-bold mb-6 tracking-tight text-slate-900">
            Transparent <span className="text-ryze">Pricing</span>
          </h1>
          <p className="text-xl text-slate-400 font-light max-w-2xl mx-auto leading-relaxed">
            Choose the learning environment that suits you. No lock-in contracts, just results.
          </p>
        </div>
      </div>

      {/* Main Calculator Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 pb-32 relative z-20 ">
        
        {/* Controls Container - Removed border, lightened shadow, ensured white bg */}
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 p-6 md:p-10 mb-12">
           
           {/* Row 1: Selectors */}
           <div className="flex flex-col md:flex-row gap-6 justify-center items-center mb-10">
              <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-200 w-full md:w-auto">
                 <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-700 font-bold shadow-sm">1</div>
                 <select 
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value as YearLevel)}
                    className="bg-transparent text-lg font-bold text-slate-900 outline-none w-full md:w-48 cursor-pointer py-2"
                 >
                    {Object.keys(PRICING_DB).map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                 </select>
              </div>

              <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-200 w-full md:w-auto">
                 <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-700 font-bold shadow-sm">2</div>
                 <select 
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value as Subject)}
                    className="bg-transparent text-lg font-bold text-slate-900 outline-none w-full md:w-48 cursor-pointer py-2"
                 >
                    {availableSubjects.map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                 </select>
              </div>
              
              <div className="hidden md:block w-px h-12 bg-slate-200 mx-4"></div>

              {/* Billing Toggle */}
              <div className="flex items-center gap-3 bg-slate-100 p-1.5 rounded-full relative">
                 <button 
                   onClick={() => setBillingPeriod('quarterly')}
                   className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 relative z-10 ${
                     billingPeriod === 'quarterly' ? 'text-white shadow-md' : 'text-slate-500 hover:text-slate-900'
                   }`}
                 >
                   Quarterly
                   {billingPeriod === 'quarterly' && (
                     <motion.div layoutId="billing-pill" className="absolute inset-0 bg-slate-900 rounded-full -z-10" />
                   )}
                 </button>
                 <button 
                   onClick={() => setBillingPeriod('monthly')}
                   className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 relative z-10 ${
                     billingPeriod === 'monthly' ? 'text-white shadow-md' : 'text-slate-500 hover:text-slate-900'
                   }`}
                 >
                   Monthly
                   {billingPeriod === 'monthly' && (
                     <motion.div layoutId="billing-pill" className="absolute inset-0 bg-slate-900 rounded-full -z-10" />
                   )}
                 </button>
              </div>
           </div>

           {/* Row 2: Mode Tabs */}
           <div className="border-b-2 border-slate-100 flex justify-center gap-12 mb-12">
              <button 
                onClick={() => setLearningMode('campus')}
                className={`pb-4 text-xl font-bold flex items-center gap-2 transition-colors relative ${learningMode === 'campus' ? 'text-ryze' : 'text-slate-400 hover:text-slate-600'}`}
              >
                 <MapPin size={20} /> on-campus
                 {learningMode === 'campus' && (
                    <motion.div layoutId="mode-underline" className="absolute bottom-[-2px] left-0 w-full h-[2px] bg-ryze" />
                 )}
              </button>
              <button 
                onClick={() => setLearningMode('online')}
                className={`pb-4 text-xl font-bold flex items-center gap-2 transition-colors relative ${learningMode === 'online' ? 'text-purple-500' : 'text-slate-400 hover:text-slate-600'}`}
              >
                 <Laptop size={20} /> online
                 {learningMode === 'online' && (
                    <motion.div layoutId="mode-underline" className="absolute bottom-[-2px] left-0 w-full h-[2px] bg-purple-500" />
                 )}
              </button>
           </div>
           
           {/* Price Display */}
           <div className="text-center">
              <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Estimated Cost</div>
              <div className="flex items-center justify-center gap-2 text-slate-900 mb-4">
                 <span className="text-6xl font-bold">${displayPrice}</span>
                 <span className="text-xl font-medium text-slate-500 self-end mb-2">/{billingPeriod === 'quarterly' ? 'term' : 'month'}</span>
              </div>
              <p className="text-slate-500 text-sm mb-8">
                 Based on {learningMode === 'campus' ? 'in-person small group' : 'online small group'} lessons for {selectedYear} {selectedSubject}.
              </p>
              
              <button 
                onClick={() => navigate('/contact')}
                className="px-10 py-4 bg-ryze text-white font-bold rounded-full text-lg shadow-xl hover:bg-ryze-600 hover:scale-105 transition-all w-full md:w-auto"
              >
                Get Started
              </button>
           </div>

        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {[
             { title: "Small Groups", desc: "Max 6 students ensures individual attention.", icon: Check },
             { title: "Expert Tutors", desc: "Qualified teachers and high achievers.", icon: Star },
             { title: "Flexible", desc: "Switch between online and campus easily.", icon: HelpCircle }
           ].map((feature, i) => (
             <div key={i} className="bg-white p-8 rounded-3xl border border-slate-100 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-ryze shrink-0">
                  <feature.icon size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">{feature.title}</h3>
                  <p className="text-slate-500 text-sm">{feature.desc}</p>
                </div>
             </div>
           ))}
        </div>

      </div>
    </div>
  );
};

export default Pricing;
