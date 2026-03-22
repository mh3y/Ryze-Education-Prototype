import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { HelpCircle, Minus, Plus } from 'lucide-react';

type FAQSectionProps = {
  onScrollToCta: () => void;
};

const faqData = [
  {
    question: 'What makes Ryze different?',
    answer: `Most tutors are university students who did well in maths.

We are founded and led by NSW accredited teachers who've marked HSC papers and taught in NSW classrooms while also being high achievers themselves. That means you learn with syllabus‑aligned resources built by educators who understand the marking criteria, the common mistakes, and what separates strong performances from exceptional ones.

While other students work through generic materials, you're training with resources that mirror your actual exams: same structure, same standards.

The result?

Faster improvement. Deeper understanding. And a real competitive edge over other students.`,
  },
  {
    question: 'What subjects do you offer?',
    answer: `Mathematics. From primary through to HSC Extension 2.

We offer dedicated support for NAPLAN, OC, and Selective Exam Preparation.

We specialise. We don't spread ourselves thin across every subject. We focus on maths — and we do it better than anyone else.`,
  },
  {
    question: 'What discounts do you have?',
    answer: `You can save up to 50% through early enrolment, multiple subjects, upfront payments, and referrals.
    
We believe every student deserves access to exceptional education. That's why we offer substantial discounts to make it happen.

Reach out and let's discuss how we can support you.`,
  },
  {
    question: 'What qualifications do we hold?',
    answer: `NSW accredited teachers. PhD scholars. HSC markers.

Not just high achievers — actual teachers or educators with extensive classroom experience.

We don't just know the content. We know how it's taught, how it's tested, and how to help you master it.

That's the standard. No exceptions.`,
  },
  {
    question: 'What does Ryze mentorship program offer?',
    answer: `More than theory. More than practice questions.

Our founders and educators aren't just teachers — they're accomplished scholars and passionate mentors who have excelled at the highest levels of mathematics and education. They bring real-world expertise, academic rigor, and genuine care to every session. Students gain more than subject knowledge; they receive career guidance, study strategies, and inspiration from mentors who truly understand the path to success. 

When you join Ryze Education, you become part of a community dedicated to academic excellence and personal growth. Our students support each other, learn from the best, and develop the skills and mindset needed to thrive — not just in maths, but in all their future endeavors.`,
  },
];

const FAQSection: React.FC<FAQSectionProps> = ({ onScrollToCta }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <section className="bg-[rgba(243,231,201,0.18)] ryze-section-padding">
      <div className="ryze-container">
        <div className="mb-12 max-w-3xl">
          <div className="eyebrow">FAQs</div>
          <h2 className="mt-5 ryze-heading-2 ryze-text-primary">
            Questions families often ask
          </h2>
          <p className="mt-5 text-[1.02rem] leading-relaxed ryze-text-secondary">
            If you need more detail, we are happy to talk through year level, goals, format, and fit.
            <button
              type="button"
              onClick={onScrollToCta}
              className="ml-2 font-semibold text-[var(--accent)] transition-colors hover:text-[var(--color-ryze-400)]"
            >
              Contact us
            </button>
            .
          </p>
        </div>
        <div className="space-y-4">
          {faqData.map((faq, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-[1.8rem] border ryze-border-subtle bg-[rgba(248,243,234,0.92)] shadow-[0_18px_42px_-34px_rgba(17,21,29,0.18)]"
            >
              <button
                type="button"
                className="flex w-full items-start justify-between gap-6 px-7 py-6 text-left"
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
              >
                <div className="flex items-start gap-4">
                  <HelpCircle size={22} className="mt-1 shrink-0 text-[var(--accent)]" />
                  <p className="text-[1.08rem] font-semibold leading-snug ryze-text-primary">
                    {faq.question}
                  </p>
                </div>
                {openFaq === index ? (
                  <Minus className="mt-1 shrink-0 text-[var(--accent)]" />
                ) : (
                  <Plus className="mt-1 shrink-0 text-[var(--accent)]" />
                )}
              </button>
              <AnimatePresence initial={false}>
                {openFaq === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.28, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="border-t ryze-border-subtle px-7 pb-7 pt-5">
                      <div className="space-y-4 pl-9 text-[1rem] leading-relaxed ryze-text-secondary">
                        {faq.answer.split('\n\n').map((paragraph, pIndex) => (
                          <p key={pIndex}>{paragraph.trim()}</p>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
