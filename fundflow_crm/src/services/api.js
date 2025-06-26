import axios from 'axios';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/${import.meta.env.VITE_API_VERSION || 'v1'}`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      // Access forbidden
      console.error('Access forbidden:', error.response.data);
    } else if (error.response?.status >= 500) {
      // Server error
      console.error('Server error:', error.response.data);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;

// Health check function
export const healthCheck = async () => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/health`);
    return response.data;
  } catch (error) {
    throw new Error('Backend connection failed');
  }
};

// Test API connection
export const testConnection = async () => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/`);
    return response.data;
  } catch (error) {
    throw new Error('API connection test failed');
  }
};
