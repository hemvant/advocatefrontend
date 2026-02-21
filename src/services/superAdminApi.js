import api from './api';

export const superAdminLogin = (data) => api.post('/super-admin/login', data);
export const superAdminLogout = () => api.post('/super-admin/logout');
export const superAdminGetMe = () => api.get('/super-admin/me');

export const getDashboardSummary = () => api.get('/super-admin/dashboard/summary');
export const getDashboardAnalytics = () => api.get('/super-admin/dashboard/analytics');
export const getRevenueSummary = () => api.get('/super-admin/revenue-summary');
export const getSystemHealth = () => api.get('/super-admin/system-health');

export const getOrganizations = (params) => api.get('/super-admin/organizations', { params });
export const getOrganization = (id) => api.get(`/super-admin/organizations/${id}`);
export const getOrganizationDetail = (id) => api.get(`/super-admin/organizations/${id}/detail`);
export const impersonateOrganization = (organizationId) => api.post(`/super-admin/organizations/${organizationId}/impersonate`);
export const createOrganization = (data) => api.post('/super-admin/organizations', data);
export const updateOrganization = (id, data) => api.put(`/super-admin/organizations/${id}`, data);
export const getOrganizationModules = (id) => api.get(`/super-admin/organizations/${id}/modules`);
export const assignOrganizationModules = (id, moduleIds) => api.put(`/super-admin/organizations/${id}/modules`, { module_ids: moduleIds });

export const getAllModules = () => api.get('/super-admin/modules');
export const getSubscriptions = () => api.get('/super-admin/subscriptions');
export const assignSubscription = (organizationId, data) => api.post(`/super-admin/organizations/${organizationId}/subscription`, data);

export const getPackages = (params) => api.get('/super-admin/packages', { params });
export const getPackage = (id) => api.get(`/super-admin/packages/${id}`);
export const createPackage = (data) => api.post('/super-admin/packages', data);
export const updatePackage = (id, data) => api.put(`/super-admin/packages/${id}`, data);
export const deletePackage = (id) => api.delete(`/super-admin/packages/${id}`);

export const getInvoices = (params) => api.get('/super-admin/invoices', { params });
export const createInvoice = (data) => api.post('/super-admin/invoices', data);
export const markInvoicePaid = (id, data = {}) => api.put(`/super-admin/invoices/${id}/mark-paid`, data);

export const getPlatformAuditLogs = (params) => api.get('/super-admin/audit-logs', { params });
export const resetOrgAdminPassword = (organizationId, newPassword) =>
  api.put(`/super-admin/organizations/${organizationId}/reset-admin-password`, { new_password: newPassword });
