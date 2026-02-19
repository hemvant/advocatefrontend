import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { listClients, softDeleteClient, assignClient } from '../../services/clientApi';
import { getEmployees } from '../../services/orgApi';
import { useOrgAuth } from '../../context/OrgAuthContext';

const CATEGORIES = ['INDIVIDUAL', 'CORPORATE', 'GOVERNMENT', 'VIP'];
const STATUSES = ['ACTIVE', 'CLOSED', 'BLACKLISTED'];

export default function ClientList() {
  const { isOrgAdmin } = useOrgAuth();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [employees, setEmployees] = useState([]);
  const [assignModal, setAssignModal] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (search) params.search = search;
      if (category) params.category = category;
      if (status) params.status = status;
      const { data: res } = await listClients(params);
      setData(res.data || []);
      setPagination(res.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [page, category, status]);

  useEffect(() => {
    if (isOrgAdmin) {
      getEmployees().then(({ data: res }) => setEmployees(res.data || [])).catch(() => {});
    }
  }, [isOrgAdmin]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    load();
  };

  const handleDelete = async (client) => {
    if (!window.confirm(`Soft delete "${client.name}"?`)) return;
    try {
      await softDeleteClient(client.id);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  const openAssign = (client) => {
    setAssignModal({ id: client.id, name: client.name, assigned_to: client.assigned_to || '' });
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!assignModal?.assigned_to) return;
    try {
      await assignClient(assignModal.id, parseInt(assignModal.assigned_to, 10));
      setAssignModal(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Assign failed');
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-primary">Clients</h1>
        <Link
          to="/clients/create"
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 focus:ring-2 focus:ring-accent"
        >
          Add Client
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 mb-4">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[180px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Name, phone, email..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
            />
          </div>
          <div className="w-40">
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
            >
              <option value="">All</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="w-40">
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
            >
              <option value="">All</option>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
            Search
          </button>
        </form>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-accent" />
          </div>
        ) : (
          <>
            <div className="table-wrap overflow-x-auto -mx-4 sm:mx-0">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link to={`/clients/${c.id}`} className="text-primary font-medium hover:text-accent">
                          {c.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {c.phone || c.email || '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 text-xs rounded ${c.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : c.status === 'CLOSED' ? 'bg-gray-100 text-gray-800' : 'bg-red-100 text-red-800'}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {c.Assignee?.name || '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <Link to={`/clients/${c.id}/edit`} className="text-accent hover:underline mr-3">Edit</Link>
                        {isOrgAdmin && (
                          <button type="button" onClick={() => openAssign(c)} className="text-primary hover:underline mr-3">Assign</button>
                        )}
                        <button type="button" onClick={() => handleDelete(c)} className="text-red-600 hover:underline">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {data.length === 0 && (
              <div className="text-center py-12 text-gray-500">No clients found.</div>
            )}
            {pagination.totalPages > 1 && (
              <div className="px-6 py-3 border-t border-gray-200 flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={pagination.page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {assignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <h2 className="text-lg font-bold text-primary mb-2">Assign: {assignModal.name}</h2>
            <form onSubmit={handleAssign}>
              <select
                value={assignModal.assigned_to}
                onChange={(e) => setAssignModal({ ...assignModal, assigned_to: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg mb-4"
                required
              >
                <option value="">Select employee</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>{emp.name} ({emp.email})</option>
                ))}
              </select>
              <div className="flex gap-2">
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">Save</button>
                <button type="button" onClick={() => setAssignModal(null)} className="px-4 py-2 border rounded-lg">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
