import React from 'react';
// @ts-ignore
import { useNavigate } from 'react-router-dom';
import {
  Microscope,
  BedDouble,
  BellOff,
  Zap,
  ArrowRight,
  XCircle,
  Quote,
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const TheRyzeTruth: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const problems = [
    {
      icon: Microscope,
      iconClass: 'text-red-500',
      title: 'Problem 1 - Misdiagnosis',
      text:
        "Most tutoring treats symptoms, not causes. A student struggles with quadratic equations, so they get drilled on quadratics. But often the real issue is three years back - incomplete understanding of fractions or basic algebra. Without diagnosing the foundational gap, you're building on sand.",
    },
    {
      icon: BedDouble,
      iconClass: 'text-purple-500',
      title: 'Problem 2 - Passive Learning',
      text:
        "Sitting and watching someone solve problems doesn't create understanding. Real learning requires active struggle - attempting problems, making mistakes, getting immediate feedback, and trying again. Large classes default to passive learning because managing active learning for twenty different students simultaneously is nearly impossible.",
    },
    {
      icon: BellOff,
      iconClass: 'ryze-text-muted',
      title: 'Problem 3 - The Silence Problem',
      text:
        "Students don't ask questions in large groups. Not because they're shy, but because the social cost is high and the benefit is uncertain. Will the tutor actually help, or will they give a rushed explanation before moving on? In my old tutoring centre, I asked maybe three questions across six months.",
    },
    {
      icon: Zap,
      iconClass: 'text-[var(--accent)]',
      title: 'Problem 4 - Mismatched Pacing',
      text:
        'Every student needs a different pace. In large classes, tutors teach to the middle. Advanced students waste time. Struggling students get left behind. Almost no one gets what they actually need.',
    },
  ];

  const attentionPoints = [
    {
      title: 'Real Diagnosis',
      text: 'I can assess each student individually. I can trace their confusion back to its source.',
    },
    {
      title: 'Active Learning',
      text: 'I watch them work. I see where they hesitate. Then I intervene at exactly the right moment.',
    },
    {
      title: 'Questions Answered',
      text: 'Asking questions feels normal. I can give thorough answers without others sitting idle.',
    },
    {
      title: 'Flexible Pacing',
      text: 'I can adjust the speed for each student. If someone needs more time, they get it.',
    },
  ];

  const results = [
    {
      title: 'Confidence',
      borderClass: 'border-green-500',
      text:
        'Students who came to us convinced they "weren\'t math people" start consistently scoring B\'s and A\'s - not because we worked magic, but because we filled their gaps.',
    },
    {
      title: 'Engagement',
      borderClass: 'border-blue-500',
      text:
        'Advanced students who felt bored get extension material. They start enjoying the subject again. Their teachers notice the difference.',
    },
    {
      title: 'Participation',
      borderClass: 'border-[var(--accent)]',
      text:
        'Students who went months without asking a single question now ask ten, fifteen, twenty questions in their first session. They finally feel safe to learn.',
    },
  ];

  return (
    <div className="ryze-bg-primary pt-20 font-sans ryze-text-primary">
      <div className="ryze-section-padding ryze-page-hero border-b ryze-border-subtle px-4">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="ryze-heading-1 ryze-text-primary mb-6">
            {t('The Ryze Truth')}
          </h1>
          <p className="ryze-page-lead text-xl font-light">
            {t('The story behind why most tutoring fails, and how we fixed it.')}
          </p>
        </div>
      </div>

      <section className="ryze-section-padding mx-auto max-w-2xl px-4">
        <div className="mx-auto space-y-8 text-lg font-light leading-relaxed ryze-text-secondary">
          <p className="mb-8">
            {t('Parents rarely come to us at the beginning.')}
            <br />
            {t("They come when they're tired - and when their child is tired too.")}
          </p>
          <p className="mb-8">
            {t('Before they reach Ryze, most families have already cycled through a handful of tutoring centres.')}
            <br />
            {t("They've paid the fees, done the weekly sessions, followed every recommendation.")}
            <br />
            {t('Months go by. The routines become familiar.')}
          </p>
          <p className="mb-8 text-xl font-medium ryze-text-primary">
            {t('But the understanding never really changes.')}
          </p>
          <p className="mb-8">
            {t("Meanwhile their child feels themselves slipping - comparing their progress to everyone else's, wondering why they're still stuck, wondering what's wrong with them.")}
          </p>
          <div className="my-10 border-l-4 border-[var(--accent)] py-2 pl-6">
            <p
              className="text-lg italic ryze-text-primary"
              dangerouslySetInnerHTML={{
                __html: t(
                  "And that's the tragedy: not that the tutoring didn't work, but that the child starts to believe <strong>they</strong> didn't work.",
                ),
              }}
            />
          </div>
          <p className="mb-8">
            {t('The truth is simpler and far less cruel.')}
            <br />
            {t("They were placed in environments that weren't built to notice them - classrooms too crowded to see their confusion, too rigid to adapt to their pace, too busy to hear their questions.")}
          </p>
          <p className="text-lg font-bold ryze-text-primary">
            {t('Nothing was wrong with them.')}
            <br />
            {t('Something was wrong with the setup around them.')}
          </p>
        </div>
      </section>

      <section className="ryze-section-padding relative overflow-hidden ryze-bg-secondary">
        <div className="absolute right-0 top-0 -z-10 h-[600px] w-[600px] rounded-full bg-[rgba(243,231,201,0.58)] blur-[100px] opacity-70" />
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="ryze-heading-2 ryze-text-primary mb-12 text-center">
            {t("I Know This Because I've Lived It")}
          </h2>
          <div className="mx-auto space-y-6 text-lg font-light leading-relaxed ryze-text-secondary">
            <p className="mb-6">
              {t('I still remember the feeling.')}
              <br />
              {t('Packing my bag after school, that weight settling in my chest. Not the weight of textbooks - the weight of knowing where I was headed next.')}
            </p>
            <p className="mb-6 font-medium">{t('The bus ride to tutoring. Twenty minutes of dread.')}</p>
            <p className="mb-6">
              {t("I'd walk into that centre and become invisible. Just another student in a room of twenty others, all of us sitting in rows, staring at a whiteboard while a tutor droned through problems like they were reading a script they'd memorised years ago.")}
            </p>
            <p className="mb-6 font-bold italic ryze-text-primary">{t('15 hours. Every week.')}</p>
            <p className="mb-6">{t("I wasn't learning. I was enduring.")}</p>
            <p className="mb-6">
              {t("The tutor didn't know my name. Didn't notice when I zoned out. Didn't see the confusion on my face when they skipped steps I didn't understand. I was a seat filled, a number on their attendance sheet, revenue on their spreadsheet.")}
            </p>

            <div className="my-12 rounded-[2rem] border border-[rgba(184,132,30,0.18)] bg-[rgba(248,243,234,0.92)] p-10 text-center shadow-[0_24px_60px_-42px_rgba(17,21,29,0.34)]">
              <Quote className="mx-auto mb-6 h-10 w-10 text-[var(--accent)] opacity-60" />
              <p className="mb-4 text-xl font-bold ryze-text-primary">
                {t('Why am I falling behind when everyone else seems fine?')}
              </p>
              <p className="mb-4 text-xl font-bold ryze-text-primary">
                {t("Why can't I just get this?")}
              </p>
              <p className="text-2xl font-bold text-[var(--accent)]">{t("What's wrong with me?")}</p>
            </div>

            <p className="mb-6">
              {t('I started to believe I was not smart enough. That I was not "a math person." That maybe I just did not have what it took.')}
            </p>
            <p className="mb-6">
              {t("The truth - the one I couldn't see then - was simpler:")}
              <br />
              <strong className="font-bold ryze-text-primary">
                {t('Nothing was wrong with me. Something was wrong with the environment.')}
              </strong>
            </p>
            <p
              className="mb-6"
              dangerouslySetInnerHTML={{
                __html: t(
                  "I wasn't stupid. I wasn't lazy. I just needed someone to actually see me, to notice where I was stuck, to teach in a way that made sense to <i>me</i> - not to some imaginary average student in the middle of the class.",
                ),
              }}
            />
            <p className="text-lg font-medium ryze-text-primary">
              {t('That experience left me with a question: Why does so much tutoring fail to actually help?')}
            </p>
          </div>
        </div>
      </section>

      <section className="ryze-section-padding ryze-bg-primary">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-20 text-center">
            <h2 className="ryze-heading-2 ryze-text-primary mb-4">
              {t('Why Tutoring Fails')}
            </h2>
            <p className="ryze-text-muted">{t('The systemic issues we identified and solved.')}</p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {problems.map((problem) => {
              const Icon = problem.icon;
              return (
                <div
                  key={problem.title}
                  className="ryze-page-card group rounded-[2.5rem] p-10 transition-all duration-300 hover:shadow-lg"
                >
                  <div
                    className={`mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm transition-transform group-hover:scale-110 ${problem.iconClass}`}
                  >
                    <Icon size={32} />
                  </div>
                  <h3 className="ryze-heading-3 ryze-text-primary mb-4">{t(problem.title)}</h3>
                  <p className="leading-relaxed ryze-text-secondary">{t(problem.text)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="ryze-section-padding ryze-bg-surface-dark px-4 ryze-text-inverse">
        <div className="mx-auto max-w-4xl">
          <h2 className="ryze-heading-2 ryze-text-inverse mb-12 text-center">
            {t('Why Attention Actually Works')}
          </h2>
          <div className="prose prose-invert mx-auto prose-lg">
            <p
              className="mb-12 text-center text-xl leading-relaxed ryze-text-inverse-muted"
              dangerouslySetInnerHTML={{
                __html: t(
                  `I'm not claiming one format is magic. Bad teaching is bad teaching regardless of class size. What matters is attention: <span className="ryze-text-inverse font-bold">adaptive, individualised teaching that responds to the student in front of you.</span>`,
                ),
              }}
            />

            <div className="not-prose grid grid-cols-1 gap-8 md:grid-cols-2">
              {attentionPoints.map((item) => (
                <div key={item.title} className="rounded-2xl border border-white/10 bg-white/10 p-8">
                  <h4 className="mb-3 text-xl font-bold text-[var(--ryze-200)]">{t(item.title)}</h4>
                  <p className="leading-relaxed ryze-text-inverse-muted">{t(item.text)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="ryze-section-padding ryze-bg-primary">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="ryze-heading-2 ryze-text-primary mb-8">{t('The Cost of Quality')}</h2>
          <div className="mx-auto space-y-6 text-lg font-light leading-relaxed ryze-text-secondary">
            <p className="mb-6">
              {t('I need to be direct about pricing: serious tutoring costs more when it is structured properly, whether that is delivered in a small group or through private support.')}
            </p>
            <p className="mb-6">
              {t("Here's why: If I'm teaching six students instead of twenty, I need to charge more per student to make the business viable. That's basic math.")}
            </p>
            <p className="mb-6">
              {t("We charge what we do because that's what it costs to pay qualified tutors properly, maintain quality facilities, and limit class sizes to six students maximum.")}
            </p>
            <div className="mt-8 rounded-3xl border ryze-border-subtle bg-[rgba(248,243,234,0.86)] p-8 shadow-[0_18px_42px_-32px_rgba(17,21,29,0.2)]">
              <p className="font-medium ryze-text-primary">
                {t("This isn't for everyone. If cost is your primary constraint, large group tutoring might be better. But if you're looking for something that actually works - then the higher price reflects the actual value: individualised attention that produces results.")}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="ryze-section-padding relative ryze-bg-secondary">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="ryze-heading-2 ryze-text-primary mb-16 text-center">
            {t('What Results Look Like')}
          </h2>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {results.map((result) => (
              <div key={result.title} className={`rounded-3xl border-t-4 bg-white p-8 shadow-sm ${result.borderClass}`}>
                <h3 className="mb-4 text-lg font-bold ryze-text-primary">{t(result.title)}</h3>
                <p className="text-[0.98rem] leading-relaxed ryze-text-secondary">{t(result.text)}</p>
              </div>
            ))}
          </div>

          <p className="mt-12 text-center italic ryze-text-secondary">
            {t("These aren't miracles. They're what happens when students get appropriate attention and teaching targeted to their actual needs.")}
          </p>
        </div>
      </section>

      <section className="ryze-section-padding mx-auto max-w-7xl ryze-bg-primary px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          <div className="rounded-[3rem] bg-red-50 p-12">
            <h2 className="ryze-heading-3 mb-8 text-red-500">{t("What We're Not")}</h2>
            <ul className="space-y-6 font-medium ryze-text-secondary">
              <li className="flex items-center gap-4">
                <XCircle className="shrink-0 text-red-400" size={24} />
                {t("We're not a magic solution. We can't fix everything.")}
              </li>
              <li className="flex items-center gap-4">
                <XCircle className="shrink-0 text-red-400" size={24} />
                {t("We're not the cheapest option. We can't be.")}
              </li>
              <li className="flex items-center gap-4">
                <XCircle className="shrink-0 text-red-400" size={24} />
                {t("We're not promising straight A's or admission.")}
              </li>
            </ul>
          </div>
          <div className="rounded-[3rem] bg-green-50 p-12">
            <h2 className="ryze-heading-3 mb-8 text-green-600">{t('What We Are')}</h2>
            <div className="space-y-6 leading-relaxed ryze-text-secondary">
              <p>
                {t("We're a tutoring centre that deliberately limits class sizes to six students because that's the threshold where individualised teaching becomes possible.")}
              </p>
              <p>{t('We diagnose where students actually struggle, not where the curriculum says they should be.')}</p>
              <p>{t('We charge accordingly because quality teaching at small ratios costs more to deliver.')}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="ryze-section-padding border-y border-[rgba(184,132,30,0.18)] bg-[rgba(243,231,201,0.42)] px-4 text-center">
        <div className="mx-auto max-w-3xl">
          <p className="font-display text-xl font-bold leading-relaxed ryze-text-primary md:text-2xl">
            "{t("At Ryze, you're not a number. You're not a headcount.")}
            <br />
            {t('You matter. Your questions matter.')}
            <br />
            {t('Your progress matters.')}"
          </p>
        </div>
      </section>

      <section className="ryze-section-padding ryze-bg-primary text-center">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="ryze-heading-2 text-[var(--accent)] mb-8">
            {t('The Real Question')}
          </h2>

          <p className="mb-8 text-xl font-medium ryze-text-primary">
            {t("The question isn't which format sounds better in the abstract.")}
            <br />
            {t('The question is:')}{' '}
            <span
              className="font-bold underline decoration-[var(--accent)] decoration-4 underline-offset-4"
              dangerouslySetInnerHTML={{ __html: t("has what you're currently doing worked?") }}
            />
          </p>
          <p className="mb-12 leading-relaxed ryze-text-secondary">
            {t("If your child has been attending tutoring for months and nothing has changed, then something about that environment isn't working for them.")}
            {' '}
            {t('Maybe they need individual diagnosis. Maybe they need space to ask questions. Maybe they need a different pace.')}
          </p>

          <button
            onClick={() => navigate('/contact')}
            className="inline-flex items-center gap-3 rounded-full border border-[rgba(184,132,30,0.32)] bg-[var(--accent)] px-12 py-5 text-lg font-bold text-[var(--accent-foreground)] shadow-xl transition-all hover:-translate-y-1 hover:bg-[#c89e2b]"
          >
            {t('Book a Trial Lesson')} <ArrowRight size={24} />
          </button>

          <p className="mt-8 text-[0.92rem] font-bold uppercase tracking-[0.12em] ryze-text-muted">
            {t("If it works, continue. If it doesn't, at least you'll know.")}
          </p>
        </div>
      </section>
    </div>
  );
};

export default TheRyzeTruth;
