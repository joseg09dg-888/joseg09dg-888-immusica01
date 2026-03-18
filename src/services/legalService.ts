import api from './api';

export const queryLegalAgent = (query: string) => 
  api.post('/legal-agent/query', { query });

export const legalService = {
  queryLegalAgent,
};
