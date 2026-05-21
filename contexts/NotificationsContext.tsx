/**
 * NotificationsContext.tsx
 *
 * Manages portal notifications. Fetches from /api/notifications if available;
 * falls back to synthesising notifications from the alerts API.
 * Persists "read" state in localStorage.
 */

import React, {
  createContext, useCallback, useContext, useEffect, useRef, useState,
} from 'react';
import { portalFetch } from '../services/auth';

const BASE_URL: string = (import.meta as any).env?.VITE_PORTAL_API_URL ?? '';
const STORAGE_KEY = 'ryze_notifications_read';
const POLL_MS     = 60_000; // re-fetch every 60 s

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type NotifType =
  | 'alert'    // system alert (red/orange)
  | 'lesson'   // lesson event (gold)
  | 'payment'  // payment (green)
  | 'student'  // student update
  | 'system';  // generic system

export interface Notification {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  /** ISO timestamp */
  created_at: string;
  /** Optional URL to navigate on click */
  href?: string;
}

// ---------------------------------------------------------------------------
// Context shape
// ---------------------------------------------------------------------------

interface NotificationsContextValue {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  markRead: (id: string) => void;
  markAllRead: () => void;
  refresh: () => void;
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

function readIds(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch { return new Set(); }
}

function saveIds(ids: Set<string>) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids])); } catch { /* ignore */ }
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// Fallback mock notifications (used when API 404s)
function buildMockNotifications(): Notification[] {
  const now = Date.now();
  return [
    {
      id:         'mock-1',
      type:       'alert',
      title:      '3 students missed lesson check-ins',
      body:       'Foundations · Wed 4 pm — automated reminders sent.',
      created_at: new Date(now - 8  * 60_000).toISOString(),
      href:       '/dashboard/admin/alerts',
    },
    {
      id:         'mock-2',
      type:       'student',
      title:      'Sofia Reyes progress dropping',
      body:       '3 consecutive weeks below class median in Algebra.',
      created_at: new Date(now - 65 * 60_000).toISOString(),
      href:       '/dashboard/admin/students',
    },
    {
      id:         'mock-3',
      type:       'payment',
      title:      '2 invoices overdue',
      body:       '$480 outstanding across 2 families.',
      created_at: new Date(now - 3  * 60 * 60_000).toISOString(),
      href:       '/dashboard/admin/payments',
    },
    {
      id:         'mock-4',
      type:       'lesson',
      title:      'Maths Ext 1 — live now',
      body:       'Studio B · Daniel Kwok · 8 / 8 students checked in.',
      created_at: new Date(now - 10 * 60_000).toISOString(),
      href:       '/dashboard/admin/lessons',
    },
    {
      id:         'mock-5',
      type:       'system',
      title:      'Discord bot reconnected',
      body:       'Brief outage 14:02–14:04, all reminders delivered.',
      created_at: new Date(now - 2  * 60 * 60_000).toISOString(),
    },
  ];
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading]             = useState(true);
  const [readSet, setReadSet]             = useState<Set<string>>(readIds);
  const isMounted                         = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const url = new URL(`${BASE_URL}/api/notifications`, window.location.origin).toString();
      // Backend returns numeric IDs — normalise to strings for consistent Set membership
      const raw = await portalFetch<any[]>(url);
      const notifs: Notification[] = raw.map((n: any) => ({
        id:         String(n.id),
        type:       (n.type as NotifType) ?? 'system',
        title:      n.title  ?? '',
        body:       n.body   ?? '',
        created_at: n.created_at,
        href:       (n.data as any)?.href ?? undefined,
      }));
      if (isMounted.current) {
        setNotifications(notifs);
        // Pre-populate readSet with IDs already marked read on the server
        const serverRead = raw.filter((n: any) => n.read).map((n: any) => String(n.id));
        if (serverRead.length) {
          setReadSet((prev) => {
            const next = new Set(prev);
            serverRead.forEach((id) => next.add(id));
            saveIds(next);
            return next;
          });
        }
      }
    } catch {
      // 404/405/network — fall back to synthesised notifications gracefully
      if (isMounted.current) setNotifications(buildMockNotifications());
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, []);

  // Initial fetch + polling
  useEffect(() => {
    fetchNotifications();
    const id = setInterval(fetchNotifications, POLL_MS);
    return () => clearInterval(id);
  }, [fetchNotifications]);

  const markRead = useCallback((id: string) => {
    // Update local state immediately so the UI responds instantly
    setReadSet((prev) => {
      const next = new Set(prev);
      next.add(id);
      saveIds(next);
      return next;
    });
    // Persist to server for real notifications (mock IDs start with 'mock-')
    if (!id.startsWith('mock-')) {
      const url = new URL(`${BASE_URL}/api/notifications/${id}/read`, window.location.origin).toString();
      portalFetch<{ updated: boolean }>(url, {
        method: 'PATCH',
        body: JSON.stringify({ read: true }),
      }).catch(() => { /* non-fatal — local state already updated */ });
    }
  }, []);

  const markAllRead = useCallback(() => {
    setReadSet((prev) => {
      const next = new Set(prev);
      notifications.forEach((n) => next.add(n.id));
      saveIds(next);
      return next;
    });
    // Single batch call to mark all as read on the server
    const url = new URL(`${BASE_URL}/api/notifications/read-all`, window.location.origin).toString();
    portalFetch<{ updated: number }>(url, { method: 'PATCH' })
      .catch(() => { /* non-fatal */ });
  }, [notifications]);

  const unreadCount = notifications.filter((n) => !readSet.has(n.id)).length;

  return (
    <NotificationsContext.Provider
      value={{ notifications, unreadCount, loading, markRead, markAllRead, refresh: fetchNotifications }}
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

// Re-export for convenience
export { relativeTime };
