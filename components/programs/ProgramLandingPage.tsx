import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  BadgeCheck,
  BookOpenCheck,
  CalendarCheck2,
  CheckCircle2,
  ChevronRight,
  MessageCircle,
  Phone,
  ShieldCheck,
  Star,
  Users,
} from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import PrimaryCTA from '../PrimaryCTA';
import { Container, TestimonialCard } from '../design';
import { trackEvent } from '../../src/analytics';
import { trackPhoneClick, postMetaConversion } from '../../src/lib/tracking';
import { validateEmail, validatePhone } from '../../src/lib/validation';
import { testimonials } from '../../data/testimonials';
import { applySeo } from '../../src/utils/seo';

type HeroSignal = { label: string; value: string };
type Metric = { value: string; label: string };
type WeeklyStep = { title: string; description: string };
type ProgramTrack = { title: string; summary: string; focus: string[] };
type ProgramPillar = {
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: string | number; className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>;
};
type ResultPoint = ProgramPillar;

type FormState = { name: string; email: string; phone: string; studentLevel: string; honey: string };

export type ProgramLandingConfig = {
  pageId: string;
  path: string;
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
  heroBadge: string;
  heroTitle: string;
  heroSubheading: string;
  heroImageSrc: string;
  heroImageSrcSet: string;
  heroImageAlt: string;
  heroImageClassName?: string;
  heroSignals: HeroSignal[];
  proofEyebrow: string;
  proofTitle: string;
  proofBody: string;
  metrics: Metric[];
  proofPillars: ProgramPillar[];
  tracksEyebrow: string;
  programTracks: ProgramTrack[];
  weeklyEyebrow: string;
  weeklyTitle: string;
  weeklyIntro: string;
  weeklySystem: WeeklyStep[];
  resultEyebrow: string;
  resultTitle: string;
  resultPoints: ResultPoint[];
  testimonialBadge: string;
  testimonialSummary: string;
  testimonialFilter: (item: (typeof testimonials)[number]) => boolean;
  testimonialFallbackFilter?: (item: (typeof testimonials)[number]) => boolean;
  contactEyebrow: string;
  contactTitle: string;
  contactBody: string;
  contactHighlights: string[];
  studentSegments: string[];
  studentLevelOptions: string[];
  subjectPrefix: string;
};

const makeDefaultForm = (studentLevel: string): FormState => ({
  name: '',
  email: '',
  phone: '',
  studentLevel,
  honey: '',
});

