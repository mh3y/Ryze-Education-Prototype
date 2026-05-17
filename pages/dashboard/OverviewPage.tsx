/**
 * OverviewPage — the landing page shown at /dashboard/overview.
 *
 * Role-aware: each role gets a purpose-built dashboard view.
 *   - parent  → ParentDashboard  (lesson schedule, attendance, payments, reports)
 *   - student → StudentDashboard (upcoming lessons, resources, AI Arena shortcut)
 *   - tutor   → TutorDashboard   (classes, upcoming lessons, attendance & report shortcuts)
 *   - admin   → AdminOverview    (stats, alerts, today's classes)
 */

import React, { lazy, Suspense } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingState } from '../../components/dashboard/ui';

const ParentDashboard  = lazy(() => import('./ParentDashboard'));
const StudentDashboard = lazy(() => import('./StudentDashboard'));
const TutorDashboard   = lazy(() => import('./TutorDashboard'));
const AdminOverview    = lazy(() => import('./admin/AdminOverview'));

const OverviewPage: React.FC = () => {
  const { user } = useAuth();

  switch (user?.role) {
    case 'parent':
      return (
        <Suspense fallback={<LoadingState />}>
          <ParentDashboard />
        </Suspense>
      );
    case 'student':
      return (
        <Suspense fallback={<LoadingState />}>
          <StudentDashboard />
        </Suspense>
      );
    case 'tutor':
      return (
        <Suspense fallback={<LoadingState />}>
          <TutorDashboard />
        </Suspense>
      );
    case 'admin':
      return (
        <Suspense fallback={<LoadingState />}>
          <AdminOverview />
        </Suspense>
      );
    default:
      return <LoadingState />;
  }
};

export default OverviewPage;
