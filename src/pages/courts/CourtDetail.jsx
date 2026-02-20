import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  getCourt,
  updateCourt,
  addBench,
  updateBench,
  deleteBench,
  addCourtroom,
  updateCourtroom,
  getCourtTypes
} from '../../services/courtApi';
import { useOrgAuth } from '../../context/OrgAuthContext';

export default function CourtDetail() {
  const { id } = useParams();
  const { isOrgAdmin } = useOrgAuth();
  const [court, setCourt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [courtTypes, setCourtTypes] = useState([]);
  const [editForm, setEditForm] = useState(null);
  const [benchForm, setBenchForm] = useState({ name: '' });
  const [editingBenchId, setEditingBenchId] = useState(null);
  const [roomForm, setRoomForm] = useState({ room_number: '', floor: '', bench_id: '' });
  const [editingRoomId, setEditingRoomId] = useState(null);

  const load = () => {
    setLoading(true);
    getCourt(id)
      .then(({ data }) => {
        setCourt(data.data);
        if (!editForm && data.data) setEditForm({
          name: data.data.name || '',
          state: data.data.state || '',
          city: data.data.city || '',
          address: data.data.address || '',
          court_type_id: data.data.court_type_id || ''
        });
      })
      .catch(() => setError('Court not found'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    getCourtTypes().then(({ data: d }) => setCourtTypes(d.data || [])).catch(() => {});
  }, []);
  useEffect(() => { load(); }, [id]);

  const handleUpdateCourt = async (e) => {
    e.preventDefault();
    if (!editForm || !isOrgAdmin) return;
    try {
      await updateCourt(id, {
        court_type_id: editForm.court_type_id ? parseInt(editForm.court_type_id, 10) : undefined,
        name: editForm.name.trim(),
        state: editForm.state.trim() || null,
        city: editForm.city.trim() || null,
        address: editForm.address.trim() || null
      });
      setEditForm(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    }
  };

  const handleAddBench = async (e) => {
    e.preventDefault();
    if (!benchForm.name.trim() || !isOrgAdmin) return;
    try {
      await addBench(id, { name: benchForm.name.trim() });
      setBenchForm({ name: '' });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Add bench failed');
    }
  };

  const handleUpdateBench = async (e) => {
    e.preventDefault();
    if (!editingBenchId || !benchForm.name.trim() || !isOrgAdmin) return;
    try {
      await updateBench(id, editingBenchId, { name: benchForm.name.trim() });
      setEditingBenchId(null);
      setBenchForm({ name: '' });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    }
  };

  const handleDeleteBench = async (benchId) => {
    if (!isOrgAdmin || !window.confirm('Delete this bench?')) return;
    try {
      await deleteBench(id, benchId);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleAddRoom = async (e) => {
    e.preventDefault();
    if (!roomForm.room_number.trim() || !isOrgAdmin) return;
    try {
      await addCourtroom(id, {
        room_number: roomForm.room_number.trim(),
        floor: roomForm.floor ? parseInt(roomForm.floor, 10) : null,
        bench_id: roomForm.bench_id ? parseInt(roomForm.bench_id, 10) : null
      });
      setRoomForm({ room_number: '', floor: '', bench_id: '' });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Add courtroom failed');
    }
  };

  const handleUpdateRoom = async (e) => {
    e.preventDefault();
    if (!editingRoomId || !roomForm.room_number.trim() || !isOrgAdmin) return;
    try {
      await updateCourtroom(id, editingRoomId, {
        room_number: roomForm.room_number.trim(),
        floor: roomForm.floor ? parseInt(roomForm.floor, 10) : null,
        bench_id: roomForm.bench_id ? parseInt(roomForm.bench_id, 10) : null
      });
      setEditingRoomId(null);
      setRoomForm({ room_number: '', floor: '', bench_id: '' });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    }
  };

  if (loading && !court) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-accent" /></div>;
  if (error && !court) return <div className="p-4 text-red-600">{error}</div>;
  if (!court) return null;

  const benches = court.CourtBenches || [];
  const rooms = court.Courtrooms || [];
  const judges = court.Judges || [];

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
        <div>
          <Link to="/courts" className="text-sm text-primary hover:underline mb-2 inline-block">← Courts</Link>
          <h1 className="text-2xl font-bold text-primary">{court.name}</h1>
          <p className="text-gray-500">{court.CourtType?.name} · {[court.city, court.state].filter(Boolean).join(', ') || '—'}</p>
        </div>
      </div>
      {error && <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>}

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-primary mb-4">Court details</h2>
        {editForm !== null && isOrgAdmin ? (
          <form onSubmit={handleUpdateCourt} className="space-y-4 max-w-xl">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Court type</label>
              <select value={editForm.court_type_id} onChange={(e) => setEditForm((f) => ({ ...f, court_type_id: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent">
                {courtTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input type="text" value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input type="text" value={editForm.city} onChange={(e) => setEditForm((f) => ({ ...f, city: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input type="text" value={editForm.state} onChange={(e) => setEditForm((f) => ({ ...f, state: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea value={editForm.address} onChange={(e) => setEditForm((f) => ({ ...f, address: e.target.value }))} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent" />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">Save</button>
              <button type="button" onClick={() => setEditForm(null)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
            </div>
          </form>
        ) : (
          <>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><dt className="text-sm text-gray-500">Type</dt><dd className="font-medium">{court.CourtType?.name || '—'}</dd></div>
              <div><dt className="text-sm text-gray-500">City / State</dt><dd className="font-medium">{[court.city, court.state].filter(Boolean).join(', ') || '—'}</dd></div>
              <div className="md:col-span-2"><dt className="text-sm text-gray-500">Address</dt><dd className="font-medium">{court.address || '—'}</dd></div>
              <div><dt className="text-sm text-gray-500">Cases</dt><dd className="font-medium">{court.caseCount ?? '—'}</dd></div>
              <div><dt className="text-sm text-gray-500">Status</dt><dd><span className={court.is_active ? 'text-green-600' : 'text-gray-500'}>{court.is_active ? 'Active' : 'Inactive'}</span></dd></div>
            </dl>
            {isOrgAdmin && <button type="button" onClick={() => setEditForm({ name: court.name, state: court.state || '', city: court.city || '', address: court.address || '', court_type_id: court.court_type_id })} className="mt-4 text-primary hover:underline">Edit details</button>}
          </>
        )}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-primary mb-4">Benches</h2>
        {benches.length > 0 && (
          <ul className="divide-y divide-gray-200 mb-4">
            {benches.map((b) => (
              <li key={b.id} className="py-3 flex justify-between items-center">
                {editingBenchId === b.id ? (
                  <form onSubmit={handleUpdateBench} className="flex gap-2 flex-1">
                    <input type="text" value={benchForm.name} onChange={(e) => setBenchForm({ name: e.target.value })} className="flex-1 px-2 py-1 border rounded" placeholder="Bench name" />
                    <button type="submit" className="px-3 py-1 bg-primary text-white rounded text-sm">Save</button>
                    <button type="button" onClick={() => { setEditingBenchId(null); setBenchForm({ name: '' }); }} className="px-3 py-1 border rounded text-sm">Cancel</button>
                  </form>
                ) : (
                  <>
                    <span className="font-medium">{b.name}</span>
                    {isOrgAdmin && (
                      <span>
                        <button type="button" onClick={() => { setEditingBenchId(b.id); setBenchForm({ name: b.name }); }} className="text-primary hover:underline mr-2">Edit</button>
                        <button type="button" onClick={() => handleDeleteBench(b.id)} className="text-red-600 hover:underline">Delete</button>
                      </span>
                    )}
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
        {isOrgAdmin && (
          editingBenchId ? null : (
            <form onSubmit={handleAddBench} className="flex gap-2">
              <input type="text" value={benchForm.name} onChange={(e) => setBenchForm({ name: e.target.value })} className="flex-1 max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent" placeholder="Bench name" />
              <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">Add bench</button>
            </form>
          )
        )}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-primary mb-4">Courtrooms</h2>
        {rooms.length > 0 && (
          <ul className="divide-y divide-gray-200 mb-4">
            {rooms.map((r) => (
              <li key={r.id} className="py-3 flex justify-between items-center">
                {editingRoomId === r.id ? (
                  <form onSubmit={handleUpdateRoom} className="flex flex-wrap gap-2 flex-1">
                    <input type="text" value={roomForm.room_number} onChange={(e) => setRoomForm((f) => ({ ...f, room_number: e.target.value }))} className="w-24 px-2 py-1 border rounded" placeholder="Room" />
                    <input type="number" value={roomForm.floor} onChange={(e) => setRoomForm((f) => ({ ...f, floor: e.target.value }))} className="w-20 px-2 py-1 border rounded" placeholder="Floor" />
                    <select value={roomForm.bench_id} onChange={(e) => setRoomForm((f) => ({ ...f, bench_id: e.target.value }))} className="px-2 py-1 border rounded">
                      <option value="">No bench</option>
                      {benches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                    <button type="submit" className="px-3 py-1 bg-primary text-white rounded text-sm">Save</button>
                    <button type="button" onClick={() => { setEditingRoomId(null); setRoomForm({ room_number: '', floor: '', bench_id: '' }); }} className="px-3 py-1 border rounded text-sm">Cancel</button>
                  </form>
                ) : (
                  <>
                    <span className="font-medium">Room {r.room_number}{r.floor != null ? ` (Floor ${r.floor})` : ''}</span>
                    {isOrgAdmin && (
                      <span>
                        <button type="button" onClick={() => { setEditingRoomId(r.id); setRoomForm({ room_number: r.room_number || '', floor: r.floor ?? '', bench_id: r.bench_id || '' }); }} className="text-primary hover:underline mr-2">Edit</button>
                      </span>
                    )}
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
        {isOrgAdmin && !editingRoomId && (
          <form onSubmit={handleAddRoom} className="flex flex-wrap gap-2">
            <input type="text" value={roomForm.room_number} onChange={(e) => setRoomForm((f) => ({ ...f, room_number: e.target.value }))} className="w-24 px-3 py-2 border border-gray-300 rounded-lg" placeholder="Room #" />
            <input type="number" value={roomForm.floor} onChange={(e) => setRoomForm((f) => ({ ...f, floor: e.target.value }))} className="w-20 px-3 py-2 border border-gray-300 rounded-lg" placeholder="Floor" />
            <select value={roomForm.bench_id} onChange={(e) => setRoomForm((f) => ({ ...f, bench_id: e.target.value }))} className="px-3 py-2 border border-gray-300 rounded-lg">
              <option value="">No bench</option>
              {benches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
            <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">Add courtroom</button>
          </form>
        )}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-primary">Judges</h2>
          <Link to={`/judges?court_id=${id}`} className="text-sm text-primary hover:underline">Manage judges →</Link>
        </div>
        {judges.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {judges.map((j) => (
              <li key={j.id} className="py-3">
                <p className="font-medium">{j.name}</p>
                <p className="text-sm text-gray-500">{j.designation || '—'}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No judges. Add judges from the Judges page and assign to this court.</p>
        )}
      </div>
    </div>
  );
}
