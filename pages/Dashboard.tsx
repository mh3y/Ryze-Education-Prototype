/**
 * Dashboard.tsx
 *
 * @deprecated This file is kept as a safety redirect only.
 * The dashboard is now powered by DashboardLayout + nested routes.
 * Route: /dashboard → /dashboard/overview (via App.tsx nested routes)
 */

import React from 'react';
import { Navigate } from 'react-router-dom';

const Dashboard: React.FC = () => <Navigate to="/dashboard/overview" replace />;

export default Dashboard;
