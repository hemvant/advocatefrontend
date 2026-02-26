import React, { useState, useEffect } from 'react';
import {
  listStampDutyConfig,
  createStampDutyConfig,
  updateStampDutyConfig,
  calculateStampDuty
} from '../../services/stampDutyApi';
import { useNotification } from '../../context/NotificationContext';
import { getApiMessage } from '../../services/apiHelpers';
import Button from '../../components/ui/Button';

const DOC_TYPES = ['PETITION', 'EVIDENCE', 'AGREEMENT', 'NOTICE', 'ORDER', 'OTHER'];
const RATE_TYPES = ['FIXED', 'PERCENTAGE'];
const INDIAN_STATES = ['Andhra Pradesh', 'Bihar', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal', 'Other'];

export default function StampDutyPage() {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [calcState, setCalcState] = useState('');
  const [calcDocType, setCalcDocType] = useState('OTHER');
  const [calcAmount, setCalcAmount] = useState('');
  const [calcResult, setCalcResult] = useState(null);
  const [calcLoading, setCalcLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    state: '',
    document_type: 'OTHER',
    rate_type: 'FIXED',
    rate_value: '',
    min_amount: '',
    max_amount: ''
  });
  const [saving, setSaving] = useState(false);
  const { success, error: showError } = useNotification();

  const load = () => {
    setLoading(true);
    listStampDutyConfig()
      .then(({ data }) => setConfigs(data.data || []))
      .catch((err) => {
        setError(getApiMessage(err, 'Failed to load config'));
        setConfigs([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleCalculate = async (e) => {
    e.preventDefault();
    if (!calcState.trim()) return;
    setCalcLoading(true);
    setCalcResult(null);
    try {
      const { data } = await calculateStampDuty({
        state: calcState.trim(),
        document_type: calcDocType,
        amount: calcAmount ? parseFloat(calcAmount) : undefined
      });
      setCalcResult(data);
    } catch (err) {
      showError(getApiMessage(err, 'Calculation failed'));
    } finally {
      setCalcLoading(false);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({ state: '', document_type: 'OTHER', rate_type: 'FIXED', rate_value: '', min_amount: '', max_amount: '' });
    setFormOpen(true);
  };

  const openEdit = (c) => {
    setEditingId(c.id);
    setForm({
      state: c.state || '',
      document_type: c.document_type || 'OTHER',
      rate_type: c.rate_type || 'FIXED',
      rate_value: c.rate_value != null ? String(c.rate_value) : '',
      min_amount: c.min_amount != null ? String(c.min_amount) : '',
      max_amount: c.max_amount != null ? String(c.max_amount) : ''
    });
    setFormOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        state: form.state.trim(),
        document_type: form.document_type,
        rate_type: form.rate_type,
        rate_value: parseFloat(form.rate_value) || 0,
        min_amount: form.min_amount ? parseFloat(form.min_amount) : null,
        max_amount: form.max_amount ? parseFloat(form.max_amount) : null
      };
      if (editingId) {
        await updateStampDutyConfig(editingId, payload);
        success('Config updated.');
      } else {
        await createStampDutyConfig(payload);
        success('Config created.');
      }
      setFormOpen(false);
      load();
    } catch (err) {
      showError(getApiMessage(err, 'Save failed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary mb-6">Stamp Duty Calculator</h1>
      {error && <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-primary mb-4">Calculate</h2>
          <form onSubmit={handleCalculate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
              <select
                value={calcState}
                onChange={(e) => setCalcState(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
              >
                <option value="">Select state</option>
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Document type</label>
              <select value={calcDocType} onChange={(e) => setCalcDocType(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                {DOC_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (for percentage)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={calcAmount}
                onChange={(e) => setCalcAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Leave blank for fixed rate"
              />
            </div>
            <Button type="submit" loading={calcLoading}>Calculate</Button>
          </form>
          {calcResult && (
            <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
              <p className="text-sm text-gray-600">Stamp duty</p>
              <p className="text-2xl font-bold text-primary">₹ {Number(calcResult.stampDuty).toLocaleString('en-IN')}</p>
              {calcResult.config && (
                <p className="text-xs text-gray-500 mt-1">
                  Rate: {calcResult.config.rate_type} {calcResult.config.rate_value}
                  {calcResult.config.rate_type === 'PERCENTAGE' ? '%' : ''}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-primary">State-wise config</h2>
            <Button onClick={openCreate}>Add config</Button>
          </div>
          {loading ? (
            <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent" /></div>
          ) : configs.length === 0 ? (
            <p className="text-gray-500 text-sm">No config. Add state-wise rates to use the calculator.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">State</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Doc type</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {configs.map((c) => (
                    <tr key={c.id}>
                      <td className="px-4 py-2 text-sm">{c.state}</td>
                      <td className="px-4 py-2 text-sm">{c.document_type}</td>
                      <td className="px-4 py-2 text-sm">{c.rate_type} {c.rate_value}{c.rate_type === 'PERCENTAGE' ? '%' : ''}</td>
                      <td className="px-4 py-2 text-right">
                        <button type="button" onClick={() => openEdit(c)} className="text-primary hover:underline text-sm">Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setFormOpen(false)}>
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-primary mb-4">{editingId ? 'Edit config' : 'Add config'}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                <input
                  type="text"
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="e.g. Maharashtra"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Document type</label>
                <select value={form.document_type} onChange={(e) => setForm({ ...form, document_type: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  {DOC_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rate type</label>
                <select value={form.rate_type} onChange={(e) => setForm({ ...form, rate_type: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  {RATE_TYPES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rate value *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.rate_value}
                  onChange={(e) => setForm({ ...form, rate_value: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min amount</label>
                  <input type="number" min="0" step="0.01" value={form.min_amount} onChange={(e) => setForm({ ...form, min_amount: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max amount</label>
                  <input type="number" min="0" step="0.01" value={form.max_amount} onChange={(e) => setForm({ ...form, max_amount: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <Button type="button" variant="ghost" onClick={() => setFormOpen(false)}>Cancel</Button>
                <Button type="submit" loading={saving}>{editingId ? 'Update' : 'Create'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
