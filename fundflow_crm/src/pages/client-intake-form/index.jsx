import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from 'components/AppIcon';

import Breadcrumb from 'components/ui/Breadcrumb';
import FormProgress from './components/FormProgress';
import ClientInformationTab from './components/ClientInformationTab';
import CaseDetailsTab from './components/CaseDetailsTab';
import AttorneyInformationTab from './components/AttorneyInformationTab';
import DocumentUploadTab from './components/DocumentUploadTab';
import AIRiskPanel from './components/AIRiskPanel';

const ClientIntakeForm = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('client');
  const [formData, setFormData] = useState({
    client: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      ssn: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      emergencyContact: '',
      emergencyPhone: ''
    },
    case: {
      caseType: '',
      incidentDate: '',
      description: '',
      estimatedSettlement: '',
      currentStatus: '',
      courtLocation: '',
      caseNumber: '',
      injuries: [],
      medicalTreatment: '',
      workStatus: ''
    },
    attorney: {
      firmName: '',
      attorneyName: '',
      email: '',
      phone: '',
      barNumber: '',
      address: '',
      verified: false
    },
    documents: []
  });
  
  const [validationErrors, setValidationErrors] = useState({});
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [aiAssessment, setAiAssessment] = useState(null);

  const tabs = [
    { id: 'client', label: 'Client Information', icon: 'User', completed: false },
    { id: 'case', label: 'Case Details', icon: 'FileText', completed: false },
    { id: 'attorney', label: 'Attorney Information', icon: 'Scale', completed: false },
    { id: 'documents', label: 'Document Upload', icon: 'Upload', completed: false }
  ];

  // Auto-save functionality
  useEffect(() => {
    const autoSaveTimer = setTimeout(() => {
      if (Object.keys(formData.client).some(key => formData.client[key]) || 
          Object.keys(formData.case).some(key => formData.case[key])) {
        handleAutoSave();
      }
    }, 3000);

    return () => clearTimeout(autoSaveTimer);
  }, [formData]);

  // AI Assessment trigger
  useEffect(() => {
    if (formData.case.caseType && formData.case.estimatedSettlement && formData.case.description) {
      generateAIAssessment();
    }
  }, [formData.case.caseType, formData.case.estimatedSettlement, formData.case.description]);

  const handleAutoSave = async () => {
    setIsAutoSaving(true);
    // Simulate auto-save API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsAutoSaving(false);
  };

  const generateAIAssessment = async () => {
    // Simulate AI assessment generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockAssessment = {
      riskScore: Math.floor(Math.random() * 40) + 60, // 60-100 range
      factors: [
        { factor: 'Case Type Viability', score: 85, impact: 'positive' },
        { factor: 'Settlement Amount', score: 75, impact: 'positive' },
        { factor: 'Case Complexity', score: 65, impact: 'neutral' },
        { factor: 'Attorney Track Record', score: 90, impact: 'positive' }
      ],
      recommendation: formData.case.estimatedSettlement > 50000 ? 'Approve for funding' : 'Requires additional review',
      confidence: 'High',
      estimatedDuration: '8-12 months'
    };
    
    setAiAssessment(mockAssessment);
  };

  const updateFormData = (section, data) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data }
    }));
  };

  const validateCurrentTab = () => {
    const errors = {};
    
    switch (activeTab) {
      case 'client':
        if (!formData.client.firstName) errors.firstName = 'First name is required';
        if (!formData.client.lastName) errors.lastName = 'Last name is required';
        if (!formData.client.email) errors.email = 'Email is required';
        if (!formData.client.phone) errors.phone = 'Phone number is required';
        break;
      case 'case':
        if (!formData.case.caseType) errors.caseType = 'Case type is required';
        if (!formData.case.incidentDate) errors.incidentDate = 'Incident date is required';
        if (!formData.case.description) errors.description = 'Case description is required';
        break;
      case 'attorney':
        if (!formData.attorney.firmName) errors.firmName = 'Firm name is required';
        if (!formData.attorney.attorneyName) errors.attorneyName = 'Attorney name is required';
        if (!formData.attorney.email) errors.email = 'Attorney email is required';
        break;
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextTab = () => {
    if (validateCurrentTab()) {
      const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
      if (currentIndex < tabs.length - 1) {
        setActiveTab(tabs[currentIndex + 1].id);
      }
    }
  };

  const handlePreviousTab = () => {
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1].id);
    }
  };

  const handleSubmit = async () => {
    if (validateCurrentTab()) {
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 2000));
      navigate('/case-management');
    }
  };

  const handleCancel = () => {
    setShowConfirmDialog(true);
  };

  const confirmCancel = () => {
    navigate('/case-management');
  };

  const getTabCompletion = () => {
    return tabs.map(tab => {
      let completed = false;
      switch (tab.id) {
        case 'client':
          completed = formData.client.firstName && formData.client.lastName && formData.client.email && formData.client.phone;
          break;
        case 'case':
          completed = formData.case.caseType && formData.case.incidentDate && formData.case.description;
          break;
        case 'attorney':
          completed = formData.attorney.firmName && formData.attorney.attorneyName && formData.attorney.email;
          break;
        case 'documents':
          completed = formData.documents.length > 0;
          break;
      }
      return { ...tab, completed };
    });
  };

  const completedTabs = getTabCompletion();
  const overallProgress = (completedTabs.filter(tab => tab.completed).length / tabs.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Breadcrumb />
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-text-primary mb-2">New Case Intake</h1>
              <p className="text-text-secondary">Complete all sections to submit case for review</p>
            </div>
            <div className="flex items-center space-x-2">
              {isAutoSaving && (
                <div className="flex items-center space-x-2 text-text-secondary">
                  <Icon name="Save" size={16} className="animate-pulse" />
                  <span className="text-sm">Auto-saving...</span>
                </div>
              )}
              <div className="text-sm text-text-secondary">
                Progress: {Math.round(overallProgress)}%
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Progress & Navigation */}
          <div className="lg:col-span-1">
            <FormProgress 
              tabs={completedTabs}
              activeTab={activeTab}
              onTabClick={setActiveTab}
              overallProgress={overallProgress}
            />
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2">
            <div className="bg-surface border border-border rounded-lg">
              {/* Tab Navigation */}
              <div className="border-b border-border">
                <nav className="flex space-x-8 px-6">
                  {completedTabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-micro ${
                        activeTab === tab.id
                          ? 'border-primary text-primary' :'border-transparent text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      <Icon 
                        name={tab.completed ? "CheckCircle" : tab.icon} 
                        size={16} 
                        className={tab.completed ? "text-success" : ""} 
                      />
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'client' && (
                  <ClientInformationTab
                    data={formData.client}
                    errors={validationErrors}
                    onChange={(data) => updateFormData('client', data)}
                  />
                )}
                
                {activeTab === 'case' && (
                  <CaseDetailsTab
                    data={formData.case}
                    errors={validationErrors}
                    onChange={(data) => updateFormData('case', data)}
                  />
                )}
                
                {activeTab === 'attorney' && (
                  <AttorneyInformationTab
                    data={formData.attorney}
                    errors={validationErrors}
                    onChange={(data) => updateFormData('attorney', data)}
                  />
                )}
                
                {activeTab === 'documents' && (
                  <DocumentUploadTab
                    documents={formData.documents}
                    onChange={(documents) => updateFormData('documents', { documents })}
                  />
                )}
              </div>

              {/* Form Actions */}
              <div className="border-t border-border px-6 py-4">
                <div className="flex items-center justify-between">
                  <button
                    onClick={handlePreviousTab}
                    disabled={activeTab === 'client'}
                    className="flex items-center space-x-2 px-4 py-2 text-text-secondary hover:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-micro"
                  >
                    <Icon name="ChevronLeft" size={16} />
                    <span>Previous</span>
                  </button>

                  <div className="flex items-center space-x-3">
                    <button
                      onClick={handleCancel}
                      className="px-6 py-2 border border-border text-text-secondary hover:text-text-primary rounded-lg transition-micro"
                    >
                      Cancel
                    </button>
                    
                    <button
                      onClick={handleAutoSave}
                      className="px-6 py-2 border border-border text-text-primary hover:bg-background rounded-lg transition-micro"
                    >
                      Save Draft
                    </button>

                    {activeTab === 'documents' ? (
                      <button
                        onClick={handleSubmit}
                        className="px-6 py-2 bg-primary text-white hover:bg-primary/90 rounded-lg transition-micro"
                      >
                        Submit for Review
                      </button>
                    ) : (
                      <button
                        onClick={handleNextTab}
                        className="flex items-center space-x-2 px-6 py-2 bg-primary text-white hover:bg-primary/90 rounded-lg transition-micro"
                      >
                        <span>Next</span>
                        <Icon name="ChevronRight" size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - AI Risk Assessment */}
          <div className="lg:col-span-1">
            <AIRiskPanel assessment={aiAssessment} />
          </div>
        </div>

        {/* Confirmation Dialog */}
        {showConfirmDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-surface border border-border rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center space-x-3 mb-4">
                <Icon name="AlertTriangle" size={24} className="text-warning" />
                <h3 className="text-lg font-semibold text-text-primary">Confirm Cancel</h3>
              </div>
              <p className="text-text-secondary mb-6">
                Are you sure you want to cancel? Any unsaved changes will be lost.
              </p>
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => setShowConfirmDialog(false)}
                  className="px-4 py-2 border border-border text-text-secondary hover:text-text-primary rounded-lg transition-micro"
                >
                  Keep Editing
                </button>
                <button
                  onClick={confirmCancel}
                  className="px-4 py-2 bg-error text-white hover:bg-error/90 rounded-lg transition-micro"
                >
                  Yes, Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientIntakeForm;