/**
 * tutorApi.ts — typed client for the /api/tutor/* endpoints.
 *
 * Authentication is handled via httpOnly cookies (ryze_token).
 * portalFetch adds credentials:'include' for the dev proxy and handles
 * silent token refresh on 401.
 *
 * Backend: server/src/routes/tutor/index.ts
 */

import { portalFetch } from './auth';

const BASE_URL: string = (import.meta as any).env?.VITE_PORTAL_API_URL ?? '';

// ---------------------------------------------------------------------------
// Internal fetch helper
// ---------------------------------------------------------------------------

function tutorFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const url = new URL(`${BASE_URL}/api/tutor${path}`, window.location.origin);
  return portalFetch<T>(url.toString(), init);
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TutorPortalPayload {
  tutor: {
    id:          number;
    full_name:   string;
    bio:         string | null;
    subjects:    string | null;
    hourly_rate: number | null;
  };
  classes: TutorClass[];
  upcoming_lessons: TutorLesson[];
  recent_homework: TutorHomeworkSummary[];
}

export interface TutorClass {
  class_id:      number;
  class_name:    string;
  subject:       string | null;
  year_level:    string | null;
  schedule:      string | null;
  student_count: number;
  next_lesson:   { id: number; title: string; scheduled_at: string } | null;
}

export interface TutorLesson {
  id:           number;
  class_name:   string | null;
  title:        string;
  description:  string | null;
  scheduled_at: string;
  end_time:     string | null;
  status:       string;
  meet_link:    string | null;
  student_count?: number;
}

export interface TutorHomeworkSummary {
  id:               number;
  class_name:       string | null;
  title:            string;
  due_date:         string | null;
  published:        boolean;
  submission_count: number;
}

export interface TutorAttendanceRoster {
  lesson_id:  number;
  class_name: string | null;
  roster: {
    student_id:   number;
    student_name: string;
    status:       string;
    notes:        string | null;
    marked_at:    string | null;
  }[];
}

export interface TutorRosterEntry {
  enrollment_id:   number;
  student_id:      number;
  student_name:    string;
  year_level:      string | null;
  is_trial:        boolean;
  enrolled_at:     string;
  attendance_rate: number | null;
}

export interface TutorHomeworkDetail {
  id:               number;
  class_id:         number;
  class_name:       string | null;
  title:            string;
  description:      string | null;
  instructions:     string | null;
  due_date:         string | null;
  published:        boolean;
  submission_count: number;
}

export interface TutorSubmission {
  id:           number;
  student_id:   number;
  student_name: string | null;
  status:       string;
  submitted_at: string | null;
  marked_at:    string | null;
  score:        number | null;
  grade:        string | null;
  feedback:     string | null;
  file_url:     string | null;
  notes:        string | null;
}

export interface TutorProgressReport {
  id:           number;
  student_id:   number;
  student_name: string | null;
  class_id:     number | null;
  class_name:   string | null;
  period:       string | null;
  score:        number | null;
  grade:        string | null;
  strengths:    string | null;
  improvements: string | null;
  notes:        string | null;
  status:       'draft' | 'published';
  published_at: string | null;
  created_at:   string;
}

export interface TutorUnavailabilityEntry {
  id:     number;
  date:   string;
  reason: string | null;
}

// ---------------------------------------------------------------------------
// API surface
// ---------------------------------------------------------------------------

