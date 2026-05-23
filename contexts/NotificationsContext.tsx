/**
 * NotificationsContext.tsx
 *
 * Manages the in-app notification feed for the portal.
 *
 * Architecture:
 *   - Full list:   fetched from GET /api/notifications on mount and every
 *                  POLL_FULL_MS (5 min), or when the notification panel opens.
 *   - Unread count: polled cheaply from GET /api/notifications/unread-count
 *                  every POLL_COUNT_MS (30 s) so the bell badge stays current
 *                  without transferring 50 records.
 *   - Optimistic reads: when the user marks a notification read, the UI
 *                  responds immediately via a local pendingReadIds set; the
 *                  server is patched in the background. On the next full-list
 *                  fetch the server's read field takes over.
 *   - Dev fallback: if the API returns 404 (backend not yet running) in dev
 *                  mode, a set of mock notifications is shown so the UI is
 *                  always workable during local development. Never in prod.
 */

import React, {
  createContext, useCallback, useContext, useEffect, useRef, useState,
} from 'react';
import { portalFetch } from '../services/auth';
import { notificationApi, ApiNotification } from '../services/notificationApi';

const POLL_FULL_MS  = 5 * 60_000;  // full list every 5 min
const POLL_COUNT_MS = 30_000;       // unread count every 30 s

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Frontend display type derived from the DB type string.
 * Used for icon + colour selection in NotificationPanel.
 */
export type NotifType =
  | 'alert'    // system alert (red/orange)
  | 'lesson'   // lesson event (gold)
  | 'payment'  // payment (green)
  | 'student'  // student update
  | 'system';  // generic system

/** Map DB type strings → frontend display type */
function toDisplayType(dbType: string): NotifType {
  switch (dbType) {
    case 'overdue_payment':
    case 'payment_due':
    case 'payment':
      return 'payment';
    case 'lesson_reminder':
    case 'lesson':
      return 'lesson';
    case 'attendance_unmarked':
    case 'admin_alert':
    case 'alert':
      return 'alert';
    case 'progress_missing':
    case 'student':
      return 'student';
    default:
      return 'system';
  }
}

export interface Notification {
  id:         string;
  type:       NotifType;
  /** Original DB type string — useful for filtering/analytics */
  dbType:     string;
  title:      string;
  body:       string;
  /** Whether the server has this notification as read */
  read:       boolean;
  /** ISO timestamp */
  created_at: string;
  /** Optional URL to navigate on click */
  href?:      string;
}

// ---------------------------------------------------------------------------
// Context shape
// ---------------------------------------------------------------------------

interface NotificationsContextValue {
  notifications:  Notification[];
  unreadCount:    number;
  loading:        boolean;
  markRead:       (id: string) => void;
  markAllRead:    () => void;
  /** Trigger an immediate full-list refresh (e.g. on panel open) */
  refresh:        () => void;
}

