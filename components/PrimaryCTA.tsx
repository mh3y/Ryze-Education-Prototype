import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, Phone } from 'lucide-react';
import { trackPrimaryCtaClick } from '../src/analytics';

export const PRIMARY_CTA_LABEL = 'Book a Consultation';

type PrimaryCtaSize = 'sm' | 'md' | 'lg';
type PrimaryCtaVariant = 'button' | 'link';

type PrimaryCTAProps = {
  variant?: PrimaryCtaVariant;
  size?: PrimaryCtaSize;
  className?: string;
  href?: string;
  onClick?: () => void;
  label?: string;
  page: string;
  placement: string;
  ariaLabel?: string;
  icon?: 'arrow' | 'calendar_alert' | 'phone';
};

const sizeClasses: Record<PrimaryCtaSize, string> = {
  sm: 'min-h-[2.75rem] px-4 py-2 text-[0.95rem]',
  md: 'min-h-[3.25rem] px-6 py-3 text-[1rem]',
  lg: 'min-h-[3.75rem] px-7 py-4 text-[1.04rem]',
};

const baseClasses =
  'inline-flex items-center justify-center gap-2 rounded-full border border-[rgba(184,132,30,0.28)] bg-[var(--accent)] text-white font-semibold tracking-[-0.01em] shadow-[0_18px_42px_-28px_rgba(17,21,29,0.34)] transition-all duration-300 hover:-translate-y-px hover:bg-[#d19a24] hover:text-white hover:shadow-[0_22px_48px_-28px_rgba(17,21,29,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent';

const isInternalRoute = (href: string) => href.startsWith('/') && !href.startsWith('//');

const PrimaryCTA: React.FC<PrimaryCTAProps> = ({
  variant = 'link',
  size = 'md',
  className = '',
  href = '/contact',
  onClick,
  label = PRIMARY_CTA_LABEL,
  page,
  placement,
  ariaLabel,
  icon = 'arrow',
}) => {
  const combinedClassName = `${baseClasses} ${sizeClasses[size]} ${className}`.trim();

  const handleClick = () => {
    trackPrimaryCtaClick(page, placement);
    if (onClick) onClick();
  };

  const iconMarkup =
    icon === 'calendar_alert' ? (
      <CalendarDays className="h-[clamp(1.35rem,2.2vw,1.95rem)] w-[clamp(1.35rem,2.2vw,1.95rem)] shrink-0" aria-hidden="true" />
    ) : icon === 'phone' ? (
      <Phone className="h-[clamp(1.2rem,2vw,1.75rem)] w-[clamp(1.2rem,2vw,1.75rem)] shrink-0" aria-hidden="true" />
    ) : (
      <ArrowRight className="h-[clamp(1rem,1.6vw,1.15rem)] w-[clamp(1rem,1.6vw,1.15rem)] shrink-0" aria-hidden="true" />
    );

  if (variant === 'button') {
    return (
      <button type="button" className={combinedClassName} onClick={handleClick} aria-label={ariaLabel || label}>
        {icon !== 'arrow' && iconMarkup}
        <span>{label}</span>
        {icon === 'arrow' && iconMarkup}
      </button>
    );
  }

  if (isInternalRoute(href)) {
    return (
      <Link to={href} className={combinedClassName} onClick={handleClick} aria-label={ariaLabel || label}>
        {icon !== 'arrow' && iconMarkup}
        <span>{label}</span>
        {icon === 'arrow' && iconMarkup}
      </Link>
    );
  }

  return (
    <a href={href} className={combinedClassName} onClick={handleClick} aria-label={ariaLabel || label}>
      {icon !== 'arrow' && iconMarkup}
      <span>{label}</span>
      {icon === 'arrow' && iconMarkup}
    </a>
  );
};

export default PrimaryCTA;
