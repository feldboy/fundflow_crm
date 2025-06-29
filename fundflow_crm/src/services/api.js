import axios from 'axios';

// PRODUCTION HTTPS ENFORCEMENT
const PRODUCTION_API_URL = 'https://fundflowcrm-production.up.railway.app';

// Determine the correct API base URL with aggressive HTTPS enforcement
const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL.replace(/^http:\/\//, 'https://'); // Ensure HTTPS
  const isProd = import.meta.env.PROD;
  const mode = import.meta.env.MODE;
  const isVercel = typeof window !== 'undefined' && window.location.hostname === 'fundflow-crm.vercel.app';
  const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
  
  // Log for debugging
  console.log('🔍 API URL Debug:', {
    VITE_API_BASE_URL: envUrl,
    PROD: isProd,
    MODE: mode,
    hostname: typeof window !== 'undefined' ? window.location.hostname : 'SSR',
    protocol: typeof window !== 'undefined' ? window.location.protocol : 'SSR',
    isVercel,
    isHttps
  });
  
  // Aggressive HTTPS enforcement
  if (isVercel || isHttps || isProd || mode === 'production' || envUrl?.includes('vercel.app')) {
    console.log('🔒 ENFORCING HTTPS - Production detected:', envUrl);
    return envUrl;
  }
  
  return envUrl;
};

// Get the base URL and log it
const API_BASE_URL = getApiBaseUrl();
const API_VERSION = import.meta.env.VITE_API_VERSION || 'v1';
const FULL_API_URL = `${API_BASE_URL}/api/${API_VERSION}`;

// Force HTTPS in the final URL as a safety net
const SAFE_API_URL = FULL_API_URL.replace(/^http:\/\//, 'https://');

console.log('🚀 Final API URL:', SAFE_API_URL);
console.log('🔍 URL Breakdown:', {
  baseUrl: API_BASE_URL,
  version: API_VERSION,
  fullUrl: FULL_API_URL,
  safeUrl: SAFE_API_URL
});

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: SAFE_API_URL,
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
    const safeBaseUrl = API_BASE_URL.replace(/^http:\/\//, 'https://');
    const response = await axios.get(`${safeBaseUrl}/health`);
    return response.data;
  } catch (error) {
    throw new Error('Backend connection failed');
  }
};

// Test API connection
export const testConnection = async () => {
  try {
    const safeBaseUrl = API_BASE_URL.replace(/^http:\/\//, 'https://');
    const response = await axios.get(`${safeBaseUrl}/`);
    return response.data;
  } catch (error) {
    throw new Error('API connection test failed');
  }
};
