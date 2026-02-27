export const initAnalytics = () => {
  if (typeof window === 'undefined') return;
  const w = window as any;
  if (w.__analyticsInit) return;
  w.__analyticsInit = true;

  // Google Ads/GA stub
  w.dataLayer = w.dataLayer || [];
  w.gtag = w.gtag || function () { w.dataLayer.push(arguments); };
  let gaConfigured = false;
  const configureGaOnce = () => {
    if (gaConfigured) return;
    gaConfigured = true;
    w.gtag('js', new Date());
    w.gtag('config', 'G-7XJFCSB41D');
    w.gtag('config', 'AW-17763964178');
  };

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

  const loadScripts = () => {
    if (!document.getElementById('gtag-js')) {
      const gtagScript = document.createElement('script');
      gtagScript.id = 'gtag-js';
      gtagScript.async = true;
      gtagScript.src = 'https://www.googletagmanager.com/gtag/js?id=AW-17763964178';
      gtagScript.onload = () => {
        gtagScript.dataset.loaded = 'true';
        configureGaOnce();
      };
      document.head.appendChild(gtagScript);
    } else {
      const existingGtagScript = document.getElementById('gtag-js') as HTMLScriptElement;
      if (existingGtagScript.dataset.loaded === 'true') {
        configureGaOnce();
      } else {
        existingGtagScript.addEventListener('load', configureGaOnce, { once: true });
      }
    }

    if (!document.getElementById('fb-pixel')) {
      const fbScript = document.createElement('script');
      fbScript.id = 'fb-pixel';
      fbScript.async = true;
      fbScript.src = 'https://connect.facebook.net/en_US/fbevents.js';
      document.head.appendChild(fbScript);
    }
  };

  if (document.readyState === 'complete') {
    loadScripts();
  } else {
    window.addEventListener('load', loadScripts, { once: true });
  }
};
