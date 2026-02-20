import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';
import {
  getCaseDurationByCourt,
  getJudgePerformance,
  getEmployeeProductivity,
  getCaseAgingBuckets,
} from '../../services/analyticsApi';

const CARD_CLASS = 'rounded-xl border border-gray-200 bg-white p-5 shadow-sm';
const PRIMARY = '#0B1F3A';
const ACCENT = '#C6A14A';
const COLORS = [PRIMARY, ACCENT, '#1E7F4F', '#6B7280', '#059669'];

function ChartCard({ title, children, loading, error, empty }) {
  return (
    <div className={CARD_CLASS}>
      <h2 className="text-lg font-semibold text-primary mb-4">{title}</h2>
      {loading && (
        <div className="flex justify-center items-center h-[260px]">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-accent" />
        </div>
      )}
      {error && (
        <div className="rounded-lg bg-red-50 text-red-700 p-4 text-sm">{error}</div>
      )}
      {!loading && !error && empty && (
        <div className="text-gray-500 text-center py-12">No data available.</div>
      )}
      {!loading && !error && !empty && children}
    </div>
  );
}

export default function AnalyticsPage() {
  const [caseDuration, setCaseDuration] = useState({ loading: true, data: null, error: '' });
  const [judgePerf, setJudgePerf] = useState({ loading: true, data: null, error: '' });
  const [employeeProd, setEmployeeProd] = useState({ loading: true, data: null, error: '' });
  const [caseAging, setCaseAging] = useState({ loading: true, data: null, error: '' });

  useEffect(() => {
    getCaseDurationByCourt()
      .then((r) => setCaseDuration({ loading: false, data: r.data, error: '' }))
      .catch((e) => setCaseDuration({ loading: false, data: null, error: e.response?.data?.message || 'Failed to load' }));

    getJudgePerformance()
      .then((r) => setJudgePerf({ loading: false, data: r.data, error: '' }))
      .catch((e) => setJudgePerf({ loading: false, data: null, error: e.response?.data?.message || 'Failed to load' }));

    getEmployeeProductivity()
      .then((r) => setEmployeeProd({ loading: false, data: r.data, error: '' }))
      .catch((e) => setEmployeeProd({ loading: false, data: null, error: e.response?.data?.message || 'Failed to load' }));

    getCaseAgingBuckets()
      .then((r) => setCaseAging({ loading: false, data: r.data, error: '' }))
      .catch((e) => setCaseAging({ loading: false, data: null, error: e.response?.data?.message || 'Failed to load' }));
  }, []);

  const chart1 = caseDuration.data?.chart;
  const raw1 = caseDuration.data?.raw || [];
  const durationChartData = (chart1?.labels || []).map((name, i) => ({
    name,
    days: (chart1?.datasets?.[0]?.data || [])[i] ?? 0,
  }));
  const hasDuration = durationChartData.some((d) => d.days > 0) || raw1.length > 0;

  const chart2 = judgePerf.data?.chart;
  const raw2 = judgePerf.data?.raw || [];
  const judgeChartData = (chart2?.labels || []).map((name, i) => ({
    name,
    cases: (chart2?.datasets?.[0]?.data || [])[i] ?? 0,
    hearings: (chart2?.datasets?.[1]?.data || [])[i] ?? 0,
  }));
  const hasJudge = judgeChartData.some((d) => d.cases > 0 || d.hearings > 0) || raw2.length > 0;

  const chart3 = employeeProd.data?.chart;
  const raw3 = employeeProd.data?.raw || [];
  const empChartData = (chart3?.labels || []).map((name, i) => ({
    name,
    cases: (chart3?.datasets?.[0]?.data || [])[i] ?? 0,
    tasks: (chart3?.datasets?.[1]?.data || [])[i] ?? 0,
    hearings: (chart3?.datasets?.[2]?.data || [])[i] ?? 0,
  }));
  const hasEmp = empChartData.some((d) => d.cases > 0 || d.tasks > 0 || d.hearings > 0) || raw3.length > 0;

  const chart4 = caseAging.data?.chart;
  const raw4 = caseAging.data?.raw || [];
  const agingChartData = (chart4?.labels || []).map((name, i) => ({
    name,
    count: (chart4?.datasets?.[0]?.data || [])[i] ?? 0,
  }));
  const hasAging = agingChartData.some((d) => d.count > 0) || raw4.some((r) => (r.count || 0) > 0);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-primary">Reports & Analytics</h1>
      <p className="text-gray-600">
        View case duration by court, judge performance, employee productivity, and case aging.
      </p>

      {/* 1. Case duration by court */}
      <section>
        <ChartCard
          title="Average case duration by court (days)"
          loading={caseDuration.loading}
          error={caseDuration.error || null}
          empty={!hasDuration}
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={durationChartData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => [v + ' days', 'Avg duration']} />
              <Bar dataKey="days" fill={PRIMARY} name="Avg duration (days)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          {raw1.length > 0 && (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 font-medium text-gray-700">Court</th>
                    <th className="text-right py-2 font-medium text-gray-700">Avg days</th>
                    <th className="text-right py-2 font-medium text-gray-700">Cases</th>
                  </tr>
                </thead>
                <tbody>
                  {raw1.map((r, i) => (
                    <tr key={i} className="border-b border-gray-100">
                      <td className="py-2">{r.court_name || '—'}</td>
                      <td className="text-right py-2">{r.avg_duration_days ?? 0}</td>
                      <td className="text-right py-2">{r.case_count ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </ChartCard>
      </section>

      {/* 2. Judge performance */}
      <section>
        <ChartCard
          title="Judge performance (cases assigned & hearings conducted)"
          loading={judgePerf.loading}
          error={judgePerf.error || null}
          empty={!hasJudge}
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={judgeChartData}
              margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
              barCategoryGap="20%"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="cases" fill={PRIMARY} name="Cases assigned" radius={[4, 4, 0, 0]} />
              <Bar dataKey="hearings" fill={ACCENT} name="Hearings conducted" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          {raw2.length > 0 && (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 font-medium text-gray-700">Judge</th>
                    <th className="text-left py-2 font-medium text-gray-700">Court</th>
                    <th className="text-right py-2 font-medium text-gray-700">Cases</th>
                    <th className="text-right py-2 font-medium text-gray-700">Hearings</th>
                  </tr>
                </thead>
                <tbody>
                  {raw2.map((r, i) => (
                    <tr key={i} className="border-b border-gray-100">
                      <td className="py-2">{r.judge_name || '—'}</td>
                      <td className="py-2">{r.court_name || '—'}</td>
                      <td className="text-right py-2">{r.cases_assigned ?? 0}</td>
                      <td className="text-right py-2">{r.hearings_conducted ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </ChartCard>
      </section>

      {/* 3. Employee productivity */}
      <section>
        <ChartCard
          title="Employee productivity (cases, tasks, hearings)"
          loading={employeeProd.loading}
          error={employeeProd.error || null}
          empty={!hasEmp}
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={empChartData}
              margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
              barCategoryGap="15%"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="cases" fill={PRIMARY} name="Cases handled" radius={[4, 4, 0, 0]} />
              <Bar dataKey="tasks" fill={ACCENT} name="Tasks completed" radius={[4, 4, 0, 0]} />
              <Bar dataKey="hearings" fill={COLORS[2]} name="Hearings attended" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          {raw3.length > 0 && (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 font-medium text-gray-700">Employee</th>
                    <th className="text-right py-2 font-medium text-gray-700">Cases</th>
                    <th className="text-right py-2 font-medium text-gray-700">Tasks</th>
                    <th className="text-right py-2 font-medium text-gray-700">Hearings</th>
                    <th className="text-right py-2 font-medium text-gray-700">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {raw3.map((r, i) => (
                    <tr key={i} className="border-b border-gray-100">
                      <td className="py-2">{r.name || r.email || '—'}</td>
                      <td className="text-right py-2">{r.cases_handled ?? 0}</td>
                      <td className="text-right py-2">{r.tasks_completed ?? 0}</td>
                      <td className="text-right py-2">{r.hearings_attended ?? 0}</td>
                      <td className="text-right py-2 font-medium">{r.productivity_score ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </ChartCard>
      </section>

      {/* 4. Case aging buckets */}
      <section>
        <ChartCard
          title="Case aging (by filing/creation date)"
          loading={caseAging.loading}
          error={caseAging.error || null}
          empty={!hasAging}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={agingChartData}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, count }) => `${name}: ${count}`}
                >
                  {agingChartData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [v, 'Cases']} />
              </PieChart>
            </ResponsiveContainer>
            {raw4.length > 0 && (
              <div className="overflow-x-auto flex items-center">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 font-medium text-gray-700">Bucket</th>
                      <th className="text-right py-2 font-medium text-gray-700">Cases</th>
                    </tr>
                  </thead>
                  <tbody>
                    {raw4.map((r, i) => (
                      <tr key={i} className="border-b border-gray-100">
                        <td className="py-2">{r.bucket || '—'}</td>
                        <td className="text-right py-2 font-medium">{r.count ?? 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </ChartCard>
      </section>
    </div>
  );
}
