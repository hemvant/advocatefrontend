import React, { useState, useEffect } from 'react';
import { getEmployees, createEmployee, updateEmployee, getEmployeeModules, assignEmployeeModules, getModules } from '../../services/orgApi';
import { useOrgAuth } from '../../context/OrgAuthContext';

export default function OrgEmployees() {
  const { user, isOrgAdmin } = useOrgAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null);
  const [orgModules, setOrgModules] = useState([]);

  const load = async () => {
    try {
      const { data } = await getEmployees();
      setEmployees(data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setModal({ type: 'create', form: { name: '', email: '', password: '', role: 'EMPLOYEE' } });
  };

  const openEdit = (emp) => {
    setModal({ type: 'edit', id: emp.id, form: { name: emp.name, is_active: emp.is_active, is_approved: emp.is_approved, role: emp.role } });
  };

  const openModules = async (emp) => {
    const { data: modData } = await getModules();
    const { data: empModData } = await getEmployeeModules(emp.id);
    const assigned = (empModData?.data || []).map((m) => m.id);
    setOrgModules(modData?.data || []);
    setModal({ type: 'modules', id: emp.id, name: emp.name, assigned, allModules: modData?.data || [] });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!isOrgAdmin) return;
    try {
      await createEmployee(modal.form);
      setModal(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Create failed');
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await updateEmployee(modal.id, modal.form);
      setModal(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    }
  };

  const handleAssignModules = async (e) => {
    e.preventDefault();
    try {
      await assignEmployeeModules(modal.id, modal.assigned);
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
        <h1 className="text-2xl font-bold text-primary">Employees</h1>
        {isOrgAdmin && (
          <button
            type="button"
            onClick={openCreate}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 focus:ring-2 focus:ring-accent"
          >
            Add Employee
          </button>
        )}
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              {isOrgAdmin && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {employees.map((emp) => (
              <tr key={emp.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{emp.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{emp.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{emp.role}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded ${emp.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {emp.is_active ? 'Active' : 'Inactive'}
                  </span>
                  {!emp.is_approved && <span className="ml-1 px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-800">Pending</span>}
                </td>
                {isOrgAdmin && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <button type="button" onClick={() => openEdit(emp)} className="text-accent hover:underline mr-3">Edit</button>
                    <button type="button" onClick={() => openModules(emp)} className="text-primary hover:underline">Modules</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {employees.length === 0 && (
          <div className="text-center py-12 text-gray-500">No employees yet.</div>
        )}
      </div>

      {modal?.type === 'create' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-primary mb-4">Add Employee</h2>
            <form onSubmit={handleCreate} className="space-y-3">
              <input placeholder="Name" required value={modal.form.name} onChange={(e) => setModal({ ...modal, form: { ...modal.form, name: e.target.value } })} className="w-full px-4 py-2 border rounded-lg" />
              <input placeholder="Email" type="email" required value={modal.form.email} onChange={(e) => setModal({ ...modal, form: { ...modal.form, email: e.target.value } })} className="w-full px-4 py-2 border rounded-lg" />
              <input placeholder="Password" type="password" required minLength={8} value={modal.form.password} onChange={(e) => setModal({ ...modal, form: { ...modal.form, password: e.target.value } })} className="w-full px-4 py-2 border rounded-lg" />
              <select value={modal.form.role} onChange={(e) => setModal({ ...modal, form: { ...modal.form, role: e.target.value } })} className="w-full px-4 py-2 border rounded-lg">
                <option value="EMPLOYEE">EMPLOYEE</option>
                <option value="ORG_ADMIN">ORG_ADMIN</option>
              </select>
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
            <h2 className="text-xl font-bold text-primary mb-4">Edit Employee</h2>
            <form onSubmit={handleEdit} className="space-y-3">
              <input placeholder="Name" required value={modal.form.name} onChange={(e) => setModal({ ...modal, form: { ...modal.form, name: e.target.value } })} className="w-full px-4 py-2 border rounded-lg" />
              <select value={modal.form.role} onChange={(e) => setModal({ ...modal, form: { ...modal.form, role: e.target.value } })} className="w-full px-4 py-2 border rounded-lg">
                <option value="EMPLOYEE">EMPLOYEE</option>
                <option value="ORG_ADMIN">ORG_ADMIN</option>
              </select>
              <label className="flex items-center gap-2"><input type="checkbox" checked={modal.form.is_active} onChange={(e) => setModal({ ...modal, form: { ...modal.form, is_active: e.target.checked } })} /> Active</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={modal.form.is_approved} onChange={(e) => setModal({ ...modal, form: { ...modal.form, is_approved: e.target.checked } })} /> Approved</label>
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
