import apiClient from './api.js';

// Law Firm API Service
export const lawFirmService = {
  // Get all law firms
  getAll: async (filters = {}) => {
    const response = await apiClient.get('/law-firms/', { params: filters });
    return response.data;
  },

  // Get law firm by ID
  getById: async (id) => {
    const response = await apiClient.get(`/law-firms/${id}/`);
    return response.data;
  },

  // Create new law firm
  create: async (lawFirmData) => {
    const response = await apiClient.post('/law-firms/', lawFirmData);
    return response.data;
  },

  // Update law firm
  update: async (id, lawFirmData) => {
    const response = await apiClient.put(`/law-firms/${id}/`, lawFirmData);
    return response.data;
  },

  // Delete law firm
  delete: async (id) => {
    const response = await apiClient.delete(`/law-firms/${id}/`);
    return response.data;
  },

  // Get law firm statistics
  getStats: async () => {
    const response = await apiClient.get('/law-firms/stats/');
    return response.data;
  },

  // Search law firms
  search: async (query) => {
    const response = await apiClient.get('/law-firms/search/', { params: { q: query } });
    return response.data;
  }
};

export default lawFirmService;
