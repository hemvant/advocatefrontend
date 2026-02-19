import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getHearing, updateHearing, deleteHearing, addReminder, removeReminder } from '../../services/hearingApi';

const STATUS_COLOR = { UPCOMING: 'bg-amber-100 text-amber-800', COMPLETED: 'bg-green-100 text-green-800', ADJOURNED: 'bg-gray-100', CANCELLED: 'bg-red-100 text-red-800' };
const STATUS_OPTIONS = ['UPCOMING', 'COMPLETED', 'ADJOURNED', 'CANCELLED'];
const TYPE_OPTIONS = ['REGULAR', 'ARGUMENT', 'EVIDENCE', 'FINAL', 'OTHER'];

export default function HearingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hearing, setHearing] = useState(null);
  const [error, setError] = useState('');
  const [reminderTime, setReminderTime] = useState('');
  const [reminderType, setReminderType] = useState('SYSTEM');
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ hearing_date: '', courtroom: '', hearing_type: 'REGULAR', status: 'UPCOMING', remarks: '' });
  const [saving, setSaving] = useState(false);

  const load = () => {
    getHearing(id)
      .then(({ data }) => {
        setHearing(data.data);
        if (data.data) {
          const d = data.data.hearing_date ? new Date(data.data.hearing_date) : null;
          setEditForm({
            hearing_date: d ? d.toISOString().slice(0, 16) : '',
            courtroom: data.data.courtroom || '',
            hearing_type: data.data.hearing_type || 'REGULAR',
            status: data.data.status || 'UPCOMING',
            remarks: data.data.remarks || ''
          });
        }
      })
      .catch(() => setError('Hearing not found'));
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateHearing(id, {
        hearing_date: editForm.hearing_date || null,
        courtroom: editForm.courtroom || null,
        hearing_type: editForm.hearing_type,
        status: editForm.status,
        remarks: editForm.remarks || null
      });
      setEditing(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleAddReminder = async (e) => {
    e.preventDefault();
    if (!reminderTime) return;
    try {
      await addReminder(id, { reminder_time: new Date(reminderTime).toISOString(), reminder_type: reminderType });
      setReminderTime('');
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add reminder');
    }
  };

  const handleRemoveReminder = async (reminderId) => {
    try {
      await removeReminder(id, reminderId);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this hearing?')) return;
    try {
      await deleteHearing(id);
      navigate('/calendar');
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  if (error && !hearing) return <div className="p-4 text-red-600">{error}</div>;
  if (!hearing) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-accent" /></div>;

  const reminders = hearing.HearingReminders || [];

  return (
    <div className="max-w-3xl">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">Hearing</h1>
          <p className="text-gray-500 mt-1">{hearing.Case?.case_title} · {hearing.Case?.case_number}</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => setEditing(!editing)} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">Edit</button>
          <Link to={`/cases/${hearing.case_id}`} className="px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary/5">View Case</Link>
          <button type="button" onClick={handleDelete} className="px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50">Delete</button>
        </div>
      </div>

      {editing && (
        <form onSubmit={handleSaveEdit} className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-primary mb-4">Edit Hearing</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hearing date</label>
              <input type="datetime-local" value={editForm.hearing_date} onChange={(e) => setEditForm({ ...editForm, hearing_date: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Courtroom</label>
              <input value={editForm.courtroom} onChange={(e) => setEditForm({ ...editForm, courtroom: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select value={editForm.hearing_type} onChange={(e) => setEditForm({ ...editForm, hearing_type: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
                {TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
              <textarea value={editForm.remarks} onChange={(e) => setEditForm({ ...editForm, remarks: e.target.value })} rows={2} className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button type="submit" disabled={saving} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50">Save</button>
            <button type="button" onClick={() => setEditing(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
          </div>
        </form>
      )}

      {error && <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>}

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden mb-6">
        <dl className="px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><dt className="text-sm text-gray-500">Client</dt><dd className="font-medium">{hearing.Case?.Client?.name || '—'}</dd></div>
          <div><dt className="text-sm text-gray-500">Hearing date</dt><dd className="font-medium">{hearing.hearing_date ? new Date(hearing.hearing_date).toLocaleString() : '—'}</dd></div>
          <div><dt className="text-sm text-gray-500">Courtroom</dt><dd className="font-medium">{hearing.courtroom || '—'}</dd></div>
          <div><dt className="text-sm text-gray-500">Hearing type</dt><dd className="font-medium">{hearing.hearing_type || '—'}</dd></div>
          <div><dt className="text-sm text-gray-500">Status</dt><dd><span className={`px-2 py-0.5 text-xs rounded ${STATUS_COLOR[hearing.status] || 'bg-gray-100'}`}>{hearing.status}</span></dd></div>
          <div><dt className="text-sm text-gray-500">Reminder sent</dt><dd className="font-medium">{hearing.reminder_sent ? 'Yes' : 'No'}</dd></div>
          {hearing.remarks && <div className="md:col-span-2"><dt className="text-sm text-gray-500">Remarks</dt><dd className="font-medium whitespace-pre-wrap">{hearing.remarks}</dd></div>}
        </dl>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-primary mb-4">Reminder schedule</h2>
        {reminders.length > 0 && (
          <ul className="divide-y divide-gray-200 mb-4">
            {reminders.map((r) => (
              <li key={r.id} className="py-3 flex justify-between items-center">
                <span>{r.reminder_time ? new Date(r.reminder_time).toLocaleString() : '—'} ({r.reminder_type}) {r.is_sent && <span className="text-green-600 text-sm">Sent</span>}</span>
                {!r.is_sent && <button type="button" onClick={() => handleRemoveReminder(r.id)} className="text-red-600 text-sm hover:underline">Remove</button>}
              </li>
            ))}
          </ul>
        )}
        <form onSubmit={handleAddReminder} className="flex flex-wrap gap-2 items-end">
          <input type="datetime-local" value={reminderTime} onChange={(e) => setReminderTime(e.target.value)} className="px-2 py-1 border rounded" />
          <select value={reminderType} onChange={(e) => setReminderType(e.target.value)} className="px-2 py-1 border rounded">
            <option value="SYSTEM">SYSTEM</option>
            <option value="EMAIL">EMAIL</option>
          </select>
          <button type="submit" className="px-3 py-1 bg-primary text-white rounded hover:bg-primary/90 text-sm">Add reminder</button>
        </form>
      </div>
    </div>
  );
}
