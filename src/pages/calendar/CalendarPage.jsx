import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCalendarView, createHearing } from '../../services/hearingApi';
import { listCases } from '../../services/caseApi';

const STATUS_OPTIONS = ['UPCOMING', 'COMPLETED', 'ADJOURNED', 'CANCELLED'];
const STATUS_COLOR = { UPCOMING: 'bg-amber-100 text-amber-800', COMPLETED: 'bg-green-100 text-green-800', ADJOURNED: 'bg-gray-100 text-gray-800', CANCELLED: 'bg-red-100 text-red-800' };

export default function CalendarPage() {
  const [view, setView] = useState('month');
  const [current, setCurrent] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [hearings, setHearings] = useState([]);
  const [byDate, setByDate] = useState({});
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [addModal, setAddModal] = useState(false);
  const [cases, setCases] = useState([]);
  const [addForm, setAddForm] = useState({ case_id: '', hearing_date: '', courtroom: '', hearing_type: 'REGULAR', status: 'UPCOMING', remarks: '' });
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    const start = new Date(current.getFullYear(), current.getMonth(), 1);
    const end = new Date(current.getFullYear(), current.getMonth() + 1, 0, 23, 59, 59);
    try {
      const params = { start: start.toISOString(), end: end.toISOString() };
      if (statusFilter) params.status = statusFilter;
      const { data } = await getCalendarView(params);
      setHearings(data.data || []);
      setByDate(data.byDate || {});
    } catch {
      setHearings([]);
      setByDate({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [current.getFullYear(), current.getMonth(), statusFilter]);

  const openAdd = () => {
    listCases({ limit: 200 }).then(({ data }) => setCases(data.data || [])).catch(() => {});
    setAddForm({ case_id: '', hearing_date: '', courtroom: '', hearing_type: 'REGULAR', status: 'UPCOMING', remarks: '' });
    setAddModal(true);
  };

  const handleAddHearing = async (e) => {
    e.preventDefault();
    if (!addForm.case_id || !addForm.hearing_date) return;
    setSubmitting(true);
    try {
      await createHearing({
        case_id: parseInt(addForm.case_id, 10),
        hearing_date: new Date(addForm.hearing_date).toISOString(),
        courtroom: addForm.courtroom || null,
        hearing_type: addForm.hearing_type,
        status: addForm.status,
        remarks: addForm.remarks || null
      });
      setAddModal(false);
      load();
    } finally {
      setSubmitting(false);
    }
  };

  const monthStart = new Date(current.getFullYear(), current.getMonth(), 1);
  const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0);
  const startDay = monthStart.getDay();
  const daysInMonth = monthEnd.getDate();

  const prevMonth = () => setCurrent(new Date(current.getFullYear(), current.getMonth() - 1));
  const nextMonth = () => setCurrent(new Date(current.getFullYear(), current.getMonth() + 1));

  const dayCells = [];
  for (let i = 0; i < startDay; i++) {
    dayCells.push(<div key={'e' + i} className="min-h-[80px] p-2 bg-gray-50 border border-gray-200" />);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dayHearings = byDate[dateStr] || [];
    dayCells.push(
      <div key={d} className="min-h-[80px] p-2 border border-gray-200 hover:bg-gray-50">
        <div className="text-sm font-medium text-gray-700 mb-1">{d}</div>
        {dayHearings.slice(0, 3).map((h) => (
          <Link key={h.id} to={`/hearings/${h.id}`} className={`block text-xs px-2 py-0.5 rounded truncate ${STATUS_COLOR[h.status] || 'bg-gray-100'}`} title={h.Case?.case_title}>
            {h.Case?.case_title || 'Hearing'}
          </Link>
        ))}
        {dayHearings.length > 3 && <span className="text-xs text-gray-500">+{dayHearings.length - 3}</span>}
      </div>
    );
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-primary">Hearing Calendar</h1>
        <div className="flex flex-wrap gap-2 items-center">
          <button type="button" onClick={openAdd} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">Add Hearing</button>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <div className="flex rounded-lg border border-gray-300 overflow-hidden">
            <button type="button" onClick={() => setView('month')} className={`px-3 py-2 text-sm ${view === 'month' ? 'bg-primary text-white' : 'bg-white'}`}>Month</button>
            <button type="button" onClick={() => setView('list')} className={`px-3 py-2 text-sm ${view === 'list' ? 'bg-primary text-white' : 'bg-white'}`}>List</button>
          </div>
        </div>
      </div>

      {view === 'month' && (
        <div className="bg-white border border-gray-200 rounded-lg shadow overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <button type="button" onClick={prevMonth} className="px-3 py-1 border rounded hover:bg-gray-50">Prev</button>
            <h2 className="text-lg font-semibold text-primary">{monthStart.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
            <button type="button" onClick={nextMonth} className="px-3 py-1 border rounded hover:bg-gray-50">Next</button>
          </div>
          <div className="grid grid-cols-7">
            {weekDays.map((w) => <div key={w} className="p-2 text-center text-xs font-semibold text-gray-500 border-b border-gray-200 bg-gray-50">{w}</div>)}
            {dayCells}
          </div>
        </div>
      )}

      {view === 'list' && (
        <div className="bg-white border border-gray-200 rounded-lg shadow overflow-hidden">
          {loading ? <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-accent" /></div> : (
            <ul className="divide-y divide-gray-200">
              {hearings.length === 0 && <li className="px-6 py-12 text-center text-gray-500">No hearings in this period.</li>}
              {hearings.map((h) => (
                <li key={h.id} className="px-6 py-4 hover:bg-gray-50 flex justify-between items-center">
                  <div>
                    <Link to={`/hearings/${h.id}`} className="font-medium text-primary hover:text-accent">{h.Case?.case_title || 'Hearing'}</Link>
                    <p className="text-sm text-gray-500">{h.Case?.Client?.name} · {h.hearing_date ? new Date(h.hearing_date).toLocaleString() : '—'}</p>
                  </div>
                  <span className={`px-2 py-0.5 text-xs rounded ${STATUS_COLOR[h.status] || 'bg-gray-100'}`}>{h.status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {addModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto my-auto">
            <h2 className="text-lg font-bold text-primary mb-4">Add Hearing</h2>
            <form onSubmit={handleAddHearing} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Case *</label>
                <select value={addForm.case_id} onChange={(e) => setAddForm({ ...addForm, case_id: e.target.value })} className="w-full px-3 py-2 border rounded-lg" required>
                  <option value="">Select case</option>
                  {cases.map((c) => <option key={c.id} value={c.id}>{c.case_title} ({c.case_number})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hearing date *</label>
                <input type="datetime-local" value={addForm.hearing_date} onChange={(e) => setAddForm({ ...addForm, hearing_date: e.target.value })} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Courtroom</label>
                <input value={addForm.courtroom} onChange={(e) => setAddForm({ ...addForm, courtroom: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select value={addForm.hearing_type} onChange={(e) => setAddForm({ ...addForm, hearing_type: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
                  <option value="REGULAR">REGULAR</option>
                  <option value="ARGUMENT">ARGUMENT</option>
                  <option value="EVIDENCE">EVIDENCE</option>
                  <option value="FINAL">FINAL</option>
                  <option value="OTHER">OTHER</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={addForm.status} onChange={(e) => setAddForm({ ...addForm, status: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
                  <option value="UPCOMING">UPCOMING</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="ADJOURNED">ADJOURNED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                <textarea value={addForm.remarks} onChange={(e) => setAddForm({ ...addForm, remarks: e.target.value })} rows={2} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={submitting} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50">Create</button>
                <button type="button" onClick={() => setAddModal(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
