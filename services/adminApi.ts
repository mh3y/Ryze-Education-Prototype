/**
 * adminApi.ts — typed client for the /api/admin/* endpoints.
 *
 * Authentication is handled via httpOnly cookies (ryze_token).
 * The browser sends them automatically; portalFetch adds credentials:'include'
 * for the dev proxy and handles silent token refresh on 401.
 */

import { portalFetch } from './auth';

const BASE_URL: string = (import.meta as any).env?.VITE_PORTAL_API_URL ?? '';

// ---------------------------------------------------------------------------
// Internal fetch helpers
// ---------------------------------------------------------------------------

function buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>): string {
  const url = new URL(`${BASE_URL}/api/admin${path}`, window.location.origin);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    });
  }
  return url.toString();
}

const get   = <T>(path: string, params?: Record<string, any>): Promise<T> =>
  portalFetch(buildUrl(path, params), { method: 'GET' });
const post  = <T>(path: string, body: unknown): Promise<T> =>
  portalFetch(buildUrl(path), { method: 'POST',   body: JSON.stringify(body) });
const patch = <T>(path: string, body: unknown): Promise<T> =>
  portalFetch(buildUrl(path), { method: 'PATCH',  body: JSON.stringify(body) });
const del   = <T>(path: string): Promise<T> =>
  portalFetch(buildUrl(path), { method: 'DELETE' });

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

// Tutors
export interface TutorListItem {
  id: number;
  display_id: string | null;
  discord_user_id: number | null;
  full_name: string;
  email: string | null;
  role: string;
  active: boolean;
  created_at: string;
  class_count: number;
  subjects: string | null;
  hourly_rate: number | null;
  bio: string | null;
}

export interface TutorDetail extends TutorListItem {
  classes: {
    class_id: number;
    class_name: string;
    subject: string | null;
  }[];
}

// Students
export interface StudentListItem {
  id: number;
  display_id: string | null;
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
  display_id: string | null;
  discord_user_id: string | null;
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
    class_id: number;        // ClassEnrollment.class_id
    class_name: string;
    is_trial: boolean;
    active: boolean;
    enrolled_at: string;
  }[];
  parents: {
    link_id: number;
    parent_id: number;
    parent_name: string;
    parent_email: string;
    relationship: string;
    is_primary_contact: boolean;
  }[];
}

