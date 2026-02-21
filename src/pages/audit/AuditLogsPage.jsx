import React, { useState, useEffect } from 'react';
import { listAuditLogs, exportAuditLogs } from '../../services/auditApi';
import { useOrgAuth } from '../../context/OrgAuthContext';

const ENTITY_TYPES = ['CLIENT', 'CASE', 'HEARING', 'DOCUMENT', 'COURT', 'EMPLOYEE'];
const ACTION_TYPES = ['CREATE', 'UPDATE', 'DELETE', 'RESTORE', 'LOGIN', 'LOGOUT', 'VIEW', 'DOWNLOAD', 'ASSIGN', 'MODULE_CHANGE'];
const MODULES = ['DOCUMENTS', 'HEARINGS', 'CASES', 'CLIENTS', 'COURTS', 'AUTH', 'EMPLOYEES', 'REPORTS'];

function DetailRow({ row, expanded, onToggle }) {
  const hasOld = row.old_value != null && typeof row.old_value === 'object' && Object.keys(row.old_value).length > 0;
  const hasNew = row.new_value != null && typeof row.new_value === 'object' && Object.keys(row.new_value).length > 0;
  const hasDetails = hasOld || hasNew || row.ip_address || row.user_agent;

  return (
    <>
      <td className="px-4 py-2 text-sm">
        {hasDetails && (
          <button
            type="button"
            onClick={onToggle}
            className="text-primary font-medium hover:underline"
            aria-expanded={expanded}
          >
            {expanded ? '▼ Hide details' : '▶ View details'}
          </button>
        )}
        {!hasDetails && <span className="text-gray-400">—</span>}
      </td>
      {expanded && (
        <td colSpan={6} className="px-4 py-3 bg-gray-50 border-t-0 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {row.ip_address && (
              <div>
                <span className="font-medium text-gray-500">IP address</span>
                <p className="font-mono text-gray-800">{row.ip_address}</p>
              </div>
            )}
            {row.user_agent && (
              <div>
                <span className="font-medium text-gray-500">Device / User agent</span>
                <p className="text-gray-800 break-all">{row.user_agent}</p>
              </div>
            )}
            {hasOld && (
              <div className="md:col-span-2">
                <span className="font-medium text-red-600">Old values</span>
                <pre className="mt-1 p-2 bg-white border border-gray-200 rounded text-xs font-mono overflow-auto max-h-40">
                  {JSON.stringify(row.old_value, null, 2)}
                </pre>
              </div>
            )}
            {hasNew && (
              <div className="md:col-span-2">
                <span className="font-medium text-green-700">New values</span>
                <pre className="mt-1 p-2 bg-white border border-gray-200 rounded text-xs font-mono overflow-auto max-h-40">
                  {JSON.stringify(row.new_value, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </td>
      )}
    </>
  );
}

export default function AuditLogsPage() {
  const { isOrgAdmin } = useOrgAuth();
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');
  const [entityType, setEntityType] = useState('');
  const [actionType, setActionType] = useState('');
  const [moduleName, setModuleName] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [userId, setUserId] = useState('');
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState(null);

  const queryParams = () => {
    const p = { page, limit: 20 };
    if (entityType) p.entity_type = entityType;
    if (actionType) p.action_type = actionType;
    if (moduleName) p.module_name = moduleName;
    if (fromDate) p.from_date = fromDate;
    if (toDate) p.to_date = toDate;
    if (userId) p.user_id = userId;
    return p;
  };

  const load = async () => {
    setLoading(true);
    try {
      const { data: res } = await listAuditLogs(queryParams());
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
  }, [page, entityType, actionType, moduleName, fromDate, toDate, userId]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    load();
  };

  const handleExport = async () => {
    setExporting(true);
    setError('');
    try {
      const params = {};
      if (entityType) params.entity_type = entityType;
      if (actionType) params.action_type = actionType;
      if (moduleName) params.module_name = moduleName;
      if (fromDate) params.from_date = fromDate;
      if (toDate) params.to_date = toDate;
      if (userId) params.user_id = userId;
      const { data: blob } = await exportAuditLogs(params);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.response?.data?.message || 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  const formatDate = (d) => (d ? new Date(d).toLocaleString() : '—');
  const displayUser = (row) => row.user_name || (row.User && row.User.name) || row.user_id || '—';

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary mb-6">Audit Logs</h1>
      {error && <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 mb-4">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-3 items-end">
          <div className="w-36">
            <label className="block text-sm font-medium text-gray-700 mb-1">Module</label>
            <select value={moduleName} onChange={(e) => { setModuleName(e.target.value); setPage(1); }} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent">
              <option value="">All</option>
              {MODULES.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
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
          <button type="button" onClick={handleExport} disabled={exporting} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">
            {exporting ? 'Exporting…' : 'Export CSV'}
          </button>
        </form>
        {!isOrgAdmin && <p className="text-sm text-gray-500 mt-2">Showing only your own activity.</p>}
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action summary</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Module</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.map((row) => (
                  <React.Fragment key={row.id}>
                    <tr>
                      <td className="px-4 py-3 text-sm text-gray-900 max-w-md">
                        {row.action_summary || `${row.action_type} ${row.entity_type}${row.entity_id ? ` #${row.entity_id}` : ''}`}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {displayUser(row)}
                        {row.user_role && <span className="ml-1 text-gray-400">({row.user_role})</span>}
                      </td>
                      <td className="px-4 py-3">
                        {row.module_name ? <span className="px-2 py-0.5 text-xs font-medium rounded bg-primary/10 text-primary">{row.module_name}</span> : '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{formatDate(row.created_at)}</td>
                      <DetailButton
                        row={row}
                        expanded={expandedId === row.id}
                        onToggle={() => setExpandedId((prev) => (prev === row.id ? null : row.id))}
                      />
                    </tr>
                    {expandedId === row.id && (
                      <tr>
                        <td colSpan={5} className="p-0">
                          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            {row.ip_address && <div><span className="font-medium text-gray-500">IP</span><p className="font-mono">{row.ip_address}</p></div>}
                            {row.user_agent && <div><span className="font-medium text-gray-500">Device</span><p className="break-all">{row.user_agent}</p></div>}
                            {row.old_value != null && typeof row.old_value === 'object' && Object.keys(row.old_value).length > 0 && (
                              <div className="md:col-span-2"><span className="font-medium text-red-600">Old values</span><pre className="mt-1 p-2 bg-white border rounded text-xs overflow-auto max-h-40">{JSON.stringify(row.old_value, null, 2)}</pre></div>
                            )}
                            {row.new_value != null && typeof row.new_value === 'object' && Object.keys(row.new_value).length > 0 && (
                              <div className="md:col-span-2"><span className="font-medium text-green-700">New values</span><pre className="mt-1 p-2 bg-white border rounded text-xs overflow-auto max-h-40">{JSON.stringify(row.new_value, null, 2)}</pre></div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
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
