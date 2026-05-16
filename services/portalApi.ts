/**
 * portalApi.ts
 * Typed client for the Ryze Education Dashboard REST API (FastAPI backend).
 *
 * Usage:
 *   import { portalApi } from '../services/portalApi';
 *   const health = await portalApi.getHealth();
 */

const BASE_URL = (import.meta as any).env?.VITE_PORTAL_API_URL ?? 'http://localhost:8000';
const API_KEY  = (import.meta as any).env?.VITE_PORTAL_API_KEY  ?? '';

// ---------------------------------------------------------------------------
// Types (mirroring the Pydantic schemas in bot/api/schemas.py)
// ---------------------------------------------------------------------------

export interface UserRecord {
  id: number;
  discord_user_id: number;
  full_name: string;
  email: string | null;
  role: 'student' | 'tutor' | 'admin' | 'parent';
  active: boolean;
  created_at: string; // ISO datetime
}

export interface TutorSummary {
  id: number;
  full_name: string;
  discord_user_id: number;
}

export interface ClassGroup {
  id: number;
  name: string;
  year_level: string | null;
  subject: string | null;
  active: boolean;
  tutor: TutorSummary | null;
  member_count: number;
  created_at: string;
}

export interface Lesson {
  id: number;
  class_group_id: number;
  class_group_name: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  location: string | null;
  meet_link: string | null;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  discord_thread_id: number | null;
  google_event_id: string | null;
}

export interface AttendanceRecord {
  id: number;
  lesson_id: number;
  lesson_title: string;
  user_id: number;
  student_name: string;
  status: 'present' | 'late' | 'left_early' | 'absent' | 'unknown';
  joined_at: string | null;
  left_at: string | null;
  duration_minutes: number | null;
}

export interface ReminderLog {
  id: number;
  lesson_id: number;
  lesson_title: string | null;
  user_id: number | null;
  reminder_type: string;
  channel: 'dm' | 'class_channel';
  sent_at: string;
  success: boolean;
  error_message: string | null;
}

export interface HealthStatus {
  status: 'ok' | 'degraded';
  db_ok: boolean;
  student_count: number;
  class_count: number;
  upcoming_lessons: number;
  timestamp: string;
}

interface PaginatedResponse<T> {
  total: number;
  items: T[];
}

// ---------------------------------------------------------------------------
// Internal fetch helper
// ---------------------------------------------------------------------------

async function apiFetch<T>(path: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    });
  }

  const res = await fetch(url.toString(), {
    headers: {
      'X-API-Key': API_KEY,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`API ${res.status}: ${text}`);
  }

  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// API surface
// ---------------------------------------------------------------------------

export const portalApi = {
  // Health
  getHealth(): Promise<HealthStatus> {
    return apiFetch('/api/health');
  },

  // Students / Users
  getStudents(params?: {
    role?: string;
    active?: boolean;
    skip?: number;
    limit?: number;
  }): Promise<PaginatedResponse<UserRecord>> {
    return apiFetch('/api/students', params as Record<string, string | number | boolean | undefined>);
  },

  // Classes
  getClasses(params?: {
    active?: boolean;
    skip?: number;
    limit?: number;
  }): Promise<PaginatedResponse<ClassGroup>> {
    return apiFetch('/api/classes', params as Record<string, string | number | boolean | undefined>);
  },

  // Lessons
  getLessons(params?: {
    status?: string;
    class_group_id?: number;
    upcoming_only?: boolean;
    skip?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Lesson>> {
    return apiFetch('/api/lessons', params as Record<string, string | number | boolean | undefined>);
  },

  // Attendance
  getAttendance(params?: {
    lesson_id?: number;
    user_id?: number;
    status?: string;
    skip?: number;
    limit?: number;
  }): Promise<PaginatedResponse<AttendanceRecord>> {
    return apiFetch('/api/attendance', params as Record<string, string | number | boolean | undefined>);
  },

  // Reminder logs
  getReminders(params?: {
    lesson_id?: number;
    reminder_type?: string;
    success?: boolean;
    skip?: number;
    limit?: number;
  }): Promise<PaginatedResponse<ReminderLog>> {
    return apiFetch('/api/reminders', params as Record<string, string | number | boolean | undefined>);
  },
};
