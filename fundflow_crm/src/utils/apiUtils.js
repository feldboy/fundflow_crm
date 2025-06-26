// API Utilities for common operations
import { services } from '../services';

/**
 * Centralized error handler for API calls
 */
export const handleApiError = (error, context = '') => {
  console.error(`API Error${context ? ` (${context})` : ''}:`, error);
  
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return `Bad Request: ${data.message || 'Invalid data provided'}`;
      case 401:
        return 'Authentication required. Please log in again.';
      case 403:
        return 'Access forbidden. You do not have permission for this action.';
      case 404:
        return 'Resource not found.';
      case 409:
        return `Conflict: ${data.message || 'Resource already exists'}`;
      case 422:
        return `Validation Error: ${data.message || 'Invalid data format'}`;
      case 429:
        return 'Too many requests. Please try again later.';
      case 500:
        return 'Internal server error. Please try again later.';
      case 503:
        return 'Service unavailable. Please try again later.';
      default:
        return data.message || 'An unexpected error occurred';
    }
  } else if (error.request) {
    // Network error
    return 'Network error. Please check your connection and try again.';
  } else {
    // Other error
    return error.message || 'An unexpected error occurred';
  }
};

/**
 * Batch operations for multiple entities
 */
export const batchOperations = {
  // Delete multiple plaintiffs
  deletePlaintiffs: async (plaintiffIds) => {
    const results = await Promise.allSettled(
      plaintiffIds.map(id => services.plaintiff.delete(id))
    );
    
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    
    return { successful, failed, total: plaintiffIds.length };
  },

  // Update multiple plaintiffs
  updatePlaintiffs: async (updates) => {
    const results = await Promise.allSettled(
      updates.map(({ id, data }) => services.plaintiff.update(id, data))
    );
    
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    
    return { successful, failed, total: updates.length };
  },

  // Send bulk communications
  sendBulkCommunications: async (communications) => {
    const results = await Promise.allSettled(
      communications.map(comm => services.communication.create(comm))
    );
    
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    
    return { successful, failed, total: communications.length };
  }
};

/**
 * Data transformation utilities
 */
export const dataTransformers = {
  // Transform plaintiff data for forms
  plaintiffToFormData: (plaintiff) => ({
    firstName: plaintiff.firstName || '',
    lastName: plaintiff.lastName || '',
    email: plaintiff.email || '',
    phone: plaintiff.phone || '',
    address: plaintiff.address || '',
    caseType: plaintiff.caseType || '',
    injuryType: plaintiff.injuryType || '',
    status: plaintiff.status || 'pending',
    lawFirmId: plaintiff.lawFirmId || '',
    medicalExpenses: plaintiff.medicalExpenses || 0,
    estimatedSettlement: plaintiff.estimatedSettlement || 0
  }),

  // Transform form data to plaintiff
  formDataToPlaintiff: (formData) => ({
    ...formData,
    medicalExpenses: parseFloat(formData.medicalExpenses) || 0,
    estimatedSettlement: parseFloat(formData.estimatedSettlement) || 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }),

  // Transform case data for AI risk assessment
  caseToRiskAssessmentData: (plaintiff, lawFirm = null) => ({
    caseType: plaintiff.caseType,
    injuryType: plaintiff.injuryType,
    medicalExpenses: plaintiff.medicalExpenses,
    estimatedSettlement: plaintiff.estimatedSettlement,
    plaintiffAge: plaintiff.age,
    accidentDate: plaintiff.accidentDate,
    lawFirmExperience: lawFirm?.yearsInBusiness,
    lawFirmSuccessRate: lawFirm?.successRate,
    jurisdiction: plaintiff.jurisdiction || 'unknown'
  })
};

/**
 * Validation utilities
 */
export const validators = {
  // Validate email format
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Validate phone number
  isValidPhone: (phone) => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
  },

  // Validate required fields
  validateRequiredFields: (data, requiredFields) => {
    const errors = {};
    
    requiredFields.forEach(field => {
      if (!data[field] || data[field].toString().trim() === '') {
        errors[field] = `${field} is required`;
      }
    });
    
    return errors;
  },

  // Validate plaintiff data
  validatePlaintiffData: (data) => {
    const errors = validators.validateRequiredFields(data, [
      'firstName', 'lastName', 'email', 'phone', 'caseType'
    ]);
    
    if (data.email && !validators.isValidEmail(data.email)) {
      errors.email = 'Invalid email format';
    }
    
    if (data.phone && !validators.isValidPhone(data.phone)) {
      errors.phone = 'Invalid phone number format';
    }
    
    if (data.medicalExpenses && data.medicalExpenses < 0) {
      errors.medicalExpenses = 'Medical expenses cannot be negative';
    }
    
    if (data.estimatedSettlement && data.estimatedSettlement < 0) {
      errors.estimatedSettlement = 'Estimated settlement cannot be negative';
    }
    
    return errors;
  }
};

/**
 * Cache utilities for API responses
 */
export const cache = {
  storage: new Map(),
  
  // Get cached data
  get: (key) => {
    const cached = cache.storage.get(key);
    if (!cached) return null;
    
    const { data, timestamp, ttl } = cached;
    if (Date.now() - timestamp > ttl) {
      cache.storage.delete(key);
      return null;
    }
    
    return data;
  },
  
  // Set cached data
  set: (key, data, ttl = 5 * 60 * 1000) => { // Default 5 minutes
    cache.storage.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  },
  
  // Clear cache
  clear: (key) => {
    if (key) {
      cache.storage.delete(key);
    } else {
      cache.storage.clear();
    }
  }
};

/**
 * Pagination utilities
 */
export const pagination = {
  // Calculate pagination info
  calculatePagination: (currentPage, totalItems, itemsPerPage) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    
    return {
      currentPage,
      totalPages,
      totalItems,
      itemsPerPage,
      startIndex,
      endIndex,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1
    };
  }
};

/**
 * Export utilities
 */
export const exportUtils = {
  // Export data to CSV
  toCSV: (data, filename = 'export.csv') => {
    if (!data.length) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          return typeof value === 'string' && value.includes(',') 
            ? `"${value}"` 
            : value;
        }).join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  },
  
  // Export data to JSON
  toJSON: (data, filename = 'export.json') => {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }
};
