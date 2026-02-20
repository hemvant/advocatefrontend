import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { SuperAdminAuthProvider } from './context/SuperAdminAuthContext';
import { OrgAuthProvider } from './context/OrgAuthContext';
import SuperAdminLayout from './layouts/SuperAdminLayout';
import OrgLayout from './layouts/OrgLayout';
import ProtectedRoute from './components/ProtectedRoute';
import SuperAdminProtectedRoute from './components/SuperAdminProtectedRoute';
import SuperAdminLogin from './pages/superadmin/SuperAdminLogin';
import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard';
import SuperAdminOrganizationsPage from './pages/superadmin/SuperAdminOrganizationsPage';
import OrganizationDetailPage from './pages/superadmin/OrganizationDetailPage';
import SubscriptionsPage from './pages/superadmin/SubscriptionsPage';
import PlatformAuditLogsPage from './pages/superadmin/PlatformAuditLogsPage';
import SystemHealthPage from './pages/superadmin/SystemHealthPage';
import OrgLogin from './pages/org/OrgLogin';
import OrgDashboard from './pages/org/OrgDashboard';
import OrgEmployees from './pages/org/OrgEmployees';
import OrgModules from './pages/org/OrgModules';
import ClientList from './pages/clients/ClientList';
import ClientCreate from './pages/clients/ClientCreate';
import ClientProfile from './pages/clients/ClientProfile';
import ClientEdit from './pages/clients/ClientEdit';
import CaseList from './pages/cases/CaseList';
import CaseCreate from './pages/cases/CaseCreate';
import CaseProfile from './pages/cases/CaseProfile';
import CaseEdit from './pages/cases/CaseEdit';
import CalendarPage from './pages/calendar/CalendarPage';
import HearingDetail from './pages/calendar/HearingDetail';
import Placeholder from './pages/Placeholder';
import AnalyticsPage from './pages/reports/AnalyticsPage';
import CaseDocumentsPage from './pages/documents/CaseDocumentsPage';
import DocumentListPage from './pages/documents/DocumentListPage';
import DocumentDetailPage from './pages/documents/DocumentDetailPage';
import CourtList from './pages/courts/CourtList';
import CourtCreate from './pages/courts/CourtCreate';
import CourtDetail from './pages/courts/CourtDetail';
import JudgeList from './pages/judges/JudgeList';
import BenchList from './pages/benches/BenchList';
import CourtroomList from './pages/courtrooms/CourtroomList';
import AuditLogsPage from './pages/audit/AuditLogsPage';
import TasksPage from './pages/tasks/TasksPage';
import CaseTasksPage from './pages/tasks/CaseTasksPage';

export default function App() {
  return (
    <SuperAdminAuthProvider>
      <OrgAuthProvider>
        <Routes>
          <Route path="/super-admin/login" element={<SuperAdminLogin />} />
          <Route
            path="/super-admin"
            element={
              <SuperAdminProtectedRoute>
                <SuperAdminLayout />
              </SuperAdminProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/super-admin/dashboard" replace />} />
            <Route path="dashboard" element={<SuperAdminDashboard />} />
            <Route path="organizations" element={<SuperAdminOrganizationsPage />} />
            <Route path="organizations/:id" element={<OrganizationDetailPage />} />
            <Route path="subscriptions" element={<SubscriptionsPage />} />
            <Route path="audit-logs" element={<PlatformAuditLogsPage />} />
            <Route path="system-health" element={<SystemHealthPage />} />
          </Route>

          <Route path="/login" element={<OrgLogin />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <OrgLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<OrgDashboard />} />
            <Route path="employees" element={<OrgEmployees />} />
            <Route path="modules" element={<OrgModules />} />
            <Route path="clients" element={<ClientList />} />
            <Route path="clients/create" element={<ClientCreate />} />
            <Route path="clients/:id" element={<ClientProfile />} />
            <Route path="clients/:id/edit" element={<ClientEdit />} />
            <Route path="cases" element={<CaseList />} />
            <Route path="cases/create" element={<CaseCreate />} />
            <Route path="cases/:id" element={<CaseProfile />} />
            <Route path="cases/:id/edit" element={<CaseEdit />} />
            <Route path="cases/:id/tasks" element={<CaseTasksPage />} />
            <Route path="cases/:id/documents" element={<CaseDocumentsPage />} />
            <Route path="tasks" element={<TasksPage />} />
            <Route path="courts" element={<CourtList />} />
            <Route path="courts/create" element={<CourtCreate />} />
            <Route path="courts/:id" element={<CourtDetail />} />
            <Route path="judges" element={<JudgeList />} />
            <Route path="benches" element={<BenchList />} />
            <Route path="courtrooms" element={<CourtroomList />} />
            <Route path="audit-logs" element={<AuditLogsPage />} />
            <Route path="documents" element={<DocumentListPage />} />
            <Route path="documents/:id" element={<DocumentDetailPage />} />
            <Route path="billing" element={<Placeholder />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="hearings/:id" element={<HearingDetail />} />
            <Route path="reports" element={<AnalyticsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </OrgAuthProvider>
    </SuperAdminAuthProvider>
  );
}
