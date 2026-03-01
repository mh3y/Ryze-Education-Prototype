import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  BadgeCheck,
  BookOpenCheck,
  CalendarCheck2,
  CheckCircle2,
  MessageCircle,
  Phone,
  ShieldCheck,
  Star,
  Users,
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import PrimaryCTA from '../components/PrimaryCTA';
import TrustStrip, { TrustStripItem } from '../components/TrustStrip';
import { Container, DesignCard, Section, StatCard, TestimonialCard, ValueCard } from '../components/design';
import { trackEvent } from '../src/analytics';
import { testimonials } from '../data/testimonials';
import { applySeo } from '../src/utils/seo';

const heroImageBase = 'https://res.cloudinary.com/dsvjhemjd/image/upload/f_auto,q_auto,c_fill,g_auto,dpr_auto';
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

const trustItems: TrustStripItem[] = [
  { icon: ShieldCheck, label: 'Sydney-based specialist maths tutors' },
  { icon: Users, label: 'Small groups and 1:1 support available' },
  { icon: BadgeCheck, label: 'Aligned to NESA and HSC outcomes' },
  { icon: CalendarCheck2, label: 'Weekly feedback for students and parents' },
  { icon: BookOpenCheck, label: 'Advanced, Ext 1, and Ext 2 pathways' },
];

const howItWorksSteps = [
  {
    title: '1. Diagnostic Call',
    description: 'We assess current level, gaps, target marks, and exam timeline in one focused call.',
  },
  {
    title: '2. Personalised Program',
    description: 'Students are matched to the right stream: Year 11, Year 12, Advanced, Ext 1, or Ext 2.',
  },
  {
    title: '3. Weekly Execution',
    description: 'High-impact lessons, exam-style drills, and weekly progress updates keep momentum high.',
  },
];

const studentSegments = [
  'Years 11-12 HSC Maths',
  'Mathematics Advanced',
  'Mathematics Extension 1',
  'Mathematics Extension 2',
];

type FormState = {
  name: string;
  email: string;
  phone: string;
  studentLevel: string;
};

const defaultForm: FormState = {
  name: '',
  email: '',
  phone: '',
  studentLevel: 'Year 12 - Advanced',
};

