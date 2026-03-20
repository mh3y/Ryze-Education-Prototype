import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, Phone } from 'lucide-react';
import { trackPrimaryCtaClick } from '../src/analytics';

export const PRIMARY_CTA_LABEL = 'Book a Free Consultation';

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
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
};

const baseClasses =
  'inline-flex items-center justify-center gap-2 rounded-full bg-ryze text-white font-semibold shadow-lg shadow-ryze/20 transition-all hover:bg-ryze-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ryze focus-visible:ring-offset-2 focus-visible:ring-offset-transparent';

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
