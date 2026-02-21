import React, { useState, useEffect } from 'react';
import { getPackages, createPackage, updatePackage, deletePackage, getAllModules } from '../../services/superAdminApi';

export default function PackagesPage() {
  const [packages, setPackages] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price_monthly: '',
    price_annual: '',
    annual_discount_percent: '0',
    employee_limit: '5',
    module_ids: []
  });
  const [saving, setSaving] = useState(false);

  const load = () => {
    getPackages().then(({ data }) => setPackages(data.data || [])).catch(() => setPackages([]));
    getAllModules().then(({ data }) => setModules(data.data || [])).catch(() => setModules([]));
  };

  useEffect(() => {
    load();
    setLoading(false);
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', description: '', price_monthly: '', price_annual: '', annual_discount_percent: '0', employee_limit: '5', module_ids: [] });
    setModalOpen(true);
  };

  const openEdit = (pkg) => {
    setEditing(pkg);
    setForm({
      name: pkg.name || '',
      description: pkg.description || '',
      price_monthly: String(pkg.price_monthly ?? ''),
      price_annual: String(pkg.price_annual ?? ''),
      annual_discount_percent: String(pkg.annual_discount_percent ?? '0'),
      employee_limit: String(pkg.employee_limit ?? '5'),
      module_ids: (pkg.Modules || []).map((m) => m.id)
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        price_monthly: parseFloat(form.price_monthly) || 0,
        price_annual: parseFloat(form.price_annual) || 0,
        annual_discount_percent: parseFloat(form.annual_discount_percent) || 0,
        employee_limit: parseInt(form.employee_limit, 10) || 1,
        module_ids: form.module_ids
      };
      if (editing) await updatePackage(editing.id, payload);
      else await createPackage(payload);
      setModalOpen(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (pkg) => {
    if (!window.confirm(`Delete package "${pkg.name}"?`)) return;
    try {
      await deletePackage(pkg.id);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  const toggleModule = (id) => {
    setForm((f) => ({
      ...f,
      module_ids: f.module_ids.includes(id) ? f.module_ids.filter((x) => x !== id) : [...f.module_ids, id]
    }));
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-accent" /></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary">Packages</h1>
        <button type="button" onClick={openCreate} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">Create package</button>
      </div>
      {error && <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monthly</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Annual</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employees</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Modules</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {packages.map((pkg) => (
              <tr key={pkg.id}>
                <td className="px-6 py-4 font-medium">{pkg.name}</td>
                <td className="px-6 py-4 text-sm">{pkg.price_monthly}</td>
                <td className="px-6 py-4 text-sm">{pkg.price_annual}</td>
                <td className="px-6 py-4 text-sm">{pkg.employee_limit}</td>
                <td className="px-6 py-4 text-sm">{(pkg.Modules || []).map((m) => m.name).join(', ') || '—'}</td>
                <td className="px-6 py-4 text-right text-sm">
                  <button type="button" onClick={() => openEdit(pkg)} className="text-primary hover:underline mr-3">Edit</button>
                  <button type="button" onClick={() => handleDelete(pkg)} className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {packages.length === 0 && <p className="p-6 text-gray-500">No packages. Create one to assign to organizations.</p>}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-bold text-primary mb-4">{editing ? 'Edit package' : 'Create package'}</h2>
            {error && <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (monthly) *</label>
                  <input type="number" step="0.01" min="0" value={form.price_monthly} onChange={(e) => setForm((f) => ({ ...f, price_monthly: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (annual) *</label>
                  <input type="number" step="0.01" min="0" value={form.price_annual} onChange={(e) => setForm((f) => ({ ...f, price_annual: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Annual discount %</label>
                <input type="number" step="0.01" min="0" max="100" value={form.annual_discount_percent} onChange={(e) => setForm((f) => ({ ...f, annual_discount_percent: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee limit *</label>
                <input type="number" min="1" value={form.employee_limit} onChange={(e) => setForm((f) => ({ ...f, employee_limit: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Modules</label>
                <div className="flex flex-wrap gap-2">
                  {modules.map((m) => (
                    <label key={m.id} className="inline-flex items-center gap-1 px-2 py-1 border rounded cursor-pointer">
                      <input type="checkbox" checked={form.module_ids.includes(m.id)} onChange={() => toggleModule(m.id)} />
                      <span className="text-sm">{m.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={saving} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
