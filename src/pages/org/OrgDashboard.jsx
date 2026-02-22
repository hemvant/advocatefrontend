import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useOrgAuth } from '../../context/OrgAuthContext';
import { getSetupStatus } from '../../services/orgApi';
import { getDashboardHearings } from '../../services/hearingApi';
import { getTaskDashboard } from '../../services/taskApi';
import { getDocumentDashboard } from '../../services/documentApi';
import PageLoader from '../../components/ui/PageLoader';
import EmptyState from '../../components/ui/EmptyState';

export default function OrgDashboard() {
  const { user, hasModule, subscriptionInfo } = useOrgAuth();
  const [setupStatus, setSetupStatus] = useState(null);
  const [hearings, setHearings] = useState({ todays: [], upcoming: [], overdue: [] });
  const [tasks, setTasks] = useState({ myTasks: [], overdue: [], upcoming: [] });
  const [docStats, setDocStats] = useState({ total: 0, processed: 0, pending: 0, recent: [] });
  const [loadingHearings, setLoadingHearings] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);

  useEffect(() => {
    getSetupStatus()
      .then(({ data }) => setSetupStatus(data?.data || data))
      .catch(() => setSetupStatus(null));
  }, []);

  useEffect(() => {
    if (hasModule('Case Management')) {
      setLoadingHearings(true);
      setLoadingTasks(true);
      getDashboardHearings()
        .then(({ data }) => setHearings(data.data || { todays: [], upcoming: [], overdue: [] }))
        .catch(() => setHearings({ todays: [], upcoming: [], overdue: [] }))
        .finally(() => setLoadingHearings(false));
      getTaskDashboard()
        .then(({ data }) => setTasks(data.data || { myTasks: [], overdue: [], upcoming: [] }))
        .catch(() => setTasks({ myTasks: [], overdue: [], upcoming: [] }))
        .finally(() => setLoadingTasks(false));
    }
  }, [hasModule]);

  useEffect(() => {
    if (hasModule('Document Management')) {
      setLoadingDocs(true);
      getDocumentDashboard()
        .then(({ data }) => setDocStats(data.data || { total: 0, processed: 0, pending: 0, recent: [] }))
        .catch(() => setDocStats({ total: 0, processed: 0, pending: 0, recent: [] }))
        .finally(() => setLoadingDocs(false));
    }
  }, [hasModule]);

  const showHearings = hasModule('Case Management');
  const showDocuments = hasModule('Document Management');

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary mb-2">Dashboard</h1>
      <p className="text-gray-600 mb-6">
        Welcome, {user?.name}. {user?.organization?.name && `(${user.organization.name})`}
      </p>

      {hasModule('Case Management') && setupStatus && !setupStatus.is_initial_setup_complete && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-soft p-4 mb-6">
          <div className="flex justify-between items-start gap-2">
            <div>
              <h2 className="text-lg font-semibold text-primary mb-3">Dashboard Setup Checklist</h2>
              <p className="text-sm text-gray-600 mb-3">Complete these steps to get started with case management.</p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  {setupStatus.has_clients ? <span className="text-green-600">✓</span> : <span className="text-gray-400">☐</span>}
                  <span>Add at least 1 Client</span>
                  {!setupStatus.has_clients && <Link to="/clients/create" className="text-accent text-sm font-medium hover:underline ml-1">Add now</Link>}
                </li>
                <li className="flex items-center gap-2">
                  {setupStatus.has_courts ? <span className="text-green-600">✓</span> : <span className="text-gray-400">☐</span>}
                  <span>Add at least 1 Court</span>
                  {!setupStatus.has_courts && <Link to="/courts/create" className="text-accent text-sm font-medium hover:underline ml-1">Add now</Link>}
                </li>
                <li className="flex items-center gap-2">
                  {setupStatus.has_judges ? <span className="text-green-600">✓</span> : <span className="text-gray-400">☐</span>}
                  <span>Add at least 1 Judge</span>
                  {!setupStatus.has_judges && <Link to="/judges" className="text-accent text-sm font-medium hover:underline ml-1">Add now</Link>}
                </li>
                <li className="flex items-center gap-2">
                  {setupStatus.has_cases ? <span className="text-green-600">✓</span> : <span className="text-gray-400">☐</span>}
                  <span>Add at least 1 Case</span>
                  {!setupStatus.has_cases && <Link to="/cases/create" className="text-accent text-sm font-medium hover:underline ml-1">Add now</Link>}
                </li>
              </ul>
            </div>
            <button
              type="button"
              onClick={() => setWizardOpen(true)}
              className="px-3 py-1.5 border border-primary text-primary rounded-lg hover:bg-primary/5 text-sm font-medium shrink-0"
            >
              Setup Wizard
            </button>
          </div>
        </div>
      )}

      {wizardOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setWizardOpen(false)}>
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-primary mb-2">Initial Setup Wizard</h3>
            <p className="text-sm text-gray-600 mb-4">Follow these steps to set up case management. Client and Court are required before creating a case.</p>
            <div className="mb-4 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${[setupStatus?.has_clients, setupStatus?.has_courts, setupStatus?.has_judges, setupStatus?.has_cases].filter(Boolean).length * 25}%` }}
              />
            </div>
            <ol className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <span className="font-medium">1.</span>
                <span>Add Client</span>
                <Link to="/clients/create" className="ml-auto px-2 py-1 bg-primary text-white rounded text-xs hover:bg-primary/90" onClick={() => setWizardOpen(false)}>Go</Link>
              </li>
              <li className="flex items-center gap-2">
                <span className="font-medium">2.</span>
                <span>Add Court</span>
                <Link to="/courts/create" className="ml-auto px-2 py-1 bg-primary text-white rounded text-xs hover:bg-primary/90" onClick={() => setWizardOpen(false)}>Go</Link>
              </li>
              <li className="flex items-center gap-2">
                <span className="font-medium">3.</span>
                <span>Add Judge (optional)</span>
                <Link to="/judges" className="ml-auto px-2 py-1 border border-gray-300 rounded text-xs hover:bg-gray-50" onClick={() => setWizardOpen(false)}>Go</Link>
              </li>
              <li className="flex items-center gap-2">
                <span className="font-medium">4.</span>
                <span>Create first case</span>
                <Link to="/cases/create" className="ml-auto px-2 py-1 bg-primary text-white rounded text-xs hover:bg-primary/90" onClick={() => setWizardOpen(false)}>Go</Link>
              </li>
            </ol>
            <button type="button" onClick={() => setWizardOpen(false)} className="mt-4 w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              Close
            </button>
          </div>
        </div>
      )}

      {subscriptionInfo && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-soft p-4 mb-6">
          <h2 className="text-lg font-semibold text-primary mb-3">Subscription</h2>
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <span className="text-sm text-gray-500">Current plan</span>
              <p className="font-medium">{subscriptionInfo.package?.name ?? '—'}</p>
            </div>
            {subscriptionInfo.subscription?.expires_at && (
              <div>
                <span className="text-sm text-gray-500">Expires</span>
                <p className="font-medium">{new Date(subscriptionInfo.subscription.expires_at).toLocaleString()}</p>
              </div>
            )}
            {subscriptionInfo.remainingDays != null && (
              <div>
                <span className="text-sm text-gray-500">Remaining</span>
                <p className="font-medium">
                  {subscriptionInfo.isExpired ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">Expired</span>
                  ) : subscriptionInfo.remainingDays < 3 ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">{subscriptionInfo.remainingDays} days left</span>
                  ) : (
                    <span>{subscriptionInfo.remainingDays} days</span>
                  )}
                </p>
              </div>
            )}
            {subscriptionInfo.isExpired && (
              <Link to="/billing" className="text-sm text-accent font-medium hover:underline">Renew plan</Link>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-6">
        <Link to="/documents" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm font-medium">Documents</Link>
        <Link to="/calendar" className="px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary/5 text-sm font-medium">Calendar</Link>
        <Link to="/cases" className="px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary/5 text-sm font-medium">Cases</Link>
        <Link to="/clients" className="px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary/5 text-sm font-medium">Clients</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-primary mb-2">Your organization</h2>
          <p className="text-gray-600 text-sm">{user?.organization?.name || '—'}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-primary mb-2">Role</h2>
          <p className="text-gray-600 text-sm">{user?.role || '—'}</p>
        </div>
      </div>

      {showDocuments && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {loadingDocs ? (
            <div className="col-span-4 flex justify-center py-8"><div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-accent" /></div>
          ) : (
            <>
          <div className="bg-white border border-gray-200 rounded-lg shadow-soft p-4">
            <h3 className="text-sm font-medium text-gray-500 uppercase">Total Documents</h3>
            <p className="text-2xl font-bold text-primary mt-1">{docStats.total}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
            <h3 className="text-sm font-medium text-gray-500 uppercase">Documents Processed</h3>
            <p className="text-2xl font-bold text-green-600 mt-1">{docStats.processed}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
            <h3 className="text-sm font-medium text-gray-500 uppercase">Pending OCR</h3>
            <p className="text-2xl font-bold text-amber-600 mt-1">{docStats.pending}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg shadow-soft p-4">
            <h3 className="text-sm font-medium text-gray-500 uppercase">Recent Uploads</h3>
            <p className="text-2xl font-bold text-primary mt-1">{docStats.recent?.length ?? 0}</p>
          </div>
          </>
          )}
        </div>
      )}

      {showDocuments && docStats.recent?.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-200 bg-primary/5 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-primary">Recent Uploads</h2>
            <Link to="/documents" className="text-sm text-accent hover:underline">View all</Link>
          </div>
          <ul className="divide-y divide-gray-200">
            {docStats.recent.slice(0, 5).map((doc) => (
              <li key={doc.id} className="px-6 py-3">
                <Link to={`/documents/${doc.id}`} className="font-medium text-primary hover:underline">
                  {doc.document_name || 'Document'}
                </Link>
                <p className="text-sm text-gray-500">
                  {doc.ocr_status || 'PENDING'} · {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : ''}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {showHearings && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {loadingTasks ? (
              <div className="col-span-3"><PageLoader /></div>
            ) : (
            <>
            <div className="bg-white border border-gray-200 rounded-lg shadow-soft overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-primary/5 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-primary">My tasks</h2>
                <Link to="/tasks" className="text-sm text-accent hover:underline">View all</Link>
              </div>
              <ul className="divide-y divide-gray-200">
                {tasks.myTasks?.length === 0 && <li className="px-6 py-4 text-gray-500 text-sm">No active tasks.</li>}
                {tasks.myTasks?.slice(0, 5).map((t) => (
                  <li key={t.id} className="px-6 py-3">
                    <Link to="/tasks" className="font-medium text-primary hover:text-accent">{t.title}</Link>
                    <p className="text-sm text-gray-500">{t.Case?.case_title} · Due: {t.due_date || '—'}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-red-50">
                <h2 className="text-lg font-semibold text-primary">Overdue tasks</h2>
              </div>
              <ul className="divide-y divide-gray-200">
                {tasks.overdue?.length === 0 && <li className="px-6 py-4 text-gray-500 text-sm">None.</li>}
                {tasks.overdue?.slice(0, 5).map((t) => (
                  <li key={t.id} className="px-6 py-3">
                    <Link to="/tasks" className="font-medium text-primary hover:text-accent">{t.title}</Link>
                    <p className="text-sm text-gray-500">{t.Case?.case_title} · {t.due_date}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-green-50">
                <h2 className="text-lg font-semibold text-primary">Upcoming tasks (7 days)</h2>
              </div>
              <ul className="divide-y divide-gray-200">
                {tasks.upcoming?.length === 0 && <li className="px-6 py-4 text-gray-500 text-sm">None.</li>}
                {tasks.upcoming?.slice(0, 5).map((t) => (
                  <li key={t.id} className="px-6 py-3">
                    <Link to="/tasks" className="font-medium text-primary hover:text-accent">{t.title}</Link>
                    <p className="text-sm text-gray-500">{t.Case?.case_title} · {t.due_date}</p>
                  </li>
                ))}
              </ul>
            </div>
            </>
            )}
          </div>
          <div className="bg-white border border-gray-200 rounded-lg shadow-soft overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-amber-50 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-primary">Today&apos;s Hearings</h2>
              <Link to="/calendar" className="text-sm text-accent hover:underline">View calendar</Link>
            </div>
            {loadingHearings ? (
              <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-accent" /></div>
            ) : (
            <ul className="divide-y divide-gray-200">
              {hearings.todays?.length === 0 && <li className="px-6 py-4 text-gray-500 text-sm">No hearings today.</li>}
              {hearings.todays?.slice(0, 5).map((h) => (
                <li key={h.id} className="px-6 py-3">
                  <Link to={`/hearings/${h.id}`} className="font-medium text-primary hover:text-accent">{h.Case?.case_title}</Link>
                  <p className="text-sm text-gray-500">{h.Case?.Client?.name} · {h.hearing_date ? new Date(h.hearing_date).toLocaleTimeString() : ''}</p>
                </li>
              ))}
            </ul>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-green-50">
                <h2 className="text-lg font-semibold text-primary">Upcoming (7 days)</h2>
              </div>
              <ul className="divide-y divide-gray-200">
                {hearings.upcoming?.length === 0 && <li className="px-6 py-4 text-gray-500 text-sm">No upcoming hearings.</li>}
                {hearings.upcoming?.slice(0, 5).map((h) => (
                  <li key={h.id} className="px-6 py-3">
                    <Link to={`/hearings/${h.id}`} className="font-medium text-primary hover:text-accent">{h.Case?.case_title}</Link>
                    <p className="text-sm text-gray-500">{h.hearing_date ? new Date(h.hearing_date).toLocaleDateString() : ''}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-red-50">
                <h2 className="text-lg font-semibold text-primary">Overdue Hearings</h2>
              </div>
              <ul className="divide-y divide-gray-200">
                {hearings.overdue?.length === 0 && <li className="px-6 py-4 text-gray-500 text-sm">None.</li>}
                {hearings.overdue?.slice(0, 5).map((h) => (
                  <li key={h.id} className="px-6 py-3">
                    <Link to={`/hearings/${h.id}`} className="font-medium text-primary hover:text-accent">{h.Case?.case_title}</Link>
                    <p className="text-sm text-gray-500">{h.hearing_date ? new Date(h.hearing_date).toLocaleDateString() : ''}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
