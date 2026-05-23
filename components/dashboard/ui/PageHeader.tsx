import React from 'react';

interface PageHeaderProps {
  title: React.ReactNode;
  description?: string;
  eyebrow?: string;
  breadcrumb?: { label: string; href?: string };
  actions?: React.ReactNode;
  /** Shrinks the h1 to ~28px and reduces bottom spacing — use on list/data pages */
  compact?: boolean;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  eyebrow,
  breadcrumb,
  actions,
  compact,
}) => (
  <div className={compact ? 'page-head page-head--compact' : 'page-head'}>
    <div>
      {(eyebrow || breadcrumb) && (
        <div className="page-head__eyebrow">
          {breadcrumb ? (
            <>
              {breadcrumb.href
                ? <a href={breadcrumb.href}>{breadcrumb.label}</a>
                : breadcrumb.label}
              {' / '}
              <span style={{ color: 'var(--fg-muted)' }}>{title}</span>
            </>
          ) : eyebrow}
        </div>
      )}
      <h1 className="page-head__title">{title}</h1>
      {description && <p className="page-head__sub">{description}</p>}
    </div>
    {actions && <div className="page-head__actions">{actions}</div>}
  </div>
);
