import React from 'react';
import DesignCard from './DesignCard';

type TestimonialCardProps = {
  achievement: string;
  quote: string;
  reviewerName: string;
  reviewerMeta: string;
  className?: string;
};

const TestimonialCard: React.FC<TestimonialCardProps> = ({
  achievement,
  quote,
  reviewerName,
  reviewerMeta,
  className = '',
}) => {
  return (
    <DesignCard className={`h-full p-6 ${className}`.trim()}>
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-primary">{achievement}</p>
      <p className="mt-4 text-sm leading-relaxed text-text">"{quote}"</p>
      <p className="mt-5 text-sm font-bold">{reviewerName}</p>
      <p className="text-xs text-muted">{reviewerMeta}</p>
    </DesignCard>
  );
};

export default TestimonialCard;
