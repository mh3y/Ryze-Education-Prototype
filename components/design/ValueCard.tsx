import React from 'react';
import DesignCard from './DesignCard';
import { cn } from '../../src/utils/cn';

type ValueCardProps = {
  title: string;
  description: string;
  icon?: React.ReactNode;
  className?: string;
};

const ValueCard: React.FC<ValueCardProps> = ({ title, description, icon, className = '' }) => {
  return (
    <DesignCard className={cn('h-full p-6', className)}>
      {icon && (
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)]">
          {icon}
        </div>
      )}
      <h3 className="mt-4 text-lg md:text-xl font-bold text-[var(--text)]">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{description}</p>
    </DesignCard>
  );
};

export default ValueCard;
