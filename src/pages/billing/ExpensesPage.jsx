import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { listExpenses, getExpensesMonthlyReport, createExpense, updateExpense, deleteExpense } from '../../services/billingApi';
import { listCases } from '../../services/caseApi';
import { getApiMessage } from '../../services/apiHelpers';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [monthlyReport, setMonthlyReport] = useState([]);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ category: '', amount: '', case_id: '', expense_date: '', description: '', receipt_path: '' });
  const [submitting, setSubmitting] = useState(false);
  const [year, setYear] = useState(new Date().getFullYear());

  const load = () => {
    listExpenses({ limit: 100 }).then((r) => setExpenses(r.data.data || [])).catch(() => setExpenses([]));
    getExpensesMonthlyReport({ year }).then((r) => setMonthlyReport(r.data.data || [])).catch(() => setMonthlyReport([]));
  };

  useEffect(() => {
    setLoading(true);
    listCases({ limit: 200 }).then((r) => setCases(r.data.data || [])).catch(() => setCases([]));
    load();
    setLoading(false);
  }, [year]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const payload = { category: form.category.trim(), amount: Number(form.amount), expense_date: form.expense_date || undefined, description: form.description || undefined, receipt_path: form.receipt_path || undefined };
      if (form.case_id) payload.case_id = parseInt(form.case_id, 10);
      if (editingId) await updateExpense(editingId, payload);
      else await createExpense(payload);
      setShowForm(false);
      setEditingId(null);
      setForm({ category: '', amount: '', case_id: '', expense_date: '', description: '', receipt_path: '' });
      load();
    } catch (e) {
      setError(getApiMessage(e, 'Save failed'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (expId) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      await deleteExpense(expId);
      load();
    } catch (e) {
      setError(getApiMessage(e, 'Delete failed'));
    }
  };

  const openEdit = (exp) => {
    setEditingId(exp.id);
    setForm({ category: exp.category || '', amount: exp.amount ?? '', case_id: exp.case_id || '', expense_date: exp.expense_date || '', description: exp.description || '', receipt_path: exp.receipt_path || '' });
    setShowForm(true);
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-accent" /></div>;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-primary">Expenses</h1>
        <div className="flex gap-2">
          <Link to="/billing" className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium">Billing</Link>
          <Link to="/billing/expenses-by-case" className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium">By case</Link>
          <button type="button" onClick={() => { setEditingId(null); setForm({ category: '', amount: '', case_id: '', expense_date: '', description: '', receipt_path: '' }); setShowForm(true); }} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm font-medium">Add expense</button>
        </div>
      </div>
      {error && <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>}
      <div className="mb-6">
        <label className="text-sm text-gray-600 mr-2">Year:</label>
        <input type="number" min="2020" max="2030" value={year} onChange={(e) => setYear(Number(e.target.value))} className="px-2 py-1 border border-gray-300 rounded" />
      </div>
      {monthlyReport.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-primary mb-4">Monthly report</h2>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50"><tr><th className="px-4 py-2 text-left text-xs text-gray-500 uppercase">Month</th><th className="px-4 py-2 text-right text-xs text-gray-500 uppercase">Total</th></tr></thead>
            <tbody className="divide-y divide-gray-200">
              {monthlyReport.filter((m) => m.total > 0).map((m) => (
                <tr key={m.month}><td className="px-4 py-2 text-sm">{new Date(2000, m.month - 1).toLocaleString('default', { month: 'long' })}</td><td className="px-4 py-2 text-sm text-right font-medium">Rs. {m.total.toLocaleString('en-IN')}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showForm && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-primary mb-4">{editingId ? 'Edit expense' : 'New expense'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Category *</label><input type="text" required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Amount (Rs.) *</label><input type="number" min="0" step="0.01" required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Case</label><select value={form.case_id} onChange={(e) => setForm({ ...form, case_id: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg"><option value="">-</option>{cases.map((c) => <option key={c.id} value={c.id}>{c.case_title} ({c.case_number})</option>)}</select></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Date</label><input type="date" value={form.expense_date} onChange={(e) => setForm({ ...form, expense_date: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Receipt path</label><input type="text" value={form.receipt_path} onChange={(e) => setForm({ ...form, receipt_path: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" /></div>
            <div className="flex gap-2"><button type="submit" disabled={submitting} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50">Save</button><button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button></div>
          </form>
        </div>
      )}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <h2 className="text-lg font-semibold text-primary p-4 border-b border-gray-200">All expenses</h2>
        {expenses.length === 0 ? <p className="p-6 text-gray-500">No expenses.</p> : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Case</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th></tr></thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {expenses.map((exp) => (
                <tr key={exp.id}><td className="px-6 py-4 text-sm">{exp.expense_date || '-'}</td><td className="px-6 py-4 text-sm font-medium">{exp.category}</td><td className="px-6 py-4 text-sm">Rs. {Number(exp.amount).toLocaleString('en-IN')}</td><td className="px-6 py-4 text-sm">{exp.Case ? exp.Case.case_number : '-'}</td><td className="px-6 py-4"><button type="button" onClick={() => openEdit(exp)} className="text-sm text-primary hover:underline mr-2">Edit</button><button type="button" onClick={() => handleDelete(exp.id)} className="text-sm text-red-600 hover:underline">Delete</button></td></tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
