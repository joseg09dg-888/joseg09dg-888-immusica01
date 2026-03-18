import api from './api';

export const getMyArtists = () => api.get('/artists/my');
export const createArtist = (data: any) => api.post('/artists', data);
export const switchArtist = (artistId: number) => api.post(`/artists/switch/${artistId}`);
export const getSpotifyAuthUrl = () => api.get('/artists/spotify/auth');
export const checkSpotifyStatus = () => api.get('/artists/spotify/status');
export const getRiaaCertifications = () => api.get('/riaa');

export const artistService = {
  getMyArtists,
  createArtist,
  switchArtist,
  getSpotifyAuthUrl,
  checkSpotifyStatus,
  getRiaaCertifications,
};
