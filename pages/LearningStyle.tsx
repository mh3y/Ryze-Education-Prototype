import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  FileText,
  Hand,
  MessageCircle,
  Search,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react';
import { FadeInSection } from '../src/components/animation';

type FormatOption = 'private' | 'group';

type JourneyStep = {
  number: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
};

const formatCards = {
  private: {
    eyebrow: 'Weekly Private Tutoring',
    title: 'Dedicated one-to-one support, built around the student.',
    description:
      'Private tuition is suited to students who need diagnosis, pace adjustment, and fully personalised teaching. Each lesson is shaped around the student in front of us.',
    points: [
      'Individual pacing and explanation',
      'Direct diagnosis of misconceptions and gaps',
      'Stronger flexibility around goals and school demands',
    ],
  },
  group: {
    eyebrow: 'Small-Group Classes',
    title: 'Structured classes with clarity, rhythm, and shared momentum.',
    description:
      'Small-group tuition suits students who benefit from a well-run academic environment, explicit teaching, and guided practice alongside peers at a similar stage.',
    points: [
      'Focused, structured weekly teaching',
      'Peer energy without losing accountability',
      'A stronger rhythm for consistency and exam preparation',
    ],
  },
} satisfies Record<FormatOption, { eyebrow: string; title: string; description: string; points: string[] }>;

const journeySteps: JourneyStep[] = [
  {
    number: '01',
    title: 'Initial consultation',
    description:
      'We meet with you and your child to understand goals, current struggles, and the wider academic picture before suggesting a pathway.',
    icon: Hand,
  },
  {
    number: '02',
    title: 'Assessment and diagnosis',
    description:
      'We identify missing skills, misconceptions, and the habits that are quietly preventing progress.',
    icon: BarChart3,
  },
  {
    number: '03',
    title: 'Clear feedback',
    description:
      'Families receive a plain-English explanation of what we found, what matters most, and what should happen next.',
    icon: Search,
  },
  {
    number: '04',
    title: 'Personalised plan',
    description:
      'We recommend the most suitable format, pacing, and priorities for the next stage of learning.',
    icon: FileText,
  },
  {
    number: '05',
    title: 'Weekly teaching',
    description:
      'Lessons are built around explicit teaching, guided practice, and active problem-solving rather than passive supervision.',
    icon: BookOpen,
  },
  {
    number: '06',
    title: 'Progress tracking',
    description:
      'We monitor what has been secured, where confusion remains, and how understanding is developing over time.',
    icon: TrendingUp,
  },
  {
    number: '07',
    title: 'Regular communication',
    description:
      'Families receive clear updates so expectations, progress, and next steps remain aligned throughout the term.',
    icon: MessageCircle,
  },
  {
    number: '08',
    title: 'Assessment preparation',
    description:
      'As exams approach, we shift deliberately into revision strategy, exam judgement, and execution under pressure.',
    icon: Target,
  },
];

const faqs = [
  {
    question: 'How do I know whether private or group tuition is the better fit?',
    answer:
      'We recommend based on the student, not a script. Private tuition is usually best when gaps are significant, confidence is fragile, or pace needs to be adjusted closely. Group tuition is often excellent for students who benefit from structure, routine, and collaborative momentum.',
  },
  {
    question: 'Do students follow a fixed workbook every week?',
    answer:
      'No. Ryze uses structure, but not rigidity. Teaching is sequenced carefully, yet we still adjust examples, explanations, and priorities to the student or group in front of us.',
  },
  {
    question: 'How early should families start?',
    answer:
      'Earlier is usually better when the goal is calm, durable improvement. Students who begin before pressure peaks have more time to build fluency properly rather than trying to patch everything close to an assessment.',
  },
  {
    question: 'Will we receive feedback on progress?',
    answer:
      'Yes. Parent communication is part of the model. We want families to understand what is improving, where the student still needs support, and what the next academic priorities are.',
  },
];

const heroHighlights = [
  {
    label: 'Delivery',
    value: 'Private and small-group pathways',
  },
  {
    label: 'Teaching',
    value: 'Structured maths instruction with real diagnosis',
  },
  {
    label: 'Family clarity',
    value: 'Calm communication and visible progress',
  },
];

