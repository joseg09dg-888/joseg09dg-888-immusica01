import api from './api';

export const getChatHistory = () => api.get('/chat/history');
export const reportMessage = (messageId: number, reason: string) => 
  api.post(`/chat/report/${messageId}`, { reason });

export const chatService = {
  getChatHistory,
  reportMessage,
};
