import api from './api';

export const getCourtTypes = () => api.get('/courts/types');
export const listCourts = (params = {}) => api.get('/courts', { params });
export const getCourt = (id) => api.get(`/courts/${id}`);
export const createCourt = (data) => api.post('/courts', data);
export const updateCourt = (id, data) => api.put(`/courts/${id}`, data);
export const deactivateCourt = (id) => api.post(`/courts/${id}/deactivate`);

export const listBenches = (courtId) => api.get(`/courts/${courtId}/benches`);
export const addBench = (courtId, data) => api.post(`/courts/${courtId}/benches`, data);
export const updateBench = (courtId, benchId, data) => api.put(`/courts/${courtId}/benches/${benchId}`, data);
export const deleteBench = (courtId, benchId) => api.delete(`/courts/${courtId}/benches/${benchId}`);

export const listCourtrooms = (courtId) => api.get(`/courts/${courtId}/courtrooms`);
export const addCourtroom = (courtId, data) => api.post(`/courts/${courtId}/courtrooms`, data);
export const updateCourtroom = (courtId, roomId, data) => api.put(`/courts/${courtId}/courtrooms/${roomId}`, data);

export const listJudges = (params = {}) => api.get('/judges', { params });
export const getJudge = (id) => api.get(`/judges/${id}`);
export const addJudge = (data) => api.post('/judges', data);
export const updateJudge = (id, data) => api.put(`/judges/${id}`, data);
export const deactivateJudge = (id) => api.post(`/judges/${id}/deactivate`);

export const listBenchesByCourt = (courtId) => api.get('/benches', { params: { court_id: courtId } });
export const listCourtroomsByCourt = (courtId) => api.get('/courtrooms', { params: { court_id: courtId } });
export const listJudgesByCourt = (courtId, params = {}) => api.get('/judges', { params: { court_id: courtId, ...params } });

export const assignJudgeToCase = (caseId, judgeId) => api.put(`/cases/${caseId}/judge`, { judge_id: judgeId || null });
