import api from './api';

export const createHyperFollow = (data: any) => api.post('/hyperfollow', data);
export const getHyperFollows = () => api.get('/hyperfollow');
export const deleteHyperFollow = (id: number) => api.delete(`/hyperfollow/${id}`);
export const getHyperFollowBySlug = (slug: string) => api.get(`/hyperfollow/${slug}`);
export const captureLead = (hyperfollowId: number, email: string) => 
  api.post(`/hyperfollow/${hyperfollowId}/leads`, { email });

export const hyperFollowService = {
  createHyperFollow,
  getHyperFollows,
  deleteHyperFollow,
  getHyperFollowBySlug,
  captureLead,
};
