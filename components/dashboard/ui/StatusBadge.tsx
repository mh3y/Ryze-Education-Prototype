/**
 * StatusBadge — coloured pill badge for all status/role/type values used
 * across the portal (enrollment, payment, attendance, lesson, user role, etc.)
 */

import React from 'react';

// ---------------------------------------------------------------------------
// Variant map  (value → [bgClass, textClass, label override])
// ---------------------------------------------------------------------------

type VariantEntry = { bg: string; text: string; label?: string };

const VARIANTS: Record<string, VariantEntry> = {
  // Enrollment
  active:       { bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
  trial:        { bg: 'bg-blue-500/15',    text: 'text-blue-400' },
  paused:       { bg: 'bg-amber-500/15',   text: 'text-amber-400' },
  withdrawn:    { bg: 'bg-red-500/15',     text: 'text-red-400' },

  // Payment
  paid:         { bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
  pending:      { bg: 'bg-amber-500/15',   text: 'text-amber-400' },
  overdue:      { bg: 'bg-red-500/15',     text: 'text-red-400' },
  waived:       { bg: 'bg-slate-500/15',   text: 'text-slate-400' },
  unpaid:       { bg: 'bg-red-500/15',     text: 'text-red-400' },

  // Attendance
  present:      { bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
  late:         { bg: 'bg-amber-500/15',   text: 'text-amber-400' },
  left_early:   { bg: 'bg-orange-500/15',  text: 'text-orange-400', label: 'Left Early' },
  absent:       { bg: 'bg-red-500/15',     text: 'text-red-400' },
  excused:      { bg: 'bg-blue-500/15',    text: 'text-blue-400' },
  unknown:      { bg: 'bg-slate-500/15',   text: 'text-slate-400' },

  // Discord verification
  verified:     { bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
  mismatch:     { bg: 'bg-red-500/15',     text: 'text-red-400' },
  no_data:      { bg: 'bg-slate-500/15',   text: 'text-slate-400', label: 'No Data' },
  // 'pending' already mapped above

  // Lesson status
  scheduled:    { bg: 'bg-blue-500/15',    text: 'text-blue-400' },
  // 'active' already mapped
  completed:    { bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
  cancelled:    { bg: 'bg-red-500/15',     text: 'text-red-400' },

  // Progress report
  draft:        { bg: 'bg-slate-500/15',   text: 'text-slate-400' },
  submitted:    { bg: 'bg-blue-500/15',    text: 'text-blue-400' },
  approved:     { bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
  sent_to_parent: { bg: 'bg-purple-500/15', text: 'text-purple-400', label: 'Sent' },

  // Alert severity
  low:          { bg: 'bg-blue-500/15',    text: 'text-blue-400' },
  medium:       { bg: 'bg-amber-500/15',   text: 'text-amber-400' },
  high:         { bg: 'bg-orange-500/15',  text: 'text-orange-400' },
  critical:     { bg: 'bg-red-500/15',     text: 'text-red-400' },

  // Alert status
  open:         { bg: 'bg-red-500/15',     text: 'text-red-400' },
  resolved:     { bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
  dismissed:    { bg: 'bg-slate-500/15',   text: 'text-slate-400' },

  // User roles
  admin:        { bg: 'bg-[#FFB000]/15',   text: 'text-[#FFB000]' },
  tutor:        { bg: 'bg-blue-500/15',    text: 'text-blue-400' },
  student:      { bg: 'bg-purple-500/15',  text: 'text-purple-400' },
  parent:       { bg: 'bg-teal-500/15',    text: 'text-teal-400' },

  // Availability / makeup
  rejected:     { bg: 'bg-red-500/15',     text: 'text-red-400' },

  // Delivery mode
  online:       { bg: 'bg-blue-500/15',    text: 'text-blue-400' },
  in_person:    { bg: 'bg-purple-500/15',  text: 'text-purple-400', label: 'In Person' },
  hybrid:       { bg: 'bg-teal-500/15',    text: 'text-teal-400' },

  // Boolean
  true:         { bg: 'bg-emerald-500/15', text: 'text-emerald-400', label: 'Yes' },
  false:        { bg: 'bg-slate-500/15',   text: 'text-slate-400',   label: 'No' },
};

const FALLBACK: VariantEntry = { bg: 'bg-slate-500/15', text: 'text-slate-400' };

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface StatusBadgeProps {
  value: string | boolean | null | undefined;
  /** Override the display label (otherwise derived from value). */
  label?: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ value, label, className = '' }) => {
  const key = value === null || value === undefined ? '' : String(value).toLowerCase();
  const variant = VARIANTS[key] ?? FALLBACK;

  const displayLabel =
    label ??
    variant.label ??
    (key ? key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : '—');

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${variant.bg} ${variant.text} ${className}`}
    >
      {displayLabel}
    </span>
  );
};
