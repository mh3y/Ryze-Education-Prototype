export const initAnalytics = () => {
  if (typeof window === 'undefined') return;
  const w = window as any;
  if (w.__analyticsInit) return;
  w.__analyticsInit = true;

  // Google Ads/GA stub
  w.dataLayer = w.dataLayer || [];
  w.gtag = w.gtag || function () { w.dataLayer.push(arguments); };

  // Meta Pixel stub
  if (!w.fbq) {
    const fbq: any = function () {
      fbq.callMethod ? fbq.callMethod.apply(fbq, arguments) : fbq.queue.push(arguments);
    };
    fbq.queue = [];
    fbq.loaded = true;
    fbq.version = '2.0';
    w.fbq = fbq;
    w._fbq = fbq;
    w.fbq('init', '1218919857096197');
    w.fbq('track', 'PageView');
  }
};

type TrackingParams = Record<string, string | number | boolean | undefined>;

const sanitizeParams = (params: TrackingParams) =>
  Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined),
  ) as Record<string, string | number | boolean>;

export const trackEvent = (eventName: string, params: TrackingParams = {}) => {
  if (typeof window === 'undefined') return;
  const w = window as any;
  const payload = sanitizeParams(params);

  try {
    if (typeof w.gtag === 'function') {
      w.gtag('event', eventName, payload);
    }

    if (typeof w.fbq === 'function') {
      w.fbq('trackCustom', eventName, payload);
    }
  } catch {
    // Never allow analytics calls to block user flows.
  }
};

export const trackPrimaryCtaClick = (page: string, placement: string) => {
  trackEvent('cta_primary_click', { page, placement });
};

export function initTrackingDeferred() {
  if (typeof window === 'undefined') return;
  const w = window as any;
  if (w.__trackingDeferredInit) return;
  w.__trackingDeferredInit = true;

  const configureGaOnce = () => {
    if (w.__gaConfigured) return;
    w.__gaConfigured = true;
    w.gtag('js', new Date());
    w.gtag('config', 'G-7XJFCSB41D');
    w.gtag('config', 'AW-17763964178');
  };

  const load = () => {
    if (!document.getElementById('gtag-js')) {
      const gtagScript = document.createElement('script');
      gtagScript.id = 'gtag-js';
      gtagScript.async = true;
      gtagScript.src = 'https://www.googletagmanager.com/gtag/js?id=AW-17763964178';
      gtagScript.onload = configureGaOnce;
      document.head.appendChild(gtagScript);
    } else {
      configureGaOnce();
    }

    if (!document.getElementById('fb-pixel')) {
      const fbScript = document.createElement('script');
      fbScript.id = 'fb-pixel';
      fbScript.async = true;
      fbScript.src = 'https://connect.facebook.net/en_US/fbevents.js';
      document.head.appendChild(fbScript);
    }
  };

  const queueLoad = () => {
    if (w.__trackingScriptsQueued) return;
    w.__trackingScriptsQueued = true;
    load();
  };

  const startAfterLoad = () => {
    let settled = false;
    let pendingSettle = false;
    let lcpSeen = !('PerformanceObserver' in window);
    let cleanup = () => {};

    const settle = (force = false) => {
      if (settled) return;
      if (!force && !lcpSeen) {
        pendingSettle = true;
        return;
      }

      settled = true;
      cleanup();
      queueLoad();
    };

    const interactionEvents: Array<keyof WindowEventMap> = ['pointerdown', 'keydown', 'touchstart', 'scroll'];
    const onInteraction = () => settle(false);
    interactionEvents.forEach((eventName) => {
      window.addEventListener(eventName, onInteraction, { once: true, passive: true });
    });

    let lcpObserver: PerformanceObserver | null = null;
    if ('PerformanceObserver' in window) {
      try {
        lcpObserver = new PerformanceObserver((list) => {
          if (list.getEntries().length > 0) {
            lcpSeen = true;
            if (pendingSettle) settle(false);
          }
        });
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true } as PerformanceObserverInit);
      } catch {
        lcpSeen = true;
      }
    }

    const idleId =
      'requestIdleCallback' in window
        ? (window as any).requestIdleCallback(() => settle(false), { timeout: 5000 })
        : null;

    // Guaranteed eventual start, measured after load.
    const fallbackTimer = window.setTimeout(() => settle(true), 5000);

    cleanup = () => {
      window.clearTimeout(fallbackTimer);
      if (idleId !== null && 'cancelIdleCallback' in window) {
        (window as any).cancelIdleCallback(idleId);
      }
      interactionEvents.forEach((eventName) => {
        window.removeEventListener(eventName, onInteraction);
      });
      if (lcpObserver) lcpObserver.disconnect();
    };
  };

  if (document.readyState === 'complete') {
    startAfterLoad();
  } else {
    window.addEventListener('load', startAfterLoad, { once: true });
  }
}
