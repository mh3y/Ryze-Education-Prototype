/**
 * parentApi.ts — typed client for the /api/parent/* endpoints.
 *
 * Used exclusively by parent portal pages. Parents authenticate with
 * email + password (no Discord) and receive a JWT that is stored the
 * same way as other portal users.
 */

import { getToken } from './auth';

const BASE_URL: string = (import.meta as any).env?.VITE_PORTAL_API_URL ?? '';

// ---------------------------------------------------------------------------
// Internal fetch helper
// ---------------------------------------------------------------------------

async function parentFetch<T>(
  path: string,
  options: RequestInit = {},
  params?: Record<string, string | number | boolean | undefined>,
): Promise<T> {
  const url = new URL(`${BASE_URL}/api/parent${path}`, window.location.origin);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    });
  }

  const token = getToken();
  const res = await fetch(url.toString(), {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
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
// Types
// ---------------------------------------------------------------------------

export interface ParentProfile {
  id: number;
  full_name: string;
  email: string;
  phone: string | null;
}

export interface ChildClass {
  id: number;
  name: string;
  year_level: string | null;
  subject: string | null;
  enrollment_status: string;
}

export interface ChildLesson {
  id: number;
  title: string;
  class_name: string | null;
  start_time: string;
  end_time: string | null;
  status: string;
  meet_link: string | null;
  location: string | null;
}

export interface ChildAttendance {
  id: number;
  lesson_title: string;
  lesson_start: string | null;
  status: string;
}

export interface ChildPayment {
  id: number;
  term: string;
  amount_due: string;
  amount_paid: string;
  amount_remaining: string;
  status: string;
  due_date: string | null;
  paid_at: string | null;
}

export interface ChildReport {
  id: number;
  tutor_name: string | null;
  class_name: string | null;
  summary: string | null;
  status: string;
  submitted_at: string | null;
}

export interface ChildSummary {
  link_id: number;
  relationship: string | null;
  is_primary_contact: boolean;
  student: {
    id: number;
    full_name: string;
    email: string | null;
  };
  classes: ChildClass[];
  upcoming_lessons: ChildLesson[];
  recent_attendance: ChildAttendance[];
  payments: ChildPayment[];
  progress_reports: ChildReport[];
}

export interface ParentPortalPayload {
  parent: ParentProfile;
  children: ChildSummary[];
}

// ---------------------------------------------------------------------------
// API surface
// ---------------------------------------------------------------------------

export const parentApi = {
  getPortal(): Promise<ParentPortalPayload> {
    return parentFetch('/portal');
  },
};
