/**
 * DashboardLayout.tsx — Ryze Portal redesign
 *
 * CSS-grid shell: sidebar | main column (topbar + scrollable content).
 * Sidebar width transitions between 248 px (expanded) and 72 px (rail).
 * Mobile: sidebar is a full-height drawer that slides in/out.
 */

import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Menu, Search, Bell, ChevronRight,
} from 'lucide-react';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../contexts/AuthContext';
import {
  PortalSettingsProvider,
  usePortalSettings,
} from '../../contexts/PortalSettingsContext';

// ---------------------------------------------------------------------------
// Breadcrumb helpers
// ---------------------------------------------------------------------------

const SEGMENT_LABELS: Record<string, string> = {
  dashboard:          'Dashboard',
  overview:           'Dashboard',
  admin:              'Admin',
  courses:            'Courses',
  assignments:        'Assignments',
  'ryze-ai':          'Ryze AI',
  calendar:           'Calendar',
  upload:             'Ingestion Studio',
  analytics:          'Analytics',
  settings:           'Settings',
  'bot-health':       'Bot Health',
  members:            'Members',
  classes:            'Classes',
  lessons:            'Lessons',
  attendance:         'Attendance',
  reminders:          'Reminder Logs',
  students:           'Students',
  parents:            'Parents',
  tutors:             'Tutors',
  payments:           'Payments',
  'tutor-payments':   'Tutor Payments',
  'progress-reports': 'Progress Reports',
  homework:           'Homework',
  alerts:             'Alerts',
  resources:          'Resources',
  announcements:      'Announcements',
};

interface Crumb { label: string; }

