import api from './api';

export const getVideos = () => api.get('/videos');
export const uploadVideo = (formData: FormData) => 
  api.post('/videos/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteVideo = (id: number) => api.delete(`/videos/${id}`);

export const videoService = {
  getVideos,
  uploadVideo,
  deleteVideo,
};
