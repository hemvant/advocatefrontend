import React, { useState, useEffect } from 'react';
import { getDraftTemplates, generateDraft } from '../../services/aiApi';

const TEMPLATE_IDS = ['LEGAL_NOTICE', 'AFFIDAVIT', 'VAKALATNAMA'];

export default function DraftGeneratorPage() {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('LEGAL_NOTICE');
  const [inputs, setInputs] = useState({});
  const [draftText, setDraftText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getDraftTemplates()
      .then(({ data }) => setTemplates(data.data || []))
      .catch(() => setTemplates(TEMPLATE_IDS.map((id) => ({ id, name: id.replace(/_/g, ' '), placeholders: [] }))));
  }, []);

  const fieldsToShow = selectedTemplate === 'LEGAL_NOTICE'
    ? ['sender_name', 'sender_address', 'recipient_name', 'recipient_address', 'subject', 'facts', 'demand', 'days_notice', 'date']
    : selectedTemplate === 'AFFIDAVIT'
      ? ['deponent_name', 'father_name', 'address', 'court_case_details', 'facts', 'date']
      : ['client_name', 'advocate_name', 'court_name', 'case_number', 'case_title', 'date'];

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    const payload = { ...inputs, date: inputs.date || new Date().toLocaleDateString('en-IN') };
    try {
      const { data } = await generateDraft(selectedTemplate, payload);
      setDraftText(data.draft_text || '');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate draft');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-primary mb-2">Draft generator</h1>
      <p className="text-gray-600 mb-6">Generate Legal Notice, Affidavit, or Vakalatnama. Fill basic details and edit the draft as needed.</p>

      {error && <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>}

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Template</label>
        <select
          value={selectedTemplate}
          onChange={(e) => { setSelectedTemplate(e.target.value); setInputs({}); setDraftText(''); }}
          className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
        >
          <option value="LEGAL_NOTICE">Legal Notice</option>
          <option value="AFFIDAVIT">Affidavit</option>
          <option value="VAKALATNAMA">Vakalatnama</option>
        </select>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-primary mb-4">Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fieldsToShow.map((key) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{key.replace(/_/g, ' ')}</label>
              {key === 'facts' || key === 'demand' || key === 'court_case_details' ? (
                <textarea
                  value={inputs[key] ?? ''}
                  onChange={(e) => setInputs((s) => ({ ...s, [key]: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
                  placeholder={key}
                />
              ) : (
                <input
                  type="text"
                  value={inputs[key] ?? ''}
                  onChange={(e) => setInputs((s) => ({ ...s, [key]: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
                  placeholder={key}
                />
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
          className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? 'Generating…' : 'Generate draft'}
        </button>
      </div>

      {draftText && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-primary mb-2">Draft (editable)</h2>
          <textarea
            value={draftText}
            onChange={(e) => setDraftText(e.target.value)}
            rows={18}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent font-mono text-sm"
          />
        </div>
      )}
    </div>
  );
}
