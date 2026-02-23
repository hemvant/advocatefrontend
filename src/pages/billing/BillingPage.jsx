import React, { useState, useEffect, useCallback } from 'react';
import {
  getMySubscription,
  getMyInvoices,
  getPackages,
  getPaymentGatewayStatus,
  createOrder,
  verifyPayment
} from '../../services/billingApi';

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => resolve();
    document.body.appendChild(script);
  });
}

export default function BillingPage() {
  const [subscription, setSubscription] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [total, setTotal] = useState(0);
  const [packages, setPackages] = useState([]);
  const [gatewayConfigured, setGatewayConfigured] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [payingFor, setPayingFor] = useState(null);

  const refresh = useCallback(() => {
    getMySubscription().then(({ data }) => setSubscription(data.data)).catch(() => setSubscription(null));
    getMyInvoices({ limit: 50 })
      .then(({ data }) => {
        setInvoices(data.data || []);
        setTotal(data.total ?? 0);
      })
      .catch(() => setInvoices([]));
  }, []);

  useEffect(() => {
    refresh();
    getPackages()
      .then(({ data }) => setPackages(data.data || []))
      .catch(() => setPackages([]));
    getPaymentGatewayStatus()
      .then(({ data }) => setGatewayConfigured(data.data?.is_configured === true))
      .catch(() => setGatewayConfigured(false))
      .finally(() => setLoading(false));
  }, [refresh]);

  const handlePay = async (pkg, billingCycle) => {
    setError('');
    setPayingFor({ pkg, billingCycle });
    try {
      const { data } = await createOrder({
        package_id: pkg.id,
        billing_cycle: billingCycle
      });
      const orderId = data.data?.order_id;
      const keyId = data.data?.key_id;
      const isMock = data.data?.is_mock === true;

      if (isMock || !keyId) {
        const paymentId = 'mock_pay_' + Date.now() + '_' + Math.random().toString(36).slice(2, 10);
        await verifyPayment({ order_id: orderId, payment_id: paymentId });
        setError('');
        refresh();
        window.dispatchEvent(new CustomEvent('subscription:expired'));
        setPayingFor(null);
        return;
      }

      await loadRazorpayScript();
      if (!window.Razorpay) {
        setError('Payment gateway could not be loaded. Please try again.');
        setPayingFor(null);
        return;
      }
      const amount = data.data?.amount || 0;
      const currency = data.data?.currency || 'INR';
      const options = {
        key: keyId,
        amount,
        currency,
        order_id: orderId,
        name: 'AdvocateLearn',
        description: `${pkg.name} – ${billingCycle}`,
        handler: async (response) => {
          try {
            await verifyPayment({
              order_id: response.razorpay_order_id,
              payment_id: response.razorpay_payment_id,
              signature: response.razorpay_signature
            });
            setError('');
            refresh();
            window.dispatchEvent(new CustomEvent('subscription:expired'));
          } catch (err) {
            setError(err.response?.data?.message || 'Payment verification failed.');
          } finally {
            setPayingFor(null);
          }
        },
        modal: { ondismiss: () => setPayingFor(null) }
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not start payment.');
      setPayingFor(null);
    }
  };

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
          <p className="text-gray-500">No active subscription. Purchase a plan below.</p>
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

      {packages.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-primary mb-4">Purchase / Upgrade plan</h2>
          <p className="text-sm text-gray-500 mb-4">
            {gatewayConfigured
              ? 'Pay securely with Razorpay.'
              : 'Test mode: payment will complete without real charge (mock payment).'}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {packages.map((p) => (
              <div key={p.id} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-primary">{p.name}</h3>
                {p.description && <p className="text-sm text-gray-500 mt-1">{p.description}</p>}
                <p className="text-sm mt-2">Employees: {p.employee_limit}</p>
                <div className="mt-3 flex flex-col gap-2">
                  <button
                    type="button"
                    disabled={!!payingFor}
                    onClick={() => handlePay(p, 'MONTHLY')}
                    className="px-3 py-2 text-sm font-medium rounded-lg border border-primary text-primary hover:bg-primary/5 disabled:opacity-50"
                  >
                    {payingFor?.pkg?.id === p.id && payingFor?.billingCycle === 'MONTHLY'
                      ? 'Processing…'
                      : `Pay ₹${p.price_monthly} / month`}
                  </button>
                  <button
                    type="button"
                    disabled={!!payingFor}
                    onClick={() => handlePay(p, 'ANNUAL')}
                    className="px-3 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:opacity-90 disabled:opacity-50"
                  >
                    {payingFor?.pkg?.id === p.id && payingFor?.billingCycle === 'ANNUAL'
                      ? 'Processing…'
                      : `Pay ₹${p.price_annual} / year`}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction ID</th>
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
                  <td className="px-6 py-4 text-sm font-mono text-gray-600">{inv.transaction_id || inv.payment_id || '—'}</td>
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
