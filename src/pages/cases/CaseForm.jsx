import React, { useState, useEffect } from 'react';
import { listCaseClients } from '../../services/caseApi';
import { getEmployees } from '../../services/orgApi';
import {
  listCourts,
  listBenches,
  listCourtrooms,
  listJudges
} from '../../services/courtApi';
import { useOrgAuth } from '../../context/OrgAuthContext';

const CASE_TYPES = ['CIVIL', 'CRIMINAL', 'CORPORATE', 'TAX', 'FAMILY', 'OTHER'];
const STATUSES = ['DRAFT', 'FILED', 'HEARING', 'ARGUMENT', 'JUDGMENT', 'CLOSED'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'];

const defaultCase = {
  client_id: '',
  case_title: '',
  case_number: '',
  court_id: '',
  bench_id: '',
  judge_id: '',
  courtroom_id: '',
  case_type: 'OTHER',
  status: 'DRAFT',
  priority: 'MEDIUM',
  filing_date: '',
  next_hearing_date: '',
  description: '',
  assigned_to: ''
};

export default function CaseForm({ caseRecord, onSubmit, loading }) {
  const { isOrgAdmin } = useOrgAuth();
  const [form, setForm] = useState(caseRecord ? {
    ...defaultCase,
    client_id: caseRecord.client_id,
    case_title: caseRecord.case_title,
    case_number: caseRecord.case_number || '',
    court_id: caseRecord.court_id || '',
    bench_id: caseRecord.bench_id || '',
    judge_id: caseRecord.judge_id || '',
    courtroom_id: caseRecord.courtroom_id || '',
    case_type: caseRecord.case_type,
    status: caseRecord.status,
    priority: caseRecord.priority,
    filing_date: caseRecord.filing_date || '',
    next_hearing_date: caseRecord.next_hearing_date || '',
    description: caseRecord.description || '',
    assigned_to: caseRecord.assigned_to || ''
  } : { ...defaultCase });
  const [clients, setClients] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [courts, setCourts] = useState([]);
  const [benches, setBenches] = useState([]);
  const [judges, setJudges] = useState([]);
  const [courtrooms, setCourtrooms] = useState([]);

  useEffect(() => {
    listCaseClients().then(({ data }) => setClients(data.data || [])).catch(() => {});
    if (isOrgAdmin) getEmployees().then(({ data }) => setEmployees(data.data || [])).catch(() => {});
    listCourts({ is_active: true, limit: 500 }).then(({ data }) => setCourts(data.data || [])).catch(() => {});
  }, [isOrgAdmin]);

  useEffect(() => {
    if (!form.court_id) {
      setBenches([]); setJudges([]); setCourtrooms([]);
      return;
    }
    listBenches(form.court_id).then(({ data }) => setBenches(data.data || [])).catch(() => setBenches([]));
    listCourtrooms(form.court_id).then(({ data }) => setCourtrooms(data.data || [])).catch(() => setCourtrooms([]));
    listJudges({ court_id: form.court_id, is_active: true }).then(({ data }) => setJudges(data.data || [])).catch(() => setJudges([]));
  }, [form.court_id]);

  const update = (key, value) => {
    setForm((f) => {
      const next = { ...f, [key]: value };
      if (key === 'court_id') {
        next.bench_id = ''; next.judge_id = ''; next.courtroom_id = '';
      }
      return next;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      client_id: parseInt(form.client_id, 10),
      case_title: form.case_title,
      case_number: form.case_number || undefined,
      court_id: form.court_id ? parseInt(form.court_id, 10) : null,
      bench_id: form.bench_id ? parseInt(form.bench_id, 10) : null,
      judge_id: form.judge_id ? parseInt(form.judge_id, 10) : null,
      courtroom_id: form.courtroom_id ? parseInt(form.courtroom_id, 10) : null,
      case_type: form.case_type,
      status: form.status,
      priority: form.priority,
      filing_date: form.filing_date || null,
      next_hearing_date: form.next_hearing_date || null,
      description: form.description || null,
      assigned_to: form.assigned_to ? parseInt(form.assigned_to, 10) : null
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Client *</label>
          <select
            value={form.client_id}
            onChange={(e) => update('client_id', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
            required
            disabled={!!caseRecord}
          >
            <option value="">Select client</option>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Case number</label>
          <input
            type="text"
            value={form.case_number}
            onChange={(e) => update('case_number', e.target.value)}
            placeholder="Auto-generated if empty"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Case title *</label>
          <input
            type="text"
            value={form.case_title}
            onChange={(e) => update('case_title', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Court</label>
          <select
            value={form.court_id}
            onChange={(e) => update('court_id', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
          >
            <option value="">Select court</option>
            {courts.map((c) => <option key={c.id} value={c.id}>{c.name} {c.CourtType ? `(${c.CourtType.name})` : ''}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bench</label>
          <select
            value={form.bench_id}
            onChange={(e) => update('bench_id', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
            disabled={!form.court_id}
          >
            <option value="">Select bench</option>
            {benches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Judge</label>
          <select
            value={form.judge_id}
            onChange={(e) => update('judge_id', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
            disabled={!form.court_id}
          >
            <option value="">Select judge</option>
            {judges.map((j) => <option key={j.id} value={j.id}>{j.name} {j.designation ? `(${j.designation})` : ''}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Courtroom</label>
          <select
            value={form.courtroom_id}
            onChange={(e) => update('courtroom_id', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
            disabled={!form.court_id}
          >
            <option value="">Select courtroom</option>
            {courtrooms.map((r) => <option key={r.id} value={r.id}>{r.room_number || `Room ${r.id}`} {r.floor ? `- ${r.floor}` : ''}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Case type</label>
          <select
            value={form.case_type}
            onChange={(e) => update('case_type', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
          >
            {CASE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={form.status}
            onChange={(e) => update('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
          >
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
          <select
            value={form.priority}
            onChange={(e) => update('priority', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
          >
            {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        {isOrgAdmin && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assigned to</label>
            <select
              value={form.assigned_to}
              onChange={(e) => update('assigned_to', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
            >
              <option value="">—</option>
              {employees.map((emp) => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
            </select>
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Filing date</label>
          <input
            type="date"
            value={form.filing_date}
            onChange={(e) => update('filing_date', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Next hearing date</label>
          <input
            type="date"
            value={form.next_hearing_date}
            onChange={(e) => update('next_hearing_date', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
        />
      </div>
      <div className="flex gap-3">
        <button type="submit" disabled={loading} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50">
          {loading ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  );
}
