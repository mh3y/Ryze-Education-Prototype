import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  CreditCard,
  DollarSign,
  FileText,
  Gift,
  Hand,
  Home,
  Laptop,
  MessageCircle,
  Repeat,
  Search,
  Sparkles,
  Target,
  TrendingUp,
  User,
  Users,
  Zap,
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

  const handleFormatSelect = (format: FormatOption) => {
    setActiveFormat(format);

    const targetSectionId = format === 'private' ? 'private-mentorship' : 'group-tutoring';
    const targetSection = document.getElementById(targetSectionId);
    targetSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={pageShift}
      className="ryze-bg-primary ryze-text-primary"
    >
      <section className="ryze-page-hero relative overflow-hidden border-b ryze-border-subtle">
        <div className="pointer-events-none absolute left-1/2 top-[-12rem] h-[34rem] w-[72rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(243,231,201,0.58),transparent_72%)] opacity-90 blur-3xl" />
        <div className="pointer-events-none absolute right-[-8rem] top-[-5rem] hidden h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.52),transparent_72%)] opacity-85 blur-3xl lg:block" />
        <div className="mx-auto grid max-w-7xl gap-12 px-4 pb-18 pt-18 sm:px-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] lg:gap-14 lg:px-8 lg:pb-24 lg:pt-24">
          <FadeInSection as="div" className="relative z-10 max-w-3xl self-center">
            <span className="inline-flex rounded-full border border-[rgba(184,132,30,0.28)] bg-white/72 px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.32em] text-[#b8841e]">
              Learning Formats
            </span>
            <h1 className="mt-6 max-w-[10.5ch] ryze-heading-1 ryze-text-primary">
              A clearer structure for how students learn best.
            </h1>
            <p className="mt-6 max-w-[35rem] text-[1.08rem] leading-8 ryze-text-secondary sm:text-[1.12rem]">
              Ryze offers both private tutoring and small-group classes. The difference is not status. It is fit.
              We help families choose the format that gives the student the clearest route to stronger mathematics.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-[#b8841e] px-6 py-3.5 text-sm font-semibold ryze-text-inverse transition hover:bg-[#9d7119]"
              >
                Book a consultation
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/how-it-works"
                className="inline-flex items-center gap-2 rounded-full border ryze-border-subtle bg-white/70 px-6 py-3.5 text-sm font-semibold ryze-text-primary transition hover:border-[rgba(184,132,30,0.28)] hover:bg-white"
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
                  <p className="mt-2 text-[0.95rem] font-medium leading-6 ryze-text-primary">{item.value}</p>
                </div>
              ))}
            </div>
          </FadeInSection>

          <FadeInSection as="aside" className="relative z-10 self-center lg:justify-self-end">
            <div className="relative overflow-hidden rounded-[2.2rem] border border-white/8 bg-[#151b25] p-7 ryze-text-inverse shadow-[0_42px_100px_-56px_rgba(17,21,29,0.82)] sm:p-8 lg:p-9">
              <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.16),transparent)]" />
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-[#d7b878]">
                    Recommended Approach
                  </p>
                  <h2 className="mt-3 max-w-sm ryze-heading-2 ryze-text-inverse">
                    Choose by student need, not by habit.
                  </h2>
                </div>
                <div className="hidden rounded-2xl border border-white/10 bg-white/6 p-4 sm:block">
                  <Users className="h-6 w-6 text-[#d7b878]" />
                </div>
              </div>

              <p className="mt-5 max-w-[30rem] text-[0.98rem] leading-7 ryze-text-inverse-muted">
                Each pathway is built to solve a different learning problem. The right fit should make progress easier to sustain, not harder to force.
              </p>

              <div className="mt-8 space-y-4">
                {(['group', 'private'] as FormatOption[]).map((format) => {
                  const item = formatCards[format];
                  const active = activeFormat === format;
                  return (
                    <button
                      key={format}
                      type="button"
                      onClick={() => handleFormatSelect(format)}
                      className={`w-full rounded-[1.6rem] border px-5 py-5 text-left transition ${
                        active
                          ? 'border-[#d7b878] bg-white text-[#151b25] shadow-[0_24px_44px_-28px_rgba(215,184,120,0.88)]'
                          : 'border-white/10 bg-white/4 ryze-text-inverse hover:border-white/18 hover:bg-white/7'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className={`text-[0.72rem] font-semibold uppercase tracking-[0.24em] ${active ? 'text-[#9d7119]' : 'text-[#d7b878]'}`}>
                            {item.eyebrow}
                          </p>
                          <p className={`mt-2 text-[1.05rem] font-semibold leading-7 ${active ? 'text-[#151b25]' : 'ryze-text-inverse'}`}>
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

      <FadeInSection
        as="section"
        className="mx-auto max-w-7xl px-4 py-18 sm:px-6 lg:px-8 lg:py-24"
      >
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex rounded-full border border-[rgba(184,132,30,0.24)] bg-white/78 px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.3em] text-[#b8841e]">
            Journey
          </span>
          <h2 className="mt-5 ryze-heading-2 ryze-text-primary">
            Your child&apos;s learning journey
          </h2>
          <p className="mt-5 text-[1.05rem] leading-8 ryze-text-secondary">
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
                      <span className="text-[0.72rem] font-medium uppercase tracking-[0.16em] ryze-text-secondary">Step</span>
                    </div>
                    <h3 className="mt-4 ryze-heading-3 ryze-text-primary">
                      {step.title}
                    </h3>
                    <p className="mt-3 text-[0.98rem] leading-8 ryze-text-secondary">{step.description}</p>
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
                      <h3 className="mt-4 ryze-heading-3 ryze-text-primary">
                        {step.title}
                      </h3>
                      <p className="mt-4 text-[0.98rem] leading-8 ryze-text-secondary">{step.description}</p>
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
                      <p className="mt-3 text-[0.62rem] font-semibold uppercase tracking-[0.22em] ryze-text-secondary">Step</p>
                      <p className="mt-1 font-display text-[2.15rem] leading-none tracking-[-0.05em] ryze-text-primary">
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

      <section className="border-y ryze-border-subtle bg-[#151b25] py-18 ryze-text-inverse lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:items-start lg:px-8">
          <FadeInSection as="div" className="lg:sticky lg:top-28">
            <span className="inline-flex rounded-full border border-white/10 bg-white/6 px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-[#d7b878]">
              Format Detail
            </span>
            <h2 className="mt-5 max-w-lg ryze-heading-2 ryze-text-inverse">
              {currentFormat.title}
            </h2>
            <p className="mt-6 max-w-lg text-[1.04rem] leading-8 ryze-text-inverse-muted">{currentFormat.description}</p>
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
                    <p className="mt-5 text-[1.02rem] leading-8 ryze-text-inverse-muted">{point}</p>
                  </div>
                ))}
                <div className="rounded-[1.7rem] border border-[rgba(215,184,120,0.24)] bg-[linear-gradient(180deg,rgba(215,184,120,0.12),rgba(255,255,255,0.04))] p-6 sm:col-span-2">
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-[#d7b878]">
                    What stays constant
                  </p>
                  <p className="mt-4 text-[1.02rem] leading-8 ryze-text-inverse-muted">
                    Regardless of format, Ryze keeps the same standard: rigorous mathematics teaching, clear communication, and a structure that helps students build confidence through real understanding.
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ── Group Tutoring Detail ─────────────────────────────────────── */}
      <FadeInSection
        as="section"
        className="mx-auto max-w-7xl px-4 py-18 sm:px-6 lg:px-8 lg:py-24"
      >
        <div
          id="group-tutoring"
          className="scroll-mt-28 rounded-[2.4rem] border border-[rgba(23,29,40,0.1)] bg-white/82 p-8 shadow-[0_28px_70px_-50px_rgba(17,21,29,0.44)] sm:p-10 lg:p-14"
        >
          <div className="mx-auto max-w-3xl text-center mb-12">
            <h2 className="ryze-heading-2 ryze-text-primary mb-4">
              How Our Group Tutoring Works
            </h2>
          </div>

          <div className="grid gap-10 lg:grid-cols-2">
            {/* What Makes Us Special */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <span className="h-2.5 w-2.5 rounded-full bg-[#b8841e]" />
                <h3 className="ryze-heading-3 ryze-text-primary">
                  What Makes Us Special
                </h3>
              </div>
              <div className="space-y-4">
                {[
                  { icon: MessageCircle, title: 'Collaborative Learning Environment', desc: 'Learn with peers, share ideas, and gain multiple perspectives on concepts.' },
                  { icon: DollarSign, title: 'Excellent Value for Money', desc: 'Share costs while getting quality and personalised attention.' },
                  { icon: Zap, title: 'Motivation & Accountability', desc: 'Stay motivated with study partners and build lasting friendships.' },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-4 rounded-[1.4rem] border border-[rgba(23,29,40,0.08)] bg-white/70 p-5 shadow-[0_14px_36px_-28px_rgba(17,21,29,0.2)]">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[rgba(184,132,30,0.1)] text-[#b8841e]">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[1rem] font-bold ryze-text-primary">{item.title}</p>
                      <p className="mt-1 text-[0.94rem] leading-7 ryze-text-secondary">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Our Group Structure */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <span className="h-2.5 w-2.5 rounded-full bg-[#b8841e]" />
                <h3 className="ryze-heading-3 ryze-text-primary">
                  Our Group Structure
                </h3>
              </div>
              <div className="space-y-4">
                <div className="rounded-[1.4rem] border border-[rgba(23,29,40,0.08)] bg-white/70 p-5 shadow-[0_14px_36px_-28px_rgba(17,21,29,0.2)]">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[rgba(184,132,30,0.1)] text-[#b8841e]">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[1rem] font-bold ryze-text-primary">Small Group Sizes</p>
                      <p className="mt-1 text-[0.94rem] leading-7 ryze-text-secondary">Maximum 4–6 students per group</p>
                    </div>
                  </div>
                  <div className="mt-3 ml-15 space-y-1">
                    <p className="flex items-center gap-2 text-[0.92rem] ryze-text-secondary">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-[#b8841e]" /> Optimal size for personalised attention
                    </p>
                    <p className="flex items-center gap-2 text-[0.92rem] ryze-text-secondary">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-[#b8841e]" /> Everyone gets to participate actively
                    </p>
                  </div>
                </div>

                <div className="rounded-[1.4rem] border border-[rgba(23,29,40,0.08)] bg-white/70 p-5 shadow-[0_14px_36px_-28px_rgba(17,21,29,0.2)]">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[rgba(184,132,30,0.1)] text-[#b8841e]">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[1rem] font-bold ryze-text-primary">Extended Sessions</p>
                      <p className="mt-1 text-[0.94rem] leading-7 ryze-text-secondary">120-minute focused learning blocks</p>
                    </div>
                  </div>
                  <div className="mt-3 ml-15 space-y-1">
                    <p className="flex items-center gap-2 text-[0.92rem] ryze-text-secondary">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-[#b8841e]" /> More time for deep understanding
                    </p>
                    <p className="flex items-center gap-2 text-[0.92rem] ryze-text-secondary">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-[#b8841e]" /> Theory instruction combined with practice questions
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <h3 className="ryze-heading-3 ryze-text-primary mb-2">
              Ready to Join a Learning Community?
            </h3>
            <Link
              to="/contact"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#b8841e] px-8 py-3.5 text-sm font-semibold ryze-text-inverse transition hover:bg-[#9d7119]"
            >
              Book Group Tutoring
            </Link>
          </div>
        </div>
      </FadeInSection>

      {/* ── Private Mentorship Detail ────────────────────────────────── */}
      <FadeInSection
        as="section"
        id="private-mentorship"
        className="mx-auto max-w-7xl scroll-mt-28 px-4 pb-18 sm:px-6 lg:px-8 lg:pb-24"
      >
        <div className="rounded-[2.4rem] border border-[rgba(23,29,40,0.1)] bg-white/82 p-8 shadow-[0_28px_70px_-50px_rgba(17,21,29,0.44)] sm:p-10 lg:p-14">
          <div className="mx-auto max-w-3xl text-center mb-8">
            <h2 className="ryze-heading-2 ryze-text-primary mb-4">
              How Our Private Mentorship Works
            </h2>
          </div>

          {/* Premium badge */}
          <div className="mx-auto mb-12 max-w-3xl rounded-[1.6rem] border border-[rgba(184,132,30,0.2)] bg-[rgba(184,132,30,0.06)] p-5">
            <div className="flex items-center gap-3">
              <span className="shrink-0 rounded-full bg-[#b8841e] px-3.5 py-1.5 text-[0.72rem] font-bold uppercase tracking-[0.2em] ryze-text-inverse">
                Premium
              </span>
              <p className="text-[0.96rem] leading-7 ryze-text-secondary">
                We deliberately limit our private intake to ensure the highest quality of service and mentor availability.
              </p>
            </div>
          </div>

          <div className="grid gap-10 lg:grid-cols-2">
            {/* What Makes Us Special */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <span className="h-2.5 w-2.5 rounded-full bg-[#b8841e]" />
                <h3 className="ryze-heading-3 ryze-text-primary">
                  What Makes Us Special
                </h3>
              </div>
              <div className="space-y-4">
                {[
                  { icon: User, title: '100% Personalised Learning Plans', desc: 'Custom learning plans tailored to your unique style and goals.' },
                  { icon: Sparkles, title: 'Expert Tutor Matching', desc: 'Matched with tutors who excel in your subject and connect with your personality.' },
                  { icon: TrendingUp, title: 'Continuous Progress Tracking', desc: 'Regular assessments and detailed reports keep you on track to success.' },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-4 rounded-[1.4rem] border border-[rgba(23,29,40,0.08)] bg-white/70 p-5 shadow-[0_14px_36px_-28px_rgba(17,21,29,0.2)]">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[rgba(99,102,241,0.1)] text-[#6366f1]">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[1rem] font-bold ryze-text-primary">{item.title}</p>
                      <p className="mt-1 text-[0.94rem] leading-7 ryze-text-secondary">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Choose How You Learn Best */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <span className="h-2.5 w-2.5 rounded-full bg-[#b8841e]" />
                <h3 className="ryze-heading-3 ryze-text-primary">
                  Choose How You Learn Best
                </h3>
              </div>
              <div className="space-y-4">
                <div className="rounded-[1.4rem] border border-[rgba(23,29,40,0.08)] bg-white/70 p-5 shadow-[0_14px_36px_-28px_rgba(17,21,29,0.2)]">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[rgba(99,102,241,0.1)] text-[#6366f1]">
                      <Laptop className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[1rem] font-bold ryze-text-primary">Online Tutoring</p>
                      <p className="mt-1 text-[0.94rem] leading-7 ryze-text-secondary">Live sessions via Zoom</p>
                    </div>
                  </div>
                  <div className="mt-3 ml-15 space-y-1">
                    <p className="flex items-center gap-2 text-[0.92rem] ryze-text-secondary">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-[#6366f1]" /> Study from anywhere in Australia
                    </p>
                    <p className="flex items-center gap-2 text-[0.92rem] ryze-text-secondary">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-[#6366f1]" /> Digital whiteboard and screen sharing
                    </p>
                  </div>
                </div>

                <div className="rounded-[1.4rem] border border-[rgba(23,29,40,0.08)] bg-white/70 p-5 shadow-[0_14px_36px_-28px_rgba(17,21,29,0.2)]">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[rgba(99,102,241,0.1)] text-[#6366f1]">
                      <Home className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[1rem] font-bold ryze-text-primary">In-Person Tutoring</p>
                      <p className="mt-1 text-[0.94rem] leading-7 ryze-text-secondary">Face-to-face learning</p>
                    </div>
                  </div>
                  <div className="mt-3 ml-15">
                    <p className="text-[0.92rem] leading-7 ryze-text-secondary">
                      Due to high demand, we&apos;re limiting in-person tutoring to select areas to maintain our quality standards.
                    </p>
                    <Link to="/contact" className="mt-1 inline-block text-[0.92rem] font-semibold text-[#6366f1] underline decoration-[#6366f1]/30 underline-offset-2 hover:text-[#4f46e5]">
                      Get in touch for more information.
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <h3 className="ryze-heading-3 ryze-text-primary mb-2">
              Ready to Start Your Success Story?
            </h3>
            <Link
              to="/contact"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#6366f1] px-8 py-3.5 text-sm font-semibold ryze-text-inverse transition hover:bg-[#4f46e5]"
            >
              Book Private Mentorship
            </Link>
          </div>
        </div>
      </FadeInSection>

      {/* ── Discounts ────────────────────────────────────────────────── */}
      <FadeInSection as="section" className="mx-auto max-w-7xl px-4 pb-18 sm:px-6 lg:px-8 lg:pb-24">
        <div className="mx-auto max-w-3xl text-center mb-12">
          <h2 className="ryze-heading-2 ryze-text-primary mb-4">
            Available Discounts
          </h2>
          <p className="mt-5 text-[1.05rem] leading-8 ryze-text-secondary">
            Save up to 50% through early enrolment, multiple subjects, upfront payments, and referrals. Reach out to us to discuss how we can help you!
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-5">
          {/* Early Enrolments */}
          <div className="w-full sm:w-[calc(50%-0.625rem)] lg:w-[calc(33.333%-0.835rem)] rounded-[1.8rem] border border-[rgba(23,29,40,0.1)] bg-white/82 p-6 shadow-[0_20px_50px_-42px_rgba(17,21,29,0.38)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[rgba(5,150,105,0.1)] text-[#059669]">
                <Calendar className="h-5 w-5" />
              </div>
              <h3 className="text-[1.08rem] font-bold ryze-text-primary">Early Enrolments</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-[#059669] px-2 py-0.5 text-[0.78rem] font-bold ryze-text-inverse">7.5%</span>
                <span className="text-[0.92rem] ryze-text-secondary">before Jun 30, 2026</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-[#059669] px-2 py-0.5 text-[0.78rem] font-bold ryze-text-inverse">5%</span>
                <span className="text-[0.92rem] ryze-text-secondary">before Jul 31, 2026</span>
              </div>
            </div>
          </div>

          {/* Pay Year Upfront */}
          <div className="w-full sm:w-[calc(50%-0.625rem)] lg:w-[calc(33.333%-0.835rem)] rounded-[1.8rem] border border-[rgba(23,29,40,0.1)] bg-white/82 p-6 shadow-[0_20px_50px_-42px_rgba(17,21,29,0.38)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[rgba(5,150,105,0.1)] text-[#059669]">
                <CreditCard className="h-5 w-5" />
              </div>
              <h3 className="text-[1.08rem] font-bold ryze-text-primary">Pay Year Upfront</h3>
            </div>
            <p className="text-[0.94rem] leading-7 ryze-text-secondary">
              Receive a <span className="rounded-md bg-[#059669] px-1.5 py-0.5 text-[0.78rem] font-bold ryze-text-inverse">15% discount</span> when you pay for the full year in advance.
            </p>
          </div>

          {/* Rebate Rewards */}
          <div className="w-full sm:w-[calc(50%-0.625rem)] lg:w-[calc(33.333%-0.835rem)] rounded-[1.8rem] border border-[rgba(23,29,40,0.1)] bg-white/82 p-6 shadow-[0_20px_50px_-42px_rgba(17,21,29,0.38)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[rgba(5,150,105,0.1)] text-[#059669]">
                <Repeat className="h-5 w-5" />
              </div>
              <h3 className="text-[1.08rem] font-bold ryze-text-primary">Rebate Rewards</h3>
            </div>
            <p className="text-[0.94rem] leading-7 ryze-text-secondary">
              Alternatively, we offer <span className="rounded-md bg-[#059669] px-1.5 py-0.5 text-[0.78rem] font-bold ryze-text-inverse">7.5% rebate</span> / cash back towards your next course if you decide to continue the following term.
            </p>
          </div>

          {/* Sibling Discounts */}
          <div className="w-full sm:w-[calc(50%-0.625rem)] lg:w-[calc(33.333%-0.835rem)] rounded-[1.8rem] border border-[rgba(23,29,40,0.1)] bg-white/82 p-6 shadow-[0_20px_50px_-42px_rgba(17,21,29,0.38)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[rgba(5,150,105,0.1)] text-[#059669]">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="text-[1.08rem] font-bold ryze-text-primary">Sibling Discounts</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-[#059669] px-2 py-0.5 text-[0.78rem] font-bold ryze-text-inverse">10% off</span>
                <span className="text-[0.92rem] ryze-text-secondary">for the second child</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-[#059669] px-2 py-0.5 text-[0.78rem] font-bold ryze-text-inverse">20% off</span>
                <span className="text-[0.92rem] ryze-text-secondary">for any additional siblings</span>
              </div>
            </div>
          </div>

          {/* Referral Bonus */}
          <div className="w-full sm:w-[calc(50%-0.625rem)] lg:w-[calc(33.333%-0.835rem)] rounded-[1.8rem] border border-[rgba(23,29,40,0.1)] bg-white/82 p-6 shadow-[0_20px_50px_-42px_rgba(17,21,29,0.38)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[rgba(5,150,105,0.1)] text-[#059669]">
                <Gift className="h-5 w-5" />
              </div>
              <h3 className="text-[1.08rem] font-bold ryze-text-primary">Referral Bonus</h3>
            </div>
            <p className="text-[0.94rem] leading-7 ryze-text-secondary">
              Refer a friend and you&apos;ll both receive a <span className="rounded-md bg-[#059669] px-1.5 py-0.5 text-[0.78rem] font-bold ryze-text-inverse">$100 credit</span> towards your enrolments.
            </p>
            <p className="mt-2 text-[0.82rem] italic text-[var(--muted)]/70">*Conditions apply. Credits are applied after successful enrolment.</p>
          </div>
        </div>
      </FadeInSection>

      <FadeInSection as="section" className="mx-auto max-w-5xl px-4 pb-18 sm:px-6 lg:px-8 lg:pb-24">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex rounded-full border border-[rgba(184,132,30,0.24)] bg-white/78 px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-[#b8841e]">
            FAQs
          </span>
          <h2 className="mt-5 ryze-heading-2 ryze-text-primary mb-4">
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
        <span className="text-[1.05rem] font-semibold leading-7 ryze-text-primary">{question}</span>
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
              <p className="text-[1rem] leading-8 ryze-text-secondary">{answer}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LearningStyle;
