import api from './api';

export const getBrandingQuestions = () => api.get('/marketing/preguntas');
export const submitBrandingTest = (respuestas: string[]) => 
  api.post('/marketing/procesar-test', { respuestas });
export const generateSensoryBranding = () => api.post('/marketing/generar-sensorial');
export const generateTargetMarket = () => api.post('/marketing/generar-mercado');
export const generateContentPlan = () => api.post('/marketing/generar-plan');
export const getMiBranding = () => api.get('/marketing/mi-branding');
export const generatePromotionalContent = (trackId: number, platform: string) => 
  api.post('/marketing/generar-promocion', { track_id: trackId, platform });
export const generatePromoCard = (trackId: number, options: any) => 
  api.post(`/promo-cards/generate/${trackId}`, options);
export const generatePromoReel = (trackId: number, message: string) => 
  api.post('/promo/reel', { track_id: trackId, message });

export const createFacebookCampaign = (data: any) => api.post('/marketing/facebook/campaign', data);
export const getCampaigns = () => api.get('/marketing/facebook/campaigns');
export const getCampaignInsights = (id: string) => api.get(`/marketing/facebook/campaigns/${id}/insights`);

export const marketingService = {
  getBrandingQuestions,
  submitBrandingTest,
  generateSensoryBranding,
  generateTargetMarket,
  generateContentPlan,
  getMiBranding,
  generatePromotionalContent,
  generatePromoCard,
  generatePromoReel,
  createFacebookCampaign,
  getCampaigns,
  getCampaignInsights,
};
