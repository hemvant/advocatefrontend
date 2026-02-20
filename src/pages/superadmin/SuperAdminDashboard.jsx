import React, { useState, useEffect } from 'react';
import { getDashboardSummary, getDashboardAnalytics } from '../../services/superAdminApi';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const CARD_CLASS = 'rounded-xl border border-gray-200 bg-white p-5 shadow-sm';
const LABEL_CLASS = 'text-xs font-medium text-gray-500 uppercase tracking-wider';
const VALUE_CLASS = 'text-2xl font-bold mt-1';
const ACCENT = '#C6A14A';
const PRIMARY = '#0B1F3A';
const COLORS = [PRIMARY, ACCENT, '#1E7F4F', '#6B7280', '#059669'];

export default function SuperAdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getDashboardSummary(), getDashboardAnalytics()])
      .then(([r1, r2]) => {
        setSummary(r1.data.data);
        setAnalytics(r2.data.data);
      })
      .catch((e) => setError(e.response?.data?.message || 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-accent" />
      </div>
    );
  }
  if (error) {
    return <div className="rounded-lg bg-red-50 text-red-700 p-4">{error}</div>;
  }

  const s = summary || {};
  const a = analytics || {};
  const orgGrowthData = (a.monthly_organization_growth?.labels || []).map((label, i) => ({ name: label, count: (a.monthly_organization_growth?.datasets?.[0]?.data || [])[i] || 0 }));
  const revenueData = (a.monthly_revenue_growth?.labels || []).map((label, i) => ({ name: label, revenue: (a.monthly_revenue_growth?.datasets?.[0]?.data || [])[i] || 0 }));
  const caseStatusData = (a.cases_by_status?.labels || []).map((label, i) => ({ name: label, value: (a.cases_by_status?.datasets?.[0]?.data || [])[i] || 0 }));

  const cards = [
    { label: 'Total Organizations', value: s.total_organizations },
    { label: 'Active Organizations', value: s.active_organizations },
    { label: 'Suspended Organizations', value: s.suspended_organizations },
    { label: 'Total Org Users', value: s.total_organization_users },
    { label: 'Total Clients', value: s.total_clients },
    { label: 'Total Cases', value: s.total_cases },
    { label: 'Total Hearings', value: s.total_hearings },
    { label: 'Total Documents', value: s.total_documents },
    { label: 'Total Revenue', value: s.total_revenue != null ? `₹${Number(s.total_revenue).toLocaleString()}` : '—' },
    { label: 'Monthly Revenue Growth', value: s.monthly_revenue_growth_percent != null ? `${s.monthly_revenue_growth_percent}%` : '—' },
    { label: 'Active Subscriptions', value: s.active_subscriptions },
    { label: 'Expiring (7 days)', value: s.expiring_subscriptions_7_days }
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-primary">Platform Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className={CARD_CLASS}>
            <p className={LABEL_CLASS}>{c.label}</p>
            <p className={VALUE_CLASS} style={{ color: PRIMARY }}>{c.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={CARD_CLASS}>
          <h2 className="text-lg font-semibold text-primary mb-4">Monthly Organization Growth</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={orgGrowthData}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill={PRIMARY} name="Organizations" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className={CARD_CLASS}>
          <h2 className="text-lg font-semibold text-primary mb-4">Monthly Revenue Growth</h2>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={revenueData}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => ['₹' + Number(v).toLocaleString(), 'Revenue']} />
              <Line type="monotone" dataKey="revenue" stroke={ACCENT} strokeWidth={2} name="Revenue" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={CARD_CLASS}>
          <h2 className="text-lg font-semibold text-primary mb-4">Cases by Status</h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={caseStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={(e) => e.name + ': ' + e.value}>
                {caseStatusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className={CARD_CLASS}>
          <h2 className="text-lg font-semibold text-primary mb-4">Activity (Last 7 Days)</h2>
          <p className="text-gray-600">DAU: <strong>{a.dau ?? 0}</strong> · MAU: <strong>{a.mau ?? 0}</strong></p>
          {(a.platform_activity_heatmap?.labels?.length > 0) && (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={(a.platform_activity_heatmap.labels || []).map((name, i) => ({ name, count: (a.platform_activity_heatmap.datasets?.[0]?.data || [])[i] || 0 }))}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill={PRIMARY} name="Events" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
