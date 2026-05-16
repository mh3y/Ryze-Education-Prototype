/**
 * DashboardLayout.tsx
 *
 * The persistent shell (sidebar + top header) for all dashboard pages.
 * Uses React Router <Outlet /> so nested routes render inside the content area.
 *
 * Route tree (App.tsx):
 *   /dashboard                → DashboardLayout (this file)
 *     index                  → redirect to /dashboard/overview
 *     overview               → OverviewPage
 *     ryze-ai                → AiArena
 *     upload                 → IngestionStudio
 *     bot-health             → BotHealth
 *     members                → StudentsView
 *     classes                → ClassesView
 *     lessons                → LessonsView
 *     attendance             → AttendanceView
 *     reminders              → RemindersView
 *     admin/*                → admin sub-routes (Phase 3+)
 */

import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layers, Search, User } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../contexts/AuthContext';

// Map URL segments to human-readable titles
const PATH_TITLES: Record<string, string> = {
  overview:   'Dashboard',
  courses:    'Courses',
  assignments: 'Assignments',
  'ryze-ai':  'Ryze AI Arena',
  upload:     'Ingestion Studio',
  analytics:  'Analytics',
  settings:   'Settings',
  'bot-health': 'Bot Health',
  members:    'Members',
  classes:    'Class Groups',
  lessons:    'Lessons',
  attendance: 'Attendance',
  reminders:  'Reminder Logs',
  // Admin sub-sections
  admin:      'Admin Portal',
  students:   'Students',
  parents:    'Parents',
  tutors:     'Tutors',
  payments:   'Payments',
  'tutor-payments': 'Tutor Payments',
  'progress-reports': 'Progress Reports',
  homework:   'Homework',
  alerts:     'Alerts',
  resources:  'Resources',
  announcements: 'Announcements',
};

function getTitle(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  // Use the last meaningful segment for the title
  for (let i = segments.length - 1; i >= 0; i--) {
    const title = PATH_TITLES[segments[i]];
    if (title) return title;
  }
  return 'Dashboard';
}

const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const title = getTitle(location.pathname);

  return (
    <div
      className="flex h-screen bg-transparent font-sans overflow-hidden text-slate-200 relative selection:bg-[#FFB000] selection:ryze-text-primary"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <div className="relative z-10 flex h-full w-full">
        {/* Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          userRole={user?.role ?? 'student'}
          userName={user?.name ?? 'User'}
          onLogout={handleLogout}
          onCloseMobile={() => setIsSidebarOpen(false)}
        />

        {/* Main content area */}
        <main className="flex-1 flex flex-col overflow-hidden relative min-w-0">

          {/* Top header */}
          <header className="h-16 md:h-20 bg-[#050510]/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-4 md:px-8 flex-shrink-0 z-10">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="ryze-text-muted hover:ryze-text-inverse transition-colors"
                aria-label="Toggle sidebar"
              >
                <Layers size={20} />
              </button>
              <h1 className="text-lg md:text-xl font-bold ryze-text-inverse capitalize tracking-wide truncate">
                {title}
              </h1>
            </div>

            <div className="flex items-center gap-4 md:gap-6">
              <div className="relative hidden md:block group">
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2.5 rounded-full bg-white/5 border border-white/5 text-sm focus:border-[#FFB000]/50 focus:ring-1 focus:ring-[#FFB000]/50 outline-none w-64 transition-all ryze-text-inverse placeholder-slate-500"
                />
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 ryze-text-muted"
                />
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right hidden md:block">
                  <div className="text-sm font-bold ryze-text-inverse">{user?.name}</div>
                  <div className="text-xs ryze-text-muted capitalize">{user?.role}</div>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#FFB000] flex items-center justify-center text-[#0a0f1e] font-bold">
                  <User size={16} />
                </div>
              </div>
            </div>
          </header>

          {/* Route content */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8 relative bg-transparent scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent scroll-smooth">
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:40px_40px] opacity-[0.03] pointer-events-none" />
            <div className="relative z-10 h-full max-w-[1600px] mx-auto pb-20 md:pb-0">
              <Outlet />
            </div>
          </div>

        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
