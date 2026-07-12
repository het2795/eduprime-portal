import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-navy-950 text-slate-800 dark:text-slate-200">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-semibold tracking-wider font-heading">Verifying credentials...</span>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Check if role is allowed
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Show user-visible error alert
    alert("You don't have access to this page.");

    // Redirect user to their own home dashboard
    if (user.role === 'faculty') {
      return <Navigate to="/faculty/dashboard" replace />;
    } else if (user.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
