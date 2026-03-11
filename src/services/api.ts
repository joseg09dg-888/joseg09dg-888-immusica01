import axios from 'axios';
import { API_URL } from '../config/api';

const api = axios.create({
  baseURL: API_URL,
});

// Interceptor para agregar el token de autenticación
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('im_music_token'); // Using the existing token key from previous turns
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ==================== AUTH ====================
export const loginWithSpotify = () => {
  window.location.href = `${API_URL}/auth/login`;
};

export const handleCallback = (code: string) => {
  return api.get(`/auth/callback?code=${code}`);
};

// ==================== WOMPI (PLANES) ====================
export const getPlans = () => api.get('/wompi/plans');
export const createPayment = (planId: string, email: string) => 
  api.post('/wompi/create-payment', { planId, email });

// ==================== SPLITS ====================
export const createSplit = (trackId: number, data: any) => 
  api.post(`/tracks/${trackId}/splits`, data);
export const getSplits = (trackId: number) => 
  api.get(`/tracks/${trackId}/splits`);
export const getPendingSplits = (trackId: number) => 
  api.get(`/tracks/${trackId}/splits/pending`);
export const acceptSplit = (token: string) => 
  api.get(`/splits/accept/${token}`);
export const rejectSplit = (token: string) => 
  api.get(`/splits/reject/${token}`);
export const deleteSplit = (splitId: number) => 
  api.delete(`/splits/${splitId}`);

// ==================== STATS ====================
export const uploadStats = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/stats/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};
export const getTrackStats = (trackId: number) => 
  api.get(`/stats/track/${trackId}`);
export const getArtistSummary = () => 
  api.get('/stats/summary');
export const getArtistTracks = () => 
  api.get('/stats/tracks');

// ==================== TRACKS ====================
export const getTracks = () => api.get('/tracks');
export const createTrack = (data: any) => api.post('/tracks', data);

// ==================== MARKETPLACE ====================
export const getBeats = () => api.get('/marketplace/beats');
export const buyBeat = (beatId: number) => api.post('/marketplace/buy', { beatId });

// ==================== FINANCING ====================
export const checkEligibility = () => api.get('/financing/mi-elegibilidad');
export const requestAdvance = (amount: number, reason: string) => 
  api.post('/financing/solicitar', { amount, reason });

// ==================== BULK UPLOAD / CATALOG MIGRATION ====================
export const bulkUploadFiles = (files: File[]) => {
  const formData = new FormData();
  files.forEach(file => formData.append('files', file));
  return api.post('/upload/files', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

// ==================== MARKETING & BRANDING ====================
export const getBrandingQuestions = () => api.get('/marketing/preguntas');
export const submitBrandingTest = (respuestas: string[]) => 
  api.post('/marketing/procesar-test', { respuestas });
export const generateSensoryBranding = () => api.post('/marketing/generar-sensorial');
export const generateTargetMarket = () => api.post('/marketing/generar-mercado');
export const generateContentPlan = () => api.post('/marketing/generar-plan');
export const getMiBranding = () => api.get('/marketing/mi-branding');

// ==================== FACEBOOK ADS ====================
export const createFacebookCampaign = (data: any) => api.post('/facebook-ads/campaign', data);
export const getCampaignInsights = (campaignId: string) => api.get(`/facebook-ads/insights/${campaignId}`);

// ==================== MOOD & AI ====================
export const analyzeMood = (text: string) => api.post('/mood/analyze', { text });
export const getSpotifyMoodLogin = () => {
  window.open(`${API_URL}/mood/login`, 'spotify_login', 'width=600,height=700');
};
export const getMoodRecommendations = (mood: string) => 
  api.get(`/mood/recommendations?mood=${mood}`);

// ==================== ROYALTIES & WITHHOLDINGS ====================
export const getMyWithholdings = () => api.get('/royalties/withholdings/my');
export const releaseWithholding = (id: number) => api.post(`/royalties/withholdings/${id}/release`);

// ==================== LEGAL AGENT ====================
export const queryLegalAgent = (query: string) => 
  api.post('/legal-agent/query', { query });

export default api;
