import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  getCalendarView,
  createHearing,
  rescheduleHearing,
  getDiaryPdf,
  uploadCauseList
} from '../../services/hearingApi';
import { listCases } from '../../services/caseApi';
import { getEmployees } from '../../services/orgApi';
import { listCourts } from '../../services/courtApi';
import { useNotification } from '../../context/NotificationContext';
import { getApiMessage } from '../../services/apiHelpers';

const STATUS_OPTIONS = ['UPCOMING', 'COMPLETED', 'ADJOURNED', 'CANCELLED'];
const STATUS_COLOR = {
  UPCOMING: 'bg-amber-100 text-amber-800',
  COMPLETED: 'bg-green-100 text-green-800',
  ADJOURNED: 'bg-gray-100 text-gray-800',
  CANCELLED: 'bg-red-100 text-red-800'
};
const CASE_STAGE_COLOR = {
  DRAFT: 'bg-slate-100 text-slate-700',
  FILED: 'bg-blue-100 text-blue-800',
  HEARING: 'bg-amber-100 text-amber-800',
  ARGUMENT: 'bg-purple-100 text-purple-800',
  JUDGMENT: 'bg-indigo-100 text-indigo-800',
  CLOSED: 'bg-green-100 text-green-800'
};
const CASE_TYPES = ['CIVIL', 'CRIMINAL', 'CORPORATE', 'TAX', 'FAMILY', 'OTHER'];

