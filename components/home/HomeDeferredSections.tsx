import React, { Suspense, useEffect, useRef, useState } from 'react';
const Testimonials = React.lazy(() => import('../Testimonials'));
import { motion } from 'framer-motion';
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  GraduationCap,
  Laptop,
  PenTool,
  Phone,
  Smile,
  Star,
  Trophy,
  Users,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import PrimaryCTA from '../PrimaryCTA';
import { ROUTES } from '../../src/constants/routes';
import { trackPhoneClick } from '../../src/lib/tracking';
import { responsiveCloudinaryImage } from '../../src/utils/cloudinary';
import { teamMembers } from '../../data/team';



const programSlides = [
  {
    id: 'core-programs',
    featured: {
      id: 'program-hsc',
      badge: 'PRIMARY PATHWAY',
      title: 'HSC | Year 11 and 12',
      blurb:
        'A serious senior maths program for students aiming to perform strongly in Advanced, Extension 1, and Extension 2 with clearer method, steadier weekly execution, and far less guesswork under exam pressure.',
      detailLead: 'Academic standard: senior maths taught with strong emphasis on exam-method discipline, correction quality, and written mathematical precision.',
      detailSupport: 'How support works: weekly planning, targeted topic testing, timed practice, and direct feedback so families can see exactly where marks are being built or lost.',
      ctaLabel: 'View HSC Program',
      href: ROUTES.HSC_MATHS_PROGRAM,
    },
    secondary: [
      {
        id: 'program-selective',
        badge: 'PROGRAM',
        title: 'Selective & OC',
        blurb: 'Structured preparation for families who want more than worksheets and trial papers. This program builds mathematical reasoning, speed, accuracy, and confidence for OC and selective school exams.',
        detailLead: 'What matters here: disciplined problem solving, exam composure, and the ability to think clearly under timed conditions.',
        detailSupport: 'Program structure: concept teaching, deliberate question sets, correction review, and the habits that make performance more reliable on the day.',
        ctaLabel: 'View Selective Program',
        href: ROUTES.SELECTIVE_OC_PROGRAM,
      },
      {
        id: 'program-accelerated',
        badge: 'PROGRAM',
        title: 'Accelerated Pathways',
        blurb: 'Built for ambitious students who are ready for a faster pace, deeper challenge, and more serious mathematical work than standard school progression usually provides.',
        detailLead: 'What matters here: ahead-of-school sequencing, richer abstraction, and challenge that actually extends understanding rather than just increasing workload.',
        detailSupport: 'Program structure: carefully paced extension, stronger problem-solving demands, and close guidance so acceleration stays stable, not superficial.',
        ctaLabel: 'View Accelerated Program',
        href: ROUTES.ACCELERATED_MATHS_PROGRAM,
      },
    ],
  },
  {
    id: 'foundations-programs',
    featured: {
      id: 'program-primary',
      badge: 'PRIMARY PATHWAY',
      title: 'Primary | Year 3 - 6',
      blurb:
        'A strong primary maths program focused on fluency, confidence, and the habits that make later learning feel more natural, less rushed, and far less fragile.',
      detailLead: 'Academic standard: careful attention to core number fluency, reasoning, written method, and the confidence to explain how an answer was reached.',
      detailSupport: 'How support works: explicit teaching, structured practice, and regular parent visibility so growth is steady rather than left to chance.',
      ctaLabel: 'View Primary Program',
      href: ROUTES.PRIMARY_MATHS_PROGRAM,
    },
    secondary: [
      {
        id: 'program-junior-foundations',
        badge: 'PROGRAM',
        title: 'Junior Foundations | Year 7 -10',
        blurb: 'A structured Years 7-10 program aligned with the NSW curriculum and Ryze in-house sequencing to repair gaps, strengthen fluency, and make school maths feel more manageable week to week.',
        detailLead: 'What matters here: prerequisite repair, consistent school alignment, and rebuilding confidence before senior mathematics becomes more demanding.',
        detailSupport: 'Program structure: explicit teaching, correction-driven review, and steady weekly support so progress feels visible to both students and parents.',
        ctaLabel: 'View Junior Program',
        href: ROUTES.JUNIOR_FOUNDATIONS_PROGRAM,
      },
    ],
  },
];

