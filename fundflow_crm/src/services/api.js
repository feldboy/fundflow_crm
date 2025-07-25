import axios from 'axios';

// PRODUCTION HTTPS ENFORCEMENT
const PRODUCTION_API_URL = 'https://fundflowcrm-production.up.railway.app';

// Determine the correct API base URL with aggressive HTTPS enforcement
const getApiBaseUrl = () => {
  return PRODUCTION_API_URL;
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
  baseURL: 'https://fundflowcrm-production.up.railway.app/api/v1', // Hardcoded HTTPS URL
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token and force HTTPS
apiClient.interceptors.request.use(
  (config) => {
    // ULTRA-AGGRESSIVE HTTPS ENFORCEMENT
    
    // 1. Force HTTPS in baseURL
    if (config.baseURL) {
      config.baseURL = config.baseURL.replace(/^http:\/\//, 'https://');
    }
    
    // 2. Force HTTPS in URL if it's absolute
    if (config.url && config.url.startsWith('http://')) {
      config.url = config.url.replace(/^http:\/\//, 'https://');
    }
    
    // 3. Validate and fix the full URL
    const fullUrl = config.baseURL + config.url;
    if (fullUrl.includes('http://')) {
      console.warn('🚨 BLOCKING HTTP REQUEST - Converting to HTTPS:', fullUrl);
      const httpsUrl = fullUrl.replace(/http:\/\/([^\/]+)/g, 'https://$1');
      
      // Parse the corrected URL
      const urlObj = new URL(httpsUrl);
      config.baseURL = `${urlObj.protocol}//${urlObj.host}`;
      config.url = urlObj.pathname + urlObj.search + urlObj.hash;
    }
    
    // 4. Final safety check - if anything still contains http://, reject the request
    const finalUrl = config.baseURL + config.url;
    if (finalUrl.includes('http://')) {
      console.error('🛑 SECURITY BLOCK: Refusing to send HTTP request:', finalUrl);
      throw new Error('HTTP requests are blocked for security reasons');
    }
    
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log('🔒 Final request URL:', finalUrl);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and debugging
apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ Successful HTTPS response from:', response.config.url);
    return response;
  },
  (error) => {
    // Log detailed error information for debugging
    if (error.config) {
      console.error('❌ Request failed:', {
        url: error.config.url,
        baseURL: error.config.baseURL,
        fullURL: error.config.baseURL + error.config.url,
        method: error.config.method,
        status: error.response?.status,
        message: error.message
      });
    }
    
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

// Document upload function
export const uploadDocument = (plaintiffId, file) => {
  const formData = new FormData();
  formData.append('file', file);

  return apiClient.post(`/documents/upload?plaintiff_id=${plaintiffId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
