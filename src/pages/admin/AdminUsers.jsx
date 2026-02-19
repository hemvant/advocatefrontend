import React, { useState, useEffect } from 'react';
import { getUsers, approveUser, updateUser, assignModules } from '../../services/userService';
import { getAllModules } from '../../services/moduleService';
import { getRoles } from '../../services/roleService';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [modules, setModules] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [assignModal, setAssignModal] = useState(null);
  const [selectedModuleIds, setSelectedModuleIds] = useState([]);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [uRes, mRes, rRes] = await Promise.all([getUsers(), getAllModules(), getRoles()]);
      setUsers(uRes.data.users);
      setModules(mRes.data.modules);
      setRoles(rRes.data.roles || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleApprove = async (user, is_approved) => {
    try {
      await approveUser(user.id, is_approved);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update');
    }
  };

  const openAssignModal = (user) => {
    setAssignModal(user);
    setSelectedModuleIds((user.Modules || []).map((m) => m.id));
  };

  const handleAssignModules = async () => {
    if (!assignModal) return;
    try {
      await assignModules(assignModal.id, selectedModuleIds);
      setAssignModal(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign modules');
    }
  };

  const handleToggleActive = async (user) => {
    try {
      await updateUser(user.id, { is_active: !user.is_active });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update');
    }
  };

  const handleRoleChange = async (user, roleId) => {
    try {
      await updateUser(user.id, { role_id: Number(roleId) });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update role');
    }
  };

  if (loading) return <LoadingSpinner className="min-h-[200px]" />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary mb-2">User Management</h1>
      <p className="text-gray-600 mb-6">Approve users and assign modules.</p>
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 text-danger text-sm">{error}</div>
      )}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-primary text-white">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium">Name</th>
                <th className="text-left px-4 py-3 text-sm font-medium">Email</th>
                <th className="text-left px-4 py-3 text-sm font-medium">Role</th>
                <th className="text-left px-4 py-3 text-sm font-medium">Approved</th>
                <th className="text-left px-4 py-3 text-sm font-medium">Active</th>
                <th className="text-left px-4 py-3 text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-3">{user.name}</td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3">
                    {user.Role?.name === 'SUPER_ADMIN' ? (
                      user.Role?.name
                    ) : (
                      <select
                        value={user.role_id}
                        onChange={(e) => handleRoleChange(user, e.target.value)}
                        className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-accent focus:border-accent"
                      >
                        {roles.map((r) => (
                          <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {user.Role?.name === 'SUPER_ADMIN' ? (
                      <span className="text-gray-500">—</span>
                    ) : user.is_approved ? (
                      <button
                        type="button"
                        onClick={() => handleApprove(user, false)}
                        className="text-success text-sm hover:underline"
                      >
                        Yes
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleApprove(user, true)}
                        className="text-accent text-sm font-medium hover:underline"
                      >
                        Approve
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {user.Role?.name === 'SUPER_ADMIN' ? (
                      <span className="text-gray-500">—</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleToggleActive(user)}
                        className={`text-sm font-medium hover:underline ${user.is_active ? 'text-success' : 'text-danger'}`}
                      >
                        {user.is_active ? 'Active' : 'Inactive'}
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {user.Role?.name !== 'SUPER_ADMIN' && (
                      <button
                        type="button"
                        onClick={() => openAssignModal(user)}
                        className="text-accent text-sm font-medium hover:underline"
                      >
                        Assign modules
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {assignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-lg font-bold text-primary mb-2">Assign modules: {assignModal.name}</h2>
            <div className="space-y-2 max-h-64 overflow-y-auto mb-6">
              {modules.map((m) => (
                <label key={m.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedModuleIds.includes(m.id)}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedModuleIds((prev) => [...prev, m.id]);
                      else setSelectedModuleIds((prev) => prev.filter((id) => id !== m.id));
                    }}
                    className="rounded border-gray-300 text-accent focus:ring-accent"
                  />
                  <span>{m.name}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setAssignModal(null)}
                className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAssignModules}
                className="flex-1 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
