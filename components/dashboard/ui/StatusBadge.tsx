import React from 'react';

type VariantEntry = { cls: string; label?: string };

const VARIANTS: Record<string, VariantEntry> = {
  // Enrollment
  active:         { cls: 'tag tag--ok ryze-badge ryze-badge--ok' },
  trial:          { cls: 'tag tag--info ryze-badge ryze-badge--trial' },
  paused:         { cls: 'tag ryze-badge ryze-badge--paused' },
  withdrawn:      { cls: 'tag tag--danger ryze-badge ryze-badge--danger' },

  // Payment
  paid:           { cls: 'tag tag--ok ryze-badge ryze-badge--paid' },
  pending:        { cls: 'tag tag--warn ryze-badge ryze-badge--warn' },
  partial:        { cls: 'tag tag--warn ryze-badge ryze-badge--warn' },
  overdue:        { cls: 'tag tag--danger ryze-badge ryze-badge--overdue' },
  waived:         { cls: 'tag ryze-badge ryze-badge--neutral' },
  unpaid:         { cls: 'tag tag--danger ryze-badge ryze-badge--danger' },
  due:            { cls: 'tag tag--warn ryze-badge ryze-badge--due' },

  // Attendance
  present:        { cls: 'tag tag--ok ryze-badge ryze-badge--present' },
  late:           { cls: 'tag tag--warn ryze-badge ryze-badge--late' },
  left_early:     { cls: 'tag tag--warn ryze-badge ryze-badge--late', label: 'Left Early' },
  absent:         { cls: 'tag tag--danger ryze-badge ryze-badge--absent' },
  excused:        { cls: 'tag tag--info ryze-badge ryze-badge--info' },
  unknown:        { cls: 'tag ryze-badge ryze-badge--neutral' },

  // Discord
  verified:       { cls: 'tag tag--ok ryze-badge ryze-badge--ok' },
  mismatch:       { cls: 'tag tag--danger ryze-badge ryze-badge--danger' },
  no_data:        { cls: 'tag ryze-badge ryze-badge--neutral', label: 'No Data' },

  // Lesson status
  scheduled:      { cls: 'tag tag--info ryze-badge ryze-badge--upcoming' },
  completed:      { cls: 'tag tag--ok ryze-badge ryze-badge--ok' },
  cancelled:      { cls: 'tag tag--danger ryze-badge ryze-badge--danger' },
  live:           { cls: 'tag tag--accent ryze-badge ryze-badge--live', label: 'Live now' },
  upcoming:       { cls: 'tag tag--info ryze-badge ryze-badge--upcoming' },

  // Progress report
  draft:          { cls: 'tag ryze-badge ryze-badge--draft' },
  submitted:      { cls: 'tag tag--info ryze-badge ryze-badge--info' },
  approved:       { cls: 'tag tag--ok ryze-badge ryze-badge--ok' },
  sent_to_parent: { cls: 'tag tag--accent ryze-badge ryze-badge--accent', label: 'Sent' },

  // Alert severity
  low:            { cls: 'tag tag--info ryze-badge ryze-badge--info' },
  medium:         { cls: 'tag tag--warn ryze-badge ryze-badge--warn' },
  high:           { cls: 'tag tag--danger ryze-badge ryze-badge--danger' },
  critical:       { cls: 'tag tag--danger ryze-badge ryze-badge--danger' },

  // Alert status
  open:           { cls: 'tag tag--danger ryze-badge ryze-badge--danger' },
  resolved:       { cls: 'tag tag--ok ryze-badge ryze-badge--ok' },
  dismissed:      { cls: 'tag ryze-badge ryze-badge--neutral' },

  // User roles
  admin:          { cls: 'tag tag--accent ryze-badge ryze-badge--accent' },
  tutor:          { cls: 'tag tag--info ryze-badge ryze-badge--info' },
  student:        { cls: 'tag tag--info ryze-badge ryze-badge--info' },
  parent:         { cls: 'tag tag--info ryze-badge ryze-badge--info' },

  // Misc
  rejected:       { cls: 'tag tag--danger ryze-badge ryze-badge--danger' },
  online:         { cls: 'tag tag--info ryze-badge ryze-badge--info' },
  in_person:      { cls: 'tag ryze-badge ryze-badge--neutral', label: 'In Person' },
  hybrid:         { cls: 'tag tag--info ryze-badge ryze-badge--info' },
  running:        { cls: 'tag tag--ok ryze-badge ryze-badge--running' },
  'low-seat':     { cls: 'tag tag--warn ryze-badge ryze-badge--low-seats', label: 'Low seats' },
  'at-risk':      { cls: 'tag tag--warn ryze-badge ryze-badge--at-risk', label: 'At risk' },

  // Boolean
  true:           { cls: 'tag tag--ok ryze-badge ryze-badge--ok', label: 'Yes' },
  false:          { cls: 'tag ryze-badge ryze-badge--neutral', label: 'No' },
};

const FALLBACK: VariantEntry = { cls: 'tag ryze-badge ryze-badge--neutral' };

interface StatusBadgeProps {
  value: string | boolean | null | undefined;
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
    <span className={`${variant.cls} ${className}`.trim()}>
      {displayLabel}
    </span>
  );
};
