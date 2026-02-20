import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { listBenchesByCourt, listCourts } from '../../services/courtApi';

export default function BenchList() {
  const [data, setData] = useState([]);
  const [courts, setCourts] = useState([]);
  const [courtId, setCourtId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    listCourts({ limit: 500 }).then(({ data: d }) => setCourts(d.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!courtId) {
      setData([]);
      return;
    }
    setLoading(true);
    listBenchesByCourt(courtId)
      .then(({ data: res }) => setData(res.data || []))
      .catch(() => setError('Failed to load benches'))
      .finally(() => setLoading(false));
  }, [courtId]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary mb-6">Benches</h1>
      {error && <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select court</label>
        <select value={courtId} onChange={(e) => setCourtId(e.target.value)} className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent">
          <option value="">Choose a court</option>
          {courts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {!courtId ? (
          <p className="p-6 text-gray-500 text-center">Select a court to view benches.</p>
        ) : loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-accent" /></div>
        ) : data.length === 0 ? (
          <p className="p-6 text-gray-500 text-center">No benches. Add from court detail page.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {data.map((b) => (
              <li key={b.id} className="px-6 py-4 flex justify-between items-center">
                <span className="font-medium">{b.name}</span>
                <Link to={'/courts/' + (b.court_id || courtId)} className="text-sm text-primary hover:underline">View court</Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
