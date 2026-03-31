import api from './api';
import { API_BASE_URL } from '../config/api';

export const loginWithSpotify = () => {
  window.location.href = `${API_BASE_URL}/auth/login`;
};

export const handleCallback = (code: string) => {
  return api.get(`/auth/callback?code=${code}`);
};

export const getMe = () => api.get('/auth/me');

export const authService = {
  loginWithSpotify,
  handleCallback,
  getMe,
};
