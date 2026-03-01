import { useEffect, useRef, useState } from 'react';

export const useInViewAnimationPause = <T extends HTMLElement>(
  prefersReducedMotion: boolean,
  threshold = 0.1
) => {
  const ref = useRef<T | null>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion) {
      setIsInView(false);
      return;
    }

    const element = ref.current;
    if (!element || typeof IntersectionObserver === 'undefined') {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(Boolean(entry?.isIntersecting));
      },
      { threshold }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [prefersReducedMotion, threshold]);

  return { ref, isInView };
};
