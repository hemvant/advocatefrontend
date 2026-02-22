import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createCase } from '../../services/caseApi';
import { getSetupStatus } from '../../services/orgApi';
import CaseForm from './CaseForm';

export default function CaseCreate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [setupLoading, setSetupLoading] = useState(true);
  const [error, setError] = useState('');
  const [missingMasterData, setMissingMasterData] = useState([]);

  const refreshSetup = () => {
    getSetupStatus()
      .then(({ data }) => {
        const d = data?.data || data;
        const missing = [];
        if ((d.clients_count || 0) === 0) missing.push('clients');
        if ((d.courts_count || 0) === 0) missing.push('courts');
        setMissingMasterData(missing);
      })
      .catch(() => setMissingMasterData(['clients', 'courts']));
  };

  useEffect(() => {
    getSetupStatus()
      .then(({ data }) => {
        const d = data?.data || data;
        const missing = [];
        if ((d.clients_count || 0) === 0) missing.push('clients');
        if ((d.courts_count || 0) === 0) missing.push('courts');
        setMissingMasterData(missing);
      })
      .catch(() => setMissingMasterData([]))
      .finally(() => setSetupLoading(false));
  }, []);

  const handleSubmit = async (payload) => {
    if (loading) return;
    setLoading(true);
    setError('');
    try {
      const { data } = await createCase(payload);
      if (data && data.data && data.data.id) {
        navigate(`/cases/${data.data.id}`, { replace: true });
        return;
      }
      setError('Create failed');
    } catch (err) {
      const body = err.response?.data || {};
      if (body.error === 'Missing Master Data' && Array.isArray(body.missing)) {
        setMissingMasterData(body.missing);
      } else {
        setError(body.message || err.message || 'Create failed');
      }
    } finally {
      setLoading(false);
    }
  };

  if (setupLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-accent" />
      </div>
    );
  }

  const showGuard = missingMasterData.length > 0;

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary mb-6">Add Case</h1>
      {error && <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>}
      {showGuard ? (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 max-w-2xl">
          <p className="font-medium text-amber-900 mb-2">You need to add the following before creating a case:</p>
          <ul className="list-disc list-inside text-amber-800 text-sm mb-4">
            {missingMasterData.includes('clients') && <li>At least one Client</li>}
            {missingMasterData.includes('courts') && <li>At least one Court</li>}
          </ul>
          <div className="flex flex-wrap gap-2">
            {missingMasterData.includes('clients') && (
              <Link to="/clients/create" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">Add Client</Link>
            )}
            {missingMasterData.includes('courts') && (
              <Link to="/courts/create" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">Add Court</Link>
            )}
            <button type="button" onClick={refreshSetup} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              I&apos;ve added them, check again
            </button>
          </div>
        </div>
      ) : (
        <CaseForm onSubmit={handleSubmit} loading={loading} onClientsChange={refreshSetup} onCourtsChange={refreshSetup} />
      )}
    </div>
  );
}
