import api from './api';

export const registerYoutubeContentId = (trackId: number) => 
  api.post('/youtube/register', { track_id: trackId });
export const getYoutubeRegistrations = () => api.get('/youtube/registrations');

export const youtubeService = {
  registerYoutubeContentId,
  getYoutubeRegistrations,
};
