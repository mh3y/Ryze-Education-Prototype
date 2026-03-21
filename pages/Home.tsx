import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
// @ts-ignore
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import PrimaryCTA from '../components/PrimaryCTA';
import usePrefersReducedMotion from '../src/hooks/usePrefersReducedMotion';
import { ROUTES } from '../src/constants/routes';
import { applySeo } from '../src/utils/seo';
import { responsiveCloudinaryImage } from '../src/utils/cloudinary';

const HomeDeferredSections = React.lazy(() => import('../components/home/HomeDeferredSections'));

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

type CardImageSource = {
  src: string;
  srcSet: string;
  sizes: string;
  width: number;
  height: number;
};

const HeroProofTile = ({
  image,
  title,
  tag,
  className = '',
  titleClassName = '',
  priority = false,
  fetchPriority = 'auto',
}: {
  image: CardImageSource;
  title: string;
  tag: string;
  className?: string;
  titleClassName?: string;
  priority?: boolean;
  fetchPriority?: 'high' | 'low' | 'auto';
}) => (
  <div className={`group relative overflow-hidden rounded-[1.4rem] border border-white/8 bg-[rgba(255,255,255,0.03)] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] ${className}`}>
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
      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
    />
    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,21,29,0.04)_0%,rgba(17,21,29,0.16)_38%,rgba(17,21,29,0.86)_100%)]"></div>
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.1),transparent_34%)] opacity-50"></div>
    <div className="absolute left-3 top-3">
      <span className="rounded-full border border-[rgba(184,132,30,0.45)] bg-[rgba(17,21,29,0.46)] px-2.5 py-1 text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-[var(--ryze-100)] backdrop-blur-md sm:text-[0.64rem]">
        {tag}
      </span>
    </div>
    <div className="absolute inset-x-0 bottom-0 p-4 sm:p-4.5">
      <h3 className={`max-w-[10ch] text-[1.18rem] font-semibold leading-[0.96] text-white sm:text-[1.34rem] ${titleClassName}`}>{title}</h3>
    </div>
  </div>
);

const ScrollingColumn = ({
  children,
  direction,
  durationVar,
  reducedMotion,
}: {
  children: React.ReactNode;
  direction: 'up' | 'down';
  durationVar: string;
  reducedMotion: boolean;
}) => {
  const content = <>{children}</>;

  return (
    <div className="ryze-vertical-marquee h-full overflow-hidden">
      <div
        className={`ryze-vertical-track ${direction === 'down' ? 'is-reverse' : ''}`}
        style={{ ['--ryze-column-duration' as string]: durationVar }}
      >
        {content}
        {!reducedMotion && content}
      </div>
    </div>
  );
};

