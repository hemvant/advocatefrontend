import React, { useState, useEffect } from 'react';
import { listCaseClients } from '../../services/caseApi';
import { getEmployees } from '../../services/orgApi';
import { useOrgAuth } from '../../context/OrgAuthContext';

const CASE_TYPES = ['CIVIL', 'CRIMINAL', 'CORPORATE', 'TAX', 'FAMILY', 'OTHER'];
const STATUSES = ['DRAFT', 'FILED', 'HEARING', 'ARGUMENT', 'JUDGMENT', 'CLOSED'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'];

const defaultCase = {
  client_id: '',
  case_title: '',
  case_number: '',
  court_name: '',
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
    court_name: caseRecord.court_name || '',
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

  useEffect(() => {
    listCaseClients().then(({ data }) => setClients(data.data || [])).catch(() => {});
    if (isOrgAdmin) getEmployees().then(({ data }) => setEmployees(data.data || [])).catch(() => {});
  }, [isOrgAdmin]);

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      client_id: parseInt(form.client_id, 10),
      case_title: form.case_title,
      case_number: form.case_number || undefined,
      court_name: form.court_name || null,
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Court name</label>
          <input
            type="text"
            value={form.court_name}
            onChange={(e) => update('court_name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
          />
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
