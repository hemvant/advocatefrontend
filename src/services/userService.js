import api from './api';

export const getUsers = () => api.get('/users');
export const getUser = (id) => api.get(`/users/${id}`);
export const approveUser = (id, is_approved) => api.patch(`/users/${id}/approve`, { is_approved });
export const updateUser = (id, data) => api.patch(`/users/${id}`, data);
export const assignModules = (id, module_ids) => api.put(`/users/${id}/modules`, { module_ids });
