/**
 * adminApi.ts — typed client for the /api/admin/* endpoints.
 *
 * All requests send the stored JWT as a Bearer token (via getToken()).
 * Mirror the Pydantic schemas in bot/api/routes/admin.py.
 */

import { getToken } from './auth';

const BASE_URL: string = (import.meta as any).env?.VITE_PORTAL_API_URL ?? '';

// ---------------------------------------------------------------------------
// Internal fetch helpers
// ---------------------------------------------------------------------------

async function adminFetch<T>(
  path: string,
  options: RequestInit = {},
  params?: Record<string, string | number | boolean | undefined>,
): Promise<T> {
  const url = new URL(`${BASE_URL}/api/admin${path}`, window.location.origin);
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

  // 204 No Content (e.g. DELETE endpoints) — return undefined rather than
  // calling res.json() on an empty body, which would throw a parse error.
  if (res.status === 204) return undefined as unknown as T;

  return res.json() as Promise<T>;
}

const get  = <T>(path: string, params?: Record<string, any>): Promise<T> => adminFetch(path, { method: 'GET' }, params);
const post = <T>(path: string, body: unknown):  Promise<T> => adminFetch(path, { method: 'POST',  body: JSON.stringify(body) });
const patch = <T>(path: string, body: unknown): Promise<T> => adminFetch(path, { method: 'PATCH', body: JSON.stringify(body) });
const del   = <T>(path: string): Promise<T>                 => adminFetch(path, { method: 'DELETE' });

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Paginated<T> { total: number; items: T[] }

// Parents
export interface ParentListItem {
  id: number;
  full_name: string;
  email: string;
  phone: string | null;
  active: boolean;
  created_at: string;
  invite_pending: boolean;
  has_set_password: boolean;
}

export interface ParentDetail extends ParentListItem {
  first_name: string;
  last_name: string;
  notes: string | null;
  updated_at: string;
  last_login_at: string | null;
  students: {
    link_id: number;
    student_user_id: number;
    student_name: string | null;
    relationship: string | null;
    is_primary_contact: boolean;
  }[];
}

// Students
export interface StudentListItem {
  id: number;
  discord_user_id: number;
  full_name: string;
  email: string | null;
  role: string;
  active: boolean;
  created_at: string;
  class_count: number;
}

export interface StudentDetail {
  id: number;
  discord_user_id: number;
  full_name: string;
  email: string | null;
  role: string;
  active: boolean;
  created_at: string;
  profile: {
    preferred_name: string | null;
    school: string | null;
    year_level: string | null;
    notes: string | null;
  } | null;
  classes: {
    class_group_id: number;
    class_name: string;
    enrollment_status: string;
    start_date: string | null;
    end_date: string | null;
  }[];
  parents: {
    link_id: number;
    parent_profile_id: number;
    parent_name: string;
    parent_email: string;
    relationship: string | null;
    is_primary_contact: boolean;
  }[];
}

// Payments
export interface StudentPayment {
  id: number;
  student_user_id: number;
  student_name: string;
  parent_profile_id: number | null;
  term: string;
  amount_due: string;
  amount_paid: string;
  amount_remaining: string;
  due_date: string | null;
  status: string;
  payment_method: string | null;
  paid_at: string | null;
  notes: string | null;
}

export interface TutorPayment {
  id: number;
  tutor_user_id: number;
  tutor_name: string;
  pay_period_start: string;
  pay_period_end: string;
  amount_due: string;
  amount_paid: string;
  status: string;
  paid_at: string | null;
  notes: string | null;
  items: {
    id: number;
    lesson_id: number;
    hours: string;
    rate: string;
    amount: string;
  }[];
}

// Progress Reports
export interface ProgressReport {
  id: number;
  student_user_id: number;
  student_name: string;
  lesson_id: number | null;
  tutor_user_id: number;
  tutor_name: string;
  class_group_id: number | null;
  class_name: string | null;
  summary: string | null;
  status: string;
  visible_to_parent: boolean;
  visible_to_student: boolean;
  submitted_at: string | null;
  created_at: string;
}

// Alerts
export interface SystemAlert {
  id: number;
  alert_type: string;
  severity: string;
  title: string;
  message: string;
  related_entity_type: string | null;
  related_entity_id: number | null;
  status: string;
  assigned_to: number | null;
  created_at: string;
  resolved_at: string | null;
}

