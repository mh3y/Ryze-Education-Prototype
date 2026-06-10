import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, Phone } from 'lucide-react';
import { trackPrimaryCtaClick } from '../src/analytics';

export const PRIMARY_CTA_LABEL = 'Book a Free Consultation';

type PrimaryCtaSize = 'sm' | 'md' | 'lg';
type PrimaryCtaVariant = 'button' | 'link';

type PrimaryCTAProps = {
  variant?: PrimaryCtaVariant;
  styleVariant?: 'primary' | 'secondary' | 'dark' | 'ghost';
  size?: PrimaryCtaSize;
  buttonType?: 'button' | 'submit' | 'reset';
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
  'inline-flex items-center justify-center gap-2 transition-[transform,background-color,border-color,color,box-shadow,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-px active:scale-[0.985]';

const styleVariantClasses: Record<string, string> = {
  primary: 'ryze-cta-primary',
  secondary: 'ryze-cta-secondary',
  dark: 'ryze-cta-dark',
  ghost: 'ryze-cta-ghost',
};

const isInternalRoute = (href: string) => href.startsWith('/') && !href.startsWith('//');

const PrimaryCTA: React.FC<PrimaryCTAProps> = ({
  variant = 'link',
  styleVariant = 'primary',
  size = 'md',
  buttonType = 'button',
  className = '',
  href = '/contact',
  onClick,
  label = PRIMARY_CTA_LABEL,
  page,
  placement,
  ariaLabel,
  icon = 'arrow',
}) => {
  const combinedClassName = `${styleVariantClasses[styleVariant]} ${baseClasses} ${className}`.trim();

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
      <button type={buttonType} className={combinedClassName} onClick={handleClick} aria-label={ariaLabel || label}>
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
