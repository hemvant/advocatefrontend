import React, { useState, useEffect } from 'react';
import { getPlatformAuditLogs, getOrganizations } from '../../services/superAdminApi';

export default function PlatformAuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [orgs, setOrgs] = useState([]);
  const [filters, setFilters] = useState({ organization_id: '', action_type: '', entity_type: '', from_date: '', to_date: '' });

  const load = (page) => {
    setLoading(true);
    const params = { page: page || 1, limit: 50 };
    if (filters.organization_id) params.organization_id = filters.organization_id;
    if (filters.action_type) params.action_type = filters.action_type;
    if (filters.entity_type) params.entity_type = filters.entity_type;
    if (filters.from_date) params.from_date = filters.from_date;
    if (filters.to_date) params.to_date = filters.to_date;
    getPlatformAuditLogs(params).then((r) => { setLogs(r.data.data || []); setPagination(r.data.pagination || {}); }).finally(() => setLoading(false));
  };

  useEffect(() => { getOrganizations().then((r) => setOrgs(r.data.data || [])); }, []);
  useEffect(() => { load(1); }, [filters.organization_id, filters.action_type, filters.entity_type, filters.from_date, filters.to_date]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-primary">Platform Audit Logs</h1>
      <div className="bg-white rounded-xl border p-4 shadow-sm grid grid-cols-1 sm:grid-cols-6 gap-3">
        <select value={filters.organization_id} onChange={(e) => setFilters({ ...filters, organization_id: e.target.value })} className="border rounded-lg px-3 py-2 text-sm"><option value="">All orgs</option>{orgs.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}</select>
        <input placeholder="Action" value={filters.action_type} onChange={(e) => setFilters({ ...filters, action_type: e.target.value })} className="border rounded-lg px-3 py-2 text-sm" />
        <input placeholder="Entity" value={filters.entity_type} onChange={(e) => setFilters({ ...filters, entity_type: e.target.value })} className="border rounded-lg px-3 py-2 text-sm" />
        <input type="date" value={filters.from_date} onChange={(e) => setFilters({ ...filters, from_date: e.target.value })} className="border rounded-lg px-3 py-2 text-sm" />
        <input type="date" value={filters.to_date} onChange={(e) => setFilters({ ...filters, to_date: e.target.value })} className="border rounded-lg px-3 py-2 text-sm" />
        <button type="button" onClick={() => load(1)} className="px-4 py-2 bg-primary text-white rounded-lg text-sm">Apply</button>
      </div>
      <div className="bg-white border rounded-xl shadow overflow-hidden">
        {loading ? <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-accent" /></div> : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">Time</th><th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">Organization</th><th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">Action</th><th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">Entity</th><th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">User</th></tr></thead>
            <tbody className="divide-y">{logs.map((a) => <tr key={a.id}><td className="px-6 py-4 text-sm">{a.created_at ? new Date(a.created_at).toLocaleString() : '—'}</td><td className="px-6 py-4 text-sm">{a.Organization && a.Organization.name || '—'}</td><td className="px-6 py-4 text-sm">{a.action_type}</td><td className="px-6 py-4 text-sm">{a.entity_type} {a.entity_id ? '#' + a.entity_id : ''}</td><td className="px-6 py-4 text-sm">{a.User && a.User.name || '—'}</td></tr>)}</tbody>
          </table>
        )}
        {logs.length === 0 && !loading && <div className="text-center py-12 text-gray-500">No audit logs.</div>}
      </div>
    </div>
  );
}