const NotificationsContext = createContext<NotificationsContextValue>({
  notifications: [],
  unreadCount:   0,
  loading:       false,
  markRead:      () => undefined,
  markAllRead:   () => undefined,
  refresh:       () => undefined,
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function apiToNotif(n: ApiNotification): Notification {
  return {
    id:         String(n.id),
    type:       toDisplayType(n.type),
    dbType:     n.type,
    title:      n.title  ?? '',
    body:       n.body   ?? '',
    read:       n.read   ?? false,
    created_at: n.created_at,
    href:       n.href   ?? undefined,
  };
}

// Dev-only mock data (never shown in production)
function buildMockNotifications(): Notification[] {
  const now = Date.now();
  return [
    {
      id: 'mock-1', type: 'alert', dbType: 'admin_alert',
      title: '3 students missed lesson check-ins', read: false,
      body:  'Foundations · Wed 4 pm — automated reminders sent.',
      created_at: new Date(now - 8  * 60_000).toISOString(),
      href: '/dashboard/admin/alerts',
    },
    {
      id: 'mock-2', type: 'payment', dbType: 'overdue_payment',
      title: '2 invoices overdue', read: false,
      body:  '$480 outstanding across 2 families.',
      created_at: new Date(now - 3  * 3600_000).toISOString(),
      href: '/dashboard/admin/payments',
    },
    {
      id: 'mock-3', type: 'lesson', dbType: 'lesson_reminder',
      title: 'Maths Ext 1 — live now', read: false,
      body:  'Studio B · Daniel Kwok · 8/8 students checked in.',
      created_at: new Date(now - 10 * 60_000).toISOString(),
      href: '/dashboard/admin/lessons',
    },
    {
      id: 'mock-4', type: 'student', dbType: 'progress_missing',
      title: 'No progress reports — Foundations', read: true,
      body:  'Class has no progress reports in the last 45 days.',
      created_at: new Date(now - 25 * 3600_000).toISOString(),
      href: '/dashboard/admin/progress-reports',
    },
  ];
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications]   = useState<Notification[]>([]);
  const [serverUnread,  setServerUnread]     = useState<number>(0);
  const [pendingReadIds, setPendingReadIds]  = useState<Set<string>>(new Set());
  const [loading, setLoading]               = useState(true);
  const isMounted                           = useRef(true);
  const isMockMode                          = useRef(false);  // dev fallback flag

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  // ── Full list fetch ────────────────────────────────────────────────────── //

  const fetchNotifications = useCallback(async () => {
    try {
      const raw = await notificationApi.list();
      if (!isMounted.current) return;

      isMockMode.current = false;
      const notifs = raw.map(apiToNotif);
      setNotifications(notifs);
      // Derive server-side unread count from the fresh list
      setServerUnread(notifs.filter((n) => !n.read).length);
      // Clear optimistic reads that the server now confirms
      setPendingReadIds((prev) => {
        const confirmed = new Set<string>(
          notifs.filter((n) => n.read).map((n) => n.id)
        );
        const next = new Set(prev);
        confirmed.forEach((id) => next.delete(id));
        return next;
      });
    } catch (e: any) {
      if (!isMounted.current) return;
      const isDev      = (import.meta as any).env?.DEV === true;
      const isAuthErr  = String(e?.message ?? '').includes('401') ||
                         String(e?.message ?? '').toLowerCase().includes('unauthori');
      if (isDev && !isAuthErr) {
        isMockMode.current = true;
        const mocks = buildMockNotifications();
        setNotifications(mocks);
        setServerUnread(mocks.filter((n) => !n.read).length);
      } else {
        setNotifications([]);
        setServerUnread(0);
      }
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, []);

  // ── Cheap unread count poll ────────────────────────────────────────────── //

  const pollUnreadCount = useCallback(async () => {
    if (isMockMode.current) return; // don't poll in mock mode
    try {
      const { count } = await notificationApi.unreadCount();
      if (isMounted.current) {
        // Only update if count differs — avoids unnecessary re-renders
        setServerUnread((prev) => (prev !== count ? count : prev));
      }
    } catch { /* non-fatal — badge stays at last known value */ }
  }, []);

  // Mount: full fetch
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Full list re-fetch every 5 min
  useEffect(() => {
    const id = setInterval(fetchNotifications, POLL_FULL_MS);
    return () => clearInterval(id);
  }, [fetchNotifications]);

  // Cheap count poll every 30 s (starts after initial load completes)
  useEffect(() => {
    const id = setInterval(pollUnreadCount, POLL_COUNT_MS);
    return () => clearInterval(id);
  }, [pollUnreadCount]);

  // ── unreadCount ──────────────────────────────────────────────────────── //
  // Combine the server-authoritative count with any optimistic local reads.
  // pendingReadIds = IDs the user has clicked "read" since the last full fetch.

  const unreadCount = Math.max(0, serverUnread - pendingReadIds.size);

  // ── markRead ──────────────────────────────────────────────────────────── //

  const markRead = useCallback((id: string) => {
    setPendingReadIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    // Optimistically reflect in notification list too
    setNotifications((prev) =>
      prev.map((n) => n.id === id ? { ...n, read: true } : n)
    );
    // Persist to server (mock IDs start with 'mock-')
    if (!id.startsWith('mock-')) {
      notificationApi.markRead(id).catch(() => { /* non-fatal */ });
    }
  }, []);

  // ── markAllRead ───────────────────────────────────────────────────────── //

  const markAllRead = useCallback(() => {
    const allIds = notifications.map((n) => n.id);
    setPendingReadIds((prev) => {
      const next = new Set(prev);
      allIds.forEach((id) => next.add(id));
      return next;
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setServerUnread(0);
    if (!isMockMode.current) {
      notificationApi.markAllRead().catch(() => { /* non-fatal */ });
    }
  }, [notifications]);

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        markRead,
        markAllRead,
        refresh: fetchNotifications,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useNotifications() {
  return useContext(NotificationsContext);
}
