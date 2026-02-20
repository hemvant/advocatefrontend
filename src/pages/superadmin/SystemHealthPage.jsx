import React, { useState, useEffect } from 'react';
import { getSystemHealth } from '../../services/superAdminApi';

export default function SystemHealthPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHealth = () => {
      getSystemHealth()
        .then((r) => setData(r.data.data))
        .catch(() => setData({ status: 'error' }))
        .finally(() => setLoading(false));
    };
    fetchHealth();
    const id = setInterval(fetchHealth, 30000);
    return () => clearInterval(id);
  }, []);

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-accent" /></div>;
  }

  const d = data || {};
  const statusColor = d.status === 'healthy' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800';

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-primary">System Health</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase">Status</p>
          <p className={`mt-1 text-lg font-semibold capitalize ${statusColor} rounded px-2 py-1 inline-block`}>{d.status || 'Unknown'}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase">Database</p>
          <p className="mt-1 text-lg font-semibold text-primary">{d.database_connected ? 'Connected' : 'Disconnected'}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase">Uptime (seconds)</p>
          <p className="mt-1 text-2xl font-bold text-primary">{d.server_uptime_seconds != null ? d.server_uptime_seconds : '—'}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase">Failed logins (24h)</p>
          <p className="mt-1 text-2xl font-bold text-primary">{d.failed_login_attempts_24h != null ? d.failed_login_attempts_24h : '—'}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase">System errors (24h)</p>
          <p className="mt-1 text-2xl font-bold text-primary">{d.system_error_count_24h != null ? d.system_error_count_24h : '—'}</p>
        </div>
      </div>
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <p className="text-sm text-gray-600">API response time logging and metrics are collected server-side. Failed logins and system errors are stored in system_metrics when configured.</p>
      </div>
    </div>
  );
}
