import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCase, addHearing, removeHearing, uploadCaseDocument, removeCaseDocument } from '../../services/caseApi';

export default function CaseProfile() {
  const { id } = useParams();
  const [caseRecord, setCaseRecord] = useState(null);
  const [error, setError] = useState('');
  const [hearingForm, setHearingForm] = useState({ hearing_date: '', courtroom: '', remarks: '' });
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
        remarks: hearingForm.remarks || null
      });
      setHearingForm({ hearing_date: '', courtroom: '', remarks: '' });
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

  return (
    <div className="max-w-4xl">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">{caseRecord.case_title}</h1>
          <p className="text-gray-500 mt-1">{caseRecord.case_number}</p>
        </div>
        <Link to={`/cases/${id}/edit`} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">Edit</Link>
      </div>

      {error && <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>}

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex flex-wrap gap-2">
          <span className={`px-2 py-0.5 text-xs rounded ${caseRecord.status === 'CLOSED' ? 'bg-gray-100' : caseRecord.status === 'DRAFT' ? 'bg-yellow-100' : 'bg-green-100 text-green-800'}`}>
            {caseRecord.status}
          </span>
          <span className="px-2 py-0.5 text-xs rounded bg-primary/10 text-primary">{caseRecord.case_type}</span>
          <span className="px-2 py-0.5 text-xs rounded bg-accent/20 text-primary">{caseRecord.priority}</span>
        </div>
        <dl className="px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><dt className="text-sm text-gray-500">Court</dt><dd className="font-medium">{caseRecord.court_name || '—'}</dd></div>
          <div><dt className="text-sm text-gray-500">Filing date</dt><dd className="font-medium">{caseRecord.filing_date || '—'}</dd></div>
          <div><dt className="text-sm text-gray-500">Next hearing</dt><dd className="font-medium">{caseRecord.next_hearing_date || '—'}</dd></div>
          <div className="md:col-span-2"><dt className="text-sm text-gray-500">Assigned to</dt><dd className="font-medium">{caseRecord.Assignee?.name || '—'}</dd></div>
          <div className="md:col-span-2"><dt className="text-sm text-gray-500">Created by</dt><dd className="font-medium">{caseRecord.Creator?.name || '—'}</dd></div>
          {caseRecord.description && (
            <div className="md:col-span-2"><dt className="text-sm text-gray-500">Description</dt><dd className="font-medium whitespace-pre-wrap">{caseRecord.description}</dd></div>
          )}
        </dl>
      </div>

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
        <h2 className="text-lg font-semibold text-primary mb-4">Hearings</h2>
        {hearings.length > 0 && (
          <ul className="divide-y divide-gray-200 mb-4">
            {hearings.map((h) => (
              <li key={h.id} className="py-3 flex justify-between items-start">
                <div>
                  <p className="font-medium">{h.hearing_date || 'No date'}</p>
                  {h.courtroom && <p className="text-sm text-gray-500">{h.courtroom}</p>}
                  {h.remarks && <p className="text-sm text-gray-600 mt-1">{h.remarks}</p>}
                </div>
                <button type="button" onClick={() => handleRemoveHearing(h.id)} className="text-red-600 text-sm hover:underline">Remove</button>
              </li>
            ))}
          </ul>
        )}
        <form onSubmit={handleAddHearing} className="flex flex-wrap gap-2 items-end">
          <input type="date" value={hearingForm.hearing_date} onChange={(e) => setHearingForm({ ...hearingForm, hearing_date: e.target.value })} className="px-2 py-1 border rounded" />
          <input placeholder="Courtroom" value={hearingForm.courtroom} onChange={(e) => setHearingForm({ ...hearingForm, courtroom: e.target.value })} className="px-2 py-1 border rounded w-32" />
          <input placeholder="Remarks" value={hearingForm.remarks} onChange={(e) => setHearingForm({ ...hearingForm, remarks: e.target.value })} className="px-2 py-1 border rounded w-40" />
          <button type="submit" className="px-3 py-1 bg-primary text-white rounded hover:bg-primary/90 text-sm">Add hearing</button>
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

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-primary mb-2">Timeline</h2>
        <p className="text-gray-500 text-sm">Timeline view will be available in a future update.</p>
      </div>
    </div>
  );
}
