import React from 'react';
import DesignCard from './DesignCard';

type ValueCardProps = {
  title: string;
  description: string;
  icon?: React.ReactNode;
  className?: string;
};

const ValueCard: React.FC<ValueCardProps> = ({ title, description, icon, className = '' }) => {
  return (
    <DesignCard className={`h-full p-6 ${className}`.trim()}>
      {icon && (
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          {icon}
        </div>
      )}
      <h3 className="mt-4 text-xl font-bold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>
    </DesignCard>
  );
};

export default ValueCard;
