import { useEffect, useState } from 'react';

const MEDIA_QUERY = '(prefers-reduced-motion: reduce)';

const getInitialPreference = () => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }

  return window.matchMedia(MEDIA_QUERY).matches;
};

export const usePrefersReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(getInitialPreference);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }

    const mediaQuery = window.matchMedia(MEDIA_QUERY);
    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);

    handleChange();

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  return prefersReducedMotion;
};

export default usePrefersReducedMotion;
