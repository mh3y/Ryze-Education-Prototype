import React from 'react';

interface PageHeaderProps {
  title: React.ReactNode;
  description?: string;
  eyebrow?: string;
  breadcrumb?: { label: string; href?: string };
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  eyebrow,
  breadcrumb,
  actions,
}) => (
  <div className="page-head">
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
