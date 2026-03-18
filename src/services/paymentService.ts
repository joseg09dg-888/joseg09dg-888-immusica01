import api from './api';

export const getWompiPlans = () => api.get('/wompi/plans');
export const createWompiPayment = (planId: string, amount: number) => 
  api.post('/wompi/create-payment', { planId, amount });
export const checkTransactionStatus = (id: string) => api.get(`/wompi/transaction/${id}`);
export const getTransactionHistory = () => api.get('/wompi/history');
export const getSubscriptions = () => api.get('/wompi/subscriptions');
export const cancelSubscription = (id: string) => api.post(`/wompi/subscriptions/${id}/cancel`);

export const paymentService = {
  getWompiPlans,
  createWompiPayment,
  checkTransactionStatus,
  getTransactionHistory,
  getSubscriptions,
  cancelSubscription,
};