function buildCrumbs(pathname: string): Crumb[] {
  const segments = pathname.split('/').filter(Boolean);
  // Always start with "Admin" or "Portal" depending on path
  const crumbs: Crumb[] = [];
  for (const seg of segments) {
    const label = SEGMENT_LABELS[seg];
    if (label && !crumbs.find((c) => c.label === label)) {
      crumbs.push({ label });
    }
  }
  return crumbs.length ? crumbs : [{ label: 'Dashboard' }];
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------

const DashboardLayoutInner: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate          = useNavigate();
  const location          = useLocation();
  // Ensure the context is mounted in this subtree (DOM attrs applied by context's own useEffect)
  usePortalSettings();

  const mobileQuery = '(max-width: 767px)';
  const [isMobile, setIsMobile] = useState(
    () => window.matchMedia(mobileQuery).matches,
  );

  useEffect(() => {
    const mq = window.matchMedia(mobileQuery);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const mobileNow = window.matchMedia(mobileQuery).matches;
    if (mobileNow) return false;
    // Respect sidebarBehavior from persisted settings
    const raw = localStorage.getItem('ryze_portal_settings');
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as { sidebarBehavior?: string };
        if (parsed.sidebarBehavior === 'always-rail') return false;
        if (parsed.sidebarBehavior === 'always-open') return true;
      } catch { /* ignore */ }
    }
    return true;
  });

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (isMobile) setIsSidebarOpen(false);
  }, [location.pathname, isMobile]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => setIsSidebarOpen((v) => !v);

  const crumbs  = buildCrumbs(location.pathname);
  const initials = getInitials(user?.name ?? 'U');

  // sidebar width for grid column
  const sideW = isMobile ? '0px' : (isSidebarOpen ? '248px' : '72px');

  return (
    <div
      className="ryze-portal"
      style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : `${isSidebarOpen ? '248px' : '72px'} 1fr`,
        minHeight: '100vh',
        transition: 'grid-template-columns 220ms ease',
        background: 'var(--bg-app)',
        fontFamily: 'var(--font-sans, "Manrope", system-ui, sans-serif)',
      }}
    >
      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <Sidebar
        isOpen={isSidebarOpen}
        userRole={user?.role ?? 'student'}
        userName={user?.name ?? 'User'}
        userEmail={user?.email}
        onLogout={handleLogout}
        onCloseMobile={() => { if (isMobile) setIsSidebarOpen(false); }}
      />

      {/* ── Main column ─────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {/* ── Topbar ──────────────────────────────────────────────── */}
        <header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 30,
            height: 64,
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            background: 'color-mix(in oklab, var(--bg-app) 88%, transparent)',
            borderBottom: '1px solid var(--border-faint)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 var(--pad-page-x)',
            gap: 20,
            flexShrink: 0,
          }}
        >
          {/* Left: hamburger + breadcrumbs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, maxWidth: '40%', overflow: 'hidden' }}>
            <button
              onClick={toggleSidebar}
              aria-label="Toggle navigation"
              style={{
                width: 36,
                height: 36,
                borderRadius: 9,
                display: 'grid',
                placeItems: 'center',
                color: 'var(--fg-muted)',
                background: isSidebarOpen ? 'var(--bg-hover)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'background 140ms ease, color 140ms ease',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)';
                (e.currentTarget as HTMLElement).style.color = 'var(--fg-strong)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = isSidebarOpen ? 'var(--bg-hover)' : 'transparent';
                (e.currentTarget as HTMLElement).style.color = 'var(--fg-muted)';
              }}
            >
              <Menu size={18} />
            </button>

            {/* Breadcrumbs */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              color: 'var(--fg-muted)',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}>
              {crumbs.map((crumb, i) => (
                <React.Fragment key={crumb.label + i}>
                  {i > 0 && (
                    <ChevronRight size={14} style={{ color: 'var(--fg-faint)', flexShrink: 0 }} />
                  )}
                  <span style={{
                    color: i === crumbs.length - 1 ? 'var(--fg-strong)' : 'var(--fg-muted)',
                    fontWeight: i === crumbs.length - 1 ? 600 : 400,
                    whiteSpace: 'nowrap',
                  }}>
                    {crumb.label}
                  </span>
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Center: search */}
          <div
            style={{
              flex: 1,
              maxWidth: 460,
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 12px',
              background: 'var(--bg-surface-2)',
              border: '1px solid var(--border-soft)',
              borderRadius: 10,
              color: 'var(--fg-muted)',
              fontSize: 13,
              cursor: 'text',
              transition: 'border-color 140ms ease',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-strong)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-soft)';
            }}
          >
            <Search size={15} style={{ flexShrink: 0 }} />
            <span style={{ flex: 1 }} className="hidden sm:block">
              Search students, classes, invoices…
            </span>
            <span
              className="hidden sm:block"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10.5,
                padding: '2px 6px',
                borderRadius: 5,
                background: 'var(--bg-hover)',
                border: '1px solid var(--border-soft)',
                color: 'var(--fg-muted)',
              }}
            >
              ⌘K
            </span>
          </div>

          {/* Right: bell + divider + user */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
            {/* Bell */}
            <button
              aria-label="Notifications"
              style={{
                position: 'relative',
                width: 36,
                height: 36,
                borderRadius: 9,
                display: 'grid',
                placeItems: 'center',
                color: 'var(--fg-muted)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: 'background 140ms ease, color 140ms ease',
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
              <Bell size={16} />
              {/* Gold dot indicator */}
              <span style={{
                position: 'absolute',
                top: 7,
                right: 7,
                width: 7,
                height: 7,
                borderRadius: 999,
                background: 'var(--accent)',
                border: '2px solid var(--bg-app)',
              }} />
            </button>

            {/* Divider */}
            <div style={{
              width: 1,
              height: 22,
              background: 'var(--border-soft)',
            }} />

            {/* Name + role + avatar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="hidden md:block" style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-strong)', lineHeight: 1.2 }}>
                  {user?.name ?? 'User'}
                </div>
                <div style={{ fontSize: 11, color: 'var(--fg-muted)', textTransform: 'capitalize', lineHeight: 1.2 }}>
                  {user?.role ?? 'user'}
                </div>
              </div>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--accent), #5b3d10)',
                color: 'var(--accent-ink)',
                display: 'grid',
                placeItems: 'center',
                fontWeight: 700,
                fontSize: 13,
                userSelect: 'none',
                flexShrink: 0,
              }}>
                {initials}
              </div>
            </div>
          </div>
        </header>

        {/* ── Page content ────────────────────────────────────────── */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            scrollbarWidth: 'thin',
            scrollbarColor: 'var(--border-strong) transparent',
          }}
        >
          <React.Suspense
            fallback={
              <div style={{ flex: 1, background: 'var(--bg-app)', minHeight: '60vh' }} />
            }
          >
            <div
              key={location.pathname}
              className="page-enter"
              style={{
                padding: 'var(--pad-page-y) var(--pad-page-x)',
                maxWidth: 1480,
                margin: '0 auto',
                paddingBottom: 48,
              }}
            >
              <Outlet />
            </div>
          </React.Suspense>
        </div>

      </div>
    </div>
  );
};

const DashboardLayout: React.FC = () => (
  <PortalSettingsProvider>
    <DashboardLayoutInner />
  </PortalSettingsProvider>
);

export default DashboardLayout;
