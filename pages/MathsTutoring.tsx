import React, { useState, useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import { trackPhoneClick } from '../src/lib/tracking';
import { applySeo } from '../src/utils/seo';
import { ROUTES } from '../src/constants/routes';
import { responsiveCloudinaryImage } from '../src/utils/cloudinary';

// Section components
import SalesBanner from '../components/maths-tutoring/SalesBanner';
import HeroSection from '../components/maths-tutoring/HeroSection';
import StatsSection from '../components/maths-tutoring/StatsSection';
import TeamPreview from '../components/maths-tutoring/TeamPreview';
import HowItWorks from '../components/maths-tutoring/HowItWorks';
import ContactSection from '../components/maths-tutoring/ContactSection';
import FAQSection from '../components/maths-tutoring/FAQSection';

// Deferred-loaded components
const Footer = React.lazy(() => import('../components/Footer'));
const Testimonials = React.lazy(() => import('../components/Testimonials'));

const contactBackgroundImage = responsiveCloudinaryImage(
  'https://res.cloudinary.com/dsvjhemjd/image/upload/f_auto,q_auto:good,c_fill,g_auto,w_1440/ryze/images/home-background-overlayv2',
  {
    widths: [640, 960, 1280, 1440],
    aspectRatio: [16, 10],
    sizes: '100vw',
    crop: 'fill',
    gravity: 'auto',
    quality: 'auto:good',
  },
);

const MathsTutoring: React.FC = () => {
  // ── Page-level state ───────────────────────────────────────────────────────

  const [isMobileViewport, setIsMobileViewport] = useState(true);
  const [shouldLoadDeferred, setShouldLoadDeferred] = useState(false);
  const deferredTriggerRef = useRef<HTMLDivElement | null>(null);
  const reduce = useReducedMotion();

  // ── Callbacks ──────────────────────────────────────────────────────────────

  const handlePhoneClick = () => trackPhoneClick('maths_tutoring', 'sales_banner');

  const scrollToResults = () => {
    const resultsSection = document.getElementById('real-results-section');
    if (resultsSection) {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      resultsSection.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
    }
  };

  // ── SEO meta ───────────────────────────────────────────────────────────────

  useEffect(() => {
    applySeo({
      title: 'Ryze Education | Maths Tutoring Sydney',
      description:
        'Specialist maths tuition in Sydney, delivered through private tutoring and small-group classes from primary foundations through to senior mathematics.',
      path: ROUTES.MATHS_TUTORING,
      ogTitle: 'Ryze Education | Maths Tutoring Sydney',
      ogDescription:
        'Private and small-group maths tutoring in Sydney across primary, selective, and senior maths pathways.',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'EducationalOrganization',
        name: 'Ryze Education',
        areaServed: 'Sydney',
        url: `${window.location.origin}${ROUTES.MATHS_TUTORING}`,
      },
    });
  }, []);

  // ── Responsive background image ──────────────────────────────────────────

  // ── Mobile viewport detection ────────────────────────────────────────────

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 768px)');
    const updateViewport = () => setIsMobileViewport(!mediaQuery.matches);
    updateViewport();
    mediaQuery.addEventListener('change', updateViewport);
    return () => mediaQuery.removeEventListener('change', updateViewport);
  }, []);

  // ── Performance debug (dev only) ─────────────────────────────────────────

  useEffect(() => {
    if (!import.meta.env.PROD) return;
    if (new URLSearchParams(window.location.search).get('debug') !== 'perf') return;
    if (!('PerformanceObserver' in window)) return;

    let lastLcp: any = null;
    const observer = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      lastLcp = entries[entries.length - 1];
    });

    try {
      observer.observe({ type: 'largest-contentful-paint', buffered: true } as PerformanceObserverInit);
    } catch {
      return;
    }

    const logLcp = () => {
      if (!lastLcp) return;
      const element = (lastLcp as any).element as HTMLElement | null;
      const imageElement = element as HTMLImageElement | null;
      const lcpUrl = (lastLcp as any).url || imageElement?.currentSrc || imageElement?.src || '';

      console.info('[perf-debug] largest-contentful-paint', {
        startTimeMs: Math.round(lastLcp.startTime),
        renderTimeMs: Math.round((lastLcp as any).renderTime || 0),
        loadTimeMs: Math.round((lastLcp as any).loadTime || 0),
        size: Math.round((lastLcp as any).size || 0),
        elementTag: element?.tagName || 'unknown',
        elementClass: element?.className || '',
        url: lcpUrl,
        textSample: element?.textContent?.trim().slice(0, 120) || '',
      });
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        logLcp();
        observer.disconnect();
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('pagehide', logLcp, { once: true });

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  // ── Deferred loading ─────────────────────────────────────────────────────

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
            { rootMargin: '700px 0px' },
          )
        : null;

    if (deferredTriggerRef.current && observer) {
      observer.observe(deferredTriggerRef.current);
    }

    if ('requestIdleCallback' in window) {
      idleId = (window as any).requestIdleCallback(triggerLoad, { timeout: 2200 });
    } else {
      timeoutId = setTimeout(triggerLoad, 1600);
    }

    return () => {
      observer?.disconnect();
      if (idleId !== null && 'cancelIdleCallback' in window) {
        (window as any).cancelIdleCallback(idleId);
      }
      if (timeoutId !== null) clearTimeout(timeoutId);
    };
  }, [shouldLoadDeferred]);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="bg-[#0D0D0D] ryze-text-inverse font-sans overflow-x-hidden">
      <SalesBanner onPhoneClick={handlePhoneClick} />

      <HeroSection
        onScrollToCta={scrollToResults}
        isMobileViewport={isMobileViewport}
        reduceMotion={reduce}
      />

      <StatsSection />

      <TeamPreview isMobileViewport={isMobileViewport} />

      <div ref={deferredTriggerRef} className="h-px w-full bg-[#0D0D0D]" aria-hidden="true" />

      {shouldLoadDeferred && (
        <React.Suspense fallback={<div className="h-[60vh] w-full ryze-bg-primary" />}>
          <Testimonials />
        </React.Suspense>
      )}

      <HowItWorks />

      <ContactSection bgImage={contactBackgroundImage} onPhoneClick={handlePhoneClick} />

      <FAQSection onScrollToCta={scrollToResults} />

      {shouldLoadDeferred && (
        <React.Suspense fallback={null}>
          <Footer />
        </React.Suspense>
      )}
    </div>
  );
};

export default MathsTutoring;
