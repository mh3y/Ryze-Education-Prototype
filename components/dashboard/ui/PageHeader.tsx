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
  <div className={compact ? 'page-head page-head--compact ryze-page-header' : 'page-head ryze-page-header'}>
    <div>
      {(eyebrow || breadcrumb) && (
        <div className="page-head__eyebrow ryze-page-header__eyebrow">
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
      <h1 className="page-head__title ryze-page-header__title">{title}</h1>
      {description && <p className="page-head__sub ryze-page-header__sub">{description}</p>}
    </div>
    {actions && <div className="page-head__actions ryze-page-header__actions">{actions}</div>}
  </div>
);
