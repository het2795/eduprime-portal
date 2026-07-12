import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = () => {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-navy-950 text-slate-800 dark:text-slate-200">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-semibold tracking-wider font-heading">Restoring Secure Session...</span>
        </div>
      </div>
    );
  }

  // Redirect to login if user is not authenticated
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950 text-slate-800 dark:text-slate-100 transition-colors duration-300">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="ml-64 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <Navbar />

        {/* Dynamic Nested Content */}
        <main className="flex-1 pt-16 px-6 pb-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
