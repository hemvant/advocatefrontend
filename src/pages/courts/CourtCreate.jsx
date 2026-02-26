import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getCourtTypes,
  createCourt,
  addBench,
  addCourtroom,
  addJudge
} from '../../services/courtApi';
import { getApiMessage } from '../../services/apiHelpers';

const emptyBench = () => ({ name: '' });
const emptyRoom = () => ({ room_number: '', floor: '', benchIndex: '' });
const emptyJudge = () => ({ name: '', designation: '', benchIndex: '' });

export default function CourtCreate() {
  const navigate = useNavigate();
  const [courtTypes, setCourtTypes] = useState([]);
  const [courtForm, setCourtForm] = useState({
    court_type_id: '',
    name: '',
    state: '',
    city: '',
    address: ''
  });
  const [benches, setBenches] = useState([emptyBench()]);
  const [courtrooms, setCourtrooms] = useState([emptyRoom()]);
  const [judges, setJudges] = useState([emptyJudge()]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getCourtTypes().then(({ data }) => setCourtTypes(data.data || [])).catch(() => {});
  }, []);

  const addBenchRow = () => setBenches((b) => [...b, emptyBench()]);
  const removeBenchRow = (i) => setBenches((b) => b.filter((_, idx) => idx !== i));
  const setBenchAt = (i, name) => setBenches((b) => b.map((row, idx) => (idx === i ? { ...row, name } : row)));

  const addRoomRow = () => setCourtrooms((r) => [...r, emptyRoom()]);
  const removeRoomRow = (i) => setCourtrooms((r) => r.filter((_, idx) => idx !== i));
  const setRoomAt = (i, field, value) =>
    setCourtrooms((r) => r.map((row, idx) => (idx === i ? { ...row, [field]: value } : row)));

  const addJudgeRow = () => setJudges((j) => [...j, emptyJudge()]);
  const removeJudgeRow = (i) => setJudges((j) => j.filter((_, idx) => idx !== i));
  const setJudgeAt = (i, field, value) =>
    setJudges((j) => j.map((row, idx) => (idx === i ? { ...row, [field]: value } : row)));

  const benchNames = benches.map((b) => b.name.trim()).filter(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data: courtData } = await createCourt({
        court_type_id: parseInt(courtForm.court_type_id, 10),
        name: courtForm.name.trim(),
        state: courtForm.state.trim() || null,
        city: courtForm.city.trim() || null,
        address: courtForm.address.trim() || null
      });
      const courtId = courtData?.id;
      if (!courtId) {
        setError('Court was created but could not get ID');
        setLoading(false);
        return;
      }

      const createdBenches = [];
      for (const b of benchNames) {
        const { data: benchData } = await addBench(courtId, { name: b });
        if (benchData?.id) createdBenches.push(benchData);
      }

      for (const room of courtrooms) {
        const rn = (room.room_number || '').trim();
        if (!rn) continue;
        const bi = room.benchIndex === '' || room.benchIndex == null ? null : parseInt(room.benchIndex, 10);
        const benchId = bi >= 0 && createdBenches[bi] ? createdBenches[bi].id : null;
        await addCourtroom(courtId, {
          room_number: rn,
          floor: (room.floor || '').trim() || null,
          bench_id: benchId || undefined
        });
      }

      for (const judge of judges) {
        const jn = (judge.name || '').trim();
        if (!jn) continue;
        const bi = judge.benchIndex === '' || judge.benchIndex == null ? null : parseInt(judge.benchIndex, 10);
        const benchId = bi >= 0 && createdBenches[bi] ? createdBenches[bi].id : null;
        await addJudge({
          court_id: courtId,
          name: jn,
          designation: (judge.designation || '').trim() || null,
          bench_id: benchId || undefined
        });
      }

      navigate(`/courts/${courtId}`, { replace: true });
    } catch (err) {
      setError(getApiMessage(err, 'Failed to create court'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-primary mb-2">Add Court</h1>
      <p className="text-gray-600 mb-6">Enter court details, benches, courtrooms and judges in one place.</p>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Court details */}
        <section className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-primary mb-4">Court details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Court type *</label>
              <select
                value={courtForm.court_type_id}
                onChange={(e) => setCourtForm((f) => ({ ...f, court_type_id: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
                required
              >
                <option value="">Select type</option>
                {courtTypes.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Court name *</label>
              <input
                type="text"
                value={courtForm.name}
                onChange={(e) => setCourtForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
                required
                maxLength={255}
                placeholder="e.g. District Court"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  value={courtForm.city}
                  onChange={(e) => setCourtForm((f) => ({ ...f, city: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
                  maxLength={100}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input
                  type="text"
                  value={courtForm.state}
                  onChange={(e) => setCourtForm((f) => ({ ...f, state: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
                  maxLength={100}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea
                value={courtForm.address}
                onChange={(e) => setCourtForm((f) => ({ ...f, address: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>
        </section>

        {/* Benches */}
        <section className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-primary">Benches</h2>
            <button type="button" onClick={addBenchRow} className="text-sm text-primary hover:underline">
              + Add bench
            </button>
          </div>
          <p className="text-sm text-gray-500 mb-3">Add bench names. You can link courtrooms and judges to a bench later.</p>
          <ul className="space-y-2">
            {benches.map((row, i) => (
              <li key={i} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={row.name}
                  onChange={(e) => setBenchAt(i, e.target.value)}
                  className="flex-1 max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
                  placeholder="e.g. Bench I, Bench II"
                />
                <button type="button" onClick={() => removeBenchRow(i)} className="text-red-600 hover:underline text-sm" aria-label="Remove">
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </section>

        {/* Courtrooms */}
        <section className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-primary">Courtrooms</h2>
            <button type="button" onClick={addRoomRow} className="text-sm text-primary hover:underline">
              + Add courtroom
            </button>
          </div>
          <p className="text-sm text-gray-500 mb-3">Room number is required. Optionally set floor and bench.</p>
          <div className="space-y-3">
            {courtrooms.map((room, i) => (
              <div key={i} className="flex flex-wrap gap-2 items-center p-3 bg-gray-50 rounded-lg">
                <input
                  type="text"
                  value={room.room_number}
                  onChange={(e) => setRoomAt(i, 'room_number', e.target.value)}
                  className="w-24 px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Room #"
                />
                <input
                  type="text"
                  value={room.floor}
                  onChange={(e) => setRoomAt(i, 'floor', e.target.value)}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Floor"
                />
                <select
                  value={room.benchIndex}
                  onChange={(e) => setRoomAt(i, 'benchIndex', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">No bench</option>
                  {benchNames.map((name, idx) => (
                    <option key={idx} value={idx}>{name}</option>
                  ))}
                </select>
                <button type="button" onClick={() => removeRoomRow(i)} className="text-red-600 hover:underline text-sm">
                  Remove
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Judges */}
        <section className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-primary">Judges</h2>
            <button type="button" onClick={addJudgeRow} className="text-sm text-primary hover:underline">
              + Add judge
            </button>
          </div>
          <p className="text-sm text-gray-500 mb-3">Add judges for this court. Bench is optional.</p>
          <div className="space-y-3">
            {judges.map((row, i) => (
              <div key={i} className="flex flex-wrap gap-2 items-center p-3 bg-gray-50 rounded-lg">
                <input
                  type="text"
                  value={row.name}
                  onChange={(e) => setJudgeAt(i, 'name', e.target.value)}
                  className="min-w-[140px] px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Judge name"
                />
                <input
                  type="text"
                  value={row.designation}
                  onChange={(e) => setJudgeAt(i, 'designation', e.target.value)}
                  className="min-w-[120px] px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Designation"
                />
                <select
                  value={row.benchIndex}
                  onChange={(e) => setJudgeAt(i, 'benchIndex', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">No bench</option>
                  {benchNames.map((name, idx) => (
                    <option key={idx} value={idx}>{name}</option>
                  ))}
                </select>
                <button type="button" onClick={() => removeJudgeRow(i)} className="text-red-600 hover:underline text-sm">
                  Remove
                </button>
              </div>
            ))}
          </div>
        </section>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 font-medium"
          >
            {loading ? 'Creating court & details...' : 'Create Court & All Details'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/courts')}
            className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
