import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  getMySubscription,
  getMyInvoices,
  getPackages,
  getPaymentGatewayStatus,
  createOrder,
  verifyPayment,
  sendInvoiceReminderWhatsApp,
  createAdvocateInvoice,
  getBillingDashboardStats
} from '../../services/billingApi';
import { listCases } from '../../services/caseApi';

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
  const [whatsappSendingId, setWhatsappSendingId] = useState(null);
  const [showFeeForm, setShowFeeForm] = useState(false);
  const [feeForm, setFeeForm] = useState({
    professional_fee: '', filing_fee: '', clerk_fee: '', court_fee: '', misc_expense: '',
    advance_received: '', gst_enabled: false, gst_percentage: '18', case_id: '', due_date: ''
  });
  const [feeSubmitting, setFeeSubmitting] = useState(false);
  const [caseList, setCaseList] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [expandedInvId, setExpandedInvId] = useState(null);

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
      .catch(() => setGatewayConfigured(false));
    getBillingDashboardStats()
      .then(({ data }) => setDashboardStats(data.data))
      .catch(() => setDashboardStats(null));
    listCases({ limit: 200 })
      .then(({ data }) => setCaseList(data.data || []))
      .catch(() => setCaseList([]))
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

  const handleSendInvoiceWhatsApp = async (invoiceId) => {
    setError('');
    setWhatsappSendingId(invoiceId);
    try {
      await sendInvoiceReminderWhatsApp(invoiceId);
    } catch (err) {
      setError(err.response?.data?.message || 'Send WhatsApp failed');
    } finally {
      setWhatsappSendingId(null);
    }
  };

  const handleCreateFeeInvoice = async (e) => {
    e.preventDefault();
    setFeeSubmitting(true);
    setError('');
    try {
      const payload = {
        professional_fee: Number(feeForm.professional_fee) || 0,
        filing_fee: Number(feeForm.filing_fee) || 0,
        clerk_fee: Number(feeForm.clerk_fee) || 0,
        court_fee: Number(feeForm.court_fee) || 0,
        misc_expense: Number(feeForm.misc_expense) || 0,
        advance_received: Number(feeForm.advance_received) || 0,
        gst_enabled: feeForm.gst_enabled,
        gst_percentage: Number(feeForm.gst_percentage) || 0,
        due_date: feeForm.due_date || null
      };
      if (feeForm.case_id) payload.case_id = parseInt(feeForm.case_id, 10);
      await createAdvocateInvoice(payload);
      setShowFeeForm(false);
      setFeeForm({ professional_fee: '', filing_fee: '', clerk_fee: '', court_fee: '', misc_expense: '', advance_received: '', gst_enabled: false, gst_percentage: '18', case_id: '', due_date: '' });
      refresh();
    } catch (err) {
      setError(err.response?.data?.message || 'Create invoice failed');
    } finally {
      setFeeSubmitting(false);
    }
  };

  const paymentStatusBadge = (inv) => {
    const status = inv.payment_status_display || (inv.status === 'PAID' ? 'PAID' : 'UNPAID');
    const cls = status === 'PAID' ? 'bg-green-100 text-green-800' : status === 'PARTIAL' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800';
    return <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded ${cls}`}>{status}</span>;
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
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-primary">Billing</h1>
        <div className="flex gap-2">
          <Link to="/billing/expenses" className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium">Case-wise expenses</Link>
          <button type="button" onClick={() => setShowFeeForm(true)} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm font-medium">Create fee invoice</button>
        </div>
      </div>
      {error && <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>}

      {dashboardStats != null && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
            <h3 className="text-sm font-medium text-gray-500 uppercase">Total pending payments</h3>
            <p className="text-2xl font-bold text-primary mt-1">₹{(dashboardStats.total_pending_payments ?? 0).toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
            <h3 className="text-sm font-medium text-gray-500 uppercase">This month revenue</h3>
            <p className="text-2xl font-bold text-green-600 mt-1">₹{(dashboardStats.this_month_revenue ?? 0).toLocaleString('en-IN')}</p>
          </div>
        </div>
      )}

      {showFeeForm && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-primary mb-4">New fee invoice (Indian advocate)</h2>
          <form onSubmit={handleCreateFeeInvoice} className="space-y-4 max-w-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Professional fee (₹)</label>
                <input type="number" min="0" step="0.01" value={feeForm.professional_fee} onChange={(e) => setFeeForm({ ...feeForm, professional_fee: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Filing fee (₹)</label>
                <input type="number" min="0" step="0.01" value={feeForm.filing_fee} onChange={(e) => setFeeForm({ ...feeForm, filing_fee: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Clerk fee (₹)</label>
                <input type="number" min="0" step="0.01" value={feeForm.clerk_fee} onChange={(e) => setFeeForm({ ...feeForm, clerk_fee: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Court fee (₹)</label>
                <input type="number" min="0" step="0.01" value={feeForm.court_fee} onChange={(e) => setFeeForm({ ...feeForm, court_fee: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Misc expense (₹)</label>
                <input type="number" min="0" step="0.01" value={feeForm.misc_expense} onChange={(e) => setFeeForm({ ...feeForm, misc_expense: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Advance received (₹)</label>
                <input type="number" min="0" step="0.01" value={feeForm.advance_received} onChange={(e) => setFeeForm({ ...feeForm, advance_received: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={feeForm.gst_enabled} onChange={(e) => setFeeForm({ ...feeForm, gst_enabled: e.target.checked })} className="rounded border-gray-300 text-primary" />
                <span className="text-sm font-medium">GST enabled</span>
              </label>
              {feeForm.gst_enabled && (
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">GST %</label>
                  <input type="number" min="0" max="100" step="0.01" value={feeForm.gst_percentage} onChange={(e) => setFeeForm({ ...feeForm, gst_percentage: e.target.value })} className="w-20 px-2 py-1 border border-gray-300 rounded" />
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Case (optional)</label>
                <select value={feeForm.case_id} onChange={(e) => setFeeForm({ ...feeForm, case_id: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option value="">—</option>
                  {caseList.map((c) => <option key={c.id} value={c.id}>{c.case_title} ({c.case_number})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due date</label>
                <input type="date" value={feeForm.due_date} onChange={(e) => setFeeForm({ ...feeForm, due_date: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={feeSubmitting} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50">Create invoice</button>
              <button type="button" onClick={() => setShowFeeForm(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
            </div>
          </form>
        </div>
      )}

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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total / Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Case</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paid at</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoices.map((inv) => (
                <React.Fragment key={inv.id}>
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium">₹{(inv.total_amount ?? inv.amount ?? 0).toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4 text-sm">{inv.Case ? `${inv.Case.case_title || ''} (${inv.Case.case_number || ''})` : '—'}</td>
                    <td className="px-6 py-4 text-sm">{inv.period_start && inv.period_end ? `${inv.period_start} – ${inv.period_end}` : '—'}</td>
                    <td className="px-6 py-4 text-sm">{inv.due_date ? new Date(inv.due_date).toLocaleDateString() : '—'}</td>
                    <td className="px-6 py-4">{paymentStatusBadge(inv)}</td>
                  <td className="px-6 py-4 text-sm font-mono text-gray-600">{inv.transaction_id || inv.payment_id || '—'}</td>
                  <td className="px-6 py-4 text-sm">{inv.paid_at ? new Date(inv.paid_at).toLocaleDateString() : '—'}</td>
                  <td className="px-6 py-4">
                    <button
                      type="button"
                      onClick={() => setExpandedInvId(expandedInvId === inv.id ? null : inv.id)}
                      className="text-sm text-primary hover:underline mr-2"
                    >
                      {expandedInvId === inv.id ? 'Hide' : 'Fee breakdown'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendInvoiceWhatsApp(inv.id)}
                      disabled={whatsappSendingId === inv.id}
                      className="text-sm text-green-600 hover:text-green-800 font-medium disabled:opacity-50"
                    >
                      {whatsappSendingId === inv.id ? 'Sending…' : 'Send WhatsApp'}
                    </button>
                  </td>
                </tr>
                {expandedInvId === inv.id && (inv.total_amount != null || inv.professional_fee != null) && (
                  <tr className="bg-gray-50">
                    <td colSpan={7} className="px-6 py-4 text-sm">
                      <div className="max-w-md space-y-1 font-mono">
                        {Number(inv.professional_fee) > 0 && <div>Professional fee: ₹{Number(inv.professional_fee).toLocaleString('en-IN')}</div>}
                        {Number(inv.filing_fee) > 0 && <div>Filing fee: ₹{Number(inv.filing_fee).toLocaleString('en-IN')}</div>}
                        {Number(inv.clerk_fee) > 0 && <div>Clerk fee: ₹{Number(inv.clerk_fee).toLocaleString('en-IN')}</div>}
                        {Number(inv.court_fee) > 0 && <div>Court fee: ₹{Number(inv.court_fee).toLocaleString('en-IN')}</div>}
                        {Number(inv.misc_expense) > 0 && <div>Misc expense: ₹{Number(inv.misc_expense).toLocaleString('en-IN')}</div>}
                        {inv.gst_enabled && Number(inv.gst_amount) > 0 && <div>GST ({inv.gst_percentage}%): ₹{Number(inv.gst_amount).toLocaleString('en-IN')}</div>}
                        <div className="font-semibold pt-1">Total: ₹{(inv.total_amount ?? inv.amount ?? 0).toLocaleString('en-IN')}</div>
                        {Number(inv.advance_received) > 0 && <div>Advance received: ₹{Number(inv.advance_received).toLocaleString('en-IN')} · Balance due: ₹{Number(inv.balance_due ?? 0).toLocaleString('en-IN')}</div>}
                      </div>
                    </td>
                  </tr>
                )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
