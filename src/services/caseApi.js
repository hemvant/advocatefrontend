import api from './api';

export const listCaseClients = () => api.get('/cases/clients');
export const listCases = (params = {}) => api.get('/cases', { params });
export const getCase = (id) => api.get(`/cases/${id}`);
export const getCaseHistory = (id, params) => api.get(`/cases/${id}/history`, { params: params || {} });
export const createCase = (data) => api.post('/cases', data);
export const updateCase = (id, data) => api.put(`/cases/${id}`, data);
export const softDeleteCase = (id) => api.delete(`/cases/${id}`);

export const syncCaseFromECourts = (id) => api.post(`/cases/${id}/sync-ecourts`);
export const sendHearingReminderWhatsApp = (id) => api.post(`/cases/${id}/send-hearing-reminder`);
export const generateCaseSummary = (id) => api.post(`/cases/${id}/generate-summary`);
export const addHearing = (caseId, data) => api.post(`/cases/${caseId}/hearings`, data);
export const removeHearing = (caseId, hearingId) => api.delete(`/cases/${caseId}/hearings/${hearingId}`);
export const uploadCaseDocument = (caseId, data) => api.post(`/cases/${caseId}/documents`, data);
export const removeCaseDocument = (caseId, documentId) => api.delete(`/cases/${caseId}/documents/${documentId}`);
