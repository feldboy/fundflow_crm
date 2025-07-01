import apiClient from './api.js';

// Communication API Service
export const communicationService = {
  // Get all communications
  getAll: async (filters = {}) => {
    const response = await apiClient.get('/communications/', { params: filters });
    return response.data;
  },

  // Get communication by ID
  getById: async (id) => {
    const response = await apiClient.get(`/communications/${id}/`);
    return response.data;
  },

  // Create new communication
  create: async (communicationData) => {
    const response = await apiClient.post('/communications/', communicationData);
    return response.data;
  },

  // Update communication
  update: async (id, communicationData) => {
    const response = await apiClient.put(`/communications/${id}/`, communicationData);
    return response.data;
  },

  // Delete communication
  delete: async (id) => {
    const response = await apiClient.delete(`/communications/${id}/`);
    return response.data;
  },

  // Send email
  sendEmail: async (emailData) => {
    const response = await apiClient.post('/communications/send-email/', emailData);
    return response.data;
  },

  // Send SMS
  sendSMS: async (smsData) => {
    const response = await apiClient.post('/communications/send-sms/', smsData);
    return response.data;
  },

  // Get communication templates
  getTemplates: async (type) => {
    const response = await apiClient.get(`/communications/templates/${type}/`);
    return response.data;
  },

  // Create communication template
  createTemplate: async (templateData) => {
    const response = await apiClient.post('/communications/templates/', templateData);
    return response.data;
  }
};

export default communicationService;
