import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  BookOpenCheck,
  CalendarCheck2,
  CheckCircle2,
  ChevronRight,
  MessageCircle,
  PenTool,
  Phone,
  ShieldCheck,
  Star,
  Target,
  Users,
} from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import PrimaryCTA from '../components/PrimaryCTA';
import { Container, TestimonialCard } from '../components/design';
import { trackEvent } from '../src/analytics';
import { trackPhoneClick, postMetaConversion } from '../src/lib/tracking';
import { validateEmail, validatePhone } from '../src/lib/validation';
import { testimonials } from '../data/testimonials';
import { applySeo } from '../src/utils/seo';
import { ROUTES } from '../src/constants/routes';

const heroImageBase = 'https://res.cloudinary.com/dsvjhemjd/image/upload/f_auto,q_auto,c_fill,g_auto';
const heroImageId = 'ryze/images/image-v1';
const heroImageSrc = `${heroImageBase},w_768/${heroImageId}`;
const heroImageSrcSet = [
  `${heroImageBase},w_360/${heroImageId} 360w`,
  `${heroImageBase},w_480/${heroImageId} 480w`,
  `${heroImageBase},w_640/${heroImageId} 640w`,
  `${heroImageBase},w_768/${heroImageId} 768w`,
  `${heroImageBase},w_960/${heroImageId} 960w`,
  `${heroImageBase},w_1200/${heroImageId} 1200w`,
  `${heroImageBase},w_1280/${heroImageId} 1280w`,
].join(', ');

const heroSignals = [
  { label: 'Streams', value: 'Advanced, Ext 1, Ext 2' },
  { label: 'Format', value: 'Private and small-group' },
  { label: 'Method', value: 'Exam technique and weekly review' },
  { label: 'Families', value: 'Clear parent communication' },
];

const proofPillars = [
  {
    title: 'Exam technique taught explicitly',
    description:
      'Students learn mark-efficient structure, notation, and method instead of hoping good habits appear on their own.',
    icon: PenTool,
  },
  {
    title: 'Weekly accountability that compounds',
    description:
      'Each lesson is tied to revision targets, timed work, and a clear next step so momentum does not drift between classes.',
    icon: CalendarCheck2,
  },
  {
    title: 'Calmer high-stakes performance',
    description:
      'We train for trials and the HSC with repetition, pressure rehearsal, and feedback that sharpens both speed and judgement.',
    icon: Target,
  },
];

const programTracks = [
  {
    title: 'Mathematics Advanced',
    summary:
      'For students who need stronger algebra, cleaner working, and steadier performance across core HSC topics.',
    focus: ['Algebraic fluency and graphing', 'Exam structure and mark conversion', 'Confidence before trials'],
  },
  {
    title: 'Extension 1',
    summary:
      'For students ready to lift their pace, refine proof structure, and become more reliable under time pressure.',
    focus: ['Higher-order problem solving', 'Structured reasoning and notation', 'Consistent top-band preparation'],
  },
  {
    title: 'Extension 2',
    summary:
      'For ambitious students who need sharper proofs, stronger mathematical judgement, and disciplined weekly execution.',
    focus: ['Proof writing and extension topics', 'Polished written communication', 'Top-band exam rehearsal'],
  },
];

const weeklySystem = [
  {
    title: 'Diagnostic starting point',
    description: 'We identify current level, topic gaps, target marks, and the exam timeline before lessons begin.',
  },
  {
    title: 'Focused weekly lessons',
    description: 'Each session tackles syllabus content, exam method, and the exact errors currently holding marks back.',
  },
  {
    title: 'Timed practice and review',
    description: 'Students complete exam-style work with direct feedback on structure, accuracy, and mark efficiency.',
  },
  {
    title: 'Parent visibility',
    description:
      'Families get clarity on progress, current priorities, and what needs to happen before the next milestone.',
  },
];

const contactHighlights = [
  'Free consultation with a clear recommendation',
  'Placement across Advanced, Extension 1, or Extension 2',
  'Private and small-group options available',
];

const studentSegments = [
  'Year 11 - Advanced',
  'Year 11 - Extension 1',
  'Year 12 - Advanced',
  'Year 12 - Extension 1',
  'Year 12 - Extension 2',
];

