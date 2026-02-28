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

    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(load, { timeout: 2000 });
    } else {
      window.setTimeout(load, 1200);
    }
  };

  const deferUntilInteractive = () => {
    let settled = false;
    let cleanup = () => {};
    const settle = () => {
      if (settled) return;
      settled = true;
      cleanup();
      queueLoad();
    };

    const onInteraction = () => settle();
    const interactionEvents: Array<keyof WindowEventMap> = ['pointerdown', 'keydown', 'touchstart', 'scroll'];
    interactionEvents.forEach((eventName) => {
      window.addEventListener(eventName, onInteraction, { once: true, passive: true });
    });

    let lcpObserver: PerformanceObserver | null = null;
    if ('PerformanceObserver' in window) {
      try {
        lcpObserver = new PerformanceObserver((list) => {
          if (list.getEntries().length > 0) settle();
        });
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true } as PerformanceObserverInit);
      } catch {
        // no-op
      }
    }

    const fallbackTimer = window.setTimeout(() => settle(), 3000);

    cleanup = () => {
      window.clearTimeout(fallbackTimer);
      interactionEvents.forEach((eventName) => {
        window.removeEventListener(eventName, onInteraction);
      });
      if (lcpObserver) lcpObserver.disconnect();
    };
  };

  if (document.readyState === 'complete') {
    deferUntilInteractive();
  } else {
    window.addEventListener('load', deferUntilInteractive, { once: true });
  }
}
