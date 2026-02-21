import api from './api';

export const getMySubscription = () => api.get('/billing/subscription');
export const getMyInvoices = (params = {}) => api.get('/billing/invoices', { params });
