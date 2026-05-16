import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Optionally restrict to specific roles. If omitted, any authenticated user passes. */
  roles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, roles }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // While the initial session check is in-flight, show a spinner so we don't
  // flash the login page to a user who is actually logged in.
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-transparent">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#FFB000]/20 border-t-[#FFB000]" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Save the attempted location so we can redirect back after login.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role guard (optional)
  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