// Classes (admin view)
export interface ClassGroupListItem {
  id: number;
  name: string;
  year_level: string | null;
  subject: string | null;
  active: boolean;
  created_at: string;
  tutor: { id: number; full_name: string; discord_user_id: number } | null;
  member_count: number;
}

export interface ClassGroupDetail extends ClassGroupListItem {
  roster: {
    membership_id: number;
    user_id: number;
    student_name: string;
    enrollment_status: string;
    start_date: string | null;
    end_date: string | null;
  }[];
}

// Lessons (admin view)
export interface LessonListItem {
  id: number;
  class_group_id: number;
  class_group_name: string | null;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string | null;
  location: string | null;
  meet_link: string | null;
  status: string;
}

export interface LessonDetail extends LessonListItem {
  tutor_name: string | null;
  tutor_user_id: number | null;
  created_at: string;
  updated_at: string;
  attendance_summary: {
    present: number;
    late: number;
    left_early: number;
    absent: number;
    unknown: number;
    [key: string]: number;
  };
  attendance_total: number;
}

// Attendance (admin view)
export interface AttendanceRecord {
  id: number;
  lesson_id: number;
  lesson_title: string;
  user_id: number;
  student_name: string;
  status: string;
  tutor_marked_status: string | null;
  discord_verification_status: string;
  discord_verified_minutes: number | null;
  joined_at: string | null;
  left_at: string | null;
  duration_minutes: number | null;
  has_mismatch: boolean;
}

// Announcements
export interface Announcement {
  id: number;
  title: string;
  body: string;
  created_by: number;
  target_role: string | null;
  target_class_group_id: number | null;
  target_program_id: number | null;
  published_at: string | null;
  status: string;
  created_at: string;
}

// Resources
export interface Resource {
  id: number;
  title: string;
  description: string | null;
  resource_url: string;
  resource_type: string;
  class_group_id: number | null;
  program_id: number | null;
  student_user_id: number | null;
  created_by: number;
  active: boolean;
  created_at: string;
}

// Homework
export interface HomeworkTask {
  id: number;
  title: string;
  description: string | null;
  class_group_id: number;
  class_group_name: string | null;
  lesson_id: number | null;
  due_at: string;
  created_by: number;
  created_at: string;
  submission_summary: {
    submitted: number;
    late: number;
    missing: number;
    reviewed: number;
  };
  submission_total: number;
}

export interface HomeworkSubmission {
  id: number;
  student_user_id: number;
  student_name: string | null;
  status: 'submitted' | 'late' | 'missing' | 'reviewed';
  submitted_at: string | null;
  attachment_url: string | null;
  tutor_feedback: string | null;
  created_at: string;
}

export interface HomeworkTaskDetail extends HomeworkTask {
  creator_name: string | null;
  submissions: HomeworkSubmission[];
}

// Overview stats
export interface AdminOverviewStats {
  total_students: number;
  active_classes: number;
  today_lessons: number;
  open_alerts: number;
  pending_payments: number;
  missing_reports: number;
  recent_alerts: {
    id: number;
    alert_type: string;
    severity: string;
    title: string;
    message: string;
    created_at: string;
  }[];
  today_lesson_list: {
    id: number;
    title: string;
    class_name: string | null;
    start_time: string;
    end_time: string | null;
    status: string;
  }[];
}

// ---------------------------------------------------------------------------
// API surface
// ---------------------------------------------------------------------------

