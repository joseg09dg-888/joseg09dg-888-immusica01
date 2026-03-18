import api from './api';

export const checkEligibility = () => api.get('/financing/eligibility');
export const requestAdvance = (amount: number, reason?: string) => api.post('/financing/request', { amount, reason });
export const getAdvances = () => api.get('/financing/advances');

export const financingService = {
  checkEligibility,
  requestAdvance,
  getAdvances,
};
