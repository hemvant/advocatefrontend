import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCase } from '../../services/caseApi';
import CaseForm from './CaseForm';

export default function CaseCreate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      const msg = err.response?.data?.message || err.message || 'Create failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary mb-6">Add Case</h1>
      {error && <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>}
      <CaseForm onSubmit={handleSubmit} loading={loading} />
    </div>
  );
}
