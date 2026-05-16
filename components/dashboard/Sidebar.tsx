/**
 * Sidebar.tsx
 *
 * Role-aware navigation sidebar.  Navigation is URL-based using React Router
 * <Link> so every section has a stable, deep-linkable URL.
 *
 * Active state is derived from useLocation() so it stays correct even when the
 * user navigates via back/forward or by typing the URL directly.
 */

import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, FileText, Brain, Upload,
  BarChart3, Users, Settings, LogOut, User, X,
  CalendarDays, ClipboardList, Bell, Activity,
  ShieldAlert, CreditCard, ClipboardCheck, Home,
} from 'lucide-react';

export type UserRole = 'student' | 'parent' | 'tutor' | 'admin';

// ---------------------------------------------------------------------------
// Sidebar item definition
// ---------------------------------------------------------------------------

interface SidebarItem {
  /** The URL path segment: /dashboard/<path> */
  path: string;
  label: string;
  icon: React.ElementType;
  /** Which roles can see this item. */
  roles: UserRole[];
  highlight?: boolean;
  group: 'lms' | 'admin';
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  // ── LMS ─────────────────────────────────────────────────────────────────
  { path: 'overview',    label: 'Dashboard',       icon: LayoutDashboard, roles: ['student', 'tutor', 'admin'], group: 'lms' },
  { path: 'courses',     label: 'Courses',          icon: BookOpen,        roles: ['student', 'tutor', 'admin'], group: 'lms' },
  { path: 'assignments', label: 'Assignments',      icon: FileText,        roles: ['student', 'tutor'],          group: 'lms' },
  { path: 'ryze-ai',     label: 'Ryze AI Arena',    icon: Brain,           roles: ['student', 'tutor'],          group: 'lms', highlight: true },
  { path: 'upload',      label: 'Ingestion Studio', icon: Upload,          roles: ['tutor', 'admin'],            group: 'lms' },
  { path: 'analytics',   label: 'Analytics',        icon: BarChart3,       roles: ['student', 'tutor', 'admin'], group: 'lms' },
  { path: 'settings',    label: 'Settings',         icon: Settings,        roles: ['student', 'tutor', 'admin'], group: 'lms' },

  // ── Admin portal ─────────────────────────────────────────────────────────
  { path: 'admin',            label: 'Overview',         icon: LayoutDashboard, roles: ['admin'], group: 'admin' },
  { path: 'bot-health',       label: 'Bot Health',       icon: Activity,        roles: ['admin'], group: 'admin' },
  { path: 'admin/students',   label: 'Students',         icon: Users,           roles: ['admin'], group: 'admin' },
  { path: 'admin/parents',    label: 'Parents',          icon: Home,            roles: ['admin'], group: 'admin' },
  { path: 'admin/classes',    label: 'Classes',          icon: BookOpen,        roles: ['admin'], group: 'admin' },
  { path: 'admin/lessons',    label: 'Lessons',          icon: CalendarDays,    roles: ['admin'], group: 'admin' },
  { path: 'admin/attendance', label: 'Attendance',       icon: ClipboardList,   roles: ['admin', 'tutor'], group: 'admin' },
  { path: 'admin/payments',   label: 'Payments',         icon: CreditCard,      roles: ['admin'], group: 'admin' },
  { path: 'admin/progress-reports', label: 'Progress Reports', icon: ClipboardCheck, roles: ['admin', 'tutor'], group: 'admin' },
  { path: 'admin/alerts',     label: 'Alerts',           icon: ShieldAlert,     roles: ['admin'], group: 'admin' },
  { path: 'reminders',        label: 'Reminder Logs',    icon: Bell,            roles: ['admin'], group: 'admin' },
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
// Component
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

  const lmsItems   = SIDEBAR_ITEMS.filter((i) => i.group === 'lms'   && i.roles.includes(userRole));
  const adminItems = SIDEBAR_ITEMS.filter((i) => i.group === 'admin' && i.roles.includes(userRole));

  /** True when the current URL matches this nav item's path. */
  const isActive = (item: SidebarItem): boolean => {
    const fullPath = `/dashboard/${item.path}`;
    // For 'admin' (the overview), only match the exact path — not sub-routes.
    if (item.path === 'admin') {
      return location.pathname === fullPath;
    }
    // For all others, startsWith matches sub-routes too.
    return location.pathname === fullPath || location.pathname.startsWith(fullPath + '/');
  };

