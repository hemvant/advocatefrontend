import api from './api';

export const listAuditLogs = (params = {}) => api.get('/audit-logs', { params });

export const exportAuditLogs = (params = {}) =>
  api.get('/audit-logs/export', { params, responseType: 'blob' });
