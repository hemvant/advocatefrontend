import api from './api';

export const getModules = () => api.get('/modules');
export const getAllModules = () => api.get('/modules/admin/all');
