import React, { Suspense, useEffect, useMemo, useState } from 'react';
const Testimonials = React.lazy(() => import('../components/Testimonials'));
import { motion as motionOriginal, useReducedMotion, useScroll, useTransform } from 'framer-motion';
const motion = motionOriginal as any;
import { Users, Star, Trophy, Activity, GraduationCap, PenTool, Smile, Laptop, ArrowRight, CheckCircle2, Phone, MessageCircle, Sparkles, Clock } from 'lucide-react';
// @ts-ignore
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { responsiveCloudinaryImage } from '../src/utils/cloudinary';
import PrimaryCTA from '../components/PrimaryCTA';
import { ROUTES } from '../src/constants/routes';

const HOME_HERO_IMAGE_BASE =
  'https://res.cloudinary.com/dsvjhemjd/image/upload/f_auto,q_auto,c_fill,g_auto,dpr_auto';
const HOME_HERO_IMAGE_ID = 'ryze/images/image-v1';
const HOME_HERO_IMAGE_SRC = `${HOME_HERO_IMAGE_BASE},w_768/${HOME_HERO_IMAGE_ID}`;
const HOME_HERO_IMAGE_SRC_SET = [
  `${HOME_HERO_IMAGE_BASE},w_360/${HOME_HERO_IMAGE_ID} 360w`,
  `${HOME_HERO_IMAGE_BASE},w_480/${HOME_HERO_IMAGE_ID} 480w`,
  `${HOME_HERO_IMAGE_BASE},w_640/${HOME_HERO_IMAGE_ID} 640w`,
  `${HOME_HERO_IMAGE_BASE},w_768/${HOME_HERO_IMAGE_ID} 768w`,
  `${HOME_HERO_IMAGE_BASE},w_1024/${HOME_HERO_IMAGE_ID} 1024w`,
  `${HOME_HERO_IMAGE_BASE},w_1280/${HOME_HERO_IMAGE_ID} 1280w`,
].join(', ');

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

const ScrollingColumn = ({
  children,
  direction = "up",
  durationVar = 'var(--ryze-motion-vertical-scroll-slow)',
  reducedMotion = false
}: React.PropsWithChildren<{
  direction?: "up" | "down";
  durationVar?: string;
  reducedMotion?: boolean;
}>) => (
  <div className="ryze-vertical-marquee transform-gpu">
    <div
      className={`ryze-vertical-track ${direction === "down" ? 'is-reverse' : ''}`}
      style={{ '--ryze-column-duration': durationVar, backfaceVisibility: 'hidden' } as React.CSSProperties}
    >
      {children}
      {!reducedMotion && children}
    </div>
  </div>
);

// Optimized Card with smooth scaling and LCP support
type CardImageSource = {
  src: string;
  srcSet: string;
  sizes: string;
  width: number;
  height: number;
};

const Card = ({
  image,
  title,
  tag,
  priority = false,
  fetchPriority = 'auto',
}: {
  image: CardImageSource;
  title: string;
  tag: string;
  priority?: boolean;
  fetchPriority?: 'high' | 'low' | 'auto';
}) => (
  <motion.div 
    whileHover={{ scale: 1.02 }}
    transition={{ duration: 0.3 }}
    className="relative rounded-3xl overflow-hidden shadow-lg card-shadow-wrapper duration-500 aspect-[3/4] w-full group cursor-default border border-slate-100 transform-gpu"
    style={{ willChange: 'transform' }}
  >
    <img 
      src={image.src}
      srcSet={image.srcSet}
      sizes={image.sizes}
      width={image.width}
      height={image.height}
      alt={title} 
      loading={priority ? "eager" : "lazy"}
      fetchPriority={fetchPriority}
      decoding="async"
      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-90"></div>
    <div className="absolute top-4 left-4">
       <span className="bg-[#FFB000] backdrop-blur-md border border-white/80 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
          {tag}
       </span>
    </div>
    <div className="absolute bottom-0 left-0 p-6 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
      <h3 className="text-white font-sans font-bold text-xl leading-tight mb-2">{title}</h3>
      <div className="w-12 h-1 bg-ryze rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </div>
  </motion.div>
);

