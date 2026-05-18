/**
 * EditModePanel.tsx — slide-in right panel for admin dashboard customisation.
 */

import React from 'react';
import { X, Eye, EyeOff, RotateCcw, Check } from 'lucide-react';
import {
  useDashboardCustomization,
  WidgetId,
  QuickActionKey,
} from '../../contexts/DashboardCustomizationContext';

interface EditModePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

// ---------------------------------------------------------------------------
// Static nav item list matching Sidebar.tsx NAV.admin
// ---------------------------------------------------------------------------

const NAV_ITEMS = [
  // Today
  { path: '/dashboard/admin',           label: 'Overview',         group: 'Today' },
  { path: '/dashboard/calendar',        label: 'Calendar',         group: 'Today' },
  { path: '/dashboard/admin/alerts',    label: 'Alerts',           group: 'Today' },
  // People
  { path: '/dashboard/admin/students',  label: 'Students',         group: 'People' },
  { path: '/dashboard/admin/parents',   label: 'Parents',          group: 'People' },
  { path: '/dashboard/admin/tutors',    label: 'Tutors',           group: 'People' },
  // Teaching
  { path: '/dashboard/admin/classes',            label: 'Classes',          group: 'Teaching' },
  { path: '/dashboard/admin/lessons',            label: 'Lessons',          group: 'Teaching' },
  { path: '/dashboard/admin/attendance',         label: 'Attendance',       group: 'Teaching' },
  { path: '/dashboard/admin/homework',           label: 'Homework',         group: 'Teaching' },
  { path: '/dashboard/admin/progress-reports',   label: 'Progress reports', group: 'Teaching' },
  { path: '/dashboard/admin/resources',          label: 'Resources',        group: 'Teaching' },
  // Finance
  { path: '/dashboard/admin/payments',        label: 'Payments',       group: 'Finance' },
  { path: '/dashboard/admin/tutor-payments',  label: 'Tutor payments', group: 'Finance' },
  // System
  { path: '/dashboard/admin/announcements', label: 'Announcements', group: 'System' },
  { path: '/dashboard/admin/bot-health',    label: 'Bot health',    group: 'System' },
  { path: '/dashboard/settings',            label: 'Settings',      group: 'System' },
];

// ---------------------------------------------------------------------------
// Widget definitions
// ---------------------------------------------------------------------------

const WIDGET_ITEMS: { id: WidgetId; label: string }[] = [
  { id: 'stats',         label: 'Stat tiles (Active students, Classes, Lessons, Outstanding)' },
  { id: 'lessons',       label: "Today's lessons card" },
  { id: 'alerts',        label: 'Needs attention card' },
  { id: 'quick-actions', label: 'Quick actions grid' },
  { id: 'health',        label: 'System health strip' },
];

// ---------------------------------------------------------------------------
// Quick action definitions
// ---------------------------------------------------------------------------

const QUICK_ACTION_ITEMS: { key: QuickActionKey; label: string }[] = [
  { key: 'add-student', label: 'Add student' },
  { key: 'schedule',    label: 'Schedule lesson' },
  { key: 'invoice',     label: 'Send invoice' },
  { key: 'broadcast',   label: 'Announcement' },
  { key: 'report',      label: 'Build report' },
  { key: 'export',      label: 'Export data' },
];

// ---------------------------------------------------------------------------
// Reusable toggle row
// ---------------------------------------------------------------------------

