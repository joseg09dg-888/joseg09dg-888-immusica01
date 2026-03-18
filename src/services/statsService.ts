import api from './api';

export const uploadStats = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/stats/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

export const getArtistSummary = () => 
  api.get('/stats/summary');

export const getArtistTracks = () => 
  api.get('/stats/tracks');

export const statsService = {
  uploadStats,
  getArtistSummary,
  getArtistTracks,
};
