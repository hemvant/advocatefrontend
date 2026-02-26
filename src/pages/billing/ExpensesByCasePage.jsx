import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getExpensesByCase } from '../../services/billingApi';
import { getApiMessage } from '../../services/apiHelpers';

export default function ExpensesByCasePage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getExpensesByCase()
      .then(({ data: res }) => setData(res.data || []))
      .catch((err) => setError(getApiMessage(err, 'Failed to load')))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-accent" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-primary">Case-wise expense tracking</h1>
        <Link to="/billing" className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium">Back to Billing</Link>
      </div>
      {error && <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>}

      {data.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center text-gray-500">
          <p>No case-linked invoices yet.</p>
          <p className="text-sm mt-2">Create a fee invoice and link it to a case from the Billing page.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Case</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Invoices</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total invoiced</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total paid</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Balance due</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((row) => (
                <tr key={row.case_id}>
                  <td className="px-6 py-4">
                    <span className="font-medium text-primary">{row.case_title || '—'}</span>
                    {row.case_number && <span className="text-gray-500 text-sm ml-1">({row.case_number})</span>}
                  </td>
                  <td className="px-6 py-4 text-right text-sm">{row.invoice_count}</td>
                  <td className="px-6 py-4 text-right font-medium">₹{Number(row.total_invoiced).toLocaleString('en-IN')}</td>
                  <td className="px-6 py-4 text-right text-green-600">₹{Number(row.total_paid).toLocaleString('en-IN')}</td>
                  <td className="px-6 py-4 text-right text-amber-600 font-medium">₹{Number(row.balance_due).toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
