import React, { useState, useEffect } from 'react';
import { listTemplates, createTemplate, updateTemplate, deleteTemplate, generateTemplatePdf } from '../../services/documentTemplateApi';
import { listCases } from '../../services/caseApi';
import { useNotification } from '../../context/NotificationContext';
import { getApiMessage } from '../../services/apiHelpers';
import Button from '../../components/ui/Button';

const DEFAULT_VARIABLES = ['client_name', 'client_email', 'client_phone', 'case_number', 'case_title', 'court_name', 'advocate_name'];

export default function DocumentTemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', template_type: 'VAKALATNAMA', content: '', is_active: true });
  const [saving, setSaving] = useState(false);
  const [generateOpen, setGenerateOpen] = useState(null);
  const [generateCaseId, setGenerateCaseId] = useState('');
  const [generating, setGenerating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const { success, error: showError } = useNotification();

  const load = () => {
    setLoading(true);
    listTemplates()
      .then(({ data }) => setTemplates(data.data || []))
      .catch((err) => {
        setError(getApiMessage(err, 'Failed to load templates'));
        setTemplates([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    listCases({ limit: 500 }).then(({ data }) => setCases(data.data || [])).catch(() => setCases([]));
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({
      name: '',
      template_type: 'VAKALATNAMA',
      content: `I, {{ client_name }}, hereby appoint {{ advocate_name }} as my advocate in the matter of {{ case_title }} ({{ case_number }}) before {{ court_name }}.\n\nClient contact: {{ client_email }}, {{ client_phone }}.`,
      is_active: true
    });
    setFormOpen(true);
  };

  const openEdit = (t) => {
    setEditingId(t.id);
    setForm({
      name: t.name || '',
      template_type: t.template_type || 'VAKALATNAMA',
      content: t.content || '',
      is_active: t.is_active !== false
    });
    setFormOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await updateTemplate(editingId, form);
        success('Template updated.');
      } else {
        await createTemplate(form);
        success('Template created.');
      }
      setFormOpen(false);
      load();
    } catch (err) {
      showError(getApiMessage(err, 'Save failed'));
    } finally {
      setSaving(false);
    }
  };

  const handleGeneratePdf = async (e) => {
    e.preventDefault();
    if (!generateOpen || !generateCaseId) return;
    setGenerating(true);
    try {
      const { data } = await generateTemplatePdf(generateOpen.id, parseInt(generateCaseId, 10));
      const url = window.URL.createObjectURL(new Blob([data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${generateOpen.name || 'vakalatnama'}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      success('PDF downloaded.');
      setGenerateOpen(null);
      setGenerateCaseId('');
    } catch (err) {
      showError(getApiMessage(err, 'Generate failed'));
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteTemplate(deleteTarget.id);
      success('Template deleted.');
      setDeleteTarget(null);
      load();
    } catch (err) {
      showError(getApiMessage(err, 'Delete failed'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-primary">Vakalatnama & Document Templates</h1>
        <Button onClick={openCreate}>Add template</Button>
      </div>
      {error && <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>}
      <p className="text-gray-600 text-sm mb-4">
        Use placeholders like {'{{ client_name }}'}, {'{{ case_number }}'}, {'{{ advocate_name }}'}, {'{{ court_name }}'} in the content. When you generate PDF for a case, these are auto-filled from the case and client.
      </p>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" /></div>
      ) : templates.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-12 text-center text-gray-500">
          <p>No templates yet. Create a Vakalatnama template to auto-fill client and case data and export PDF.</p>
          <Button className="mt-4" onClick={openCreate}>Add template</Button>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {templates.map((t) => (
                <tr key={t.id}>
                  <td className="px-6 py-4 font-medium text-gray-900">{t.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{t.template_type}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-0.5 text-xs rounded ${t.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      {t.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button type="button" onClick={() => { setGenerateOpen(t); setGenerateCaseId(''); }} className="text-primary hover:underline text-sm">Generate PDF</button>
                    <button type="button" onClick={() => openEdit(t)} className="text-primary hover:underline text-sm">Edit</button>
                    <button type="button" onClick={() => setDeleteTarget(t)} className="text-red-600 hover:underline text-sm">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto" onClick={() => setFormOpen(false)}>
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full my-8 p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-primary mb-4">{editingId ? 'Edit template' : 'Add template'}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <input type="text" value={form.template_type} onChange={(e) => setForm({ ...form, template_type: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="VAKALATNAMA" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content (use {'{{ variable }}'} placeholders)</label>
                <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={10} className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm" placeholder="{{ client_name }}, {{ case_number }}..." />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="is_active" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
                <label htmlFor="is_active" className="text-sm text-gray-700">Active</label>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <Button type="button" variant="ghost" onClick={() => setFormOpen(false)}>Cancel</Button>
                <Button type="submit" loading={saving}>{editingId ? 'Update' : 'Create'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {generateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setGenerateOpen(null)}>
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-primary mb-4">Generate PDF: {generateOpen.name}</h2>
            <p className="text-sm text-gray-600 mb-4">Select a case. Client and case data will be filled into the template and a PDF will be downloaded.</p>
            <form onSubmit={handleGeneratePdf} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Case *</label>
                <select value={generateCaseId} onChange={(e) => setGenerateCaseId(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required>
                  <option value="">Select case</option>
                  {cases.map((c) => (
                    <option key={c.id} value={c.id}>{c.case_title} ({c.case_number})</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="ghost" onClick={() => setGenerateOpen(null)}>Cancel</Button>
                <Button type="submit" loading={generating}>Download PDF</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => !deleting && setDeleteTarget(null)}>
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-primary mb-2">Delete template?</h2>
            <p className="text-gray-600 text-sm mb-4">"{deleteTarget.name}" will be permanently deleted.</p>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancel</Button>
              <Button variant="danger" loading={deleting} onClick={handleDelete}>Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
