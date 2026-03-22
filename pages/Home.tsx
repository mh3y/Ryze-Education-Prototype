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
import { schoolLogos } from '../data/schoolLogos';

const HomeDeferredSections = React.lazy(() => import('../components/home/HomeDeferredSections'));

const HOME_HERO_IMAGE_BASE =
  'https://res.cloudinary.com/dsvjhemjd/image/upload/f_auto,q_auto,c_fill,g_auto';
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
  <div className={`group relative overflow-hidden rounded-[1.6rem] border border-white/10 bg-[rgba(255,255,255,0.03)] shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_15px_35px_-10px_rgba(0,0,0,0.6)] ${className}`}>
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
      className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
    />
    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,21,29,0)_0%,rgba(17,21,29,0.3)_40%,rgba(17,21,29,0.95)_100%)]"></div>
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.1),transparent_40%)] opacity-50"></div>
    <div className="absolute left-4 top-4">
      <span className="rounded-full border border-white/20 bg-[rgba(17,21,29,0.92)] px-3 py-1.5 text-[0.62rem] font-bold uppercase tracking-[0.25em] text-white shadow-xl backdrop-blur-md">
        {tag}
      </span>
    </div>
    <div className="absolute inset-x-0 bottom-0 p-6">
      <h3 className={`font-display font-semibold leading-[1.1] ryze-text-inverse drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] text-[1.3rem] sm:text-[1.5rem] ${titleClassName}`}>{title}</h3>
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
      'https://res.cloudinary.com/dsvjhemjd/image/upload/f_auto,q_auto:good,c_fill,g_auto,w_720,h_960/ryze/images/personalised',
    ),
    smallGroupFocus: buildMarketingCardImage(
      'https://res.cloudinary.com/dsvjhemjd/image/upload/f_auto,q_auto:good,c_fill,g_auto,w_720,h_960/ryze/images/class4',
    ),
    nswAccreditedTeachers: buildMarketingCardImage(
      'https://res.cloudinary.com/dsvjhemjd/image/upload/f_auto,q_auto:good,c_fill,g_auto,w_720,h_960/ryze/images/tutor2',
    ),
    hscExcellence: buildMarketingCardImage(
      'https://res.cloudinary.com/dsvjhemjd/image/upload/f_auto,q_auto:good,c_fill,g_auto,w_720,h_960/ryze/images/image-v4',
    ),
    hybridLearning: buildMarketingCardImage(
      'https://res.cloudinary.com/dsvjhemjd/image/upload/f_auto,q_auto:good,c_fill,g_auto,w_720,h_960/ryze/images/onlinev4',
    ),
    distinguishedMentors: buildMarketingCardImage(
      'https://res.cloudinary.com/dsvjhemjd/image/upload/f_auto,q_auto:good,c_fill,g_auto,w_720,h_960/ryze/images/gordon',
    ),
  };

  return (
    <div className="w-full overflow-hidden bg-[var(--ryze-surface-dark)] font-sans md:ryze-bg-primary">
      <section className="ryze-shell-grid relative min-h-[100svh] overflow-hidden ryze-bg-surface-dark pb-10 pt-[calc(5.75rem+env(safe-area-inset-top))] md:pb-14 md:pt-[calc(6.25rem+env(safe-area-inset-top))] lg:pb-16 lg:pt-[calc(6.5rem+env(safe-area-inset-top))]">
        <picture className="absolute inset-0">
          <img
            src={HOME_HERO_IMAGE_SRC}
            srcSet={HOME_HERO_IMAGE_SRC_SET}
            sizes="100vw"
            alt="Specialist maths programs in Sydney - Ryze Education"
            fetchPriority="high"
            loading="eager"
            decoding="async"
            className="h-full w-full scale-[1.05] object-cover object-center blur-[5px] sm:scale-100 sm:object-[52%_28%] sm:blur-0 lg:object-[62%_center] xl:object-[68%_center]"
          />
        </picture>
        <div className="absolute inset-0 bg-[linear-gradient(92deg,rgba(17,21,29,0.78)_0%,rgba(17,21,29,0.72)_34%,rgba(17,21,29,0.46)_62%,rgba(17,21,29,0.62)_100%)] sm:bg-[linear-gradient(92deg,rgba(17,21,29,0.96)_0%,rgba(17,21,29,0.88)_34%,rgba(17,21,29,0.62)_62%,rgba(17,21,29,0.78)_100%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_84%_78%,rgba(200,158,43,0.12),transparent_20%)]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,21,29,0.12)_0%,rgba(17,21,29,0)_28%,rgba(17,21,29,0.16)_100%)]"></div>
        <div className="relative z-10 mx-auto flex min-h-[calc(100svh-6.75rem)] max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          <div className="grid w-full grid-cols-1 items-center gap-12 py-6 sm:py-10 lg:grid-cols-[minmax(0,1.04fr)_minmax(320px,0.74fr)] lg:gap-14 lg:py-8 xl:gap-18">
            <div className="max-w-[44rem] text-center lg:text-left">
              <div className="mx-auto max-w-[40rem] lg:mx-0">
                <div className="eyebrow !border-[1.5px] !border-[var(--color-ryze-500)] !bg-transparent !px-5 !py-3 !text-[var(--color-ryze-500)] !font-bold">
                  <Sparkles size={14} className="text-[var(--color-ryze)]" />
                  <span>{t('Founded by NSW Teachers & Scholars')}</span>
                </div>
                <div className="mt-6 sm:mt-8">
                  <h1 className="font-display text-[clamp(3.9rem,9vw,7.25rem)] font-semibold leading-[0.84] tracking-[-0.05em] ryze-text-inverse">
                    <span className="block whitespace-nowrap">{t('Specialist Maths')}</span>
                    <span className="mt-1 block">{t('Tuition')}</span>
                  </h1>
                  <div className="mt-5 sm:mt-6">
                    <span className="block text-[clamp(1.6rem,4.5vw,3.15rem)] font-display italic leading-[1.04] tracking-[-0.03em] ryze-text-inverse">
                      {t('for students aiming higher')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-10 grid max-w-[48rem] gap-x-8 gap-y-8 border-t border-white/10 pt-8 text-left sm:grid-cols-3 lg:mt-12 lg:gap-x-10 lg:pt-10">
                <div className="relative pl-6">
                  <div className="absolute left-0 top-1.5 h-[calc(100%-12px)] w-[2px] bg-white/10">
                    <div className="absolute -left-1 top-0 h-2.5 w-2.5 rounded-full bg-[var(--color-ryze-500)] shadow-[0_0_12px_rgba(184,132,30,0.8)]"></div>
                  </div>
                  <p className="text-[0.75rem] font-bold uppercase tracking-[0.3em] text-[var(--color-ryze-500)]">Format</p>
                  <p className="mt-2 text-[1.05rem] font-semibold leading-[1.4] ryze-text-inverse opacity-95">Private & small-group classes</p>
                </div>
                <div className="relative pl-6">
                  <div className="absolute left-0 top-1.5 h-[calc(100%-12px)] w-[2px] bg-white/10">
                    <div className="absolute -left-1 top-0 h-2.5 w-2.5 rounded-full bg-[var(--color-ryze-500)] shadow-[0_0_12px_rgba(184,132,30,0.8)]"></div>
                  </div>
                  <p className="text-[0.75rem] font-bold uppercase tracking-[0.3em] text-[var(--color-ryze-500)]">Teaching</p>
                  <p className="mt-2 text-[1.05rem] font-semibold leading-[1.4] ryze-text-inverse opacity-95">Accredited teachers & scholars</p>
                </div>
                <div className="relative pl-6">
                  <div className="absolute left-0 top-1.5 h-[calc(100%-12px)] w-[2px] bg-white/10">
                    <div className="absolute -left-1 top-0 h-2.5 w-2.5 rounded-full bg-[var(--color-ryze-500)] shadow-[0_0_12px_rgba(184,132,30,0.8)]"></div>
                  </div>
                  <p className="text-[0.75rem] font-bold uppercase tracking-[0.3em] text-[var(--color-ryze-500)]">Progress</p>
                  <p className="mt-2 text-[1.05rem] font-semibold leading-[1.4] ryze-text-inverse opacity-95">Structured growth & accountability</p>
                </div>
              </div>

              <div className="mt-10 flex flex-col items-center gap-5 sm:flex-row lg:mt-12 lg:justify-start">
                <PrimaryCTA
                  variant="link"
                  href={ROUTES.CONTACT}
                  size="lg"
                  label="Book a Consultation"
                  page="home"
                  placement="home_hero"
                  className="w-full sm:min-w-[244px] sm:w-auto"
                />
                <a href="#programs" className="inline-flex items-center gap-2 text-[0.98rem] font-semibold uppercase tracking-[0.1em] ryze-text-inverse-muted transition-colors hover:ryze-text-inverse">
                  Explore programs
                  <ArrowRight size={16} />
                </a>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[22rem] sm:max-w-[26rem] lg:ml-auto lg:w-[24rem] lg:max-w-none lg:justify-self-end xl:w-[25.5rem]">
              <div className="pointer-events-none absolute inset-x-[16%] top-[8%] h-40 rounded-full bg-[rgba(184,132,30,0.18)] blur-3xl"></div>
              <div className="relative rounded-[2.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(28,32,40,0.9)_0%,rgba(17,21,29,0.78)_100%)] p-4 shadow-[0_55px_110px_-42px_rgba(0,0,0,0.92)] backdrop-blur-3xl sm:p-5 lg:p-6">
                <div className="pointer-events-none absolute inset-x-5 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)]"></div>
                <div className="grid h-[400px] grid-cols-2 gap-4 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_8%,black_92%,transparent)] sm:h-[480px] sm:gap-5 lg:h-[62svh] lg:min-h-[560px] lg:max-h-[690px]">
                  <ScrollingColumn direction="up" durationVar="var(--ryze-motion-vertical-scroll-slow)" reducedMotion={reduceMotion}>
                    <HeroProofTile
                      image={marketingCardImages.nswAccreditedTeachers}
                      title={t('Accredited Teachers')}
                      tag="Faculty"
                      className="aspect-[0.92] min-h-[14rem]"
                    />
                    <HeroProofTile
                      image={marketingCardImages.ocSelectiveExam}
                      title={t('OC & Selective')}
                      tag="Primary"
                      className="aspect-[0.92] min-h-[14rem]"
                      titleClassName="max-w-[10ch]"
                      priority
                      fetchPriority="high"
                    />
                    <HeroProofTile
                      image={marketingCardImages.smallGroupFocus}
                      title={t('Small Group Focus')}
                      tag="Method"
                      className="aspect-[0.92] min-h-[14rem]"
                      titleClassName="max-w-[10ch]"
                    />
                  </ScrollingColumn>
                  <ScrollingColumn direction="down" durationVar="var(--ryze-motion-vertical-scroll-fast)" reducedMotion={reduceMotion}>
                    <HeroProofTile
                      image={marketingCardImages.distinguishedMentors}
                      title={t('Mentor Support')}
                      tag="Experts"
                      className="aspect-[0.92] min-h-[14rem]"
                      titleClassName="max-w-[10ch]"
                    />
                    <HeroProofTile
                      image={marketingCardImages.hscExcellence}
                      title={t('HSC Excellence')}
                      tag="Senior"
                      className="aspect-[0.92] min-h-[14rem]"
                      titleClassName="max-w-[10ch]"
                      priority
                    />
                    <HeroProofTile
                      image={marketingCardImages.hybridLearning}
                      title={t('Hybrid Learning')}
                      tag="Flexibility"
                      className="aspect-[0.92] min-h-[14rem]"
                      titleClassName="max-w-[10ch]"
                    />
                  </ScrollingColumn>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full ryze-bg-primary py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="mb-10 text-center text-sm font-bold tracking-widest ryze-text-secondary uppercase">
            TRUSTED BY STUDENTS FROM AUSTRALIA'S TOP INSTITUTIONS
          </p>
          <div className="relative w-full overflow-hidden group">
            <div className="logo-marquee-track">
              {(reduceMotion ? schoolLogos : [...schoolLogos, ...schoolLogos]).map((logo, idx) => (
                <div
                  key={`${logo.alt}-${idx}`}
                  className="flex h-16 w-24 shrink-0 items-center justify-center sm:h-20 sm:w-32 md:h-24 md:w-40"
                >
                  <img
                    src={logo.src}
                    alt={logo.alt}
                    loading="lazy"
                    decoding="async"
                    className="max-h-full max-w-full object-contain opacity-50 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0"
                    aria-hidden={!reduceMotion && idx >= schoolLogos.length}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div ref={deferredTriggerRef} className="h-px w-full" aria-hidden="true" />
      {shouldLoadDeferred && (
        <Suspense fallback={<div className="h-[120vh] w-full ryze-bg-primary" />}>
          <HomeDeferredSections />
        </Suspense>
      )}
    </div>
  );
};

export default Home;
