import api from './api';

const base = '/v1/ai';

export const getAiUsage = (params) => api.get(base + '/usage', { params });
export const getAllowedFeatures = () => api.get(base + '/allowed-features');
export const getPromptTemplates = () => api.get(base + '/prompt-templates');

export const postCaseSummary = (data) => api.post(base + '/case-summary', data);
export const postDraft = (data) => api.post(base + '/draft', data);
export const postJudgmentSummary = (data) => api.post(base + '/judgment-summary', data);
export const postCrossExam = (data) => api.post(base + '/cross-exam', data);
export const postFirAnalysis = (data) => api.post(base + '/fir-analysis', data);
export const postLegalResearch = (data) => api.post(base + '/legal-research', data);

export const postChatStart = (data) => api.post(base + '/chat/start', data);
export const postChatMessage = (data) => api.post(base + '/chat/message', data);
export const getChatHistory = (params) => api.get(base + '/chat/history', { params });
export const getChatSessions = () => api.get(base + '/chat/sessions');
export const updateChatSession = (id, data) => api.put(base + '/chat/sessions/' + id, data);
export const deleteChatSession = (id) => api.delete(base + '/chat/sessions/' + id);
