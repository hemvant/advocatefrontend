import React, { useState, useEffect } from 'react';
import { getOrganizations, createOrganization, updateOrganization, getOrganizationModules, assignOrganizationModules, getAllModules } from '../../services/superAdminApi';

export default function SuperAdminOrganizations() {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null);
  const [allModules, setAllModules] = useState([]);

  const load = async () => {
    try {
      const { data } = await getOrganizations();
      setOrganizations(data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load organizations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = async () => {
    const { data } = await getAllModules();
    setAllModules(data.data || []);
    setModal({ type: 'create', form: { name: '', email: '', phone: '', address: '', subscription_plan: '', org_admin_name: '', org_admin_email: '', org_admin_password: '' } });
  };

  const openEdit = (org) => {
    setModal({ type: 'edit', id: org.id, form: { name: org.name, email: org.email || '', phone: org.phone || '', address: org.address || '', subscription_plan: org.subscription_plan || '', is_active: org.is_active } });
  };

  const openModules = async (org) => {
    const [orgRes, modRes] = await Promise.all([getOrganizationModules(org.id), getAllModules()]);
    const assigned = (orgRes.data.data || []).map((m) => m.id);
    setAllModules(modRes.data.data || []);
    setModal({ type: 'modules', id: org.id, name: org.name, assigned, allModules: modRes.data.data || [] });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const form = modal.form;
    try {
      await createOrganization(form);
      setModal(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Create failed');
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await updateOrganization(modal.id, modal.form);
      setModal(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    }
  };

  const handleAssignModules = async (e) => {
    e.preventDefault();
    try {
      await assignOrganizationModules(modal.id, modal.assigned);
      setModal(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-accent" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary">Organizations</h1>
        <button
          type="button"
          onClick={openCreate}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 focus:ring-2 focus:ring-accent"
        >
          Add Organization
        </button>
      </div>
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>
      )}
      <div className="bg-white border border-gray-200 rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {organizations.map((org) => (
              <tr key={org.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{org.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{org.email || '—'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{org.subscription_plan || '—'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded ${org.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {org.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <button type="button" onClick={() => openEdit(org)} className="text-accent hover:underline mr-3">Edit</button>
                  <button type="button" onClick={() => openModules(org)} className="text-primary hover:underline">Modules</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {organizations.length === 0 && (
          <div className="text-center py-12 text-gray-500">No organizations yet. Create one to get started.</div>
        )}
      </div>

      {modal?.type === 'create' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-primary mb-4">Create Organization</h2>
            <form onSubmit={handleCreate} className="space-y-3">
              <input placeholder="Organization name" required value={modal.form.name} onChange={(e) => setModal({ ...modal, form: { ...modal.form, name: e.target.value } })} className="w-full px-4 py-2 border rounded-lg" />
              <input placeholder="Organization email" type="email" value={modal.form.email} onChange={(e) => setModal({ ...modal, form: { ...modal.form, email: e.target.value } })} className="w-full px-4 py-2 border rounded-lg" />
              <input placeholder="Phone" value={modal.form.phone} onChange={(e) => setModal({ ...modal, form: { ...modal.form, phone: e.target.value } })} className="w-full px-4 py-2 border rounded-lg" />
              <input placeholder="Org admin name" required value={modal.form.org_admin_name} onChange={(e) => setModal({ ...modal, form: { ...modal.form, org_admin_name: e.target.value } })} className="w-full px-4 py-2 border rounded-lg" />
              <input placeholder="Org admin email" type="email" required value={modal.form.org_admin_email} onChange={(e) => setModal({ ...modal, form: { ...modal.form, org_admin_email: e.target.value } })} className="w-full px-4 py-2 border rounded-lg" />
              <input placeholder="Org admin password" type="password" required minLength={8} value={modal.form.org_admin_password} onChange={(e) => setModal({ ...modal, form: { ...modal.form, org_admin_password: e.target.value } })} className="w-full px-4 py-2 border rounded-lg" />
              <div className="flex gap-2 pt-2">
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">Create</button>
                <button type="button" onClick={() => setModal(null)} className="px-4 py-2 border rounded-lg">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modal?.type === 'edit' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-primary mb-4">Edit Organization</h2>
            <form onSubmit={handleEdit} className="space-y-3">
              <input placeholder="Name" required value={modal.form.name} onChange={(e) => setModal({ ...modal, form: { ...modal.form, name: e.target.value } })} className="w-full px-4 py-2 border rounded-lg" />
              <input placeholder="Email" type="email" value={modal.form.email} onChange={(e) => setModal({ ...modal, form: { ...modal.form, email: e.target.value } })} className="w-full px-4 py-2 border rounded-lg" />
              <input placeholder="Phone" value={modal.form.phone} onChange={(e) => setModal({ ...modal, form: { ...modal.form, phone: e.target.value } })} className="w-full px-4 py-2 border rounded-lg" />
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={modal.form.is_active} onChange={(e) => setModal({ ...modal, form: { ...modal.form, is_active: e.target.checked } })} />
                Active
              </label>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">Save</button>
                <button type="button" onClick={() => setModal(null)} className="px-4 py-2 border rounded-lg">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modal?.type === 'modules' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-primary mb-2">Modules: {modal.name}</h2>
            <form onSubmit={handleAssignModules} className="space-y-2">
              {modal.allModules.map((m) => (
                <label key={m.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={modal.assigned.includes(m.id)}
                    onChange={(e) => {
                      const next = e.target.checked ? [...modal.assigned, m.id] : modal.assigned.filter((id) => id !== m.id);
                      setModal({ ...modal, assigned: next });
                    }}
                  />
                  {m.name}
                </label>
              ))}
              <div className="flex gap-2 pt-4">
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">Save</button>
                <button type="button" onClick={() => setModal(null)} className="px-4 py-2 border rounded-lg">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