const deliveryFormats = [
  {
    title: 'Structured Private Mentoring',
    intro: 'For students who need highly tailored pacing, direct diagnosis, and close academic attention.',
    points: [
      'Best when confidence is uneven or progress has stalled',
      'Suitable for acceleration, catch-up, or exam-specific support',
      'Available online or in person where appropriate',
    ],
  },
  {
    title: 'Small-Group Classes',
    intro: 'For students who benefit from strong teaching, active participation, and a more social learning environment.',
    points: [
      'Kept deliberately small so students are still seen properly',
      'Combines explanation, guided practice, and correction in real time',
      'Well suited to students who need structure without losing interaction',
    ],
  },
];

const features = [
  { icon: Users, title: 'Considered Class Sizes', desc: 'Small-group environments are kept deliberately small so attention, questioning, and participation remain active.' },
  { icon: Star, title: 'Purpose-Built Materials', desc: 'Syllabus-aligned resources are selected and taught with fluency, judgement, and exam clarity in mind.' },
  { icon: Trophy, title: 'Academic Guidance', desc: 'Support extends beyond the lesson into planning, confidence, and sensible academic direction.' },
  { icon: Activity, title: 'Visible Progress', desc: 'Families receive honest feedback on strengths, gaps, and what should happen next.' },
  { icon: GraduationCap, title: 'Serious Teaching Standard', desc: 'Students are taught by accredited teachers and exceptional academic mentors.' },
  { icon: PenTool, title: 'Correction-Driven Learning', desc: 'Mistakes are reviewed carefully so weak spots become method rather than repetition.' },
  { icon: Smile, title: 'Thoughtful Entry Point', desc: 'Families can begin with a consultation, ask direct questions, and choose with clarity.' },
  { icon: Laptop, title: 'Flexible Delivery', desc: 'Private, small-group, online, and in-person options are matched carefully to the student.' },
];

const benefits = [
  {
    title: 'Personal attention that matters',
    desc: 'Students are known by name, learning pattern, and the points where confidence starts to slip.',
  },
  {
    title: 'Genuine mentorship',
    desc: 'Support extends beyond content into confidence, study habits, and academic direction.',
  },
  {
    title: 'Teaching, not supervision',
    desc: 'Sessions are designed for explanation, correction, and active thinking rather than passive worksheet completion.',
  },
  {
    title: 'Real understanding',
    desc: 'We focus on clarity first, so marks improve through stronger mathematical thinking rather than memorisation alone.',
  },
  {
    title: 'You are not a number',
    desc: 'Families receive honest communication and a pathway shaped around the student in front of us.',
  },
];

const teamCardSizes = '(max-width: 768px) 88vw, (max-width: 1280px) 33vw, 410px';
const buildTeamCardImage = (sourceUrl: string) =>
  responsiveCloudinaryImage(sourceUrl, {
    widths: [320, 410, 512, 640],
    aspectRatio: [4, 5],
    sizes: teamCardSizes,
    crop: 'fill',
    gravity: 'auto',
  });

const team = teamMembers.map((member) => ({
  ...member,
  imageOptimized: buildTeamCardImage(member.imageUrl),
  fallback: member.fallbackUrl,
}));

