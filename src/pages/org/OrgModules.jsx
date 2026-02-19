import React, { useState, useEffect } from 'react';
import { getModules } from '../../services/orgApi';
import { useOrgAuth } from '../../context/OrgAuthContext';

export default function OrgModules() {
  const { user, hasModule } = useOrgAuth();
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getModules()
      .then(({ data }) => setModules(data.data || []))
      .catch(() => setModules([]))
      .finally(() => setLoading(false));
  }, []);

  const assigned = user?.Modules || [];
  const list = modules.length ? modules : assigned;

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-accent" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary mb-6">Modules</h1>
      <p className="text-gray-600 mb-4">Modules available to your organization. Your assigned modules appear in the sidebar.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map((m) => (
          <div key={m.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <h3 className="font-semibold text-primary">{m.name}</h3>
            <p className="text-sm text-gray-500 mt-1">{m.description || '—'}</p>
            {assigned.some((a) => a.id === m.id) && (
              <span className="inline-block mt-2 px-2 py-0.5 text-xs rounded bg-green-100 text-green-800">Assigned to you</span>
            )}
          </div>
        ))}
      </div>
      {list.length === 0 && (
        <div className="text-center py-12 text-gray-500">No modules assigned yet.</div>
      )}
    </div>
  );
}
