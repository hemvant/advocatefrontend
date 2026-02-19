import React, { useState, useEffect } from 'react';
import { listTags } from '../../services/clientApi';
import { getEmployees } from '../../services/orgApi';
import { useOrgAuth } from '../../context/OrgAuthContext';

const CATEGORIES = ['INDIVIDUAL', 'CORPORATE', 'GOVERNMENT', 'VIP'];
const STATUSES = ['ACTIVE', 'CLOSED', 'BLACKLISTED'];

const defaultClient = {
  name: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  state: '',
  category: 'INDIVIDUAL',
  status: 'ACTIVE',
  notes: '',
  assigned_to: '',
  tag_ids: [],
  opponents: []
};

export default function ClientForm({ client, onSubmit, loading }) {
  const { isOrgAdmin } = useOrgAuth();
  const [form, setForm] = useState(client ? { ...defaultClient, ...client, tag_ids: (client.Tags || []).map((t) => t.id), opponents: (client.ClientOpponents || []).map((o) => ({ name: o.name, phone: o.phone, address: o.address, notes: o.notes })) } : { ...defaultClient });
  const [tags, setTags] = useState([]);
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    listTags().then(({ data }) => setTags(data.data || [])).catch(() => {});
    if (isOrgAdmin) getEmployees().then(({ data }) => setEmployees(data.data || [])).catch(() => {});
  }, [isOrgAdmin]);

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const addOpponent = () => {
    setForm((f) => ({ ...f, opponents: [...f.opponents, { name: '', phone: '', address: '', notes: '' }] }));
  };

  const updateOpponent = (index, key, value) => {
    setForm((f) => {
      const next = [...f.opponents];
      next[index] = { ...next[index], [key]: value };
      return { ...f, opponents: next };
    });
  };

  const removeOpponent = (index) => {
    setForm((f) => ({ ...f, opponents: f.opponents.filter((_, i) => i !== index) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      phone: form.phone || null,
      email: form.email || null,
      address: form.address || null,
      city: form.city || null,
      state: form.state || null,
      category: form.category,
      status: form.status,
      notes: form.notes || null,
      assigned_to: form.assigned_to ? parseInt(form.assigned_to, 10) : null,
      tag_ids: form.tag_ids || [],
      opponents: form.opponents.filter((o) => o.name || o.phone || o.address || o.notes)
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input
            type="text"
            value={form.phone}
            onChange={(e) => update('phone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <input
            type="text"
            value={form.address}
            onChange={(e) => update('address', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
          <input
            type="text"
            value={form.city}
            onChange={(e) => update('city', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
          <input
            type="text"
            value={form.state}
            onChange={(e) => update('state', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            value={form.category}
            onChange={(e) => update('category', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
          >
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={form.status}
            onChange={(e) => update('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
          >
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        {isOrgAdmin && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assign to</label>
            <select
              value={form.assigned_to}
              onChange={(e) => update('assigned_to', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
            >
              <option value="">—</option>
              {employees.map((emp) => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
            </select>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea
          value={form.notes}
          onChange={(e) => update('notes', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <label key={tag.id} className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={(form.tag_ids || []).includes(tag.id)}
                onChange={(e) => {
                  const ids = e.target.checked ? [...(form.tag_ids || []), tag.id] : (form.tag_ids || []).filter((id) => id !== tag.id);
                  update('tag_ids', ids);
                }}
              />
              <span>{tag.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">Opponents</label>
          <button type="button" onClick={addOpponent} className="text-sm text-accent hover:underline">+ Add</button>
        </div>
        {form.opponents.map((opp, i) => (
          <div key={i} className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2 p-3 border border-gray-200 rounded-lg">
            <input placeholder="Name" value={opp.name} onChange={(e) => updateOpponent(i, 'name', e.target.value)} className="px-2 py-1 border rounded" />
            <input placeholder="Phone" value={opp.phone} onChange={(e) => updateOpponent(i, 'phone', e.target.value)} className="px-2 py-1 border rounded" />
            <input placeholder="Address" value={opp.address} onChange={(e) => updateOpponent(i, 'address', e.target.value)} className="px-2 py-1 border rounded md:col-span-2" />
            <div className="md:col-span-3">
              <input placeholder="Notes" value={opp.notes} onChange={(e) => updateOpponent(i, 'notes', e.target.value)} className="w-full px-2 py-1 border rounded" />
            </div>
            <button type="button" onClick={() => removeOpponent(i)} className="text-red-600 text-sm">Remove</button>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={loading} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50">
          {loading ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  );
}
