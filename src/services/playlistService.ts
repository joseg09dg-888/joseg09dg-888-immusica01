import api from './api';

export const getPlaylists = (filters?: any) => api.get('/playlists', { params: filters });
export const createPlaylist = (data: any) => api.post('/playlists', data);
export const updatePlaylist = (id: number, data: any) => api.put(`/playlists/${id}`, data);
export const deletePlaylist = (id: number) => api.delete(`/playlists/${id}`);
export const getPlaylistMoods = () => api.get('/playlists/moods');

export const playlistService = {
  getPlaylists,
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
  getPlaylistMoods,
};
