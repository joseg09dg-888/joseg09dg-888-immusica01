import api from './api';

export const getMyWithholdings = () => api.get('/royalties/withholdings/my');
export const releaseWithholding = (id: number) => api.post(`/royalties/withholdings/${id}/release`);
export const getPublishingRoyalties = () => api.get('/publishing/royalties');
export const getMyBalance = () => api.get('/royalties/balance/my');
export const getMyDistributions = () => api.get('/royalties/distributions/my');
export const requestPayout = (data: { amount: number, method: string }) => api.post('/royalties/payout/request', data);

export const royaltyService = {
  getMyWithholdings,
  releaseWithholding,
  getPublishingRoyalties,
  getMyBalance,
  getMyDistributions,
  requestPayout,
};
