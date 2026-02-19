import api from './api';

export const orgLogin = (data) => api.post('/org/login', data);
export const orgLogout = () => api.post('/org/logout');
export const orgGetMe = () => api.get('/org/me');

export const getEmployees = () => api.get('/org/employees');
export const getEmployee = (id) => api.get(`/org/employees/${id}`);
export const createEmployee = (data) => api.post('/org/employees', data);
export const updateEmployee = (id, data) => api.put(`/org/employees/${id}`, data);
export const getEmployeeModules = (id) => api.get(`/org/employees/${id}/modules`);
export const assignEmployeeModules = (id, moduleIds) => api.put(`/org/employees/${id}/modules`, { module_ids: moduleIds });

export const getModules = () => api.get('/org/modules');