// Payments
export interface StudentPayment {
  id: number;
  student_id: number;
  student_name: string;
  term: string | null;
  description: string;
  frequency: 'yearly' | 'termly' | 'weekly' | 'custom';
  installment_number: number | null;
  total_installments: number | null;
  amount_due: number;        // dollars (converted from cents)
  amount_paid: number;       // dollars (converted from cents)
  amount_remaining: number;  // dollars (computed)
  due_date: string | null;
  paid_at: string | null;
  payment_method: string | null;
  received_by: string | null;
  reference: string | null;
  status: 'pending' | 'partial' | 'paid' | 'overdue' | 'waived';
  notes: string | null;
  created_at: string;
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
  student_id: number;
  student_name: string;
  class_id: number | null;
  class_name: string | null;
  created_by: number | null;
  tutor_name: string | null;
  period: string | null;
  score: number | null;
  grade: string | null;
  strengths: string | null;
  improvements: string | null;
  notes: string | null;
  status: string;   // 'draft' | 'published' | 'submitted' | 'approved' — kept as string for forward compat
  published_at: string | null;
  created_at: string;
  // Visibility controls (future feature — may be absent from older records)
  visible_to_parent?: boolean;
  visible_to_student?: boolean;
  submitted_at?: string | null;
  summary?: string | null;
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

// Bot sync health
export interface BotSyncEntry {
  id:              number;
  status:          'running' | 'success' | 'partial' | 'failed';
  source:          string;
  started_at:      string;
  completed_at:    string | null;
  records_created: number;
  records_updated: number;
  records_failed:  number;
  error_message:   string | null;
  triggered_by:    string | null;
  portal_api_url:  string | null;
}

export interface BotHealthResponse {
  sync_summary: {
    members:    BotSyncEntry | null;
    classes:    BotSyncEntry | null;
    lessons:    BotSyncEntry | null;
    attendance: BotSyncEntry | null;
  };
  recent_failures: {
    id: number; sync_type: string; status: string;
    error_message: string | null; created_at: string; triggered_by: string | null;
  }[];
  jobs: {
    pending: number;
    failed:  number;
    recent: {
      id: number; job_type: string; status: string;
      attempts: number; error: string | null; created_at: string;
    }[];
  };
  portal_api_url: string | null;
  last_any_sync:  string | null;
}

// Audit log
export interface AuditLogEntry {
  id: number;
  actor_id: number | null;
  actor_type: string;
  actor_name: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  entity_name: string | null;
  old_data: any;
  new_data: any;
  ip_address: string | null;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Comprehensive overview — GET /api/admin/overview
// ---------------------------------------------------------------------------

export interface OverviewLessonItem {
  id: number;
  title: string;
  className: string;
  classId: number;
  tutorName: string | null;
  enrolledCount: number | null;
  scheduledAt: string;
  endAt: string;
  durationMin: number;
  status: string;
  meetLink: string | null;
}

export interface OverviewPaymentItem {
  id: number;
  studentId: number;
  studentName: string;
  amountOwed: number; // cents
  dueDate: string | null;
  description: string;
}

export interface OverviewTutorPayItem {
  id: number;
  tutorId: number;
  tutorName: string;
  amountOwed: number; // cents
  period: string | null;
  description: string;
}

export interface OverviewAlertItem {
  id: number;
  alertType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  relatedType: string | null;
  relatedId: number | null;
  createdAt: string;
}

export interface OverviewRiskItem {
  type: string;
  severity: 'low' | 'medium' | 'high';
  title: string;
  entityType: string;
  entityId: number;
  action: string;
}

export interface OverviewSyncInfo {
  status: string;
  at: string;
  error: string | null;
  created: number;
  updated: number;
}

export interface OverviewActivityItem {
  id: number;
  action: string;
  entityType: string;
  entityName: string | null;
  actorName: string | null;
  actorType: string;
  createdAt: string;
}

export interface AdminOverviewData {
  summary: {
    activeStudents: number;
    activeTutors: number;
    activeClasses: number;
    parentAccounts: { total: number; pendingInvite: number; active: number };
    studentsByYear: Record<string, number>;
    newStudentsLast30Days: number;
    unreadMessages: number;
  };
  financials: {
    parentOutstanding: number;
    parentOverdue: number;
    countOverdue: number;
    oldestOverdueDate: string | null;
    topOverduePayments: OverviewPaymentItem[];
    revenueThisMonth: number;
    revenueAllTime: number;
    tutorPaymentsOwed: number;
    countTutorPaymentsPending: number;
    topTutorPayments: OverviewTutorPayItem[];
  };
  schedule: {
    today: OverviewLessonItem[];
    upcoming: OverviewLessonItem[];
  };
  actions: {
    priorityAlerts: OverviewAlertItem[];
  };
  risk: {
    students: OverviewRiskItem[];
    classes: OverviewRiskItem[];
    tutors: OverviewRiskItem[];
  };
  automation: {
    lastMemberSync: OverviewSyncInfo | null;
    lastCalendarSync: OverviewSyncInfo | null;
    lastLessonSync: OverviewSyncInfo | null;
    lastAttendanceSync: OverviewSyncInfo | null;
    pendingBotJobs: number;
    failedBotJobs: number;
    lastError: string | null;
  };
  recentActivity: OverviewActivityItem[];
}

// Overview stats (legacy — kept for compatibility)
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

  getOverview(): Promise<AdminOverviewData> {
    return get('/overview');
  },

  getOverviewStats(): Promise<AdminOverviewStats> {
    return get('/overview-stats');
  },

  // ── Tutors ──────────────────────────────────────────────────────────── //

  getTutors(params?: { skip?: number; limit?: number }):
    Promise<Paginated<TutorListItem>> {
    return get('/tutors', params);
  },

  getTutor(id: number): Promise<TutorDetail> {
    return get(`/tutors/${id}`);
  },

  createTutor(body: {
    full_name: string;
    email?: string;
    bio?: string;
    subjects?: string;
    hourly_rate?: number;
  }): Promise<{ id: number; full_name: string }> {
    return post('/tutors', body);
  },

  updateTutorProfile(id: number, body: Partial<{
    preferred_name: string;
    bio: string;
    subjects: string;
    hourly_rate: number;
  }>): Promise<{ updated: boolean }> {
    return patch(`/tutors/${id}/profile`, body);
  },

  deactivateTutor(id: number): Promise<{ updated: boolean }> {
    return patch(`/tutors/${id}/deactivate`, {});
  },

  deleteTutor(id: number): Promise<void> {
    return del(`/tutors/${id}`);
  },

  // ── Audit log ───────────────────────────────────────────────────────── //

  getAuditLog(params?: {
    actor_id?: number; entity_type?: string; action?: string;
    skip?: number; limit?: number;
  }): Promise<Paginated<AuditLogEntry>> {
    return get('/audit-log', params);
  },

