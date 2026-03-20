import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
const HomeDeferredSections = React.lazy(() => import('../components/home/HomeDeferredSections'));
import { Sparkles } from 'lucide-react';
// @ts-ignore
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import PrimaryCTA from '../components/PrimaryCTA';
import { ROUTES } from '../src/constants/routes';
import { applySeo } from '../src/utils/seo';
import { responsiveCloudinaryImage } from '../src/utils/cloudinary';

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

const ScrollingColumn = ({
  children,
  direction = 'up',
  durationVar = 'var(--ryze-motion-vertical-scroll-slow)',
  reducedMotion = false,
}: React.PropsWithChildren<{
  direction?: 'up' | 'down';
  durationVar?: string;
  reducedMotion?: boolean;
}>) => (
  <div className="ryze-vertical-marquee transform-gpu">
    <div
      className={`ryze-vertical-track ${direction === 'down' ? 'is-reverse' : ''}`}
      style={{ '--ryze-column-duration': durationVar, backfaceVisibility: 'hidden' } as React.CSSProperties}
    >
      {children}
      {!reducedMotion && children}
    </div>
  </div>
);

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
  <div className="group relative aspect-[3/4] w-full overflow-hidden rounded-[1.5rem] border border-slate-100 shadow-lg transform-gpu sm:rounded-3xl">
    <img
      src={image.src}
      srcSet={image.srcSet}
      sizes={image.sizes}
      width={image.width}
      height={image.height}
      alt={title}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={fetchPriority}
      decoding="async"
      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-90"></div>
    <div className="absolute left-3 top-3 sm:left-4 sm:top-4">
      <span className="rounded-full border border-white/80 bg-[#FFB000] px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wide text-white backdrop-blur-md sm:px-3 sm:text-xs">{tag}</span>
    </div>
    <div className="absolute bottom-0 left-0 translate-y-2 p-4 transition-transform duration-300 group-hover:translate-y-0 sm:p-6">
      <h3 className="mb-2 text-base font-bold leading-tight text-white sm:text-xl">{title}</h3>
      <div className="h-1 w-12 rounded-full bg-ryze opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
    </div>
  </div>
);

