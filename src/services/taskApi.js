import api from './api';

export const getTaskDashboard = () => api.get('/tasks/dashboard');
export const listTasks = (params) => api.get('/tasks', { params: params || {} });
export const listTasksByCase = (caseId) => api.get('/cases/' + caseId + '/tasks');
export const getTask = (id) => api.get('/tasks/' + id);
export const createTask = (data) => api.post('/tasks', data);
export const updateTask = (id, data) => api.put('/tasks/' + id, data);
export const markTaskComplete = (id) => api.post('/tasks/' + id + '/complete');
export const reassignTask = (id, assignedTo) => api.put('/tasks/' + id + '/assign', { assigned_to: assignedTo || null });