const ToggleRow: React.FC<{
  label: string;
  hidden: boolean;
  onToggle: () => void;
  sub?: string;
}> = ({ label, hidden, onToggle, sub }) => (
  <div
    style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '8px 12px', borderRadius: 8,
      background: hidden ? 'color-mix(in oklab, var(--danger) 6%, transparent)' : 'transparent',
      transition: 'background 140ms ease',
      cursor: 'pointer',
    }}
    onClick={onToggle}
    onMouseEnter={(e) => {
      if (!hidden) (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)';
    }}
    onMouseLeave={(e) => {
      if (!hidden) (e.currentTarget as HTMLElement).style.background = 'transparent';
    }}
  >
    <button
      onClick={(e) => { e.stopPropagation(); onToggle(); }}
      title={hidden ? 'Show' : 'Hide'}
      style={{
        width: 28, height: 28,
        display: 'grid', placeItems: 'center',
        borderRadius: 7, flexShrink: 0,
        background: hidden
          ? 'color-mix(in oklab, var(--danger) 14%, transparent)'
          : 'var(--bg-hover)',
        border: hidden
          ? '1px solid color-mix(in oklab, var(--danger) 30%, transparent)'
          : '1px solid var(--border-faint)',
        color: hidden ? 'var(--danger)' : 'var(--fg-muted)',
        cursor: 'pointer',
        transition: 'all 140ms ease',
      }}
    >
      {hidden ? <EyeOff size={13} /> : <Eye size={13} />}
    </button>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{
        fontSize: 13, fontWeight: 500,
        color: hidden ? 'var(--fg-muted)' : 'var(--fg-strong)',
        textDecoration: hidden ? 'line-through' : 'none',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {label}
      </div>
      {sub && (
        <div style={{ fontSize: 11, color: 'var(--fg-faint)', marginTop: 1 }}>{sub}</div>
      )}
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Section header
// ---------------------------------------------------------------------------

const SectionHeader: React.FC<{ title: string; count?: number }> = ({ title, count }) => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '14px 12px 6px',
  }}>
    <div style={{
      fontSize: 10.5, fontWeight: 700, letterSpacing: '0.14em',
      textTransform: 'uppercase', color: 'var(--fg-muted)',
    }}>
      {title}
    </div>
    {count !== undefined && count > 0 && (
      <span style={{
        fontSize: 10, fontWeight: 700, padding: '2px 7px',
        borderRadius: 999, background: 'color-mix(in oklab, var(--danger) 14%, transparent)',
        color: 'var(--danger)', border: '1px solid color-mix(in oklab, var(--danger) 30%, transparent)',
      }}>
        {count} hidden
      </span>
    )}
  </div>
);

// ---------------------------------------------------------------------------
// Group divider for nav items
// ---------------------------------------------------------------------------

const GroupLabel: React.FC<{ label: string }> = ({ label }) => (
  <div style={{
    fontSize: 10, fontWeight: 600, letterSpacing: '0.1em',
    textTransform: 'uppercase', color: 'var(--fg-faint)',
    padding: '6px 12px 2px',
  }}>
    {label}
  </div>
);

// ---------------------------------------------------------------------------
// Main panel
// ---------------------------------------------------------------------------