const pageShift = {
  initial: { opacity: 0, y: 22 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const LearningStyle: React.FC = () => {
  const [activeFormat, setActiveFormat] = useState<FormatOption>('private');
  const currentFormat = formatCards[activeFormat];

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={pageShift}
      className="bg-[var(--bg)] text-[var(--text)]"
    >
      <section className="relative overflow-hidden border-b border-[var(--border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.38),rgba(244,239,231,0.96))]">
        <div className="absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,rgba(184,132,30,0.18),transparent_60%)]" />
        <div className="absolute inset-y-0 right-0 hidden w-[34rem] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.26),transparent_68%)] lg:block" />
        <div className="mx-auto grid max-w-7xl gap-12 px-4 pb-18 pt-18 sm:px-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] lg:gap-14 lg:px-8 lg:pb-24 lg:pt-24">
          <FadeInSection as="div" className="relative z-10 max-w-3xl self-center">
            <span className="inline-flex rounded-full border border-[rgba(184,132,30,0.28)] bg-white/72 px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.32em] text-[#b8841e]">
              Learning Formats
            </span>
            <h1 className="mt-6 max-w-[10.5ch] font-display text-[clamp(3.1rem,6vw,5.6rem)] leading-[0.86] tracking-[-0.045em] text-[var(--text)]">
              A clearer structure for how students learn best.
            </h1>
            <p className="mt-6 max-w-[35rem] text-[1.08rem] leading-8 text-[var(--muted)] sm:text-[1.12rem]">
              Ryze offers both private tutoring and small-group classes. The difference is not status. It is fit.
              We help families choose the format that gives the student the clearest route to stronger mathematics.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-[#b8841e] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#9d7119]"
              >
                Book a consultation
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/how-it-works"
                className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white/70 px-6 py-3.5 text-sm font-semibold text-[var(--text)] transition hover:border-[rgba(184,132,30,0.28)] hover:bg-white"
              >
                See how it works
              </Link>
            </div>

            <div className="mt-10 grid max-w-3xl gap-3 sm:grid-cols-3">
              {heroHighlights.map((item) => (
                <div
                  key={item.label}
                  className="rounded-[1.45rem] border border-[rgba(23,29,40,0.08)] bg-white/62 px-4 py-4 shadow-[0_18px_44px_-38px_rgba(17,21,29,0.24)] backdrop-blur-sm"
                >
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#b8841e]">
                    {item.label}
                  </p>
                  <p className="mt-2 text-[0.95rem] font-medium leading-6 text-[var(--text)]">{item.value}</p>
                </div>
              ))}
            </div>
          </FadeInSection>

          <FadeInSection as="aside" className="relative z-10 self-center lg:justify-self-end">
            <div className="relative overflow-hidden rounded-[2.2rem] border border-white/8 bg-[#151b25] p-7 text-white shadow-[0_42px_100px_-56px_rgba(17,21,29,0.82)] sm:p-8 lg:p-9">
              <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.16),transparent)]" />
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-[#d7b878]">
                    Recommended Approach
                  </p>
                  <h2 className="mt-3 max-w-sm font-display text-[clamp(2.5rem,3vw,3.3rem)] leading-[0.92] tracking-[-0.04em] text-white">
                    Choose by student need, not by habit.
                  </h2>
                </div>
                <div className="hidden rounded-2xl border border-white/10 bg-white/6 p-4 sm:block">
                  <Users className="h-6 w-6 text-[#d7b878]" />
                </div>
              </div>

              <p className="mt-5 max-w-[30rem] text-[0.98rem] leading-7 text-white/68">
                Each pathway is built to solve a different learning problem. The right fit should make progress easier to sustain, not harder to force.
              </p>

              <div className="mt-8 space-y-4">
                {(['private', 'group'] as FormatOption[]).map((format) => {
                  const item = formatCards[format];
                  const active = activeFormat === format;
                  return (
                    <button
                      key={format}
                      type="button"
                      onClick={() => setActiveFormat(format)}
                      className={`w-full rounded-[1.6rem] border px-5 py-5 text-left transition ${
                        active
                          ? 'border-[#d7b878] bg-white text-[#151b25] shadow-[0_24px_44px_-28px_rgba(215,184,120,0.88)]'
                          : 'border-white/10 bg-white/4 text-white hover:border-white/18 hover:bg-white/7'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className={`text-[0.72rem] font-semibold uppercase tracking-[0.24em] ${active ? 'text-[#9d7119]' : 'text-[#d7b878]'}`}>
                            {item.eyebrow}
                          </p>
                          <p className={`mt-2 text-[1.05rem] font-semibold leading-7 ${active ? 'text-[#151b25]' : 'text-white'}`}>
                            {item.title}
                          </p>
                        </div>
                        <ArrowRight className={`mt-1 h-4 w-4 shrink-0 ${active ? 'text-[#9d7119]' : 'text-[#d7b878]'}`} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </FadeInSection>
        </div>
      </section>

      <FadeInSection as="section" className="mx-auto max-w-7xl px-4 py-18 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex rounded-full border border-[rgba(184,132,30,0.24)] bg-white/78 px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.3em] text-[#b8841e]">
            Journey
          </span>
          <h2 className="mt-5 font-display text-[clamp(2.5rem,4vw,4rem)] leading-[0.95] tracking-[-0.04em] text-[var(--text)]">
            Your child&apos;s learning journey
          </h2>
          <p className="mt-5 text-[1.05rem] leading-8 text-[var(--muted)]">
            A clearer sequence helps families understand what happens first, what happens next, and why progress becomes more measurable.
          </p>
        </div>

        <div className="mt-14 space-y-5 lg:hidden">
          {journeySteps.map((step) => {
            const Icon = step.icon;
            return (
              <FadeInSection
                key={`mobile-${step.number}`}
                as="article"
                className="rounded-[1.8rem] border border-[rgba(23,29,40,0.1)] bg-white/84 p-6 shadow-[0_22px_54px_-42px_rgba(17,21,29,0.32)]"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[rgba(184,132,30,0.12)] text-[#b8841e]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(184,132,30,0.18)] bg-[rgba(184,132,30,0.06)] px-3 py-1">
                      <span className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[#b8841e]">
                        {step.number}
                      </span>
                      <span className="h-1 w-1 rounded-full bg-[rgba(184,132,30,0.42)]" />
                      <span className="text-[0.72rem] font-medium uppercase tracking-[0.16em] text-[var(--muted)]">Step</span>
                    </div>
                    <h3 className="mt-4 font-display text-[2rem] leading-[0.92] tracking-[-0.03em] text-[var(--text)]">
                      {step.title}
                    </h3>
                    <p className="mt-3 text-[0.98rem] leading-8 text-[var(--muted)]">{step.description}</p>
                  </div>
                </div>
              </FadeInSection>
            );
          })}
        </div>

        <div className="relative mt-18 hidden lg:block">
          <div className="absolute left-1/2 top-5 h-[calc(100%-2.5rem)] w-px -translate-x-1/2 bg-[linear-gradient(180deg,rgba(184,132,30,0),rgba(184,132,30,0.34)_12%,rgba(184,132,30,0.34)_88%,rgba(184,132,30,0))]" />
          <div className="absolute left-1/2 top-3 h-3 w-3 -translate-x-1/2 rounded-full bg-[#e4c98f]" />
          <div className="absolute bottom-3 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-[#e4c98f]" />
          <div className="space-y-12">
            {journeySteps.map((step, index) => {
              const Icon = step.icon;
              const isLeft = index % 2 === 0;
              return (
                <FadeInSection
                  key={step.number}
                  as="div"
                  className="relative grid grid-cols-[minmax(0,1fr)_148px_minmax(0,1fr)] items-center gap-2"
                >
                  <div className={`${isLeft ? 'pr-12 text-right' : 'col-start-3 pl-12'}`}>
                    <div className={`mx-auto max-w-[26.5rem] ${isLeft ? 'mr-0' : 'ml-0'}`}>
                      <div className={`flex items-center gap-3 ${isLeft ? 'justify-end' : ''}`}>
                        <span className="text-[0.72rem] font-semibold uppercase tracking-[0.26em] text-[#b8841e]">
                          Step {step.number}
                        </span>
                        <span className="h-px w-14 bg-[rgba(184,132,30,0.24)]" />
                      </div>
                      <h3 className="mt-4 font-display text-[2.15rem] leading-[0.94] tracking-[-0.04em] text-[var(--text)]">
                        {step.title}
                      </h3>
                      <p className="mt-4 text-[0.98rem] leading-8 text-[var(--muted)]">{step.description}</p>
                    </div>
                  </div>

                  <div className="relative flex h-full items-center justify-center">
                    <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#b8841e] shadow-[0_0_0_8px_rgba(184,132,30,0.08)]" />
                    <div
                      className={`relative w-[5.8rem] rounded-[1.7rem] border border-[rgba(184,132,30,0.14)] bg-white/92 px-3 py-3.5 text-center shadow-[0_22px_50px_-36px_rgba(17,21,29,0.34)] ${
                        isLeft ? '-translate-x-7' : 'translate-x-7'
                      }`}
                    >
                      <div className="mx-auto inline-flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(184,132,30,0.1)] text-[#b8841e]">
                        <Icon className="h-4 w-4" />
                      </div>
                      <p className="mt-3 text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">Step</p>
                      <p className="mt-1 font-display text-[2.15rem] leading-none tracking-[-0.05em] text-[var(--text)]">
                        {step.number}
                      </p>
                    </div>
                  </div>
                </FadeInSection>
              );
            })}
          </div>
        </div>
      </FadeInSection>

      <section className="border-y border-[var(--border)] bg-[#151b25] py-18 text-white lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:items-start lg:px-8">
          <FadeInSection as="div" className="lg:sticky lg:top-28">
            <span className="inline-flex rounded-full border border-white/10 bg-white/6 px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-[#d7b878]">
              Format Detail
            </span>
            <h2 className="mt-5 max-w-lg font-display text-[clamp(2.4rem,3.8vw,4rem)] leading-[0.92] tracking-[-0.04em] text-white">
              {currentFormat.title}
            </h2>
            <p className="mt-6 max-w-lg text-[1.04rem] leading-8 text-white/72">{currentFormat.description}</p>
          </FadeInSection>

          <div className="min-h-[320px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeFormat}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18 }}
                transition={{ duration: 0.28, ease: 'easeOut' }}
                className="grid gap-4 sm:grid-cols-2"
              >
                {currentFormat.points.map((point) => (
                  <div
                    key={point}
                    className="min-h-[12.5rem] rounded-[1.7rem] border border-white/10 bg-white/5 p-6 shadow-[0_20px_50px_-40px_rgba(0,0,0,0.6)]"
                  >
                    <CheckCircle2 className="h-5 w-5 text-[#d7b878]" />
                    <p className="mt-5 text-[1.02rem] leading-8 text-white/84">{point}</p>
                  </div>
                ))}
                <div className="rounded-[1.7rem] border border-[rgba(215,184,120,0.24)] bg-[linear-gradient(180deg,rgba(215,184,120,0.12),rgba(255,255,255,0.04))] p-6 sm:col-span-2">
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-[#d7b878]">
                    What stays constant
                  </p>
                  <p className="mt-4 text-[1.02rem] leading-8 text-white/80">
                    Regardless of format, Ryze keeps the same standard: rigorous mathematics teaching, clear communication, and a structure that helps students build confidence through real understanding.
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      <FadeInSection as="section" className="mx-auto max-w-7xl px-4 py-18 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="rounded-[2rem] border border-[rgba(23,29,40,0.1)] bg-white/82 p-8 shadow-[0_28px_70px_-50px_rgba(17,21,29,0.44)]">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-[#b8841e]">Discounts</p>
            <h2 className="mt-4 font-display text-[2.5rem] leading-[0.95] tracking-[-0.04em] text-[var(--text)]">
              A considered reward for early commitment.
            </h2>
            <p className="mt-5 text-[1rem] leading-8 text-[var(--muted)]">
              Families who enrol early receive discounted pricing. It helps students begin calmly and helps us preserve the right learning environment before peak demand arrives.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: 'Yearly', value: '15% off', note: 'pay for 4 terms' },
              { label: 'Semesterly', value: '10% off', note: 'pay for 2 terms' },
              { label: 'Termly', value: 'standard', note: 'flexible starting point' },
            ].map((item) => (
              <div key={item.label} className="rounded-[1.8rem] border border-[rgba(23,29,40,0.1)] bg-white/76 p-6 shadow-[0_20px_50px_-42px_rgba(17,21,29,0.38)]">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[#b8841e]">{item.label}</p>
                <p className="mt-4 font-display text-[2.2rem] leading-none tracking-[-0.04em] text-[var(--text)]">{item.value}</p>
                <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{item.note}</p>
              </div>
            ))}
          </div>
        </div>
      </FadeInSection>

      <FadeInSection as="section" className="mx-auto max-w-5xl px-4 pb-18 sm:px-6 lg:px-8 lg:pb-24">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex rounded-full border border-[rgba(184,132,30,0.24)] bg-white/78 px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-[#b8841e]">
            FAQs
          </span>
          <h2 className="mt-5 font-display text-[clamp(2.3rem,3.4vw,3.6rem)] leading-[0.95] tracking-[-0.04em] text-[var(--text)]">
            Questions families usually ask
          </h2>
        </div>

        <div className="mt-10 space-y-4">
          {faqs.map((faq) => (
            <FAQItem key={faq.question} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </FadeInSection>
    </motion.div>
  );
};

const FAQItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-[1.6rem] border border-[rgba(23,29,40,0.1)] bg-white/82 shadow-[0_20px_50px_-42px_rgba(17,21,29,0.35)]">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left sm:px-7"
      >
        <span className="text-[1.05rem] font-semibold leading-7 text-[var(--text)]">{question}</span>
        <ChevronDown className={`h-5 w-5 shrink-0 text-[#b8841e] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="border-t border-[rgba(23,29,40,0.08)] px-6 py-5 sm:px-7">
              <p className="text-[1rem] leading-8 text-[var(--muted)]">{answer}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LearningStyle;
