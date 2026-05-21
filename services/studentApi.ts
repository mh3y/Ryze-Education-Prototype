/**
 * studentApi.ts — typed client for the /api/student/* endpoints.
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

function studentFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const url = new URL(`${BASE_URL}/api/student${path}`, window.location.origin);
  return portalFetch<T>(url.toString(), init);
}

// ---------------------------------------------------------------------------
// Types — match server/src/routes/student/ response shapes
// ---------------------------------------------------------------------------

export interface StudentNextLesson {
  id:           number;
  title:        string;
  scheduled_at: string;
  class_name:   string;
  tutor_name:   string | null;
}

export interface StudentClass {
  class_id:    number;
  class_name:  string;
  subject:     string | null;
  tutor_name:  string | null;
  next_lesson: { id: number; title: string; scheduled_at: string } | null;
}

export interface StudentOpenHomework {
  id:         number;
  title:      string;
  class_name: string | null;
  due_at:     string | null;
}

export interface StudentSubmittedHomework {
  id:           number;
  title:        string;
  class_name:   string | null;
  due_at:       string | null;
  submitted_at: string | null;
  grade:        string | null;
  feedback:     string | null;
}

export interface StudentAttendanceEntry {
  lesson_title: string;
  scheduled_at: string;
  status:       'present' | 'absent' | 'late' | 'excused' | 'unknown';
}

export interface StudentReport {
  id:           number;
  period:       string | null;
  score:        number | null;
  grade:        string | null;
  class_name:   string | null;
  published_at: string | null;
}

export interface StudentPortalPayload {
  student: {
    id:         number;
    full_name:  string;
    year_level: string | null;
    school:     string | null;
  };
  next_lesson: StudentNextLesson | null;
  classes:     StudentClass[];
  homework: {
    open:      StudentOpenHomework[];
    submitted: StudentSubmittedHomework[];
  };
  attendance: {
    rate:          number | null;
    total_lessons: number;
    recent:        StudentAttendanceEntry[];
  };
  reports: StudentReport[];
}

export interface HomeworkSubmitResult {
  submitted: boolean;
  submission_id: number;
}

// ---------------------------------------------------------------------------
// API surface
// ---------------------------------------------------------------------------

export const studentApi = {
  /**
   * Returns the full student dashboard payload:
   * profile, enrolled classes, homework, attendance, reports.
   */
  getPortal(): Promise<StudentPortalPayload> {
    return studentFetch('/portal');
  },

  /**
   * Submit a homework task.
   * attachment_url is optional (Cloudinary URL uploaded separately).
   */
  submitHomework(taskId: number, body: {
    file_url?: string;   // Cloudinary URL for uploaded attachment
    notes?: string;
  }): Promise<HomeworkSubmitResult> {
    return studentFetch(`/homework/${taskId}/submit`, {
      method: 'POST',
      body:   JSON.stringify(body),
    });
  },
};
