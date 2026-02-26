import api from './api';

export const listTemplates = (params = {}) => api.get('/document-templates', { params });
export const getTemplate = (id) => api.get(`/document-templates/${id}`);
export const createTemplate = (data) => api.post('/document-templates', data);
export const updateTemplate = (id, data) => api.put(`/document-templates/${id}`, data);
export const deleteTemplate = (id) => api.delete(`/document-templates/${id}`);
export const generateTemplatePdf = (id, caseId) =>
  api.post(`/document-templates/${id}/generate-pdf`, { case_id: caseId }, { responseType: 'blob' });
