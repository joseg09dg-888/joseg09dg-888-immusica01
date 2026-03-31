import api from './api';
import { API_BASE_URL } from '../config/api';

export const analyzeMood = (text: string) => api.post('/mood/analyze', { text });
export const getSpotifyMoodLogin = () => {
  window.open(`${API_BASE_URL}/mood/login`, 'spotify_login', 'width=600,height=700');
};
export const getMoodRecommendations = (mood: string) => 
  api.get(`/mood/recommendations?mood=${mood}`);

export const moodService = {
  analyzeMood,
  getSpotifyMoodLogin,
  getMoodRecommendations,
};
