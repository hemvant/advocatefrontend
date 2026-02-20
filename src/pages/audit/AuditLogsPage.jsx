import React, { useState, useEffect } from 'react';
import { listAuditLogs } from '../../services/auditApi';
import { useOrgAuth } from '../../context/OrgAuthContext';

const ENTITY_TYPES = ['CLIENT', 'CASE', 'HEARING', 'DOCUMENT', 'COURT', 'EMPLOYEE'];
const ACTION_TYPES = ['CREATE', 'UPDATE', 'DELETE', 'ASSIGN', 'LOGIN', 'MODULE_CHANGE'];

function JsonDiff({ oldVal, newVal, expanded, onToggle }) {
  const hasOld = oldVal != null && Object.keys(oldVal || {}).length > 0;
  const hasNew = newVal != null && Object.keys(newVal || {}).length > 0;
  if (!hasOld && !hasNew) return <span className="text-gray-400 text-sm">—</span>;
  return (
    <div className="text-left">
      <button type="button" onClick={onToggle} className="text-primary text-sm font-medium hover:underline">
        {expanded ? 'Hide JSON' : 'Show JSON'}
      </button>
      {expanded && (
        <div className="mt-2 space-y-2 text-xs font-mono bg-gray-50 rounded p-3 border border-gray-200 max-h-64 overflow-auto">
          {hasOld && (
            <div>
              <span className="text-red-600 font-semibold">Old:</span>
              <pre className="whitespace-pre-wrap break-all mt-0.5">{JSON.stringify(oldVal, null, 2)}</pre>
            </div>
          )}
          {hasNew && (
            <div>
              <span className="text-green-600 font-semibold">New:</span>
              <pre className="whitespace-pre-wrap break-all mt-0.5">{JSON.stringify(newVal, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AuditLogsPage() {
  const { isOrgAdmin } = useOrgAuth();
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [entityType, setEntityType] = useState('');
  const [actionType, setActionType] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [userId, setUserId] = useState('');
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (entityType) params.entity_type = entityType;
      if (actionType) params.action_type = actionType;
      if (fromDate) params.from_date = fromDate;
      if (toDate) params.to_date = toDate;
      if (userId) params.user_id = userId;
      const { data: res } = await listAuditLogs(params);
      setData(res.data || []);
      setPagination(res.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [page, entityType, actionType, fromDate, toDate, userId]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    load();
  };

  const formatDate = (d) => (d ? new Date(d).toLocaleString() : '—');

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary mb-6">Audit Logs</h1>
      {error && <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 mb-4">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-3 items-end">
          <div className="w-36">
            <label className="block text-sm font-medium text-gray-700 mb-1">Entity type</label>
            <select value={entityType} onChange={(e) => { setEntityType(e.target.value); setPage(1); }} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent">
              <option value="">All</option>
              {ENTITY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="w-36">
            <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
            <select value={actionType} onChange={(e) => { setActionType(e.target.value); setPage(1); }} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent">
              <option value="">All</option>
              {ACTION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="w-40">
            <label className="block text-sm font-medium text-gray-700 mb-1">From date</label>
            <input type="date" value={fromDate} onChange={(e) => { setFromDate(e.target.value); setPage(1); }} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent" />
          </div>
          <div className="w-40">
            <label className="block text-sm font-medium text-gray-700 mb-1">To date</label>
            <input type="date" value={toDate} onChange={(e) => { setToDate(e.target.value); setPage(1); }} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent" />
          </div>
          <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">Apply</button>
        </form>
        {!isOrgAdmin && <p className="text-sm text-gray-500 mt-2">Showing only your own actions.</p>}
      </div>
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-accent" /></div>
        ) : data.length === 0 ? (
          <p className="p-6 text-gray-500 text-center">No audit logs found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entity</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entity ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.map((row) => (
                  <tr key={row.id}>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{formatDate(row.created_at)}</td>
                    <td className="px-4 py-3 text-sm">{row.User ? row.User.name : (row.user_id || '—')}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 text-xs font-medium rounded bg-primary/10 text-primary">{row.entity_type}</span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">{row.action_type}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{row.entity_id ?? '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 font-mono">{row.ip_address || '—'}</td>
                    <td className="px-4 py-3">
                      <JsonDiff
                        oldVal={row.old_value}
                        newVal={row.new_value}
                        expanded={expandedId === row.id}
                        onToggle={() => setExpandedId((prev) => (prev === row.id ? null : row.id))}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {pagination.totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200 flex justify-between items-center">
            <span className="text-sm text-gray-600">Total {pagination.total} · Page {pagination.page}</span>
            <div className="flex gap-2">
              <button type="button" disabled={pagination.page <= 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1 border rounded disabled:opacity-50">Previous</button>
              <button type="button" disabled={pagination.page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
