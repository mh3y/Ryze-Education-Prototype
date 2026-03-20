import React, { Suspense, useEffect, useState } from 'react';
const Testimonials = React.lazy(() => import('../Testimonials'));
import { motion } from 'framer-motion';
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Clock,
  GraduationCap,
  Laptop,
  MessageCircle,
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
import { trackEvent } from '../../src/analytics';
import { responsiveCloudinaryImage } from '../../src/utils/cloudinary';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

const programs = [
  {
    id: 'program-hsc',
    badge: 'PRIMARY PATHWAY',
    title: 'HSC Maths',
    blurb:
      'Band 6 systems for Advanced + Extension 1/2. Timed exam training, past-paper mastery, and rank-focused feedback built around NSW syllabus outcomes.',
    bestFor: 'Best for: Years 10-12 - Advanced / Ext 1 / Ext 2',
    whatYouGet: 'What you get: Weekly plan - Topic tests - Exam technique - Marking + fixes',
    ctaLabel: 'View HSC Pathway',
    href: ROUTES.HSC_MATHS_TUTORING,
  },
  {
    id: 'program-selective-details',
    badge: 'PROGRAM',
    title: 'Selective & OC',
    blurb: 'High-difficulty reasoning + speed training for competitive exam outcomes.',
    bestFor: 'Best for: Years 4-6',
    ctaLabel: 'View Selective Pathway',
    href: '#program-selective-details',
  },
  {
    id: 'program-junior-details',
    badge: 'PROGRAM',
    title: 'Junior Foundations',
    blurb: 'Build algebra fluency and problem-solving habits early so senior maths becomes easier.',
    bestFor: 'Best for: Years 3-9',
    ctaLabel: 'See Junior Program',
    href: '#program-junior-details',
  },
];

const features = [
  {
    icon: Users,
    title: 'Small Classes',
    desc: "Max 6 students. You won't get lost in the crowd.",
    colorClass: 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white',
    borderClass: 'hover:border-blue-200',
    shadowClass: 'blue-shadow',
  },
  {
    icon: Star,
    title: 'Signature Curriculum',
    desc: 'Syllabus-aligned resources developed by NSW teachers.',
    colorClass: 'bg-amber-50 text-amber-600 group-hover:bg-amber-500 group-hover:text-white',
    borderClass: 'hover:border-amber-200',
    shadowClass: 'amber-shadow',
  },
  {
    icon: Trophy,
    title: 'Complete Support',
    desc: 'Help between sessions, subject selection, and uni pathways.',
    colorClass: 'bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white',
    borderClass: 'hover:border-purple-200',
    shadowClass: 'purple-shadow',
  },
  {
    icon: Activity,
    title: 'Progress Tracking',
    desc: 'Regular sessions to monitor, analyse, and optimise performance.',
    colorClass: 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white',
    borderClass: 'hover:border-emerald-200',
    shadowClass: 'emerald-shadow',
  },
  {
    icon: GraduationCap,
    title: 'Expert Mentors',
    desc: 'Genuine care and expertise to build student success.',
    colorClass: 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white',
    borderClass: 'hover:border-indigo-200',
    shadowClass: 'indigo-shadow',
  },
  {
    icon: PenTool,
    title: 'Accredited Teachers',
    desc: 'Founded by leading NSW teachers and academics.',
    colorClass: 'bg-pink-50 text-pink-600 group-hover:bg-pink-600 group-hover:text-white',
    borderClass: 'hover:border-pink-200',
    shadowClass: 'pink-shadow',
  },
  {
    icon: Smile,
    title: 'Risk-Free Trial',
    desc: 'First lesson free. You only pay if you decide to continue.',
    colorClass: 'bg-sky-50 text-sky-600 group-hover:bg-sky-600 group-hover:text-white',
    borderClass: 'hover:border-sky-200',
    shadowClass: 'sky-shadow',
  },
  {
    icon: Laptop,
    title: 'Flexible Options',
    desc: 'Private, group, online, or in-person learning.',
    colorClass: 'bg-orange-50 text-orange-600 group-hover:bg-orange-500 group-hover:text-white',
    borderClass: 'hover:border-orange-200',
    shadowClass: 'orange-shadow',
  },
];

