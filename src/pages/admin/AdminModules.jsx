import React, { useState, useEffect } from 'react';
import { getAllModules } from '../../services/moduleService';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function AdminModules() {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getAllModules()
      .then((res) => setModules(res.data.modules))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load modules'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner className="min-h-[200px]" />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary mb-2">Modules</h1>
      <p className="text-gray-600 mb-6">View and manage system modules. Assign modules to users from User Management.</p>
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 text-danger text-sm">{error}</div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((m) => (
          <div key={m.id} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <h3 className="font-semibold text-primary">{m.name}</h3>
            <p className="text-sm text-gray-600 mt-1">{m.description || '—'}</p>
            <span className={`inline-block mt-2 text-xs font-medium px-2 py-1 rounded ${m.is_active ? 'bg-green-100 text-success' : 'bg-gray-100 text-gray-600'}`}>
              {m.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
