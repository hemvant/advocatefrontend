import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCase, addHearing, removeHearing, uploadCaseDocument, removeCaseDocument } from '../../services/caseApi';

export default function CaseProfile() {
  const { id } = useParams();
  const [caseRecord, setCaseRecord] = useState(null);
  const [error, setError] = useState('');
  const [hearingForm, setHearingForm] = useState({
    hearing_date: '',
    courtroom: '',
    remarks: '',
    outcome_status: '',
    outcome_notes: '',
    next_hearing_date: ''
  });
  const [docForm, setDocForm] = useState({ file_name: '', file_path: '' });

  const load = () => {
    getCase(id)
      .then(({ data }) => setCaseRecord(data.data))
      .catch(() => setError('Case not found'));
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleAddHearing = async (e) => {
    e.preventDefault();
    try {
      await addHearing(id, {
        hearing_date: hearingForm.hearing_date || null,
        courtroom: hearingForm.courtroom || null,
        remarks: hearingForm.remarks || null,
        outcome_status: hearingForm.outcome_status || null,
        outcome_notes: hearingForm.outcome_notes || null,
        next_hearing_date: hearingForm.next_hearing_date || null
      });
      setHearingForm({ hearing_date: '', courtroom: '', remarks: '', outcome_status: '', outcome_notes: '', next_hearing_date: '' });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add hearing');
    }
  };

  const handleRemoveHearing = async (hearingId) => {
    try {
      await removeHearing(id, hearingId);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove');
    }
  };

  const handleUploadDoc = async (e) => {
    e.preventDefault();
    if (!docForm.file_name.trim()) return;
    try {
      await uploadCaseDocument(id, { file_name: docForm.file_name.trim(), file_path: docForm.file_path || null });
      setDocForm({ file_name: '', file_path: '' });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    }
  };

  const handleRemoveDoc = async (docId) => {
    try {
      await removeCaseDocument(id, docId);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Remove failed');
    }
  };

  if (error && !caseRecord) return <div className="p-4 text-red-600">{error}</div>;
  if (!caseRecord) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-accent" /></div>;

  const hearings = caseRecord.CaseHearings || [];
  const documents = caseRecord.CaseDocuments || [];
  const assignmentHistory = caseRecord.AssignmentHistory || [];
  const judgeHistory = caseRecord.JudgeHistory || [];
  const lastHearing = hearings.length > 0 ? hearings[hearings.length - 1] : null;

  return (
    <div className="max-w-4xl">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">{caseRecord.case_title}</h1>
          <p className="text-gray-500 mt-1">{caseRecord.case_number}</p>
        </div>
        <div className="flex gap-2">
          <Link to={`/cases/${id}/tasks`} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Tasks</Link>
          <Link to={`/cases/${id}/edit`} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">Edit</Link>
        </div>
      </div>

      {error && <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>}

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex flex-wrap gap-2">
          <span className={`px-2 py-0.5 text-xs rounded ${caseRecord.status === 'CLOSED' ? 'bg-gray-100' : caseRecord.status === 'DRAFT' ? 'bg-yellow-100' : 'bg-green-100 text-green-800'}`}>
            {caseRecord.status}
          </span>
          <span className={`px-2 py-0.5 text-xs rounded ${caseRecord.case_lifecycle_status === 'Closed' ? 'bg-gray-200' : caseRecord.case_lifecycle_status === 'On_Hold' ? 'bg-amber-100' : caseRecord.case_lifecycle_status === 'Appeal' ? 'bg-purple-100' : 'bg-green-100 text-green-800'}`}>
            {caseRecord.case_lifecycle_status}
          </span>
          <span className="px-2 py-0.5 text-xs rounded bg-primary/10 text-primary">{caseRecord.case_type}</span>
          <span className="px-2 py-0.5 text-xs rounded bg-accent/20 text-primary">{caseRecord.priority}</span>
        </div>
        <dl className="px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><dt className="text-sm text-gray-500">Court</dt><dd className="font-medium">{caseRecord.Court?.name || '—'}</dd></div>
          <div><dt className="text-sm text-gray-500">Bench</dt><dd className="font-medium">{caseRecord.Bench?.name || '—'}</dd></div>
          <div><dt className="text-sm text-gray-500">Filing date</dt><dd className="font-medium">{caseRecord.filing_date || '—'}</dd></div>
          <div><dt className="text-sm text-gray-500">Next hearing</dt><dd className="font-medium">{caseRecord.next_hearing_date || '—'}</dd></div>
          <div className="md:col-span-2"><dt className="text-sm text-gray-500">Created by</dt><dd className="font-medium">{caseRecord.Creator?.name || '—'}</dd></div>
          {caseRecord.description && (
            <div className="md:col-span-2"><dt className="text-sm text-gray-500">Description</dt><dd className="font-medium whitespace-pre-wrap">{caseRecord.description}</dd></div>
          )}
        </dl>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-primary mb-2">Current Assigned Lawyer</h2>
        <p className="font-medium">{caseRecord.Assignee?.name || '—'}</p>
        {caseRecord.Assignee?.email && <p className="text-sm text-gray-500">{caseRecord.Assignee.email}</p>}
      </div>

      {assignmentHistory.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-primary mb-4">Assignment History</h2>
          <ul className="space-y-3">
            {[...assignmentHistory].reverse().map((a) => (
              <li key={a.id} className="flex items-start gap-3 text-sm border-l-2 border-gray-200 pl-3 py-1">
                <div className="flex-1">
                  <span className="font-medium">{a.Employee?.name || '—'}</span>
                  <span className="text-gray-500 ml-2">
                    {a.assigned_at ? new Date(a.assigned_at).toLocaleString() : ''}
                    {a.unassigned_at ? ` → ${new Date(a.unassigned_at).toLocaleString()}` : ' (current)'}
                  </span>
                  {a.reason && <span className="text-gray-500 block">{a.reason}</span>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-primary mb-2">Current Judge</h2>
        <p className="font-medium">{caseRecord.Judge?.name || '—'}</p>
        {caseRecord.Judge?.designation && <p className="text-sm text-gray-500">{caseRecord.Judge.designation}</p>}
      </div>

      {judgeHistory.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-primary mb-4">Judge History</h2>
          <ul className="space-y-3">
            {[...judgeHistory].reverse().map((j) => (
              <li key={j.id} className="flex items-start gap-3 text-sm border-l-2 border-gray-200 pl-3 py-1">
                <div className="flex-1">
                  <span className="font-medium">{j.Judge?.name || '—'}</span>
                  <span className="text-gray-500 ml-2">
                    {j.assigned_at ? new Date(j.assigned_at).toLocaleString() : ''}
                    {j.unassigned_at ? ` → ${new Date(j.unassigned_at).toLocaleString()}` : ' (current)'}
                  </span>
                  {j.transfer_reason && <span className="text-gray-500 block">{j.transfer_reason}</span>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-primary mb-2">Client</h2>
        {caseRecord.Client ? (
          <>
            <p className="font-medium">{caseRecord.Client.name}</p>
            <p className="text-sm text-gray-500">{caseRecord.Client.email || caseRecord.Client.phone || ''}</p>
          </>
        ) : (
          <p className="text-gray-500">—</p>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-primary mb-4">Hearing Timeline</h2>
        {hearings.length > 0 && (
          <ul className="divide-y divide-gray-200 mb-6">
            {hearings.map((h) => (
              <li key={h.id} className="py-4 flex justify-between items-start gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-primary">Hearing #{h.hearing_number ?? '—'}</span>
                    <span className="text-sm text-gray-500">{h.hearing_date ? new Date(h.hearing_date).toLocaleString() : 'No date'}</span>
                  </div>
                  <div className="mt-1 grid grid-cols-1 sm:grid-cols-2 gap-1 text-sm">
                    <span className="text-gray-600">Judge: {h.Judge?.name || '—'}</span>
                    <span className="text-gray-600">Outcome: {h.outcome_status || '—'}</span>
                  </div>
                  {h.courtroom && <p className="text-sm text-gray-500 mt-1">Courtroom: {h.courtroom}</p>}
                  {h.outcome_notes && <p className="text-sm text-gray-600 mt-1">{h.outcome_notes}</p>}
                  {h.remarks && <p className="text-sm text-gray-600 mt-1">{h.remarks}</p>}
                  {h.next_hearing_date && <p className="text-sm text-primary mt-1">Next: {h.next_hearing_date}</p>}
                </div>
                <button type="button" onClick={() => handleRemoveHearing(h.id)} className="text-red-600 text-sm hover:underline shrink-0">Remove</button>
              </li>
            ))}
          </ul>
        )}

        <h3 className="text-md font-semibold text-primary mb-3">Add New Hearing</h3>
        {lastHearing && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm font-medium text-gray-700">Previous hearing (Hearing #{lastHearing.hearing_number})</p>
            <p className="text-sm text-gray-600">{lastHearing.hearing_date ? new Date(lastHearing.hearing_date).toLocaleDateString() : '—'} · Judge: {lastHearing.Judge?.name || '—'}</p>
            {lastHearing.outcome_status && <p className="text-sm text-gray-600">Outcome: {lastHearing.outcome_status}</p>}
            {lastHearing.outcome_notes && <p className="text-sm text-gray-600 mt-1">{lastHearing.outcome_notes}</p>}
          </div>
        )}
        <form onSubmit={handleAddHearing} className="space-y-3">
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Date</label>
              <input type="datetime-local" value={hearingForm.hearing_date} onChange={(e) => setHearingForm({ ...hearingForm, hearing_date: e.target.value })} className="px-2 py-1 border rounded" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Courtroom</label>
              <input placeholder="Courtroom" value={hearingForm.courtroom} onChange={(e) => setHearingForm({ ...hearingForm, courtroom: e.target.value })} className="px-2 py-1 border rounded w-32" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Outcome</label>
              <select value={hearingForm.outcome_status} onChange={(e) => setHearingForm({ ...hearingForm, outcome_status: e.target.value })} className="px-2 py-1 border rounded w-40">
                <option value="">—</option>
                <option value="adjourned">Adjourned</option>
                <option value="completed">Completed</option>
                <option value="disposed">Disposed</option>
                <option value="argument">Argument</option>
                <option value="order_reserved">Order reserved</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Next hearing date</label>
              <input type="date" value={hearingForm.next_hearing_date} onChange={(e) => setHearingForm({ ...hearingForm, next_hearing_date: e.target.value })} className="px-2 py-1 border rounded" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Remarks / Outcome notes</label>
            <textarea placeholder="Remarks or outcome notes" value={hearingForm.remarks || hearingForm.outcome_notes} onChange={(e) => setHearingForm({ ...hearingForm, remarks: e.target.value, outcome_notes: e.target.value })} className="px-2 py-1 border rounded w-full max-w-md" rows={2} />
          </div>
          <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm">Add hearing</button>
        </form>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-primary">Documents</h2>
          <Link to={`/cases/${id}/documents`} className="text-sm text-primary hover:underline">Manage documents →</Link>
        </div>
        {documents.length > 0 && (
          <ul className="divide-y divide-gray-200 mb-4">
            {documents.map((d) => (
              <li key={d.id} className="py-3 flex justify-between items-center">
                <span className="font-medium">{d.document_name || d.file_name}</span>
                <button type="button" onClick={() => handleRemoveDoc(d.id)} className="text-red-600 text-sm hover:underline">Remove</button>
              </li>
            ))}
          </ul>
        )}
        <form onSubmit={handleUploadDoc} className="flex flex-wrap gap-2 items-end">
          <input placeholder="File name" value={docForm.file_name} onChange={(e) => setDocForm({ ...docForm, file_name: e.target.value })} className="px-2 py-1 border rounded w-48" required />
          <input placeholder="Path (optional)" value={docForm.file_path} onChange={(e) => setDocForm({ ...docForm, file_path: e.target.value })} className="px-2 py-1 border rounded w-48" />
          <button type="submit" className="px-3 py-1 bg-primary text-white rounded hover:bg-primary/90 text-sm">Add document</button>
        </form>
        <p className="text-xs text-gray-500 mt-2">For full document management (upload file, versions, types), use Manage documents.</p>
      </div>

    </div>
  );
}
