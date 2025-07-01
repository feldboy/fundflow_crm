import apiClient from './api.js';

// Employee API Service
export const employeeService = {
  // Get all employees
  getAll: async (filters = {}) => {
    const response = await apiClient.get('/employees/', { params: filters });
    return response.data;
  },

  // Get employee by ID
  getById: async (id) => {
    const response = await apiClient.get(`/employees/${id}/`);
    return response.data;
  },

  // Create new employee
  create: async (employeeData) => {
    const response = await apiClient.post('/employees/', employeeData);
    return response.data;
  },

  // Update employee
  update: async (id, employeeData) => {
    const response = await apiClient.put(`/employees/${id}/`, employeeData);
    return response.data;
  },

  // Delete employee
  delete: async (id) => {
    const response = await apiClient.delete(`/employees/${id}/`);
    return response.data;
  },

  // Get employee statistics
  getStats: async () => {
    const response = await apiClient.get('/employees/stats/');
    return response.data;
  },

  // Search employees
  search: async (query) => {
    const response = await apiClient.get('/employees/search/', { params: { q: query } });
    return response.data;
  }
};

export default employeeService;