export const adminApi = {

  // ── Overview ────────────────────────────────────────────────────────── //

  getOverviewStats(): Promise<AdminOverviewStats> {
    return get('/overview-stats');
  },

  // ── Parents ─────────────────────────────────────────────────────────── //

  getParents(params?: { skip?: number; limit?: number; active?: boolean }):
    Promise<Paginated<ParentListItem>> {
    return get('/parents', params);
  },

  getParent(id: number): Promise<ParentDetail> {
    return get(`/parents/${id}`);
  },

  createParent(body: {
    first_name: string; last_name: string; email: string;
    phone?: string; notes?: string;
  }): Promise<{ id: number; full_name: string; invite_link: string; invite_expires_at: string }> {
    return post('/parents', body);
  },

  updateParent(id: number, body: Partial<{
    first_name: string; last_name: string; email: string;
    phone: string; notes: string; active: boolean;
  }>): Promise<{ id: number; updated: boolean }> {
    return patch(`/parents/${id}`, body);
  },

  resendParentInvite(id: number): Promise<{ invite_link: string; invite_expires_at: string }> {
    return post(`/parents/${id}/resend-invite`, {});
  },

  linkStudentToParent(parentId: number, body: {
    student_user_id: number; relationship?: string; is_primary_contact?: boolean;
  }): Promise<{ link_id: number }> {
    return post(`/parents/${parentId}/students`, body);
  },

  unlinkStudentFromParent(parentId: number, linkId: number): Promise<{ removed: boolean }> {
    return del(`/parents/${parentId}/students/${linkId}`);
  },

  // ── Students ────────────────────────────────────────────────────────── //

  getStudents(params?: { skip?: number; limit?: number; active?: boolean; role?: string }):
    Promise<Paginated<StudentListItem>> {
    return get('/students', params);
  },

  getStudent(id: number): Promise<StudentDetail> {
    return get(`/students/${id}`);
  },

  createStudent(body: {
    full_name: string;
    email?: string;
    year_level?: string;
    school?: string;
    notes?: string;
  }): Promise<{ id: number; full_name: string }> {
    return post('/students', body);
  },

  updateStudentProfile(userId: number, body: Partial<{
    preferred_name: string; school: string; year_level: string; notes: string;
  }>): Promise<{ updated: boolean }> {
    return patch(`/students/${userId}/profile`, body);
  },

  enrollStudent(userId: number, body: {
    class_group_id: number; enrollment_status?: string; start_date?: string;
  }): Promise<{ enrolled: boolean }> {
    return post(`/students/${userId}/enroll`, body);
  },

  updateEnrollment(userId: number, classGroupId: number, body: Partial<{
    enrollment_status: string; end_date: string;
  }>): Promise<{ updated: boolean }> {
    return patch(`/students/${userId}/enrollment/${classGroupId}`, body);
  },

  // ── Classes ─────────────────────────────────────────────────────────── //

  getClasses(params?: { skip?: number; limit?: number; active?: boolean }):
    Promise<Paginated<ClassGroupListItem>> {
    return get('/classes', params);
  },

  getClass(id: number): Promise<ClassGroupDetail> {
    return get(`/classes/${id}`);
  },

  // ── Lessons ─────────────────────────────────────────────────────────── //

  getLessons(params?: {
    class_group_id?: number; status?: string; upcoming_only?: boolean;
    skip?: number; limit?: number;
  }): Promise<Paginated<LessonListItem>> {
    return get('/lessons', params);
  },

  getLesson(id: number): Promise<LessonDetail> {
    return get(`/lessons/${id}`);
  },

  createLesson(body: {
    title: string;
    class_group_id: number;
    start_time: string;
    end_time?: string;
    location?: string;
    meet_link?: string;
    description?: string;
  }): Promise<{ id: number; title: string }> {
    return post('/lessons', body);
  },

  // ── Attendance ──────────────────────────────────────────────────────── //

  getAttendance(params?: {
    lesson_id?: number; user_id?: number; has_mismatch?: boolean;
    skip?: number; limit?: number;
  }): Promise<Paginated<AttendanceRecord>> {
    return get('/attendance', params);
  },

  markAttendance(lessonId: number, userId: number, body: {
    status: string; notes?: string;
  }): Promise<{ updated: boolean }> {
    return post(`/attendance/${lessonId}/${userId}/mark`, body);
  },

  // ── Payments ────────────────────────────────────────────────────────── //

  getStudentPayments(params?: {
    student_user_id?: number; status?: string; skip?: number; limit?: number;
  }): Promise<Paginated<StudentPayment>> {
    return get('/student-payments', params);
  },

  createStudentPayment(body: {
    student_user_id: number; parent_profile_id?: number; term: string;
    amount_due: number; due_date?: string; notes?: string;
  }): Promise<{ id: number }> {
    return post('/student-payments', body);
  },

  updateStudentPayment(id: number, body: Partial<{
    status: string; amount_paid: number; payment_method: string;
    paid_at: string; notes: string;
  }>): Promise<{ updated: boolean }> {
    return patch(`/student-payments/${id}`, body);
  },

  getTutorPayments(params?: {
    tutor_user_id?: number; status?: string; skip?: number; limit?: number;
  }): Promise<Paginated<TutorPayment>> {
    return get('/tutor-payments', params);
  },

  createTutorPayment(body: {
    tutor_user_id: number; pay_period_start: string; pay_period_end: string;
    notes?: string;
  }): Promise<{ id: number }> {
    return post('/tutor-payments', body);
  },

  updateTutorPayment(id: number, body: Partial<{
    status: string; amount_paid: number; paid_at: string; notes: string;
  }>): Promise<{ updated: boolean }> {
    return patch(`/tutor-payments/${id}`, body);
  },

  addTutorPaymentItem(paymentId: number, body: {
    lesson_id: number; hours: number; rate: number;
  }): Promise<{ item_id: number }> {
    return post(`/tutor-payments/${paymentId}/items`, body);
  },

  // ── Progress Reports ────────────────────────────────────────────────── //

  getProgressReports(params?: {
    student_user_id?: number; tutor_user_id?: number; status?: string;
    skip?: number; limit?: number;
  }): Promise<Paginated<ProgressReport>> {
    return get('/progress-reports', params);
  },

  updateProgressReport(id: number, body: Partial<{
    summary: string; status: string;
    visible_to_parent: boolean; visible_to_student: boolean;
  }>): Promise<{ updated: boolean }> {
    return patch(`/progress-reports/${id}`, body);
  },

  // ── Alerts ──────────────────────────────────────────────────────────── //

  getAlerts(params?: {
    status?: string; severity?: string; skip?: number; limit?: number;
  }): Promise<Paginated<SystemAlert>> {
    return get('/alerts', params);
  },

  generateAlerts(): Promise<{ created: number }> {
    return post('/alerts/generate', {});
  },

  resolveAlert(id: number): Promise<{ resolved: boolean }> {
    return patch(`/alerts/${id}/resolve`, {});
  },

  dismissAlert(id: number): Promise<{ dismissed: boolean }> {
    return patch(`/alerts/${id}/dismiss`, {});
  },

  // ── Announcements ───────────────────────────────────────────────────── //

  getAnnouncements(params?: { status?: string; skip?: number; limit?: number }):
    Promise<Paginated<Announcement>> {
    return get('/announcements', params);
  },

  createAnnouncement(body: {
    title: string; body: string; target_role?: string;
    target_class_group_id?: number; target_program_id?: number;
  }): Promise<{ id: number }> {
    return post('/announcements', body);
  },

  publishAnnouncement(id: number): Promise<{ id: number }> {
    return patch(`/announcements/${id}`, { status: 'published' });
  },

  archiveAnnouncement(id: number): Promise<{ id: number }> {
    return patch(`/announcements/${id}`, { status: 'archived' });
  },

  // ── Resources ───────────────────────────────────────────────────────── //

  getResources(params?: {
    class_group_id?: number; student_user_id?: number; skip?: number; limit?: number;
  }): Promise<Paginated<Resource>> {
    return get('/resources', params);
  },

  createResource(body: {
    title: string; resource_url: string; resource_type: string;
    description?: string; class_group_id?: number;
    program_id?: number; student_user_id?: number;
  }): Promise<{ id: number }> {
    return post('/resources', body);
  },

  deleteResource(id: number): Promise<{ deleted: boolean }> {
    return del(`/resources/${id}`);
  },

  // ── Homework ─────────────────────────────────────────────────────────── //

  getHomework(params?: {
    class_group_id?: number; overdue_only?: boolean; skip?: number; limit?: number;
  }): Promise<Paginated<HomeworkTask>> {
    return get('/homework', params);
  },

  getHomeworkTask(id: number): Promise<HomeworkTaskDetail> {
    return get(`/homework/${id}`);
  },

  createHomework(body: {
    title: string; class_group_id: number; due_at: string;
    description?: string; lesson_id?: number;
  }): Promise<HomeworkTask> {
    return post('/homework', body);
  },

  updateHomework(id: number, body: {
    title?: string; description?: string; due_at?: string; lesson_id?: number;
  }): Promise<{ id: number; title: string; due_at: string }> {
    return patch(`/homework/${id}`, body);
  },

  deleteHomework(id: number): Promise<void> {
    return del(`/homework/${id}`);
  },

  updateSubmission(taskId: number, submissionId: number, body: {
    status?: string; tutor_feedback?: string;
  }): Promise<{ id: number; status: string; tutor_feedback: string | null }> {
    return patch(`/homework/${taskId}/submissions/${submissionId}`, body);
  },
};