export const tutorApi = {

  // ── Portal ───────────────────────────────────────────────────────────── //

  getPortal(): Promise<TutorPortalPayload> {
    return tutorFetch('/portal');
  },

  // ── Classes ──────────────────────────────────────────────────────────── //

  getClasses(): Promise<TutorClass[]> {
    return tutorFetch('/classes');
  },

  getRoster(classId: number): Promise<TutorRosterEntry[]> {
    return tutorFetch(`/classes/${classId}/roster`);
  },

  // ── Lessons ──────────────────────────────────────────────────────────── //

  getLessons(params?: { upcoming_only?: boolean }): Promise<TutorLesson[]> {
    const qs = params?.upcoming_only ? '?upcoming_only=true' : '';
    return tutorFetch(`/lessons${qs}`);
  },

  getAttendance(lessonId: number): Promise<TutorAttendanceRoster> {
    return tutorFetch(`/lessons/${lessonId}/attendance`);
  },

  markAttendance(lessonId: number, body: {
    student_id: number; status: string; notes?: string;
  }): Promise<{ updated: boolean }> {
    return tutorFetch(`/lessons/${lessonId}/attendance`, {
      method: 'PATCH', body: JSON.stringify(body),
    });
  },

  // ── Homework ─────────────────────────────────────────────────────────── //

  getHomework(params?: { class_id?: number }): Promise<TutorHomeworkDetail[]> {
    const qs = params?.class_id ? `?class_id=${params.class_id}` : '';
    return tutorFetch(`/homework${qs}`);
  },

  createHomework(body: {
    class_id: number; title: string; description?: string;
    instructions?: string; due_date?: string; max_score?: number;
  }): Promise<{ id: number; title: string }> {
    return tutorFetch('/homework', { method: 'POST', body: JSON.stringify(body) });
  },

  updateHomework(id: number, body: Partial<{
    title: string; description: string; instructions: string;
    due_date: string; max_score: number; published: boolean;
  }>): Promise<{ updated: boolean }> {
    return tutorFetch(`/homework/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
  },

  getSubmissions(homeworkId: number): Promise<TutorSubmission[]> {
    return tutorFetch(`/homework/${homeworkId}/submissions`);
  },

  gradeSubmission(homeworkId: number, submissionId: number, body: {
    feedback?: string; score?: number; status?: string;
  }): Promise<{ updated: boolean; id: number; status: string }> {
    return tutorFetch(`/homework/${homeworkId}/submissions/${submissionId}`, {
      method: 'PATCH', body: JSON.stringify(body),
    });
  },

  // ── Progress Reports ─────────────────────────────────────────────────── //

  getProgressReports(params?: {
    student_id?: number; class_id?: number; status?: string;
  }): Promise<TutorProgressReport[]> {
    const qs = new URLSearchParams();
    if (params?.student_id) qs.set('student_id', String(params.student_id));
    if (params?.class_id)   qs.set('class_id',   String(params.class_id));
    if (params?.status)     qs.set('status',      params.status);
    const q = qs.toString();
    return tutorFetch(`/progress-reports${q ? `?${q}` : ''}`);
  },

  createProgressReport(body: {
    student_id: number; class_id?: number; period?: string;
    score?: number; grade?: string; strengths?: string;
    improvements?: string; notes?: string;
  }): Promise<{ id: number }> {
    return tutorFetch('/progress-reports', { method: 'POST', body: JSON.stringify(body) });
  },

  updateProgressReport(id: number, body: Partial<{
    period: string; score: number; grade: string; strengths: string;
    improvements: string; notes: string; status: 'draft' | 'published';
  }>): Promise<{ updated: boolean }> {
    return tutorFetch(`/progress-reports/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
  },

  publishProgressReport(id: number): Promise<{ updated: boolean }> {
    return tutorFetch(`/progress-reports/${id}`, {
      method: 'PATCH', body: JSON.stringify({ status: 'published' }),
    });
  },

  // ── Unavailability ───────────────────────────────────────────────────── //

  getUnavailability(): Promise<TutorUnavailabilityEntry[]> {
    return tutorFetch('/unavailability');
  },

  addUnavailability(body: { date: string; reason?: string }): Promise<{ id: number }> {
    return tutorFetch('/unavailability', { method: 'POST', body: JSON.stringify(body) });
  },

  removeUnavailability(id: number): Promise<void> {
    return tutorFetch(`/unavailability/${id}`, { method: 'DELETE' });
  },
};
