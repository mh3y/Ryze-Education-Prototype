import React from 'react';
import DesignCard from './DesignCard';

type StatCardProps = {
  value: string;
  label: string;
  detail?: string;
  icon?: React.ReactNode;
  className?: string;
};

const StatCard: React.FC<StatCardProps> = ({ value, label, detail, icon, className = '' }) => {
  return (
    <DesignCard className={`p-5 ${className}`.trim()}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-3xl font-extrabold tracking-tight">{value}</p>
          <p className="mt-1 text-sm font-semibold text-muted">{label}</p>
          {detail && <p className="mt-2 text-sm text-muted">{detail}</p>}
        </div>
        {icon && (
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-accent/15 text-accent">
            {icon}
          </div>
        )}
      </div>
    </DesignCard>
  );
};

export default StatCard;
