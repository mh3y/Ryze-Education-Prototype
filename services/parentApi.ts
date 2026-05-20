/**
 * parentApi.ts — typed client for the /api/parent/* endpoints.
 *
 * Used exclusively by parent portal pages. Parents authenticate with
 * email + password (no Discord) and receive a JWT stored in localStorage.
 *
 * Backend: server/ (Node.js + Express + Prisma)
 * Endpoint: GET /api/parent/portal
 */

import { getToken } from './auth';

const BASE_URL: string = (import.meta as any).env?.VITE_PORTAL_API_URL ?? '';

// ---------------------------------------------------------------------------
// Internal fetch helper
// ---------------------------------------------------------------------------

async function parentFetch<T>(path: string): Promise<T> {
  const url = new URL(`${BASE_URL}/api/parent${path}`, window.location.origin);
  const token = getToken();
  const res = await fetch(url.toString(), {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const data = await res.json();
      detail = data.detail ?? detail;
    } catch { /* ignore */ }
    throw new Error(detail);
  }

  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Types — match server/src/routes/parent/portal.ts response shape
// ---------------------------------------------------------------------------

export interface PortalClass {
  class_id: number;
  class_name: string;
  subject: string;
  tutor_name: string | null;
  next_lesson: { title: string; scheduled_at: string } | null;
}

export interface AttendanceEntry {
  lesson_title: string;
  scheduled_at: string;
  status: 'present' | 'absent' | 'late' | 'excused' | 'unknown';
}

export interface PortalReport {
  id: number;
  period: string;
  score: number | null;
  grade: string | null;
  created_at: string;
}

export interface PortalPayment {
  id: number;
  amount: number;
  description: string;
  due_date: string | null;
  status: 'pending' | 'paid' | 'overdue';
}

export interface PortalChild {
  link_id: number;
  student_id: number;
  student_name: string;
  year_level: string | null;
  school: string | null;
  relationship: string;
  is_primary_contact: boolean;
  classes: PortalClass[];
  attendance_rate: number | null;  // 0–100, null if no lessons yet
  recent_attendance: AttendanceEntry[];
  latest_reports: PortalReport[];
  outstanding_payments: PortalPayment[];
}

export interface ParentPortalPayload {
  parent: { id: number; full_name: string; email: string };
  children: PortalChild[];
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
};
