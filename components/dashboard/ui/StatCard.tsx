import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon?: React.ElementType;
  accentClass?: string;
  trend?: number;
  loading?: boolean;
  onClick?: () => void;
  deltaText?: string;
  deltaDir?: 'up' | 'down';
  footRight?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  sub,
  trend,
  loading = false,
  onClick,
  deltaText,
  deltaDir,
  footRight,
}) => {
  if (loading) {
    return (
      <div className="stat ryze-stat" style={{ opacity: 0.5 }}>
        <div className="stat__label ryze-stat__label" style={{ background: 'var(--bg-surface-2)', height: 12, width: 80, borderRadius: 4 }} />
        <div className="stat__value ryze-stat__value" style={{ background: 'var(--bg-surface-2)', height: 44, width: 64, borderRadius: 6 }} />
      </div>
    );
  }

  const resolvedDeltaDir = deltaDir ?? (trend !== undefined ? (trend >= 0 ? 'up' : 'down') : undefined);
  const resolvedDeltaText = deltaText ?? (trend !== undefined ? `${Math.abs(trend)}%` : undefined);

  return (
    <div className="stat ryze-stat" onClick={onClick} style={onClick ? { cursor: 'pointer' } : undefined}>
      <div className="stat__label ryze-stat__label">{label}</div>
      <div className="stat__value tnum ryze-stat__value ryze-tnum">{value}</div>
      <div className="stat__foot ryze-stat__foot">
        {resolvedDeltaText ? (
          <span className={`stat__delta stat__delta--${resolvedDeltaDir ?? 'up'} ryze-stat__delta ryze-stat__delta--${resolvedDeltaDir ?? 'up'}`}>
            {resolvedDeltaDir === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {resolvedDeltaText}
          </span>
        ) : <span />}
        {(footRight || sub) && <span>{footRight ?? sub}</span>}
      </div>
    </div>
  );
};
