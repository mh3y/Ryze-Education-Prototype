/**
 * Sidebar.tsx
 *
 * Role-aware navigation sidebar with smooth expand/collapse behaviour.
 *
 * Desktop — width animates between 260 px (open) and 72 px (collapsed).
 * Mobile  — full-width drawer (260 px) slides in/out with a backdrop overlay.
 *
 * Branding
 * ─────────
 * Expanded  : Ryze logo image
 * Collapsed : Gold "R" monogram (desktop only — mobile is hidden)
 *
 * Nav labels fade and slide in/out via CSS max-width + opacity so the
 * animation is GPU-composited and never causes layout reflow.
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, FileText, Brain, Upload,
  BarChart3, Settings, LogOut,
  CalendarDays, ClipboardList, Bell, Activity,
  ShieldAlert, CreditCard, ClipboardCheck, Home,
  FolderOpen, Megaphone, DollarSign, PenLine, Users,
} from 'lucide-react';

export type UserRole = 'student' | 'parent' | 'tutor' | 'admin';

// ---------------------------------------------------------------------------
// Nav item model
// ---------------------------------------------------------------------------

interface SidebarItem {
  path: string;
  label: string;
  icon: React.ElementType;
  roles: UserRole[];
  highlight?: boolean;
  group: 'lms' | 'admin';
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  // ── LMS ──────────────────────────────────────────────────────────────────
  { path: 'overview',    label: 'Dashboard',        icon: LayoutDashboard, roles: ['student', 'tutor', 'admin', 'parent'], group: 'lms' },
  { path: 'courses',     label: 'Courses',           icon: BookOpen,        roles: ['student', 'tutor', 'admin'],           group: 'lms' },
  { path: 'assignments', label: 'Assignments',       icon: FileText,        roles: ['student', 'tutor'],                    group: 'lms' },
  { path: 'ryze-ai',     label: 'Ryze AI Arena',     icon: Brain,           roles: ['student', 'tutor'],                    group: 'lms', highlight: true },
  { path: 'upload',      label: 'Ingestion Studio',  icon: Upload,          roles: ['tutor', 'admin'],                      group: 'lms' },
  { path: 'calendar',    label: 'Calendar',          icon: CalendarDays,    roles: ['student', 'tutor', 'admin', 'parent'], group: 'lms' },
  { path: 'analytics',   label: 'Analytics',         icon: BarChart3,       roles: ['student', 'tutor', 'admin'],           group: 'lms' },
  { path: 'settings',    label: 'Settings',          icon: Settings,        roles: ['student', 'tutor', 'admin', 'parent'], group: 'lms' },

  // ── Admin portal ──────────────────────────────────────────────────────────
  { path: 'admin',                  label: 'Overview',          icon: LayoutDashboard, roles: ['admin'],           group: 'admin' },
  { path: 'bot-health',             label: 'Bot Health',        icon: Activity,        roles: ['admin'],           group: 'admin' },
  { path: 'admin/students',         label: 'Students',          icon: Users,           roles: ['admin'],           group: 'admin' },
  { path: 'admin/parents',          label: 'Parents',           icon: Home,            roles: ['admin'],           group: 'admin' },
  { path: 'admin/classes',          label: 'Classes',           icon: BookOpen,        roles: ['admin'],           group: 'admin' },
  { path: 'admin/lessons',          label: 'Lessons',           icon: CalendarDays,    roles: ['admin'],           group: 'admin' },
  { path: 'admin/attendance',       label: 'Attendance',        icon: ClipboardList,   roles: ['admin', 'tutor'],  group: 'admin' },
  { path: 'admin/payments',         label: 'Payments',          icon: CreditCard,      roles: ['admin'],           group: 'admin' },
  { path: 'admin/progress-reports', label: 'Progress Reports',  icon: ClipboardCheck,  roles: ['admin', 'tutor'],  group: 'admin' },
  { path: 'admin/homework',         label: 'Homework',          icon: PenLine,         roles: ['admin', 'tutor'],  group: 'admin' },
  { path: 'admin/tutor-payments',   label: 'Tutor Payments',    icon: DollarSign,      roles: ['admin'],           group: 'admin' },
  { path: 'admin/alerts',           label: 'Alerts',            icon: ShieldAlert,     roles: ['admin'],           group: 'admin' },
  { path: 'admin/resources',        label: 'Resources',         icon: FolderOpen,      roles: ['admin', 'tutor'],  group: 'admin' },
  { path: 'admin/announcements',    label: 'Announcements',     icon: Megaphone,       roles: ['admin'],           group: 'admin' },
  { path: 'reminders',              label: 'Reminder Logs',     icon: Bell,            roles: ['admin'],           group: 'admin' },
];

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface SidebarProps {
  isOpen: boolean;
  userRole: UserRole;
  userName: string;
  onLogout: () => void;
  onCloseMobile: () => void;
}

// ---------------------------------------------------------------------------
// Sidebar
// ---------------------------------------------------------------------------

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  userRole,
  userName,
  onLogout,
  onCloseMobile,
}) => {
  const location = useLocation();

  const brandLogoUrl =
    'https://res.cloudinary.com/dsvjhemjd/image/upload/f_auto,q_auto:good,c_limit,w_240,dpr_auto/v1764105292/yellow_logo_png_bvs11z.png';

  const initials = userName.trim().charAt(0).toUpperCase() || '?';

  const lmsItems   = SIDEBAR_ITEMS.filter((i) => i.group === 'lms'   && i.roles.includes(userRole));
  const adminItems = SIDEBAR_ITEMS.filter((i) => i.group === 'admin' && i.roles.includes(userRole));

  const isActive = (item: SidebarItem): boolean => {
    const fullPath = `/dashboard/${item.path}`;
    if (item.path === 'admin') return location.pathname === fullPath;
    return location.pathname === fullPath || location.pathname.startsWith(`${fullPath}/`);
  };

  // ── Section heading helper ─────────────────────────────────────────────────

  const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div
      className="overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out"
      style={{
        maxHeight: isOpen ? '24px' : '0px',
        opacity:   isOpen ? 1       : 0,
        marginBottom: isOpen ? '6px' : '0px',
      }}
    >
      <p className="text-[10px] font-bold ryze-text-muted uppercase tracking-widest px-2 select-none">
        {children}
      </p>
    </div>
  );

  // ── Nav item ───────────────────────────────────────────────────────────────

  const renderItem = (item: SidebarItem) => {
    const active = isActive(item);
    const Icon   = item.icon;

    return (
      <Link
        key={item.path}
        to={`/dashboard/${item.path}`}
        onClick={onCloseMobile}
        aria-label={item.label}
        className={[
          'relative flex items-center rounded-xl text-[13px] font-medium',
          'transition-all duration-200 ease-in-out group select-none',
          isOpen
            ? 'gap-3 px-3 py-2.5'
            : 'justify-center px-0 py-2.5 mx-auto w-10',
          active
            ? 'bg-[#FFB000] text-[#07090f] shadow-[0_4px_20px_rgba(255,176,0,0.30)]'
            : 'ryze-text-muted hover:bg-white/5 hover:ryze-text-inverse',
        ].join(' ')}
      >
        {/* Icon */}
        <Icon
          size={17}
          strokeWidth={active ? 2.5 : 2}
          className={[
            'shrink-0 transition-colors duration-200',
            item.highlight && !active ? 'text-[#FFB000]' : '',
          ].join(' ')}
        />

        {/* Label — GPU-animated via max-width + opacity */}
        <span
          className="whitespace-nowrap overflow-hidden leading-none transition-[max-width,opacity] duration-300 ease-in-out"
          style={{
            maxWidth: isOpen ? '200px' : '0px',
            opacity:  isOpen ? 1       : 0,
          }}
        >
          {item.label}
        </span>

        {/* Tooltip shown when collapsed (desktop) */}
        {!isOpen && (
          <span
            aria-hidden="true"
            className={[
              'pointer-events-none absolute left-full ml-3 z-[60]',
              'bg-[#0a0f1e] border border-white/10 shadow-2xl',
              'ryze-text-inverse text-[11px] font-semibold px-2.5 py-1.5 rounded-lg',
              'opacity-0 group-hover:opacity-100 transition-opacity duration-150',
              'whitespace-nowrap hidden md:block',
              // Arrow
              'before:content-[""] before:absolute before:right-full before:top-1/2 before:-translate-y-1/2',
              'before:border-[5px] before:border-transparent before:border-r-[#141b2e]',
            ].join(' ')}
          >
            {item.label}
          </span>
        )}
      </Link>
    );
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Mobile backdrop ── */}
      <div
        aria-hidden="true"
        onClick={onCloseMobile}
        className={[
          'fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden',
          'transition-opacity duration-300 ease-in-out',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        ].join(' ')}
      />

      {/* ── Sidebar ── */}
      <aside
        className={[
          // Layout
          'fixed md:relative z-50 flex flex-col flex-shrink-0 h-full',
          // Visual
          'bg-[#07090f] border-r border-white/10',
          // Width: 260 px open, 72 px collapsed (desktop), off-screen (mobile closed)
          'transition-[width,transform] duration-300 ease-in-out',
          isOpen
            ? 'w-[260px] translate-x-0'
            : 'w-[260px] -translate-x-full md:translate-x-0 md:w-[72px]',
        ].join(' ')}
      >

        {/* ── Brand ──────────────────────────────────────────────── */}
        {/*
          Two separate techniques to avoid the "squash" bug:
          • Logo uses max-width collapse (same GPU-composited trick as nav labels).
            It never touches absolute positioning so the sidebar-width animation
            cannot distort it.
          • R monogram uses absolute centering but only appears AFTER the logo
            has fully hidden (150 ms transition-delay), so both are never
            simultaneously visible.
        */}
        <div className="relative h-[64px] flex-shrink-0 border-b border-white/10 overflow-hidden">

          {/* Logo — collapses horizontally as sidebar narrows */}
          <div
            className="h-full flex items-center overflow-hidden transition-[max-width,opacity] duration-300 ease-in-out"
            style={{
              maxWidth: isOpen ? '240px' : '0px',
              opacity:  isOpen ? 1       : 0,
            }}
          >
            {/* Inner wrapper keeps the logo off the left edge */}
            <div className="pl-5 pr-3 flex items-center flex-shrink-0">
              <img
                src={brandLogoUrl}
                alt="Ryze Education"
                className="h-[28px] w-auto block"
                draggable={false}
              />
            </div>
          </div>

          {/* R monogram — desktop only, appears after logo is gone */}
          <div
            className="absolute inset-0 hidden md:flex items-center justify-center"
            style={{
              opacity: isOpen ? 0 : 1,
              // When expanding: hide immediately (no delay)
              // When collapsing: wait 150 ms for logo to disappear first
              transition: isOpen
                ? 'opacity 100ms ease-in-out 0ms'
                : 'opacity 200ms ease-in-out 150ms',
              pointerEvents: isOpen ? 'none' : 'auto',
            }}
          >
            <div className="w-9 h-9 rounded-xl bg-[#FFB000]/10 border border-[#FFB000]/20 flex items-center justify-center">
              <span className="text-[#FFB000] font-black text-[15px] leading-none select-none">
                R
              </span>
            </div>
          </div>
        </div>

        {/* ── Scrollable nav ───────────────────────────────────────── */}
        <div
          className={[
            'flex-1 overflow-y-auto overflow-x-hidden',
            'transition-[padding] duration-300 ease-in-out py-4',
            'scrollbar-none',
            isOpen ? 'px-3' : 'px-[10px]',
          ].join(' ')}
        >

          {/* User card */}
          <div
            className={[
              'flex items-center rounded-xl mb-5 overflow-hidden',
              'transition-all duration-300 ease-in-out',
              isOpen
                ? 'gap-3 p-3 bg-white/5 border border-white/10'
                : 'justify-center p-0',
            ].join(' ')}
          >
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FFB000] to-[#d4890a] flex items-center justify-center text-[#07090f] font-black text-[13px] shrink-0 select-none">
              {initials}
            </div>

            {/* Name / role — GPU-animated */}
            <div
              className="overflow-hidden transition-[max-width,opacity] duration-300 ease-in-out min-w-0"
              style={{
                maxWidth: isOpen ? '180px' : '0px',
                opacity:  isOpen ? 1       : 0,
              }}
            >
              <p className="text-[13px] font-semibold ryze-text-inverse truncate leading-tight">
                {userName}
              </p>
              <p className="text-[11px] ryze-text-muted capitalize leading-tight mt-0.5">
                {userRole}
              </p>
            </div>
          </div>

          {/* ── LMS items ── */}
          {lmsItems.length > 0 && (
            <div className="mb-4">
              <SectionLabel>Learning</SectionLabel>
              <nav className="space-y-0.5">
                {lmsItems.map(renderItem)}
              </nav>
            </div>
          )}

          {/* ── Admin items ── */}
          {adminItems.length > 0 && (
            <div>
              {/* Divider */}
              <div
                className={[
                  'border-t border-white/10',
                  'transition-[margin] duration-300 ease-in-out',
                  isOpen ? 'mx-1 my-4' : 'mx-0 my-3',
                ].join(' ')}
              />
              <SectionLabel>Admin</SectionLabel>
              <nav className="space-y-0.5">
                {adminItems.map(renderItem)}
              </nav>
            </div>
          )}
        </div>

        {/* ── Footer / sign-out ──────────────────────────────────── */}
        <div
          className={[
            'border-t border-white/10 flex-shrink-0',
            'transition-[padding] duration-300 ease-in-out py-3',
            isOpen ? 'px-3' : 'px-[10px]',
          ].join(' ')}
        >
          <button
            onClick={onLogout}
            className={[
              'flex items-center rounded-xl text-[13px] font-medium',
              'ryze-text-muted hover:bg-white/5 hover:ryze-text-inverse',
              'transition-all duration-200 ease-in-out w-full',
              isOpen ? 'gap-3 px-3 py-2.5' : 'justify-center px-0 py-2.5',
            ].join(' ')}
          >
            <LogOut size={17} className="shrink-0" />
            <span
              className="whitespace-nowrap overflow-hidden transition-[max-width,opacity] duration-300 ease-in-out"
              style={{
                maxWidth: isOpen ? '160px' : '0px',
                opacity:  isOpen ? 1       : 0,
              }}
            >
              Sign out
            </span>
          </button>
        </div>

      </aside>
    </>
  );
};

// ---------------------------------------------------------------------------
// Legacy type export
// ---------------------------------------------------------------------------

/** @deprecated URL-based routing replaces this. */
export type ModuleType =
  | 'overview' | 'courses' | 'assignments' | 'ryze-ai' | 'upload'
  | 'analytics' | 'users' | 'settings'
  | 'bot-health' | 'members' | 'classes' | 'lessons' | 'attendance' | 'reminders';
