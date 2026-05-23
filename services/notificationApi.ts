/**
 * notificationApi.ts — typed client for /api/notifications/*
 *
 * Separate from adminApi so any role (admin, tutor, parent, student) can
 * import this without pulling in admin-only types.
 */

import { portalFetch } from './auth';

const BASE_URL: string = (import.meta as any).env?.VITE_PORTAL_API_URL ?? '';

function url(path: string): string {
  return new URL(`${BASE_URL}/api/notifications${path}`, window.location.origin).toString();
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ApiNotification {
  id:         string;
  type:       string;
  title:      string;
  body:       string;
  read:       boolean;
  created_at: string;
  href:       string | null;
}

export interface UnreadCountResponse {
  count: number;
}

export interface GenerateResult {
  overdue_payments:    number;
  unmarked_attendance: number;
  upcoming_lessons:    number;
  missing_reports:     number;
  admin_alerts:        number;
  total:               number;
}

// ---------------------------------------------------------------------------
// API methods
// ---------------------------------------------------------------------------

export const notificationApi = {
  /** Fetch the 50 most-recent notifications for the authenticated principal. */
  list(): Promise<ApiNotification[]> {
    return portalFetch<ApiNotification[]>(url('/'));
  },

  /** Cheap badge count — poll every 30 s without fetching the full list. */
  unreadCount(): Promise<UnreadCountResponse> {
    return portalFetch<UnreadCountResponse>(url('/unread-count'));
  },

  /** Mark a single notification as read. */
  markRead(id: string): Promise<{ updated: boolean }> {
    return portalFetch<{ updated: boolean }>(url(`/${id}/read`), { method: 'PATCH' });
  },

  /** Mark all unread notifications as read. */
  markAllRead(): Promise<{ updated: number }> {
    return portalFetch<{ updated: number }>(url('/read-all'), { method: 'PATCH' });
  },

  /**
   * (Admin only) Run all notification generators.
   * Safe to call repeatedly — generators are idempotent via dedup windows.
   */
  generate(): Promise<GenerateResult> {
    return portalFetch<GenerateResult>(url('/generate'), { method: 'POST' });
  },
};
