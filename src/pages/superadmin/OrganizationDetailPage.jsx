import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrganizationDetail, resetOrgAdminPassword } from '../../services/superAdminApi';
import PasswordInput from '../../components/PasswordInput';

export default function OrganizationDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [resetPasswordForm, setResetPasswordForm] = useState({ new_password: '', confirm: '' });
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);
  const [resetPasswordError, setResetPasswordError] = useState('');

  useEffect(() => {
    getOrganizationDetail(id)
      .then(function(r) { setData(r.data.data); })
      .catch(function(e) { setError(e.response && e.response.data && e.response.data.message || 'Failed'); })
      .finally(function() { setLoading(false); });
  }, [id]);

  const handleResetOrgAdminPassword = async (e) => {
    e.preventDefault();
    setResetPasswordError('');
    if (resetPasswordForm.new_password.length < 8) {
      setResetPasswordError('Password must be at least 8 characters');
      return;
    }
    if (resetPasswordForm.new_password !== resetPasswordForm.confirm) {
      setResetPasswordError('Passwords do not match');
      return;
    }
    setResetPasswordLoading(true);
    try {
      await resetOrgAdminPassword(id, resetPasswordForm.new_password);
      setResetPasswordOpen(false);
      setResetPasswordForm({ new_password: '', confirm: '' });
    } catch (err) {
      setResetPasswordError(err.response?.data?.message || 'Reset failed');
    } finally {
      setResetPasswordLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-accent" /></div>;
  if (error || !data) return <div className="rounded-lg bg-red-50 text-red-700 p-4">{error || 'Not found'}</div>;

  const org = data.organization || {};
  const audit = data.recent_audit_logs || [];
  const orgAdmin = (data.organization?.OrganizationUsers || []).find((u) => u.role === 'ORG_ADMIN');

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-4 items-center">
          <Link to="/super-admin/organizations" className="text-primary hover:underline">Back</Link>
          <h1 className="text-2xl font-bold text-primary">{org.name}</h1>
        </div>
        <button
          type="button"
          onClick={() => { setResetPasswordOpen(true); setResetPasswordError(''); setResetPasswordForm({ new_password: '', confirm: '' }); }}
          className="px-4 py-2 border border-accent text-accent rounded-lg hover:bg-accent/10 focus:ring-2 focus:ring-accent"
        >
          Reset org admin password
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border bg-white p-5"><p className="text-xs text-gray-500">Clients</p><p className="text-xl font-bold text-primary">{data.client_count}</p></div>
        <div className="rounded-xl border bg-white p-5"><p className="text-xs text-gray-500">Cases</p><p className="text-xl font-bold text-primary">{data.case_count}</p></div>
        <div className="rounded-xl border bg-white p-5"><p className="text-xs text-gray-500">Employees</p><p className="text-xl font-bold text-primary">{data.employee_count}</p></div>
        <div className="rounded-xl border bg-white p-5"><p className="text-xs text-gray-500">Revenue</p><p className="text-xl font-bold text-primary">₹{Number(data.revenue_total || 0).toLocaleString()}</p></div>
      </div>
      <div className="rounded-xl border bg-white p-5">
        <h2 className="text-lg font-semibold text-primary mb-3">Info</h2>
        <p>Email: {org.email || '—'} | Plan: {org.subscription_plan || '—'} | Status: {org.is_active ? 'Active' : 'Suspended'}</p>
        <p>Modules: {(data.module_usage || []).join(', ') || '—'}</p>
        {orgAdmin && (
          <p className="mt-2 text-sm text-gray-600">Org admin: {orgAdmin.name} ({orgAdmin.email}) — only Super Admin can reset this password.</p>
        )}
      </div>
      <div className="rounded-xl border bg-white p-5">
        <h2 className="text-lg font-semibold text-primary mb-3">Recent Audit</h2>
        <ul className="divide-y">
          {audit.map(function(a) {
            return (
              <li key={a.id} className="py-2 text-sm">
                {a.created_at ? new Date(a.created_at).toLocaleString() : '—'} · {a.action_type} {a.entity_type} · {a.User ? a.User.name : '—'}
              </li>
            );
          })}
        </ul>
        {audit.length === 0 && <p className="text-gray-500">No recent activity.</p>}
      </div>

      {resetPasswordOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-primary mb-2">Reset org admin password</h2>
            <p className="text-sm text-gray-600 mb-4">Only Super Admin can reset the organization admin&apos;s password. The admin will use this new password to sign in.</p>
            {resetPasswordError && <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">{resetPasswordError}</div>}
            <form onSubmit={handleResetOrgAdminPassword} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New password</label>
                <PasswordInput
                  value={resetPasswordForm.new_password}
                  onChange={(e) => setResetPasswordForm((f) => ({ ...f, new_password: e.target.value }))}
                  placeholder="Min 8 characters"
                  minLength={8}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm password</label>
                <PasswordInput
                  value={resetPasswordForm.confirm}
                  onChange={(e) => setResetPasswordForm((f) => ({ ...f, confirm: e.target.value }))}
                  placeholder="Re-enter password"
                  minLength={8}
                  required
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={resetPasswordLoading} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50">
                  {resetPasswordLoading ? 'Resetting...' : 'Reset password'}
                </button>
                <button type="button" onClick={() => setResetPasswordOpen(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
