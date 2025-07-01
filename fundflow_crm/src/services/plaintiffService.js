import apiClient from './api.js';

// Plaintiff API Service
export const plaintiffService = {
  // Get all plaintiffs with optional filters
  getAll: async (filters = {}) => {
    const response = await apiClient.get('/plaintiffs/', { params: filters });
    return response.data;
  },

  // Get plaintiff by ID
  getById: async (id) => {
    const response = await apiClient.get(`/plaintiffs/${id}/`);
    return response.data;
  },

  // Create new plaintiff
  create: async (plaintiffData) => {
    const response = await apiClient.post('/plaintiffs/', plaintiffData);
    return response.data;
  },

  // Update plaintiff
  update: async (id, plaintiffData) => {
    const response = await apiClient.put(`/plaintiffs/${id}/`, plaintiffData);
    return response.data;
  },

  // Delete plaintiff
  delete: async (id) => {
    const response = await apiClient.delete(`/plaintiffs/${id}/`);
    return response.data;
  },

  // Get plaintiff statistics
  getStats: async () => {
    const response = await apiClient.get('/plaintiffs/stats/');
    return response.data;
  },

  // Search plaintiffs
  search: async (query) => {
    const response = await apiClient.get('/plaintiffs/search/', { params: { q: query } });
    return response.data;
  }
};

export default plaintiffService;
