import api from './api';

export const getMySubscription = () => api.get('/billing/subscription');
export const getMyInvoices = (params = {}) => api.get('/billing/invoices', { params });
export const getBillingDashboardStats = () => api.get('/billing/dashboard-stats');
export const getExpensesByCase = () => api.get('/billing/expenses-by-case');
export const createAdvocateInvoice = (data) => api.post('/billing/invoices', data);
export const updateAdvocateInvoice = (id, data) => api.put(`/billing/invoices/${id}`, data);
export const sendInvoiceReminderWhatsApp = (invoiceId) => api.post(`/billing/invoices/${invoiceId}/send-reminder`);
export const getPackages = () => api.get('/billing/packages');
export const getPaymentGatewayStatus = () => api.get('/billing/payment-gateway-status');
export const createOrder = (data) => api.post('/billing/create-order', data);
export const verifyPayment = (data) => api.post('/billing/verify-payment', data);
