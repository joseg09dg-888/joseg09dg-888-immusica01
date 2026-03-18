import api from './api';

export const getCompositions = () => api.get('/publishing/compositions');
export const createComposition = (data: any) => api.post('/publishing/compositions', data);

export const publishingService = {
  getCompositions,
  createComposition,
};
