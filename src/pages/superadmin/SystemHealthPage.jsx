import React, { useState, useEffect } from 'react';
import { getSystemHealth } from '../../services/superAdminApi';
import { getApiMessage } from '../../services/apiHelpers';

export default function SystemHealthPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    const fetchHealth = () => {
      setFetchError(null);
      getSystemHealth()
        .then((r) => {
          setData(r.data?.data ?? null);
        })
        .catch((err) => {
          setData(null);
          const status = err.response?.status;
          const msg = status === 401
            ? 'Log in as Super Admin to view system health.'
            : getApiMessage(err, 'Could not load system health.');
          setFetchError(msg);
        })
        .finally(() => setLoading(false));
    };
    fetchHealth();
    const id = setInterval(fetchHealth, 30000);
    return () => clearInterval(id);
  }, []);

  if (loading && !data) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-accent" /></div>;
  }

  if (fetchError && !data) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-primary">System Health</h1>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-800">
          <p className="font-medium">Could not load system health</p>
          <p className="text-sm mt-1">{fetchError}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-600">Metrics (failed logins, system errors) are stored in <code className="bg-gray-100 px-1 rounded">system_metrics</code> and shown here when you are logged in as Super Admin and the API responds successfully.</p>
        </div>
      </div>
    );
  }

  const d = data || {};
  const statusColor = d.status === 'healthy' ? 'bg-green-100 text-green-800' : d.status === 'error' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800';

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-primary">System Health</h1>
      {fetchError && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800">{fetchError}</div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase">Status</p>
          <p className={`mt-1 text-lg font-semibold capitalize ${statusColor} rounded px-2 py-1 inline-block`}>{d.status || 'Unknown'}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase">Database</p>
          <p className="mt-1 text-lg font-semibold text-primary">{d.database_connected === true ? 'Connected' : 'Disconnected'}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase">Uptime (seconds)</p>
          <p className="mt-1 text-2xl font-bold text-primary">{d.server_uptime_seconds != null ? d.server_uptime_seconds : '—'}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase">Failed logins (24h)</p>
          <p className="mt-1 text-2xl font-bold text-primary">{d.failed_login_attempts_24h != null ? d.failed_login_attempts_24h : 0}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase">System errors (24h)</p>
          <p className="mt-1 text-2xl font-bold text-primary">{d.system_error_count_24h != null ? d.system_error_count_24h : 0}</p>
        </div>
      </div>
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <p className="text-sm text-gray-600">System metrics are configured: failed Super Admin logins and server errors (5xx) are recorded in <code className="bg-gray-100 px-1 rounded">system_metrics</code>. Uptime is from server start. Database status is from a live ping.</p>
      </div>
    </div>
  );
}
