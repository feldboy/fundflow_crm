import apiClient from './api.js';

// Document API Service
export const documentService = {
  // Get all documents
  getAll: async (filters = {}) => {
    const response = await apiClient.get('/documents', { params: filters });
    return response.data;
  },

  // Get document by ID
  getById: async (id) => {
    const response = await apiClient.get(`/documents/${id}`);
    return response.data;
  },

  // Upload document
  upload: async (formData, onUploadProgress) => {
    const response = await apiClient.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
    return response.data;
  },

  // Download document
  download: async (id) => {
    const response = await apiClient.get(`/documents/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Update document metadata
  update: async (id, documentData) => {
    const response = await apiClient.put(`/documents/${id}`, documentData);
    return response.data;
  },

  // Delete document
  delete: async (id) => {
    const response = await apiClient.delete(`/documents/${id}`);
    return response.data;
  },

  // Get document preview
  getPreview: async (id) => {
    const response = await apiClient.get(`/documents/${id}/preview`);
    return response.data;
  },

  // Search documents
  search: async (query) => {
    const response = await apiClient.get('/documents/search', { params: { q: query } });
    return response.data;
  },

  // Get documents by plaintiff ID
  getByPlaintiffId: async (plaintiffId) => {
    const response = await apiClient.get(`/documents/plaintiff/${plaintiffId}`);
    return response.data;
  }
};

export default documentService;
