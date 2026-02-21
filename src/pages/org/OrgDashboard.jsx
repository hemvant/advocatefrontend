import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useOrgAuth } from '../../context/OrgAuthContext';
import { getDashboardHearings } from '../../services/hearingApi';
import { getTaskDashboard } from '../../services/taskApi';
import { getDocumentDashboard } from '../../services/documentApi';
import PageLoader from '../../components/ui/PageLoader';
import EmptyState from '../../components/ui/EmptyState';

export default function OrgDashboard() {
  const { user, hasModule } = useOrgAuth();
  const [hearings, setHearings] = useState({ todays: [], upcoming: [], overdue: [] });
  const [tasks, setTasks] = useState({ myTasks: [], overdue: [], upcoming: [] });
  const [docStats, setDocStats] = useState({ total: 0, processed: 0, pending: 0, recent: [] });
  const [loadingHearings, setLoadingHearings] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [loadingDocs, setLoadingDocs] = useState(false);

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
