import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { listTdsRecords, getTdsYearlyStatement, createTdsRecord } from '../../services/billingApi';
import { getApiMessage } from '../../services/apiHelpers';

export default function TdsReportPage() {
  const [records, setRecords] = useState([]);
  const [yearly, setYearly] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ amount: '', tds_amount: '', tds_percentage: '', financial_year: '', deduction_date: '', invoice_id: '', payment_id: '' });
  const [submitting, setSubmitting] = useState(false);
  const [fy, setFy] = useState('');

  const currentFy = () => {
    const d = new Date();
    const y = d.getMonth() >= 3 ? d.getFullYear() : d.getFullYear() - 1;
    return `${y}-${String(y + 1).slice(-2)}`;
  };

  useEffect(() => {
    setLoading(true);
    listTdsRecords({ financial_year: fy || undefined })
      .then(({ data }) => setRecords(data.data || []))
      .catch(() => setRecords([]));
    getTdsYearlyStatement({ financial_year: fy || currentFy() })
      .then(({ data }) => setYearly(data.data))
      .catch(() => setYearly(null))
      .finally(() => setLoading(false));
  }, [fy]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        amount: Number(form.amount),
        tds_amount: Number(form.tds_amount),
        financial_year: form.financial_year || undefined,
        deduction_date: form.deduction_date || undefined,
        tds_percentage: form.tds_percentage ? Number(form.tds_percentage) : undefined,
        invoice_id: form.invoice_id ? parseInt(form.invoice_id, 10) : undefined,
        payment_id: form.payment_id ? parseInt(form.payment_id, 10) : undefined
      };
      await createTdsRecord(payload);
      setShowForm(false);
      setForm({ amount: '', tds_amount: '', tds_percentage: '', financial_year: '', deduction_date: '', invoice_id: '', payment_id: '' });
      listTdsRecords({ financial_year: fy || undefined }).then(({ data }) => setRecords(data.data || []));
      getTdsYearlyStatement({ financial_year: fy || currentFy() }).then(({ data }) => setYearly(data.data));
    } catch (e) {
      setError(getApiMessage(e, 'Save failed'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !yearly) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-accent" /></div>;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-primary">TDS reports</h1>
        <div className="flex gap-2">
          <Link to="/billing" className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium">Billing</Link>
          <button type="button" onClick={() => setShowForm(true)} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm font-medium">Add TDS record</button>
        </div>
      </div>
      {error && <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>}
      <div className="mb-6">
        <label className="text-sm text-gray-600 mr-2">Financial year (e.g. 2024-25)</label>
        <input type="text" value={fy} onChange={(e) => setFy(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg w-32" placeholder={currentFy()} />
      </div>

      {yearly && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-primary mb-2">Yearly statement — {yearly.financial_year}</h2>
          <p className="text-xl font-bold text-primary">Total TDS: ₹{(yearly.total_tds ?? 0).toLocaleString('en-IN')}</p>
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-primary mb-4">Add TDS record</h2>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹) *</label>
              <input type="number" min="0" step="0.01" required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">TDS amount (₹) *</label>
              <input type="number" min="0" step="0.01" required value={form.tds_amount} onChange={(e) => setForm({ ...form, tds_amount: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">TDS % (optional)</label>
              <input type="number" min="0" max="100" step="0.01" value={form.tds_percentage} onChange={(e) => setForm({ ...form, tds_percentage: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Financial year</label>
              <input type="text" value={form.financial_year} onChange={(e) => setForm({ ...form, financial_year: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="e.g. 2024-25" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deduction date</label>
              <input type="date" value={form.deduction_date} onChange={(e) => setForm({ ...form, deduction_date: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={submitting} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50">Save</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <h2 className="text-lg font-semibold text-primary p-4 border-b border-gray-200">TDS records</h2>
        {records.length === 0 ? (
          <p className="p-6 text-gray-500">No TDS records. Add one or select another financial year.</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">FY</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">TDS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {records.map((r) => (
                <tr key={r.id}>
                  <td className="px-6 py-4 text-sm">{r.deduction_date || '—'}</td>
                  <td className="px-6 py-4 text-sm">{r.financial_year || '—'}</td>
                  <td className="px-6 py-4 text-sm text-right">₹{Number(r.amount).toLocaleString('en-IN')}</td>
                  <td className="px-6 py-4 text-sm text-right font-medium">₹{Number(r.tds_amount).toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
