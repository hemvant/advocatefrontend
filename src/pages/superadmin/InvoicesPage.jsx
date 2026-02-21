import React, { useState, useEffect } from 'react';
import { getInvoices, createInvoice, markInvoicePaid, getOrganizations } from '../../services/superAdminApi';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({
    organization_id: '',
    amount: '',
    currency: 'INR',
    billing_cycle: 'MONTHLY',
    period_start: '',
    period_end: '',
    due_date: ''
  });
  const [saving, setSaving] = useState(false);

  const load = () => {
    getInvoices({ limit: 100 }).then(({ data }) => {
      setInvoices(data.data || []);
      setTotal(data.total ?? 0);
    }).catch(() => setInvoices([]));
  };

  useEffect(() => {
    load();
    getOrganizations({ limit: 500 }).then(({ data }) => setOrganizations(data.data || [])).catch(() => {});
    setLoading(false);
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await createInvoice({
        organization_id: parseInt(form.organization_id, 10),
        amount: parseFloat(form.amount) || 0,
        currency: form.currency || 'INR',
        billing_cycle: form.billing_cycle || null,
        period_start: form.period_start || null,
        period_end: form.period_end || null,
        due_date: form.due_date || null
      });
      setCreateOpen(false);
      setForm({ organization_id: '', amount: '', currency: 'INR', billing_cycle: 'MONTHLY', period_start: '', period_end: '', due_date: '' });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Create failed');
    } finally {
      setSaving(false);
    }
  };

  const handleMarkPaid = async (id) => {
    try {
      await markInvoicePaid(id);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-accent" /></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary">Invoices</h1>
        <button type="button" onClick={() => { setCreateOpen(true); setError(''); }} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">Create invoice</button>
      </div>
      {error && <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Organization</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {invoices.map((inv) => (
              <tr key={inv.id}>
                <td className="px-6 py-4 text-sm">{inv.Organization?.name || '—'}</td>
                <td className="px-6 py-4 text-sm">{inv.currency} {inv.amount}</td>
                <td className="px-6 py-4 text-sm">{inv.period_start && inv.period_end ? `${inv.period_start} – ${inv.period_end}` : '—'}</td>
                <td className="px-6 py-4 text-sm">{inv.due_date ? new Date(inv.due_date).toLocaleDateString() : '—'}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded ${inv.status === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>{inv.status}</span>
                </td>
                <td className="px-6 py-4 text-right text-sm">
                  {inv.status !== 'PAID' && <button type="button" onClick={() => handleMarkPaid(inv.id)} className="text-primary hover:underline">Mark paid</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {invoices.length === 0 && <p className="p-6 text-gray-500">No invoices.</p>}
      </div>

      {createOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-primary mb-4">Create invoice</h2>
            {error && <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>}
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Organization *</label>
                <select value={form.organization_id} onChange={(e) => setForm((f) => ({ ...f, organization_id: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" required>
                  <option value="">Select</option>
                  {organizations.map((org) => <option key={org.id} value={org.id}>{org.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
                <input type="number" step="0.01" min="0" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                <input type="text" maxLength={3} value={form.currency} onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Billing cycle</label>
                <select value={form.billing_cycle} onChange={(e) => setForm((f) => ({ ...f, billing_cycle: e.target.value }))} className="w-full px-3 py-2 border rounded-lg">
                  <option value="MONTHLY">Monthly</option>
                  <option value="ANNUAL">Annual</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Period start</label>
                  <input type="date" value={form.period_start} onChange={(e) => setForm((f) => ({ ...f, period_start: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Period end</label>
                  <input type="date" value={form.period_end} onChange={(e) => setForm((f) => ({ ...f, period_end: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due date</label>
                <input type="date" value={form.due_date} onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={saving} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50">{saving ? 'Creating...' : 'Create'}</button>
                <button type="button" onClick={() => setCreateOpen(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
