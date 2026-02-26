import React, { useState } from 'react';
import { uploadDocument } from '../../services/documentApi';
import { getApiMessage } from '../../services/apiHelpers';

const DOC_TYPES = ['PETITION', 'EVIDENCE', 'AGREEMENT', 'NOTICE', 'ORDER', 'OTHER'];
const ACCEPT_TYPES = '.pdf,.doc,.docx,.txt,.xls,.xlsx,image/jpeg,image/png,image/gif,image/webp';
const MAX_FILE_SIZE_MB = 25;
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;
const IMAGE_MAX_WIDTH = 1920;
const IMAGE_QUALITY = 0.85;

function isImageFile(file) {
  return file && file.type && file.type.startsWith('image/');
}

function compressImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const { width, height } = img;
      const scale = width > IMAGE_MAX_WIDTH ? IMAGE_MAX_WIDTH / width : 1;
      const w = Math.round(width * scale);
      const h = Math.round(height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file);
        return;
      }
      ctx.drawImage(img, 0, 0, w, h);
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          const name = (file.name || 'image.jpg').replace(/\.[^.]+$/i, '.jpg');
          resolve(new File([blob], name, { type: 'image/jpeg', lastModified: Date.now() }));
        },
        'image/jpeg',
        IMAGE_QUALITY
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };
    img.src = url;
  });
}

export default function UploadDocumentModal({ caseId, cases = [], onClose, onSuccess }) {
  const [selectedCaseId, setSelectedCaseId] = useState(caseId || '');
  const [document_name, setDocument_name] = useState('');
  const [document_type, setDocument_type] = useState('OTHER');
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = React.useRef(null);
  const cameraInputRef = React.useRef(null);

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
      setError(getApiMessage(err, 'Upload failed'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = async (e) => {
    const next = e.target.files?.[0] || null;
    if (!next) {
      setFile(null);
      return;
    }
    if (isImageFile(next)) {
      setCompressing(true);
      try {
        const compressed = await compressImage(next);
        setFile(compressed);
      } catch {
        setFile(next);
      } finally {
        setCompressing(false);
      }
    } else {
      setFile(next);
    }
    e.target.value = '';
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
            <div className="space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPT_TYPES}
                onChange={handleFileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent text-sm file:mr-2 file:py-2 file:px-3 file:rounded file:border-0 file:text-sm file:bg-primary file:text-white file:cursor-pointer"
              />
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-sm">or</span>
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileChange}
                  className="hidden"
                  id="upload-doc-camera"
                />
                <label
                  htmlFor="upload-doc-camera"
                  className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer touch-manipulation"
                >
                  <span aria-hidden>📷</span> Take photo
                </label>
              </div>
            </div>
            {compressing && <p className="text-xs text-gray-500 mt-1">Compressing image…</p>}
            {file && <p className="text-xs text-gray-500 mt-1 truncate">{file.name} ({(file.size / 1024).toFixed(1)} KB)</p>}
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
            <button type="submit" disabled={submitting || compressing} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50">
              {submitting ? 'Uploading…' : compressing ? 'Preparing…' : 'Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
