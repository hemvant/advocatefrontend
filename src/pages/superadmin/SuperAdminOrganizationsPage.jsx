import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getOrganizations, createOrganization, updateOrganization, getOrganizationModules, assignOrganizationModules, getAllModules, impersonateOrganization, getPackages } from '../../services/superAdminApi';

export default function SuperAdminOrganizationsPage() {
  const [list, setList] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ status: '', subscription_plan: '', from_date: '', to_date: '', search: '' });
  const [modal, setModal] = useState(null);
  const [allModules, setAllModules] = useState([]);
  const [packages, setPackages] = useState([]);

  const load = async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (filters.status) params.status = filters.status;
      if (filters.subscription_plan) params.subscription_plan = filters.subscription_plan;
      if (filters.from_date) params.from_date = filters.from_date;
      if (filters.to_date) params.to_date = filters.to_date;
      if (filters.search) params.search = filters.search;
      const { data } = await getOrganizations(params);
      setList(data.data || []);
      setPagination(data.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 });
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1);
  }, [filters.status, filters.subscription_plan, filters.from_date, filters.to_date, filters.search]);

  const handleSearch = () => load(1);

  const openCreate = async () => {
    const [modRes, pkgRes] = await Promise.all([getAllModules(), getPackages({ is_active: 'true' })]);
    setAllModules(modRes.data?.data || []);
    const pkgList = pkgRes.data?.data || [];
    setPackages(pkgList);
    const demoPkg = pkgList.find((p) => p.name === 'Demo');
    setModal({
      type: 'create',
      form: {
        name: '',
        email: '',
        phone: '',
        address: '',
        subscription_plan: '',
        package_id: demoPkg ? String(demoPkg.id) : (pkgList[0] ? String(pkgList[0].id) : ''),
        org_admin_name: '',
        org_admin_email: '',
        org_admin_password: ''
      }
    });
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

  const handleImpersonate = async (orgId) => {
    try {
      await impersonateOrganization(orgId);
      window.open('/', '_blank');
    } catch (e) {
      setError(e.response?.data?.message || 'Impersonation failed');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...modal.form };
      if (payload.package_id) payload.package_id = parseInt(payload.package_id, 10);
      else delete payload.package_id;
      await createOrganization(payload);
      setModal(null);
      load(1);
    } catch (err) {
      setError(err.response?.data?.message || 'Create failed');
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await updateOrganization(modal.id, modal.form);
      setModal(null);
      load(pagination.page);
    } catch (e) {
      setError(e.response?.data?.message || 'Update failed');
    }
  };

  const handleAssignModules = async (e) => {
    e.preventDefault();
    try {
      await assignOrganizationModules(modal.id, modal.assigned);
      setModal(null);
      load(pagination.page);
    } catch (e) {
      setError(e.response?.data?.message || 'Update failed');
    }
  };

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-primary">Organizations</h1>
        <button type="button" onClick={openCreate} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">Add Organization</button>
      </div>
      {error && <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="border rounded-lg px-3 py-2 text-sm">
            <option value="">All status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
          <input placeholder="Plan" value={filters.subscription_plan} onChange={(e) => setFilters({ ...filters, subscription_plan: e.target.value })} className="border rounded-lg px-3 py-2 text-sm" />
          <input type="date" value={filters.from_date} onChange={(e) => setFilters({ ...filters, from_date: e.target.value })} className="border rounded-lg px-3 py-2 text-sm" />
          <input type="date" value={filters.to_date} onChange={(e) => setFilters({ ...filters, to_date: e.target.value })} className="border rounded-lg px-3 py-2 text-sm" />
          <input placeholder="Search name/email" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} className="border rounded-lg px-3 py-2 text-sm" />
          <button type="button" onClick={handleSearch} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm">Search</button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-accent" /></div>
        ) : (
          <>
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
                {list.map((org) => (
                  <tr key={org.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <Link to={`/super-admin/organizations/${org.id}`} className="text-primary hover:underline">{org.name}</Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{org.email || '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{org.subscription_plan || '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded ${org.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{org.is_active ? 'Active' : 'Suspended'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
                      <Link to={`/super-admin/organizations/${org.id}`} className="text-accent hover:underline">View</Link>
                      <button type="button" onClick={() => openEdit(org)} className="text-primary hover:underline">Edit</button>
                      <button type="button" onClick={() => openModules(org)} className="text-primary hover:underline">Modules</button>
                      <button type="button" onClick={() => handleImpersonate(org.id)} className="text-accent hover:underline">Impersonate</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {list.length === 0 && <div className="text-center py-12 text-gray-500">No organizations found.</div>}
            {pagination.totalPages > 1 && (
              <div className="px-6 py-3 border-t flex justify-between items-center">
                <span className="text-sm text-gray-600">Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)</span>
                <div className="space-x-2">
                  <button type="button" disabled={pagination.page <= 1} onClick={() => load(pagination.page - 1)} className="px-3 py-1 border rounded disabled:opacity-50">Prev</button>
                  <button type="button" disabled={pagination.page >= pagination.totalPages} onClick={() => load(pagination.page + 1)} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
                </div>
              </div>
            )}
          </>
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Package</label>
                <select value={modal.form.package_id || ''} onChange={(e) => setModal({ ...modal, form: { ...modal.form, package_id: e.target.value } })} className="w-full px-4 py-2 border rounded-lg">
                  <option value="">Auto (Demo)</option>
                  {packages.map((p) => <option key={p.id} value={p.id}>{p.name} {p.is_demo ? '(Demo)' : ''}</option>)}
                </select>
              </div>
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
              <input placeholder="Subscription plan" value={modal.form.subscription_plan} onChange={(e) => setModal({ ...modal, form: { ...modal.form, subscription_plan: e.target.value } })} className="w-full px-4 py-2 border rounded-lg" />
              <label className="flex items-center gap-2"><input type="checkbox" checked={modal.form.is_active} onChange={(e) => setModal({ ...modal, form: { ...modal.form, is_active: e.target.checked } })} />Active</label>
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
                  <input type="checkbox" checked={modal.assigned.includes(m.id)} onChange={(e) => setModal({ ...modal, assigned: e.target.checked ? [...modal.assigned, m.id] : modal.assigned.filter((id) => id !== m.id) })} />
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