const Home: React.FC = () => {
  const location = useLocation();
  const { t } = useLanguage();
  const reduceMotion = usePrefersReducedMotion();
  const deferredTriggerRef = useRef<HTMLDivElement | null>(null);
  const [shouldLoadDeferred, setShouldLoadDeferred] = useState(false);
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
      description:
        'Maths tutoring in Sydney for HSC Maths, Extension 1, and Extension 2, delivered through private tutoring and small-group classes with expert teaching and clear progress.',
      path: ROUTES.HOME,
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'EducationOrganization',
        name: 'Ryze Education',
        url: `${window.location.origin}${ROUTES.HOME}`,
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Sydney',
          addressRegion: 'NSW',
          addressCountry: 'AU',
        },
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
      if (timeoutId !== null) clearTimeout(timeoutId);
    };
  }, [shouldLoadDeferred]);

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
    ocSelectiveExam: buildMarketingCardImage(
      'https://res.cloudinary.com/dsvjhemjd/image/upload/f_auto,q_auto:good,c_fill,g_auto,w_720,h_960,dpr_auto/ryze/images/personalised',
    ),
    smallGroupFocus: buildMarketingCardImage(
      'https://res.cloudinary.com/dsvjhemjd/image/upload/f_auto,q_auto:good,c_fill,g_auto,w_720,h_960,dpr_auto/ryze/images/class4',
    ),
    nswAccreditedTeachers: buildMarketingCardImage(
      'https://res.cloudinary.com/dsvjhemjd/image/upload/f_auto,q_auto:good,c_fill,g_auto,w_720,h_960,dpr_auto/ryze/images/tutor2',
    ),
    hscExcellence: buildMarketingCardImage(
      'https://res.cloudinary.com/dsvjhemjd/image/upload/f_auto,q_auto:good,c_fill,g_auto,w_720,h_960,dpr_auto/ryze/images/image-v4',
    ),
    hybridLearning: buildMarketingCardImage(
      'https://res.cloudinary.com/dsvjhemjd/image/upload/f_auto,q_auto:good,c_fill,g_auto,w_720,h_960,dpr_auto/ryze/images/onlinev4',
    ),
    distinguishedMentors: buildMarketingCardImage(
      'https://res.cloudinary.com/dsvjhemjd/image/upload/f_auto,q_auto:good,c_fill,g_auto,w_720,h_960,dpr_auto/ryze/images/gordon',
    ),
  };

  return (
    <div className="w-full overflow-hidden bg-[var(--bg)] font-sans">
      <section className="ryze-shell-grid relative min-h-[100svh] overflow-hidden bg-[var(--primary)] pb-8 pt-20 md:pb-10 md:pt-24 lg:pb-10 lg:pt-24">
        <picture className="absolute inset-0">
          <img
            src={HOME_HERO_IMAGE_SRC}
            srcSet={HOME_HERO_IMAGE_SRC_SET}
            sizes="100vw"
            alt="HSC Maths tutoring in Sydney - Ryze Education"
            fetchPriority="high"
            loading="eager"
            decoding="async"
            className="h-full w-full object-cover object-[68%_center]"
          />
        </picture>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(17,21,29,0.92)_0%,rgba(17,21,29,0.84)_42%,rgba(17,21,29,0.62)_68%,rgba(17,21,29,0.74)_100%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_84%_78%,rgba(200,158,43,0.1),transparent_20%)]"></div>
        <div className="relative z-10 mx-auto flex min-h-[calc(100svh-7rem)] max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          <div className="grid w-full grid-cols-1 items-center gap-9 lg:grid-cols-[minmax(0,1fr)_minmax(395px,0.82fr)] lg:gap-12">
            <div className="max-w-[45rem] text-center lg:text-left">
              <div className="max-w-[40rem] space-y-4">
                <div className="eyebrow mx-auto !border-[1.5px] !border-[var(--color-ryze-500)] !bg-transparent !px-5 !py-3 !text-[var(--color-ryze-500)] !font-bold lg:mx-0">
                  <Sparkles size={14} className="text-[var(--color-ryze)]" />
                  <span>{t('Founded by NSW Teachers & Scholars')}</span>
                </div>
                <p className="text-[1rem] font-semibold uppercase tracking-[0.2em] text-white/74">Ryze Education</p>
                <h1 className="max-w-[11.5ch] text-[clamp(3.45rem,7.8vw,6.35rem)] font-semibold leading-[0.9] text-white">
                  {t('Specialist Maths Tuition')} <br />
                  <span className="mt-2 block whitespace-nowrap text-[0.76em] lowercase leading-[0.98] text-[var(--ryze-200)]">
                    {t('for students aiming higher')}
                  </span>
                </h1>
              </div>

              <div className="mt-10 grid max-w-[44rem] gap-4 border-t border-white/10 pt-6 text-left text-white/78 sm:grid-cols-3 lg:mt-12 lg:pt-7">
                <div className="border-l border-white/18 pl-4">
                  <p className="text-[0.86rem] uppercase tracking-[0.18em] text-white/54">Learning Format</p>
                  <p className="mt-2 text-[1.08rem] font-semibold leading-[1.4] text-white">Private tutoring and small-group classes</p>
                </div>
                <div className="border-l border-white/18 pl-4">
                  <p className="text-[0.86rem] uppercase tracking-[0.18em] text-white/54">Teaching Standard</p>
                  <p className="mt-2 text-[1.08rem] font-semibold leading-[1.4] text-white">Accredited teachers and exceptional mentors</p>
                </div>
                <div className="border-l border-white/18 pl-4">
                  <p className="text-[0.86rem] uppercase tracking-[0.18em] text-white/54">Parent Confidence</p>
                  <p className="mt-2 text-[1.08rem] font-semibold leading-[1.4] text-white">Structured progress, calm accountability, direct communication</p>
                </div>
              </div>

              <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row lg:mt-10 lg:justify-start">
                <PrimaryCTA
                  variant="link"
                  href={ROUTES.CONTACT}
                  size="lg"
                  label="Book a Consultation"
                  page="home"
                  placement="home_hero"
                  className="w-full justify-center whitespace-nowrap !border-[var(--color-ryze-500)] !bg-[var(--color-ryze-500)] !text-white !font-bold hover:!bg-[var(--color-ryze-400)] hover:!border-[var(--color-ryze-400)] hover:!text-white sm:min-w-[244px] sm:w-auto"
                />
                <a href="#programs" className="inline-flex items-center gap-2 text-[1rem] font-semibold uppercase tracking-[0.06em] text-white/82 transition-colors hover:text-white">
                  Explore programs
                  <ArrowRight size={16} />
                </a>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[32rem] lg:ml-auto lg:w-[27rem] lg:max-w-none lg:justify-self-end">
              <div className="pointer-events-none absolute inset-x-[16%] top-[8%] h-24 rounded-full bg-[rgba(184,132,30,0.15)] blur-3xl"></div>
              <div className="relative rounded-[1.85rem] border border-white/10 bg-[linear-gradient(180deg,rgba(28,32,40,0.82)_0%,rgba(17,21,29,0.72)_100%)] p-3.5 shadow-[0_38px_90px_-54px_rgba(0,0,0,0.82)] backdrop-blur-2xl sm:p-4.5 lg:p-5">
                <div className="pointer-events-none absolute inset-x-5 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.12),transparent)]"></div>
                <div className="grid h-[292px] grid-cols-2 gap-3 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_8%,black_92%,transparent)] sm:h-[364px] sm:gap-3 lg:h-[45svh] lg:min-h-[408px] lg:max-h-[480px]">
                  <ScrollingColumn direction="up" durationVar="var(--ryze-motion-vertical-scroll-slow)" reducedMotion={reduceMotion}>
                    <HeroProofTile
                      image={marketingCardImages.nswAccreditedTeachers}
                      title={t('Accredited Teachers')}
                      tag="Faculty"
                      className="aspect-[0.88] min-h-[10.5rem] sm:min-h-[12.2rem]"
                    />
                    <HeroProofTile
                      image={marketingCardImages.ocSelectiveExam}
                      title={t('OC & Selective')}
                      tag="Primary"
                      className="aspect-[0.88] min-h-[10.5rem] sm:min-h-[12.2rem]"
                      titleClassName="max-w-[8ch] text-[1.04rem] sm:text-[1.18rem]"
                      priority
                      fetchPriority="high"
                    />
                    <HeroProofTile
                      image={marketingCardImages.smallGroupFocus}
                      title={t('Small Group Focus')}
                      tag="Method"
                      className="aspect-[0.88] min-h-[10.5rem] sm:min-h-[12.2rem]"
                      titleClassName="max-w-[8ch] text-[1.04rem] sm:text-[1.18rem]"
                    />
                  </ScrollingColumn>
                  <ScrollingColumn direction="down" durationVar="var(--ryze-motion-vertical-scroll-fast)" reducedMotion={reduceMotion}>
                    <HeroProofTile
                      image={marketingCardImages.distinguishedMentors}
                      title={t('Mentor Support')}
                      tag="Experts"
                      className="aspect-[0.88] min-h-[10.5rem] sm:min-h-[12.2rem]"
                      titleClassName="max-w-[8ch] text-[1.04rem] sm:text-[1.18rem]"
                    />
                    <HeroProofTile
                      image={marketingCardImages.hscExcellence}
                      title={t('HSC Excellence')}
                      tag="Senior"
                      className="aspect-[0.88] min-h-[10.5rem] sm:min-h-[12.2rem]"
                      titleClassName="max-w-[8ch] text-[1.04rem] sm:text-[1.18rem]"
                      priority
                    />
                    <HeroProofTile
                      image={marketingCardImages.hybridLearning}
                      title={t('Hybrid Learning')}
                      tag="Flexibility"
                      className="aspect-[0.88] min-h-[10.5rem] sm:min-h-[12.2rem]"
                      titleClassName="max-w-[8ch] text-[1.04rem] sm:text-[1.18rem]"
                    />
                  </ScrollingColumn>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div ref={deferredTriggerRef} className="h-px w-full" aria-hidden="true" />
      {shouldLoadDeferred && (
        <Suspense fallback={<div className="h-[120vh] w-full bg-[var(--bg)]" />}>
          <HomeDeferredSections />
        </Suspense>
      )}
    </div>
  );
};

export default Home;
