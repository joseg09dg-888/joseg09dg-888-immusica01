import api from './api';

export const getVaultFiles = () => api.get('/vault');
export const uploadToVault = (formData: FormData) => 
  api.post('/vault', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteFromVault = (id: number) => api.delete(`/vault/${id}`);

export const vaultService = {
  getVaultFiles,
  uploadToVault,
  deleteFromVault,
};
