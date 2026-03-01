import React from 'react';

type SectionVariant = 'default' | 'tint' | 'gradient' | 'dark';

type SectionProps = React.HTMLAttributes<HTMLElement> & {
  as?: 'section' | 'div';
  variant?: SectionVariant;
  compact?: boolean;
};

const variantClasses: Record<SectionVariant, string> = {
  default: 'bg-bg text-text',
  tint: 'bg-surface text-text',
  gradient: 'bg-gradient-to-b from-primary/10 via-bg to-bg text-text',
  dark: 'bg-primary text-primary-foreground',
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
    <Tag className={`relative ${spacingClass} ${variantClasses[variant]} ${className}`.trim()} {...props}>
      {children}
    </Tag>
  );
};

export default Section;