const Home: React.FC = () => {
  const location = useLocation();
  const { t } = useLanguage();
  const deferredTriggerRef = useRef<HTMLDivElement | null>(null);
  const [shouldLoadDeferred, setShouldLoadDeferred] = useState(false);
  const reduceMotion = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  );

  const campaignParams = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const offer = (params.get('offer') || '').toLowerCase();
    const utmCampaign = (params.get('utm_campaign') || '').toLowerCase();
    return {
      isHscOffer:
        offer.includes('hsc') ||
        utmCampaign.includes('hsc') ||
        utmCampaign.includes('advanced') ||
        utmCampaign.includes('ext1') ||
        utmCampaign.includes('ext2'),
    };
  }, [location.search]);

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    let disposePerfDebug: undefined | (() => void);
    void import('../src/utils/perfDebug').then(({ initPerfDebug }) => {
      disposePerfDebug = initPerfDebug('home');
    });
    return () => disposePerfDebug?.();
  }, []);

  useEffect(() => {
    applySeo({
      title: 'Ryze Education | HSC Maths Tutor Sydney | Extension 2 Expert',
      description: 'Premium small-group tutoring in Sydney for HSC Maths, Extension 1, and Extension 2. Expert mentoring with measurable progress.',
      path: ROUTES.HOME,
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'EducationOrganization',
        name: 'Ryze Education',
        url: `${window.location.origin}${ROUTES.HOME}`,
        address: { '@type': 'PostalAddress', addressLocality: 'Sydney', addressRegion: 'NSW', addressCountry: 'AU' },
      },
    });
  }, []);

  useEffect(() => {
    void import('../src/styles/custom-hovers.css');
  }, []);

  useEffect(() => {
    if (shouldLoadDeferred || typeof window === 'undefined') return;

    let idleId: number | null = null;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    const triggerLoad = () => setShouldLoadDeferred(true);

    const observer =
      'IntersectionObserver' in window
        ? new IntersectionObserver(
            (entries) => {
              if (entries.some((entry) => entry.isIntersecting)) {
                triggerLoad();
              }
            },
            { rootMargin: '600px 0px' },
          )
        : null;

    if (deferredTriggerRef.current && observer) {
      observer.observe(deferredTriggerRef.current);
    }

    if ('requestIdleCallback' in window) {
      idleId = (window as any).requestIdleCallback(triggerLoad, { timeout: 2500 });
    } else {
      timeoutId = setTimeout(triggerLoad, 1800);
    }

    return () => {
      observer?.disconnect();
      if (idleId !== null && 'cancelIdleCallback' in window) {
        (window as any).cancelIdleCallback(idleId);
      }
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
    };
  }, [shouldLoadDeferred]);

  const heroSubheading = campaignParams.isHscOffer
    ? 'HSC Maths Advanced and Extension tutoring built for high marks, clean exam technique, and real confidence.'
    : t('Think Sharper. Perform Better.');

  const marketingCardSizes = '(max-width: 640px) 42vw, (max-width: 1024px) 42vw, 312px';
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

  return (
    <div className="w-full overflow-hidden bg-slate-50 font-sans">
      <section className="relative overflow-hidden bg-slate-900 pb-16 pt-28 md:rounded-b-[3rem] md:pb-20 md:pt-32 lg:rounded-b-[5rem] lg:pb-32 lg:pt-48">
        <picture className="absolute inset-0">
          <img src={HOME_HERO_IMAGE_SRC} srcSet={HOME_HERO_IMAGE_SRC_SET} sizes="100vw" alt="HSC Maths tutoring in Sydney - Ryze Education" fetchPriority="high" loading="eager" decoding="async" className="h-full w-full object-cover" />
        </picture>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
            <div className="space-y-8 text-center lg:text-left">
              <div className="space-y-4">
                <div className="mx-auto mb-2 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold tracking-wide text-white shadow-sm lg:mx-0">
                  <Sparkles size={14} className="text-ryze" />
                  <span>{t('FOUNDED BY ACCREDITED TEACHERS AND ACADEMIC SCHOLARS')}</span>
                </div>
                <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-8xl">
                  {t('Teaching with')} <span className="bg-gradient-to-r from-ryze to-orange-500 bg-clip-text text-transparent">{t('purpose.')}</span> <br />
                  {t('Learning with')} <span className="text-white">{t('clarity.')}</span>
                </h1>
                <p className="text-base font-medium leading-tight tracking-wide text-white sm:text-lg lg:text-2xl">{heroSubheading}</p>
                {campaignParams.isHscOffer && <p className="inline-flex items-center gap-2 rounded-full border border-ryze/40 bg-ryze/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-ryze-100">Message match active: HSC Maths Advanced and Extension</p>}
              </div>
              <p className="mx-auto max-w-lg text-base leading-relaxed text-white sm:text-lg lg:mx-0">{t('Get the individual attention you deserve in our private and focused small group classes. Experienced tutors, personalised programs, and real results.')}</p>
              <div className="flex flex-col items-center gap-6 pt-4 sm:flex-row lg:justify-start">
                <PrimaryCTA variant="link" href={ROUTES.CONTACT} size="md" label="Enrol Now" page="home" placement="home_hero" className="relative z-0 w-full justify-center whitespace-nowrap !border !border-white/75 !bg-gradient-to-r !from-[#FFB000] !to-[#FF7A00] !py-0 !text-lg !font-bold !text-white hover:!from-[#FFC133] hover:!to-[#FF8C1A] sm:h-16 sm:min-w-[220px] sm:w-auto" />
                <div className="flex min-h-[3.75rem] items-center gap-3 rounded-full border border-white/70 bg-white/18 px-4 py-2 shadow-[0_12px_30px_-22px_rgba(15,23,42,0.45)] backdrop-blur-md sm:min-h-16 sm:gap-4 sm:px-5">
                  <div className="flex shrink-0 -space-x-2.5 sm:-space-x-3">
                    {['tes5', 'tes6', 'tes7', 'tes8'].map((name, i) => (
                      <img key={i} src={`https://res.cloudinary.com/dsvjhemjd/image/upload/f_auto,q_auto:good,c_fill,g_face,w_64,h_64,dpr_auto/ryze/images/${name}`} alt="" aria-hidden="true" width={32} height={32} loading="lazy" decoding="async" className="h-8 w-8 rounded-full border-2 border-white object-cover shadow-sm sm:h-9 sm:w-9" />
                    ))}
                  </div>
                  <div className="min-w-0 border-l border-white/45 pl-3 sm:pl-4">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-[0.9rem] font-extrabold leading-none tracking-tight text-ryze sm:text-base">100%</span>
                      <span className="text-[0.9rem] font-extrabold leading-none tracking-tight text-white/75 sm:text-base">RATED</span>
                    </div>
                    <span className="mt-0.5 block text-[0.8rem] font-bold leading-tight text-white sm:text-[0.85rem]">{t('Client Satisfaction')}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative grid h-[260px] grid-cols-2 gap-3 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_8%,black_92%,transparent)] sm:h-[320px] md:h-[clamp(420px,72vh,800px)] md:gap-5">
              <ScrollingColumn direction="up" durationVar="var(--ryze-motion-vertical-scroll-slow)" reducedMotion={reduceMotion}>
                <Card image={marketingCardImages.ocSelectiveExam} title={t('OC & Selective Exam Preparation')} tag="Primary" priority fetchPriority="high" />
                <Card image={marketingCardImages.smallGroupFocus} title={t('Small Group Focus')} tag="Method" />
                <Card image={marketingCardImages.nswAccreditedTeachers} title={t('NSW Accredited Teachers')} tag="Experienced" />
              </ScrollingColumn>
              <ScrollingColumn direction="down" durationVar="var(--ryze-motion-vertical-scroll-fast)" reducedMotion={reduceMotion}>
                <Card image={marketingCardImages.hscExcellence} title={t('HSC Excellence')} tag="Secondary" priority />
                <Card image={marketingCardImages.hybridLearning} title={t('Hybrid Learning')} tag="Flexibility" />
                <Card image={marketingCardImages.distinguishedMentors} title={t('Distinguished Mentors')} tag="Experts" />
              </ScrollingColumn>
            </div>
          </div>
        </div>
      </section>

      <div ref={deferredTriggerRef} className="h-px w-full" aria-hidden="true" />
      {shouldLoadDeferred && (
        <Suspense fallback={<div className="h-[120vh] w-full bg-slate-50" />}>
          <HomeDeferredSections />
        </Suspense>
      )}
    </div>
  );
};

export default Home;
