import React, { useState } from 'react';
import { 
  plaintiffService, 
  lawFirmService, 
  communicationService, 
  documentService, 
  aiService, 
  googleService 
} from '../services';
import { useApi, useApiSubmit, usePaginatedApi } from '../hooks/useApi';

const ApiServiceExample = () => {
  const [selectedPlaintiff, setSelectedPlaintiff] = useState(null);
  const [riskAnalysisResult, setRiskAnalysisResult] = useState(null);

  // Example: Fetch all plaintiffs with pagination
  const {
    data: plaintiffs,
    loading: plaintiffsLoading,
    error: plaintiffsError,
    hasMore,
    loadMore,
    refresh: refreshPlaintiffs,
    updateFilters
  } = usePaginatedApi(plaintiffService.getAll);

  // Example: Submit new plaintiff form
  const {
    submit: createPlaintiff,
    loading: creatingPlaintiff,
    error: createError,
    success: createSuccess,
    reset: resetCreate
  } = useApiSubmit(plaintiffService.create);

  // Example: AI Risk Assessment
  const {
    execute: performRiskAnalysis,
    loading: analyzingRisk,
    error: riskError
  } = useApi(aiService.riskAssessment.analyzeCase);

  // Example: Google Address Validation
  const {
    execute: validateAddress,
    loading: validatingAddress,
    error: validationError
  } = useApi(googleService.validateAddress);

  // Example: Document Upload
  const {
    execute: uploadDocument,
    loading: uploadingDocument,
    error: uploadError
  } = useApi(documentService.upload);

  // Handle plaintiff creation
  const handleCreatePlaintiff = async (formData) => {
    try {
      const newPlaintiff = await createPlaintiff(formData);
      console.log('Created plaintiff:', newPlaintiff);
      refreshPlaintiffs(); // Refresh the list
    } catch (error) {
      console.error('Failed to create plaintiff:', error);
    }
  };

  // Handle risk analysis
  const handleRiskAnalysis = async (plaintiffId) => {
    try {
      const plaintiff = plaintiffs.find(p => p.id === plaintiffId);
      if (!plaintiff) return;

      const result = await performRiskAnalysis({
        caseType: plaintiff.caseType,
        injuryType: plaintiff.injuryType,
        lawFirmId: plaintiff.lawFirmId,
        medicalExpenses: plaintiff.medicalExpenses,
        estimatedSettlement: plaintiff.estimatedSettlement
      });
      
      setRiskAnalysisResult(result);
    } catch (error) {
      console.error('Risk analysis failed:', error);
    }
  };

  // Handle address validation
  const handleAddressValidation = async (address) => {
    try {
      const result = await validateAddress(address);
      console.log('Address validation result:', result);
      return result;
    } catch (error) {
      console.error('Address validation failed:', error);
    }
  };

  // Handle document upload
  const handleDocumentUpload = async (file, plaintiffId) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('plaintiffId', plaintiffId);
      formData.append('documentType', 'medical_record');

      const result = await uploadDocument(formData, (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        console.log('Upload progress:', percentCompleted + '%');
      });

      console.log('Document uploaded:', result);
      return result;
    } catch (error) {
      console.error('Document upload failed:', error);
    }
  };

  // Example search functionality
  const handleSearch = (searchTerm) => {
    updateFilters({ search: searchTerm });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">API Services Integration Example</h1>

      {/* Plaintiffs Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Plaintiffs Management</h2>
        
        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search plaintiffs..."
            className="px-4 py-2 border rounded-lg w-full max-w-md"
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        {/* Error handling */}
        {plaintiffsError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-700">Error loading plaintiffs: {plaintiffsError}</p>
            <button
              onClick={refreshPlaintiffs}
              className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
            >
              Retry
            </button>
          </div>
        )}

        {/* Plaintiffs List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {plaintiffs.map((plaintiff) => (
            <div key={plaintiff.id} className="border rounded-lg p-4 bg-white shadow">
              <h3 className="font-semibold">{plaintiff.firstName} {plaintiff.lastName}</h3>
              <p className="text-sm text-gray-600">Case: {plaintiff.caseType}</p>
              <p className="text-sm text-gray-600">Status: {plaintiff.status}</p>
              
              <div className="mt-3 space-x-2">
                <button
                  onClick={() => setSelectedPlaintiff(plaintiff)}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
                >
                  Select
                </button>
                
                <button
                  onClick={() => handleRiskAnalysis(plaintiff.id)}
                  disabled={analyzingRisk}
                  className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200 disabled:opacity-50"
                >
                  {analyzingRisk ? 'Analyzing...' : 'Risk Analysis'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        {hasMore && (
          <button
            onClick={loadMore}
            disabled={plaintiffsLoading}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50"
          >
            {plaintiffsLoading ? 'Loading...' : 'Load More'}
          </button>
        )}
      </div>

      {/* Selected Plaintiff Details */}
      {selectedPlaintiff && (
        <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">Selected Plaintiff</h3>
          <p><strong>Name:</strong> {selectedPlaintiff.firstName} {selectedPlaintiff.lastName}</p>
          <p><strong>Email:</strong> {selectedPlaintiff.email}</p>
          <p><strong>Phone:</strong> {selectedPlaintiff.phone}</p>
          <p><strong>Case Type:</strong> {selectedPlaintiff.caseType}</p>
          
          {/* Address Validation Example */}
          <div className="mt-3">
            <button
              onClick={() => handleAddressValidation(selectedPlaintiff.address)}
              disabled={validatingAddress}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {validatingAddress ? 'Validating...' : 'Validate Address'}
            </button>
          </div>
        </div>
      )}

      {/* Risk Analysis Results */}
      {riskAnalysisResult && (
        <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">Risk Analysis Results</h3>
          <p><strong>Risk Score:</strong> {riskAnalysisResult.riskScore}/100</p>
          <p><strong>Risk Level:</strong> {riskAnalysisResult.riskLevel}</p>
          <p><strong>Recommendation:</strong> {riskAnalysisResult.recommendation}</p>
          
          {riskAnalysisResult.factors && (
            <div className="mt-3">
              <h4 className="font-medium mb-2">Risk Factors:</h4>
              <ul className="list-disc list-inside space-y-1">
                {riskAnalysisResult.factors.map((factor, index) => (
                  <li key={index} className="text-sm">{factor}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Document Upload Example */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Document Upload</h2>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <input
            type="file"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file && selectedPlaintiff) {
                handleDocumentUpload(file, selectedPlaintiff.id);
              }
            }}
            className="mb-4"
          />
          
          {uploadingDocument && (
            <div className="flex items-center space-x-2">
              <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
              <span>Uploading document...</span>
            </div>
          )}
          
          {uploadError && (
            <p className="text-red-600 text-sm">Upload error: {uploadError}</p>
          )}
          
          {!selectedPlaintiff && (
            <p className="text-gray-500 text-sm">Please select a plaintiff first</p>
          )}
        </div>
      </div>

      {/* Communication Example */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">AI Communication Drafting</h2>
        
        <button
          onClick={async () => {
            if (!selectedPlaintiff) return;
            
            try {
              const draftedEmail = await aiService.communicationDrafting.draftEmail({
                recipientType: 'plaintiff',
                purpose: 'status_update',
                caseDetails: {
                  plaintiffName: `${selectedPlaintiff.firstName} ${selectedPlaintiff.lastName}`,
                  caseType: selectedPlaintiff.caseType,
                  status: selectedPlaintiff.status
                }
              });
              
              console.log('Drafted email:', draftedEmail);
              alert('Email drafted! Check console for details.');
            } catch (error) {
              console.error('Failed to draft email:', error);
            }
          }}
          disabled={!selectedPlaintiff}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
        >
          Draft Status Update Email
        </button>
      </div>

      {/* Error Display */}
      {(riskError || validationError || uploadError) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium mb-2">Errors:</h3>
          {riskError && <p className="text-red-600 text-sm">Risk Analysis: {riskError}</p>}
          {validationError && <p className="text-red-600 text-sm">Address Validation: {validationError}</p>}
          {uploadError && <p className="text-red-600 text-sm">Document Upload: {uploadError}</p>}
        </div>
      )}
    </div>
  );
};

export default ApiServiceExample;
