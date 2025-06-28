import axios from 'axios';

// Determine the correct API base URL with debugging
const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  const isProd = import.meta.env.PROD;
  const mode = import.meta.env.MODE;
  const isVercel = window.location.hostname === 'fundflow-crm.vercel.app';
  
  // Log for debugging
  console.log('🔍 API URL Debug:', {
    VITE_API_BASE_URL: envUrl,
    PROD: isProd,
    MODE: mode,
    hostname: window.location.hostname,
    isVercel
  });
  
  // Force HTTPS if on Vercel production
  if (isVercel || window.location.protocol === 'https:') {
    const prodUrl = 'https://fundflowcrm-production.up.railway.app';
    console.log('🔒 Forcing HTTPS for production:', prodUrl);
    return prodUrl;
  }
  
  // Use environment variable if available and not overridden
  if (envUrl && !isVercel) {
    console.log('✅ Using environment URL:', envUrl);
    return envUrl;
  }
  
  // Production fallback - force HTTPS
  if (isProd || mode === 'production') {
    const prodUrl = 'https://fundflowcrm-production.up.railway.app';
    console.log('🔧 Using production fallback:', prodUrl);
    return prodUrl;
  }
  
  // Development fallback
  const devUrl = 'http://localhost:8000';
  console.log('🏠 Using development fallback:', devUrl);
  return devUrl;
};

// Get the base URL and log it
const API_BASE_URL = getApiBaseUrl();
const API_VERSION = import.meta.env.VITE_API_VERSION || 'v1';
const FULL_API_URL = `${API_BASE_URL}/api/${API_VERSION}`;

console.log('🚀 Final API URL:', FULL_API_URL);

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: FULL_API_URL,
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
    const response = await axios.get(`${API_BASE_URL}/health`);
    return response.data;
  } catch (error) {
    throw new Error('Backend connection failed');
  }
};

// Test API connection
export const testConnection = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/`);
    return response.data;
  } catch (error) {
    throw new Error('API connection test failed');
  }
};
