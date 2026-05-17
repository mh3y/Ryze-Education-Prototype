import React from 'react';

type VariantEntry = { cls: string; label?: string };

const VARIANTS: Record<string, VariantEntry> = {
  // Enrollment
  active:         { cls: 'tag tag--ok' },
  trial:          { cls: 'tag tag--info' },
  paused:         { cls: 'tag' },
  withdrawn:      { cls: 'tag tag--danger' },

  // Payment
  paid:           { cls: 'tag tag--ok' },
  pending:        { cls: 'tag tag--warn' },
  overdue:        { cls: 'tag tag--danger' },
  waived:         { cls: 'tag' },
  unpaid:         { cls: 'tag tag--danger' },
  due:            { cls: 'tag tag--warn' },

  // Attendance
  present:        { cls: 'tag tag--ok' },
  late:           { cls: 'tag tag--warn' },
  left_early:     { cls: 'tag tag--warn', label: 'Left Early' },
  absent:         { cls: 'tag tag--danger' },
  excused:        { cls: 'tag tag--info' },
  unknown:        { cls: 'tag' },

  // Discord
  verified:       { cls: 'tag tag--ok' },
  mismatch:       { cls: 'tag tag--danger' },
  no_data:        { cls: 'tag', label: 'No Data' },

  // Lesson status
  scheduled:      { cls: 'tag tag--info' },
  completed:      { cls: 'tag tag--ok' },
  cancelled:      { cls: 'tag tag--danger' },
  live:           { cls: 'tag tag--accent', label: 'Live now' },
  upcoming:       { cls: 'tag tag--info' },

  // Progress report
  draft:          { cls: 'tag' },
  submitted:      { cls: 'tag tag--info' },
  approved:       { cls: 'tag tag--ok' },
  sent_to_parent: { cls: 'tag tag--accent', label: 'Sent' },

  // Alert severity
  low:            { cls: 'tag tag--info' },
  medium:         { cls: 'tag tag--warn' },
  high:           { cls: 'tag tag--danger' },
  critical:       { cls: 'tag tag--danger' },

  // Alert status
  open:           { cls: 'tag tag--danger' },
  resolved:       { cls: 'tag tag--ok' },
  dismissed:      { cls: 'tag' },

  // User roles
  admin:          { cls: 'tag tag--accent' },
  tutor:          { cls: 'tag tag--info' },
  student:        { cls: 'tag tag--info' },
  parent:         { cls: 'tag tag--info' },

  // Misc
  rejected:       { cls: 'tag tag--danger' },
  online:         { cls: 'tag tag--info' },
  in_person:      { cls: 'tag', label: 'In Person' },
  hybrid:         { cls: 'tag tag--info' },
  running:        { cls: 'tag tag--ok' },
  'low-seat':     { cls: 'tag tag--warn', label: 'Low seats' },
  'at-risk':      { cls: 'tag tag--warn', label: 'At risk' },

  // Boolean
  true:           { cls: 'tag tag--ok', label: 'Yes' },
  false:          { cls: 'tag', label: 'No' },
};

const FALLBACK: VariantEntry = { cls: 'tag' };

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
