import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '../../utils/cn';

type InteractiveLiftProps = React.PropsWithChildren<
  React.ComponentPropsWithoutRef<'div'> & {
    as?: 'div' | 'span' | 'article' | 'section';
    disabled?: boolean;
  }
>;

const InteractiveLift: React.FC<InteractiveLiftProps> = ({
  as = 'div',
  className = '',
  children,
  disabled = false,
  ...props
}) => {
  const reduceMotion = useReducedMotion();
  const Tag = as;

  if (reduceMotion || disabled) {
    return (
      <Tag className={cn(className)} {...props}>
        {children}
      </Tag>
    );
  }

  const MotionTag = motion[as as keyof typeof motion] as React.ComponentType<any>;

  return (
    <MotionTag
      className={cn(className)}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      {...props}
    >
      {children}
    </MotionTag>
  );
};

export default InteractiveLift;
