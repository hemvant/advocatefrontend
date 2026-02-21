import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useOrgAuth } from '../../context/OrgAuthContext';
import {
  getDocument,
  downloadDocument,
  uploadNewVersion,
  getDocumentVersions,
  downloadVersion,
  restoreDocumentVersion
} from '../../services/documentApi';

const CHANGE_TYPE_LABEL = {
  CREATED: 'Created',
  UPDATED_FILE: 'File updated',
  UPDATED_METADATA: 'Metadata updated',
  DELETED: 'Deleted'
};

export default function DocumentDetailPage() {
  const { id } = useParams();
  const { isOrgAdmin } = useOrgAuth();
  const [doc, setDoc] = useState(null);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('details');
  const [versionOpen, setVersionOpen] = useState(false);
  const [versionFile, setVersionFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [versions, setVersions] = useState([]);
  const [versionsTotal, setVersionsTotal] = useState(0);
  const [versionsPage, setVersionsPage] = useState(1);
  const [versionsLoading, setVersionsLoading] = useState(false);
  const [restoreTarget, setRestoreTarget] = useState(null);
  const [restoring, setRestoring] = useState(false);

  const currentVer = doc?.current_version ?? doc?.version_number ?? 0;

  const load = () => {
    getDocument(id)
      .then(({ data }) => setDoc(data.data))
      .catch(() => setError('Document not found'));
  };

  const loadVersions = () => {
    setVersionsLoading(true);
    getDocumentVersions(id, { page: versionsPage, limit: 20 })
      .then(({ data }) => {
        setVersions(data.data || []);
        setVersionsTotal(data.total ?? 0);
      })
      .catch(() => setVersions([]))
      .finally(() => setVersionsLoading(false));
  };

  useEffect(() => {
    load();
  }, [id]);

  useEffect(() => {
    if (tab === 'versions' && id) loadVersions();
  }, [id, tab, versionsPage]);

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

  const handleDownloadVersion = async (versionId, fileName) => {
    try {
      const { data } = await downloadVersion(id, versionId);
      const url = window.URL.createObjectURL(new Blob([data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName || 'document';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.response?.data?.message || 'Download failed');
    }
  };

  const handleRestoreConfirm = async () => {
    if (!restoreTarget) return;
    setRestoring(true);
    try {
      await restoreDocumentVersion(id, restoreTarget.id);
      setRestoreTarget(null);
      load();
      if (tab === 'versions') loadVersions();
    } catch (err) {
      setError(err.response?.data?.message || 'Restore failed');
    } finally {
      setRestoring(false);
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
      if (tab === 'versions') loadVersions();
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (error && !doc) return <div className="p-4 text-red-600">{error}</div>;
  if (!doc) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-accent" /></div>;

  const caseId = doc.Case?.id;

  return (
    <div>
      <Link to={caseId ? `/cases/${caseId}/documents` : '/documents'} className="text-sm text-primary hover:underline mb-4 inline-block">← Back to documents</Link>
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">{doc.document_name || doc.original_file_name || 'Document'}</h1>
          <p className="text-gray-500 mt-1 flex items-center gap-2">
            <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded bg-primary/10 text-primary">Current version: v{currentVer}</span>
          </p>
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

      <div className="border-b border-gray-200 mb-4">
        <nav className="flex gap-4">
          <button
            type="button"
            onClick={() => setTab('details')}
            className={`pb-2 px-1 border-b-2 font-medium text-sm ${tab === 'details' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Details
          </button>
          <button
            type="button"
            onClick={() => setTab('versions')}
            className={`pb-2 px-1 border-b-2 font-medium text-sm ${tab === 'versions' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Version history
          </button>
        </nav>
      </div>

      {tab === 'details' && (
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
      )}

      {tab === 'versions' && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <h2 className="text-lg font-semibold text-primary p-4 border-b border-gray-200">Version history</h2>
          {versionsLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-accent" />
            </div>
          ) : versions.length === 0 ? (
            <p className="p-6 text-gray-500 text-sm">No version history yet.</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Version</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Changed by</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Change type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Change summary</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {versions.map((v) => (
                      <tr key={v.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          v{v.version_number}
                          {v.version_number === currentVer && (
                            <span className="ml-2 inline-flex px-2 py-0.5 text-xs rounded bg-green-100 text-green-700">Current</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{v.Changer?.name || v.Uploader?.name || '—'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{CHANGE_TYPE_LABEL[v.change_type] || v.change_type}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate" title={v.change_summary}>{v.change_summary || '—'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{v.created_at ? new Date(v.created_at).toLocaleString() : '—'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          {v.file_path && (
                            <button
                              type="button"
                              onClick={() => handleDownloadVersion(v.id, v.file_name)}
                              className="text-primary hover:underline mr-3"
                            >
                              View
                            </button>
                          )}
                          {isOrgAdmin && v.file_path && v.version_number !== currentVer && (
                            <button
                              type="button"
                              onClick={() => setRestoreTarget(v)}
                              className="text-amber-600 hover:underline"
                            >
                              Restore
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {versionsTotal > 20 && (
                <div className="px-6 py-3 border-t border-gray-200 flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total {versionsTotal}</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={versionsPage <= 1}
                      onClick={() => setVersionsPage((p) => p - 1)}
                      className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      disabled={versionsPage * 20 >= versionsTotal}
                      onClick={() => setVersionsPage((p) => p + 1)}
                      className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

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

      {restoreTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => !restoring && setRestoreTarget(null)}>
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-4 sm:p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-primary mb-2">Restore version?</h2>
            <p className="text-gray-600 text-sm mb-4">
              This will set the document back to version {restoreTarget.version_number}. A new version entry will be created. Continue?
            </p>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setRestoreTarget(null)} disabled={restoring} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">Cancel</button>
              <button type="button" onClick={handleRestoreConfirm} disabled={restoring} className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50">{restoring ? 'Restoring…' : 'Restore'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
