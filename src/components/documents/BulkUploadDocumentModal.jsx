import React, { useState, useRef } from 'react';
import { bulkUploadDocuments } from '../../services/documentApi';
import { getApiMessage } from '../../services/apiHelpers';

const DOC_TYPES = ['PETITION', 'EVIDENCE', 'AGREEMENT', 'NOTICE', 'ORDER', 'OTHER'];
const ACCEPT = '.pdf,.doc,.docx,.txt,.xls,.xlsx,image/jpeg,image/png,image/gif,image/webp';
const MAX_FILES = 20;

export default function BulkUploadDocumentModal({ cases = [], onClose, onSuccess }) {
  const [selectedCaseId, setSelectedCaseId] = useState('');
  const [documentType, setDocumentType] = useState('OTHER');
  const [files, setFiles] = useState([]);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...selected].slice(0, MAX_FILES));
    e.target.value = '';
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const dropped = Array.from(e.dataTransfer.files || []);
    setFiles((prev) => [...prev, ...dropped].slice(0, MAX_FILES));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCaseId || files.length === 0) {
      setError('Select a case and at least one file.');
      return;
    }
    setUploading(true);
    setError('');
    setProgress(0);
    try {
      const formData = new FormData();
      formData.append('case_id', selectedCaseId);
      formData.append('document_type', documentType);
      files.forEach((file) => formData.append('files', file));
      await bulkUploadDocuments(formData, (ev) => {
        if (ev.total) setProgress(Math.round((ev.loaded / ev.total) * 100));
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(getApiMessage(err, 'Bulk upload failed'));
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-semibold text-primary p-4 border-b border-gray-200">Bulk upload documents</h2>
        {error && <div className="mx-4 mt-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Case *</label>
            <select
              value={selectedCaseId}
              onChange={(e) => setSelectedCaseId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            >
              <option value="">Select case</option>
              {cases.map((c) => (
                <option key={c.id} value={c.id}>{c.case_title} ({c.case_number})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Document type</label>
            <select value={documentType} onChange={(e) => setDocumentType(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
              {DOC_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Files (drag & drop or click) *</label>
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => inputRef.current?.click()}
            >
              <input
                ref={inputRef}
                type="file"
                accept={ACCEPT}
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
              <p className="text-gray-500 text-sm">Drop files here or click to select (max {MAX_FILES})</p>
            </div>
            {files.length > 0 && (
              <ul className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                {files.map((f, i) => (
                  <li key={i} className="flex items-center justify-between text-sm text-gray-700 bg-gray-50 px-2 py-1 rounded">
                    <span className="truncate flex-1">{f.name}</span>
                    <button type="button" onClick={() => removeFile(i)} className="text-red-600 hover:underline ml-2">Remove</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {uploading && (
            <div className="space-y-1">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-sm text-gray-500">Uploading… {progress}%</p>
            </div>
          )}
          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50" disabled={uploading}>Cancel</button>
            <button type="submit" disabled={uploading || files.length === 0} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50">
              {uploading ? 'Uploading…' : `Upload ${files.length} file(s)`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
