import api from './api';

export const createSplit = (trackId: number, data: any) => 
  api.post(`/tracks/${trackId}/splits`, data);
export const getSplits = (trackId?: number) => 
  trackId ? api.get(`/tracks/${trackId}/splits`) : api.get('/splits');
export const getPendingSplits = (trackId?: number) => 
  trackId ? api.get(`/tracks/${trackId}/splits/pending`) : api.get('/splits/pending');
export const acceptSplit = (token: string) => 
  api.get(`/splits/accept/${token}`);
export const rejectSplit = (token: string) => 
  api.get(`/splits/reject/${token}`);
export const getUserSplits = () => api.get('/splits/user');
export const updateSplit = (splitId: number, data: any) => api.put(`/splits/${splitId}`, data);
export const resendInvitation = (splitId: number) => api.post(`/splits/${splitId}/resend`);
export const deleteSplit = (splitId: number) => 
  api.delete(`/splits/${splitId}`);

export const splitService = {
  createSplit,
  getSplits,
  getPendingSplits,
  getUserSplits,
  updateSplit,
  resendInvitation,
  acceptSplit,
  rejectSplit,
  deleteSplit,
};
