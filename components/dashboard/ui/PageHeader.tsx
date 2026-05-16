/**
 * PageHeader — consistent section header for dashboard admin pages.
 *
 * Usage:
 *   <PageHeader
 *     title="Students"
 *     description="Manage enrolled students and their profiles."
 *     actions={<button onClick={openModal}>Add Student</button>}
 *   />
 */

import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  /** Breadcrumb-style parent label + href. */
  breadcrumb?: { label: string; href?: string };
  /** Action buttons rendered to the right of the title. */
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  breadcrumb,
  actions,
}) => (
  <div className="flex flex-col gap-1 md:flex-row md:items-start md:justify-between mb-8">
    <div>
      {breadcrumb && (
        <p className="text-xs ryze-text-muted mb-1 font-medium">
          {breadcrumb.href ? (
            <a href={breadcrumb.href} className="hover:ryze-text-inverse transition-colors">
              {breadcrumb.label}
            </a>
          ) : (
            breadcrumb.label
          )}
          {' / '}
          <span className="ryze-text-inverse">{title}</span>
        </p>
      )}
      <h2 className="text-2xl font-bold ryze-text-inverse tracking-tight">{title}</h2>
      {description && (
        <p className="text-sm ryze-text-muted mt-1 leading-relaxed max-w-2xl">{description}</p>
      )}
    </div>
    {actions && <div className="flex items-center gap-3 mt-3 md:mt-0 shrink-0">{actions}</div>}
  </div>
);
