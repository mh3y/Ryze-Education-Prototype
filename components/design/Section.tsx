import React from 'react';
import { cn } from '../../src/utils/cn';

type SectionVariant = 'default' | 'tint' | 'gradient' | 'dark';

type SectionProps = React.HTMLAttributes<HTMLElement> & {
  as?: 'section' | 'div';
  variant?: SectionVariant;
  compact?: boolean;
};

const variantClasses: Record<SectionVariant, string> = {
  default: 'ryze-bg-primary ryze-text-primary',
  tint: 'ryze-bg-surface ryze-text-primary',
  gradient: 'bg-[linear-gradient(180deg,var(--surface)_0%,var(--bg)_55%,var(--bg)_100%)] ryze-text-primary',
  dark: 'ryze-bg-surface-dark ryze-text-inverse [color-scheme:dark] selection:bg-[var(--accent)] selection:text-[var(--accent-foreground)]',
};

const Section: React.FC<SectionProps> = ({
  as = 'section',
  variant = 'default',
  compact = false,
  className = '',
  children,
  ...props
}) => {
  const Tag = as;
  const spacingClass = compact ? 'py-12 md:py-16' : 'ryze-section-padding';

  return (
    <Tag className={cn('relative', spacingClass, variantClasses[variant], className)} {...props}>
      {children}
    </Tag>
  );
};

export default Section;
