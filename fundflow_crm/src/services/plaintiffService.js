import apiClient from './api.js';

// Plaintiff API Service
export const plaintiffService = {
  // Get all plaintiffs with optional filters
  getAll: async (filters = {}) => {
    // Protect against React event objects being passed as filters
    const cleanFilters = filters && typeof filters === 'object' && !filters._reactName 
      ? filters 
      : {};
    
    console.log('🔍 Attempting to fetch plaintiffs with filters:', cleanFilters);
    
    // NUCLEAR OPTION: Use native fetch with forced HTTPS to bypass axios issues
    try {
      const baseUrl = 'https://fundflowcrm-production.up.railway.app/api/v1';
      const queryParams = new URLSearchParams(cleanFilters).toString();
      const url = `${baseUrl}/plaintiffs/${queryParams ? '?' + queryParams : ''}`;
      
      console.log('🚀 Using native fetch with URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          // Add auth token if available
          ...(localStorage.getItem('authToken') && {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          })
        },
        mode: 'cors'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('✅ Native fetch successful:', data);
      return data;
      
    } catch (fetchError) {
      console.error('❌ Native fetch failed:', fetchError);
      
      // Fallback to axios as last resort
      try {
        console.log('🔄 Falling back to axios...');
        const response = await apiClient.get('/plaintiffs/', { params: cleanFilters });
        console.log('✅ Axios fallback successful:', response.data);
        return response.data;
      } catch (axiosError) {
        console.error('❌ Axios fallback also failed:', axiosError);
        throw fetchError; // Throw original fetch error
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
