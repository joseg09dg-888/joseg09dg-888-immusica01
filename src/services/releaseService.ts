import api from './api';

export const getScheduledReleases = () => api.get('/releases/scheduled');
export const scheduleRelease = (data: any) => api.post('/releases/schedule', data);
export const cancelScheduledRelease = (id: number) => api.post(`/releases/schedule/${id}/cancel`);

export const releaseService = {
  getScheduledReleases,
  scheduleRelease,
  cancelScheduledRelease,
};
