import api from './api';

export const listStampDutyConfig = (params = {}) => api.get('/stamp-duty', { params });
export const createStampDutyConfig = (data) => api.post('/stamp-duty', data);
export const updateStampDutyConfig = (id, data) => api.put(`/stamp-duty/${id}`, data);
export const calculateStampDuty = (data) => api.post('/stamp-duty/calculate', data);
