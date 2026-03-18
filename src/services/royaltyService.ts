import api from './api';

export const getMyWithholdings = () => api.get('/royalties/withholdings/my');
export const releaseWithholding = (id: number) => api.post(`/royalties/withholdings/${id}/release`);
export const getPublishingRoyalties = () => api.get('/publishing/royalties');

export const royaltyService = {
  getMyWithholdings,
  releaseWithholding,
  getPublishingRoyalties,
};
