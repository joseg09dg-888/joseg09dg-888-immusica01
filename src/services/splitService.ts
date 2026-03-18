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
export const deleteSplit = (splitId: number) => 
  api.delete(`/splits/${splitId}`);

export const splitService = {
  createSplit,
  getSplits,
  getPendingSplits,
  acceptSplit,
  rejectSplit,
  deleteSplit,
};
