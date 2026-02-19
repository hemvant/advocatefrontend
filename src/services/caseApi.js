import api from './api';

export const listCaseClients = () => api.get('/cases/clients');
export const listCases = (params = {}) => api.get('/cases', { params });
export const getCase = (id) => api.get(`/cases/${id}`);
export const createCase = (data) => api.post('/cases', data);
export const updateCase = (id, data) => api.put(`/cases/${id}`, data);
export const softDeleteCase = (id) => api.delete(`/cases/${id}`);

export const addHearing = (caseId, data) => api.post(`/cases/${caseId}/hearings`, data);
export const removeHearing = (caseId, hearingId) => api.delete(`/cases/${caseId}/hearings/${hearingId}`);
export const uploadCaseDocument = (caseId, data) => api.post(`/cases/${caseId}/documents`, data);
export const removeCaseDocument = (caseId, documentId) => api.delete(`/cases/${caseId}/documents/${documentId}`);
