import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getClient, updateClient } from '../../services/clientApi';
import ClientForm from './ClientForm';

export default function ClientEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    getClient(id)
      .then(({ data }) => setClient(data.data))
      .catch(() => setLoadError('Client not found'));
  }, [id]);

  const handleSubmit = async (payload) => {
    setLoading(true);
    setError('');
    try {
      await updateClient(id, payload);
      navigate(`/clients/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  if (loadError) return <div className="p-4 text-red-600">{loadError}</div>;
  if (!client) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-accent" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary mb-6">Edit Client</h1>
      {error && <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>}
      <ClientForm client={client} onSubmit={handleSubmit} loading={loading} />
    </div>
  );
}