  const renderItem = (item: SidebarItem) => {
    const active = isActive(item);
    return (
      <Link
        key={item.path}
        to={`/dashboard/${item.path}`}
        onClick={onCloseMobile}
        className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-medium transition-all group relative ${
          active
            ? 'bg-[#FFB000] text-[#0a0f1e] shadow-[0_0_15px_rgba(255,176,0,0.3)]'
            : 'ryze-text-muted hover:bg-white/5 hover:ryze-text-inverse'
        } ${!isOpen ? 'justify-center' : ''}`}
      >
        <item.icon
          size={22}
          className={`shrink-0 ${item.highlight && !active ? 'text-[#FFB000]' : ''}`}
        />
        {isOpen && <span>{item.label}</span>}

        {/* Desktop tooltip when sidebar is collapsed */}
        {!isOpen && (
          <div className="hidden md:block absolute left-full ml-4 bg-[#1e293b] ryze-text-inverse px-3 py-1.5 rounded-lg text-xs opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-xl border border-white/10 font-bold tracking-wide">
            {item.label}
          </div>
        )}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`
          fixed md:relative z-50 h-full flex flex-col flex-shrink-0 transition-all duration-300
          bg-[#0a0f1e] ryze-text-inverse-muted border-r border-white/5
          ${isOpen ? 'translate-x-0 w-72' : '-translate-x-full md:translate-x-0 md:w-24'}
        `}
      >
        {/* Brand */}
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={brandLogoUrl} alt="Ryze" width={125} height={32} className="h-8 w-auto" />
            {isOpen && (
              <span className="font-bold text-xl tracking-tight ryze-text-inverse">
                Ryze<span className="text-[#FFB000]">OS</span>
              </span>
            )}
          </div>
          <button
            onClick={onCloseMobile}
            className="md:hidden ryze-text-muted hover:ryze-text-inverse"
            aria-label="Close sidebar"
          >
            <X size={24} />
          </button>
        </div>

        {/* Nav */}
        <div className="p-6 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-white/10">
          {/* User context */}
          <div
            className={`bg-white/5 rounded-2xl p-4 flex items-center gap-4 mb-8 border border-white/5 ${
              !isOpen ? 'justify-center' : ''
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-[#FFB000] flex items-center justify-center text-[#0a0f1e] shrink-0 font-bold">
              <User size={20} />
            </div>
            {isOpen && (
              <div className="overflow-hidden">
                <div className="font-bold text-sm ryze-text-inverse truncate">{userName}</div>
                <div className="text-xs ryze-text-muted capitalize">{userRole} Account</div>
              </div>
            )}
          </div>

          {/* LMS section */}
          {lmsItems.length > 0 && (
            <nav className="space-y-2 mb-6">
              {isOpen && (
                <div className="text-[10px] font-bold ryze-text-muted uppercase tracking-widest mb-3 px-1">
                  Learning
                </div>
              )}
              {lmsItems.map(renderItem)}
            </nav>
          )}

          {/* Admin section */}
          {adminItems.length > 0 && (
            <>
              {isOpen ? (
                <div className="text-[10px] font-bold ryze-text-muted uppercase tracking-widest mb-3 px-1 mt-6">
                  Admin Portal
                </div>
              ) : (
                <div className="border-t border-white/5 my-4" />
              )}
              <nav className="space-y-2">
                {adminItems.map(renderItem)}
              </nav>
            </>
          )}
        </div>

        {/* Logout */}
        <div className="p-6 bg-[#0a0f1e] border-t border-white/5">
          <button
            onClick={onLogout}
            className={`flex items-center gap-4 ryze-text-muted hover:ryze-text-inverse transition-colors text-sm font-medium w-full px-4 py-2 ${
              !isOpen ? 'justify-center' : ''
            }`}
          >
            <LogOut size={20} />
            {isOpen && 'Sign Out'}
          </button>
        </div>
      </aside>
    </>
  );
};

// ---------------------------------------------------------------------------
// Legacy type export (kept for Dashboard.tsx backward compat during migration)
// ---------------------------------------------------------------------------

/** @deprecated URL-based routing replaces this. Use the route path instead. */
export type ModuleType =
  | 'overview' | 'courses' | 'assignments' | 'ryze-ai' | 'upload'
  | 'analytics' | 'users' | 'settings'
  | 'bot-health' | 'members' | 'classes' | 'lessons' | 'attendance' | 'reminders';
