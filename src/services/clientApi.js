import api from './api';

export const listClients = (params = {}) => api.get('/clients', { params });
export const getClient = (id) => api.get(`/clients/${id}`);
export const createClient = (data) => api.post('/clients', data);
export const updateClient = (id, data) => api.put(`/clients/${id}`, data);
export const softDeleteClient = (id) => api.delete(`/clients/${id}`);
export const assignClient = (id, assigned_to) => api.put(`/clients/${id}/assign`, { assigned_to });

export const listTags = () => api.get('/clients/tags');
export const createTag = (name) => api.post('/clients/tags', { name });

export const addOpponent = (clientId, data) => api.post(`/clients/${clientId}/opponents`, data);
export const removeOpponent = (clientId, opponentId) => api.delete(`/clients/${clientId}/opponents/${opponentId}`);
export const assignTagToClient = (clientId, tag_id) => api.post(`/clients/${clientId}/tags`, { tag_id });
export const removeTagFromClient = (clientId, tagId) => api.delete(`/clients/${clientId}/tags/${tagId}`);
