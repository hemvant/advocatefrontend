import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getInvoiceById, getInvoicePdf, getInvoiceUpiPayload, recordPayment, sendInvoiceReminder } from '../../services/billingApi';
import { getApiMessage } from '../../services/apiHelpers';

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [upiPayload, setUpiPayload] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ amount: '', payment_date: '', transaction_id: '', upi_reference_id: '', method: 'UPI', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [reminderSending, setReminderSending] = useState(null);

  useEffect(() => {
    getInvoiceById(id).then(({ data }) => setInvoice(data.data)).catch(() => setInvoice(null)).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (invoice && (invoice.status === 'PENDING' || invoice.status === 'PARTIAL')) {
      getInvoiceUpiPayload(id).then(({ data }) => setUpiPayload(data.data)).catch(() => setUpiPayload(null));
    } else setUpiPayload(null);
  }, [id, invoice]);

  const handleDownloadPdf = async () => {
    try {
      const { data } = await getInvoicePdf(id);
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'invoice-' + (invoice?.invoice_number || id) + '.pdf';
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(getApiMessage(e, 'PDF download failed'));
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await recordPayment(id, {
        amount: Number(paymentForm.amount),
        payment_date: paymentForm.payment_date || new Date().toISOString().slice(0, 10),
        transaction_id: paymentForm.transaction_id || undefined,
        upi_reference_id: paymentForm.upi_reference_id || undefined,
        method: paymentForm.method,
        notes: paymentForm.notes || undefined
      });
      const { data } = await getInvoiceById(id);
      setInvoice(data.data);
      setShowPaymentForm(false);
      setPaymentForm({ amount: '', payment_date: '', transaction_id: '', upi_reference_id: '', method: 'UPI', notes: '' });
    } catch (e) {
      setError(getApiMessage(e, 'Record payment failed'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendReminder = async (channel) => {
    setReminderSending(channel);
    setError('');
    try {
      await sendInvoiceReminder(id, channel);
    } catch (e) {
      setError(getApiMessage(e, 'Reminder failed'));
    } finally {
      setReminderSending(null);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-accent" /></div>;
  if (!invoice) return <div className="p-6 text-gray-500">Invoice not found. <Link to="/billing" className="text-primary underline">Back to Billing</Link></div>;

  const status = invoice.payment_status_display || invoice.status;
  const balanceDue = Number(invoice.balance_due) || 0;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link to="/billing" className="text-sm text-primary hover:underline mb-2 inline-block">Back to Billing</Link>
          <h1 className="text-2xl font-bold text-primary">Invoice {invoice.invoice_number || '#' + invoice.id}</h1>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={handleDownloadPdf} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium">Download PDF</button>
          {(invoice.status === 'PENDING' || invoice.status === 'PARTIAL') && (
            <button type="button" onClick={() => setShowPaymentForm(true)} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm font-medium">Record payment</button>
          )}
        </div>
      </div>
      {error && <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><dt className="text-sm text-gray-500">Status</dt><dd><span className={'inline-flex px-2 py-0.5 text-xs font-medium rounded ' + (status === 'PAID' ? 'bg-green-100 text-green-800' : status === 'PARTIAL' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800')}>{status}</span></dd></div>
          <div><dt className="text-sm text-gray-500">Total</dt><dd className="font-medium">₹ {(invoice.total_amount ?? invoice.amount ?? 0).toLocaleString('en-IN')}</dd></div>
          <div><dt className="text-sm text-gray-500">Balance due</dt><dd className="font-medium">₹ {balanceDue.toLocaleString('en-IN')}</dd></div>
          <div><dt className="text-sm text-gray-500">Due date</dt><dd>{invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : '-'}</dd></div>
          {invoice.Case && <div><dt className="text-sm text-gray-500">Case</dt><dd>{invoice.Case.case_title} ({invoice.Case.case_number})</dd></div>}
        </dl>
      </div>
      {upiPayload && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-primary mb-2">UPI payment</h2>
          {upiPayload.upi_id_set ? <p className="text-sm text-gray-600 mb-2">Amount: ₹ {upiPayload.amount.toFixed(2)}</p> : <p className="text-sm text-amber-600">Set organization UPI ID in settings to generate QR.</p>}
          {upiPayload.upi_string && <div className="mt-2 p-3 bg-gray-50 rounded font-mono text-xs break-all">{upiPayload.upi_string}</div>}
        </div>
      )}
      {invoice.Payments && invoice.Payments.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-primary mb-4">Payments</h2>
          <table className="min-w-full divide-y divide-gray-200">
            <thead><tr><th className="text-left text-xs text-gray-500 uppercase">Date</th><th className="text-left text-xs text-gray-500 uppercase">Amount</th><th className="text-left text-xs text-gray-500 uppercase">Method</th><th className="text-left text-xs text-gray-500 uppercase">Transaction / UPI ref</th></tr></thead>
            <tbody className="divide-y divide-gray-200">
              {invoice.Payments.map((p) => <tr key={p.id}><td className="py-2 text-sm">{p.payment_date || '-'}</td><td className="py-2 font-medium">₹ {Number(p.amount).toLocaleString('en-IN')}</td><td className="py-2 text-sm">{p.method || '-'}</td><td className="py-2 text-sm font-mono">{p.transaction_id || p.upi_reference_id || '-'}</td></tr>)}
            </tbody>
          </table>
        </div>
      )}
      {(invoice.status === 'PENDING' || invoice.status === 'PARTIAL') && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-primary mb-2">Outstanding reminders</h2>
          <div className="flex gap-2">
            <button type="button" onClick={() => handleSendReminder('whatsapp')} disabled={!!reminderSending} className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">{reminderSending === 'whatsapp' ? 'Sending...' : 'WhatsApp'}</button>
            <button type="button" onClick={() => handleSendReminder('sms')} disabled={!!reminderSending} className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">{reminderSending === 'sms' ? 'Sending...' : 'SMS'}</button>
            <button type="button" onClick={() => handleSendReminder('email')} disabled={!!reminderSending} className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">{reminderSending === 'email' ? 'Sending...' : 'Email'}</button>
          </div>
        </div>
      )}
      {showPaymentForm && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-primary mb-4">Record payment</h2>
          <form onSubmit={handleRecordPayment} className="space-y-4 max-w-md">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹) *</label><input type="number" min="0.01" step="0.01" required value={paymentForm.amount} onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Payment date</label><input type="date" value={paymentForm.payment_date} onChange={(e) => setPaymentForm({ ...paymentForm, payment_date: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Method</label><select value={paymentForm.method} onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg"><option value="UPI">UPI</option><option value="BANK">Bank</option><option value="CASH">Cash</option><option value="CHEQUE">Cheque</option><option value="CARD">Card</option><option value="OTHER">Other</option></select></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Transaction ID</label><input type="text" value={paymentForm.transaction_id} onChange={(e) => setPaymentForm({ ...paymentForm, transaction_id: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">UPI reference ID</label><input type="text" value={paymentForm.upi_reference_id} onChange={(e) => setPaymentForm({ ...paymentForm, upi_reference_id: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Notes</label><input type="text" value={paymentForm.notes} onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" /></div>
            <div className="flex gap-2"><button type="submit" disabled={submitting} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50">Save</button><button type="button" onClick={() => setShowPaymentForm(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button></div>
          </form>
        </div>
      )}
    </div>
  );
}
