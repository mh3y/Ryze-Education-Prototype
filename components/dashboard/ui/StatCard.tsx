/**
 * StatCard — metric card for the dashboard overview.
 * Shows a label, a large value, an optional change/trend indicator,
 * and an optional icon.
 */

import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  /** Sub-label / description shown below the value. */
  sub?: string;
  /** Icon component from lucide-react. */
  icon?: React.ElementType;
  /** Accent colour class (e.g. 'text-[#FFB000]'). Defaults to amber. */
  accentClass?: string;
  /** Positive = green, negative = red, 0/undefined = no indicator. */
  trend?: number;
  /** Loading skeleton state. */
  loading?: boolean;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  sub,
  icon: Icon,
  accentClass = 'text-[#FFB000]',
  trend,
  loading = false,
  onClick,
}) => {
  const TrendIcon =
    trend === undefined || trend === null
      ? null
      : trend > 0
      ? TrendingUp
      : trend < 0
      ? TrendingDown
      : Minus;

  const trendColour =
    !trend ? 'ryze-text-muted' : trend > 0 ? 'text-emerald-400' : 'text-red-400';

  if (loading) {
    return (
      <div className="bg-[#0a0f1e] border border-white/5 rounded-2xl p-6 animate-pulse">
        <div className="h-3 w-24 bg-white/10 rounded mb-4" />
        <div className="h-8 w-16 bg-white/10 rounded" />
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`bg-[#0a0f1e] border border-white/5 rounded-2xl p-6 flex flex-col gap-3 relative overflow-hidden group transition-all ${
        onClick ? 'cursor-pointer hover:border-white/15 hover:bg-white/[0.03]' : ''
      }`}
    >
      {/* Subtle glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFB000] rounded-full blur-[80px] opacity-0 group-hover:opacity-[0.04] transition-opacity pointer-events-none" />

      {/* Top row */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold ryze-text-muted uppercase tracking-widest">{label}</span>
        {Icon && (
          <div className={`w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center ${accentClass}`}>
            <Icon size={18} />
          </div>
        )}
      </div>

      {/* Value */}
      <div className="flex items-end gap-3">
        <span className="text-3xl font-bold ryze-text-inverse tabular-nums leading-none">
          {value}
        </span>
        {TrendIcon && (
          <div className={`flex items-center gap-1 text-xs font-semibold pb-0.5 ${trendColour}`}>
            <TrendIcon size={14} />
            <span>{Math.abs(trend!)}%</span>
          </div>
        )}
      </div>

      {/* Sub-label */}
      {sub && <p className="text-xs ryze-text-muted leading-relaxed">{sub}</p>}
    </div>
  );
};
