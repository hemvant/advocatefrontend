import api from './api';

export const getDraftTemplates = () => api.get('/ai/templates');
export const generateDraft = (template, inputs) => api.post('/ai/draft', { template, inputs });
