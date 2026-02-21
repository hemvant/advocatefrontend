import React, { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { SuperAdminAuthProvider } from './context/SuperAdminAuthContext';
import { OrgAuthProvider } from './context/OrgAuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ErrorBoundaryClass } from './components/ErrorBoundary';
import SuperAdminLayout from './layouts/SuperAdminLayout';
import OrgLayout from './layouts/OrgLayout';
import ProtectedRoute from './components/ProtectedRoute';
import SuperAdminProtectedRoute from './components/SuperAdminProtectedRoute';
import PageLoader from './components/ui/PageLoader';
import NotFoundPage from './pages/errors/NotFoundPage';
import ForbiddenPage from './pages/errors/ForbiddenPage';
import ServerErrorPage from './pages/errors/ServerErrorPage';
import NetworkErrorPage from './pages/errors/NetworkErrorPage';
import SuperAdminLogin from './pages/superadmin/SuperAdminLogin';
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
import DocumentListPage from './pages/documents/DocumentListPage';
import DocumentDetailPage from './pages/documents/DocumentDetailPage';
import CaseDocumentsPage from './pages/documents/CaseDocumentsPage';
import CourtList from './pages/courts/CourtList';
import CourtCreate from './pages/courts/CourtCreate';
import CourtDetail from './pages/courts/CourtDetail';
import JudgeList from './pages/judges/JudgeList';
import BenchList from './pages/benches/BenchList';
import CourtroomList from './pages/courtrooms/CourtroomList';
import AuditLogsPage from './pages/audit/AuditLogsPage';
import TasksPage from './pages/tasks/TasksPage';
import CaseTasksPage from './pages/tasks/CaseTasksPage';
import BillingPage from './pages/billing/BillingPage';
import AnalyticsPage from './pages/reports/AnalyticsPage';

const SuperAdminDashboard = lazy(() => import('./pages/superadmin/SuperAdminDashboard'));
const SuperAdminOrganizationsPage = lazy(() => import('./pages/superadmin/SuperAdminOrganizationsPage'));
const OrganizationDetailPage = lazy(() => import('./pages/superadmin/OrganizationDetailPage'));
const SubscriptionsPage = lazy(() => import('./pages/superadmin/SubscriptionsPage'));
const PlatformAuditLogsPage = lazy(() => import('./pages/superadmin/PlatformAuditLogsPage'));
const SystemHealthPage = lazy(() => import('./pages/superadmin/SystemHealthPage'));
const PackagesPage = lazy(() => import('./pages/superadmin/PackagesPage'));
const InvoicesPage = lazy(() => import('./pages/superadmin/InvoicesPage'));

function LazyRoute({ children }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

export default function App() {
  const navigate = useNavigate();
  useEffect(() => {
    const h = () => navigate('/network-error', { replace: true });
    window.addEventListener('app:network-error', h);
    return () => window.removeEventListener('app:network-error', h);
  }, [navigate]);

  return (
    <ErrorBoundaryClass>
      <SuperAdminAuthProvider>
        <OrgAuthProvider>
          <NotificationProvider>
            <Routes>
              <Route path="/404" element={<NotFoundPage />} />
              <Route path="/403" element={<ForbiddenPage />} />
              <Route path="/500" element={<ServerErrorPage />} />
              <Route path="/network-error" element={<NetworkErrorPage />} />
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
            <Route path="dashboard" element={<LazyRoute><SuperAdminDashboard /></LazyRoute>} />
            <Route path="organizations" element={<LazyRoute><SuperAdminOrganizationsPage /></LazyRoute>} />
            <Route path="organizations/:id" element={<LazyRoute><OrganizationDetailPage /></LazyRoute>} />
            <Route path="subscriptions" element={<LazyRoute><SubscriptionsPage /></LazyRoute>} />
            <Route path="packages" element={<LazyRoute><PackagesPage /></LazyRoute>} />
            <Route path="invoices" element={<LazyRoute><InvoicesPage /></LazyRoute>} />
            <Route path="audit-logs" element={<LazyRoute><PlatformAuditLogsPage /></LazyRoute>} />
            <Route path="system-health" element={<LazyRoute><SystemHealthPage /></LazyRoute>} />
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
            <Route path="billing" element={<BillingPage />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="hearings/:id" element={<HearingDetail />} />
            <Route path="reports" element={<AnalyticsPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </NotificationProvider>
        </OrgAuthProvider>
      </SuperAdminAuthProvider>
    </ErrorBoundaryClass>
  );
}
