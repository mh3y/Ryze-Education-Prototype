
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, HelpCircle, BookOpen, CreditCard, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqCategory {
  title: string;
  icon: React.ElementType;
  questions: FaqItem[];
}

const FAQ: React.FC = () => {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  const toggleAccordion = (index: string) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqData: FaqCategory[] = [
    {
      title: "General Information",
      icon: HelpCircle,
      questions: [
        {
          question: "How is Ryze different from other tutoring centres?",
          answer: "The biggest difference is our class size and teaching philosophy. Unlike major centres that host lecture-style classes with 20+ students, we cap every class at 6 students. This allows our tutors to actually know your child, identify their specific gaps, and provide the individual attention usually reserved for private tutoring, but within a collaborative small-group environment."
        },
        {
          question: "Where are classes held?",
          answer: "Our campus classes are held at our dedicated centre in Sydney. We also offer high-definition online classes via Zoom/Teams for students who prefer to learn from home. Both formats maintain the strict 6-student cap to ensure quality."
        },
        {
          question: "Who are the tutors?",
          answer: "Our team consists of NSW-accredited teachers, PhD candidates, and high-achieving university graduates. We don't just hire based on ATAR; we look for communication skills and emotional intelligence. All tutors undergo our specific training on the 'Ryze Method' of diagnostic teaching."
        }
      ]
    },
    {
      title: "Classes & Academics",
      icon: BookOpen,
      questions: [
        {
          question: "What happens if my child misses a lesson?",
          answer: "We understand that life happens. If a student misses a class, they can access a recording of the lesson via the Student Portal. All materials, homework, and notes are also available digitally so they can catch up before the next session."
        },
        {
          question: "Is there homework?",
          answer: "Yes. Mastery requires practice. We assign targeted homework each week to consolidate what was learnt in class. However, we focus on quality over quantity—we don't believe in busy work. Homework is marked with feedback provided to help students improve."
        },
        {
          question: "Do you follow the school curriculum?",
          answer: "Absolutely. Our programs are strictly aligned with the NSW Syllabus (NESA). For our Year 11 and 12 courses, we are laser-focused on HSC requirements to ensure students maximize their internal ranks and final exam results."
        },
        {
          question: "Do you offer trial lessons?",
          answer: "Yes! We believe you should experience the difference before committing. We offer a paid trial lesson which is fully refundable if you decide not to continue. This allows your child to meet the tutor and see if our small-group dynamic is the right fit."
        }
      ]
    },
    {
      title: "Enrolment & Billing",
      icon: CreditCard,
      questions: [
        {
          question: "Are there lock-in contracts?",
          answer: "No. We operate on a term-by-term basis. While most students stay with us for years, you are not locked into long-term contracts. We believe our results should be the reason you stay, not a contract."
        },
        {
          question: "How do payments work?",
          answer: "We offer both quarterly (term) and monthly payment options to suit your budget. Invoices are sent via email and can be paid securely online via credit card or direct debit."
        },
        {
          question: "Are materials included in the fee?",
          answer: "Yes. All course fees cover the cost of our proprietary theory books, workbooks, and access to the Ryze AI online platform. There are no hidden resource fees."
        }
      ]
    }
  ];

  return (
    <div className="font-sans bg-slate-50 min-h-screen">
      {/* Header - Standardized */}
      <div className="bg-white pt-32 md:pt-40 pb-20 px-4 border-b border-slate-100">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-sans font-bold mb-6 text-slate-900 tracking-tight">Frequently Asked Questions</h1>
          <p className="text-xl text-slate-500 font-light max-w-2xl mx-auto">
            Everything you need to know about our classes, methodology, and enrolment process.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        
        {faqData.map((category, catIdx) => (
          <div key={catIdx} className="mb-16 last:mb-0">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-[#FFB000]/10 flex items-center justify-center text-[#FFB000]">
                <category.icon size={24} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">{category.title}</h2>
            </div>

            <div className="space-y-4">
              {category.questions.map((item, qIdx) => {
                const index = `${catIdx}-${qIdx}`;
                const isOpen = openIndex === index;

                return (
                  <motion.div 
                    key={qIdx}
                    initial={false}
                    className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${isOpen ? 'border-[#FFB000] shadow-md' : 'border-slate-200 hover:border-slate-300'}`}
                  >
                    <button
                      onClick={() => toggleAccordion(index)}
                      className="w-full px-8 py-6 text-left flex justify-between items-center gap-4 focus:outline-none"
                    >
                      <span className={`font-bold text-lg transition-colors ${isOpen ? 'text-slate-900' : 'text-slate-700'}`}>
                        {item.question}
                      </span>
                      <div className={`shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                        {isOpen ? <Minus size={20} className="text-[#FFB000]" /> : <Plus size={20} className="text-slate-400" />}
                      </div>
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                        >
                          <div className="px-8 pb-8 text-slate-600 leading-relaxed">
                            {item.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}

        {/* CTA Box */}
        <div className="mt-20 bg-[#0f172a] rounded-[2.5rem] p-12 text-center relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFB000] rounded-full blur-[100px] opacity-10 pointer-events-none"></div>
           <div className="relative z-10">
              <h3 className="text-2xl font-bold text-white mb-4">Still have questions?</h3>
              <p className="text-slate-400 mb-8 max-w-lg mx-auto">
                We're happy to help. Contact our team directly to discuss your child's specific needs.
              </p>
              <button 
                onClick={() => navigate('/contact')}
                className="px-8 py-4 bg-[#FFB000] text-[#0f172a] font-bold rounded-full hover:bg-[#ffc133] transition-all shadow-lg transform hover:-translate-y-1"
              >
                Contact Us
              </button>
           </div>
        </div>

      </div>
    </div>
  );
};

export default FAQ;