export const EditModePanel: React.FC<EditModePanelProps> = ({ isOpen, onClose }) => {
  const {
    isNavHidden, toggleNavItem,
    isWidgetHidden, toggleWidget,
    isQuickActionHidden, toggleQuickAction,
    resetToDefaults, hasChanges,
    exitEditMode,
    config,
  } = useDashboardCustomization();

  // Group nav items by group label
  const navGroups = NAV_ITEMS.reduce<Record<string, typeof NAV_ITEMS>>((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {});

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 55,
            background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(2px)',
          }}
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0,
          width: 380, zIndex: 60,
          background: 'var(--bg-surface)',
          borderLeft: '1px solid var(--border-faint)',
          boxShadow: '-16px 0 48px rgba(0,0,0,0.3)',
          display: 'flex', flexDirection: 'column',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 280ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Header */}
        <div style={{
          height: 60, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 16px',
          borderBottom: '1px solid var(--border-faint)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: '#f59e0b', flexShrink: 0,
              boxShadow: '0 0 8px rgba(245,158,11,0.6)',
            }} />
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--fg-strong)' }}>
              Dashboard Editor
            </div>
          </div>
          <button
            onClick={() => { exitEditMode(); onClose(); }}
            style={{
              width: 30, height: 30, display: 'grid', placeItems: 'center',
              borderRadius: 8, background: 'transparent',
              border: '1px solid var(--border-faint)',
              color: 'var(--fg-muted)', cursor: 'pointer',
              transition: 'all 140ms ease',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)';
              (e.currentTarget as HTMLElement).style.color = 'var(--fg-strong)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'transparent';
              (e.currentTarget as HTMLElement).style.color = 'var(--fg-muted)';
            }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Scrollable content */}
        <div style={{
          flex: 1, overflowY: 'auto',
          scrollbarWidth: 'thin',
          scrollbarColor: 'var(--border-strong) transparent',
        }}>

          {/* Navigation section */}
          <SectionHeader
            title="Navigation"
            count={config.hiddenNavPaths.length}
          />
          <div style={{ padding: '0 4px' }}>
            {Object.entries(navGroups).map(([group, items]) => (
              <div key={group}>
                <GroupLabel label={group} />
                {items.map((item) => (
                  <ToggleRow
                    key={item.path}
                    label={item.label}
                    sub={item.path}
                    hidden={isNavHidden(item.path)}
                    onToggle={() => toggleNavItem(item.path)}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: 'var(--border-faint)', margin: '8px 16px' }} />

          {/* Overview Widgets section */}
          <SectionHeader
            title="Overview Widgets"
            count={config.hiddenWidgets.length}
          />
          <div style={{ padding: '0 4px' }}>
            {WIDGET_ITEMS.map((w) => (
              <ToggleRow
                key={w.id}
                label={w.label}
                hidden={isWidgetHidden(w.id)}
                onToggle={() => toggleWidget(w.id)}
              />
            ))}
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: 'var(--border-faint)', margin: '8px 16px' }} />

          {/* Quick Actions section */}
          <SectionHeader
            title="Quick Actions"
            count={config.hiddenQuickActions.length}
          />
          <div style={{ padding: '0 4px' }}>
            {QUICK_ACTION_ITEMS.map((qa) => (
              <ToggleRow
                key={qa.key}
                label={qa.label}
                hidden={isQuickActionHidden(qa.key)}
                onToggle={() => toggleQuickAction(qa.key)}
              />
            ))}
          </div>

          {/* Bottom padding */}
          <div style={{ height: 20 }} />
        </div>

        {/* Footer */}
        <div style={{
          flexShrink: 0, padding: 16,
          borderTop: '1px solid var(--border-faint)',
          display: 'flex', gap: 10,
        }}>
          <button
            onClick={resetToDefaults}
            disabled={!hasChanges}
            style={{
              height: 38, padding: '0 14px', borderRadius: 9,
              display: 'flex', alignItems: 'center', gap: 7,
              fontSize: 13, fontWeight: 600,
              background: 'var(--bg-surface)',
              color: hasChanges ? 'var(--danger)' : 'var(--fg-faint)',
              border: `1px solid ${hasChanges ? 'color-mix(in oklab, var(--danger) 40%, transparent)' : 'var(--border-faint)'}`,
              cursor: hasChanges ? 'pointer' : 'not-allowed',
              opacity: hasChanges ? 1 : 0.5,
              transition: 'all 140ms ease',
            }}
          >
            <RotateCcw size={13} /> Reset to defaults
          </button>
          <button
            onClick={() => { exitEditMode(); onClose(); }}
            style={{
              flex: 1, height: 38, borderRadius: 9,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              fontSize: 13, fontWeight: 600,
              background: 'var(--accent)', color: 'var(--accent-fg)',
              border: 'none', cursor: 'pointer',
              transition: 'opacity 140ms ease',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = '0.88'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
          >
            <Check size={14} /> Done
          </button>
        </div>
      </div>
    </>
  );
};

export default EditModePanel;
