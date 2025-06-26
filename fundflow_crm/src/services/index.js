// Main API configuration
export { default as apiClient, healthCheck, testConnection } from './api.js';

// Service modules
export { default as plaintiffService } from './plaintiffService.js';
export { default as lawFirmService } from './lawFirmService.js';
export { default as employeeService } from './employeeService.js';
export { default as communicationService } from './communicationService.js';
export { default as documentService } from './documentService.js';
export { default as aiService } from './aiService.js';
export { default as googleService } from './googleService.js';

// Import for combined service object
import plaintiffServiceDefault from './plaintiffService.js';
import lawFirmServiceDefault from './lawFirmService.js';
import employeeServiceDefault from './employeeService.js';
import communicationServiceDefault from './communicationService.js';
import documentServiceDefault from './documentService.js';
import aiServiceDefault from './aiService.js';
import googleServiceDefault from './googleService.js';

// Combined service object for convenience
export const services = {
  plaintiff: plaintiffServiceDefault,
  lawFirm: lawFirmServiceDefault,
  employee: employeeServiceDefault,
  communication: communicationServiceDefault,
  document: documentServiceDefault,
  ai: aiServiceDefault,
  google: googleServiceDefault,
};
