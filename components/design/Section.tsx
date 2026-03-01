import React from 'react';
import { cn } from '../../src/utils/cn';

type SectionVariant = 'default' | 'tint' | 'gradient' | 'dark';

type SectionProps = React.HTMLAttributes<HTMLElement> & {
  as?: 'section' | 'div';
  variant?: SectionVariant;
  compact?: boolean;
};

const variantClasses: Record<SectionVariant, string> = {
  default: 'bg-[var(--bg)] text-[var(--text)]',
  tint: 'bg-[var(--surface)] text-[var(--text)]',
  gradient: 'bg-[linear-gradient(180deg,var(--surface)_0%,var(--bg)_55%,var(--bg)_100%)] text-[var(--text)]',
  dark: 'bg-[var(--primary)] text-[var(--primary-foreground)] [color-scheme:dark] selection:bg-[var(--accent)] selection:text-[var(--accent-foreground)]',
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
  const spacingClass = compact ? 'py-12 md:py-16' : 'py-16 md:py-24';

  return (
    <Tag className={cn('relative', spacingClass, variantClasses[variant], className)} {...props}>
      {children}
    </Tag>
  );
};

export default Section;
