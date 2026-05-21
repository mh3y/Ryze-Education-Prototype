/**
 * parentApi.ts — typed client for the /api/parent/* endpoints.
 *
 * Authentication is handled via httpOnly cookies (ryze_token).
 * portalFetch adds credentials:'include' for the dev proxy and handles
 * silent token refresh on 401.
 *
 * Backend: server/ (Node.js + Express + Prisma)
 */

import { portalFetch } from './auth';

const BASE_URL: string = (import.meta as any).env?.VITE_PORTAL_API_URL ?? '';

// ---------------------------------------------------------------------------
// Internal fetch helper
// ---------------------------------------------------------------------------

function parentFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const url = new URL(`${BASE_URL}/api/parent${path}`, window.location.origin);
  return portalFetch<T>(url.toString(), init);
}

// ---------------------------------------------------------------------------
// Types — match server/src/routes/parent/ response shapes
// ---------------------------------------------------------------------------

export interface PortalClass {
  class_id:    number;
  class_name:  string;
  subject:     string;
  tutor_name:  string | null;
  next_lesson: { title: string; scheduled_at: string } | null;
}

export interface ChildLesson {
  id:         number;
  title:      string;
  start_time: string;
  end_time:   string | null;
  location:   string | null;
  meet_link:  string | null;
  status:     string;
  class_name: string;
}

export interface AttendanceEntry {
  lesson_title: string;
  scheduled_at: string;
  status:       'present' | 'absent' | 'late' | 'excused' | 'unknown';
}

export interface PortalReport {
  id:         number;
  period:     string;
  score:      number | null;
  grade:      string | null;
  created_at: string;
}

export interface PortalPayment {
  id:          number;
  term:        string;
  frequency:   'yearly' | 'termly' | 'weekly' | 'custom';
  amount_due:  number;
  amount_paid: number;
  due_date:    string | null;
  status:      'pending' | 'paid' | 'overdue' | 'partial';
  notes:       string | null;
}

export interface PortalChild {
  link_id:              number;
  student_id:           number;
  student_name:         string;
  upcoming_lessons:     ChildLesson[];
  year_level:           string | null;
  school:               string | null;
  relationship:         string;
  is_primary_contact:   boolean;
  classes:              PortalClass[];
  attendance_rate:      number | null;   // 0–100, null if no lessons yet
  recent_attendance:    AttendanceEntry[];
  latest_reports:       PortalReport[];
  outstanding_payments: PortalPayment[];
}

export interface ParentPortalPayload {
  parent:   { id: number; full_name: string; email: string };
  children: PortalChild[];
}

// Message thread types
export interface MessageThread {
  id:         number;
  subject:    string;
  status:     string;
  created_at: string;
  updated_at: string;
  last_message: {
    body:       string;
    sender_type: string;
    created_at: string;
  } | null;
  unread_count: number;
}

export interface ThreadMessage {
  id:          number;
  sender_type: 'parent' | 'admin';
  sender_name: string | null;
  body:        string;
  read:        boolean;
  created_at:  string;
}

// ---------------------------------------------------------------------------
// API surface
// ---------------------------------------------------------------------------

export const parentApi = {
  /**
   * Returns the full parent dashboard payload:
   * parent info + all linked children with classes, attendance, reports,
   * outstanding payments.
   */
  getPortal(): Promise<ParentPortalPayload> {
    return parentFetch('/portal');
  },

  // ── Messaging (centralized /api/messages endpoint) ───────────────────── //

  getThreads(): Promise<MessageThread[]> {
    const url = new URL(`${BASE_URL}/api/messages`, window.location.origin);
    return portalFetch(url.toString());
  },

  getThread(threadId: number): Promise<{ thread: MessageThread; messages: ThreadMessage[] }> {
    const url = new URL(`${BASE_URL}/api/messages/${threadId}`, window.location.origin);
    return portalFetch(url.toString());
  },

  sendMessage(body: { subject: string; message: string }): Promise<{ thread_id: number }> {
    const url = new URL(`${BASE_URL}/api/messages`, window.location.origin);
    return portalFetch(url.toString(), { method: 'POST', body: JSON.stringify(body) });
  },

  replyToThread(threadId: number, message: string): Promise<{ message_id: number }> {
    const url = new URL(`${BASE_URL}/api/messages/${threadId}/reply`, window.location.origin);
    return portalFetch(url.toString(), { method: 'POST', body: JSON.stringify({ message }) });
  },
};
