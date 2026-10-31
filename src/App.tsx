import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
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

// Inner wrapper to access navigate
const AppRoutes: React.FC = () => {
  const navigate = useNavigate();

  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    return (localStorage.getItem('cit_role') as UserRole) || 'admin';
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('cit_authenticated') === 'true';
  });

  const handleLoginSuccess = (newSession: UserSession) => {
    setCurrentRole(newSession.role);
    setIsAuthenticated(true);
    localStorage.setItem('cit_role', newSession.role);
    localStorage.setItem('cit_authenticated', 'true');
    navigate('/');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('cit_authenticated');
    navigate('/login');
  };

  const handleRoleChange = (newRole: UserRole) => {
    setCurrentRole(newRole);
    localStorage.setItem('cit_role', newRole);
  };

  return (
    <Routes>
      {/* 1. Main Route:
          - If NOT logged in: opens the Cinematic CIT Login Page!
          - If logged in: opens the CampusSync Liquid Glass Dashboard! */}
      <Route
        path="/"
        element={
          !isAuthenticated ? (
            <LoginPage onLoginSuccess={handleLoginSuccess} />
          ) : (
            <DashboardLayout
              currentRole={currentRole}
              onRoleChange={handleRoleChange}
              onLogout={handleLogout}
            >
              <OverviewPage currentRole={currentRole} />
            </DashboardLayout>
          )
        }
      />

      {/* Explicit Login Route */}
      <Route
        path="/login"
        element={<LoginPage onLoginSuccess={handleLoginSuccess} />}
      />

      {/* Dashboard Route */}
      <Route
        path="/dashboard"
        element={
          !isAuthenticated ? (
            <Navigate to="/login" replace />
          ) : (
            <DashboardLayout
              currentRole={currentRole}
              onRoleChange={handleRoleChange}
              onLogout={handleLogout}
            >
              <OverviewPage currentRole={currentRole} />
            </DashboardLayout>
          )
        }
      />

      {/* 1. Timetable Management */}
      <Route
        path="/timetable"
        element={
          !isAuthenticated ? (
            <Navigate to="/login" replace />
          ) : (
            <DashboardLayout
              currentRole={currentRole}
              onRoleChange={handleRoleChange}
              onLogout={handleLogout}
            >
              <TimetablePage />
            </DashboardLayout>
          )
        }
      />

      {/* 2. Exam Scheduler */}
      <Route
        path="/exam-scheduler"
        element={
          !isAuthenticated ? (
            <Navigate to="/login" replace />
          ) : (
            <DashboardLayout
              currentRole={currentRole}
              onRoleChange={handleRoleChange}
              onLogout={handleLogout}
            >
              <ExamSchedulerPage />
            </DashboardLayout>
          )
        }
      />

      {/* 3. Venue Booking */}
      <Route
        path="/venue-booking"
        element={
          !isAuthenticated ? (
            <Navigate to="/login" replace />
          ) : (
            <DashboardLayout
              currentRole={currentRole}
              onRoleChange={handleRoleChange}
              onLogout={handleLogout}
            >
              <VenueBookingPage />
            </DashboardLayout>
          )
        }
      />

      {/* 4. Rescheduling */}
      <Route
        path="/rescheduling"
        element={
          !isAuthenticated ? (
            <Navigate to="/login" replace />
          ) : (
            <DashboardLayout
              currentRole={currentRole}
              onRoleChange={handleRoleChange}
              onLogout={handleLogout}
            >
              <ReschedulingPage />
            </DashboardLayout>
          )
        }
      />

      {/* 5. AI Assistant */}
      <Route
        path="/ai-assistant"
        element={
          !isAuthenticated ? (
            <Navigate to="/login" replace />
          ) : (
            <DashboardLayout
              currentRole={currentRole}
              onRoleChange={handleRoleChange}
              onLogout={handleLogout}
            >
              <AiAssistantPage />
            </DashboardLayout>
          )
        }
      />

      {/* 6. Approvals */}
      <Route
        path="/approvals"
        element={
          !isAuthenticated ? (
            <Navigate to="/login" replace />
          ) : (
            <DashboardLayout
              currentRole={currentRole}
              onRoleChange={handleRoleChange}
              onLogout={handleLogout}
            >
              <ApprovalsPage currentRole={currentRole} />
            </DashboardLayout>
          )
        }
      />

      {/* 7. Room Management */}
      <Route
        path="/rooms"
        element={
          !isAuthenticated ? (
            <Navigate to="/login" replace />
          ) : (
            <DashboardLayout
              currentRole={currentRole}
              onRoleChange={handleRoleChange}
              onLogout={handleLogout}
            >
              <RoomManagementPage />
            </DashboardLayout>
          )
        }
      />

      {/* 8. Analytics */}
      <Route
        path="/analytics"
        element={
          !isAuthenticated ? (
            <Navigate to="/login" replace />
          ) : (
            <DashboardLayout
              currentRole={currentRole}
              onRoleChange={handleRoleChange}
              onLogout={handleLogout}
            >
              <AnalyticsPage />
            </DashboardLayout>
          )
        }
      />

      {/* 9. Dataset Management */}
      <Route
        path="/datasets"
        element={
          !isAuthenticated ? (
            <Navigate to="/login" replace />
          ) : (
            <DashboardLayout
              currentRole={currentRole}
              onRoleChange={handleRoleChange}
              onLogout={handleLogout}
            >
              <DatasetManagementPage />
            </DashboardLayout>
          )
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
};

export default App;
