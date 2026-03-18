import api from './api';

export const getTracks = () => api.get('/tracks');
export const createTrack = (formData: FormData) => 
  api.post('/tracks', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateTrack = (id: number, formData: FormData) => 
  api.put(`/tracks/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteTrack = (id: number) => api.delete(`/tracks/${id}`);
export const getTrackStats = (trackId: number) => 
  api.get(`/stats/track/${trackId}`);
export const uploadLyrics = (trackId: number, data: { lyrics: string, type: 'plain' | 'synced' }) => 
  api.post(`/tracks/${trackId}/lyrics`, data);
export const getLyrics = (trackId: number) => api.get(`/tracks/${trackId}/lyrics`);
export const toggleAutoDistribute = (trackId: number, auto_distribute: boolean) => 
  api.post(`/tracks/${trackId}/auto-distribute`, { auto_distribute });
export const activateLeaveALegacy = (trackId: number) => 
  api.post(`/tracks/${trackId}/leave-a-legacy`);

export const trackService = {
  getTracks,
  createTrack,
  updateTrack,
  deleteTrack,
  getTrackStats,
  uploadLyrics,
  getLyrics,
  toggleAutoDistribute,
  activateLeaveALegacy,
};
