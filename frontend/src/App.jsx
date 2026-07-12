import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Public Auth Page
import Login from './pages/Login';

// Student Pages
import Dashboard from './pages/Dashboard';
import Attendance from './pages/Attendance';
import Grades from './pages/Grades';
import Assignments from './pages/Assignments';
import Fees from './pages/Fees';
import DigitalID from './pages/DigitalID';

// Faculty Pages
import FacultyDashboard from './pages/faculty/FacultyDashboard';
import MarkAttendance from './pages/faculty/MarkAttendance';
import FacultyAssignments from './pages/faculty/FacultyAssignments';
import UploadMaterials from './pages/faculty/UploadMaterials';
import MyStudents from './pages/faculty/MyStudents';
import FacultyClasses from './pages/faculty/FacultyClasses';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import TimetableManagement from './pages/admin/TimetableManagement';
import LeaveApprovals from './pages/admin/LeaveApprovals';
import AdminHelpdesk from './pages/admin/AdminHelpdesk';
import FeeManagement from './pages/admin/FeeManagement';
import ClassesSetup from './pages/admin/ClassesSetup';

// Shared Pages
import Analytics from './pages/Analytics';
import Announcements from './pages/Announcements';
import Timetable from './pages/Timetable';
import CourseMaterials from './pages/CourseMaterials';
import Placements from './pages/Placements';
import Events from './pages/Events';
import Leave from './pages/Leave';
import Helpdesk from './pages/Helpdesk';
import AIChat from './pages/AIChat';
import Profile from './pages/Profile';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Auth Route */}
          <Route path="/login" element={<Login />} />

          {/* Secure Portal Layout Shell */}
          <Route path="/" element={<Layout />}>
            
            {/* Student Protected Routes */}
            <Route index element={
              <ProtectedRoute allowedRoles={['student']}>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="attendance" element={
              <ProtectedRoute allowedRoles={['student']}>
                <Attendance />
              </ProtectedRoute>
            } />
            <Route path="grades" element={
              <ProtectedRoute allowedRoles={['student']}>
                <Grades />
              </ProtectedRoute>
            } />
            <Route path="assignments" element={
              <ProtectedRoute allowedRoles={['student']}>
                <Assignments />
              </ProtectedRoute>
            } />
            <Route path="fees" element={
              <ProtectedRoute allowedRoles={['student']}>
                <Fees />
              </ProtectedRoute>
            } />
            <Route path="id-card" element={
              <ProtectedRoute allowedRoles={['student']}>
                <DigitalID />
              </ProtectedRoute>
            } />

            {/* Faculty Protected Routes */}
            <Route path="faculty/dashboard" element={
              <ProtectedRoute allowedRoles={['faculty']}>
                <FacultyDashboard />
              </ProtectedRoute>
            } />
            <Route path="faculty/classes" element={
              <ProtectedRoute allowedRoles={['faculty']}>
                <FacultyClasses />
              </ProtectedRoute>
            } />
            <Route path="faculty/mark-attendance" element={
              <ProtectedRoute allowedRoles={['faculty']}>
                <MarkAttendance />
              </ProtectedRoute>
            } />
            <Route path="faculty/assignments" element={
              <ProtectedRoute allowedRoles={['faculty']}>
                <FacultyAssignments />
              </ProtectedRoute>
            } />
            <Route path="faculty/upload-materials" element={
              <ProtectedRoute allowedRoles={['faculty']}>
                <UploadMaterials />
              </ProtectedRoute>
            } />
            <Route path="faculty/my-students" element={
              <ProtectedRoute allowedRoles={['faculty']}>
                <MyStudents />
              </ProtectedRoute>
            } />

            {/* Admin Protected Routes */}
            <Route path="admin/dashboard" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="admin/users" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <UserManagement />
              </ProtectedRoute>
            } />
            <Route path="admin/timetable-management" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <TimetableManagement />
              </ProtectedRoute>
            } />
            <Route path="admin/classes-setup" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ClassesSetup />
              </ProtectedRoute>
            } />
            <Route path="admin/leave-approvals" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <LeaveApprovals />
              </ProtectedRoute>
            } />
            <Route path="admin/helpdesk-tickets" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminHelpdesk />
              </ProtectedRoute>
            } />
            <Route path="admin/fee-management" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <FeeManagement />
              </ProtectedRoute>
            } />

            {/* Shared Access Protected Routes */}
            <Route path="analytics" element={
              <ProtectedRoute allowedRoles={['student', 'faculty', 'admin']}>
                <Analytics />
              </ProtectedRoute>
            } />
            <Route path="announcements" element={
              <ProtectedRoute allowedRoles={['student', 'faculty', 'admin']}>
                <Announcements />
              </ProtectedRoute>
            } />
            <Route path="timetable" element={
              <ProtectedRoute allowedRoles={['student', 'faculty', 'admin']}>
                <Timetable />
              </ProtectedRoute>
            } />
            <Route path="course-materials" element={
              <ProtectedRoute allowedRoles={['student', 'faculty', 'admin']}>
                <CourseMaterials />
              </ProtectedRoute>
            } />
            <Route path="placements" element={
              <ProtectedRoute allowedRoles={['student', 'faculty', 'admin']}>
                <Placements />
              </ProtectedRoute>
            } />
            <Route path="events" element={
              <ProtectedRoute allowedRoles={['student', 'faculty', 'admin']}>
                <Events />
              </ProtectedRoute>
            } />
            <Route path="leave" element={
              <ProtectedRoute allowedRoles={['student', 'faculty', 'admin']}>
                <Leave />
              </ProtectedRoute>
            } />
            <Route path="helpdesk" element={
              <ProtectedRoute allowedRoles={['student', 'faculty', 'admin']}>
                <Helpdesk />
              </ProtectedRoute>
            } />
            <Route path="chat" element={
              <ProtectedRoute allowedRoles={['student', 'faculty', 'admin']}>
                <AIChat />
              </ProtectedRoute>
            } />
            <Route path="profile" element={
              <ProtectedRoute allowedRoles={['student', 'faculty', 'admin']}>
                <Profile />
              </ProtectedRoute>
            } />

          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
