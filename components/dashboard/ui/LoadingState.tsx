/**
 * LoadingState — full-section spinner shown while data is fetching.
 * For table row skeletons, use DataTable's built-in loading prop instead.
 */

import React from 'react';

interface LoadingStateProps {
  message?: string;
  /** 'full' fills the content area; 'inline' is smaller for embedded areas. */
  size?: 'full' | 'inline';
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading…',
  size = 'full',
}) => {
  if (size === 'inline') {
    return (
      <div className="flex items-center gap-3 py-8 justify-center ryze-text-muted text-sm">
        <div className="w-5 h-5 border-2 border-white/10 border-t-[#FFB000] rounded-full animate-spin" />
        {message}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
      <div className="w-8 h-8 border-4 border-white/10 border-t-[#FFB000] rounded-full animate-spin" />
      <p className="text-sm ryze-text-muted">{message}</p>
    </div>
  );
};
