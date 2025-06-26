import apiClient from './api.js';

// Google Services API
export const googleService = {
  // Address validation
  validateAddress: async (address) => {
    const response = await apiClient.post('/google/validate-address', { address });
    return response.data;
  },

  // Geocode address
  geocodeAddress: async (address) => {
    const response = await apiClient.post('/google/geocode', { address });
    return response.data;
  },

  // Reverse geocode coordinates
  reverseGeocode: async (lat, lng) => {
    const response = await apiClient.post('/google/reverse-geocode', { lat, lng });
    return response.data;
  },

  // Get place details
  getPlaceDetails: async (placeId) => {
    const response = await apiClient.get(`/google/place-details/${placeId}`);
    return response.data;
  },

  // Search places
  searchPlaces: async (query, location = null) => {
    const response = await apiClient.post('/google/search-places', { query, location });
    return response.data;
  },

  // Get directions
  getDirections: async (origin, destination, options = {}) => {
    const response = await apiClient.post('/google/directions', {
      origin,
      destination,
      ...options
    });
    return response.data;
  },

  // Calculate distance matrix
  getDistanceMatrix: async (origins, destinations, options = {}) => {
    const response = await apiClient.post('/google/distance-matrix', {
      origins,
      destinations,
      ...options
    });
    return response.data;
  },

  // Test Google API connection
  testConnection: async () => {
    const response = await apiClient.get('/google/test-connection');
    return response.data;
  }
};

export default googleService;