const benefits = [
  'Personal attention that matters',
  'Genuine mentorship',
  'Engagement, not lectures',
  'Real understanding',
  'You are not a number',
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

const team = [
  {
    id: 'mike-nojiri',
    name: 'Mike Nojiri',
    role: "Master's in Teaching | BSc(Math)/BCompSc",
    atar: '99.25',
    scores: ['98 Maths Ext 2', '|', '99 Maths Ext 1', '99 Maths Advanced (Accelerated)'],
    imageOptimized: buildTeamCardImage(
      'https://res.cloudinary.com/dsvjhemjd/image/upload/f_auto,q_auto:good,c_fill,g_auto,w_900,h_1125,dpr_auto/v1769561928/869fcdd5dfa6efd8ee8853d9e0eea053_kiv4v2.jpg',
    ),
    fallback: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'william-gong',
    name: 'William Gong',
    role: 'PhD - AI & Machine Learning candidate',
    atar: '99.50',
    scores: ['99 Maths Ext 2', '|', '97 Maths Ext 1', '|', '97 Physics', '94 Chemistry'],
    imageOptimized: buildTeamCardImage(
      'https://res.cloudinary.com/dsvjhemjd/image/upload/f_auto,q_auto:good,c_fill,g_auto,w_900,h_1125,dpr_auto/v1769568491/34b29c410f6278cf36653c984998c5fe_diuyma.jpg',
    ),
    fallback: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'gordon-ye',
    name: 'Gordon Ye',
    role: 'UNSW Academic Teaching Staff | BMaths/BCompSc',
    atar: '99.55',
    scores: ['98 Maths Ext 2', '|', '98 Maths Ext 1', '|', '97 Physics', '96 Chemistry'],
    imageOptimized: buildTeamCardImage(
      'https://res.cloudinary.com/dsvjhemjd/image/upload/f_auto,q_auto:good,c_fill,g_auto,w_900,h_1125,dpr_auto/v1764460809/588278725_1528730215077629_8325133640910985831_n_mr2y31.jpg',
    ),
    fallback: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  },
];

const HomeDeferredSections: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [isAvailable, setIsAvailable] = useState(false);
  const [hscProgram, ...secondaryPrograms] = programs;

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

  const handlePhoneClick = () => {
    trackEvent('phone_click', { page: 'home', placement: 'home_bottom_cta' });
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'conversion', {
        send_to: 'AW-17763964178/xkRDCOqQr_wbEJKqwpZC',
        event_callback: () => {
          console.log('Google Ads conversion event successfully sent from Home page.');
        },
      });
    }
  };

  return (
    <>
      <section id="programs" className="ryze-section bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">Programs</h2>
            <p className="mt-3 text-slate-600">
              Choose the pathway that matches your goal. HSC Maths is our primary performance track.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <article
              id={hscProgram.id}
              className="ryze-card relative overflow-hidden rounded-2xl border-2 border-ryze/40 bg-ryze/5 p-6 sm:p-7 lg:col-span-2"
            >
              <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-ryze" />
              <p className="text-xs font-semibold uppercase tracking-wide text-ryze">{hscProgram.badge}</p>
              <h3 className="mt-3 text-2xl font-bold text-slate-900 sm:text-3xl">{hscProgram.title}</h3>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-700">{hscProgram.blurb}</p>
              <p className="mt-5 text-sm font-medium text-slate-800">{hscProgram.bestFor}</p>
              <p className="mt-1 text-sm text-slate-700">{hscProgram.whatYouGet}</p>
              <a
                href={hscProgram.href}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-ryze px-4 py-2 text-sm font-semibold text-slate-900 transition-colors hover:bg-ryze/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ryze focus-visible:ring-offset-2"
              >
                {hscProgram.ctaLabel} <ArrowRight size={16} aria-hidden="true" />
              </a>
            </article>

            <div className="flex flex-col gap-4">
              {secondaryPrograms.map((program) => (
                <article
                  key={program.id}
                  id={program.id}
                  className="ryze-card rounded-2xl border border-slate-200 bg-white p-5"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{program.badge}</p>
                  <h3 className="mt-2 text-xl font-bold text-slate-900">{program.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{program.blurb}</p>
                  <p className="mt-3 text-sm font-medium text-slate-700">{program.bestFor}</p>
                  <a
                    href={program.href}
                    className="mt-4 inline-flex items-center gap-2 rounded-sm text-sm font-semibold text-slate-900 transition-colors hover:text-ryze focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ryze focus-visible:ring-offset-2"
                  >
                    {program.ctaLabel} <ArrowRight size={16} aria-hidden="true" />
                  </a>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-sm text-slate-700">
              Trusted by families across Sydney. Structured weekly programs. Clear progress tracking. Exam-ready confidence.
            </p>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 sm:flex sm:items-center sm:justify-between sm:gap-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Not sure which to choose?</h3>
              <p className="mt-2 text-sm text-slate-600">
                Tell us your year level and goal. We&apos;ll recommend the best start point.
              </p>
            </div>
            <a
              href={ROUTES.CONTACT}
              aria-label="Get a program recommendation"
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900 transition-colors hover:border-ryze hover:text-ryze focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ryze focus-visible:ring-offset-2 sm:mt-0"
            >
              Get a recommendation <ArrowRight size={16} aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      <Suspense fallback={<div className="h-[50vh] w-full bg-slate-50" />}>
        <Testimonials />
      </Suspense>

      <section className="relative overflow-hidden bg-slate-50 py-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,176,0,0.05),transparent_40%)]"></div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 flex flex-col items-end justify-between gap-6 md:flex-row">
            <div className="max-w-2xl">
              <h2 className="mb-4 text-4xl font-bold text-slate-900 lg:text-5xl">{t('Meet Your Mentors')}</h2>
              <p className="text-lg text-slate-500">
                {t('Our experienced educators are committed to helping every student thrive. Not just tutors, but qualified teachers and high-achievers.')}
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => navigate('/meet-the-team')}
              className="flex items-center gap-2 rounded-full bg-white px-6 py-3 font-bold text-ryze shadow-sm transition-all hover:gap-4 hover:shadow-md"
            >
              {t('View All Team')} <ArrowRight size={20} />
            </motion.button>
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
                {member.scores && member.scores.length > 0 && (
                  <div className="mb-6">
                    <div className="rounded-xl border border-slate-100 bg-white p-3 backdrop-blur-md">
                      <h4 className="mb-2 text-center text-xl font-bold uppercase tracking-wider text-[#FFB000]">HSC Marks</h4>
                      <div className="flex flex-wrap justify-center gap-x-3 gap-y-1">
                        {member.scores.map((score, i) => (
                          <span key={`${member.id}-${i}`} className="text-sm font-semibold text-black/75">
                            {score}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="relative mb-6 aspect-[3/4] overflow-hidden rounded-[2rem] bg-slate-200 shadow-md">
                  {member.atar && (
                    <div className="absolute left-2 top-2 z-20 md:left-4 md:top-4">
                      <div
                        style={{ willChange: 'transform' }}
                        className="transform rounded-xl border border-[#ffb000]/75 bg-black/50 shadow-2xl transition-transform duration-300 ease-in-out md:rounded-2xl md:hover:scale-110 md:hover:shadow-amber-400/50 backdrop-blur-xl"
                      >
                        <div className="p-3 text-center text-white md:p-4">
                          <div className="mb-1 flex items-center justify-center gap-1 md:gap-2">
                            <Star className="h-5 w-5 text-amber-300" fill="currentColor" />
                            <p className="text-xl font-bold uppercase tracking-wider md:text-2xl">ATAR</p>
                          </div>
                          <p className="font-mono text-xl font-bold tracking-tight md:text-2xl">{member.atar}</p>
                        </div>
                      </div>
                    </div>
                  )}

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
                    <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-md">{t('Read Bio')}</span>
                  </div>
                </div>

                <div className="pl-2">
                  <h3 className="mb-1 text-2xl font-bold text-slate-900 transition-colors group-hover:text-ryze">{member.name}</h3>
                  <p className="mb-1.5 text-sm font-medium text-slate-700">{t(member.role)}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-white px-4 py-24 md:py-32 transform-gpu">
        <div className="absolute left-0 top-0 h-full w-full overflow-hidden pointer-events-none">
          <div className="absolute left-[-10%] top-[10%] h-[500px] w-[500px] rounded-full bg-blue-50/50 blur-[100px] transform-gpu" style={{ willChange: 'transform' }}></div>
          <div className="absolute bottom-[10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-amber-50/50 blur-[100px] transform-gpu" style={{ willChange: 'transform' }}></div>
        </div>

        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:40px_40px] opacity-30 pointer-events-none"></div>

        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="mx-auto mb-20 max-w-3xl text-center">
            <h2 className="mb-6 text-4xl font-bold tracking-tight text-slate-900 lg:text-5xl">{t('What makes Ryze different?')}</h2>
            <p className="text-lg font-normal text-slate-500">
              {t("We've stripped away the inefficiencies of traditional tuition to focus on what actually drives learning outcomes.")}
            </p>
          </div>

          <div className="isolate grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: idx * 0.05 }}
                className={`feature-card-shadow group flex flex-col rounded-[2rem] border border-slate-100 bg-white p-8 shadow-sm transition-colors transition-transform duration-300 hover:-translate-y-2 ${feature.shadowClass} ${feature.borderClass}`}
              >
                <div className={`mb-6 flex h-16 w-16 items-center justify-center rounded-2xl shadow-inner transition-colors duration-300 ${feature.colorClass}`}>
                  <feature.icon size={28} strokeWidth={2} />
                </div>
                <h3 className="mb-3 text-xl font-bold leading-tight text-slate-900">{t(feature.title)}</h3>
                <p className="flex-grow text-sm leading-relaxed text-slate-500">
                  {t(feature.desc)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-white py-24">
        <div className="pointer-events-none absolute right-0 top-0 h-full w-full bg-gradient-to-br from-slate-50 to-transparent opacity-50"></div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2 lg:gap-24">
            <div>
              <div className="mb-6 inline-block rounded-full border border-ryze/20 bg-ryze/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-ryze">{t('Our Philosophy')}</div>
              <h2 className="mb-8 text-4xl font-bold leading-[1.1] text-slate-900 lg:text-6xl">
                {t('Education that')} <br />{' '}
                <span className="relative inline-block text-ryze">
                  {t('sees you.')}
                  <svg className="absolute -bottom-1 left-0 h-3 w-full text-ryze/30" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                  </svg>
                </span>
              </h2>
              <p className="mb-8 text-lg font-normal leading-relaxed text-slate-600">
                {t('At Ryze, we believe learning happens in relationship, not in crowds. We have built everything around small classes and genuine mentorships because we know it works.')}
              </p>
              <PrimaryCTA
                variant="link"
                href={ROUTES.CONTACT}
                size="lg"
                page="home"
                placement="home_philosophy"
                className="inline-flex !border-[3px] !border-[#FFB000]/70 !bg-transparent !text-[#B87400] !shadow-[0_10px_24px_-18px_rgba(15,23,42,0.35)] !backdrop-blur-[4px] hover:!bg-[#FFB000]/10"
              />
            </div>

            <div className="space-y-5">
              {benefits.map((benefit, idx) => (
                <motion.div
                  key={benefit}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ x: 5 }}
                  className="flex items-center gap-5 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:border-ryze/50 hover:shadow-md"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-green-100 bg-green-50 text-green-600">
                    <CheckCircle2 size={20} strokeWidth={2.5} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">{t(benefit)}</h3>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative bg-slate-50 px-4 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-[#FFB000] to-orange-500 shadow-2xl shadow-orange-500/20">
            <div className="absolute right-0 top-0 h-[600px] w-[600px] translate-x-1/3 -translate-y-1/2 rounded-full bg-white opacity-10 blur-[100px] transform-gpu" style={{ willChange: 'transform' }}></div>
            <div className="absolute bottom-0 left-0 h-[400px] w-[400px] -translate-x-1/3 translate-y-1/3 rounded-full bg-orange-600 opacity-20 blur-[80px] transform-gpu" style={{ willChange: 'transform' }}></div>

            <div className="relative z-10 grid grid-cols-1 items-center gap-12 p-10 md:p-16 lg:grid-cols-2 lg:gap-20 lg:p-20">
              <div className="space-y-8 text-center lg:text-left">
                <h2 className="text-4xl font-bold leading-[1.1] tracking-tight text-white md:text-6xl">
                  {t('Ready to realise')} <br /> {t('your potential?')}
                </h2>
                <p className="mx-auto max-w-lg text-lg font-medium leading-relaxed text-white/90 md:text-xl lg:mx-0">
                  {t('Join the students achieving their best with Ryze. Expert tutors, personalised attention, and proven results.')}
                </p>

                <div className="flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
                  <PrimaryCTA
                    variant="link"
                    href={ROUTES.CONTACT}
                    size="lg"
                    page="home"
                    placement="home_bottom_cta"
                    label="Book a Free Consultation"
                    className="w-full sm:w-[228px] !h-[72px] !justify-between !rounded-[36px] !px-6 !py-0 !bg-white/12 !text-[1rem] !font-bold !text-white !border-[3px] !border-white/70 !backdrop-blur-[8px] !shadow-[0_12px_30px_-18px_rgba(15,23,42,0.55)] !transition-all !duration-300 !ease-out hover:-translate-y-[2px] hover:!bg-white/20 hover:!shadow-[0_18px_36px_-18px_rgba(15,23,42,0.65)] active:translate-y-0 active:!shadow-[0_10px_22px_-16px_rgba(15,23,42,0.5)] focus-visible:!outline-none focus-visible:!ring-2 focus-visible:!ring-white/60 focus-visible:!ring-offset-2 focus-visible:!ring-offset-transparent"
                  />
                  <a
                    href="tel:+61413885839"
                    onClick={handlePhoneClick}
                    className="inline-flex h-[72px] w-full items-center justify-center gap-2 rounded-[36px] border-[3px] border-white/70 bg-white/12 px-6 py-0 text-[1rem] font-bold leading-snug text-white shadow-[0_12px_30px_-18px_rgba(15,23,42,0.55)] backdrop-blur-[8px] transition-all duration-300 ease-out hover:-translate-y-[2px] hover:bg-white/20 hover:shadow-[0_18px_36px_-18px_rgba(15,23,42,0.65)] active:translate-y-0 active:shadow-[0_10px_22px_-16px_rgba(15,23,42,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent sm:w-[228px]"
                  >
                    <Phone size={17} strokeWidth={2.1} />
                    <span>{t('Give us a call now!')}</span>
                  </a>
                </div>
              </div>

              <div className="relative flex flex-col items-center gap-6 lg:items-end">
                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  className="transform w-full max-w-sm rotate-2 rounded-2xl bg-white/90 p-6 shadow-lg backdrop-blur-md lg:translate-x-8"
                >
                  <div className="mb-4 flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                      <MessageCircle size={20} />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800">{t('Quick Question?')}</div>
                      <div className="text-xs text-slate-500">
                        {isAvailable ? t('Usually replies in 10 mins') : t("We'll reply during business hours")}
                      </div>
                    </div>
                  </div>
                  <div className="mb-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
                    &quot;Hi, I&apos;m interested in Year 10 Maths for my son. Do you have spots?&quot;
                  </div>
                  <div
                    className="cursor-pointer text-right text-xs font-bold text-orange-600 hover:underline"
                    onClick={() => navigate('/contact')}
                  >
                    {t('Send Message ->')}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="relative z-10 w-full max-w-sm transform rounded-2xl bg-white p-6 shadow-xl lg:-translate-x-4 lg:-rotate-2"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src="https://res.cloudinary.com/dsvjhemjd/image/upload/f_auto,q_auto:good,c_fill,g_face,w_120,h_120,dpr_auto/v1764105304/0739d6ceb5594812228108103c314c99_nd6cb5.jpg"
                      alt="Michael Yang"
                      width={56}
                      height={56}
                      className="h-14 w-14 rounded-full border-2 border-orange-100 object-cover"
                    />
                    <div>
                      <div className="text-lg font-bold text-slate-900">Michael Yang</div>
                      <div className="text-sm text-slate-500">{t('Founder of Ryze Education')}</div>

                      {isAvailable ? (
                        <div className="mt-1 flex w-fit items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-bold text-green-600">
                          <div className="h-1.5 w-1.5 rounded-full bg-green-600 animate-pulse"></div> {t('Available for call (9am-11pm)')}
                        </div>
                      ) : (
                        <div className="mt-2 flex flex-col">
                          <div className="mb-1 flex w-fit items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-500">
                            <Clock size={10} /> {t('Back at 9am SYD')}
                          </div>
                          <span className="text-[10px] leading-tight text-slate-400">{t("Please drop a message, we'll reply during business hours.")}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HomeDeferredSections;
