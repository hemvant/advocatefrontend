import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { listCourts, deactivateCourt, getCourtTypes } from '../../services/courtApi';
import { useOrgAuth } from '../../context/OrgAuthContext';

export default function CourtList() {
  const { isOrgAdmin } = useOrgAuth();
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 20;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [courtTypeId, setCourtTypeId] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [courtTypes, setCourtTypes] = useState([]);

  useEffect(() => {
    getCourtTypes().then(({ data: d }) => setCourtTypes(d.data || [])).catch(() => {});
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (search.trim()) params.search = search.trim();
      if (courtTypeId) params.court_type_id = courtTypeId;
      if (activeFilter === 'true') params.is_active = true;
      if (activeFilter === 'false') params.is_active = false;
      const { data: res } = await listCourts(params);
      setData(res.data || []);
      setTotal(res.total ?? 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load courts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [page, courtTypeId, activeFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    load();
  };

  const handleDeactivate = async (court) => {
    if (!isOrgAdmin) return;
    if (!window.confirm('Deactivate "' + court.name + '"?')) return;
    try {
      await deactivateCourt(court.id);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-primary">Courts</h1>
        {isOrgAdmin && (
          <Link to="/courts/create" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 focus:ring-2 focus:ring-accent">
            Add Court
          </Link>
        )}
      </div>
      {error && <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 mb-4">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[180px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Court name, city, state..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
            />
          </div>
          <div className="w-40">
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select value={courtTypeId} onChange={(e) => { setCourtTypeId(e.target.value); setPage(1); }} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent">
              <option value="">All</option>
              {courtTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div className="w-32">
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select value={activeFilter} onChange={(e) => { setActiveFilter(e.target.value); setPage(1); }} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent">
              <option value="">All</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
          <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">Search</button>
        </form>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-accent" /></div>
        ) : data.length === 0 ? (
          <p className="p-6 text-gray-500 text-center">No courts. {isOrgAdmin && 'Add a court to get started.'}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">City / State</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.map((c) => (
                  <tr key={c.id}>
                    <td className="px-6 py-4">
                      <Link to={'/courts/' + c.id} className="text-primary font-medium hover:underline">{c.name}</Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{c.CourtType ? c.CourtType.name : '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{[c.city, c.state].filter(Boolean).join(', ') || '—'}</td>
                    <td className="px-6 py-4"><span className={'px-2 py-0.5 text-xs rounded ' + (c.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100')}>{c.is_active ? 'Active' : 'Inactive'}</span></td>
                    <td className="px-6 py-4 text-right">
                      <Link to={'/courts/' + c.id} className="text-primary hover:underline mr-2">View</Link>
                      {isOrgAdmin && c.is_active && <button type="button" onClick={() => handleDeactivate(c)} className="text-red-600 hover:underline">Deactivate</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {total > limit && (
          <div className="px-6 py-3 border-t border-gray-200 flex justify-between items-center">
            <span className="text-sm text-gray-600">Total {total}</span>
            <div className="flex gap-2">
              <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1 border rounded disabled:opacity-50">Previous</button>
              <button type="button" disabled={page * limit >= total} onClick={() => setPage((p) => p + 1)} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