export default function CalendarPage() {
  const [view, setView] = useState('month');
  const [current, setCurrent] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [hearings, setHearings] = useState([]);
  const [byDate, setByDate] = useState({});
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [advocateFilter, setAdvocateFilter] = useState('');
  const [courtFilter, setCourtFilter] = useState('');
  const [caseTypeFilter, setCaseTypeFilter] = useState('');
  const [employees, setEmployees] = useState([]);
  const [courts, setCourts] = useState([]);
  const [addModal, setAddModal] = useState(false);
  const [cases, setCases] = useState([]);
  const [addForm, setAddForm] = useState({
    case_id: '',
    hearing_date: '',
    courtroom: '',
    hearing_type: 'REGULAR',
    status: 'UPCOMING',
    remarks: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [rescheduleModal, setRescheduleModal] = useState(null);
  const [rescheduleForm, setRescheduleForm] = useState({ hearing_date: '', reason: '' });
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  const [causeListModal, setCauseListModal] = useState(false);
  const [causeListFile, setCauseListFile] = useState(null);
  const [causeListDate, setCauseListDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [causeListLoading, setCauseListLoading] = useState(false);
  const [diaryPdfLoading, setDiaryPdfLoading] = useState(false);
  const { success, error: showError } = useNotification();

  const getStartEnd = () => {
    const y = current.getFullYear();
    const m = current.getMonth();
    const d = current.getDate();
    if (view === 'month') {
      return {
        start: new Date(y, m, 1),
        end: new Date(y, m + 1, 0, 23, 59, 59)
      };
    }
    if (view === 'week') {
      const day = current.getDay();
      const weekStart = new Date(current);
      weekStart.setDate(d - day);
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      return { start: weekStart, end: weekEnd };
    }
    if (view === 'daily') {
      const dayStart = new Date(y, m, d, 0, 0, 0);
      const dayEnd = new Date(y, m, d, 23, 59, 59);
      return { start: dayStart, end: dayEnd };
    }
    return {
      start: new Date(y, m, 1),
      end: new Date(y, m + 1, 0, 23, 59, 59)
    };
  };

  const load = async () => {
    setLoading(true);
    const { start, end } = getStartEnd();
    try {
      const params = { start: start.toISOString(), end: end.toISOString() };
      if (statusFilter) params.status = statusFilter;
      if (advocateFilter) params.advocate_id = advocateFilter;
      if (courtFilter) params.court_id = courtFilter;
      if (caseTypeFilter) params.case_type = caseTypeFilter;
      const { data } = await getCalendarView(params);
      setHearings(data.data || []);
      setByDate(data.byDate || {});
    } catch (err) {
      setHearings([]);
      setByDate({});
      showError(getApiMessage(err, 'Failed to load calendar'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [
    current.getFullYear(),
    current.getMonth(),
    current.getDate(),
    view,
    statusFilter,
    advocateFilter,
    courtFilter,
    caseTypeFilter
  ]);

  useEffect(() => {
    getEmployees().then((r) => setEmployees(r.data?.data || [])).catch(() => {});
    listCourts({ limit: 200 }).then((r) => setCourts(r.data?.data || [])).catch(() => {});
  }, []);

  const openAdd = () => {
    listCases({ limit: 200 }).then(({ data }) => setCases(data.data || [])).catch(() => {});
    setAddForm({
      case_id: '',
      hearing_date: '',
      courtroom: '',
      hearing_type: 'REGULAR',
      status: 'UPCOMING',
      remarks: ''
    });
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
      success('Hearing created successfully.');
      setAddModal(false);
      load();
    } catch (err) {
      showError(getApiMessage(err, 'Failed to create hearing'));
    } finally {
      setSubmitting(false);
    }
  };

  const openReschedule = (h) => {
    setRescheduleModal(h);
    setRescheduleForm({
      hearing_date: h.hearing_date ? new Date(h.hearing_date).toISOString().slice(0, 16) : '',
      reason: ''
    });
  };

  const handleReschedule = async (e) => {
    e.preventDefault();
    if (!rescheduleModal || !rescheduleForm.hearing_date) return;
    setRescheduleLoading(true);
    try {
      await rescheduleHearing(rescheduleModal.id, {
        hearing_date: new Date(rescheduleForm.hearing_date).toISOString(),
        reason: rescheduleForm.reason || undefined
      });
      success('Hearing rescheduled. Notifications sent.');
      setRescheduleModal(null);
      load();
    } catch (err) {
      showError(getApiMessage(err, 'Reschedule failed'));
    } finally {
      setRescheduleLoading(false);
    }
  };

  const handleDiaryPdf = async () => {
    const date = current.toISOString().slice(0, 10);
    setDiaryPdfLoading(true);
    try {
      const params = { date };
      if (advocateFilter) params.advocate_id = advocateFilter;
      if (courtFilter) params.court_id = courtFilter;
      if (caseTypeFilter) params.case_type = caseTypeFilter;
      const { data } = await getDiaryPdf(params);
      const url = window.URL.createObjectURL(new Blob([data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `court-diary-${date}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      success('Diary PDF downloaded.');
    } catch (err) {
      showError(getApiMessage(err, 'Failed to generate PDF'));
    } finally {
      setDiaryPdfLoading(false);
    }
  };

  const handleCauseListUpload = async (e) => {
    e.preventDefault();
    if (!causeListFile) {
      showError('Select a PDF file.');
      return;
    }
    setCauseListLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', causeListFile);
      formData.append('hearing_date', causeListDate);
      const { data } = await uploadCauseList(formData);
      success(`Matched ${data.matched} cases, created ${data.created} hearings.`);
      setCauseListModal(false);
      setCauseListFile(null);
      load();
    } catch (err) {
      showError(getApiMessage(err, 'Cause list import failed'));
    } finally {
      setCauseListLoading(false);
    }
  };

  const hearingColor = (h) => CASE_STAGE_COLOR[h.Case?.status] || STATUS_COLOR[h.status] || 'bg-gray-100 text-gray-800';

  const monthStart = new Date(current.getFullYear(), current.getMonth(), 1);
  const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0);
  const startDay = monthStart.getDay();
  const daysInMonth = monthEnd.getDate();
  const prevMonth = () => setCurrent(new Date(current.getFullYear(), current.getMonth() - 1));
  const nextMonth = () => setCurrent(new Date(current.getFullYear(), current.getMonth() + 1));
  const prevWeek = () => {
    const d = new Date(current);
    d.setDate(d.getDate() - 7);
    setCurrent(d);
  };
  const nextWeek = () => {
    const d = new Date(current);
    d.setDate(d.getDate() + 7);
    setCurrent(d);
  };
  const prevDay = () => {
    const d = new Date(current);
    d.setDate(d.getDate() - 1);
    setCurrent(d);
  };
  const nextDay = () => {
    const d = new Date(current);
    d.setDate(d.getDate() + 1);
    setCurrent(d);
  };

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
          <div key={h.id} className="flex items-center gap-1">
            <Link to={`/hearings/${h.id}`} className={`flex-1 text-xs px-2 py-0.5 rounded truncate ${hearingColor(h)}`} title={h.Case?.case_title}>
              {h.Case?.case_title || 'Hearing'}
            </Link>
            {h.status === 'UPCOMING' && (
              <button type="button" onClick={(e) => { e.preventDefault(); openReschedule(h); }} className="text-xs text-primary hover:underline" title="Reschedule">↻</button>
            )}
          </div>
        ))}
        {dayHearings.length > 3 && <span className="text-xs text-gray-500">+{dayHearings.length - 3}</span>}
      </div>
    );
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const { start: weekStart } = view === 'week' ? getStartEnd() : { start: current };
  const weekDates = view === 'week' ? Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  }) : [];

  const dailyHearings = view === 'daily' ? (byDate[current.toISOString().slice(0, 10)] || []) : [];

  return (
    <div>
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-wrap justify-between items-center gap-2">
          <h1 className="text-2xl font-bold text-primary">Court Diary – Hearing Calendar</h1>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={openAdd} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">Add Hearing</button>
            <button type="button" onClick={() => setCauseListModal(true)} className="px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary/5">Import Cause List</button>
            <button type="button" onClick={handleDiaryPdf} disabled={diaryPdfLoading} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">
              {diaryPdfLoading ? 'Generating…' : 'Download Diary PDF'}
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={advocateFilter} onChange={(e) => setAdvocateFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <option value="">All advocates</option>
            {employees.map((emp) => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
          </select>
          <select value={courtFilter} onChange={(e) => setCourtFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <option value="">All courts</option>
            {courts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={caseTypeFilter} onChange={(e) => setCaseTypeFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <option value="">All case types</option>
            {CASE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <div className="flex rounded-lg border border-gray-300 overflow-hidden">
            <button type="button" onClick={() => setView('month')} className={`px-3 py-2 text-sm ${view === 'month' ? 'bg-primary text-white' : 'bg-white'}`}>Month</button>
            <button type="button" onClick={() => setView('week')} className={`px-3 py-2 text-sm ${view === 'week' ? 'bg-primary text-white' : 'bg-white'}`}>Week</button>
            <button type="button" onClick={() => setView('daily')} className={`px-3 py-2 text-sm ${view === 'daily' ? 'bg-primary text-white' : 'bg-white'}`}>Day</button>
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

      {view === 'week' && (
        <div className="bg-white border border-gray-200 rounded-lg shadow overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <button type="button" onClick={prevWeek} className="px-3 py-1 border rounded hover:bg-gray-50">Prev</button>
            <h2 className="text-lg font-semibold text-primary">
              {weekDates[0]?.toLocaleDateString()} – {weekDates[6]?.toLocaleDateString()}
            </h2>
            <button type="button" onClick={nextWeek} className="px-3 py-1 border rounded hover:bg-gray-50">Next</button>
          </div>
          <div className="grid grid-cols-7 divide-x divide-gray-200">
            {weekDates.map((day) => {
              const dateStr = day.toISOString().slice(0, 10);
              const dayHearings = byDate[dateStr] || [];
              return (
                <div key={dateStr} className="min-h-[200px] p-2">
                  <div className="text-sm font-semibold text-gray-700 mb-2">{day.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' })}</div>
                  {dayHearings.map((h) => (
                    <div key={h.id} className="mb-1">
                      <Link to={`/hearings/${h.id}`} className={`block text-xs px-2 py-1 rounded ${hearingColor(h)}`}>{h.Case?.case_title || 'Hearing'}</Link>
                      {h.status === 'UPCOMING' && (
                        <button type="button" onClick={() => openReschedule(h)} className="text-xs text-primary mt-0.5">Reschedule</button>
                      )}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {view === 'daily' && (
        <div className="bg-white border border-gray-200 rounded-lg shadow overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <button type="button" onClick={prevDay} className="px-3 py-1 border rounded hover:bg-gray-50">Prev</button>
            <h2 className="text-lg font-semibold text-primary">{current.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h2>
            <button type="button" onClick={nextDay} className="px-3 py-1 border rounded hover:bg-gray-50">Next</button>
          </div>
          {loading ? <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-accent" /></div> : (
            <ul className="divide-y divide-gray-200">
              {dailyHearings.length === 0 && <li className="px-6 py-12 text-center text-gray-500">No hearings this day.</li>}
              {dailyHearings.map((h) => (
                <li key={h.id} className="px-6 py-4 hover:bg-gray-50 flex justify-between items-center flex-wrap gap-2">
                  <div>
                    <Link to={`/hearings/${h.id}`} className="font-medium text-primary hover:text-accent">{h.Case?.case_title || 'Hearing'}</Link>
                    <p className="text-sm text-gray-500">{h.Case?.Client?.name} · {h.hearing_date ? new Date(h.hearing_date).toLocaleString() : '—'} · {h.Case?.Court?.name || '—'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 text-xs rounded ${hearingColor(h)}`}>{h.Case?.status || h.status}</span>
                    {h.status === 'UPCOMING' && <button type="button" onClick={() => openReschedule(h)} className="text-sm text-primary hover:underline">Reschedule</button>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {view === 'list' && (
        <div className="bg-white border border-gray-200 rounded-lg shadow overflow-hidden">
          {loading ? <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-accent" /></div> : (
            <ul className="divide-y divide-gray-200">
              {hearings.length === 0 && <li className="px-6 py-12 text-center text-gray-500">No hearings in this period.</li>}
              {hearings.map((h) => (
                <li key={h.id} className="px-6 py-4 hover:bg-gray-50 flex justify-between items-center flex-wrap gap-2">
                  <div>
                    <Link to={`/hearings/${h.id}`} className="font-medium text-primary hover:text-accent">{h.Case?.case_title || 'Hearing'}</Link>
                    <p className="text-sm text-gray-500">{h.Case?.Client?.name} · {h.hearing_date ? new Date(h.hearing_date).toLocaleString() : '—'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 text-xs rounded ${hearingColor(h)}`}>{h.Case?.status || h.status}</span>
                    {h.status === 'UPCOMING' && <button type="button" onClick={() => openReschedule(h)} className="text-sm text-primary hover:underline">Reschedule</button>}
                  </div>
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

      {rescheduleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-lg font-bold text-primary mb-2">Reschedule Hearing</h2>
            <p className="text-sm text-gray-600 mb-4">{rescheduleModal.Case?.case_title}</p>
            <form onSubmit={handleReschedule} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New date & time *</label>
                <input type="datetime-local" value={rescheduleForm.hearing_date} onChange={(e) => setRescheduleForm({ ...rescheduleForm, hearing_date: e.target.value })} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason (optional)</label>
                <input type="text" value={rescheduleForm.reason} onChange={(e) => setRescheduleForm({ ...rescheduleForm, reason: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder="e.g. Court holiday" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={rescheduleLoading} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50">Reschedule</button>
                <button type="button" onClick={() => setRescheduleModal(null)} className="px-4 py-2 border rounded-lg">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {causeListModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-lg font-bold text-primary mb-4">Import Cause List (PDF)</h2>
            <p className="text-sm text-gray-600 mb-4">Upload a PDF cause list. Case numbers will be extracted and matched to your cases; hearings will be created for the selected date.</p>
            <form onSubmit={handleCauseListUpload} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hearing date for created entries</label>
                <input type="date" value={causeListDate} onChange={(e) => setCauseListDate(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PDF file *</label>
                <input type="file" accept="application/pdf" onChange={(e) => setCauseListFile(e.target.files?.[0] || null)} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={causeListLoading || !causeListFile} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50">Import</button>
                <button type="button" onClick={() => { setCauseListModal(false); setCauseListFile(null); }} className="px-4 py-2 border rounded-lg">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
