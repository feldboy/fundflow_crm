import apiClient from './api';

// Document API Service
export const documentService = {
  // Get all documents
  getAll: (params) => apiClient.get('/documents', { params }).then(res => res.data),

  // Get document by ID
  getById: (id) => apiClient.get(`/documents/${id}`).then(res => res.data),

  // Create document
  create: (data) => apiClient.post('/documents', data).then(res => res.data),

  // Update document
  update: (id, data) => apiClient.put(`/documents/${id}`, data).then(res => res.data),

  // Delete document
  delete: (id) => apiClient.delete(`/documents/${id}`).then(res => res.data),

  // Upload document
  upload: (plaintiffId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post(`/documents/upload?plaintiff_id=${plaintiffId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then(res => res.data);
  },

  // Download document
  download: async (id) => {
    const response = await apiClient.get(`/documents/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

export default documentService;