type FormState = {
  name: string;
  email: string;
  phone: string;
  studentLevel: string;
  honey: string;
};

const defaultForm: FormState = {
  name: '',
  email: '',
  phone: '',
  studentLevel: 'Year 12 - Advanced',
  honey: '',
};

const HscMathsTutoring: React.FC = () => {
  const location = useLocation();
  const reduceMotion = useReducedMotion();
  const mobileTestimonialsRef = useRef<HTMLDivElement | null>(null);
  const [formData, setFormData] = useState<FormState>(defaultForm);
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [activeMobileReview, setActiveMobileReview] = useState(0);

  const featuredTestimonials = useMemo(() => {
    const hsc = testimonials.filter((item) => item.category === 'HSC' && item.studentGrade === 'Year 12');
    if (hsc.length > 0) return hsc;
    return testimonials.slice(0, 6);
  }, []);

  const testimonialMarquee = useMemo(
    () => (reduceMotion ? featuredTestimonials : [...featuredTestimonials, ...featuredTestimonials]),
    [featuredTestimonials, reduceMotion],
  );

  const landingVariant = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const offer = (params.get('offer') || '').toLowerCase();
    const utmCampaign = (params.get('utm_campaign') || '').toLowerCase();
    const isExt2Focus = offer.includes('ext2') || utmCampaign.includes('ext2');
    const isHscFocus = offer.includes('hsc') || utmCampaign.includes('hsc') || isExt2Focus;

    return {
      isExt2Focus,
      isHscFocus,
      heroTitle: isExt2Focus
        ? 'HSC | Year 11 and 12 program for students chasing the top band.'
        : 'HSC | Year 11 and 12 program built for stronger marks and calmer exams.',
      subheading: isExt2Focus
        ? 'Extension 2 mentoring for sharper proofs, cleaner structure, and better high-pressure execution.'
        : isHscFocus
          ? 'Advanced and Extension support for students who need stronger working, better judgement, and more reliable exam performance.'
          : 'Private and small-group HSC | Year 11 and 12 support for students who want clearer working, stronger marks, and more confidence before trials and the HSC.',
    };
  }, [location.search]);

  useEffect(() => {
    applySeo({
      title: 'HSC | Year 11 and 12 Sydney | Advanced, Ext 1, Ext 2 | Ryze Education',
      description:
        'High-performance HSC | Year 11 and 12 program in Sydney for Advanced, Extension 1, and Extension 2. Book a free consultation and get a personalised study plan.',
      path: ROUTES.HSC_MATHS_PROGRAM,
      ogTitle: 'HSC | Year 11 and 12 Sydney | Ryze Education',
      ogDescription:
        'Targeted HSC | Year 11 and 12 programs for Advanced, Extension 1, and Extension 2 with weekly feedback and exam-focused mentoring.',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: 'Ryze Education',
        areaServed: 'Sydney',
        url: `${window.location.origin}${ROUTES.HSC_MATHS_PROGRAM}`,
        telephone: '+61 413 885 839',
      },
    });
  }, []);

  useEffect(() => {
    if (!import.meta.env.DEV) return;

    let disposePerfDebug: undefined | (() => void);
    void import('../src/utils/perfDebug').then(({ initPerfDebug }) => {
      disposePerfDebug = initPerfDebug('hsc_landing');
    });

    return () => {
      disposePerfDebug?.();
    };
  }, []);

  const handlePhoneClick = () => trackPhoneClick('hsc_landing', 'book');

  const handleWhatsappClick = () => {
    trackEvent('whatsapp_click', { page: 'hsc_landing', placement: 'book' });
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
    if (status !== 'idle') setStatus('idle');
    if (errorMessage) setErrorMessage('');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage('');

    if (formData.honey) {
      setStatus('success');
      setFormData(defaultForm);
      return;
    }

    if (!validateEmail(formData.email)) {
      setStatus('error');
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (!validatePhone(formData.phone)) {
      setStatus('error');
      setErrorMessage('Please enter a valid phone number.');
      return;
    }

    setStatus('sending');

    try {
      const submission = { ...formData };
      const response = await fetch('https://formsubmit.co/ryzeeducationhq@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          name: submission.name,
          email: submission.email,
          phone: submission.phone,
          message: `Student level: ${submission.studentLevel}`,
          _subject: `HSC Landing Enquiry - ${submission.name}`,
          _template: 'table',
          _captcha: 'false',
          _honey: '',
        }),
      });

      if (!response.ok) {
        setStatus('error');
        setErrorMessage('Submission failed. Please try again or call us directly.');
        trackEvent('contact_form_submit', { page: 'hsc_landing', status: 'error' });
        return;
      }

      setStatus('success');
      setErrorMessage('');
      setFormData(defaultForm);
      trackEvent('contact_form_submit', { page: 'hsc_landing', status: 'success' });
      void postMetaConversion({
        eventName: 'Contact',
        name: submission.name,
        email: submission.email,
        phone: submission.phone,
        userAgent: navigator.userAgent,
        sourceUrl: window.location.href,
      });
    } catch {
      setStatus('error');
      setErrorMessage('Submission failed. Please try again or call us directly.');
      trackEvent('contact_form_submit', { page: 'hsc_landing', status: 'error' });
    }
  };

  const scrollToMobileReview = (index: number) => {
    const rail = mobileTestimonialsRef.current;
    if (!rail) return;

    const nextIndex = (index + featuredTestimonials.length) % featuredTestimonials.length;
    const target = rail.children.item(nextIndex) as HTMLElement | null;
    if (!target) return;

    target.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
    setActiveMobileReview(nextIndex);
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#11151d] text-[#f8f3ea]">
      <section className="relative min-h-screen min-h-[100dvh] overflow-hidden bg-[#11151d] pt-[5.5rem] md:pt-[6rem]">
        <img
          src={heroImageSrc}
          srcSet={heroImageSrcSet}
          sizes="100vw"
          alt="HSC | Year 11 and 12 program in Sydney"
          loading="eager"
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 h-full w-full scale-x-[-1] object-cover object-center sm:object-[54%_center] lg:object-[62%_center] xl:object-[68%_center]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(96deg,rgba(17,21,29,0.96)_0%,rgba(17,21,29,0.9)_36%,rgba(17,21,29,0.56)_64%,rgba(17,21,29,0.78)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_22%,rgba(200,158,43,0.16),transparent_24%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,21,29,0.18)_0%,rgba(17,21,29,0)_26%,rgba(17,21,29,0.26)_100%)]" />

        <Container className="relative z-10 pb-12 sm:pb-16 lg:pb-20">
          <div className="grid min-h-[calc(100vh-5.5rem)] min-h-[calc(100dvh-5.5rem)] items-end gap-10 py-8 md:min-h-[calc(100vh-6rem)] md:min-h-[calc(100dvh-6rem)] lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-14 lg:py-12">
            <motion.div
              initial={reduceMotion ? undefined : { opacity: 0, y: 28 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-[44rem]"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(184,132,30,0.35)] bg-[rgba(255,255,255,0.05)] px-4 py-2 text-[0.75rem] font-semibold uppercase tracking-[0.24em] text-[var(--color-ryze-400)] backdrop-blur-md">
                <ShieldCheck size={14} aria-hidden="true" />
                HSC | Year 11 and 12 | Sydney
              </div>
              <h1 className="mt-6 max-w-[11ch] font-display text-[clamp(3.6rem,8vw,6.8rem)] font-semibold leading-[0.86] tracking-[-0.055em] text-[#f8f3ea]">
                {landingVariant.heroTitle}
              </h1>
              <p className="mt-5 max-w-[34rem] text-[1rem] leading-7 text-white/74 sm:mt-6 sm:text-[1.12rem] sm:leading-8">
                {landingVariant.subheading}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <PrimaryCTA
                  variant="link"
                  href="#book"
                  size="lg"
                  page="hsc_landing"
                  placement="hsc_hero"
                  className="w-full justify-center sm:w-auto"
                />
                <a
                  href="tel:+61413885839"
                  onClick={handlePhoneClick}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/12 bg-white/6 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] sm:w-auto"
                  aria-label="Call Ryze Education"
                >
                  <Phone size={16} aria-hidden="true" />
                  Call +61 413 885 839
                </a>
              </div>

              <p className="mt-4 text-sm text-white/58">Free consultation. Clear recommendation. No lock-in commitment.</p>

              <div className="mt-8 grid gap-4 border-t border-white/10 pt-6 sm:mt-10 sm:gap-5 sm:pt-8 sm:grid-cols-2 xl:grid-cols-4">
                {heroSignals.map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={reduceMotion ? undefined : { opacity: 0, y: 18 }}
                    animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, delay: 0.12 + index * 0.08 }}
                    className="border-l border-white/10 pl-4"
                  >
                    <p className="text-[0.72rem] font-bold uppercase tracking-[0.28em] text-[var(--color-ryze-400)]">{item.label}</p>
                    <p className="mt-2 text-[1rem] font-semibold leading-[1.45] text-white/92">{item.value}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={reduceMotion ? undefined : { opacity: 0, x: 24 }}
              animate={reduceMotion ? undefined : { opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="hidden border-l border-white/10 pl-8 lg:block"
            >
              <p className="text-[0.75rem] font-semibold uppercase tracking-[0.22em] text-white/48">Why families come to Ryze</p>
              <div className="mt-6 space-y-6">
                {proofPillars.map((pillar) => (
                  <div key={pillar.title}>
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(184,132,30,0.35)] bg-[rgba(255,255,255,0.05)] text-[var(--color-ryze-400)]">
                      <pillar.icon size={18} aria-hidden="true" />
                    </div>
                    <h2 className="mt-4 text-[1.05rem] font-semibold leading-[1.35] text-[#f8f3ea]">{pillar.title}</h2>
                    <p className="mt-2 text-sm leading-7 text-white/62">{pillar.description}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </Container>
      </section>

      <section className="bg-[#f4efe7] py-18 text-[#171d28] sm:py-24">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
            <motion.div
              initial={reduceMotion ? undefined : { opacity: 0, y: 22 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-[0.78rem] font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">The Ryze difference</p>
              <h2 className="mt-4 max-w-[12ch] font-display text-[clamp(2.7rem,5vw,4.7rem)] font-semibold leading-[0.94] tracking-[-0.05em] text-[#171d28]">
                A sharper system for Advanced, Extension 1, and Extension 2.
              </h2>
              <p className="mt-5 max-w-[30rem] text-[1.03rem] leading-8 text-[#4f4a44]">
                This page is built for families who are not looking for generic tutoring. They want a program that improves mathematical judgement, written structure, and exam performance over the term.
              </p>
            </motion.div>

            <motion.div
              initial={reduceMotion ? undefined : { opacity: 0, y: 22 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.08 }}
              className="grid gap-6 border-t border-[#171d28]/10 pt-6 sm:grid-cols-3"
            >
              <div>
                <p className="text-[2.35rem] font-semibold tracking-[-0.05em] text-[#171d28]">500+</p>
                <p className="mt-2 text-sm leading-6 text-[#5b5752]">Students supported across Sydney with structured maths mentoring.</p>
              </div>
              <div>
                <p className="text-[2.35rem] font-semibold tracking-[-0.05em] text-[#171d28]">4.9/5</p>
                <p className="mt-2 text-sm leading-6 text-[#5b5752]">Average parent and student satisfaction across our tutoring programs.</p>
              </div>
              <div>
                <p className="text-[2.35rem] font-semibold tracking-[-0.05em] text-[#171d28]">13+ years</p>
                <p className="mt-2 text-sm leading-6 text-[#5b5752]">Teaching and senior-maths mentoring experience behind the program.</p>
              </div>
            </motion.div>
          </div>

          <div className="mt-16 grid gap-8 border-t border-[#171d28]/10 pt-10 lg:grid-cols-3">
            {programTracks.map((track, index) => (
              <motion.div
                key={track.title}
                initial={reduceMotion ? undefined : { opacity: 0, y: 24 }}
                whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.55, delay: index * 0.06 }}
                className="border-l border-[#171d28]/10 pl-5"
              >
                <p className="text-[0.72rem] font-bold uppercase tracking-[0.26em] text-[var(--accent)]">Program track</p>
                <h3 className="mt-4 text-[1.6rem] font-semibold tracking-[-0.03em] text-[#171d28]">{track.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#5b5752]">{track.summary}</p>
                <div className="mt-6 space-y-3">
                  {track.focus.map((item) => (
                    <div key={item} className="flex items-start gap-3 text-sm leading-6 text-[#171d28]">
                      <CheckCircle2 size={16} className="mt-1 shrink-0 text-[var(--accent)]" aria-hidden="true" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-[#11151d] py-18 sm:py-24">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] lg:gap-16">
            <motion.div
              initial={reduceMotion ? undefined : { opacity: 0, y: 22 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-[0.78rem] font-semibold uppercase tracking-[0.24em] text-[var(--color-ryze-400)]">Weekly rhythm</p>
              <h2 className="mt-4 max-w-[12ch] font-display text-[clamp(2.7rem,5vw,4.5rem)] font-semibold leading-[0.96] tracking-[-0.05em] text-[#f8f3ea]">
                How the program runs each week.
              </h2>
              <p className="mt-5 max-w-[30rem] text-[1.02rem] leading-8 text-white/68">
                Strong results usually come from disciplined repetition, not last-minute intensity. We structure the week so students know what to learn, what to revise, and what to fix next.
              </p>
            </motion.div>

            <div className="space-y-8 border-l border-white/10 pl-6 sm:pl-8">
              {weeklySystem.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={reduceMotion ? undefined : { opacity: 0, x: 22 }}
                  whileInView={reduceMotion ? undefined : { opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="relative"
                >
                  <div className="absolute -left-[2.15rem] top-1.5 h-3 w-3 rounded-full bg-[var(--color-ryze-500)] shadow-[0_0_18px_rgba(184,132,30,0.7)]" />
                  <p className="text-[0.72rem] font-bold uppercase tracking-[0.28em] text-[var(--color-ryze-400)]">Step {index + 1}</p>
                  <h3 className="mt-3 text-[1.35rem] font-semibold tracking-[-0.02em] text-[#f8f3ea]">{item.title}</h3>
                  <p className="mt-2 max-w-[38rem] text-sm leading-7 text-white/66">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div
            initial={reduceMotion ? undefined : { opacity: 0, y: 22 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="mt-16 grid gap-6 border-t border-white/10 pt-8 sm:grid-cols-3"
          >
            <div className="border-l border-white/10 pl-4">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[var(--color-ryze-400)]">
                <BookOpenCheck size={18} aria-hidden="true" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-[#f8f3ea]">Method over memorisation</h3>
              <p className="mt-2 text-sm leading-7 text-white/62">Students learn how marks are actually won in senior maths, not just what content appears in the syllabus.</p>
            </div>
            <div className="border-l border-white/10 pl-4">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[var(--color-ryze-400)]">
                <Activity size={18} aria-hidden="true" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-[#f8f3ea]">Visible academic movement</h3>
              <p className="mt-2 text-sm leading-7 text-white/62">The focus stays on measurable improvement: cleaner working, stronger judgement, and fewer repeated errors.</p>
            </div>
            <div className="border-l border-white/10 pl-4">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[var(--color-ryze-400)]">
                <MessageCircle size={18} aria-hidden="true" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-[#f8f3ea]">Family communication</h3>
              <p className="mt-2 text-sm leading-7 text-white/62">Parents know what is improving, where the pressure points are, and what matters before the next milestone.</p>
            </div>
          </motion.div>
        </Container>
      </section>

      <section className="bg-[#f8f3ea] py-18 text-[#171d28] sm:py-24">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-end">
            <motion.div
              initial={reduceMotion ? undefined : { opacity: 0, y: 22 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-[0.78rem] font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">Results and feedback</p>
              <h2 className="mt-4 max-w-[12ch] font-display text-[clamp(2.7rem,5vw,4.5rem)] font-semibold leading-[0.96] tracking-[-0.05em] text-[#171d28]">
                Families stay when the progress is obvious.
              </h2>
            </motion.div>

            <motion.div
              initial={reduceMotion ? undefined : { opacity: 0, y: 22 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.6, delay: 0.08 }}
              className="grid gap-4 sm:grid-cols-3"
            >
              <div className="border-l border-[#171d28]/10 pl-4">
                <Users size={18} className="text-[var(--accent)]" aria-hidden="true" />
                <p className="mt-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#171d28]/58">Students</p>
                <p className="mt-2 text-sm leading-7 text-[#5b5752]">From Advanced through Extension 2, across both Year 11 and Year 12.</p>
              </div>
              <div className="border-l border-[#171d28]/10 pl-4">
                <Star size={18} className="text-[var(--accent)]" aria-hidden="true" />
                <p className="mt-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#171d28]/58">Parents</p>
                <p className="mt-2 text-sm leading-7 text-[#5b5752]">Families value clarity, consistency, and the sense that someone is genuinely steering the process.</p>
              </div>
              <div className="border-l border-[#171d28]/10 pl-4">
                <BadgeCheck size={18} className="text-[var(--accent)]" aria-hidden="true" />
                <p className="mt-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#171d28]/58">Trust</p>
                <p className="mt-2 text-sm leading-7 text-[#5b5752]">The program is designed for families who want quality control, not casual tutoring.</p>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={reduceMotion ? undefined : { opacity: 0, y: 22 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.55, delay: 0.06 }}
            className="mt-10 border-y border-[#171d28]/10 py-4"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex rounded-full border border-[rgba(184,132,30,0.24)] bg-[rgba(184,132,30,0.08)] px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">
                  HSC only
                </span>
                <p className="text-sm leading-6 text-[#5b5752]">
                  {featuredTestimonials.length} Year 12 reviews rotating across real Advanced, Extension 1, and Extension 2 outcomes.
                </p>
              </div>
              {!reduceMotion && (
                <p className="hidden text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-[#171d28]/50 md:block">
                  Hover to pause
                </p>
              )}
            </div>
          </motion.div>

          <div
            ref={mobileTestimonialsRef}
            onScroll={(event) => {
              const rail = event.currentTarget;
              const viewportCenter = rail.scrollLeft + rail.clientWidth / 2;
              let nextIndex = 0;
              let nearestDistance = Number.POSITIVE_INFINITY;

              Array.from(rail.children).forEach((child, index) => {
                const element = child as HTMLElement;
                const cardCenter = element.offsetLeft + element.offsetWidth / 2;
                const distance = Math.abs(cardCenter - viewportCenter);
                if (distance < nearestDistance) {
                  nearestDistance = distance;
                  nextIndex = index;
                }
              });

              if (nextIndex !== activeMobileReview) {
                setActiveMobileReview(nextIndex);
              }
            }}
            className="-mx-4 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 md:hidden"
            style={{ touchAction: 'pan-x pan-y', WebkitOverflowScrolling: 'touch' }}
          >
            {featuredTestimonials.map((item, index) => (
              <motion.div
                key={item.id}
                initial={reduceMotion ? undefined : { opacity: 0, y: 22 }}
                whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: index * 0.04 }}
                className="min-w-[88%] snap-center sm:min-w-[62%]"
              >
                <TestimonialCard
                  achievement={item.achievement}
                  quote={item.message}
                  reviewerName={item.reviewerName}
                  reviewerMeta={`${item.reviewerType} - ${item.studentGrade}`}
                  className="min-h-[17rem] rounded-[1.8rem] border-[rgba(23,29,40,0.1)] bg-[rgba(255,255,255,0.88)] shadow-[0_22px_52px_-38px_rgba(17,21,29,0.22)] backdrop-blur-sm"
                />
              </motion.div>
            ))}
          </div>

          {featuredTestimonials.length > 1 && (
            <div className="mt-5 flex items-center justify-between gap-3 md:hidden">
              <button
                type="button"
                onClick={() => scrollToMobileReview(activeMobileReview - 1)}
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#171d28]/14 bg-white/70 px-4 text-sm font-semibold text-[#171d28] transition hover:bg-white"
                aria-label="Show previous testimonial"
              >
                Previous
              </button>

              <div className="flex items-center gap-2" aria-label="Testimonial position">
                {featuredTestimonials.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => scrollToMobileReview(index)}
                    className={`h-2.5 rounded-full transition-all ${
                      index === activeMobileReview ? 'w-7 bg-[var(--accent)]' : 'w-2.5 bg-[#171d28]/18'
                    }`}
                    aria-label={`Go to testimonial ${index + 1}`}
                    aria-pressed={index === activeMobileReview}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => scrollToMobileReview(activeMobileReview + 1)}
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#171d28]/14 bg-white/70 px-4 text-sm font-semibold text-[#171d28] transition hover:bg-white"
                aria-label="Show next testimonial"
              >
                Next
              </button>
            </div>
          )}

          <div className="mt-8 hidden md:block">
            {reduceMotion ? (
              <div className="grid gap-4 lg:grid-cols-3">
                {featuredTestimonials.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 22 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.45, delay: index * 0.04 }}
                  >
                    <TestimonialCard
                      achievement={item.achievement}
                      quote={item.message}
                      reviewerName={item.reviewerName}
                      reviewerMeta={`${item.reviewerType} - ${item.studentGrade}`}
                      className="min-h-[18.5rem] rounded-[1.8rem] border-[rgba(23,29,40,0.1)] bg-[rgba(255,255,255,0.88)] shadow-[0_22px_52px_-38px_rgba(17,21,29,0.22)] backdrop-blur-sm"
                    />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="logo-marquee [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
                <div className="logo-marquee-track gap-5 py-2 [animation-duration:78s]">
                  {testimonialMarquee.map((item, index) => (
                    <div
                      key={`${item.id}-${index}`}
                      aria-hidden={index >= featuredTestimonials.length}
                      className="w-[19.5rem] shrink-0 lg:w-[21rem]"
                    >
                      <TestimonialCard
                        achievement={item.achievement}
                        quote={item.message}
                        reviewerName={item.reviewerName}
                        reviewerMeta={`${item.reviewerType} - ${item.studentGrade}`}
                        className="min-h-[18.5rem] rounded-[1.8rem] border-[rgba(23,29,40,0.1)] bg-[rgba(255,255,255,0.88)] shadow-[0_22px_52px_-38px_rgba(17,21,29,0.22)] backdrop-blur-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Container>
      </section>

      <section id="book" className="bg-[#171d28] py-18 sm:py-24">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-14">
            <motion.div
              initial={reduceMotion ? undefined : { opacity: 0, y: 22 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-[0.78rem] font-semibold uppercase tracking-[0.24em] text-[var(--color-ryze-400)]">Book a consultation</p>
              <h2 className="mt-4 max-w-[12ch] font-display text-[clamp(2.7rem,5vw,4.5rem)] font-semibold leading-[0.96] tracking-[-0.05em] text-[#f8f3ea]">
                Start with a clear recommendation, not guesswork.
              </h2>
              <p className="mt-5 max-w-[30rem] text-[1.02rem] leading-8 text-white/68">
                Tell us the student&apos;s current level, stream, and target. We will recommend the right placement and the most useful next step.
              </p>

              <div className="mt-8 space-y-4">
                {contactHighlights.map((item) => (
                  <div key={item} className="flex items-start gap-3 border-l border-white/10 pl-4 text-sm leading-7 text-white/74">
                    <CheckCircle2 size={17} className="mt-1 shrink-0 text-[var(--color-ryze-400)]" aria-hidden="true" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <a
                  href="tel:+61413885839"
                  onClick={handlePhoneClick}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/12 bg-white/6 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                  aria-label="Call Ryze Education"
                >
                  <Phone size={16} aria-hidden="true" />
                  Call +61 413 885 839
                </a>
                <a
                  href="https://api.whatsapp.com/message/6GUJFT6GY2DHG1?autoload=1&app_absent=0"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleWhatsappClick}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/12 px-6 py-3 text-sm font-semibold text-white/84 transition-colors hover:bg-white/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                  aria-label="Open WhatsApp chat with Ryze Education"
                >
                  <MessageCircle size={16} aria-hidden="true" />
                  Prefer WhatsApp?
                  <ArrowRight size={14} aria-hidden="true" />
                </a>
              </div>

              <div className="mt-8 flex flex-wrap gap-2">
                {studentSegments.map((segment) => (
                  <span
                    key={segment}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                      landingVariant.isExt2Focus && segment.includes('Extension 2')
                        ? 'border-[var(--color-ryze-400)] bg-[rgba(184,132,30,0.12)] text-[#f8f3ea]'
                        : 'border-white/12 bg-white/5 text-white/76'
                    }`}
                  >
                    {segment}
                  </span>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={reduceMotion ? undefined : { opacity: 0, y: 22 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: 0.08 }}
              className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.03)_100%)] p-6 shadow-[0_34px_80px_-54px_rgba(0,0,0,0.58)] backdrop-blur-xl md:p-8"
            >
              <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-5">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-ryze-400)]">Enquiry form</p>
                  <p className="mt-2 text-sm leading-6 text-white/62">Response usually within one business day.</p>
                </div>
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/6 text-[var(--color-ryze-400)]">
                  <ChevronRight size={18} aria-hidden="true" />
                </div>
              </div>

              <form onSubmit={handleSubmit} className="mt-6">
                <input
                  type="text"
                  name="honey"
                  value={formData.honey}
                  onChange={handleChange}
                  className="hidden"
                  tabIndex={-1}
                  autoComplete="off"
                />

                <div className="grid grid-cols-1 gap-4">
                  <label htmlFor="hsc-name" className="text-sm font-medium text-white/86">
                    Name
                    <input
                      id="hsc-name"
                      type="text"
                      name="name"
                      required
                      maxLength={100}
                      autoComplete="name"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={status === 'sending'}
                      className="mt-1.5 w-full rounded-[1rem] border border-white/12 bg-white/6 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/28 focus:border-[var(--ring)] focus:ring-2 focus:ring-[var(--ring)] disabled:cursor-not-allowed disabled:opacity-70"
                    />
                  </label>

                  <label htmlFor="hsc-email" className="text-sm font-medium text-white/86">
                    Email
                    <input
                      id="hsc-email"
                      type="email"
                      name="email"
                      required
                      autoComplete="email"
                      inputMode="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={status === 'sending'}
                      className="mt-1.5 w-full rounded-[1rem] border border-white/12 bg-white/6 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/28 focus:border-[var(--ring)] focus:ring-2 focus:ring-[var(--ring)] disabled:cursor-not-allowed disabled:opacity-70"
                    />
                  </label>

                  <label htmlFor="hsc-phone" className="text-sm font-medium text-white/86">
                    Phone
                    <input
                      id="hsc-phone"
                      type="tel"
                      name="phone"
                      required
                      maxLength={20}
                      autoComplete="tel"
                      inputMode="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={status === 'sending'}
                      className="mt-1.5 w-full rounded-[1rem] border border-white/12 bg-white/6 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/28 focus:border-[var(--ring)] focus:ring-2 focus:ring-[var(--ring)] disabled:cursor-not-allowed disabled:opacity-70"
                    />
                  </label>

                  <label htmlFor="hsc-student-level" className="text-sm font-medium text-white/86">
                    Student Level
                    <select
                      id="hsc-student-level"
                      name="studentLevel"
                      value={formData.studentLevel}
                      onChange={handleChange}
                      disabled={status === 'sending'}
                      className="mt-1.5 w-full rounded-[1rem] border border-white/12 bg-white/6 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-[var(--ring)] focus:ring-2 focus:ring-[var(--ring)] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {studentSegments.map((segment) => (
                        <option key={segment}>{segment}</option>
                      ))}
                    </select>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--color-ryze-500)] px-6 py-3.5 text-sm font-semibold text-[#11151d] transition-colors hover:bg-[var(--color-ryze-400)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <BookOpenCheck size={16} aria-hidden="true" />
                  {status === 'sending' ? 'Submitting...' : 'Submit Enquiry'}
                </button>

                {status === 'success' && (
                  <p role="status" aria-live="polite" className="mt-4 rounded-[1rem] border border-emerald-300/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                    Thanks, your enquiry has been sent. We will contact you shortly.
                  </p>
                )}

                {status === 'error' && (
                  <p role="alert" className="mt-4 rounded-[1rem] border border-red-300/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {errorMessage || 'Submission failed. Please try again or call us directly.'}
                  </p>
                )}
              </form>
            </motion.div>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default HscMathsTutoring;
