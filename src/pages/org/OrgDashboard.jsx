import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useOrgAuth } from '../../context/OrgAuthContext';
import { getDashboardHearings } from '../../services/hearingApi';
import { getTaskDashboard } from '../../services/taskApi';

export default function OrgDashboard() {
  const { user, hasModule } = useOrgAuth();
  const [hearings, setHearings] = useState({ todays: [], upcoming: [], overdue: [] });
  const [tasks, setTasks] = useState({ myTasks: [], overdue: [], upcoming: [] });

  useEffect(() => {
    if (hasModule('Case Management')) {
      getDashboardHearings()
        .then(({ data }) => setHearings(data.data || { todays: [], upcoming: [], overdue: [] }))
        .catch(() => {});
      getTaskDashboard()
        .then(({ data }) => setTasks(data.data || { myTasks: [], overdue: [], upcoming: [] }))
        .catch(() => {});
    }
  }, [hasModule]);

  const showHearings = hasModule('Case Management');

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary mb-2">Dashboard</h1>
      <p className="text-gray-600 mb-6">
        Welcome, {user?.name}. {user?.organization?.name && `(${user.organization.name})`}
      </p>
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

      {showHearings && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
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
          </div>
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-amber-50 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-primary">Today&apos;s Hearings</h2>
              <Link to="/calendar" className="text-sm text-accent hover:underline">View calendar</Link>
            </div>
            <ul className="divide-y divide-gray-200">
              {hearings.todays?.length === 0 && <li className="px-6 py-4 text-gray-500 text-sm">No hearings today.</li>}
              {hearings.todays?.slice(0, 5).map((h) => (
                <li key={h.id} className="px-6 py-3">
                  <Link to={`/hearings/${h.id}`} className="font-medium text-primary hover:text-accent">{h.Case?.case_title}</Link>
                  <p className="text-sm text-gray-500">{h.Case?.Client?.name} · {h.hearing_date ? new Date(h.hearing_date).toLocaleTimeString() : ''}</p>
                </li>
              ))}
            </ul>
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
