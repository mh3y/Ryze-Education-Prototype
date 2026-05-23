/**
 * Sidebar.tsx — Ryze Portal redesign
 *
 * Grouped nav with gold active rail indicator.
 * Expanded (248 px) / rail (72 px) controlled by `isOpen`.
 * Mobile: translate-x off-screen when closed, slide in when open.
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { EyeOff } from 'lucide-react';
import {
  LayoutDashboard, CalendarDays, ShieldAlert,
  Users, Home, GraduationCap,
  BookOpen, CalendarRange, ClipboardCheck, PenLine,
  ClipboardList, FolderOpen,
  CreditCard, DollarSign,
  Megaphone, Activity, Settings,
  LogOut, FileText, MessageSquare, UserPlus,
} from 'lucide-react';

import { useDashboardCustomization } from '../../contexts/DashboardCustomizationContext';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type UserRole = 'student' | 'parent' | 'tutor' | 'admin';

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  badge?: number;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

// ---------------------------------------------------------------------------
// Nav structure per role
// ---------------------------------------------------------------------------

const NAV: Record<UserRole, NavGroup[]> = {
  admin: [
    {
      group: 'Today',
      items: [
        { label: 'Overview',          path: '/dashboard/admin',              icon: LayoutDashboard },
        { label: 'Calendar',          path: '/dashboard/calendar',           icon: CalendarDays },
        { label: 'Alerts',            path: '/dashboard/admin/alerts',       icon: ShieldAlert, badge: 3 },
      ],
    },
    {
      group: 'People',
      items: [
        { label: 'Leads',             path: '/dashboard/admin/leads',        icon: UserPlus },
        { label: 'Students',          path: '/dashboard/admin/students',     icon: Users },
        { label: 'Parents',           path: '/dashboard/admin/parents',      icon: Home },
        { label: 'Tutors',            path: '/dashboard/admin/tutors',       icon: GraduationCap },
      ],
    },
    {
      group: 'Teaching',
      items: [
        { label: 'Classes',           path: '/dashboard/admin/classes',      icon: BookOpen },
        { label: 'Lessons',           path: '/dashboard/admin/lessons',      icon: CalendarRange },
        { label: 'Attendance',        path: '/dashboard/admin/attendance',   icon: ClipboardCheck },
        { label: 'Homework',          path: '/dashboard/admin/homework',     icon: PenLine },
        { label: 'Progress reports',  path: '/dashboard/admin/progress-reports', icon: ClipboardList },
        { label: 'Resources',         path: '/dashboard/admin/resources',    icon: FolderOpen },
      ],
    },
    {
      group: 'Finance',
      items: [
        { label: 'Payments',          path: '/dashboard/admin/payments',     icon: CreditCard },
        { label: 'Tutor payments',    path: '/dashboard/admin/tutor-payments', icon: DollarSign },
      ],
    },
    {
      group: 'System',
      items: [
        { label: 'Messages',          path: '/dashboard/admin/messages',     icon: MessageSquare },
        { label: 'Announcements',     path: '/dashboard/admin/announcements', icon: Megaphone },
        { label: 'Audit log',         path: '/dashboard/admin/audit-log',    icon: FileText },
        { label: 'Bot health',        path: '/dashboard/admin/bot-health',   icon: Activity },
        { label: 'Settings',          path: '/dashboard/settings',           icon: Settings },
      ],
    },
  ],
  tutor: [
    {
      group: 'Today',
      items: [
        { label: 'Dashboard',         path: '/dashboard/overview',           icon: LayoutDashboard },
        { label: 'Schedule',          path: '/dashboard/calendar',           icon: CalendarDays },
      ],
    },
    {
      group: 'Classes',
      items: [
        { label: 'Classes',           path: '/dashboard/admin/classes',      icon: BookOpen },
        { label: 'Lessons',           path: '/dashboard/admin/lessons',      icon: CalendarRange },
        { label: 'Attendance',        path: '/dashboard/admin/attendance',   icon: ClipboardCheck },
        { label: 'Homework',          path: '/dashboard/admin/homework',     icon: PenLine },
        { label: 'Reports',           path: '/dashboard/admin/progress-reports', icon: ClipboardList },
        { label: 'Resources',         path: '/dashboard/admin/resources',    icon: FolderOpen },
      ],
    },
    {
      group: 'Account',
      items: [
        { label: 'My payments',       path: '/dashboard/admin/tutor-payments', icon: DollarSign },
        { label: 'Settings',          path: '/dashboard/settings',           icon: Settings },
      ],
    },
  ],
  student: [
    {
      group: 'Learning',
      items: [
        { label: 'Dashboard',         path: '/dashboard/overview',           icon: LayoutDashboard },
        { label: 'Courses',           path: '/dashboard/courses',            icon: BookOpen },
        { label: 'Homework',          path: '/dashboard/assignments',        icon: PenLine },
        { label: 'Calendar',          path: '/dashboard/calendar',           icon: CalendarDays },
        { label: 'Progress',          path: '/dashboard/analytics',          icon: ClipboardList },
      ],
    },
    {
      group: 'Account',
      items: [
        { label: 'Settings',          path: '/dashboard/settings',           icon: Settings },
      ],
    },
  ],
  parent: [
    {
      group: 'Family',
      items: [
        { label: 'Dashboard',         path: '/dashboard/overview',           icon: LayoutDashboard },
        { label: 'Schedule',          path: '/dashboard/calendar',           icon: CalendarDays },
        { label: 'Reports',           path: '/dashboard/analytics',          icon: ClipboardList },
        { label: 'Billing',           path: '/dashboard/admin/payments',     icon: CreditCard },
      ],
    },
    {
      group: 'Account',
      items: [
        { label: 'Settings',          path: '/dashboard/settings',           icon: Settings },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface SidebarProps {
  isOpen: boolean;
  userRole: UserRole;
  userName: string;
  userEmail?: string;
  onLogout: () => void;
  onCloseMobile: () => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function getRoleLabel(role: UserRole): string {
  const map: Record<UserRole, string> = {
    admin: 'Admin Console',
    tutor: 'Tutor Portal',
    student: 'Student Portal',
    parent: 'Parent Portal',
  };
  return map[role] ?? 'Portal';
}

// ---------------------------------------------------------------------------
// Sidebar component
// ---------------------------------------------------------------------------

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  userRole,
  userName,
  userEmail,
  onLogout,
  onCloseMobile,
}) => {
  const location = useLocation();
  const groups   = NAV[userRole] ?? NAV.admin;
  const initials = getInitials(userName);
  const roleLabel = getRoleLabel(userRole);

  // Customization — safe to call unconditionally; returns no-ops when not admin
  const { isEditMode, isNavHidden, toggleNavItem } = useDashboardCustomization();

  const isActive = (item: NavItem): boolean => {
    if (item.path === '/dashboard/admin') {
      return location.pathname === '/dashboard/admin';
    }
    return (
      location.pathname === item.path ||
      location.pathname.startsWith(item.path + '/')
    );
  };

  return (
    <>
      {/* Mobile backdrop */}
      <div
        aria-hidden="true"
        onClick={onCloseMobile}
        className={[
          'fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden',
          'transition-opacity duration-300 ease-in-out',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        ].join(' ')}
      />

      {/* Sidebar */}
      <aside
        className={[
          'fixed md:sticky top-0 z-50 flex flex-col flex-shrink-0 h-screen',
          'transition-[width,transform] duration-300 ease-in-out',
          // Mobile: always 248px wide, translates off-screen when closed
          // Desktop: animates between 248px (open) and 72px (rail)
          isOpen
            ? 'w-[248px] translate-x-0'
            : 'w-[248px] -translate-x-full md:translate-x-0 md:w-[72px]',
        ].join(' ')}
        style={{
          background: 'var(--side-bg)',
          borderRight: '1px solid var(--side-border)',
          color: 'var(--side-fg)',
          fontFamily: 'var(--font-sans)',
        }}
      >

        {/* ── Brand block ──────────────────────────────────────────── */}
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: isOpen ? '0 18px' : '0',
            justifyContent: isOpen ? 'flex-start' : 'center',
            borderBottom: '1px solid var(--side-border)',
            flexShrink: 0,
            transition: 'padding 300ms ease, justify-content 300ms ease',
          }}
        >
          {/* Gold mark */}
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 9,
              background: 'var(--accent)',
              color: 'var(--accent-ink)',
              display: 'grid',
              placeItems: 'center',
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontWeight: 700,
              fontSize: 22,
              lineHeight: 1,
              letterSpacing: '-0.02em',
              flexShrink: 0,
            }}
          >
            R
          </div>

          {/* Brand word — hidden in rail mode */}
          <div
            className="overflow-hidden transition-[max-width,opacity] duration-300 ease-in-out"
            style={{
              maxWidth: isOpen ? '180px' : '0px',
              opacity: isOpen ? 1 : 0,
              lineHeight: 1.1,
            }}
          >
            <div style={{
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontWeight: 500,
              fontSize: 22,
              letterSpacing: '-0.01em',
              color: 'var(--side-fg)',
              whiteSpace: 'nowrap',
            }}>
              Ryze
            </div>
            <div style={{
              fontSize: 10.5,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--side-fg-muted)',
              marginTop: 2,
              fontWeight: 600,
              whiteSpace: 'nowrap',
            }}>
              {roleLabel}
            </div>
          </div>
        </div>

        {/* ── Scrollable nav ───────────────────────────────────────── */}
        <div
          className="flex-1 overflow-y-auto overflow-x-hidden"
          style={{
            padding: isOpen ? '18px 12px' : '14px 10px',
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(255,255,255,0.08) transparent',
            transition: 'padding 300ms ease',
          }}
        >
          {groups.map((group, gi) => (
            <div
              key={group.group}
              style={{ marginTop: gi === 0 ? 0 : 18 }}
            >
              {/* Group label — hidden in rail mode */}
              <div
                className="overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out"
                style={{
                  maxHeight: isOpen ? '24px' : '0px',
                  opacity: isOpen ? 1 : 0,
                  marginBottom: isOpen ? 8 : 0,
                }}
              >
                <div style={{
                  fontSize: 10.5,
                  fontWeight: 700,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: 'var(--side-fg-muted)',
                  padding: '0 12px 0',
                  whiteSpace: 'nowrap',
                }}>
                  {group.group}
                </div>
              </div>

              {/* Rail mode: top border separates groups */}
              {!isOpen && gi > 0 && (
                <div style={{
                  height: 1,
                  background: 'var(--side-border)',
                  marginBottom: 14,
                }} />
              )}

              {/* Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {group.items
                  .filter((item) => isEditMode || !isNavHidden(item.path))
                  .map((item) => {
                  const active = isActive(item);
                  const Icon = item.icon;
                  const hidden = isNavHidden(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={isEditMode ? '#' : item.path}
                      onClick={(e) => {
                        if (isEditMode) {
                          e.preventDefault();
                          toggleNavItem(item.path);
                        } else {
                          onCloseMobile();
                        }
                      }}
                      title={!isOpen ? item.label : undefined}
                      className="group relative"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: isOpen ? 12 : 0,
                        justifyContent: isOpen ? 'flex-start' : 'center',
                        padding: isOpen ? '8px 12px' : '10px',
                        borderRadius: 8,
                        color: active ? 'var(--side-active-fg)' : 'var(--side-fg-muted)',
                        background: active ? 'var(--side-active-bg)' : 'transparent',
                        fontFamily: 'var(--font-sans)',
                        fontSize: 13.5,
                        fontWeight: active ? 600 : 500,
                        letterSpacing: '-0.005em',
                        textDecoration: 'none',
                        transition: 'background 140ms ease, color 140ms ease',
                        position: 'relative',
                        opacity: isEditMode && hidden ? 0.35 : 1,
                        cursor: isEditMode ? 'pointer' : undefined,
                      }}
                      onMouseEnter={(e) => {
                        if (!active) {
                          (e.currentTarget as HTMLElement).style.background = 'var(--side-hover)';
                          (e.currentTarget as HTMLElement).style.color = 'var(--side-fg)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!active) {
                          (e.currentTarget as HTMLElement).style.background = 'transparent';
                          (e.currentTarget as HTMLElement).style.color = 'var(--side-fg-muted)';
                        }
                      }}
                    >
                      {/* Active rail indicator */}
                      {active && (
                        <span style={{
                          position: 'absolute',
                          left: -12,
                          top: 7,
                          bottom: 7,
                          width: 2,
                          borderRadius: 999,
                          background: 'var(--accent)',
                        }} />
                      )}

                      <Icon
                        size={17}
                        strokeWidth={active ? 1.9 : 1.6}
                        style={{ flexShrink: 0 }}
                      />

                      {/* Label */}
                      <span
                        className="whitespace-nowrap overflow-hidden transition-[max-width,opacity] duration-300 ease-in-out"
                        style={{
                          maxWidth: isOpen ? '160px' : '0px',
                          opacity: isOpen ? 1 : 0,
                          flex: 1,
                        }}
                      >
                        {item.label}
                      </span>

                      {/* Edit mode hidden indicator */}
                      {isEditMode && hidden && isOpen && (
                        <span style={{
                          display: 'flex', alignItems: 'center',
                          color: 'var(--danger)', flexShrink: 0,
                        }}>
                          <EyeOff size={11} />
                        </span>
                      )}

                      {/* Badge — pill in expanded, dot in rail */}
                      {!isEditMode && item.badge ? (
                        isOpen ? (
                          <span style={{
                            fontSize: 10.5,
                            fontWeight: 700,
                            background: `color-mix(in oklab, var(--danger) 28%, transparent)`,
                            backgroundColor: 'rgba(194,84,80,0.28)',
                            color: '#fff',
                            padding: '2px 7px',
                            borderRadius: 999,
                            minWidth: 20,
                            textAlign: 'center',
                          }}>
                            {item.badge}
                          </span>
                        ) : (
                          <span style={{
                            position: 'absolute',
                            top: 6,
                            right: 6,
                            width: 6,
                            height: 6,
                            borderRadius: 999,
                            background: 'var(--danger)',
                          }} />
                        )
                      ) : null}

                      {/* Tooltip in rail mode */}
                      {!isOpen && (
                        <span
                          aria-hidden="true"
                          className="pointer-events-none absolute left-full ml-3 z-[60] opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap hidden md:block"
                          style={{
                            background: 'var(--bg-elevated)',
                            border: '1px solid var(--border-soft)',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                            color: 'var(--fg-strong)',
                            fontSize: 11,
                            fontWeight: 600,
                            padding: '5px 10px',
                            borderRadius: 8,
                          }}
                        >
                          {item.label}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* ── User footer ──────────────────────────────────────────── */}
        <div style={{
          borderTop: '1px solid var(--side-border)',
          padding: isOpen ? 14 : 10,
          flexShrink: 0,
          transition: 'padding 300ms ease',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: isOpen ? 11 : 0,
            justifyContent: isOpen ? 'flex-start' : 'center',
            padding: isOpen ? 8 : 0,
            borderRadius: 10,
            background: isOpen ? 'rgba(255,255,255,0.025)' : 'transparent',
            border: isOpen ? '1px solid var(--side-border)' : 'none',
            transition: 'all 300ms ease',
          }}>
            {/* Avatar */}
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent), #5b3d10)',
              color: 'var(--accent-ink)',
              display: 'grid',
              placeItems: 'center',
              fontWeight: 700,
              fontSize: 13,
              flexShrink: 0,
              userSelect: 'none',
            }}>
              {initials}
            </div>

            {/* Name + email */}
            <div
              className="overflow-hidden transition-[max-width,opacity] duration-300 ease-in-out min-w-0"
              style={{
                maxWidth: isOpen ? '140px' : '0px',
                opacity: isOpen ? 1 : 0,
                flex: 1,
              }}
            >
              <div style={{
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--side-fg)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {userName}
              </div>
              {userEmail && (
                <div style={{
                  fontSize: 11,
                  color: 'var(--side-fg-muted)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {userEmail}
                </div>
              )}
            </div>

            {/* Logout */}
            {isOpen && (
              <button
                onClick={onLogout}
                title="Sign out"
                style={{
                  width: 28,
                  height: 28,
                  display: 'grid',
                  placeItems: 'center',
                  borderRadius: 7,
                  color: 'var(--side-fg-muted)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'background 140ms ease, color 140ms ease',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'var(--side-hover)';
                  (e.currentTarget as HTMLElement).style.color = 'var(--side-fg)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                  (e.currentTarget as HTMLElement).style.color = 'var(--side-fg-muted)';
                }}
              >
                <LogOut size={15} />
              </button>
            )}
          </div>

          {/* Rail logout button */}
          {!isOpen && (
            <button
              onClick={onLogout}
              title="Sign out"
              className="w-full flex items-center justify-center mt-2 rounded-lg transition-colors duration-140"
              style={{
                padding: '8px',
                color: 'var(--side-fg-muted)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                borderRadius: 8,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'var(--side-hover)';
                (e.currentTarget as HTMLElement).style.color = 'var(--side-fg)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'transparent';
                (e.currentTarget as HTMLElement).style.color = 'var(--side-fg-muted)';
              }}
            >
              <LogOut size={15} />
            </button>
          )}
        </div>

      </aside>
    </>
  );
};

// ---------------------------------------------------------------------------
// Legacy type export (kept for backward compat)
// ---------------------------------------------------------------------------

/** @deprecated URL-based routing replaces this. */
export type ModuleType =
  | 'overview' | 'courses' | 'assignments' | 'ryze-ai' | 'upload'
  | 'analytics' | 'users' | 'settings'
  | 'bot-health' | 'members' | 'classes' | 'lessons' | 'attendance' | 'reminders';