const HomeDeferredSections: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [isAvailable, setIsAvailable] = useState(false);
  const [activeProgramSlide, setActiveProgramSlide] = useState(0);
  const programSlidesRef = useRef<HTMLDivElement | null>(null);
  const isDraggingProgramsRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartScrollLeftRef = useRef(0);

  useEffect(() => {
    const checkAvailability = () => {
      const now = new Date();
      const sydneyTime = new Date(now.toLocaleString('en-US', { timeZone: 'Australia/Sydney' }));
      const hour = sydneyTime.getHours();
      setIsAvailable(hour >= 9 && hour < 23);
    };

    checkAvailability();
    const interval = setInterval(checkAvailability, 60000);
    return () => clearInterval(interval);
  }, []);

  const handlePhoneClick = () => trackPhoneClick('home', 'home_bottom_cta');
  const scrollToProgramSlide = (index: number) => {
    const rail = programSlidesRef.current;
    if (!rail) return;
    const nextIndex = (index + programSlides.length) % programSlides.length;
    const target = rail.children.item(nextIndex) as HTMLElement | null;
    target?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
    setActiveProgramSlide(nextIndex);
  };

  return (
    <>
      <section id="programs" className="ryze-section ryze-bg-primary">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 max-w-3xl">
            <div className="eyebrow">Programs</div>
            <h2 className="mt-5 ryze-heading-2 ryze-text-primary">A more exact pathway for each stage of mathematics.</h2>
              <p className="mt-4 max-w-2xl text-[1.02rem] leading-relaxed ryze-text-secondary">
                Each Ryze program is shaped around the level of difficulty, independence, and support students need at that point in school.
              </p>
          </div>

          <div className="relative">
            <div
              ref={programSlidesRef}
              onPointerDown={(event) => {
                if (event.pointerType !== 'mouse') return;
                const rail = event.currentTarget;
                isDraggingProgramsRef.current = true;
                dragStartXRef.current = event.clientX;
                dragStartScrollLeftRef.current = rail.scrollLeft;
                rail.style.cursor = 'grabbing';
              }}
              onPointerMove={(event) => {
                if (!isDraggingProgramsRef.current || event.pointerType !== 'mouse') return;
                const rail = event.currentTarget;
                const delta = event.clientX - dragStartXRef.current;
                rail.scrollLeft = dragStartScrollLeftRef.current - delta;
              }}
              onPointerUp={(event) => {
                if (event.pointerType !== 'mouse') return;
                isDraggingProgramsRef.current = false;
                event.currentTarget.style.cursor = 'grab';
              }}
              onPointerLeave={(event) => {
                if (event.pointerType !== 'mouse') return;
                isDraggingProgramsRef.current = false;
                event.currentTarget.style.cursor = 'grab';
              }}
              onScroll={(event) => {
                const rail = event.currentTarget;
                const slideWidth = rail.clientWidth;
                if (slideWidth === 0) return;
                const nextIndex = Math.round(rail.scrollLeft / slideWidth);
                if (nextIndex !== activeProgramSlide) setActiveProgramSlide(nextIndex);
              }}
              className="-mx-2 flex snap-x snap-mandatory gap-4 overflow-x-auto px-2 pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:-mx-4 sm:gap-6 sm:px-4 sm:pb-3"
              style={{ touchAction: 'pan-x', cursor: 'grab' }}
            >
              {programSlides.map((slide) => (
                <div key={slide.id} className="min-w-full snap-start">
                  <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.75fr)]">
                    <article
                      id={slide.featured.id}
                      className="relative overflow-hidden rounded-[1.7rem] border border-[rgba(23,29,40,0.08)] ryze-bg-surface-dark p-6 ryze-text-inverse shadow-[0_28px_72px_-44px_rgba(17,21,29,0.52)] sm:rounded-[2rem] sm:p-8 lg:p-10"
                    >
                      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(200,158,43,0.8),transparent)]" />
                      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[var(--ryze-200)]">{slide.featured.badge}</p>
                      <h3 className="mt-4 ryze-heading-2 ryze-text-inverse">{slide.featured.title}</h3>
                      <p className="mt-4 max-w-2xl text-[0.97rem] leading-8 ryze-text-inverse-muted sm:mt-5 sm:text-[1rem]">{slide.featured.blurb}</p>
                      <div className="mt-6 grid gap-4 border-t border-white/10 pt-5 sm:mt-8 sm:pt-6 lg:grid-cols-2">
                        <p className="text-sm font-medium leading-6 ryze-text-inverse-muted sm:leading-7">{slide.featured.detailLead}</p>
                        <p className="text-sm leading-6 ryze-text-inverse-muted sm:leading-7">{slide.featured.detailSupport}</p>
                      </div>
                      <PrimaryCTA
                        page="home"
                        placement={`programs_${slide.featured.id}`}
                        styleVariant="primary"
                        size="md"
                        label={slide.featured.ctaLabel}
                        href={slide.featured.href}
                        className="mt-7 w-full sm:mt-8 sm:w-auto"
                      />
                    </article>

                    <div className="flex flex-col gap-4 sm:gap-5">
                      {slide.secondary.map((program) => (
                        <article
                          key={program.id}
                          id={program.id}
                          className="rounded-[1.45rem] border border-[rgba(23,29,40,0.08)] bg-[rgba(248,243,234,0.72)] p-5 shadow-[0_22px_52px_-40px_rgba(17,21,29,0.26)] backdrop-blur-sm sm:rounded-[1.7rem] sm:p-6"
                        >
                          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">{program.badge}</p>
                          <h3 className="mt-3 ryze-heading-3 ryze-text-primary">{program.title}</h3>
                          <p className="mt-3 text-sm leading-6 ryze-text-secondary sm:leading-7">{program.blurb}</p>
                          <div className="mt-4 space-y-3 border-t border-[rgba(23,29,40,0.08)] pt-4 sm:mt-5">
                            <p className="text-sm font-medium leading-6 ryze-text-primary sm:leading-7">{program.detailLead}</p>
                            <p className="text-sm leading-6 ryze-text-secondary sm:leading-7">{program.detailSupport}</p>
                          </div>
                          <PrimaryCTA
                            page="home"
                            placement={`programs_${program.id}`}
                            styleVariant="primary"
                            size="sm"
                            label={program.ctaLabel}
                            href={program.href}
                            className="mt-5 w-full sm:w-auto"
                          />
                        </article>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between gap-3 sm:mt-7">
            <button
              type="button"
              onClick={() => scrollToProgramSlide(activeProgramSlide - 1)}
              className="inline-flex h-12 shrink-0 items-center gap-2 rounded-full border border-[rgba(200,158,43,0.38)] bg-[linear-gradient(135deg,#171d28_0%,#21293a_100%)] px-3.5 text-[#f8f3ea] shadow-[0_24px_52px_-28px_rgba(17,21,29,0.46)] transition duration-200 hover:border-[rgba(200,158,43,0.68)] hover:bg-[linear-gradient(135deg,#11151d_0%,#263149_100%)] sm:h-14 sm:px-5"
              aria-label="Show previous program slide"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[linear-gradient(135deg,#d6a12a_0%,#b8841e_100%)] text-[#171d28] sm:h-9 sm:w-9">
                <ChevronLeft size={20} strokeWidth={2.8} />
              </span>
              <span className="pr-0.5 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-white/88 sm:text-[0.78rem]">Prev</span>
            </button>

            <div className="flex items-center justify-center gap-3">
            {programSlides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => scrollToProgramSlide(index)}
                className={`h-3 rounded-full transition-all ${index === activeProgramSlide ? 'w-10 bg-[var(--accent)]' : 'w-3 bg-[rgba(23,29,40,0.14)]'}`}
                aria-label={`Show program slide ${index + 1}`}
                aria-pressed={index === activeProgramSlide}
              />
            ))}
            </div>

            <button
              type="button"
              onClick={() => scrollToProgramSlide(activeProgramSlide + 1)}
              className="inline-flex h-12 shrink-0 items-center gap-2 rounded-full border border-[rgba(200,158,43,0.38)] bg-[linear-gradient(135deg,#171d28_0%,#21293a_100%)] px-3.5 text-[#f8f3ea] shadow-[0_24px_52px_-28px_rgba(17,21,29,0.46)] transition duration-200 hover:border-[rgba(200,158,43,0.68)] hover:bg-[linear-gradient(135deg,#11151d_0%,#263149_100%)] sm:h-14 sm:px-5"
              aria-label="Show next program slide"
            >
              <span className="pl-0.5 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-white/88 sm:text-[0.78rem]">Next</span>
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[linear-gradient(135deg,#d6a12a_0%,#b8841e_100%)] text-[#171d28] sm:h-9 sm:w-9">
                <ChevronRight size={20} strokeWidth={2.8} />
              </span>
            </button>
          </div>

          <div className="mt-8 rounded-[1.8rem] border border-[rgba(23,29,40,0.08)] bg-white/55 p-6 backdrop-blur-sm sm:flex sm:items-center sm:justify-between sm:gap-6">
            <div>
              <h3 className="ryze-heading-3 ryze-text-primary mb-4">Not sure which format or pathway fits best?</h3>
              <p className="mt-2 text-sm ryze-text-secondary">
                Tell us the year level, current confidence, and academic goal. We&apos;ll recommend the right starting point, whether that means private tutoring or a small-group class.
              </p>
            </div>
            <PrimaryCTA
              page="home"
              placement="recommendation_cta"
              styleVariant="primary"
              size="md"
              label="Get a recommendation"
              href={ROUTES.CONTACT}
              className="mt-4 sm:mt-0"
            />
          </div>

          <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
            {deliveryFormats.map((format) => (
              <article
                key={format.title}
                className="rounded-[1.8rem] border border-[rgba(23,29,40,0.08)] bg-[rgba(248,243,234,0.78)] p-7 shadow-[0_22px_52px_-40px_rgba(17,21,29,0.2)]"
              >
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Delivery Format</p>
                <h3 className="mt-3 ryze-heading-3 ryze-text-primary">{format.title}</h3>
                <p className="mt-3 max-w-xl text-sm leading-relaxed ryze-text-secondary">{format.intro}</p>
                <div className="mt-6 space-y-3 border-t border-[rgba(23,29,40,0.08)] pt-5">
                  {format.points.map((point) => (
                    <div key={point} className="flex items-start gap-3">
                      <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[rgba(184,132,30,0.1)] text-[var(--accent)]">
                        <CheckCircle2 size={12} />
                      </div>
                      <p className="text-sm leading-relaxed ryze-text-primary">{point}</p>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <Suspense fallback={<div className="h-[50vh] w-full ryze-bg-primary" />}>
        <Testimonials />
      </Suspense>

      <section className="relative overflow-hidden ryze-bg-primary py-28">
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 flex flex-col items-end justify-between gap-6 md:flex-row">
            <div className="max-w-2xl">
              <div className="eyebrow">{t('Academic Team')}</div>
              <h2 className="mt-5 mb-4 ryze-heading-2 ryze-text-primary">{t('Meet the educators behind the standard.')}</h2>
              <p className="text-lg ryze-text-secondary">
                {t('Accredited teachers, exceptional academic performers, and mentors who know how to teach with both rigour and judgement.')}
              </p>
            </div>
            <PrimaryCTA
              page="home"
              placement="team_view_all"
              styleVariant="primary"
              size="md"
              label={t('View All Team')}
              href="/meet-the-team"
              className="w-full sm:w-auto"
            />
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {team.map((member, idx) => (
              <motion.button
                type="button"
                key={member.id}
                className="group cursor-pointer border-0 bg-transparent p-0 text-left"
                onClick={() => navigate(`/meet-the-team#${member.id}`)}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <div className="mb-4 rounded-[1.4rem] border border-[rgba(23,29,40,0.08)] bg-white/72 p-4 backdrop-blur-md">
                  <h4 className="mb-2 text-center text-base font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">HSC Marks</h4>
                  <div className="flex flex-wrap justify-center gap-x-3 gap-y-1">
                    {member.scores.map((score, i) => (
                      <span key={`${member.id}-${i}`} className="text-sm font-semibold ryze-text-secondary">
                        {score}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="relative mb-6 aspect-[3/4] overflow-hidden rounded-[2rem] ryze-bg-placeholder shadow-[0_26px_60px_-40px_rgba(17,21,29,0.35)]">
                  <div className="absolute left-3 top-3 z-20 md:left-5 md:top-5">
                    <div className="rounded-[1.15rem] border border-[rgba(184,132,30,0.18)] bg-[rgba(248,243,234,0.92)] shadow-[0_18px_40px_-26px_rgba(17,21,29,0.34)] backdrop-blur-xl md:rounded-[1.35rem]">
                      <div className="px-3.5 py-2.5 ryze-text-primary md:px-4.5 md:py-3.5">
                        <div className="mb-1.5 flex items-center gap-1.5 md:gap-2">
                          <Star className="h-3.5 w-3.5 text-[var(--accent)] md:h-4 md:w-4" fill="currentColor" />
                          <p className="text-[0.66rem] font-bold uppercase tracking-[0.18em] text-[var(--accent)] md:text-[0.72rem]">ATAR</p>
                        </div>
                        <p className="font-sans text-[1.45rem] font-extrabold tracking-[-0.04em] ryze-text-primary md:text-[1.7rem]">{member.atar}</p>
                      </div>
                    </div>
                  </div>

                  <img
                    src={member.imageOptimized.src}
                    srcSet={member.imageOptimized.srcSet}
                    sizes={member.imageOptimized.sizes}
                    width={member.imageOptimized.width}
                    height={member.imageOptimized.height}
                    onError={(e) => {
                      e.currentTarget.removeAttribute('srcset');
                      e.currentTarget.removeAttribute('sizes');
                      e.currentTarget.src = member.fallback;
                    }}
                    alt={member.name}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
                  <div className="absolute bottom-6 left-6 translate-y-2 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                    <span className="rounded-full bg-white/14 px-3 py-1 text-xs font-bold ryze-text-inverse backdrop-blur-md">{t('Read Bio')}</span>
                  </div>
                </div>

                <div className="pl-2">
                  <h3 className="mb-1 ryze-heading-3 ryze-text-primary transition-colors group-hover:text-[var(--accent)]">{member.name}</h3>
                  <p className="mb-1.5 text-sm font-medium ryze-text-secondary">{t(member.role)}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden ryze-bg-surface-dark px-4 py-24 ryze-text-inverse md:py-32">
        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="mx-auto mb-20 max-w-3xl text-center">
            <div className="eyebrow !border-white/10 !bg-white/6 !text-[var(--ryze-200)]">{t('Why Families Choose Ryze')}</div>
            <h2 className="mt-5 mb-6 ryze-heading-2 ryze-text-inverse">{t('Academic rigour, delivered with structure.')}</h2>
            <p className="text-lg font-normal ryze-text-inverse-muted">
              {t('Ryze is built for families who want serious teaching, smaller learning environments, and progress that is monitored carefully rather than assumed.')}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: idx * 0.05 }}
                className="group flex flex-col rounded-[2rem] border border-white/10 bg-white/6 p-8 shadow-[0_28px_56px_-42px_rgba(0,0,0,0.48)] transition-all duration-300 hover:-translate-y-2 hover:bg-white/8"
              >
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/8 text-[var(--ryze-200)] transition-colors duration-300 group-hover:bg-[var(--accent)] group-hover:text-[var(--accent-foreground)]">
                  <feature.icon size={28} strokeWidth={2} />
                </div>
                <h3 className="mb-3 ryze-heading-3 ryze-text-inverse">{t(feature.title)}</h3>
                <p className="flex-grow text-sm leading-relaxed ryze-text-inverse-muted">{t(feature.desc)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden ryze-bg-primary py-24">
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2 lg:gap-24">
            <div>
              <div className="eyebrow mb-6">{t('Our Philosophy')}</div>
              <h2 className="mb-8 ryze-heading-2 ryze-text-primary">
                {t('Education that')} <br /> <span className="text-[var(--accent)]">{t('sees you.')}</span>
              </h2>
              <p className="mb-8 text-lg leading-relaxed ryze-text-secondary">
                {t('At Ryze, we believe strong learning depends on attention. Students make better progress when they are known properly: their habits, their gaps, their confidence, and the way they respond to challenge. That is why we offer both carefully run small-group classes and one-to-one support, with expectations kept high and teaching kept personal.')}
              </p>
              <div className="mb-8 max-w-xl rounded-[1.5rem] border border-[rgba(23,29,40,0.08)] bg-white/58 p-5 shadow-[0_18px_44px_-36px_rgba(17,21,29,0.22)]">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">What this means in practice</p>
                <p className="mt-3 text-sm leading-relaxed ryze-text-secondary">
                  Families choose Ryze because they want more than weekly worksheets. They want a serious learning environment where students build confidence, sharpen mathematical judgement, and receive guidance that is calm, direct, and academically useful.
                </p>
              </div>
                <PrimaryCTA
                  variant="link"
                  href={ROUTES.CONTACT}
                  size="lg"
                  page="home"
                  placement="home_philosophy"
                  className="!text-white hover:!text-white"
                />
            </div>

            <div className="space-y-5">
              {benefits.map((benefit, idx) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ x: 5 }}
                  className="flex items-start gap-5 rounded-[1.6rem] border border-[rgba(23,29,40,0.08)] bg-white/58 p-6 shadow-[0_20px_48px_-36px_rgba(17,21,29,0.22)] transition-all hover:border-[rgba(184,132,30,0.28)] hover:shadow-[0_26px_56px_-36px_rgba(17,21,29,0.28)]"
                >
                  <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[rgba(184,132,30,0.18)] bg-[rgba(184,132,30,0.08)] text-[var(--accent)]">
                    <CheckCircle2 size={20} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="ryze-heading-3 ryze-text-primary">{t(benefit.title)}</h3>
                    <p className="mt-1 text-sm leading-relaxed ryze-text-secondary">{t(benefit.desc)}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative ryze-bg-primary px-0 py-20 sm:px-4 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="relative overflow-hidden border border-[rgba(23,29,40,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(246,239,228,0.94))] shadow-[0_28px_72px_-44px_rgba(17,21,29,0.28)] sm:rounded-[3rem]">
            <div className="relative z-10 grid grid-cols-1 items-start gap-10 px-5 py-10 sm:p-10 md:p-16 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.78fr)] lg:gap-16 lg:p-20">
              <div className="space-y-8 text-center lg:text-left">
                <div className="eyebrow">{t('Take The Next Step')}</div>
                <h2 className="ryze-heading-2 ryze-text-primary mb-4">
                  {t('A thoughtful first step for families.')}
                </h2>
                <p className="mx-auto max-w-xl text-lg font-medium leading-relaxed ryze-text-secondary md:text-xl lg:mx-0">
                  {t('We will discuss year level, confidence, goals, and class fit, then recommend the most suitable starting point academically and practically.')}
                </p>

                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    'Share the current year level, goals, and pressures',
                    'Clarify strengths, gaps, and the right learning format',
                    'Leave with a clear recommendation for the next step',
                  ].map((item, idx) => (
                    <div key={item} className="rounded-[1.4rem] border border-[rgba(23,29,40,0.08)] bg-white/72 p-4 text-left shadow-[0_16px_36px_-30px_rgba(17,21,29,0.18)]">
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Step {idx + 1}</p>
                      <p className="mt-2 text-sm font-medium leading-relaxed ryze-text-primary">{item}</p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col justify-center gap-3 sm:flex-row sm:items-stretch sm:gap-4 lg:justify-start">
                  <PrimaryCTA
                    variant="link"
                    href={ROUTES.CONTACT}
                    size="lg"
                    page="home"
                    placement="home_bottom_cta"
                    label="Book a Free Consultation"
                    icon="calendar_alert"
                    className="group w-full justify-between rounded-[1.55rem] border border-[rgba(184,132,30,0.16)] bg-[linear-gradient(135deg,#d29a20_0%,#b8841e_100%)] px-5 py-4 !text-white shadow-[0_22px_48px_-26px_rgba(184,132,30,0.5)] hover:border-[rgba(184,132,30,0.24)] hover:!text-white hover:shadow-[0_28px_58px_-28px_rgba(184,132,30,0.58)] sm:min-h-[5.4rem] sm:w-[clamp(238px,24vw,270px)]"
                  />
                  <PrimaryCTA
                    page="home"
                    placement="home_bottom_cta_phone"
                    styleVariant="primary"
                    size="lg"
                    label={t('Give us a call now!')}
                    icon="phone"
                    href="tel:+61413885839"
                    className="group w-full justify-between rounded-[1.55rem] border border-[rgba(23,29,40,0.1)] bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(250,246,239,0.94))] px-5 py-4 !text-[#171d28] shadow-[0_20px_44px_-30px_rgba(17,21,29,0.24)] hover:border-[rgba(184,132,30,0.24)] hover:!text-[#171d28] hover:shadow-[0_26px_54px_-32px_rgba(17,21,29,0.28)] sm:min-h-[5.4rem] sm:w-[clamp(238px,24vw,270px)] [&_svg]:text-[var(--accent)]"
                    onClick={handlePhoneClick}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-[1.8rem] border border-[rgba(23,29,40,0.08)] ryze-bg-surface-dark p-6 ryze-text-inverse shadow-[0_24px_50px_-34px_rgba(17,21,29,0.38)]">
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[var(--ryze-200)]">What we will cover</p>
                  <div className="mt-4 space-y-4">
                    {[
                      'The student’s current level, goals, and academic priorities',
                      'Whether private tutoring or a small-group class makes the most sense',
                      'What meaningful progress should look like across the first term',
                    ].map((item) => (
                      <div key={item} className="flex gap-3">
                        <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[rgba(184,132,30,0.14)] text-[var(--ryze-200)]">
                          <CheckCircle2 size={12} />
                        </div>
                        <p className="text-sm leading-relaxed ryze-text-inverse-muted">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[1.8rem] border border-[rgba(23,29,40,0.08)] bg-white/78 p-6 shadow-[0_18px_44px_-32px_rgba(17,21,29,0.22)]">
                  <div className="flex items-center gap-4">
                    <img
                      src="https://res.cloudinary.com/dsvjhemjd/image/upload/f_auto,q_auto:good,c_fill,g_face,w_120,h_120/v1764105304/0739d6ceb5594812228108103c314c99_nd6cb5.jpg"
                      alt="Michael Yang"
                      width={56}
                      height={56}
                      className="h-14 w-14 rounded-full border-2 border-[rgba(200,158,43,0.3)] object-cover"
                    />
                    <div>
                      <div className="text-lg font-bold ryze-text-primary">Michael Yang</div>
                      <div className="text-sm ryze-text-secondary">{t('Founder of Ryze Education')}</div>
                      {isAvailable ? (
                        <div className="mt-1 inline-flex w-fit items-center gap-1 rounded-full bg-[rgba(184,132,30,0.12)] px-2 py-0.5 text-xs font-bold text-[var(--accent)]">
                          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--ryze-success)]"></div> {t('Available for call (9am-11pm)')}
                        </div>
                      ) : (
                        <div className="mt-1 inline-flex w-fit items-center gap-1 rounded-full bg-[rgba(23,29,40,0.06)] px-2 py-0.5 text-xs font-bold ryze-text-secondary">
                          <Clock size={10} /> {t('Back at 9am SYD')}
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed ryze-text-secondary">
                    {t('If you are unsure where your child fits, we can talk through the options and recommend a practical, academically sensible starting point.')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HomeDeferredSections;
