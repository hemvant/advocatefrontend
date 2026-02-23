import api from './api';

export const getMySubscription = () => api.get('/billing/subscription');
export const getMyInvoices = (params = {}) => api.get('/billing/invoices', { params });
export const getPackages = () => api.get('/billing/packages');
export const getPaymentGatewayStatus = () => api.get('/billing/payment-gateway-status');
export const createOrder = (data) => api.post('/billing/create-order', data);
export const verifyPayment = (data) => api.post('/billing/verify-payment', data);
