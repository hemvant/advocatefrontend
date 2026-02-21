import api from './api';

export const listDocuments = (params = {}) => api.get('/documents', { params });

export const searchDocuments = (params = {}) => api.get('/documents/search', { params });

export const getDocumentDashboard = () => api.get('/documents/dashboard');

export const getDocument = (id) => api.get(`/documents/${id}`);

export const getDocumentVersions = (id, params = {}) => api.get(`/documents/${id}/versions`, { params });

export const downloadVersion = (id, versionId) =>
  api.get(`/documents/${id}/versions/${versionId}/download`, { responseType: 'blob' });

export const restoreDocumentVersion = (id, versionId) => api.post(`/documents/${id}/restore/${versionId}`);

export const uploadDocument = (formData) =>
  api.post('/documents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

export const downloadDocument = (id) =>
  api.get(`/documents/${id}/download`, { responseType: 'blob' });

export const updateDocumentMetadata = (id, data) => api.put(`/documents/${id}`, data);

export const softDeleteDocument = (id) => api.delete(`/documents/${id}`);

export const uploadNewVersion = (id, formData) =>
  api.post(`/documents/${id}/version`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
