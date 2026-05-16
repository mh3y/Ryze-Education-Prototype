/**
 * permissions.ts — Role-based access control helpers for the portal.
 *
 * These are pure functions that take a PortalUser and return a boolean.
 * Use them in components to conditionally show/hide actions, or in
 * ProtectedRoute's `roles` prop for route-level guards.
 *
 * Ryze roles:
 *   admin   — can do everything
 *   tutor   — can manage their own classes/lessons, submit reports, mark attendance
 *   student — read-only access to their own data
 *   parent  — read-only access to their children's data
 */

import type { PortalUser } from '../services/auth';

type MaybeUser = PortalUser | null | undefined;

// ---------------------------------------------------------------------------
// Base helpers
// ---------------------------------------------------------------------------

export const isAdmin  = (u: MaybeUser): boolean => u?.role === 'admin';
export const isTutor  = (u: MaybeUser): boolean => u?.role === 'tutor';
export const isStudent = (u: MaybeUser): boolean => u?.role === 'student';
export const isParent  = (u: MaybeUser): boolean => u?.role === 'parent';

export const isAdminOrTutor = (u: MaybeUser): boolean => isAdmin(u) || isTutor(u);

// ---------------------------------------------------------------------------
// Student / user management
// ---------------------------------------------------------------------------

/** Can view the student list or any student profile. */
export const canViewStudents = (u: MaybeUser): boolean => isAdminOrTutor(u);

/** Can create or edit student records (admin only). */
export const canManageStudents = (u: MaybeUser): boolean => isAdmin(u);

/** Can link/unlink parents to students (admin only). */
export const canManageParentLinks = (u: MaybeUser): boolean => isAdmin(u);

// ---------------------------------------------------------------------------
// Parent management
// ---------------------------------------------------------------------------

/** Can view the parents list (admin only). */
export const canViewParents = (u: MaybeUser): boolean => isAdmin(u);

/** Can create/edit parent profiles and send invites (admin only). */
export const canManageParents = (u: MaybeUser): boolean => isAdmin(u);

// ---------------------------------------------------------------------------
// Classes / lessons
// ---------------------------------------------------------------------------

/** Can view class groups. */
export const canViewClasses = (u: MaybeUser): boolean => isAdminOrTutor(u);

/** Can create/edit/archive class groups (admin only). */
export const canManageClasses = (u: MaybeUser): boolean => isAdmin(u);

/** Can view lessons. */
export const canViewLessons = (u: MaybeUser): boolean => isAdminOrTutor(u);

/** Can create/edit/cancel lessons (admin only). */
export const canManageLessons = (u: MaybeUser): boolean => isAdmin(u);

// ---------------------------------------------------------------------------
// Attendance
// ---------------------------------------------------------------------------

/** Can view attendance records. */
export const canViewAttendance = (u: MaybeUser): boolean => isAdminOrTutor(u);

/**
 * Can mark attendance for a lesson.
 * Tutors can only mark for their assigned classes — caller must validate class ownership.
 */
export const canMarkAttendance = (u: MaybeUser): boolean => isAdminOrTutor(u);

/** Can override/edit existing attendance records (admin only). */
export const canOverrideAttendance = (u: MaybeUser): boolean => isAdmin(u);

// ---------------------------------------------------------------------------
// Progress reports
// ---------------------------------------------------------------------------

/** Can view progress reports. */
export const canViewProgressReports = (u: MaybeUser): boolean => isAdminOrTutor(u);

/**
 * Can submit/edit a progress report.
 * Tutors can submit for their lessons — class ownership is validated server-side.
 */
export const canSubmitProgressReport = (u: MaybeUser): boolean => isAdminOrTutor(u);

/** Can approve reports and mark them as visible to parents/students (admin only). */
export const canApproveProgressReport = (u: MaybeUser): boolean => isAdmin(u);

// ---------------------------------------------------------------------------
// Homework
// ---------------------------------------------------------------------------

/** Can view homework assignments. */
export const canViewHomework = (u: MaybeUser): boolean => isAdminOrTutor(u);

/** Can set/edit homework (tutor or admin). */
export const canManageHomework = (u: MaybeUser): boolean => isAdminOrTutor(u);

// ---------------------------------------------------------------------------
// Payments
// ---------------------------------------------------------------------------

/** Can view student payment records (admin only). */
export const canViewPayments = (u: MaybeUser): boolean => isAdmin(u);

/** Can mark payments as paid/overdue/waived (admin only). */
export const canManagePayments = (u: MaybeUser): boolean => isAdmin(u);

/** Can view tutor payment records (admin only). */
export const canViewTutorPayments = (u: MaybeUser): boolean => isAdmin(u);

/** Can mark tutor payments as paid (admin only). */
export const canManageTutorPayments = (u: MaybeUser): boolean => isAdmin(u);

// ---------------------------------------------------------------------------
// Alerts
// ---------------------------------------------------------------------------

/** Can view and manage system alerts (admin only). */
export const canManageAlerts = (u: MaybeUser): boolean => isAdmin(u);

// ---------------------------------------------------------------------------
// Resources & announcements
// ---------------------------------------------------------------------------

/** Can view resources shared in classes. */
export const canViewResources = (u: MaybeUser): boolean => !!u; // all authenticated users

/** Can upload/create resources (tutor or admin). */
export const canManageResources = (u: MaybeUser): boolean => isAdminOrTutor(u);

/** Can create/publish announcements (admin or tutor for their classes). */
export const canManageAnnouncements = (u: MaybeUser): boolean => isAdminOrTutor(u);

// ---------------------------------------------------------------------------
// Tutor availability
// ---------------------------------------------------------------------------

/** Can submit an unavailability request. */
export const canSubmitAvailability = (u: MaybeUser): boolean => isTutor(u) || isAdmin(u);

/** Can approve/reject availability requests (admin only). */
export const canApproveAvailability = (u: MaybeUser): boolean => isAdmin(u);

// ---------------------------------------------------------------------------
// Makeup lessons
// ---------------------------------------------------------------------------

/** Can request a makeup lesson (student, parent, or admin on their behalf). */
export const canRequestMakeup = (u: MaybeUser): boolean =>
  isStudent(u) || isParent(u) || isAdmin(u);

/** Can approve/reject makeup lesson requests (admin only). */
export const canApproveMakeup = (u: MaybeUser): boolean => isAdmin(u);

// ---------------------------------------------------------------------------
// Settings / admin config
// ---------------------------------------------------------------------------

/** Can access the admin settings and email template pages (admin only). */
export const canManageSettings = (u: MaybeUser): boolean => isAdmin(u);
