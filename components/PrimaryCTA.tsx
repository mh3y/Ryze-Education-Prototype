import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
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
  href = '/hsc-maths-tutoring#book',
  onClick,
  label = PRIMARY_CTA_LABEL,
  page,
  placement,
  ariaLabel,
}) => {
  const combinedClassName = `${baseClasses} ${sizeClasses[size]} ${className}`.trim();

  const handleClick = () => {
    trackPrimaryCtaClick(page, placement);
    if (onClick) onClick();
  };

  if (variant === 'button') {
    return (
      <button type="button" className={combinedClassName} onClick={handleClick} aria-label={ariaLabel || label}>
        <span>{label}</span>
        <ArrowRight size={18} aria-hidden="true" />
      </button>
    );
  }

  if (isInternalRoute(href)) {
    return (
      <Link to={href} className={combinedClassName} onClick={handleClick} aria-label={ariaLabel || label}>
        <span>{label}</span>
        <ArrowRight size={18} aria-hidden="true" />
      </Link>
    );
  }

  return (
    <a href={href} className={combinedClassName} onClick={handleClick} aria-label={ariaLabel || label}>
      <span>{label}</span>
      <ArrowRight size={18} aria-hidden="true" />
    </a>
  );
};

export default PrimaryCTA;
