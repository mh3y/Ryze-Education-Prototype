import React from 'react';
import DesignCard from './DesignCard';
import { cn } from '../../src/utils/cn';

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
    <DesignCard className={cn('h-full p-6', className)}>
      <p className="text-xs font-bold uppercase tracking-[0.12em] ryze-text-primary">{achievement}</p>
      <blockquote className="mt-4 border-l-2 ryze-border-subtle pl-4">
        <p className="text-sm md:text-base leading-relaxed ryze-text-primary">{quote}</p>
      </blockquote>
      <footer className="mt-5">
        <p className="text-sm font-bold ryze-text-primary">{reviewerName}</p>
        <p className="text-xs ryze-text-secondary">{reviewerMeta}</p>
      </footer>
    </DesignCard>
  );
};

export default TestimonialCard;
