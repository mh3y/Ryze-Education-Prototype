/**
 * EmptyState — shown when a list/table has no data.
 */

import React from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ElementType;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No data yet',
  description,
  icon: Icon = Inbox,
  action,
}) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center ryze-text-muted mb-4 border border-white/10">
      <Icon size={32} />
    </div>
    <h3 className="font-bold ryze-text-inverse mb-1">{title}</h3>
    {description && (
      <p className="text-sm ryze-text-muted max-w-sm leading-relaxed mt-1">{description}</p>
    )}
    {action && <div className="mt-6">{action}</div>}
  </div>
);
