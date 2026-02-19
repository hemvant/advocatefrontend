import api from './api';

export const superAdminLogin = (data) => api.post('/super-admin/login', data);
export const superAdminLogout = () => api.post('/super-admin/logout');
export const superAdminGetMe = () => api.get('/super-admin/me');

export const getOrganizations = () => api.get('/super-admin/organizations');
export const getOrganization = (id) => api.get(`/super-admin/organizations/${id}`);
export const createOrganization = (data) => api.post('/super-admin/organizations', data);
export const updateOrganization = (id, data) => api.put(`/super-admin/organizations/${id}`, data);
export const getOrganizationModules = (id) => api.get(`/super-admin/organizations/${id}/modules`);
export const assignOrganizationModules = (id, moduleIds) => api.put(`/super-admin/organizations/${id}/modules`, { module_ids: moduleIds });

export const getAllModules = () => api.get('/super-admin/modules');