  postAuditLog(body: {
    action: string;
    entity_type: string;
    entity_id?: string | number;
    entity_name?: string;
    actor_name?: string;
    actor_type?: string;
    old_data?: unknown;
    new_data?: unknown;
  }): Promise<{ id: number }> {
    return post('/audit-log', body);
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

  deleteParent(id: number): Promise<void> {
    return del(`/parents/${id}`);
  },

  deactivateParent(id: number): Promise<{ id: number; updated: boolean }> {
    return patch(`/parents/${id}`, { active: false });
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

  deactivateStudent(id: number): Promise<{ updated: boolean }> {
    return patch(`/students/${id}/deactivate`, { active: false });
  },

  deleteStudent(id: number): Promise<void> {
    return del(`/students/${id}`);
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

  createClass(body: {
    name: string;
    subject?: string;
    year_level?: string;
    tutor_user_id?: number;
    max_capacity?: number;
    active?: boolean;
  }): Promise<{ id: number; name: string }> {
    return post('/classes', body);
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
  }): Promise<{ id: number; title: string; google_event_id?: string }> {
    return post('/lessons', body);
  },

  updateLesson(id: number, body: Partial<{
    title: string;
    start_time: string;
    end_time: string;
    location: string;
    meet_link: string;
    description: string;
    status: string;
  }>): Promise<{ id: number; title: string; google_event_id?: string }> {
    return patch(`/lessons/${id}`, body);
  },

  cancelLesson(id: number): Promise<void> {
    return del(`/lessons/${id}`);
  },

  getCalendarEvents(start: string, end: string): Promise<Array<{
    google_event_id: string;
    title: string;
    start: string;
    end: string;
    location?: string;
    description?: string;
    html_link?: string;
  }>> {
    return get('/calendar/events', { start, end });
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
    student_id: number;
    description: string;
    amount_cents: number;        // total amount due in cents
    term?: string;
    frequency?: 'yearly' | 'termly' | 'weekly' | 'custom';
    installment_number?: number;
    total_installments?: number;
    due_date?: string;
    notes?: string;
  }): Promise<{ id: number }> {
    return post('/student-payments', body);
  },

  updateStudentPayment(id: number, body: Partial<{
    status: string;
    amount_paid_cents: number;   // record a payment receipt (in cents)
    payment_method: string;
    received_by: string;
    reference: string;
    paid_at: string;
    notes: string;
  }>): Promise<{ updated: boolean }> {
    return patch(`/student-payments/${id}`, body);
  },

  /** Mark a payment as fully paid in one action. */
  markPaymentPaid(id: number, body: {
    payment_method: string;
    received_by?: string;
    reference?: string;
    notes?: string;
  }): Promise<{ updated: boolean }> {
    return patch(`/student-payments/${id}/mark-paid`, body);
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
    student_id?: number; class_id?: number; status?: string;
    skip?: number; limit?: number;
  }): Promise<Paginated<ProgressReport>> {
    return get('/progress-reports', params);
  },

  createProgressReport(body: {
    student_id: number;
    class_id?: number;
    period?: string;
    score?: number;
    grade?: string;
    strengths?: string;
    improvements?: string;
    notes?: string;
  }): Promise<{ id: number }> {
    return post('/progress-reports', body);
  },

  updateProgressReport(id: number, body: Partial<{
    period: string;
    score: number;
    grade: string;
    strengths: string;
    improvements: string;
    visible_to_parent: boolean;
    visible_to_student: boolean;
    notes: string;
    status: 'draft' | 'published';
  }>): Promise<{ updated: boolean }> {
    return patch(`/progress-reports/${id}`, body);
  },

  publishProgressReport(id: number): Promise<{ updated: boolean }> {
    return patch(`/progress-reports/${id}`, { status: 'published' });
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

  // ── Bot Health ───────────────────────────────────────────────────────── //

  getBotHealth(): Promise<BotHealthResponse> {
    return get('/bot-health');
  },

  /** Queue a sync trigger job for the bot to pick up within 30 seconds. */
  triggerBotSync(syncType: 'sync_members' | 'sync_classes' | 'sync_lessons' | 'sync_attendance'): Promise<{ id: number; status: string }> {
    return post('/bot-jobs', { job_type: syncType, payload: { triggered_by: 'admin_portal' } });
  },

  // ── Bot Jobs ─────────────────────────────────────────────────────────── //

  getBotJobs(params?: { status?: string; job_type?: string }): Promise<Paginated<{
    id: number; job_type: string; status: string; priority: number;
    attempts: number; max_attempts: number; error: string | null;
    created_at: string; claimed_at: string | null; completed_at: string | null;
  }>> {
    return get('/bot-jobs', params);
  },

  cancelBotJob(id: number): Promise<void> {
    return del(`/bot-jobs/${id}`);
  },
};
