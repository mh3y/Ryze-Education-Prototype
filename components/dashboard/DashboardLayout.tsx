/**
 * DashboardLayout.tsx
 *
 * Persistent shell (sidebar + top header) for all dashboard pages.
 * Uses React Router <Outlet /> so nested routes render inside the content area.
 *
 * Route tree (App.tsx):
 *   /dashboard              → DashboardLayout (this file)
 *     index                → redirect to /dashboard/overview
 *     overview             → OverviewPage
 *     calendar             → CalendarPage
 *     ryze-ai              → AiArena
 *     upload               → IngestionStudio
 *     bot-health           → BotHealth
 *     members              → StudentsView
 *     reminders            → RemindersView
 *     admin/*              → admin sub-routes (Phase 3+)
 */

import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Menu, Search, Bell } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../contexts/AuthContext';

// ---------------------------------------------------------------------------
// Path → human-readable title
// ---------------------------------------------------------------------------

const PATH_TITLES: Record<string, string> = {
  overview:             'Dashboard',
  courses:              'Courses',
  assignments:          'Assignments',
  'ryze-ai':            'Ryze AI Arena',
  calendar:             'Calendar',
  upload:               'Ingestion Studio',
  analytics:            'Analytics',
  settings:             'Settings',
  'bot-health':         'Bot Health',
  members:              'Members',
  classes:              'Class Groups',
  lessons:              'Lessons',
  attendance:           'Attendance',
  reminders:            'Reminder Logs',
  admin:                'Admin Portal',
  students:             'Students',
  parents:              'Parents',
  tutors:               'Tutors',
  payments:             'Payments',
  'tutor-payments':     'Tutor Payments',
  'progress-reports':   'Progress Reports',
  homework:             'Homework',
  alerts:               'Alerts',
  resources:            'Resources',
  announcements:        'Announcements',
};

function getTitle(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  for (let i = segments.length - 1; i >= 0; i--) {
    const t = PATH_TITLES[segments[i]];
    if (t) return t;
  }
  return 'Dashboard';
}

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------

const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate          = useNavigate();
  const location          = useLocation();

  // Start expanded on desktop, closed on mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth >= 768);

  // Close sidebar on mobile when route changes (navigation happened)
  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => setIsSidebarOpen((v) => !v);

  const title    = getTitle(location.pathname);
  const initials = (user?.name ?? 'U').trim().charAt(0).toUpperCase();

  return (
    <div className="ryze-dashboard flex h-screen bg-transparent overflow-hidden relative">
      {/* Z-layer background (Starfield renders beneath this via App.tsx) */}
      <div className="relative z-10 flex h-full w-full">

        {/* ── Sidebar ─────────────────────────────────────────────── */}
        <Sidebar
          isOpen={isSidebarOpen}
          userRole={user?.role ?? 'student'}
          userName={user?.name ?? 'User'}
          onLogout={handleLogout}
          onCloseMobile={() => { if (window.innerWidth < 768) setIsSidebarOpen(false); }}
        />

        {/* ── Main column ─────────────────────────────────────────── */}
        {/*
            On desktop the sidebar is in-flow (relative), so flex-1 here
            expands to fill the remaining space.  The transition-[margin]
            is NOT needed because the sidebar width itself animates and
            the browser reflows automatically — adding transition here
            would cause double-animation. The content just follows naturally.
        */}
        <main className="flex-1 flex flex-col overflow-hidden relative min-w-0">

          {/* ── Top header ─────────────────────────────────────────── */}
          <header className="h-[60px] md:h-[64px] bg-[#07090f]/90 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-4 md:px-6 flex-shrink-0 z-20">

            {/* Left: toggle + page title */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={toggleSidebar}
                aria-label="Toggle navigation"
                className={[
                  'flex items-center justify-center w-9 h-9 rounded-xl',
                  'ryze-text-muted hover:ryze-text-inverse hover:bg-white/5',
                  'transition-all duration-200 flex-shrink-0',
                  isSidebarOpen ? 'bg-white/5' : '',
                ].join(' ')}
              >
                <Menu size={18} />
              </button>

              {/* Breadcrumb divider */}
              <span className="text-white/10 select-none hidden md:block">{'/'}</span>

              <h1 className="text-[15px] md:text-[16px] font-semibold ryze-text-inverse truncate hidden md:block">
                {title}
              </h1>
            </div>

            {/* Right: search + bell + user avatar */}
            <div className="flex items-center gap-2 md:gap-3">

              {/* Search — desktop only */}
              <div className="relative hidden md:block">
                <input
                  type="text"
                  placeholder="Search…"
                  className={[
                    'pl-9 pr-4 py-2 rounded-xl text-[13px]',
                    'bg-white/5 border border-white/10',
                    'ryze-text-inverse placeholder-slate-600',
                    'focus:outline-none focus:border-[#FFB000]/40 focus:bg-white/5',
                    'transition-all duration-200 w-52',
                  ].join(' ')}
                />
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 ryze-text-muted pointer-events-none"
                />
              </div>

              {/* Notification bell */}
              <button
                aria-label="Notifications"
                className="flex items-center justify-center w-9 h-9 rounded-xl ryze-text-muted hover:ryze-text-inverse hover:bg-white/5 transition-all duration-200 relative"
              >
                <Bell size={17} />
                {/* Unread indicator dot */}
                <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#FFB000]" />
              </button>

              {/* User avatar + name (desktop) */}
              <div className="flex items-center gap-2.5 pl-1">
                <div className="text-right hidden md:block">
                  <p className="text-[13px] font-semibold ryze-text-inverse leading-tight">
                    {user?.name}
                  </p>
                  <p className="text-[11px] ryze-text-muted capitalize leading-tight">
                    {user?.role}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FFB000] to-[#d4890a] flex items-center justify-center text-[#07090f] font-black text-[13px] select-none flex-shrink-0">
                  {initials}
                </div>
              </div>

            </div>
          </header>

          {/* ── Page content ────────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto relative bg-transparent scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {/* Subtle dot-grid texture */}
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:36px_36px] opacity-[0.025] pointer-events-none"
            />
            <div className="relative z-10 min-h-full p-4 md:p-7 max-w-[1600px] mx-auto pb-24 md:pb-8">
              <Outlet />
            </div>
          </div>

        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
