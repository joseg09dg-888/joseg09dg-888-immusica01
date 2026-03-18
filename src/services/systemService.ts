import api from './api';

export const getSystemInfo = () => api.get('/system/info');
export const getAuditLogs = (limit?: number) => {
  const params = new URLSearchParams();
  if (limit) params.append('limit', limit.toString());
  return api.get(`/system/audit-logs?${params.toString()}`);
};

export const systemService = {
  getSystemInfo,
  getAuditLogs,
};
