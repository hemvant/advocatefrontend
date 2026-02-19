import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '../../services/clientApi';
import ClientForm from './ClientForm';

export default function ClientCreate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (payload) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await createClient(payload);
      navigate(`/clients/${data.data.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Create failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary mb-6">Add Client</h1>
      {error && <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>}
      <ClientForm onSubmit={handleSubmit} loading={loading} />
    </div>
  );
}
