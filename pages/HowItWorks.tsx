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
      <section className="ryze-page-hero relative overflow-hidden px-4 pb-24 pt-24 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(243,231,201,0.55),transparent_58%)] opacity-80"></div>
        <div className="relative z-10 mx-auto max-w-4xl">
          <div className="eyebrow justify-center">{t('How It Works')}</div>
          <h1 className="ryze-page-title mt-5 mb-8 text-5xl font-display font-bold md:text-7xl">
            {t('A rigorous process, clearly explained')}
          </h1>
          <p className="ryze-page-lead mx-auto max-w-2xl text-xl font-light leading-relaxed">
            {t("Our approach is straightforward: diagnose what matters, build the right plan, and teach for durable understanding rather than short-term patchwork.")}
          </p>
        </div>
      </section>

      <FadeInSection as="section" className="mx-auto max-w-6xl px-4 py-24">
        <div className="mb-16 text-center">
          <div className="eyebrow justify-center">{t('The Real Problem')}</div>
          <h2 className="mt-5 text-4xl font-display font-bold text-[var(--primary)]">{t('Why tutoring often falls short')}</h2>
        </div>

        <div className="grid overflow-hidden rounded-[2.6rem] border border-[var(--border)] shadow-[var(--ryze-shadow-panel)] lg:grid-cols-2">
          <div className="border-b border-[var(--border)] bg-[rgba(243,231,201,0.28)] p-12 lg:border-b-0 lg:border-r">
            <h3 className="mb-6 text-[0.92rem] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">{t('Expectation')}</h3>
            <p className="mb-6 text-3xl font-display font-bold leading-tight text-[var(--primary)]">
              "{t('Tutoring is mainly about keeping up with homework and preparing for the next test.')}"
            </p>
            <p className="text-[1rem] leading-relaxed text-[var(--muted)]">
              {t('That is how many families first experience tutoring, so it is understandable that expectations start there.')}
            </p>
          </div>

          <div className="relative bg-[rgba(248,243,234,0.96)] p-12">
            <div className="absolute left-0 top-0 h-1 w-full bg-[var(--accent)]"></div>
            <h3 className="mb-6 text-[0.92rem] font-bold uppercase tracking-[0.16em] text-[var(--accent)]">{t('Reality')}</h3>
            <p className="mb-6 text-[1.02rem] leading-relaxed text-[var(--muted)]">
              {t("When tutoring is done properly, it is diagnostic and structured. A student struggling with algebra may actually be carrying gaps from years earlier. Unless those foundations are identified and rebuilt, progress remains fragile.")}
            </p>
            <p className="text-xl font-bold text-[var(--primary)]">
              {t('Real tutoring starts with diagnosis, not guesswork.')}
            </p>
          </div>
        </div>
      </FadeInSection>

      <section className="bg-[rgba(243,231,201,0.2)] py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeInSection as="div" className="mb-20 text-center">
            <div className="eyebrow justify-center">{t('Teaching Principles')}</div>
            <h2 className="mt-5 mb-6 text-4xl font-display font-bold text-[var(--primary)]">{t('The standard behind every lesson')}</h2>
            <p className="mx-auto max-w-3xl text-[1.02rem] leading-relaxed text-[var(--muted)]">
              {t('Ryze is built around a small set of disciplined teaching principles. They shape both private tutoring and small-group classes.')}
            </p>
          </FadeInSection>

          <StaggerGroup as="div" className="grid gap-8 md:grid-cols-2 lg:grid-cols-3" lift>
            {principles.map((principle) => (
              <article key={principle.title} className="ryze-page-card rounded-[2rem] p-9">
                <div className="mb-6 h-1 w-14 rounded-full bg-[var(--accent)]"></div>
                <h3 className="mb-4 text-2xl font-display font-bold text-[var(--primary)]">{t(principle.title)}</h3>
                <p className="text-[1rem] leading-relaxed text-[var(--muted)]">{t(principle.desc)}</p>
              </article>
            ))}
          </StaggerGroup>
        </div>
      </section>

      <section className="overflow-hidden py-28">
        <div className="mx-auto max-w-5xl px-4">
          <FadeInSection as="div" className="mb-20 text-center">
            <div className="eyebrow justify-center">{t('Journey')}</div>
            <h2 className="mt-5 mb-4 text-4xl font-display font-bold text-[var(--primary)]">{t("Your child's learning journey")}</h2>
            <p className="text-[1.02rem] leading-relaxed text-[var(--muted)]">
              {t('A clear sequence helps families understand what happens first, what happens next, and why progress becomes more measurable.')}
            </p>
          </FadeInSection>

          <div className="grid gap-6 md:grid-cols-2">
            {journeySteps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.number} className="rounded-[2rem] border border-[var(--border)] bg-[rgba(248,243,234,0.92)] p-8 shadow-[0_22px_52px_-38px_rgba(17,21,29,0.24)]">
                  <div className="mb-5 flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(243,231,201,0.92)] text-[var(--accent)]">
                      <Icon size={20} />
                    </div>
                    <div>
                      <div className="text-[0.84rem] font-bold uppercase tracking-[0.16em] text-[var(--accent)]">{step.number}</div>
                      <h3 className="text-xl font-display font-bold text-[var(--primary)]">{t(step.title)}</h3>
                    </div>
                  </div>
                  <p className="text-[1rem] leading-relaxed text-[var(--muted)]">{t(step.desc)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <FadeInSection as="section" className="bg-[var(--primary)] py-24 text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-16 text-center">
            <div className="eyebrow justify-center text-[rgba(248,243,234,0.56)]">{t('Comparison')}</div>
            <h2 className="mt-5 text-4xl font-display font-bold text-[var(--color-ryze)]">{t('What sets Ryze apart')}</h2>
          </div>

          <div className="grid gap-10 lg:grid-cols-2">
            <div className="rounded-[2.4rem] border border-white/10 bg-white/5 p-10 backdrop-blur-sm">
              <h3 className="mb-8 border-b border-white/10 pb-4 text-[0.92rem] font-bold uppercase tracking-[0.16em] text-[rgba(248,243,234,0.72)]">
                {t('Traditional tutoring')}
              </h3>
              <ul className="space-y-5">
                {comparisonTraditional.map((item) => (
                  <li key={item} className="flex items-start gap-4 text-[rgba(248,243,234,0.82)]">
                    <X className="mt-1 shrink-0 text-red-300" size={18} />
                    <span>{t(item)}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative z-10 mt-8 rounded-[2.4rem] border border-[rgba(184,132,30,0.28)] bg-[rgba(248,243,234,0.96)] p-10 text-[var(--primary)] shadow-2xl lg:mt-0 lg:translate-y-6">
              <div className="absolute right-0 top-0 rounded-bl-2xl bg-[var(--accent)] px-4 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-[var(--accent-foreground)]">
                {t('The Ryze way')}
              </div>
              <h3 className="mb-8 border-b border-[var(--border)] pb-4 text-[0.92rem] font-bold uppercase tracking-[0.16em] text-[var(--accent)]">
                {t('Ryze tutoring')}
              </h3>
              <ul className="space-y-5">
                {comparisonRyze.map((item) => (
                  <li key={item} className="flex items-start gap-4 text-[var(--primary)]">
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[rgba(184,132,30,0.12)] text-[var(--accent)]">
                      <Check size={14} strokeWidth={4} />
                    </div>
                    <span className="font-medium">{t(item)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </FadeInSection>

      <FadeInSection as="section" className="border-t border-[var(--border)] bg-[var(--bg)] px-4 py-24">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <div className="eyebrow justify-center">{t('Why This Matters')}</div>
            <h2 className="mt-5 text-4xl font-display font-bold text-[var(--primary)]">{t('The long-term value of doing it properly')}</h2>
          </div>

          <div className="space-y-6 text-[1.04rem] font-light leading-relaxed text-[var(--muted)]">
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

          <div className="mt-14 rounded-[2rem] border border-[var(--border)] bg-[rgba(243,231,201,0.34)] p-8 text-center shadow-[0_20px_48px_-38px_rgba(17,21,29,0.18)]">
            <h4 className="mb-3 text-[0.88rem] font-bold uppercase tracking-[0.16em] text-[var(--accent)]">{t('Backed by research')}</h4>
            <p className="mx-auto max-w-2xl text-[0.98rem] italic leading-relaxed text-[var(--muted)]">
              {t('Supported by longitudinal work on foundational maths development, intervention research, and cognitive science on how expertise forms over time.')}
            </p>
          </div>

          <div className="mt-20 text-center">
            <div className="inline-block w-full max-w-4xl rounded-[3rem] border border-[rgba(184,132,30,0.18)] bg-[rgba(243,231,201,0.18)] p-12">
              <h4 className="mb-4 text-2xl font-display font-bold text-[var(--primary)]">{t('Ready to get started?')}</h4>
              <p className="mx-auto mb-8 max-w-2xl text-lg text-[var(--muted)]">
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
