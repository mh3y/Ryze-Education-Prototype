/**
 * ErrorState — shown when an API call fails.
 */

import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message,
  onRetry,
}) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 border" style={{ background: 'color-mix(in oklab, var(--danger) 10%, transparent)', color: 'var(--danger)', borderColor: 'color-mix(in oklab, var(--danger) 20%, transparent)' }}>
      <AlertTriangle size={32} />
    </div>
    <h3 className="font-bold ryze-text-inverse mb-1">{title}</h3>
    {message && (
      <p className="text-sm ryze-text-muted max-w-sm leading-relaxed mt-1">{message}</p>
    )}
    {onRetry && (
      <button
        onClick={onRetry}
        className="mt-6 px-6 py-2.5 bg-white/5 hover:bg-white/10 ryze-text-inverse font-semibold text-sm rounded-xl border border-white/10 transition-colors"
      >
        Try Again
      </button>
    )}
  </div>
);
