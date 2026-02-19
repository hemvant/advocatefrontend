import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCase, updateCase } from '../../services/caseApi';
import CaseForm from './CaseForm';

export default function CaseEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caseRecord, setCaseRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    getCase(id)
      .then(({ data }) => setCaseRecord(data.data))
      .catch(() => setLoadError('Case not found'));
  }, [id]);

  const handleSubmit = async (payload) => {
    setLoading(true);
    setError('');
    try {
      await updateCase(id, payload);
      navigate(`/cases/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  if (loadError) return <div className="p-4 text-red-600">{loadError}</div>;
  if (!caseRecord) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-accent" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary mb-6">Edit Case</h1>
      {error && <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>}
      <CaseForm caseRecord={caseRecord} onSubmit={handleSubmit} loading={loading} />
    </div>
  );
}
