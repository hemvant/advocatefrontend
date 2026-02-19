import api from './api';

export const getCalendarView = (params = {}) => api.get('/hearings/calendar', { params });
export const getDashboardHearings = () => api.get('/hearings/dashboard');
export const listHearings = (params = {}) => api.get('/hearings', { params });
export const getHearing = (id) => api.get(`/hearings/${id}`);
export const createHearing = (data) => api.post('/hearings', data);
export const updateHearing = (id, data) => api.put(`/hearings/${id}`, data);
export const deleteHearing = (id) => api.delete(`/hearings/${id}`);
export const listReminders = (hearingId) => api.get(`/hearings/${hearingId}/reminders`);
export const addReminder = (hearingId, data) => api.post(`/hearings/${hearingId}/reminders`, data);
export const removeReminder = (hearingId, reminderId) => api.delete(`/hearings/${hearingId}/reminders/${reminderId}`);
