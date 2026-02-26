import api from './api';

export const getCalendarView = (params = {}) => api.get('/hearings/calendar', { params });
export const getDashboardHearings = () => api.get('/hearings/dashboard');
export const listHearings = (params = {}) => api.get('/hearings', { params });
export const getHearing = (id) => api.get(`/hearings/${id}`);
export const createHearing = (data) => api.post('/hearings', data);
export const updateHearing = (id, data) => api.put(`/hearings/${id}`, data);
export const rescheduleHearing = (id, data) => api.put(`/hearings/${id}/reschedule`, data);
export const deleteHearing = (id) => api.delete(`/hearings/${id}`);
export const listReminders = (hearingId) => api.get(`/hearings/${hearingId}/reminders`);
export const addReminder = (hearingId, data) => api.post(`/hearings/${hearingId}/reminders`, data);
export const removeReminder = (hearingId, reminderId) => api.delete(`/hearings/${hearingId}/reminders/${reminderId}`);

/** Diary PDF: pass date (YYYY-MM-DD) and optional advocate_id, court_id, case_type. Returns blob. */
export const getDiaryPdf = (params = {}) => api.get('/hearings/diary/pdf', { params, responseType: 'blob' });

/** Cause list: FormData with 'file' (PDF) and optional 'hearing_date' (YYYY-MM-DD). */
export const uploadCauseList = (formData) => api.post('/hearings/cause-list/upload', formData);
