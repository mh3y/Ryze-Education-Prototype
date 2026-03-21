import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '../../utils/cn';

type FadeInSectionProps = React.PropsWithChildren<
  React.HTMLAttributes<HTMLElement> & {
    as?: 'section' | 'div' | 'article' | 'aside';
    delay?: number;
    duration?: number;
    lift?: boolean;
    viewportAmount?: number;
  }
>;

const FadeInSection: React.FC<FadeInSectionProps> = ({
  as = 'section',
  className = '',
  children,
  delay = 0,
  duration = 0.24,
  lift = false,
  viewportAmount = 0.2,
  ...props
}) => {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    const Tag = as;
    return (
      <Tag className={cn(className)} {...props}>
        {children}
      </Tag>
    );
  }

  const MotionTag = motion[as as keyof typeof motion] as React.ComponentType<any>;
  const initial = lift ? { opacity: 0, y: 6 } : { opacity: 0 };
  const animate = lift ? { opacity: 1, y: 0 } : { opacity: 1 };

  return (
    <MotionTag
      className={cn(className)}
      initial={initial}
      whileInView={animate}
      viewport={{ once: true, amount: viewportAmount }}
      transition={{ duration, delay, ease: 'easeOut' }}
      {...props}
    >
      {children}
    </MotionTag>
  );
};

export default FadeInSection;
