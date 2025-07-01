import apiClient from './api.js';

// AI Agents API Service
export const aiService = {
  // Risk Assessment
  riskAssessment: {
    // Analyze case risk
    analyzeCase: async (caseData) => {
      const response = await apiClient.post('/ai/risk-assessment/analyze/', caseData);
      return response.data;
    },

    // Get risk factors
    getRiskFactors: async (caseId) => {
      const response = await apiClient.get(`/ai/risk-assessment/factors/${caseId}/`);
      return response.data;
    },

    // Update risk assessment
    updateAssessment: async (caseId, assessmentData) => {
      const response = await apiClient.put(`/ai/risk-assessment/${caseId}/`, assessmentData);
      return response.data;
    }
  },

  // Document Analysis
  documentAnalysis: {
    // Analyze document
    analyzeDocument: async (documentId) => {
      const response = await apiClient.post(`/ai/document-analysis/analyze/${documentId}/`);
      return response.data;
    },

    // Extract document data
    extractData: async (documentId) => {
      const response = await apiClient.post(`/ai/document-analysis/extract/${documentId}/`);
      return response.data;
    },

    // Get analysis results
    getResults: async (analysisId) => {
      const response = await apiClient.get(`/ai/document-analysis/results/${analysisId}/`);
      return response.data;
    }
  },

  // Contract Generation
  contractGeneration: {
    // Generate contract
    generateContract: async (contractData) => {
      const response = await apiClient.post('/ai/contract-generation/generate/', contractData);
      return response.data;
    },

    // Get contract templates
    getTemplates: async () => {
      const response = await apiClient.get('/ai/contract-generation/templates/');
      return response.data;
    },

    // Customize template
    customizeTemplate: async (templateId, customizationData) => {
      const response = await apiClient.post(`/ai/contract-generation/customize/${templateId}/`, customizationData);
      return response.data;
    }
  },

  // Communication Drafting
  communicationDrafting: {
    // Draft email
    draftEmail: async (emailData) => {
      const response = await apiClient.post('/ai/communication-drafting/email/', emailData);
      return response.data;
    },

    // Draft letter
    draftLetter: async (letterData) => {
      const response = await apiClient.post('/ai/communication-drafting/letter/', letterData);
      return response.data;
    },

    // Improve communication
    improveCommunication: async (communicationData) => {
      const response = await apiClient.post('/ai/communication-drafting/improve/', communicationData);
      return response.data;
    }
  },

  // Comparable Cases
  comparableCases: {
    // Find similar cases
    findSimilar: async (caseData) => {
      const response = await apiClient.post('/ai/comparable-cases/find-similar/', caseData);
      return response.data;
    },

    // Get case comparisons
    getComparisons: async (caseId) => {
      const response = await apiClient.get(`/ai/comparable-cases/comparisons/${caseId}/`);
      return response.data;
    }
  },

  // Intake Parser
  intakeParser: {
    // Parse intake form
    parseIntake: async (intakeData) => {
      const response = await apiClient.post('/ai/intake-parser/parse/', intakeData);
      return response.data;
    },

    // Validate parsed data
    validateParsedData: async (parsedData) => {
      const response = await apiClient.post('/ai/intake-parser/validate/', parsedData);
      return response.data;
    }
  },

  // Location Intelligence
  locationIntelligence: {
    // Get location insights
    getInsights: async (locationData) => {
      const response = await apiClient.post('/ai/location-intelligence/insights/', locationData);
      return response.data;
    },

    // Validate address
    validateAddress: async (address) => {
      const response = await apiClient.post('/ai/location-intelligence/validate-address/', { address });
      return response.data;
    }
  },

  // Underwriting Assistant
  underwritingAssistant: {
    // Get underwriting recommendation
    getRecommendation: async (applicationData) => {
      const response = await apiClient.post('/ai/underwriting-assistant/recommend/', applicationData);
      return response.data;
    },

    // Calculate funding amount
    calculateFunding: async (calculationData) => {
      const response = await apiClient.post('/ai/underwriting-assistant/calculate-funding/', calculationData);
      return response.data;
    }
  },

  // AI Chatbot
  chatbot: {
    // Send message to chatbot
    sendMessage: async (messageData) => {
      const response = await apiClient.post('/ai/chatbot/message/', messageData);
      return response.data;
    },

    // Get conversation history
    getConversationHistory: async (conversationId) => {
      const response = await apiClient.get(`/ai/chatbot/conversation/${conversationId}/`);
      return response.data;
    },

    // Start new conversation
    startConversation: async (initialData) => {
      const response = await apiClient.post('/ai/chatbot/start-conversation/', initialData);
      return response.data;
    }
  }
};

export default aiService;
