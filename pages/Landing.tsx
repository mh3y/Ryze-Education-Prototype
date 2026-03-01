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
import PrimaryCTA from '../components/PrimaryCTA';
import { trackEvent } from '../src/analytics';
import { testimonials } from '../data/testimonials';

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

const trustItems = [
  'Sydney-based specialist maths tutors',
  'Small groups and 1:1 support available',
  'Aligned to NESA and HSC outcomes',
  'Weekly feedback for students and parents',
  'Advanced, Ext 1, and Ext 2 pathways',
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

const Landing: React.FC = () => {
  const [formData, setFormData] = useState<FormState>(defaultForm);
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const featuredTestimonials = useMemo(() => {
    const hsc = testimonials.filter((item) => item.category === 'HSC').slice(0, 3);
    if (hsc.length === 3) return hsc;
    return testimonials.slice(0, 3);
  }, []);

  useEffect(() => {
    document.title = 'HSC Maths Tutoring Sydney | Advanced, Ext 1, Ext 2 | Ryze Education';

    let descriptionTag = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!descriptionTag) {
      descriptionTag = document.createElement('meta');
      descriptionTag.name = 'description';
      document.head.appendChild(descriptionTag);
    }
    descriptionTag.content =
      'High-performance HSC Maths tutoring in Sydney for Advanced, Extension 1, and Extension 2. Book a free consultation and get a personalised study plan.';
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
    <div className="bg-[#0D0D0D] text-white">
      <section className="relative overflow-hidden border-b border-white/10">
        <img
          src={heroImageSrc}
          srcSet={heroImageSrcSet}
          sizes="(max-width: 768px) 100vw, 1200px"
          alt="HSC Maths tutoring in Sydney"
          fetchPriority="high"
          loading="eager"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/65" />

        <div className="relative mx-auto max-w-6xl px-4 pb-14 pt-24 sm:px-6 lg:px-8 lg:pb-16 lg:pt-28">
          <div className="max-w-3xl space-y-5">
            <p className="inline-flex items-center gap-2 rounded-full border border-ryze/40 bg-ryze/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-ryze-200">
              <ShieldCheck size={14} aria-hidden="true" />
              HSC Maths Advanced and Extension Specialists
            </p>
            <h1 className="text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
              HSC Maths Tutoring That Turns Potential Into Results
            </h1>
            <p className="text-base leading-relaxed text-slate-200 sm:text-lg">
              Structured support for Advanced, Extension 1, and Extension 2 students who want stronger marks,
              cleaner exam technique, and confident performance in trials and the HSC.
            </p>

            <ul className="grid gap-2 text-sm text-slate-100 sm:grid-cols-3">
              <li className="inline-flex items-center gap-2"><CheckCircle2 size={16} className="text-ryze" />Small groups</li>
              <li className="inline-flex items-center gap-2"><CheckCircle2 size={16} className="text-ryze" />Exam-focused</li>
              <li className="inline-flex items-center gap-2"><CheckCircle2 size={16} className="text-ryze" />Weekly feedback</li>
            </ul>

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
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10 sm:w-auto"
              >
                <Phone size={16} aria-hidden="true" />
                Call +61 413 885 839
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50 py-8 text-slate-900">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-3 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-5 lg:px-8">
          {trustItems.map((item) => (
            <div key={item} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium shadow-sm">
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white py-16 text-slate-900">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold sm:text-4xl">Proof That Students and Parents Trust</h2>
            <p className="mt-3 text-slate-600">Built for families who need measurable academic growth, not generic tutoring.</p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <Users className="text-ryze" size={24} aria-hidden="true" />
              <p className="mt-3 text-3xl font-extrabold">500+</p>
              <p className="mt-1 text-sm text-slate-600">Students supported across Sydney</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <Star className="text-ryze" size={24} aria-hidden="true" />
              <p className="mt-3 text-3xl font-extrabold">4.9/5</p>
              <p className="mt-1 text-sm text-slate-600">Average parent and student rating</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <BadgeCheck className="text-ryze" size={24} aria-hidden="true" />
              <p className="mt-3 text-3xl font-extrabold">13+ years</p>
              <p className="mt-1 text-sm text-slate-600">Teaching and HSC mentoring experience</p>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <h3 className="text-lg font-bold">Who This Is For</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {studentSegments.map((segment) => (
                <span key={segment} className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                  {segment}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-16 text-slate-900">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold sm:text-4xl">How It Works</h2>
          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            {howItWorksSteps.map((step) => (
              <article key={step.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <CalendarCheck2 className="text-ryze" size={22} aria-hidden="true" />
                <h3 className="mt-3 text-xl font-bold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 text-slate-900">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold sm:text-4xl">Student Results and Parent Feedback</h2>
          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            {featuredTestimonials.map((item) => (
              <article key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                <p className="text-sm font-semibold uppercase tracking-wide text-ryze">{item.achievement}</p>
                <p className="mt-3 text-sm leading-relaxed text-slate-700">"{item.message}"</p>
                <p className="mt-4 text-sm font-bold text-slate-900">{item.reviewerName}</p>
                <p className="text-xs text-slate-500">{item.reviewerType} - {item.studentGrade}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="book" className="bg-slate-950 py-16 text-white">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <h2 className="text-3xl font-bold sm:text-4xl">Book Your Free Consultation</h2>
            <p className="mt-3 max-w-lg text-slate-300">
              Tell us your current level and goals. We will recommend the right stream and next steps.
            </p>

            <div className="mt-6 space-y-3">
              <a
                href="tel:+61413885839"
                onClick={handlePhoneClick}
                className="inline-flex w-full items-center justify-between rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm font-semibold hover:bg-white/10"
              >
                <span className="inline-flex items-center gap-2"><Phone size={16} aria-hidden="true" /> Call Us</span>
                <ArrowRight size={16} aria-hidden="true" />
              </a>
              <a
                href="https://api.whatsapp.com/message/6GUJFT6GY2DHG1?autoload=1&app_absent=0"
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleWhatsappClick}
                className="inline-flex w-full items-center justify-between rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm font-semibold hover:bg-white/10"
              >
                <span className="inline-flex items-center gap-2"><MessageCircle size={16} aria-hidden="true" /> WhatsApp</span>
                <ArrowRight size={16} aria-hidden="true" />
              </a>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur-sm">
            <div className="grid grid-cols-1 gap-4">
              <label className="text-sm font-medium">
                Name
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-xl border border-white/20 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none focus:border-ryze focus:ring-2 focus:ring-ryze/30"
                />
              </label>

              <label className="text-sm font-medium">
                Email
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-xl border border-white/20 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none focus:border-ryze focus:ring-2 focus:ring-ryze/30"
                />
              </label>

              <label className="text-sm font-medium">
                Phone
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-xl border border-white/20 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none focus:border-ryze focus:ring-2 focus:ring-ryze/30"
                />
              </label>

              <label className="text-sm font-medium">
                Student Level
                <select
                  name="studentLevel"
                  value={formData.studentLevel}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-xl border border-white/20 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none focus:border-ryze focus:ring-2 focus:ring-ryze/30"
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
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ryze px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-ryze-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <BookOpenCheck size={16} aria-hidden="true" />
              {status === 'sending' ? 'Submitting...' : 'Submit Enquiry'}
            </button>

            {status === 'success' && (
              <p className="mt-4 rounded-lg border border-emerald-300/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
                Thanks, your enquiry has been sent. We will contact you shortly.
              </p>
            )}

            {status === 'error' && (
              <p className="mt-4 rounded-lg border border-red-300/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                Submission failed. Please try again or call us directly.
              </p>
            )}
          </form>
        </div>
      </section>
    </div>
  );
};

export default Landing;
