import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Check,
  FileText,
  Hand,
  MessageCircle,
  Search,
  Target,
  TrendingUp,
  X,
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { FadeInSection, InteractiveLift, StaggerGroup } from '../src/components/animation';

const HowItWorks: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const principles = [
    {
      title: 'Build Strong Foundations',
      desc: "Maths is hierarchical. We identify missing foundations and rebuild them before pushing ahead.",
    },
    {
      title: 'Teach the Why',
      desc: 'Students need conceptual understanding and procedural fluency. We deliberately teach both.',
    },
    {
      title: 'Match the Student',
      desc: 'Different students need different explanations, examples, and pacing. We teach accordingly.',
    },
    {
      title: 'Be Explicit First',
      desc: 'Clarity comes before independence. We model carefully, then move students toward confident practice.',
    },
    {
      title: 'Lower Anxiety, Raise Confidence',
      desc: 'Lessons are sequenced in manageable steps so students can build confidence through real success.',
    },
    {
      title: 'Teacher Knowledge Matters',
      desc: "Our educators are not generic helpers. They understand the subject properly and teach with judgement.",
    },
  ];

  const journeySteps = [
    { number: '01', title: 'Initial consultation', desc: 'We meet with you and your child to understand goals, current struggles, and the wider academic picture.', icon: Hand },
    { number: '02', title: 'Assessment and diagnosis', desc: 'We identify missing skills, misconceptions, and the areas that are holding progress back.', icon: BarChart3 },
    { number: '03', title: 'Clear feedback', desc: 'We explain what we found, what matters most, and the realistic sequence for improvement.', icon: Search },
    { number: '04', title: 'Personalised plan', desc: 'We recommend the most suitable pathway, pacing, and focus areas for the next stage of learning.', icon: FileText },
    { number: '05', title: 'Weekly teaching', desc: 'Students attend structured sessions built around explanation, guided practice, and active problem-solving.', icon: BookOpen },
    { number: '06', title: 'Progress tracking', desc: 'We monitor what has been mastered, where confusion remains, and how understanding is developing over time.', icon: TrendingUp },
    { number: '07', title: 'Regular communication', desc: 'Families receive clear updates so expectations, progress, and next steps remain aligned.', icon: MessageCircle },
    { number: '08', title: 'Assessment preparation', desc: 'As exams approach, we shift deliberately into revision strategy, exam judgement, and execution under pressure.', icon: Target },
  ];

  const comparisonTraditional = [
    'Generic materials and worksheets',
    'Help with whatever homework appears that week',
    'Emphasis on getting answers quickly',
    'Limited parent visibility',
    'One pace for every student',
    'Reactive support before tests',
    'Progress often unclear',
  ];

  const comparisonRyze = [
    'Purpose-built curriculum and structured resources',
    'Diagnosis before acceleration',
    'Focus on understanding, transfer, and fluency',
    'Clear communication and progress updates',
    'Teaching matched to the student',
    'Long-term skill-building with exam readiness layered in',
    'Visible progress against clear priorities',
  ];

  return (
    <div className="ryze-page pt-20">
      <section className="ryze-section-padding ryze-page-hero relative overflow-hidden px-4 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(243,231,201,0.55),transparent_58%)] opacity-80"></div>
        <div className="relative z-10 mx-auto max-w-4xl">
          <div className="eyebrow justify-center">{t('How It Works')}</div>
          <h1 className="ryze-heading-1 ryze-text-primary mt-5 mb-8">
            {t('A rigorous process, clearly explained')}
          </h1>
          <p className="ryze-page-lead mx-auto max-w-2xl text-xl font-light leading-relaxed">
            {t("Our approach is straightforward: diagnose what matters, build the right plan, and teach for durable understanding rather than short-term patchwork.")}
          </p>
        </div>
      </section>

      <FadeInSection as="section" className="ryze-section-padding mx-auto max-w-6xl px-4">
        <div className="mb-16 text-center">
          <div className="eyebrow justify-center">{t('The Real Problem')}</div>
          <h2 className="ryze-heading-2 ryze-text-primary mt-5">{t('Why tutoring often falls short')}</h2>
        </div>

        <div className="grid overflow-hidden rounded-[2.6rem] border ryze-border-subtle shadow-[var(--ryze-shadow-panel)] lg:grid-cols-2">
          <div className="border-b ryze-border-subtle bg-[rgba(243,231,201,0.28)] p-12 lg:border-b-0 lg:border-r">
            <h3 className="mb-6 text-[0.92rem] font-bold uppercase tracking-[0.16em] ryze-text-secondary">{t('Expectation')}</h3>
            <p className="ryze-heading-3 ryze-text-primary mb-6">
              "{t('Tutoring is mainly about keeping up with homework and preparing for the next test.')}"
            </p>
            <p className="text-[1rem] leading-relaxed ryze-text-secondary">
              {t('That is how many families first experience tutoring, so it is understandable that expectations start there.')}
            </p>
          </div>

          <div className="relative bg-[rgba(248,243,234,0.96)] p-12">
            <div className="absolute left-0 top-0 h-1 w-full bg-[var(--accent)]"></div>
            <h3 className="mb-6 text-[0.92rem] font-bold uppercase tracking-[0.16em] text-[var(--accent)]">{t('Reality')}</h3>
            <p className="mb-6 text-[1.02rem] leading-relaxed ryze-text-secondary">
              {t("When tutoring is done properly, it is diagnostic and structured. A student struggling with algebra may actually be carrying gaps from years earlier. Unless those foundations are identified and rebuilt, progress remains fragile.")}
            </p>
            <p className="text-xl font-bold ryze-text-primary">
              {t('Real tutoring starts with diagnosis, not guesswork.')}
            </p>
          </div>
        </div>
      </FadeInSection>

      <section className="ryze-section-padding bg-[rgba(243,231,201,0.2)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeInSection as="div" className="mb-20 text-center">
            <div className="eyebrow justify-center">{t('Teaching Principles')}</div>
            <h2 className="ryze-heading-2 ryze-text-primary mt-5 mb-6">{t('The standard behind every lesson')}</h2>
            <p className="mx-auto max-w-3xl text-[1.02rem] leading-relaxed ryze-text-secondary">
              {t('Ryze is built around a small set of disciplined teaching principles. They shape both private tutoring and small-group classes.')}
            </p>
          </FadeInSection>

          <StaggerGroup as="div" className="grid gap-8 md:grid-cols-2 lg:grid-cols-3" lift>
            {principles.map((principle) => (
              <article key={principle.title} className="ryze-page-card rounded-[2rem] p-9">
                <div className="mb-6 h-1 w-14 rounded-full bg-[var(--accent)]"></div>
                <h3 className="ryze-heading-3 ryze-text-primary mb-4">{t(principle.title)}</h3>
                <p className="text-[1rem] leading-relaxed ryze-text-secondary">{t(principle.desc)}</p>
              </article>
            ))}
          </StaggerGroup>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[linear-gradient(180deg,#f6f1e9_0%,#f3ede3_100%)] py-18 sm:py-22">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(215,184,120,0.14),transparent_24%),radial-gradient(circle_at_82%_22%,rgba(255,255,255,0.8),transparent_20%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:gap-16">
            <FadeInSection as="div" className="lg:sticky lg:top-28 lg:self-start">
              <div className="inline-flex rounded-full border border-[rgba(184,132,30,0.22)] bg-white/76 px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-[#b8841e]">
                {t('Journey')}
              </div>
              <h2 className="mt-5 font-display text-[clamp(3rem,5vw,5.1rem)] font-semibold leading-[0.95] tracking-[-0.06em] text-[#171d28]">
                {t("Your child's learning journey")}
              </h2>
              <p className="mt-6 max-w-xl text-[1.06rem] leading-8 text-[#465062]">
                {t('A high-standard academic process should feel visible, measured, and calm. Ryze gives families a clear pathway from diagnosis to stronger execution so progress never feels vague or improvised.')}
              </p>
              <div className="mt-10 rounded-[2rem] border border-[rgba(23,29,40,0.08)] bg-white/78 p-6 shadow-[0_28px_60px_-46px_rgba(17,21,29,0.18)] backdrop-blur-sm">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[#b8841e]">{t('Why it matters')}</p>
                <p className="mt-4 text-[1.02rem] leading-8 text-[#394356]">
                  {t('Parents can see exactly what is happening, why it is happening, and how each stage contributes to steadier understanding, stronger judgement, and more reliable academic growth.')}
                </p>
              </div>
            </FadeInSection>

            <div className="relative">
              <div className="absolute left-7 top-8 hidden h-[calc(100%-4rem)] w-px bg-[linear-gradient(180deg,rgba(184,132,30,0),rgba(184,132,30,0.34)_12%,rgba(184,132,30,0.34)_88%,rgba(184,132,30,0))] md:block" />
              <div className="space-y-5 sm:space-y-6">
                {journeySteps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <FadeInSection
                      key={step.number}
                      as="article"
                      className={`group relative overflow-hidden rounded-[2rem] border border-[rgba(23,29,40,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(248,243,234,0.82))] p-6 shadow-[0_24px_56px_-40px_rgba(17,21,29,0.22)] transition-all duration-300 hover:-translate-y-1 hover:border-[rgba(184,132,30,0.22)] hover:shadow-[0_30px_70px_-42px_rgba(17,21,29,0.24)] sm:p-7 ${index % 2 === 1 ? 'md:ml-10' : ''}`}
                    >
                      <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(184,132,30,0.72),transparent)]" />
                      <div className="absolute right-0 top-0 h-28 w-28 rounded-bl-[2rem] bg-[radial-gradient(circle_at_top_right,rgba(215,184,120,0.16),transparent_70%)]" />
                      <div className="relative flex items-start gap-4">
                        <div className="relative shrink-0">
                          <div className="absolute left-0 top-1/2 hidden h-px w-8 -translate-x-8 bg-[rgba(184,132,30,0.28)] md:block" />
                          <div className="flex h-14 w-14 items-center justify-center rounded-[1.35rem] bg-[rgba(184,132,30,0.1)] text-[#b8841e] shadow-[0_14px_28px_-20px_rgba(184,132,30,0.72)]">
                            <Icon size={20} />
                          </div>
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="text-[0.76rem] font-semibold uppercase tracking-[0.24em] text-[#b8841e]">
                              {t(`Step ${step.number}`)}
                            </span>
                            <span className="inline-flex rounded-full border border-[rgba(184,132,30,0.16)] bg-[rgba(184,132,30,0.06)] px-2.5 py-1 text-[0.68rem] font-medium uppercase tracking-[0.16em] text-[#6a7283]">
                              {index < 2 ? t('Clarity') : index < 5 ? t('Structure') : t('Momentum')}
                            </span>
                          </div>
                          <h3 className="mt-4 text-[1.5rem] font-display font-semibold leading-[1.02] text-[#171d28]">
                            {t(step.title)}
                          </h3>
                          <p className="mt-4 max-w-[38rem] text-[1rem] leading-8 text-[#4b5567]">
                            {t(step.desc)}
                          </p>
                        </div>
                      </div>
                    </FadeInSection>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <FadeInSection as="section" className="relative overflow-hidden bg-[#151b25] py-18 text-[#f8f3ea] sm:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(215,184,120,0.18),transparent_24%),radial-gradient(circle_at_82%_24%,rgba(255,255,255,0.08),transparent_20%),linear-gradient(180deg,#151b25_0%,#1a2230_100%)]" />
        <div className="absolute left-[10%] top-16 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(215,184,120,0.12),transparent_72%)] blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,0.74fr)_minmax(0,1.26fr)] lg:gap-14">
            <FadeInSection as="div" className="lg:sticky lg:top-28 lg:self-start">
              <div className="eyebrow justify-start border-white/10 bg-white/6 text-[#d7b878]">{t('Comparison')}</div>
              <h2 className="mt-5 font-display text-[clamp(3rem,5vw,5rem)] font-semibold leading-[0.95] tracking-[-0.06em] text-[#f8f3ea]">
                {t('What sets Ryze apart')}
              </h2>
              <p className="mt-6 max-w-xl text-[1.06rem] leading-8 text-white/70">
                {t('The difference is not cosmetic. Ryze is built around academic diagnosis, teaching judgement, and a clearer standard of communication, structure, and progress than families usually experience in tutoring.')}
              </p>
              <div className="mt-10 rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-6 shadow-[0_28px_70px_-46px_rgba(0,0,0,0.62)] backdrop-blur-sm">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[#d7b878]">{t('The real standard')}</p>
                <p className="mt-4 text-[1.02rem] leading-8 text-white/78">
                  {t('We do not treat tutoring as homework supervision. The work is diagnostic, sequenced, and explicitly taught so understanding deepens and performance becomes more dependable over time.')}
                </p>
              </div>
            </FadeInSection>

            <div className="grid gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-start">
              <div className="rounded-[2.4rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.03))] p-8 shadow-[0_28px_64px_-46px_rgba(0,0,0,0.66)] backdrop-blur-sm sm:p-10">
                <div className="mb-5 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white/52">
                  {t('Common pattern')}
                </div>
                <h3 className="mb-8 border-b border-white/10 pb-4 font-display text-[1.45rem] font-semibold leading-[1.02] tracking-[-0.03em] text-[#f8f3ea] sm:text-[1.72rem]">
                  {t('TRADITIONAL TUTORING')}
                </h3>
                <ul className="space-y-5">
                  {comparisonTraditional.map((item) => (
                    <li key={item} className="flex items-start gap-4 text-white/78">
                      <X className="mt-1 shrink-0 text-red-300" size={18} />
                      <span>{t(item)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="relative overflow-hidden rounded-[2.6rem] border border-[rgba(215,184,120,0.24)] bg-[linear-gradient(180deg,rgba(248,243,234,0.98),rgba(244,239,231,0.94))] p-8 text-[#171d28] shadow-[0_36px_90px_-52px_rgba(0,0,0,0.7)] sm:p-10 lg:translate-y-8">
                <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(184,132,30,0.8),transparent)]" />
                <div className="relative z-10 mb-5 inline-flex items-center rounded-full border border-[rgba(184,132,30,0.2)] bg-[linear-gradient(135deg,#d6a12a_0%,#b8841e_100%)] px-4 py-2 text-[0.68rem] font-extrabold uppercase tracking-[0.18em] text-white shadow-[0_18px_36px_-18px_rgba(184,132,30,0.72)]">
                  {t('The Ryze Standard')}
                </div>
                <h3 className="mb-8 max-w-[16ch] border-b border-[rgba(23,29,40,0.08)] pb-4 font-display text-[1.45rem] font-semibold leading-[1.02] tracking-[-0.03em] text-[#171d28] sm:max-w-none sm:text-[1.78rem]">
                  {t('RYZE TUTORING')}
                </h3>
                <ul className="space-y-5">
                  {comparisonRyze.map((item) => (
                    <li key={item} className="flex items-start gap-4 text-[#171d28]">
                      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[rgba(184,132,30,0.12)] text-[var(--accent)]">
                        <Check size={14} strokeWidth={4} />
                      </div>
                      <span className="font-medium leading-7">{t(item)}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8 rounded-[1.7rem] border border-[rgba(23,29,40,0.08)] bg-white/66 p-5">
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">{t('Outcome')}</p>
                  <p className="mt-3 text-[0.98rem] leading-7 text-[#465062]">
                    {t('Families get clearer decisions, steadier confidence, and teaching that compounds because each part of the process is connected to the next.')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </FadeInSection>

      <FadeInSection as="section" className="ryze-section-padding border-t ryze-border-subtle ryze-bg-primary px-4">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <div className="eyebrow justify-center">{t('Why This Matters')}</div>
            <h2 className="ryze-heading-2 ryze-text-primary mt-5">{t('The long-term value of doing it properly')}</h2>
          </div>

          <div className="space-y-6 text-[1.04rem] font-light leading-relaxed ryze-text-secondary">
            <p>
              {t('Strong mathematical performance depends on foundations, fluency, and confidence developing together. If one part is weak, later progress becomes unnecessarily difficult.')}
            </p>
            <p>
              {t("That is why intervention only works when it is structured properly. Homework help on its own is not enough. Generic tutoring is not enough. Guesswork is not enough.")}
            </p>
            <p>
              {t('Students improve when teaching is diagnostic, paced sensibly, and focused on real understanding rather than surface completion.')}
            </p>
          </div>

          <div className="mt-14 rounded-[2rem] border ryze-border-subtle bg-[rgba(243,231,201,0.34)] p-8 text-center shadow-[0_20px_48px_-38px_rgba(17,21,29,0.18)]">
            <h4 className="mb-3 text-[0.88rem] font-bold uppercase tracking-[0.16em] text-[var(--accent)]">{t('Backed by research')}</h4>
            <p className="mx-auto max-w-2xl text-[0.98rem] italic leading-relaxed ryze-text-secondary">
              {t('Supported by longitudinal work on foundational maths development, intervention research, and cognitive science on how expertise forms over time.')}
            </p>
          </div>

          <div className="mt-20 text-center">
            <div className="inline-block w-full max-w-4xl rounded-[3rem] border border-[rgba(184,132,30,0.18)] bg-[rgba(243,231,201,0.18)] p-12">
              <h4 className="ryze-heading-3 ryze-text-primary mb-4">{t('Ready to get started?')}</h4>
              <p className="mx-auto mb-8 max-w-2xl text-lg ryze-text-secondary">
                {t("Every student begins with a consultation and assessment. We'll discuss whether private tutoring or a small-group class is the better fit for the situation.")}
              </p>
              <InteractiveLift as="div" className="inline-block">
                <button
                  onClick={() => navigate('/contact')}
                  className="rounded-full bg-[var(--color-ryze)] px-10 py-4 font-bold text-[var(--accent-foreground)] shadow-lg transition-all hover:bg-[var(--color-ryze-400)]"
                >
                  {t('Book a Consultation')}
                </button>
              </InteractiveLift>
            </div>
          </div>
        </div>
      </FadeInSection>
    </div>
  );
};

export default HowItWorks;
