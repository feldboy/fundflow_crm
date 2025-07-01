import apiClient from './api.js';

// Plaintiff API Service
export const plaintiffService = {
  // Get all plaintiffs with optional filters
  getAll: async (filters = {}) => {
    console.log('🔍 Attempting to fetch plaintiffs with filters:', filters);
    try {
      // First try the main endpoint
      const response = await apiClient.get('/plaintiffs', { params: filters });
      console.log('✅ Successfully fetched plaintiffs:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch plaintiffs from /plaintiffs:', error);
      
      // Fallback: try with a different approach
      try {
        console.log('🔄 Trying fallback endpoint...');
        const fallbackResponse = await apiClient.get('/plaintiffs', { 
          params: { ...filters, limit: filters.limit || 100 }
        });
        console.log('✅ Fallback successful:', fallbackResponse.data);
        return fallbackResponse.data;
      } catch (fallbackError) {
        console.error('❌ Fallback also failed:', fallbackError);
        throw error; // Throw original error
      }
    }
  },

  // Get plaintiff by ID
  getById: async (id) => {
    const response = await apiClient.get(`/plaintiffs/${id}`);
    return response.data;
  },

  // Create new plaintiff
  create: async (plaintiffData) => {
    const response = await apiClient.post('/plaintiffs', plaintiffData);
    return response.data;
  },

  // Update plaintiff
  update: async (id, plaintiffData) => {
    const response = await apiClient.put(`/plaintiffs/${id}`, plaintiffData);
    return response.data;
  },

  // Delete plaintiff
  delete: async (id) => {
    const response = await apiClient.delete(`/plaintiffs/${id}`);
    return response.data;
  },

  // Get plaintiff statistics
  getStats: async () => {
    const response = await apiClient.get('/plaintiffs/stats');
    return response.data;
  },

  // Search plaintiffs
  search: async (query) => {
    const response = await apiClient.get('/plaintiffs/search', { params: { q: query } });
    return response.data;
  }
};

export default plaintiffService;
