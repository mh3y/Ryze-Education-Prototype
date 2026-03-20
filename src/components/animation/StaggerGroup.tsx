import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '../../utils/cn';

type StaggerGroupProps = React.PropsWithChildren<
  React.HTMLAttributes<HTMLElement> & {
    as?: 'div' | 'section' | 'ul';
    stagger?: number;
    lift?: boolean;
  }
>;

const StaggerGroup: React.FC<StaggerGroupProps> = ({
  as = 'div',
  className = '',
  children,
  stagger = 0.04,
  lift = false,
  ...props
}) => {
  const reduceMotion = useReducedMotion();
  const Tag = as;

  if (reduceMotion) {
    return (
      <Tag className={cn(className)} {...props}>
        {children}
      </Tag>
    );
  }

  const MotionTag = motion[as as keyof typeof motion] as React.ComponentType<any>;
  const items = React.Children.toArray(children);

  return (
    <MotionTag
      className={cn(className)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: stagger,
          },
        },
      }}
      {...props}
    >
      {items.map((child, index) => (
        <motion.div
          key={index}
          variants={{
            hidden: lift ? { opacity: 0, y: 6 } : { opacity: 0 },
            show: lift ? { opacity: 1, y: 0 } : { opacity: 1 },
          }}
          transition={{ duration: 0.24, ease: 'easeOut' }}
        >
          {child}
        </motion.div>
      ))}
    </MotionTag>
  );
};

export default StaggerGroup;
