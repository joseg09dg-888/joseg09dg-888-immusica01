import api from './api';

export const getBeats = () => api.get('/marketplace/beats');
export const buyBeat = (beatId: number) => api.post('/marketplace/buy', { beatId });

export const marketplaceService = {
  getBeats,
  buyBeat,
};