const Home: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const { scrollY } = useScroll();
  const reduceMotion = useReducedMotion();
  
  // Parallax transforms - optimized with transform-gpu
  const headerY = useTransform(scrollY, [0, 500], [0, 200]);
  const headerOpacity = useTransform(scrollY, [0, 300], [1, 0]);

  // Business Logic for Availability
  const [isAvailable, setIsAvailable] = useState(false);

  const campaignParams = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const offer = (params.get('offer') || '').toLowerCase();
    const utmCampaign = (params.get('utm_campaign') || '').toLowerCase();
    const isHscOffer =
      offer.includes('hsc') ||
      utmCampaign.includes('hsc') ||
      utmCampaign.includes('advanced') ||
      utmCampaign.includes('ext1') ||
      utmCampaign.includes('ext2');

    return {
      offer,
      utmCampaign,
      isHscOffer,
    };
  }, [location.search]);

  const heroSubheading = campaignParams.isHscOffer
    ? 'HSC Maths Advanced and Extension tutoring built for high marks, clean exam technique, and real confidence.'
    : t('Think Sharper. Perform Better.');

  useEffect(() => {
    if (!import.meta.env.DEV) return;

    let disposePerfDebug: undefined | (() => void);
    void import('../src/utils/perfDebug').then(({ initPerfDebug }) => {
      disposePerfDebug = initPerfDebug('home');
    });

    return () => {
      if (disposePerfDebug) disposePerfDebug();
    };
  }, []);

  useEffect(() => {
    // Defer non-critical hover effects CSS off initial render-blocking path.
    void import('../src/styles/custom-hovers.css');
  }, []);

  const handlePhoneClick = () => {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'conversion', {
        'send_to': 'AW-17763964178/xkRDCOqQr_wbEJKqwpZC',
        'event_callback': () => {
          console.log('Google Ads conversion event successfully sent from Home page.');
        }
      });
    }
  };

  useEffect(() => {
    const checkAvailability = () => {
      // Create a date object for the current time in Sydney
      const now = new Date();
      const sydneyTime = new Date(now.toLocaleString("en-US", {timeZone: "Australia/Sydney"}));
      const hour = sydneyTime.getHours();
      
      // Available between 9 AM (09:00) and 11 PM (23:00)
      setIsAvailable(hour >= 9 && hour < 23);
    };

    checkAvailability();
    const interval = setInterval(checkAvailability, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const features = [
    { 
        icon: Users, 
        title: "Small Classes", 
        desc: "Max 6 students. You won't get lost in the crowd.",
        colorClass: "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white",
        borderClass: "hover:border-blue-200",
        shadowClass: "blue-shadow"
    },
    { 
        icon: Star, 
        title: "Signature Curriculum", 
        desc: "Syllabus-aligned resources developed by NSW teachers.",
        colorClass: "bg-amber-50 text-amber-600 group-hover:bg-amber-500 group-hover:text-white",
        borderClass: "hover:border-amber-200",
        shadowClass: "amber-shadow"
    },
    { 
        icon: Trophy, 
        title: "Complete Support", 
        desc: "Help between sessions, subject selection, and uni pathways.",
        colorClass: "bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white",
        borderClass: "hover:border-purple-200",
        shadowClass: "purple-shadow"
    },
    { 
        icon: Activity, 
        title: "Progress Tracking", 
        desc: "Regular sessions to monitor, analyse, and optimise performance.",
        colorClass: "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white",
        borderClass: "hover:border-emerald-200",
        shadowClass: "emerald-shadow"
    },
    { 
        icon: GraduationCap, 
        title: "Expert Mentors", 
        desc: "Genuine care and expertise to build student success.",
        colorClass: "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white",
        borderClass: "hover:border-indigo-200",
        shadowClass: "indigo-shadow"
    },
    { 
        icon: PenTool, 
        title: "Accredited Teachers", 
        desc: "Founded by leading NSW teachers and academics.",
        colorClass: "bg-pink-50 text-pink-600 group-hover:bg-pink-600 group-hover:text-white",
        borderClass: "hover:border-pink-200",
        shadowClass: "pink-shadow"
    },
    { 
        icon: Smile, 
        title: "Risk-Free Trial", 
        desc: "First lesson free. You only pay if you decide to continue.",
        colorClass: "bg-sky-50 text-sky-600 group-hover:bg-sky-600 group-hover:text-white",
        borderClass: "hover:border-sky-200",
        shadowClass: "sky-shadow"
    },
    { 
        icon: Laptop, 
        title: "Flexible Options", 
        desc: "Private, group, online, or in-person learning.",
        colorClass: "bg-orange-50 text-orange-600 group-hover:bg-orange-500 group-hover:text-white",
        borderClass: "hover:border-orange-200",
        shadowClass: "orange-shadow"
    }
  ];

  const benefits = [
    "Personal attention that matters",
    "Genuine mentorship",
    "Engagement, not lectures",
    "Real understanding",
    "You are not a number"
  ];

  const programs = [
    {
      id: 'program-hsc',
      title: 'HSC Maths',
      blurb: 'Advanced, Extension 1, and Extension 2 pathways with exam-focused teaching.',
      ctaLabel: 'Explore HSC Program',
      href: '/hsc-maths-tutoring',
      isPrimary: true,
    },
    {
      id: 'program-selective',
      title: 'Selective and OC',
      blurb: 'Structured preparation for OC and selective exam maths and problem solving.',
      ctaLabel: 'View Selective Pathway',
      href: '#program-selective-details',
      isPrimary: false,
    },
    {
      id: 'program-junior',
      title: 'Junior Foundations',
      blurb: 'Strong numeracy and algebra foundations for Years 3-10 before senior years.',
      ctaLabel: 'See Junior Program',
      href: '#program-junior-details',
      isPrimary: false,
    },
  ];

  const marketingCardSizes = '(max-width: 640px) 88vw, (max-width: 1024px) 42vw, 312px';
  const buildMarketingCardImage = (sourceUrl: string) =>
    responsiveCloudinaryImage(sourceUrl, {
      widths: [320, 360, 420, 480],
      aspectRatio: [3, 4],
      sizes: marketingCardSizes,
      crop: 'fill',
      gravity: 'auto',
    });

  const marketingCardImages = {
    ocSelectiveExam: buildMarketingCardImage('https://res.cloudinary.com/dsvjhemjd/image/upload/f_auto,q_auto:good,c_fill,g_auto,w_720,h_960,dpr_auto/ryze/images/personalised'),
    smallGroupFocus: buildMarketingCardImage('https://res.cloudinary.com/dsvjhemjd/image/upload/f_auto,q_auto:good,c_fill,g_auto,w_720,h_960,dpr_auto/ryze/images/class4'),
    nswAccreditedTeachers: buildMarketingCardImage('https://res.cloudinary.com/dsvjhemjd/image/upload/f_auto,q_auto:good,c_fill,g_auto,w_720,h_960,dpr_auto/ryze/images/tutor2'),
    hscExcellence: buildMarketingCardImage('https://res.cloudinary.com/dsvjhemjd/image/upload/f_auto,q_auto:good,c_fill,g_auto,w_720,h_960,dpr_auto/ryze/images/image-v4'),
    hybridLearning: buildMarketingCardImage('https://res.cloudinary.com/dsvjhemjd/image/upload/f_auto,q_auto:good,c_fill,g_auto,w_720,h_960,dpr_auto/ryze/images/onlinev4'),
    distinguishedMentors: buildMarketingCardImage('https://res.cloudinary.com/dsvjhemjd/image/upload/f_auto,q_auto:good,c_fill,g_auto,w_720,h_960,dpr_auto/ryze/images/gordon'),
  };

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
      id: "mike-nojiri",
      name: "Mike Nojiri",
      role: "Master's in Teaching | BSc(Math)/BCompSc",
      atar: "99.25",
      scores: ["98 Maths Ext 2", "|", "99 Maths Ext 1", "99 Maths Advanced (Accelerated)"],
      image: "https://res.cloudinary.com/dsvjhemjd/image/upload/f_auto,q_auto:good,c_fill,g_auto,w_900,h_1125,dpr_auto/v1769561928/869fcdd5dfa6efd8ee8853d9e0eea053_kiv4v2.jpg",
      imageOptimized: buildTeamCardImage("https://res.cloudinary.com/dsvjhemjd/image/upload/f_auto,q_auto:good,c_fill,g_auto,w_900,h_1125,dpr_auto/v1769561928/869fcdd5dfa6efd8ee8853d9e0eea053_kiv4v2.jpg"),
      fallback: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "william-gong",
      name: "William Gong",
      role: "PhD - AI & Machine Learning candidate",
      atar: "99.50",
      scores: ["99 Maths Ext 2", "|", "97 Maths Ext 1", "|", "97 Physics", "94 Chemistry"],
      image: "https://res.cloudinary.com/dsvjhemjd/image/upload/f_auto,q_auto:good,c_fill,g_auto,w_900,h_1125,dpr_auto/v1769568491/34b29c410f6278cf36653c984998c5fe_diuyma.jpg",
      imageOptimized: buildTeamCardImage("https://res.cloudinary.com/dsvjhemjd/image/upload/f_auto,q_auto:good,c_fill,g_auto,w_900,h_1125,dpr_auto/v1769568491/34b29c410f6278cf36653c984998c5fe_diuyma.jpg"),
      fallback: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "gordon-ye",
      name: "Gordon Ye",
      role: "UNSW Academic Teaching Staff | BMaths/BCompSc",
      atar: "99.55",
      scores: ["98 Maths Ext 2", "|", "98 Maths Ext 1", "|", "97 Physics", "96 Chemistry"],
      image: "https://res.cloudinary.com/dsvjhemjd/image/upload/f_auto,q_auto:good,c_fill,g_auto,w_900,h_1125,dpr_auto/v1764460809/588278725_1528730215077629_8325133640910985831_n_mr2y31.jpg",
      imageOptimized: buildTeamCardImage("https://res.cloudinary.com/dsvjhemjd/image/upload/f_auto,q_auto:good,c_fill,g_auto,w_900,h_1125,dpr_auto/v1764460809/588278725_1528730215077629_8325133640910985831_n_mr2y31.jpg"),
      fallback: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
    }
  ];

  return (
    <div className="w-full font-sans overflow-hidden bg-slate-50">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-b-[3rem] bg-slate-900 pb-20 pt-32 lg:rounded-b-[5rem] lg:pb-32 lg:pt-48">
        <picture className="absolute inset-0">
          <img
            src={HOME_HERO_IMAGE_SRC}
            srcSet={HOME_HERO_IMAGE_SRC_SET}
            sizes="(max-width: 768px) 100vw, 100vw"
            alt="HSC Maths tutoring in Sydney - Ryze Education"
            fetchPriority="high"
            loading="eager"
            decoding="async"
            className="h-full w-full object-cover"
          />
        </picture>
        {/* Correctly placed overlay */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
        {/* Content container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-8 text-center lg:text-left"
            >
              <div className="space-y-4">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 shadow-sm text-white text-sm font-bold tracking-wide mb-2 mx-auto lg:mx-0"
                  >
                    <Sparkles size={14} className="text-ryze" />
                    <span>{t("FOUNDED BY ACCREDITED TEACHERS AND ACADEMIC SCHOLARS")}</span>
                  </motion.div>
                  
                  <h1 className="text-5xl lg:text-8xl font-sans font-extrabold text-white leading-[1.05] tracking-tight">
                    {t("Teaching with")} <span className="text-transparent bg-clip-text bg-gradient-to-r from-ryze to-orange-500">{t("purpose.")}</span> <br/>
                    {t("Learning with")} <span className="text-white">{t("clarity.")}</span>
                  </h1>

                  <p className="text-lg lg:text-2xl font-sans font-medium text-white leading-tight tracking-wide">
                    {heroSubheading}
                  </p>

                  {campaignParams.isHscOffer && (
                    <p className="inline-flex items-center gap-2 rounded-full border border-ryze/40 bg-ryze/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-ryze-100">
                      Message match active: HSC Maths Advanced and Extension
                    </p>
                  )}
              </div>

              <p className="text-lg text-white max-w-lg mx-auto lg:mx-0 leading-relaxed font-normal">
                {t("Get the individual attention you deserve in our private and focused small group classes. Experienced tutors, personalised programs, and real results.")}
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center lg:justify-start items-center gap-6 pt-4">
                <PrimaryCTA
                  variant="link"
                  href={`${ROUTES.HSC_MATHS_TUTORING}#book`}
                  size="lg"
                  page="home"
                  placement="home_hero"
                  className="w-full sm:w-auto justify-center cta-button-shadow relative z-0"
                />
                <div className="flex items-center gap-4 px-6 py-4 bg-white/80 backdrop-blur-sm rounded-full border border-slate-100 shadow-sm">
                    <div className="flex -space-x-3">
                         {[
                           "https://res.cloudinary.com/dsvjhemjd/image/upload/f_auto,q_auto:good,c_fill,g_face,w_64,h_64,dpr_auto/ryze/images/tes5",
                           "https://res.cloudinary.com/dsvjhemjd/image/upload/f_auto,q_auto:good,c_fill,g_face,w_64,h_64,dpr_auto/ryze/images/tes6",
                           "https://res.cloudinary.com/dsvjhemjd/image/upload/f_auto,q_auto:good,c_fill,g_face,w_64,h_64,dpr_auto/ryze/images/tes7",
                           "https://res.cloudinary.com/dsvjhemjd/image/upload/f_auto,q_auto:good,c_fill,g_face,w_64,h_64,dpr_auto/ryze/images/tes8"
                         ].map((src, i) => (
                           <img
                             key={i}
                             src={src}
                             alt=""
                             aria-hidden="true"
                             width={32}
                             height={32}
                             loading="lazy"
                             decoding="async"
                             className="w-8 h-8 rounded-full border-2 border-white object-cover"
                           />
                         ))}
                    </div>
                    <div className="text-sm font-bold text-slate-700">
                        <span className="text-ryze">100%</span> {t("Client Satisfaction")}
                    </div>
                </div>
              </div>
            </motion.div>

            {/* Right Scrolling Content - Optimized with will-change */}
            <div className="relative grid h-[clamp(420px,72vh,800px)] grid-cols-2 gap-4 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)] md:gap-5">
               <ScrollingColumn
                 direction="up"
                 durationVar="var(--ryze-motion-vertical-scroll-slow)"
                 reducedMotion={reduceMotion}
               >
                  {/* OC & Selective Exam Preparation - Prioritize loading first image */}
                  <Card 
                    image={marketingCardImages.ocSelectiveExam} 
                    title={t("OC & Selective Exam Preparation")} 
                    tag="Primary" 
                    priority={true}
                    fetchPriority="high" 
                  />
                  
                  {/* Small Group Focus */}
                  <Card image={marketingCardImages.smallGroupFocus} title={t("Small Group Focus")} tag="Method" />
                  
                  {/* Personalised Support */}
                  <Card image={marketingCardImages.nswAccreditedTeachers} title={t("NSW Accredited Teachers")} tag="Experienced" />
               </ScrollingColumn>
               <ScrollingColumn
                 direction="down"
                 durationVar="var(--ryze-motion-vertical-scroll-fast)"
                 reducedMotion={reduceMotion}
               >
                  {/* HSC Excellence - Prioritize loading first image */}
                  <Card 
                    image={marketingCardImages.hscExcellence} 
                    title={t("HSC Excellence")} 
                    tag="Secondary" 
                    priority={true} 
                  />
                  
                  {/* Hybrid Learning */}
                  <Card image={marketingCardImages.hybridLearning} title={t("Hybrid Learning")} tag="Flexibility" />
                  
                  {/* Distinguished Teachers */}
                  <Card image={marketingCardImages.distinguishedMentors} title={t("Distinguished Mentors")} tag="Experts" />
               </ScrollingColumn>
            </div>
          </div>
        </div>
        </section>

    <section id="programs" className="ryze-section bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-3xl">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">Programs</h2>
          <p className="mt-3 text-slate-600">
            Start in the program that matches your exact goal. HSC Maths is our primary performance pathway.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {programs.map((program) => {
            const shouldHighlight = program.isPrimary && campaignParams.isHscOffer;
            const cardClass = shouldHighlight
              ? 'border-ryze bg-ryze-50 shadow-[0_12px_40px_-24px_rgba(255,176,0,0.9)]'
              : 'border-slate-200 bg-white';

            return (
              <article key={program.id} id={program.id} className={`ryze-card rounded-2xl border p-6 ${cardClass}`}>
                <p className="text-xs font-semibold uppercase tracking-wide text-ryze">
                  {program.isPrimary ? 'Primary Focus' : 'Program'}
                </p>
                <h3 className="mt-3 text-2xl font-bold text-slate-900">{program.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{program.blurb}</p>
                <a
                  href={program.href}
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-900 transition-colors hover:text-ryze"
                >
                  {program.ctaLabel} <ArrowRight size={16} aria-hidden="true" />
                </a>
              </article>
            );
          })}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          <article id="program-selective-details" className="ryze-card rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <h3 className="text-lg font-bold text-slate-900">Selective and OC Pathway</h3>
            <p className="mt-2 text-sm text-slate-600">
              Structured progression in reasoning, speed, and exam confidence for high-stakes selective outcomes.
            </p>
          </article>
          <article id="program-junior-details" className="ryze-card rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <h3 className="text-lg font-bold text-slate-900">Junior Foundations Pathway</h3>
            <p className="mt-2 text-sm text-slate-600">
              Build core numeracy, algebra, and problem-solving habits early to accelerate senior performance later.
            </p>
          </article>
        </div>
      </div>
    </section>

    <Suspense fallback={<div className="w-full h-[50vh] bg-slate-50" />}>
      <Testimonials />
    </Suspense>

{/* Team Preview */}
<section className="py-32 bg-slate-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,176,0,0.05),transparent_40%)]"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
             <div className="max-w-2xl">
                <h2 className="text-4xl lg:text-5xl font-sans font-bold text-slate-900 mb-4">{t("Meet Your Mentors")}</h2>
                <p className="text-lg text-slate-500">
                  {t("Our experienced educators are committed to helping every student thrive. Not just tutors, but qualified teachers and high-achievers.")}
                </p>
             </div>
             <motion.button 
                whileHover={{ scale: 1.05 }}
                onClick={() => navigate('/meet-the-team')} 
                className="text-ryze font-bold flex items-center gap-2 hover:gap-4 transition-all bg-white px-6 py-3 rounded-full shadow-sm hover:shadow-md"
             >
                {t("View All Team")} <ArrowRight size={20} />
             </motion.button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             {team.map((member, idx) => (
               <motion.button
               type="button"
               key={idx}
               className="group cursor-pointer bg-transparent border-0 p-0 text-left"
               onClick={() => navigate(`/meet-the-team#${member.id}`)}
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: idx * 0.1 }}
             >
              {member.scores && member.scores.length > 0 && (
                <div className="mb-6">
                  <div className="bg-white backdrop-blur-md rounded-xl p-3 border border-slate-100">
                    <h4 className="text-xl font-bold text-[#FFB000] mb-2 text-center uppercase tracking-wider">HSC Marks</h4>
                    <div className="flex flex-wrap justify-center gap-x-3 gap-y-1">
                      {member.scores.map((score, i) => (
                        <span key={i} className="text-sm font-semibold text-black/75">{score}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
               <div className="relative rounded-[2rem] overflow-hidden mb-6 shadow-md aspect-[3/4] bg-slate-200">
                 {member.atar && (
                   <div className="absolute top-2 left-2 md:top-4 md:left-4 z-20">
                     <div
                       style={{ willChange: 'transform' }}
                       className="bg-black/50 backdrop-blur-xl border border-[#ffb000]/75 shadow-2xl rounded-xl md:rounded-2xl transform transition-transform duration-300 ease-in-out md:hover:scale-110 md:hover:shadow-amber-400/50"
                     >
                       <div className="p-3 md:p-4 text-center text-white">
                         <div className="flex items-center justify-center gap-1 md:gap-2 mb-1">
                           <Star className="text-amber-300 w-5 h-5" fill="currentColor" />
                           <p className="text-xl md:text-2xl font-bold uppercase tracking-wider">ATAR</p>
                         </div>
                         <p className="text-xl md:text-2xl font-bold font-mono tracking-tight">{member.atar}</p>
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
                   className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                 <div className="absolute bottom-6 left-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-y-2 group-hover:translate-y-0">
                   <span className="bg-white/20 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full">{t("Read Bio")}</span>
                 </div>
               </div>
               <div className="pl-2">
                 <h3 className="text-2xl font-sans font-bold text-slate-900 mb-1 group-hover:text-ryze transition-colors">{member.name}</h3>
                 <p className="text-slate-700 text-sm font-medium mb-1.5">{t(member.role)}</p>
               </div>
             </motion.button>          
            ))}
          </div>
        </div>
      </section>

{/* Features Grid */}

      <section className="py-24 md:py-32 px-4 bg-white relative overflow-hidden transform-gpu">
        {/* Colorful Background Blobs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-[10%] left-[-10%] w-[500px] h-[500px] bg-blue-50/50 rounded-full blur-[100px] transform-gpu" style={{ willChange: 'transform' }}></div>
            <div className="absolute bottom-[10%] right-[-10%] w-[500px] h-[500px] bg-amber-50/50 rounded-full blur-[100px] transform-gpu" style={{ willChange: 'transform' }}></div>
        </div>

        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:40px_40px] opacity-30 pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20 max-w-3xl mx-auto">
            <h2 className="text-4xl lg:text-5xl font-sans font-bold text-slate-900 mb-6 tracking-tight">
              {t("What makes Ryze different?")}
            </h2>
            <p className="text-lg text-slate-500 font-normal">
                {t("We've stripped away the inefficiencies of traditional tuition to focus on what actually drives learning outcomes.")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 isolate">
            {features.map((feature, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: idx * 0.05 }}
                className={`bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 transition-transform transition-colors duration-300 group flex flex-col hover:-translate-y-2 feature-card-shadow ${feature.shadowClass} ${feature.borderClass}`}
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-colors duration-300 shadow-inner ${feature.colorClass}`}>
                  <feature.icon size={28} strokeWidth={2} />
                </div>
                <h3 className="text-xl font-bold font-sans text-slate-900 mb-3 leading-tight">{t(feature.title)}</h3>
                <p className="text-slate-500 text-sm leading-relaxed font-sans flex-grow">
                  {t(feature.desc)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-slate-50 to-transparent opacity-50 pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            
            <div>
               <div className="inline-block px-3 py-1 rounded-full bg-ryze/10 text-ryze text-xs font-bold uppercase tracking-widest mb-6 border border-ryze/20">{t("Our Philosophy")}</div>
               <h2 className="text-4xl lg:text-6xl font-sans font-bold text-slate-900 mb-8 leading-[1.1]">
                 {t("Education that")} <br/> <span className="relative inline-block text-ryze">{t("sees you.")}
                   <svg className="absolute w-full h-3 -bottom-1 left-0 text-ryze/30" viewBox="0 0 100 10" preserveAspectRatio="none"><path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none"/></svg>
                 </span>
               </h2>
               <p className="text-lg text-slate-600 mb-8 leading-relaxed font-normal">
                 {t("At Ryze, we believe learning happens in relationship, not in crowds. We have built everything around small classes and genuine mentorships because we know it works.")}
               </p>
              <PrimaryCTA
                variant="link"
                href={`${ROUTES.HSC_MATHS_TUTORING}#book`}
                size="lg"
                page="home"
                placement="home_philosophy"
                className="inline-flex"
              />
            </div>

            <div className="space-y-5">
              {benefits.map((benefit, idx) => (
                <motion.div 
                  key={idx} 
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ x: 5 }}
                  className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5 hover:border-ryze/50 hover:shadow-md transition-all"
                >
                  <div className="shrink-0 w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-600 border border-green-100">
                    <CheckCircle2 size={20} strokeWidth={2.5} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 font-sans">{t(benefit)}</h3>
                </motion.div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* CTA Section - Redesigned to Light/Brand Aesthetic */}
      <section className="py-24 px-4 bg-slate-50 relative">
        <div className="max-w-7xl mx-auto">
            <div className="relative rounded-[3rem] bg-gradient-to-br from-[#FFB000] to-orange-500 overflow-hidden shadow-2xl shadow-orange-500/20">
                {/* Background Pattern/Blobs */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white opacity-10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 transform-gpu" style={{ willChange: 'transform' }}></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-orange-600 opacity-20 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/3 transform-gpu" style={{ willChange: 'transform' }}></div>

                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center p-10 md:p-16 lg:p-20">
                    
                    {/* Left: Content */}
                    <div className="text-center lg:text-left space-y-8">
                        <h2 className="text-4xl md:text-6xl font-sans font-bold text-white leading-[1.1] tracking-tight">
                            {t("Ready to realise")} <br/> {t("your potential?")}
                        </h2>
                        <p className="text-lg md:text-xl text-white/90 font-medium max-w-lg mx-auto lg:mx-0 leading-relaxed">
                            {t("Join the students achieving their best with Ryze. Expert tutors, personalised attention, and proven results.")}
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                            <PrimaryCTA
                              variant="link"
                              href={`${ROUTES.HSC_MATHS_TUTORING}#book`}
                              size="lg"
                              page="home"
                              placement="home_bottom_cta"
                              className="bg-white text-orange-600 hover:bg-slate-50 hover:text-orange-700 shadow-xl"
                            />
                            <a 
                                href="tel:+61413885839"
                                onClick={handlePhoneClick}
                                className="px-8 py-4 bg-orange-600/20 text-white border border-white/30 font-bold rounded-full text-lg hover:bg-white/10 transition-all flex items-center justify-center gap-2 backdrop-blur-sm"
                            >
                                <Phone size={20} />
                                <span>{t("Give us a call now!")}</span>
                            </a>
                        </div>
                    </div>

                    {/* Right: Visual/Interaction */}
                    <div className="relative flex flex-col gap-6 items-center lg:items-end">
                        {/* Interactive floating cards */}
                        <motion.div 
                            initial={{ x: 20, opacity: 0 }}
                            whileInView={{ x: 0, opacity: 1 }}
                            viewport={{ once: true }}
                            className="bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-lg max-w-sm w-full transform rotate-2 lg:translate-x-8"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                                    <MessageCircle size={20} />
                                </div>
                                <div>
                                    <div className="font-bold text-slate-800">{t("Quick Question?")}</div>
                                    <div className="text-xs text-slate-500">
                                      {isAvailable ? t("Usually replies in 10 mins") : t("We'll reply during business hours")}
                                    </div>
                                </div>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-600 mb-3">
                                "Hi, I'm interested in Year 10 Maths for my son. Do you have spots?"
                            </div>
                            <div className="text-right text-xs font-bold text-orange-600 cursor-pointer hover:underline" onClick={() => navigate('/contact')}>{t("Send Message →")}</div>
                        </motion.div>

                        <motion.div 
                            initial={{ x: 20, opacity: 0 }}
                            whileInView={{ x: 0, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full -rotate-2 lg:-translate-x-4 relative z-10"
                        >
                            <div className="flex items-center gap-4">
                                <img 
                                    src="https://res.cloudinary.com/dsvjhemjd/image/upload/f_auto,q_auto:good,c_fill,g_face,w_120,h_120,dpr_auto/v1764105304/0739d6ceb5594812228108103c314c99_nd6cb5.jpg" 
                                    alt="Michael Yang"
                                    width={56}
                                    height={56}
                                    className="w-14 h-14 rounded-full object-cover border-2 border-orange-100"
                                />
                                <div>
                                    <div className="font-bold text-slate-900 text-lg">Michael Yang</div>
                                    <div className="text-sm text-slate-500">{t("Founder of Ryze Education")}</div>
                                    
                                    {isAvailable ? (
                                      <div className="flex items-center gap-1 mt-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full w-fit">
                                          <div className="w-1.5 h-1.5 bg-green-600 rounded-full animate-pulse"></div> {t("Available for call (9am-11pm)")}
                                      </div>
                                    ) : (
                                      <div className="flex flex-col mt-2">
                                         <div className="flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full w-fit mb-1">
                                            <Clock size={10} /> {t("Back at 9am SYD")}
                                         </div>
                                         <span className="text-[10px] text-slate-400 leading-tight">{t("Please drop a message, we'll reply during business hours.")}</span>
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
    </div>
  );
};

export default Home;

