import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getGstSummary } from '../../services/billingApi';
import { getApiMessage } from '../../services/apiHelpers';

export default function GstSummaryPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  useEffect(() => {
    const params = {};
    if (fromDate) params.from_date = fromDate;
    if (toDate) params.to_date = toDate;
    getGstSummary(params).then(({ data: res }) => setData(res.data)).catch((e) => setError(getApiMessage(e, 'Load failed'))).finally(() => setLoading(false));
  }, [fromDate, toDate]);

  if (loading && !data) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-accent" /></div>;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-primary">GST summary</h1>
        <Link to="/billing" className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium">Billing</Link>
      </div>
      {error && <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>}
      <div className="flex flex-wrap gap-4 mb-6">
        <div><label className="text-sm text-gray-600 mr-2">From</label><input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg" /></div>
        <div><label className="text-sm text-gray-600 mr-2">To</label><input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg" /></div>
      </div>
      {data && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4"><h3 className="text-sm font-medium text-gray-500 uppercase">CGST total</h3><p className="text-xl font-bold text-primary mt-1">Rs. {(data.cgst_total ?? 0).toLocaleString('en-IN')}</p></div>
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4"><h3 className="text-sm font-medium text-gray-500 uppercase">SGST total</h3><p className="text-xl font-bold text-primary mt-1">Rs. {(data.sgst_total ?? 0).toLocaleString('en-IN')}</p></div>
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4"><h3 className="text-sm font-medium text-gray-500 uppercase">IGST total</h3><p className="text-xl font-bold text-primary mt-1">Rs. {(data.igst_total ?? 0).toLocaleString('en-IN')}</p></div>
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4"><h3 className="text-sm font-medium text-gray-500 uppercase">Total taxable</h3><p className="text-xl font-bold text-primary mt-1">Rs. {(data.total_taxable ?? 0).toLocaleString('en-IN')}</p></div>
          </div>
          {data.invoices && data.invoices.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <h2 className="text-lg font-semibold text-primary p-4 border-b border-gray-200">Invoices (GST)</h2>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th><th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">GST</th><th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th></tr></thead>
                <tbody className="divide-y divide-gray-200">
                  {data.invoices.map((inv) => <tr key={inv.id}><td className="px-6 py-4 text-sm">{inv.invoice_number || '#' + inv.id}</td><td className="px-6 py-4 text-sm">{inv.created_at ? new Date(inv.created_at).toLocaleDateString() : '-'}</td><td className="px-6 py-4 text-sm text-right">Rs. {(Number(inv.gst_amount) || 0).toLocaleString('en-IN')}</td><td className="px-6 py-4 text-sm text-right font-medium">Rs. {(Number(inv.total_amount) || 0).toLocaleString('en-IN')}</td></tr>)}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
      {data && (!data.invoices || data.invoices.length === 0) && <p className="text-gray-500">No GST invoices in this period.</p>}
    </div>
  );
}
