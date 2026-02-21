import React, { useState, useEffect } from 'react';
import { getMySubscription, getMyInvoices } from '../../services/billingApi';

export default function BillingPage() {
  const [subscription, setSubscription] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getMySubscription()
      .then(({ data }) => setSubscription(data.data))
      .catch(() => setSubscription(null));
    getMyInvoices({ limit: 50 })
      .then(({ data }) => {
        setInvoices(data.data || []);
        setTotal(data.total ?? 0);
      })
      .catch(() => setInvoices([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading && !subscription) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-accent" />
      </div>
    );
  }

  const sub = subscription;
  const pkg = sub?.Package;

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary mb-6">Billing</h1>
      {error && <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>}

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-primary mb-4">Current plan</h2>
        {!sub ? (
          <p className="text-gray-500">No active subscription. Contact your administrator.</p>
        ) : (
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><dt className="text-sm text-gray-500">Plan</dt><dd className="font-medium">{sub.plan}</dd></div>
            <div><dt className="text-sm text-gray-500">Billing cycle</dt><dd className="font-medium">{sub.billing_cycle || '—'}</dd></div>
            <div><dt className="text-sm text-gray-500">Started</dt><dd className="font-medium">{sub.started_at ? new Date(sub.started_at).toLocaleDateString() : '—'}</dd></div>
            <div><dt className="text-sm text-gray-500">Expires</dt><dd className="font-medium">{sub.expires_at ? new Date(sub.expires_at).toLocaleDateString() : '—'}</dd></div>
            {pkg && (
              <>
                <div><dt className="text-sm text-gray-500">Employee limit</dt><dd className="font-medium">{pkg.employee_limit}</dd></div>
                <div><dt className="text-sm text-gray-500">Price (monthly)</dt><dd className="font-medium">{pkg.price_monthly != null ? `${pkg.price_monthly}` : '—'}</dd></div>
                <div><dt className="text-sm text-gray-500">Price (annual)</dt><dd className="font-medium">{pkg.price_annual != null ? `${pkg.price_annual}` : '—'}</dd></div>
              </>
            )}
          </dl>
        )}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <h2 className="text-lg font-semibold text-primary p-4 border-b border-gray-200">Invoices</h2>
        {invoices.length === 0 ? (
          <p className="p-6 text-gray-500">No invoices yet.</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paid at</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoices.map((inv) => (
                <tr key={inv.id}>
                  <td className="px-6 py-4 text-sm">{inv.currency} {inv.amount}</td>
                  <td className="px-6 py-4 text-sm">{inv.period_start && inv.period_end ? `${inv.period_start} – ${inv.period_end}` : '—'}</td>
                  <td className="px-6 py-4 text-sm">{inv.due_date ? new Date(inv.due_date).toLocaleDateString() : '—'}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded ${inv.status === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">{inv.paid_at ? new Date(inv.paid_at).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
