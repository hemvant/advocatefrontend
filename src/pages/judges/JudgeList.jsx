import React, { useState, useEffect } from 'react';
import { listJudges, listCourts, addJudge, updateJudge, deactivateJudge } from '../../services/courtApi';
import { useOrgAuth } from '../../context/OrgAuthContext';

export default function JudgeList() {
  const { isOrgAdmin } = useOrgAuth();
  const [data, setData] = useState([]);
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [courtId, setCourtId] = useState('');
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('true');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ court_id: '', name: '', designation: '' });

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (courtId) params.court_id = courtId;
      if (search.trim()) params.search = search.trim();
      if (activeFilter === 'true') params.is_active = true;
      if (activeFilter === 'false') params.is_active = false;
      const { data: res } = await listJudges(params);
      setData(res?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load judges');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    listCourts({ limit: 500 }).then(({ data: d }) => setCourts(d?.data || [])).catch(() => {});
  }, []);
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const cId = q.get('court_id');
    if (cId) setCourtId(cId);
  }, []);
  useEffect(() => { load(); }, [courtId, activeFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    load();
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.court_id || !form.name.trim() || !isOrgAdmin) return;
    try {
      await addJudge({
        court_id: parseInt(form.court_id, 10),
        name: form.name.trim(),
        designation: form.designation.trim() || null
      });
      setModal(null);
      setForm({ court_id: '', name: '', designation: '' });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Add failed');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!modal?.id || !form.name.trim() || !isOrgAdmin) return;
    try {
      await updateJudge(modal.id, {
        court_id: form.court_id ? parseInt(form.court_id, 10) : undefined,
        name: form.name.trim(),
        designation: form.designation.trim() || null
      });
      setModal(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    }
  };

  const handleDeactivate = async (judge) => {
    if (!isOrgAdmin || !window.confirm('Deactivate this judge?')) return;
    try {
      await deactivateJudge(judge.id);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed');
    }
  };

  const openEdit = (j) => {
    setModal({ id: j.id, type: 'edit' });
    setForm({ court_id: String(j.court_id || ''), name: j.name || '', designation: j.designation || '' });
  };

  const openAdd = () => {
    const q = new URLSearchParams(window.location.search);
    setModal({ type: 'add' });
    setForm({ court_id: q.get('court_id') || '', name: '', designation: '' });
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-primary">Judges</h1>
        {isOrgAdmin && <button type="button" onClick={openAdd} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">Add Judge</button>}
      </div>
      {error && <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 mb-4">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[160px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Name" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent" />
          </div>
          <div className="w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">Court</label>
            <select value={courtId} onChange={(e) => setCourtId(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent">
              <option value="">All courts</option>
              {courts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="w-32">
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select value={activeFilter} onChange={(e) => setActiveFilter(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent">
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
          <p className="p-6 text-gray-500 text-center">No judges found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Designation</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Court</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  {isOrgAdmin && <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.map((j) => (
                  <tr key={j.id}>
                    <td className="px-6 py-4 font-medium">{j.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{j.designation || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{j.Court ? j.Court.name : '-'}</td>
                    <td className="px-6 py-4"><span className={j.is_active ? 'text-green-600' : 'text-gray-500'}>{j.is_active ? 'Active' : 'Inactive'}</span></td>
                    {isOrgAdmin && (
                      <td className="px-6 py-4 text-right">
                        <button type="button" onClick={() => openEdit(j)} className="text-primary hover:underline mr-2">Edit</button>
                        {j.is_active && <button type="button" onClick={() => handleDeactivate(j)} className="text-red-600 hover:underline">Deactivate</button>}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setModal(null)}>
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-primary mb-4">{modal.type === 'add' ? 'Add Judge' : 'Edit Judge'}</h2>
            <form onSubmit={modal.type === 'add' ? handleAdd : handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Court (required)</label>
                <select value={form.court_id} onChange={(e) => setForm((f) => ({ ...f, court_id: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent" required>
                  <option value="">Select court</option>
                  {courts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name (required)</label>
                <input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                <input type="text" value={form.designation} onChange={(e) => setForm((f) => ({ ...f, designation: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent" />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">{modal.type === 'add' ? 'Add' : 'Save'}</button>
                <button type="button" onClick={() => setModal(null)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
