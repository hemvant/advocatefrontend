import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getDocument, downloadDocument, uploadNewVersion } from '../../services/documentApi';

export default function DocumentDetailPage() {
  const { id } = useParams();
  const [doc, setDoc] = useState(null);
  const [error, setError] = useState('');
  const [versionOpen, setVersionOpen] = useState(false);
  const [versionFile, setVersionFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const load = () => {
    getDocument(id)
      .then(({ data }) => setDoc(data.data))
      .catch(() => setError('Document not found'));
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleDownload = async () => {
    try {
      const { data } = await downloadDocument(id);
      const url = window.URL.createObjectURL(new Blob([data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = doc?.original_file_name || doc?.document_name || 'document';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.response?.data?.message || 'Download failed');
    }
  };

  const handleNewVersionSubmit = async (e) => {
    e.preventDefault();
    if (!versionFile) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', versionFile);
      await uploadNewVersion(id, formData);
      setVersionOpen(false);
      setVersionFile(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (error && !doc) return <div className="p-4 text-red-600">{error}</div>;
  if (!doc) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-accent" /></div>;

  const caseId = doc.Case?.id;
  const versions = doc.DocumentVersions || [];

  return (
    <div>
      <Link to={caseId ? `/cases/${caseId}/documents` : '/documents'} className="text-sm text-primary hover:underline mb-4 inline-block">← Back to documents</Link>
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">{doc.document_name || doc.original_file_name || 'Document'}</h1>
          <p className="text-gray-500 mt-1">Version {doc.version_number}</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleDownload}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Download
          </button>
          <button
            type="button"
            onClick={() => setVersionOpen(true)}
            className="px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary/5"
          >
            Upload new version
          </button>
        </div>
      </div>

      {error && <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>}

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-primary mb-4">Details</h2>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><dt className="text-sm text-gray-500">Type</dt><dd className="font-medium">{doc.document_type}</dd></div>
          <div><dt className="text-sm text-gray-500">Uploaded by</dt><dd className="font-medium">{doc.Uploader?.name || '—'}</dd></div>
          <div><dt className="text-sm text-gray-500">Original file name</dt><dd className="font-medium">{doc.original_file_name || '—'}</dd></div>
          <div><dt className="text-sm text-gray-500">File size</dt><dd className="font-medium">{doc.file_size != null ? `${(doc.file_size / 1024).toFixed(1)} KB` : '—'}</dd></div>
          <div><dt className="text-sm text-gray-500">Created</dt><dd className="font-medium">{doc.created_at ? new Date(doc.created_at).toLocaleString() : '—'}</dd></div>
          <div><dt className="text-sm text-gray-500">Case</dt><dd className="font-medium">{doc.Case ? <Link to={`/cases/${doc.Case.id}`} className="text-primary hover:underline">{doc.Case.case_title} ({doc.Case.case_number})</Link> : '—'}</dd></div>
          {doc.Case?.Client && <div><dt className="text-sm text-gray-500">Client</dt><dd className="font-medium">{doc.Case.Client.name}</dd></div>}
        </dl>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-primary mb-4">Version history</h2>
        {versions.length === 0 ? (
          <p className="text-gray-500 text-sm">No previous versions.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            <li className="py-3 flex justify-between items-center">
              <span className="font-medium">Current (v{doc.version_number})</span>
              <span className="text-sm text-gray-500">{doc.Uploader?.name} · {doc.created_at ? new Date(doc.created_at).toLocaleString() : ''}</span>
            </li>
            {versions.map((v) => (
              <li key={v.id} className="py-3 flex justify-between items-center text-sm">
                <span>Version {v.version_number}</span>
                <span className="text-gray-500">{v.Uploader?.name} · {v.created_at ? new Date(v.created_at).toLocaleString() : ''}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {versionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => { setVersionOpen(false); setVersionFile(null); }}>
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-4 sm:p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-primary mb-4">Upload new version</h2>
            <form onSubmit={handleNewVersionSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">File *</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,image/jpeg,image/png,image/gif,image/webp"
                  onChange={(e) => setVersionFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => { setVersionOpen(false); setVersionFile(null); }} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={uploading || !versionFile} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50">{uploading ? 'Uploading…' : 'Upload'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
