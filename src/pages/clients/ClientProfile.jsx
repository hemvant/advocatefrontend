import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getClient, addOpponent, removeOpponent, assignTagToClient, removeTagFromClient } from '../../services/clientApi';
import { listTags } from '../../services/clientApi';
import { useOrgAuth } from '../../context/OrgAuthContext';

export default function ClientProfile() {
  const { id } = useParams();
  const { isOrgAdmin } = useOrgAuth();
  const [client, setClient] = useState(null);
  const [error, setError] = useState('');
  const [tags, setTags] = useState([]);
  const [opponentForm, setOpponentForm] = useState({ name: '', phone: '', address: '', notes: '' });
  const [tagSelect, setTagSelect] = useState('');

  const load = () => {
    getClient(id)
      .then(({ data }) => setClient(data.data))
      .catch(() => setError('Client not found'));
  };

  useEffect(() => {
    load();
    listTags().then(({ data }) => setTags(data.data || [])).catch(() => {});
  }, [id]);

  const handleAddOpponent = async (e) => {
    e.preventDefault();
    if (!opponentForm.name && !opponentForm.phone) return;
    try {
      await addOpponent(id, opponentForm);
      setOpponentForm({ name: '', phone: '', address: '', notes: '' });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add opponent');
    }
  };

  const handleRemoveOpponent = async (opponentId) => {
    try {
      await removeOpponent(id, opponentId);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove');
    }
  };

  const handleAddTag = async (e) => {
    e.preventDefault();
    if (!tagSelect) return;
    try {
      await assignTagToClient(id, parseInt(tagSelect, 10));
      setTagSelect('');
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add tag');
    }
  };

  const handleRemoveTag = async (tagId) => {
    try {
      await removeTagFromClient(id, tagId);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove tag');
    }
  };

  if (error && !client) return <div className="p-4 text-red-600">{error}</div>;
  if (!client) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-accent" /></div>;

  const opponents = client.ClientOpponents || [];
  const clientTags = client.Tags || [];

  return (
    <div className="max-w-4xl">
      <div className="flex justify-between items-start mb-6">
        <h1 className="text-2xl font-bold text-primary">{client.name}</h1>
        <Link to={`/clients/${id}/edit`} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">Edit</Link>
      </div>

      {error && <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>}

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <span className={`px-2 py-0.5 text-xs rounded ${client.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : client.status === 'CLOSED' ? 'bg-gray-100 text-gray-800' : 'bg-red-100 text-red-800'}`}>
            {client.status}
          </span>
          <span className="ml-2 px-2 py-0.5 text-xs rounded bg-primary/10 text-primary">{client.category}</span>
        </div>
        <dl className="px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><dt className="text-sm text-gray-500">Phone</dt><dd className="font-medium">{client.phone || '—'}</dd></div>
          <div><dt className="text-sm text-gray-500">Email</dt><dd className="font-medium">{client.email || '—'}</dd></div>
          <div className="md:col-span-2"><dt className="text-sm text-gray-500">Address</dt><dd className="font-medium">{client.address || '—'}</dd></div>
          <div><dt className="text-sm text-gray-500">City</dt><dd className="font-medium">{client.city || '—'}</dd></div>
          <div><dt className="text-sm text-gray-500">State</dt><dd className="font-medium">{client.state || '—'}</dd></div>
          <div className="md:col-span-2"><dt className="text-sm text-gray-500">Created by</dt><dd className="font-medium">{client.Creator?.name || '—'}</dd></div>
          <div className="md:col-span-2"><dt className="text-sm text-gray-500">Assigned to</dt><dd className="font-medium">{client.Assignee?.name || '—'}</dd></div>
          {client.notes && (
            <div className="md:col-span-2"><dt className="text-sm text-gray-500">Notes</dt><dd className="font-medium whitespace-pre-wrap">{client.notes}</dd></div>
          )}
        </dl>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-primary mb-4">Opponents</h2>
        {opponents.length > 0 && (
          <ul className="divide-y divide-gray-200 mb-4">
            {opponents.map((o) => (
              <li key={o.id} className="py-3 flex justify-between items-start">
                <div>
                  <p className="font-medium">{o.name || 'Unnamed'}</p>
                  {o.phone && <p className="text-sm text-gray-500">{o.phone}</p>}
                  {o.address && <p className="text-sm text-gray-500">{o.address}</p>}
                  {o.notes && <p className="text-sm text-gray-600 mt-1">{o.notes}</p>}
                </div>
                <button type="button" onClick={() => handleRemoveOpponent(o.id)} className="text-red-600 text-sm hover:underline">Remove</button>
              </li>
            ))}
          </ul>
        )}
        <form onSubmit={handleAddOpponent} className="flex flex-wrap gap-2 items-end">
          <input placeholder="Name" value={opponentForm.name} onChange={(e) => setOpponentForm({ ...opponentForm, name: e.target.value })} className="px-2 py-1 border rounded w-32" />
          <input placeholder="Phone" value={opponentForm.phone} onChange={(e) => setOpponentForm({ ...opponentForm, phone: e.target.value })} className="px-2 py-1 border rounded w-32" />
          <input placeholder="Address" value={opponentForm.address} onChange={(e) => setOpponentForm({ ...opponentForm, address: e.target.value })} className="px-2 py-1 border rounded w-40" />
          <input placeholder="Notes" value={opponentForm.notes} onChange={(e) => setOpponentForm({ ...opponentForm, notes: e.target.value })} className="px-2 py-1 border rounded w-40" />
          <button type="submit" className="px-3 py-1 bg-primary text-white rounded hover:bg-primary/90 text-sm">Add</button>
        </form>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-primary mb-4">Tags</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {clientTags.map((t) => (
            <span key={t.id} className="inline-flex items-center gap-1 px-2 py-1 rounded bg-accent/20 text-primary text-sm">
              {t.name}
              <button type="button" onClick={() => handleRemoveTag(t.id)} className="text-gray-500 hover:text-red-600">×</button>
            </span>
          ))}
        </div>
        <form onSubmit={handleAddTag} className="flex gap-2">
          <select value={tagSelect} onChange={(e) => setTagSelect(e.target.value)} className="px-2 py-1 border rounded">
            <option value="">Add tag...</option>
            {tags.filter((t) => !clientTags.some((ct) => ct.id === t.id)).map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <button type="submit" className="px-3 py-1 bg-primary text-white rounded hover:bg-primary/90 text-sm">Add</button>
        </form>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-primary mb-2">Cases</h2>
        <p className="text-gray-500 text-sm">Case linking will be available in the Case Management module.</p>
      </div>
    </div>
  );
}
