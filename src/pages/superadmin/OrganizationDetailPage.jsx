import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrganizationDetail } from '../../services/superAdminApi';

export default function OrganizationDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getOrganizationDetail(id)
      .then(function(r) { setData(r.data.data); })
      .catch(function(e) { setError(e.response && e.response.data && e.response.data.message || 'Failed'); })
      .finally(function() { setLoading(false); });
  }, [id]);

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-accent" /></div>;
  if (error || !data) return <div className="rounded-lg bg-red-50 text-red-700 p-4">{error || 'Not found'}</div>;

  const org = data.organization || {};
  const audit = data.recent_audit_logs || [];

  return (
    <div className="space-y-6">
      <div className="flex gap-4 items-center">
        <Link to="/super-admin/organizations" className="text-primary hover:underline">Back</Link>
        <h1 className="text-2xl font-bold text-primary">{org.name}</h1>
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
    </div>
  );
}
