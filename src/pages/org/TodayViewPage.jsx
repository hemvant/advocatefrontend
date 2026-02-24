import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useOrgAuth } from '../../context/OrgAuthContext';
import { getDashboardHearings } from '../../services/hearingApi';
import { getTaskDashboard } from '../../services/taskApi';
import { listCases } from '../../services/caseApi';

export default function TodayViewPage() {
  const { hasModule } = useOrgAuth();
  const [hearings, setHearings] = useState({ todays: [] });
  const [tasks, setTasks] = useState({ myTasks: [], overdue: [] });
  const [urgentCases, setUrgentCases] = useState([]);
  const [loading, setLoading] = useState(true);

  const showCaseManagement = hasModule('Case Management');
  const showCalendar = hasModule('Calendar') || hasModule('Case Management');

  useEffect(() => {
    if (!showCaseManagement && !showCalendar) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const promises = [];
    if (showCalendar) {
      promises.push(
        getDashboardHearings()
          .then(({ data }) => setHearings(data.data || { todays: [] }))
          .catch(() => setHearings({ todays: [] }))
      );
    }
    if (showCaseManagement) {
      promises.push(
        getTaskDashboard()
          .then(({ data }) => setTasks(data.data || { myTasks: [], overdue: [] }))
          .catch(() => setTasks({ myTasks: [], overdue: [] }))
      );
      promises.push(
        listCases({ priority: 'URGENT', limit: 20 })
          .then(({ data }) => setUrgentCases(data.data || []))
          .catch(() => setUrgentCases([]))
      );
    }
    Promise.all(promises).finally(() => setLoading(false));
  }, [showCaseManagement, showCalendar]);

  if (!showCaseManagement && !showCalendar) {
    return (
      <div className="pb-20 md:pb-0">
        <h1 className="text-xl sm:text-2xl font-bold text-primary mb-4">Today</h1>
        <p className="text-gray-500">Enable Case Management or Calendar to see today&apos;s view.</p>
      </div>
    );
  }

  return (
    <div className="pb-20 md:pb-0">
      <h1 className="text-xl sm:text-2xl font-bold text-primary mb-1 sm:mb-2">Today</h1>
      <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6">Hearings, tasks, and urgent cases at a glance.</p>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-accent" />
        </div>
      ) : (
        <div className="space-y-6">
          {showCalendar && (
            <section className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 bg-amber-50 flex justify-between items-center">
                <h2 className="text-base sm:text-lg font-semibold text-primary">Today&apos;s hearings</h2>
                <Link to="/calendar" className="text-sm text-accent hover:underline touch-manipulation">Calendar</Link>
              </div>
              <ul className="divide-y divide-gray-200">
                {hearings.todays?.length === 0 && (
                  <li className="px-4 sm:px-6 py-4 text-gray-500 text-sm">No hearings today.</li>
                )}
                {hearings.todays?.slice(0, 10).map((h) => (
                  <li key={h.id} className="px-4 sm:px-6 py-3">
                    <Link to={`/hearings/${h.id}`} className="font-medium text-primary hover:text-accent block">
                      {h.Case?.case_title}
                    </Link>
                    <p className="text-sm text-gray-500">
                      {h.Case?.Client?.name} · {h.hearing_date ? new Date(h.hearing_date).toLocaleTimeString() : ''}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {showCaseManagement && (
            <section className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 bg-primary/5 flex justify-between items-center">
                <h2 className="text-base sm:text-lg font-semibold text-primary">My tasks</h2>
                <Link to="/tasks" className="text-sm text-accent hover:underline touch-manipulation">View all</Link>
              </div>
              <ul className="divide-y divide-gray-200">
                {tasks.overdue?.length > 0 && (
                  <>
                    {tasks.overdue.slice(0, 5).map((t) => (
                      <li key={t.id} className="px-4 sm:px-6 py-3 bg-red-50/50">
                        <Link to="/tasks" className="font-medium text-primary hover:text-accent block">
                          {t.title}
                        </Link>
                        <p className="text-sm text-red-600">Overdue · {t.Case?.case_title} · {t.due_date}</p>
                      </li>
                    ))}
                  </>
                )}
                {tasks.myTasks?.length === 0 && tasks.overdue?.length === 0 && (
                  <li className="px-4 sm:px-6 py-4 text-gray-500 text-sm">No active tasks.</li>
                )}
                {tasks.myTasks?.slice(0, tasks.overdue?.length > 0 ? 3 : 8).map((t) => (
                  <li key={t.id} className="px-4 sm:px-6 py-3">
                    <Link to="/tasks" className="font-medium text-primary hover:text-accent block">
                      {t.title}
                    </Link>
                    <p className="text-sm text-gray-500">{t.Case?.case_title} · Due: {t.due_date || '—'}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {showCaseManagement && (
            <section className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 bg-red-50 flex justify-between items-center">
                <h2 className="text-base sm:text-lg font-semibold text-primary">Urgent cases</h2>
                <Link to="/cases?priority=URGENT" className="text-sm text-accent hover:underline touch-manipulation">All cases</Link>
              </div>
              <ul className="divide-y divide-gray-200">
                {urgentCases.length === 0 && (
                  <li className="px-4 sm:px-6 py-4 text-gray-500 text-sm">No urgent cases.</li>
                )}
                {urgentCases.slice(0, 10).map((c) => (
                  <li key={c.id} className="px-4 sm:px-6 py-3">
                    <Link to={`/cases/${c.id}`} className="font-medium text-primary hover:text-accent block">
                      {c.case_title}
                    </Link>
                    <p className="text-sm text-gray-500">{c.case_number} · {c.Client?.name}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
