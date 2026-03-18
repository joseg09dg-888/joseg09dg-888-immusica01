import api from './api';

export const getInboxMessages = (status?: string, limit?: number) => {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  if (limit) params.append('limit', limit.toString());
  return api.get(`/openclaw/inbox?${params.toString()}`);
};

export const processInboxMessage = (id: number, status: string, taskId?: number) => 
  api.put(`/openclaw/inbox/${id}/process`, { status, taskId });

export const getSystemLogs = (lines?: number) => {
  const params = new URLSearchParams();
  if (lines) params.append('lines', lines.toString());
  return api.get(`/openclaw/logs?${params.toString()}`);
};

export const getResourceStatus = () => api.get('/openclaw/resources');
export const getAiConfig = () => api.get('/openclaw/config');
export const setEmergencyStop = (stop: boolean) =>
  api.post('/openclaw/emergency', { stop });
export const getPendingTasks = () => api.get('/openclaw/tasks');
export const updateTask = (id: number, data: any) => api.put(`/openclaw/tasks/${id}`, data);
export const sendNotification = (channel: string, recipient: string, message: string) =>
  api.post('/openclaw/notify', { channel, recipient, message });
export const createGitHubBranch = (branch: string) => api.post('/openclaw/github/branch', { branch });
export const testNgrok = (port?: number) => api.get(`/openclaw/ngrok/test?port=${port || 3000}`);

export const adminService = {
  getInboxMessages,
  processInboxMessage,
  getSystemLogs,
  getResourceStatus,
  getAiConfig,
  setEmergencyStop,
  getPendingTasks,
  updateTask,
  sendNotification,
  createGitHubBranch,
  testNgrok,
};
