import api from './api';

export const getCaseDurationByCourt = () => api.get('/analytics/case-duration-by-court');
export const getJudgePerformance = () => api.get('/analytics/judge-performance');
export const getEmployeeProductivity = () => api.get('/analytics/employee-productivity');
export const getCaseAgingBuckets = () => api.get('/analytics/case-aging-buckets');
