import React, { useState, useEffect } from 'react';
import { getSubscriptions } from '../../services/superAdminApi';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#0B1F3A', '#C6A14A', '#1E7F4F'];

export default function SubscriptionsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    getSubscriptions().then((r) => setData(r.data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-accent" /></div>;

  const active = data?.active || [];
  const expiring = data?.expiring_soon || [];
  const planDist = (data?.plan_distribution || []).map((r) => ({ name: r.plan, value: r.count }));

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-primary">Subscriptions</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-primary mb-4">Plan Distribution</h2>
          {planDist.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={planDist} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                  {planDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-500">No data.</p>}
        </div>
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-primary mb-2">Summary</h2>
          <p>Active: <strong>{active.length}</strong></p>
          <p>Expiring in 7 days: <strong>{expiring.length}</strong></p>
        </div>
      </div>
      <div className="rounded-xl border bg-white shadow overflow-hidden">
        <h2 className="text-lg font-semibold text-primary p-4 border-b">Expiring Soon</h2>
        <table className="min-w-full">
          <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">Organization</th><th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">Plan</th><th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">Expires</th></tr></thead>
          <tbody className="divide-y">
            {expiring.map((s) => (
              <tr key={s.id}>
                <td className="px-6 py-4 text-sm">{s.Organization?.name || '—'}</td>
                <td className="px-6 py-4 text-sm">{s.plan}</td>
                <td className="px-6 py-4 text-sm">{s.expires_at ? new Date(s.expires_at).toLocaleDateString() : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {expiring.length === 0 && <p className="p-6 text-gray-500">None.</p>}
      </div>
    </div>
  );
}