const ProgramLandingPage: React.FC<{ config: ProgramLandingConfig }> = ({ config }) => {
  const reduceMotion = useReducedMotion();
  const mobileTestimonialsRef = useRef<HTMLDivElement | null>(null);
  const [formData, setFormData] = useState<FormState>(() => makeDefaultForm(config.studentLevelOptions[0] || ''));
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [activeMobileReview, setActiveMobileReview] = useState(0);

  const featuredTestimonials = useMemo(() => {
    const primary = testimonials.filter(config.testimonialFilter);
    const seen = new Set<string>();
    const uniquePrimary = primary.filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });

    const fallbackPool = testimonials.filter((item) => {
      if (seen.has(item.id)) return false;
      if (config.testimonialFallbackFilter) return config.testimonialFallbackFilter(item);
      return true;
    });

    const supplemented = [...uniquePrimary];
    for (const item of fallbackPool) {
      if (supplemented.length >= 6) break;
      supplemented.push(item);
      seen.add(item.id);
    }

    return (supplemented.length > 0 ? supplemented : testimonials).slice(0, 6);
  }, [config]);

  const testimonialMarquee = useMemo(
    () => (reduceMotion ? featuredTestimonials : [...featuredTestimonials, ...featuredTestimonials, ...featuredTestimonials]),
    [featuredTestimonials, reduceMotion],
  );

  useEffect(() => {
    applySeo({
      title: config.title,
      description: config.description,
      path: config.path,
      ogTitle: config.ogTitle,
      ogDescription: config.ogDescription,
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'EducationalOccupationalProgram',
        name: config.ogTitle,
        provider: { '@type': 'Organization', name: 'Ryze Education' },
        url: `${window.location.origin}${config.path}`,
      },
    });
  }, [config]);

  const handlePhoneClick = () => trackPhoneClick(config.pageId, 'book');
  const handleWhatsappClick = () => trackEvent('whatsapp_click', { page: config.pageId, placement: 'book' });

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
      setFormData(makeDefaultForm(config.studentLevelOptions[0] || ''));
      return;
    }
    if (!validateEmail(formData.email)) return setErrorMessage('Please enter a valid email address.'), setStatus('error');
    if (!validatePhone(formData.phone)) return setErrorMessage('Please enter a valid phone number.'), setStatus('error');

    setStatus('sending');
    try {
      const response = await fetch('https://formsubmit.co/ryzeeducationhq@gmail.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: `Student level: ${formData.studentLevel}`,
          _subject: `${config.subjectPrefix} - ${formData.name}`,
          _template: 'table',
          _captcha: 'false',
          _honey: '',
        }),
      });
      if (!response.ok) throw new Error('submit failed');
      setStatus('success');
      setFormData(makeDefaultForm(config.studentLevelOptions[0] || ''));
      trackEvent('contact_form_submit', { page: config.pageId, status: 'success' });
      void postMetaConversion({
        eventName: 'Contact',
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        userAgent: navigator.userAgent,
        sourceUrl: window.location.href,
      });
    } catch {
      setStatus('error');
      setErrorMessage('Submission failed. Please try again or call us directly.');
      trackEvent('contact_form_submit', { page: config.pageId, status: 'error' });
    }
  };

  const scrollToMobileReview = (index: number) => {
    const rail = mobileTestimonialsRef.current;
    if (!rail) return;
    const nextIndex = (index + featuredTestimonials.length) % featuredTestimonials.length;
    const target = rail.children.item(nextIndex) as HTMLElement | null;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    target?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'nearest', inline: 'start' });
    setActiveMobileReview(nextIndex);
  };

  const heroImageClassName =
    config.heroImageClassName || 'object-center sm:object-[54%_center] lg:object-[62%_center] xl:object-[68%_center]';

  return (
    <div className="ryze-page-shell--hero-bleed min-h-screen overflow-x-hidden bg-[#11151d] text-[#f8f3ea]">
      <section className="ryze-hero-edge relative min-h-screen min-h-[100dvh] overflow-hidden bg-[#11151d] pt-[5.5rem] md:pt-[6rem]">
        <img src={config.heroImageSrc} srcSet={config.heroImageSrcSet} sizes="100vw" width={1600} height={960} alt={config.heroImageAlt} loading="eager" fetchPriority="high" decoding="async" className={`ryze-hero-visual-bleed h-full w-full object-cover ${heroImageClassName}`} />
        <div aria-hidden="true" className="ryze-hero-visual-bleed bg-[linear-gradient(96deg,rgba(17,21,29,0.96)_0%,rgba(17,21,29,0.9)_36%,rgba(17,21,29,0.56)_64%,rgba(17,21,29,0.78)_100%)]" />
        <div aria-hidden="true" className="ryze-hero-visual-bleed bg-[radial-gradient(circle_at_78%_22%,rgba(200,158,43,0.16),transparent_24%)]" />
        <Container className="relative z-10 pb-12 sm:pb-16 lg:pb-20">
          <div className="grid min-h-[calc(100vh-5.5rem)] min-h-[calc(100dvh-5.5rem)] items-end gap-10 py-8 md:min-h-[calc(100vh-6rem)] md:min-h-[calc(100dvh-6rem)] lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-14 lg:py-12">
            <motion.div initial={reduceMotion ? undefined : { opacity: 0, y: 28 }} animate={reduceMotion ? undefined : { opacity: 1, y: 0 }} transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }} className="max-w-[44rem]">
              <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(184,132,30,0.35)] bg-[rgba(255,255,255,0.05)] px-4 py-2 text-[0.75rem] font-semibold uppercase tracking-[0.24em] text-[var(--color-ryze-400)] backdrop-blur-md"><ShieldCheck size={14} aria-hidden="true" />{config.heroBadge}</div>
              <h1 className="mt-6 max-w-[11ch] font-display text-[clamp(3rem,11vw,6.8rem)] font-semibold leading-[0.88] tracking-[-0.055em] text-[#f8f3ea] sm:text-[clamp(3.6rem,8vw,6.8rem)]">{config.heroTitle}</h1>
              <p className="mt-5 max-w-[34rem] text-[1rem] leading-7 text-white/74 sm:mt-6 sm:text-[1.12rem] sm:leading-8">{config.heroSubheading}</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <PrimaryCTA variant="link" href="#book" size="lg" page={config.pageId} placement={`${config.pageId}_hero`} className="w-full justify-center sm:w-auto" />
                <a href="tel:+61413885839" onClick={handlePhoneClick} className="ryze-inline-glass-control w-full sm:w-auto"><Phone size={16} aria-hidden="true" />Call +61 413 885 839</a>
              </div>
              <p className="mt-4 text-sm text-white/58">Free consultation. Clear recommendation. No lock-in commitment.</p>
              <div className="mt-8 grid gap-4 border-t border-white/10 pt-6 sm:mt-10 sm:gap-5 sm:pt-8 sm:grid-cols-2 xl:grid-cols-4">
                {config.heroSignals.map((item, index) => (
                  <motion.div key={item.label} initial={reduceMotion ? undefined : { opacity: 0, y: 18 }} animate={reduceMotion ? undefined : { opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.12 + index * 0.08 }} className="border-l border-white/10 pl-4">
                    <p className="text-[0.72rem] font-bold uppercase tracking-[0.28em] text-[var(--color-ryze-400)]">{item.label}</p>
                    <p className="mt-2 text-[1rem] font-semibold leading-[1.45] text-white/92">{item.value}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            <motion.div initial={reduceMotion ? undefined : { opacity: 0, x: 24 }} animate={reduceMotion ? undefined : { opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.12, ease: [0.22, 1, 0.36, 1] }} className="hidden border-l border-white/10 pl-8 lg:block">
              <p className="text-[0.75rem] font-semibold uppercase tracking-[0.22em] text-white/48">Why families come to Ryze</p>
              <div className="mt-6 space-y-6">
                {config.proofPillars.map((pillar) => (
                  <div key={pillar.title}>
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(184,132,30,0.35)] bg-[rgba(255,255,255,0.05)] text-[var(--color-ryze-400)]"><pillar.icon size={18} aria-hidden="true" /></div>
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
            <motion.div initial={reduceMotion ? undefined : { opacity: 0, y: 22 }} whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.35 }} transition={{ duration: 0.6 }}>
              <p className="text-[0.78rem] font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">{config.proofEyebrow}</p>
              <h2 className="mt-4 max-w-[12ch] font-display text-[clamp(2.7rem,5vw,4.7rem)] font-semibold leading-[0.94] tracking-[-0.05em] text-[#171d28]">{config.proofTitle}</h2>
              <p className="mt-5 max-w-[30rem] text-[1.03rem] leading-8 text-[#4f4a44]">{config.proofBody}</p>
            </motion.div>
            <motion.div initial={reduceMotion ? undefined : { opacity: 0, y: 22 }} whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.6, delay: 0.08 }} className="grid gap-6 border-t border-[#171d28]/10 pt-6 sm:grid-cols-3">
              {config.metrics.map((metric) => (
                <div key={metric.label}>
                  <p className="text-[2.35rem] font-semibold tracking-[-0.05em] text-[#171d28]">{metric.value}</p>
                  <p className="mt-2 text-sm leading-6 text-[#5b5752]">{metric.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
          <div className="mt-16 grid gap-8 border-t border-[#171d28]/10 pt-10 lg:grid-cols-3">
            {config.programTracks.map((track, index) => (
              <motion.div key={track.title} initial={reduceMotion ? undefined : { opacity: 0, y: 24 }} whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 0.55, delay: index * 0.06 }} className="border-l border-[#171d28]/10 pl-5">
                <p className="text-[0.72rem] font-bold uppercase tracking-[0.26em] text-[var(--accent)]">{config.tracksEyebrow}</p>
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
            <motion.div initial={reduceMotion ? undefined : { opacity: 0, y: 22 }} whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.6 }}>
              <p className="text-[0.78rem] font-semibold uppercase tracking-[0.24em] text-[var(--color-ryze-400)]">{config.weeklyEyebrow}</p>
              <h2 className="mt-4 max-w-[12ch] font-display text-[clamp(2.7rem,5vw,4.5rem)] font-semibold leading-[0.96] tracking-[-0.05em] text-[#f8f3ea]">{config.weeklyTitle}</h2>
              <p className="mt-5 max-w-[30rem] text-[1.02rem] leading-8 text-white/68">{config.weeklyIntro}</p>
            </motion.div>
            <div className="space-y-8 border-l border-white/10 pl-6 sm:pl-8">
              {config.weeklySystem.map((item, index) => (
                <motion.div key={item.title} initial={reduceMotion ? undefined : { opacity: 0, x: 22 }} whileInView={reduceMotion ? undefined : { opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.5, delay: index * 0.05 }} className="relative">
                  <div className="absolute -left-[2.15rem] top-1.5 h-3 w-3 rounded-full bg-[var(--color-ryze-500)] shadow-[0_0_18px_rgba(184,132,30,0.7)]" />
                  <p className="text-[0.72rem] font-bold uppercase tracking-[0.28em] text-[var(--color-ryze-400)]">Step {index + 1}</p>
                  <h3 className="mt-3 text-[1.35rem] font-semibold tracking-[-0.02em] text-[#f8f3ea]">{item.title}</h3>
                  <p className="mt-2 max-w-[38rem] text-sm leading-7 text-white/66">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
          <motion.div initial={reduceMotion ? undefined : { opacity: 0, y: 22 }} whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 0.6, delay: 0.08 }} className="mt-16 grid gap-6 border-t border-white/10 pt-8 sm:grid-cols-3">
            {config.resultPoints.map((item) => (
              <div key={item.title} className="border-l border-white/10 pl-4">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[var(--color-ryze-400)]"><item.icon size={18} aria-hidden="true" /></div>
                <h3 className="mt-4 text-lg font-semibold text-[#f8f3ea]">{item.title}</h3>
                <p className="mt-2 text-sm leading-7 text-white/62">{item.description}</p>
              </div>
            ))}
          </motion.div>
        </Container>
      </section>
      <section className="bg-[#f8f3ea] py-18 text-[#171d28] sm:py-24">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-end">
            <motion.div initial={reduceMotion ? undefined : { opacity: 0, y: 22 }} whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.35 }} transition={{ duration: 0.6 }}>
              <p className="text-[0.78rem] font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">{config.resultEyebrow}</p>
              <h2 className="mt-4 max-w-[12ch] font-display text-[clamp(2.7rem,5vw,4.5rem)] font-semibold leading-[0.96] tracking-[-0.05em] text-[#171d28]">{config.resultTitle}</h2>
            </motion.div>
            <motion.div initial={reduceMotion ? undefined : { opacity: 0, y: 22 }} whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.35 }} transition={{ duration: 0.6, delay: 0.08 }} className="grid gap-4 sm:grid-cols-3">
              <div className="border-l border-[#171d28]/10 pl-4"><Users size={18} className="text-[var(--accent)]" aria-hidden="true" /><p className="mt-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#171d28]/58">Students</p><p className="mt-2 text-sm leading-7 text-[#5b5752]">{config.testimonialSummary}</p></div>
              <div className="border-l border-[#171d28]/10 pl-4"><Star size={18} className="text-[var(--accent)]" aria-hidden="true" /><p className="mt-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#171d28]/58">Parents</p><p className="mt-2 text-sm leading-7 text-[#5b5752]">Families value the clarity, pacing, and sense that the work is being directed properly.</p></div>
              <div className="border-l border-[#171d28]/10 pl-4"><BadgeCheck size={18} className="text-[var(--accent)]" aria-hidden="true" /><p className="mt-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#171d28]/58">Trust</p><p className="mt-2 text-sm leading-7 text-[#5b5752]">The program is designed for families who want a clear academic standard, not casual support.</p></div>
            </motion.div>
          </div>
          <motion.div initial={reduceMotion ? undefined : { opacity: 0, y: 22 }} whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 0.55, delay: 0.06 }} className="mt-10 border-y border-[#171d28]/10 py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex rounded-full border border-[rgba(184,132,30,0.24)] bg-[rgba(184,132,30,0.08)] px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">{config.testimonialBadge}</span>
              </div>
              {!reduceMotion && <p className="hidden text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-[#171d28]/50 md:block">Hover to pause</p>}
            </div>
          </motion.div>
          <div ref={mobileTestimonialsRef} onScroll={(event) => {
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
            if (nextIndex !== activeMobileReview) setActiveMobileReview(nextIndex);
          }} className="-mx-4 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 md:hidden" style={{ touchAction: 'pan-x pan-y', WebkitOverflowScrolling: 'touch' }}>
            {featuredTestimonials.map((item, index) => (
              <motion.div key={item.id} initial={reduceMotion ? undefined : { opacity: 0, y: 22 }} whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.45, delay: index * 0.04 }} className="min-w-[88%] snap-center sm:min-w-[62%]">
                <TestimonialCard achievement={item.achievement} quote={item.message} reviewerName={item.reviewerName} reviewerMeta={`${item.reviewerType} - ${item.studentGrade}`} className="min-h-[17rem] rounded-[1.8rem] border-[rgba(23,29,40,0.1)] bg-[rgba(255,255,255,0.88)] shadow-[0_22px_52px_-38px_rgba(17,21,29,0.22)] backdrop-blur-sm" />
              </motion.div>
            ))}
          </div>
          {featuredTestimonials.length > 1 && (
            <div className="mt-5 flex items-center justify-between gap-3 md:hidden">
              <button type="button" onClick={() => scrollToMobileReview(activeMobileReview - 1)} className="ryze-surface-control min-h-11 px-4 text-sm hover:-translate-y-px">Previous</button>
              <div className="flex items-center gap-2" aria-label="Testimonial position">
                {featuredTestimonials.map((item, index) => (
                  <button key={item.id} type="button" onClick={() => scrollToMobileReview(index)} className={`h-2.5 rounded-full transition-all ${index === activeMobileReview ? 'w-7 bg-[var(--accent)]' : 'w-2.5 bg-[#171d28]/18'}`} aria-label={`Go to testimonial ${index + 1}`} aria-pressed={index === activeMobileReview} />
                ))}
              </div>
              <button type="button" onClick={() => scrollToMobileReview(activeMobileReview + 1)} className="ryze-surface-control min-h-11 px-4 text-sm hover:-translate-y-px">Next</button>
            </div>
          )}
          <div className="mt-8 hidden md:block">
            {reduceMotion ? (
              <div className="grid gap-4 lg:grid-cols-3">
                {featuredTestimonials.map((item, index) => (
                  <motion.div key={item.id} initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.45, delay: index * 0.04 }}>
                    <TestimonialCard achievement={item.achievement} quote={item.message} reviewerName={item.reviewerName} reviewerMeta={`${item.reviewerType} - ${item.studentGrade}`} className="min-h-[18.5rem] rounded-[1.8rem] border-[rgba(23,29,40,0.1)] bg-[rgba(255,255,255,0.88)] shadow-[0_22px_52px_-38px_rgba(17,21,29,0.22)] backdrop-blur-sm" />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="logo-marquee [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
                <div className="logo-marquee-track gap-5 py-2 [animation-duration:78s]">
                  {testimonialMarquee.map((item, index) => (
                    <div key={`${item.id}-${index}`} aria-hidden={index >= featuredTestimonials.length} className="w-[19.5rem] shrink-0 lg:w-[21rem]">
                      <TestimonialCard achievement={item.achievement} quote={item.message} reviewerName={item.reviewerName} reviewerMeta={`${item.reviewerType} - ${item.studentGrade}`} className="min-h-[18.5rem] rounded-[1.8rem] border-[rgba(23,29,40,0.1)] bg-[rgba(255,255,255,0.88)] shadow-[0_22px_52px_-38px_rgba(17,21,29,0.22)] backdrop-blur-sm" />
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
            <motion.div initial={reduceMotion ? undefined : { opacity: 0, y: 22 }} whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.6 }}>
              <p className="text-[0.78rem] font-semibold uppercase tracking-[0.24em] text-[var(--color-ryze-400)]">{config.contactEyebrow}</p>
              <h2 className="mt-4 max-w-[12ch] font-display text-[clamp(2.7rem,5vw,4.5rem)] font-semibold leading-[0.96] tracking-[-0.05em] text-[#f8f3ea]">{config.contactTitle}</h2>
              <p className="mt-5 max-w-[30rem] text-[1.02rem] leading-8 text-white/68">{config.contactBody}</p>
              <div className="mt-8 space-y-4">
                {config.contactHighlights.map((item) => (
                  <div key={item} className="flex items-start gap-3 border-l border-white/10 pl-4 text-sm leading-7 text-white/74"><CheckCircle2 size={17} className="mt-1 shrink-0 text-[var(--color-ryze-400)]" aria-hidden="true" /><span>{item}</span></div>
                ))}
              </div>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <a href="tel:+61413885839" onClick={handlePhoneClick} className="ryze-inline-glass-control"><Phone size={16} aria-hidden="true" />Call +61 413 885 839</a>
                <a href="https://api.whatsapp.com/message/6GUJFT6GY2DHG1?autoload=1&app_absent=0" target="_blank" rel="noopener noreferrer" onClick={handleWhatsappClick} className="ryze-inline-glass-control"><MessageCircle size={16} aria-hidden="true" />Prefer WhatsApp?<ArrowRight size={14} aria-hidden="true" /></a>
              </div>
              <div className="mt-8 flex flex-wrap gap-2">
                {config.studentSegments.map((segment) => <span key={segment} className="rounded-full border border-white/12 bg-white/5 px-3 py-1 text-xs font-semibold text-white/76">{segment}</span>)}
              </div>
            </motion.div>
            <motion.div initial={reduceMotion ? undefined : { opacity: 0, y: 22 }} whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.6, delay: 0.08 }} className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.03)_100%)] p-6 shadow-[0_34px_80px_-54px_rgba(0,0,0,0.58)] backdrop-blur-xl md:p-8">
              <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-5">
                <div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-ryze-400)]">Enquiry form</p><p className="mt-2 text-sm leading-6 text-white/62">Response usually within one business day.</p></div>
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/6 text-[var(--color-ryze-400)]"><ChevronRight size={18} aria-hidden="true" /></div>
              </div>
              <form onSubmit={handleSubmit} className="mt-6">
                <input type="text" name="honey" value={formData.honey} onChange={handleChange} className="hidden" tabIndex={-1} autoComplete="off" />
                <div className="grid grid-cols-1 gap-4">
                  <label htmlFor={`${config.pageId}-name`} className="text-sm font-medium text-white/86">Name<input id={`${config.pageId}-name`} type="text" name="name" required maxLength={100} autoComplete="name" value={formData.name} onChange={handleChange} disabled={status === 'sending'} className="mt-1.5 w-full rounded-[1rem] border border-white/12 bg-white/6 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-[var(--ring)] focus:ring-2 focus:ring-[var(--ring)] disabled:cursor-not-allowed disabled:opacity-70" /></label>
                  <label htmlFor={`${config.pageId}-email`} className="text-sm font-medium text-white/86">Email<input id={`${config.pageId}-email`} type="email" name="email" required autoComplete="email" value={formData.email} onChange={handleChange} disabled={status === 'sending'} className="mt-1.5 w-full rounded-[1rem] border border-white/12 bg-white/6 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-[var(--ring)] focus:ring-2 focus:ring-[var(--ring)] disabled:cursor-not-allowed disabled:opacity-70" /></label>
                  <label htmlFor={`${config.pageId}-phone`} className="text-sm font-medium text-white/86">Phone<input id={`${config.pageId}-phone`} type="tel" name="phone" required autoComplete="tel" maxLength={20} value={formData.phone} onChange={handleChange} disabled={status === 'sending'} className="mt-1.5 w-full rounded-[1rem] border border-white/12 bg-white/6 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-[var(--ring)] focus:ring-2 focus:ring-[var(--ring)] disabled:cursor-not-allowed disabled:opacity-70" /></label>
                  <label htmlFor={`${config.pageId}-level`} className="text-sm font-medium text-white/86">Student level<select id={`${config.pageId}-level`} name="studentLevel" value={formData.studentLevel} onChange={handleChange} disabled={status === 'sending'} className="mt-1.5 w-full rounded-[1rem] border border-white/12 bg-white/6 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-[var(--ring)] focus:ring-2 focus:ring-[var(--ring)] disabled:cursor-not-allowed disabled:opacity-70">{config.studentLevelOptions.map((option) => <option key={option} value={option} className="bg-[#171d28] text-white">{option}</option>)}</select></label>
                </div>
                {status === 'error' && <p className="mt-4 text-sm font-medium text-[#f1a6a6]">{errorMessage}</p>}
                {status === 'success' && <p className="mt-4 text-sm font-medium text-[#c7efc4]">Thanks. We&apos;ve received your enquiry and will be in touch shortly.</p>}
                <button type="submit" disabled={status === 'sending'} className="mt-6 flex w-full items-center justify-center gap-3 rounded-[1.1rem] bg-[var(--color-ryze)] py-4 text-base font-semibold text-[var(--accent-foreground)] shadow-[0_22px_48px_-28px_rgba(184,132,30,0.45)] transition-colors hover:bg-[#d09a24] disabled:cursor-not-allowed disabled:opacity-70">{status === 'sending' ? 'Sending...' : 'Submit enquiry'}</button>
              </form>
            </motion.div>
          </div>
        </Container>
      </section>
    </div>
  );
};

export const programLandingIcons = { CalendarCheck2, BookOpenCheck, MessageCircle, CheckCircle2, Users, Star } as const;

export default ProgramLandingPage;
