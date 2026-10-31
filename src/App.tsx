import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './components/dashboard/DashboardLayout';
import { OverviewPage } from './pages/OverviewPage';
import { TimetablePage } from './pages/TimetablePage';
import { ExamSchedulerPage } from './pages/ExamSchedulerPage';
import { VenueBookingPage } from './pages/VenueBookingPage';
import { ReschedulingPage } from './pages/ReschedulingPage';
import { AiAssistantPage } from './pages/AiAssistantPage';
import { ApprovalsPage } from './pages/ApprovalsPage';
import { RoomManagementPage } from './pages/RoomManagementPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { DatasetManagementPage } from './pages/DatasetManagementPage';
import { LoginPage } from './pages/LoginPage';
import type { UserRole, UserSession } from './types';

export const App: React.FC = () => {
  const [currentRole, setCurrentRole] = useState<UserRole>('admin');

  const handleLoginSuccess = (newSession: UserSession) => {
    setCurrentRole(newSession.role);
  };

  const handleLogout = () => {
    // Navigation to /login handled by GlassNavbar
  };

  const handleRoleChange = (newRole: UserRole) => {
    setCurrentRole(newRole);
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Main Dashboard Overview - Exact Reference Design */}
        <Route
          path="/"
          element={
            <DashboardLayout
              currentRole={currentRole}
              onRoleChange={handleRoleChange}
              onLogout={handleLogout}
            >
              <OverviewPage currentRole={currentRole} />
            </DashboardLayout>
          }
        />

        <Route
          path="/dashboard"
          element={<Navigate to="/" replace />}
        />

        {/* 1. Timetable Management */}
        <Route
          path="/timetable"
          element={
            <DashboardLayout
              currentRole={currentRole}
              onRoleChange={handleRoleChange}
              onLogout={handleLogout}
            >
              <TimetablePage />
            </DashboardLayout>
          }
        />

        {/* 2. Exam Scheduler */}
        <Route
          path="/exam-scheduler"
          element={
            <DashboardLayout
              currentRole={currentRole}
              onRoleChange={handleRoleChange}
              onLogout={handleLogout}
            >
              <ExamSchedulerPage />
            </DashboardLayout>
          }
        />

        {/* 3. Venue Booking */}
        <Route
          path="/venue-booking"
          element={
            <DashboardLayout
              currentRole={currentRole}
              onRoleChange={handleRoleChange}
              onLogout={handleLogout}
            >
              <VenueBookingPage />
            </DashboardLayout>
          }
        />

        {/* 4. Rescheduling */}
        <Route
          path="/rescheduling"
          element={
            <DashboardLayout
              currentRole={currentRole}
              onRoleChange={handleRoleChange}
              onLogout={handleLogout}
            >
              <ReschedulingPage />
            </DashboardLayout>
          }
        />

        {/* 5. AI Assistant */}
        <Route
          path="/ai-assistant"
          element={
            <DashboardLayout
              currentRole={currentRole}
              onRoleChange={handleRoleChange}
              onLogout={handleLogout}
            >
              <AiAssistantPage />
            </DashboardLayout>
          }
        />

        {/* 6. Approvals */}
        <Route
          path="/approvals"
          element={
            <DashboardLayout
              currentRole={currentRole}
              onRoleChange={handleRoleChange}
              onLogout={handleLogout}
            >
              <ApprovalsPage currentRole={currentRole} />
            </DashboardLayout>
          }
        />

        {/* 7. Room Management */}
        <Route
          path="/rooms"
          element={
            <DashboardLayout
              currentRole={currentRole}
              onRoleChange={handleRoleChange}
              onLogout={handleLogout}
            >
              <RoomManagementPage />
            </DashboardLayout>
          }
        />

        {/* 8. Analytics */}
        <Route
          path="/analytics"
          element={
            <DashboardLayout
              currentRole={currentRole}
              onRoleChange={handleRoleChange}
              onLogout={handleLogout}
            >
              <AnalyticsPage />
            </DashboardLayout>
          }
        />

        {/* 9. Dataset Management */}
        <Route
          path="/datasets"
          element={
            <DashboardLayout
              currentRole={currentRole}
              onRoleChange={handleRoleChange}
              onLogout={handleLogout}
            >
              <DatasetManagementPage />
            </DashboardLayout>
          }
        />

        {/* Dedicated Cinematic CIT Login Page */}
        <Route
          path="/login"
          element={<LoginPage onLoginSuccess={handleLoginSuccess} />}
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
