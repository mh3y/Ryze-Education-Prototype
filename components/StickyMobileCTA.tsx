import React, { useEffect, useState } from 'react';
import PrimaryCTA from './PrimaryCTA';

type StickyMobileCTAProps = {
  page: string;
  href: string;
};

const STICKY_CTA_HEIGHT = 96;

const StickyMobileCTA: React.FC<StickyMobileCTAProps> = ({ page, href }) => {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)');
    const update = () => setEnabled(mediaQuery.matches);
    update();

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', update);
      return () => mediaQuery.removeEventListener('change', update);
    }

    mediaQuery.addListener(update);
    return () => mediaQuery.removeListener(update);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    document.body.classList.add('ryze-sticky-cta-active');
    document.documentElement.style.setProperty('--ryze-sticky-cta-height', `${STICKY_CTA_HEIGHT}px`);

    return () => {
      document.body.classList.remove('ryze-sticky-cta-active');
      document.documentElement.style.setProperty('--ryze-sticky-cta-height', '0px');
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div className="md:hidden fixed inset-x-0 bottom-0 z-40 px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
      <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-[0_10px_40px_-20px_rgba(2,6,23,0.6)] backdrop-blur-sm">
        <PrimaryCTA
          variant="link"
          href={href}
          page={page}
          placement="sticky"
          size="md"
          className="w-full justify-center"
          ariaLabel="Book a free consultation"
        />
      </div>
    </div>
  );
};

export default StickyMobileCTA;
