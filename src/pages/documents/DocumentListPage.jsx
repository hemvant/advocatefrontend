import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { listDocuments, searchDocuments, softDeleteDocument, downloadDocument } from '../../services/documentApi';
import { listCases } from '../../services/caseApi';
import UploadDocumentModal from '../../components/documents/UploadDocumentModal';

const DOC_TYPES = ['PETITION', 'EVIDENCE', 'AGREEMENT', 'NOTICE', 'ORDER', 'OTHER'];

const OCR_STATUS_BADGE = {
  PENDING: 'bg-gray-100 text-gray-700',
  PROCESSING: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-green-100 text-green-700',
  FAILED: 'bg-red-100 text-red-700'
};

export default function DocumentListPage() {
  const [items, setItems] = useState([]);
  const [cases, setCases] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [search, setSearch] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [caseFilter, setCaseFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadOpen, setUploadOpen] = useState(false);

  const loadCases = () => {
    listCases({ limit: 500 })
      .then(({ data }) => setCases(data.data || []))
      .catch(() => setCases([]));
  };

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      if (searchQuery) {
        const params = { q: searchQuery, page, limit };
        if (caseFilter) params.case_id = caseFilter;
        const { data } = await searchDocuments(params);
        setItems(data.data || []);
        setTotal(data.total ?? 0);
      } else {
        const params = { page, limit };
        if (documentType) params.document_type = documentType;
        if (caseFilter) params.case_id = caseFilter;
        const { data } = await listDocuments(params);
        setItems(data.data || []);
        setTotal(data.total ?? 0);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCases();
  }, []);

  useEffect(() => {
    load();
  }, [page, documentType, caseFilter, searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchQuery(search.trim());
    setPage(1);
  };

  const handleDelete = async (doc) => {
    if (!window.confirm(`Delete "${doc.document_name}"?`)) return;
    try {
      await softDeleteDocument(doc.id);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleDownload = async (doc) => {
    try {
      const { data } = await downloadDocument(doc.id);
      const url = window.URL.createObjectURL(new Blob([data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.original_file_name || doc.document_name || 'document';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.response?.data?.message || 'Download failed');
    }
  };

  const handleUploadDone = () => {
    setUploadOpen(false);
    load();
    loadCases();
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-primary">Document Management</h1>
        <button
          type="button"
          onClick={() => setUploadOpen(true)}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 focus:ring-2 focus:ring-accent"
        >
          Upload document
        </button>
      </div>

      {error && <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>}

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 mb-4">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[180px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Document name or content (keyword search)..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
            />
          </div>
          <div className="w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">Case</label>
            <select
              value={caseFilter}
              onChange={(e) => { setCaseFilter(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
            >
              <option value="">All cases</option>
              {cases.map((c) => (
                <option key={c.id} value={c.id}>{c.case_title} ({c.case_number})</option>
              ))}
            </select>
          </div>
          <div className="w-40">
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={documentType}
              onChange={(e) => { setDocumentType(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
            >
              <option value="">All</option>
              {DOC_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-accent/90">Search</button>
        </form>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-accent" />
          </div>
        ) : items.length === 0 ? (
          <p className="p-6 text-gray-500 text-center">No documents. Upload one or open a case to add documents.</p>
        ) : (
          <>
            <div className="table-wrap overflow-x-auto -mx-4 sm:mx-0">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Case</th>
                    {!searchQuery && (
                      <>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Uploaded by</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Version</th>
                      </>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">OCR</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Preview</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.map((doc) => {
                    const status = doc.ocr_status || 'PENDING';
                    const preview = (doc.snippet || (doc.ocr_text && String(doc.ocr_text).slice(0, 150)) || '').trim();
                    const caseTitle = doc.Case?.case_title || cases.find((c) => c.id === doc.case_id)?.case_title;
                    return (
                      <tr key={doc.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link to={`/documents/${doc.id}`} className="text-primary font-medium hover:underline">
                            {doc.document_name || doc.file_name || doc.original_file_name || '—'}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {doc.case_id ? (
                            <Link to={`/cases/${doc.case_id}/documents`} className="text-primary hover:underline">
                              {caseTitle || `Case #${doc.case_id}`}
                            </Link>
                          ) : caseTitle ? (
                            <Link to={`/cases/${doc.Case?.id}/documents`} className="text-primary hover:underline">{caseTitle}</Link>
                          ) : '—'}
                        </td>
                        {!searchQuery && (
                          <>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{doc.document_type || '—'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{doc.Uploader?.name || '—'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{doc.version_number != null ? `v${doc.version_number}` : '—'}</td>
                          </>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded ${OCR_STATUS_BADGE[status] || OCR_STATUS_BADGE.PENDING}`}>
                            {status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 max-w-[200px] truncate" title={preview}>{preview || '—'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <button type="button" onClick={() => handleDownload(doc)} className="text-primary hover:underline mr-3">Download</button>
                          <button type="button" onClick={() => handleDelete(doc)} className="text-red-600 hover:underline">Delete</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {total > limit && (
              <div className="px-6 py-3 border-t border-gray-200 flex justify-between items-center">
                <span className="text-sm text-gray-600">Total {total}</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={page * limit >= total}
                    onClick={() => setPage((p) => p + 1)}
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

      {uploadOpen && (
        <UploadDocumentModal
          caseId={null}
          cases={cases}
          onClose={() => setUploadOpen(false)}
          onSuccess={handleUploadDone}
        />
      )}
    </div>
  );
}
