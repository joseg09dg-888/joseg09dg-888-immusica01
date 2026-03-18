import api from './api';

export const bulkUploadFiles = (files: File[]) => {
  const formData = new FormData();
  files.forEach(file => formData.append('files', file));
  return api.post('/upload/files', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

export const uploadService = {
  bulkUploadFiles,
};
