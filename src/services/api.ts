import axios, { AxiosError } from 'axios';
import { API_URL } from '../config/api';
import { toast } from 'sonner';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000, // 15 seconds timeout
});

// Interceptor para agregar el token de autenticación
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('im_music_token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor para manejar errores globales
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;
    const data = error.response?.data as any;

    if (status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('im_music_token');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    } else if (status === 403) {
      toast.error('No tienes permisos para realizar esta acción');
    } else if (status === 429) {
      toast.error('Demasiadas peticiones. Por favor, espera un momento.');
    } else if (status && status >= 500) {
      toast.error('Error en el servidor. Estamos trabajando en ello.');
    } else if (data?.error || data?.message) {
      toast.error(data.error || data.message);
    } else if (error.code === 'ECONNABORTED') {
      toast.error('La petición tardó demasiado. Revisa tu conexión.');
    }

    return Promise.reject(error);
  }
);

export * from './authService';
export * from './trackService';
export * from './artistService';
export * from './statsService';
export * from './marketingService';
export * from './paymentService';
export * from './adminService';
export * from './splitService';
export * from './royaltyService';
export * from './moodService';
export * from './legalService';
export * from './hyperFollowService';
export * from './chatService';
export * from './playlistService';
export * from './systemService';
export * from './releaseService';
export * from './videoService';
export * from './publishingService';
export * from './spotlightService';
export * from './vaultService';
export * from './youtubeService';
export * from './uploadService';
export * from './marketplaceService';
export * from './financingService';

export default api;
