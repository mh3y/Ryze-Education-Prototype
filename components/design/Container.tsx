import React from 'react';

type ContainerProps = React.HTMLAttributes<HTMLDivElement>;

const Container: React.FC<ContainerProps> = ({ className = '', children, ...props }) => {
  return (
    <div className={`mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 ${className}`.trim()} {...props}>
      {children}
    </div>
  );
};

export default Container;
