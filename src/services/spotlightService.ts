import api from './api';

export const pitchToPlaylist = (trackId: number, playlistId: number, message: string) => 
  api.post('/spotlight/pitch', { trackId, playlistId, message });
export const getMyPitches = () => api.get('/spotlight/my-pitches');

export const spotlightService = {
  pitchToPlaylist,
  getMyPitches,
};