const HscMathsTutoring: React.FC = () => {
  const location = useLocation();
  const [formData, setFormData] = useState<FormState>(defaultForm);
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const featuredTestimonials = useMemo(() => {
    const hsc = testimonials.filter((item) => item.category === 'HSC').slice(0, 3);
    if (hsc.length === 3) return hsc;
    return testimonials.slice(0, 3);
  }, []);

  const landingVariant = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const offer = (params.get('offer') || '').toLowerCase();
    const utmCampaign = (params.get('utm_campaign') || '').toLowerCase();
    const isExt2Focus = offer.includes('ext2') || utmCampaign.includes('ext2');
    const isHscFocus = offer.includes('hsc') || utmCampaign.includes('hsc') || isExt2Focus;

    return {
      isExt2Focus,
      isHscFocus,
      subheading: isExt2Focus
        ? 'Extension 2-focused strategy, proof depth, and exam execution for top-band performance.'
        : isHscFocus
          ? 'HSC Advanced and Extension strategy built for cleaner exam work and stronger marks.'
          : 'Structured support for Advanced, Extension 1, and Extension 2 students who want stronger marks, cleaner exam technique, and confident performance in trials and the HSC.',
    };
  }, [location.search]);

  useEffect(() => {
    applySeo({
      title: 'HSC Maths Tutoring Sydney | Advanced, Ext 1, Ext 2 | Ryze Education',
      description:
        'High-performance HSC Maths tutoring in Sydney for Advanced, Extension 1, and Extension 2. Book a free consultation and get a personalised study plan.',
      path: '/hsc-maths-tutoring',
      ogTitle: 'HSC Maths Tutoring Sydney | Ryze Education',
      ogDescription:
        'Targeted HSC Maths programs for Advanced, Extension 1, and Extension 2 with weekly feedback and exam-focused mentoring.',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: 'Ryze Education',
        areaServed: 'Sydney',
        url: `${window.location.origin}/hsc-maths-tutoring`,
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
      if (disposePerfDebug) disposePerfDebug();
    };
  }, []);

  const handlePhoneClick = () => {
    trackEvent('phone_click', { page: 'hsc_landing', placement: 'book' });
  };

  const handleWhatsappClick = () => {
    trackEvent('whatsapp_click', { page: 'hsc_landing', placement: 'book' });
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
    if (status !== 'idle') setStatus('idle');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus('sending');

    try {
      const response = await fetch('https://formsubmit.co/ryzeeducationhq@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: `Student level: ${formData.studentLevel}`,
          _subject: `HSC Landing Enquiry - ${formData.name}`,
          _template: 'table',
          _captcha: 'false',
        }),
      });

      if (!response.ok) {
        setStatus('error');
        trackEvent('contact_form_submit', { page: 'hsc_landing', status: 'error' });
        return;
      }

      setStatus('success');
      setFormData(defaultForm);
      trackEvent('contact_form_submit', { page: 'hsc_landing', status: 'success' });
    } catch {
      setStatus('error');
      trackEvent('contact_form_submit', { page: 'hsc_landing', status: 'error' });
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <Section variant="gradient" className="pt-16 md:pt-20">
        <Container>
          <div className="grid items-start gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              <p className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
                <ShieldCheck size={14} aria-hidden="true" />
                HSC Maths Advanced and Extension Specialists
              </p>
              <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
                HSC Maths Tutoring That Turns Potential Into Results
              </h1>
              <p className="max-w-2xl text-base leading-relaxed text-[var(--muted)] sm:text-lg">{landingVariant.subheading}</p>

              <ul className="grid gap-2 text-sm sm:grid-cols-3">
                <li className="inline-flex items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2">
                  <CheckCircle2 size={16} className="text-[var(--accent)]" />
                  Small groups
                </li>
                <li className="inline-flex items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2">
                  <CheckCircle2 size={16} className="text-[var(--accent)]" />
                  Exam-focused
                </li>
                <li className="inline-flex items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2">
                  <CheckCircle2 size={16} className="text-[var(--accent)]" />
                  Weekly feedback
                </li>
              </ul>

              {landingVariant.isHscFocus && (
                <p className="inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/40 bg-[var(--accent)]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
                  Offer matched: HSC Maths campaign
                </p>
              )}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
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
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[var(--primary)]/20 bg-[var(--surface)] px-6 py-3 text-sm font-semibold text-[var(--primary)] transition-colors hover:bg-[var(--bg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] sm:w-auto"
                  aria-label="Call Ryze Education"
                >
                  <Phone size={16} aria-hidden="true" />
                  Call +61 413 885 839
                </a>
              </div>
            </div>

            <DesignCard className="overflow-hidden bg-[var(--surface)]">
              <img
                src={heroImageSrc}
                srcSet={heroImageSrcSet}
                sizes="(max-width: 1024px) 100vw, 560px"
                alt="HSC Maths tutoring in Sydney"
                fetchPriority="high"
                loading="eager"
                decoding="async"
                className="h-56 w-full object-cover md:h-64 lg:h-full"
              />
              <div className="p-5">
                <h2 className="text-xl font-bold text-[var(--primary)]">Proof That Students and Parents Trust</h2>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  Built for families who need measurable academic growth, not generic tutoring.
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                  <StatCard value="500+" label="Students supported across Sydney" icon={<Users size={18} />} className="p-4" />
                  <StatCard value="4.9/5" label="Average parent and student rating" icon={<Star size={18} />} className="p-4" />
                  <StatCard value="13+ years" label="Teaching and HSC mentoring experience" icon={<BadgeCheck size={18} />} className="p-4" />
                </div>
              </div>
            </DesignCard>
          </div>
        </Container>
      </Section>

      <Section variant="default">
        <Container>
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold sm:text-4xl">What Students Get Every Week</h2>
            <p className="mt-3 text-[var(--muted)]">A consistent system built for Advanced, Extension 1, and Extension 2 outcomes.</p>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            <ValueCard
              title="Exam-Focused Lessons"
              description="Students train with mark-efficient methods, structure, and time management used in real HSC papers."
              icon={<BookOpenCheck size={20} />}
            />
            <ValueCard
              title="Personalised Pathway"
              description="Targeted support based on current level, weak topics, and upcoming milestones."
              icon={<CalendarCheck2 size={20} />}
            />
            <ValueCard
              title="Parent Visibility"
              description="Regular feedback means families know exactly where progress is strong and where to focus next."
              icon={<MessageCircle size={20} />}
            />
          </div>
        </Container>
      </Section>

      <Section variant="tint">
        <Container>
          <h2 className="text-3xl font-bold sm:text-4xl">How It Works</h2>
          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            {howItWorksSteps.map((step, index) => (
              <DesignCard key={step.title} className="h-full p-6">
                <p className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--primary)] text-xs font-bold text-[var(--primary-foreground)]">
                  {index + 1}
                </p>
                <h3 className="mt-4 text-xl font-bold">{step.title.replace(/^[0-9]+\.\s*/, '')}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{step.description}</p>
              </DesignCard>
            ))}
          </div>
        </Container>
      </Section>

      <Section variant="default">
        <Container>
          <h2 className="text-3xl font-bold sm:text-4xl">Student Results and Parent Feedback</h2>
          <div className="-mx-4 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0">
            {featuredTestimonials.map((item) => (
              <TestimonialCard
                key={item.id}
                achievement={item.achievement}
                quote={item.message}
                reviewerName={item.reviewerName}
                reviewerMeta={`${item.reviewerType} - ${item.studentGrade}`}
                className="min-w-[84%] snap-start sm:min-w-[62%] md:min-w-0"
              />
            ))}
          </div>
        </Container>
      </Section>

      <Section id="book" variant="tint">
        <Container>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <DesignCard className="p-6 md:p-8">
              <h2 className="text-3xl font-bold text-[var(--primary)] sm:text-4xl">Book Your Free Consultation</h2>
              <p className="mt-3 max-w-lg text-[var(--muted)]">
                Tell us your current level and goals. We will recommend the right stream and next steps.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {studentSegments.map((segment) => (
                  <span
                    key={segment}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                      landingVariant.isExt2Focus && segment.includes('Extension 2')
                        ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--primary)]'
                        : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text)]'
                    }`}
                  >
                    {segment}
                  </span>
                ))}
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <PrimaryCTA
                  variant="link"
                  href="#book"
                  size="lg"
                  page="hsc_landing"
                  placement="hsc_bottom_cta"
                  className="w-full justify-center sm:w-auto"
                />
                <a
                  href="tel:+61413885839"
                  onClick={handlePhoneClick}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[var(--primary)]/20 bg-[var(--surface)] px-6 py-3 text-sm font-semibold text-[var(--primary)] transition-colors hover:bg-[var(--bg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] sm:w-auto"
                  aria-label="Call Ryze Education"
                >
                  <Phone size={16} aria-hidden="true" />
                  Call Us
                </a>
              </div>
              <a
                href="https://api.whatsapp.com/message/6GUJFT6GY2DHG1?autoload=1&app_absent=0"
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleWhatsappClick}
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)] hover:opacity-80"
                aria-label="Open WhatsApp chat with Ryze Education"
              >
                <MessageCircle size={16} aria-hidden="true" />
                Prefer WhatsApp? Start chat now
                <ArrowRight size={14} aria-hidden="true" />
              </a>
            </DesignCard>

            <DesignCard className="p-6 md:p-8">
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-4">
                  <label htmlFor="hsc-name" className="text-sm font-medium">
                    Name
                    <input
                      id="hsc-name"
                      type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text)] outline-none focus:border-[var(--ring)] focus:ring-2 focus:ring-[var(--ring)]"
                  />
                </label>

                  <label htmlFor="hsc-email" className="text-sm font-medium">
                    Email
                    <input
                      id="hsc-email"
                      type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text)] outline-none focus:border-[var(--ring)] focus:ring-2 focus:ring-[var(--ring)]"
                  />
                </label>

                  <label htmlFor="hsc-phone" className="text-sm font-medium">
                    Phone
                    <input
                      id="hsc-phone"
                      type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text)] outline-none focus:border-[var(--ring)] focus:ring-2 focus:ring-[var(--ring)]"
                  />
                </label>

                  <label htmlFor="hsc-student-level" className="text-sm font-medium">
                    Student Level
                    <select
                      id="hsc-student-level"
                      name="studentLevel"
                      value={formData.studentLevel}
                      onChange={handleChange}
                      className="mt-1 w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text)] outline-none focus:border-[var(--ring)] focus:ring-2 focus:ring-[var(--ring)]"
                    >
                      <option>Year 11 - Advanced</option>
                      <option>Year 11 - Extension 1</option>
                      <option>Year 12 - Advanced</option>
                      <option>Year 12 - Extension 1</option>
                      <option>Year 12 - Extension 2</option>
                    </select>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-[var(--primary-foreground)] transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <BookOpenCheck size={16} aria-hidden="true" />
                  {status === 'sending' ? 'Submitting...' : 'Submit Enquiry'}
                </button>

                {status === 'success' && (
                  <p role="status" aria-live="polite" className="mt-4 rounded-[var(--radius-sm)] border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                    Thanks, your enquiry has been sent. We will contact you shortly.
                  </p>
                )}

                {status === 'error' && (
                  <p role="alert" className="mt-4 rounded-[var(--radius-sm)] border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
                    Submission failed. Please try again or call us directly.
                  </p>
                )}
              </form>
            </DesignCard>
          </div>
        </Container>
      </Section>
    </div>
  );
};

export default HscMathsTutoring;
