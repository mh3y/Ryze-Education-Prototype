type LcpEntry = PerformanceEntry & {
  element?: Element | null;
  url?: string;
  size?: number;
};

const safeClassName = (element: Element | null | undefined) => {
  if (!element) return 'none';
  const className = (element as HTMLElement).className;
  if (typeof className === 'string' && className.trim()) return className.trim();
  return 'none';
};

const safeImageSrc = (element: Element | null | undefined) => {
  if (!element) return 'none';
  if (element instanceof HTMLImageElement) {
    return element.currentSrc || element.src || 'none';
  }

  const src = (element as HTMLElement).getAttribute?.('src');
  return src && src.trim() ? src.trim() : 'none';
};

export const initPerfDebug = (route = 'unknown') => {
  if (!import.meta.env.DEV) return () => {};
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return () => {};

  let latestEntry: LcpEntry | null = null;
  let logged = false;

  const logEntry = () => {
    if (logged || !latestEntry) return;

    const element = latestEntry.element || null;
    const tagName = element?.tagName || 'none';
    const id = (element as HTMLElement | null)?.id || 'none';
    const className = safeClassName(element);
    const src = safeImageSrc(element);
    const url = latestEntry.url || 'none';
    const size = typeof latestEntry.size === 'number' ? Math.round(latestEntry.size) : 0;
    const t = Number.isFinite(latestEntry.startTime) ? latestEntry.startTime.toFixed(1) : '0.0';

    // Single-line format for easy copy/paste from browser console.
    console.log(
      `[LCP] t=${t}ms size=${size} route=${route} tag=${tagName} id=${id} class=${className} src=${src} url=${url}`,
    );

    logged = true;
  };

  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries() as LcpEntry[];
    for (const entry of entries) {
      if (!latestEntry || (entry.size || 0) >= (latestEntry.size || 0)) {
        latestEntry = entry;
      }
    }

    // Log on first meaningful candidate.
    if (latestEntry && (latestEntry.size || 0) > 0) {
      logEntry();
      observer.disconnect();
    }
  });

  try {
    observer.observe({ type: 'largest-contentful-paint', buffered: true });
  } catch {
    return () => {};
  }

  const finalize = () => {
    logEntry();
    observer.disconnect();
    window.removeEventListener('pagehide', finalize);
    document.removeEventListener('visibilitychange', onVisibilityChange);
  };

  const onVisibilityChange = () => {
    if (document.visibilityState === 'hidden') {
      finalize();
    }
  };

  window.addEventListener('pagehide', finalize, { once: true });
  document.addEventListener('visibilitychange', onVisibilityChange);

  return finalize;
};
