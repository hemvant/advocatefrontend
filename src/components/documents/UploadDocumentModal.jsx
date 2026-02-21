import React, { useState } from 'react';
import { uploadDocument } from '../../services/documentApi';

const DOC_TYPES = ['PETITION', 'EVIDENCE', 'AGREEMENT', 'NOTICE', 'ORDER', 'OTHER'];
const ACCEPT_TYPES = '.pdf,.doc,.docx,.txt,.xls,.xlsx,image/jpeg,image/png,image/gif,image/webp';
const MAX_FILE_SIZE_MB = 25;
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;

export default function UploadDocumentModal({ caseId, cases = [], onClose, onSuccess }) {
  const [selectedCaseId, setSelectedCaseId] = useState(caseId || '');
  const [document_name, setDocument_name] = useState('');
  const [document_type, setDocument_type] = useState('OTHER');
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const effectiveCaseId = caseId || (selectedCaseId ? Number(selectedCaseId) : null);
  const showCaseSelect = caseId == null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!document_name.trim()) {
      setError('Document name is required');
      return;
    }
    if (!effectiveCaseId) {
      setError('Please select a case');
      return;
    }
    if (!file) {
      setError('Please select a file');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError(`File size must be under ${MAX_FILE_SIZE_MB} MB`);
      return;
    }
    const ext = (file.name || '').split('.').pop()?.toLowerCase();
    const allowed = ['pdf', 'doc', 'docx', 'txt', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'gif', 'webp'];
    if (ext && !allowed.includes(ext)) {
      setError('Allowed types: PDF, Word, Excel, text, images (JPEG, PNG, GIF, WebP)');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('case_id', String(effectiveCaseId));
      formData.append('document_name', document_name.trim());
      formData.append('document_type', document_type);
      if (notes.trim()) formData.append('notes', notes.trim());
      formData.append('file', file);
      await uploadDocument(formData);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.message || 'Upload failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-4 sm:p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-semibold text-primary mb-4">Upload document</h2>
        {error && <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>}
        <form onSubmit={handleSubmit}>
          {showCaseSelect && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Case *</label>
              <select
                value={selectedCaseId}
                onChange={(e) => setSelectedCaseId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
                required
              >
                <option value="">Select case</option>
                {cases.map((c) => (
                  <option key={c.id} value={c.id}>{c.case_title} ({c.case_number})</option>
                ))}
              </select>
            </div>
          )}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Document name *</label>
            <input
              type="text"
              value={document_name}
              onChange={(e) => setDocument_name(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
              placeholder="e.g. Petition filed 2024"
              maxLength={255}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Document type</label>
            <select
              value={document_type}
              onChange={(e) => setDocument_type(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
            >
              {DOC_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">File *</label>
            <input
              type="file"
              accept={ACCEPT_TYPES}
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
              placeholder="Optional notes"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={submitting} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50">
              {submitting ? 'Uploading…' : 'Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
