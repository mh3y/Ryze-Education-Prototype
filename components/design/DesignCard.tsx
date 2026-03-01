import React from 'react';

type CardTone = 'default' | 'soft' | 'dark';

type DesignCardProps = React.HTMLAttributes<HTMLDivElement> & {
  tone?: CardTone;
};

const toneClasses: Record<CardTone, string> = {
  default: 'border-border bg-white text-text',
  soft: 'border-border bg-surface/70 text-text',
  dark: 'border-white/15 bg-primary text-primary-foreground',
};

const DesignCard: React.FC<DesignCardProps> = ({ tone = 'default', className = '', children, ...props }) => {
  return (
    <div
      className={`rounded-[var(--radius)] border shadow-[0_14px_34px_-24px_rgba(15,23,42,0.45)] ${toneClasses[tone]} ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
};

export default DesignCard;
