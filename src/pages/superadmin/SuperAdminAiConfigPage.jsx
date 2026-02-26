import React, { useState, useEffect } from 'react';
import {
  getAiConfig,
  updateAiConfig,
  getAiUsage,
  getAiUsageCost
} from '../../services/superAdminApi';
import { getApiMessage } from '../../services/apiHelpers';

export default function SuperAdminAiConfigPage() {
  const [config, setConfig] = useState(null);
  const [usage, setUsage] = useState(null);
  const [cost, setCost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    provider: 'sarvam',
    api_key: '',
    base_url: '',
    rate_limit_per_user_per_min: 10,
    rate_limit_org_daily: 500,
    is_active: false
  });

  const load = () => {
    setLoading(true);
    Promise.all([
      getAiConfig(),
      getAiUsage({ from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), to: new Date().toISOString().slice(0, 10) }),
      getAiUsageCost({ from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), to: new Date().toISOString().slice(0, 10) })
    ])
      .then(([c, u, co]) => {
        setConfig(c.data.data);
        setUsage(u.data.data);
        setCost(co.data.data);
        if (c.data.data) {
          setForm((f) => ({
            ...f,
            provider: c.data.data.provider || 'sarvam',
            base_url: c.data.data.base_url || '',
            rate_limit_per_user_per_min: c.data.data.rate_limit_per_user_per_min ?? 10,
            rate_limit_org_daily: c.data.data.rate_limit_org_daily ?? 500,
            is_active: !!c.data.data.is_active
          }));
        }
      })
      .catch((e) => setError(getApiMessage(e, 'Failed to load')))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const payload = {
      provider: form.provider,
      base_url: form.base_url || undefined,
      rate_limit_per_user_per_min: form.rate_limit_per_user_per_min,
      rate_limit_org_daily: form.rate_limit_org_daily,
      is_active: form.is_active
    };
    if (form.api_key) payload.api_key = form.api_key;
    try {
      await updateAiConfig(payload);
      setForm((f) => ({ ...f, api_key: '' }));
      load();
    } catch (e) {
      setError(getApiMessage(e, 'Save failed'));
    } finally {
      setSaving(false);
    }
  };

  if (loading && !config) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-accent" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-2xl font-bold text-primary mb-6">AI Configuration</h1>
      {error && <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>}

      {usage && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium text-gray-500 uppercase">Total tokens (period)</p>
            <p className="text-2xl font-bold text-primary mt-1">{Number(usage.total_tokens || 0).toLocaleString()}</p>
            {usage.by_organization && usage.by_organization.length > 0 && (
              <ul className="mt-2 text-sm text-gray-600 space-y-1">
                {usage.by_organization.slice(0, 5).map((o) => (
                  <li key={o.organization_id}>{o.organization_name}: {Number(o.tokens_used || 0).toLocaleString()} tokens</li>
                ))}
              </ul>
            )}
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium text-gray-500 uppercase">Estimated cost (period)</p>
            <p className="text-2xl font-bold text-primary mt-1">${Number(cost?.estimated_cost || 0).toFixed(4)}</p>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-primary mb-4">Provider & limits</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
            <select
              value={form.provider}
              onChange={(e) => setForm({ ...form, provider: e.target.value })}
              className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="sarvam">Sarvam</option>
              <option value="openai">OpenAI</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">API key (leave blank to keep current)</label>
            <input
              type="password"
              value={form.api_key}
              onChange={(e) => setForm({ ...form, api_key: e.target.value })}
              className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg"
              placeholder={config?.api_key_masked ? '••••••••' : 'Enter API key'}
            />
            {config?.api_key_masked && <p className="text-xs text-gray-500 mt-1">Current: {config.api_key_masked}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Base URL (optional)</label>
            <input
              type="text"
              value={form.base_url}
              onChange={(e) => setForm({ ...form, base_url: e.target.value })}
              className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Override default API endpoint"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rate limit (per user per minute)</label>
              <input
                type="number"
                min={1}
                value={form.rate_limit_per_user_per_min}
                onChange={(e) => setForm({ ...form, rate_limit_per_user_per_min: Number(e.target.value) || 10 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Org daily request limit</label>
              <input
                type="number"
                min={1}
                value={form.rate_limit_org_daily}
                onChange={(e) => setForm({ ...form, rate_limit_org_daily: Number(e.target.value) || 500 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              className="rounded border-gray-300 text-primary"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-gray-700">AI enabled (provider active)</label>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </form>
      </div>
      <p className="mt-4 text-sm text-gray-500">Configure AI features per plan under Packages (ai_monthly_token_limit, ai_features).</p>
    </div>
  );
}
