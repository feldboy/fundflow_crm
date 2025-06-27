import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Icon from 'components/AppIcon';
import Breadcrumb from 'components/ui/Breadcrumb';
import CaseSummaryPanel from './components/CaseSummaryPanel';
import RiskAnalysisCenter from './components/RiskAnalysisCenter';
import RecommendationPanel from './components/RecommendationPanel';
import { plaintiffService } from '../../services';
import { useApi } from '../../hooks/useApi';

const AIRiskAssessment = () => {
  const [selectedCase, setSelectedCase] = useState(null);
  const [selectedPlaintiffId, setSelectedPlaintiffId] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);

  // Fetch plaintiffs for selection
  const { 
    data: plaintiffs, 
    loading: plaintiffsLoading, 
    error: plaintiffsError,
    execute: fetchPlaintiffs 
  } = useApi(plaintiffService.getAll);

  // Load plaintiffs on component mount
  useEffect(() => {
    fetchPlaintiffs();
  }, [fetchPlaintiffs]);

  // Transform plaintiff data to case format for AI assessment
  const transformPlaintiffToCase = (plaintiff) => {
    if (!plaintiff) return null;
    
    return {
      id: plaintiff._id || plaintiff.id,
      clientName: `${plaintiff.firstName} ${plaintiff.lastName}`,
      caseType: `${plaintiff.caseType}`,
      attorney: "Attorney Name", // This could be enhanced with law firm data
      lawFirm: "Law Firm Name", // This could be enhanced with law firm data
      incidentDate: plaintiff.incidentDate || "Not specified",
      filingDate: plaintiff.createdAt,
      estimatedSettlement: plaintiff.requestedAmount || 0,
      requestedAmount: plaintiff.requestedAmount || 0,
      caseStatus: plaintiff.currentStage || "New Lead",
      jurisdiction: "Not specified", // Could be added to plaintiff model
      description: plaintiff.caseNotes || "No case description available.",
      email: plaintiff.email,
      phone: plaintiff.phone,
      address: plaintiff.address,
      aiScore: plaintiff.aiScore || 0,
      documents: plaintiff.documents?.map(doc => ({
        name: doc.title || doc.name || "Document",
        status: "Available",
        confidence: 85
      })) || []
    };
  };

  // Handle plaintiff selection
  const handlePlaintiffSelect = (plaintiffId) => {
    setSelectedPlaintiffId(plaintiffId);
    const selectedPlaintiff = plaintiffs?.find(p => (p._id || p.id) === plaintiffId);
    if (selectedPlaintiff) {
      const caseData = transformPlaintiffToCase(selectedPlaintiff);
      setSelectedCase(caseData);
    } else {
      setSelectedCase(null);
    }
  };

  // Generate dynamic risk factors based on selected case
  const generateRiskFactors = (caseData) => {
    if (!caseData) return [];
    
    // Calculate scores based on actual case data
    const caseStrengthScore = caseData.documents.length > 0 ? 85 : 60;
    const settlementProbScore = caseData.requestedAmount > 0 ? 82 : 50;
    const timelineScore = caseData.caseStatus === 'Active Litigation' ? 70 : 80;
    
    return [
      {
        category: "Case Strength",
        score: caseStrengthScore,
        factors: [
          { name: "Documentation Quality", score: caseData.documents.length * 20, impact: "High" },
          { name: "Case Notes Completeness", score: caseData.description.length > 50 ? 85 : 60, impact: "Medium" },
          { name: "Client Information", score: caseData.email && caseData.phone ? 90 : 70, impact: "Medium" }
        ]
      },
      {
        category: "Financial Assessment",
        score: settlementProbScore,
        factors: [
          { name: "Requested Amount", score: caseData.requestedAmount > 10000 ? 85 : 65, impact: "High" },
          { name: "Estimated Settlement", score: caseData.estimatedSettlement > 50000 ? 80 : 60, impact: "High" },
          { name: "Case Type Viability", score: 75, impact: "Medium" }
        ]
      },
      {
        category: "Timeline Risk",
        score: timelineScore,
        factors: [
          { name: "Case Status", score: caseData.caseStatus === 'New Lead' ? 85 : 70, impact: "High" },
          { name: "Filing Recency", score: 75, impact: "Medium" },
          { name: "Complexity Assessment", score: 72, impact: "Medium" }
        ]
      }
    ];
  };

  // Generate AI recommendation based on case data
  const generateAIRecommendation = (caseData) => {
    if (!caseData) return null;
    
    const baseScore = 75;
    const docBonus = Math.min(caseData.documents.length * 5, 20);
    const amountPenalty = caseData.requestedAmount > 20000 ? -10 : 0;
    const overallScore = Math.min(Math.max(baseScore + docBonus + amountPenalty, 0), 100);
    
    const recommendedAmount = Math.min(caseData.requestedAmount * 0.8, 15000);
    
    return {
      overallScore,
      confidence: 87,
      riskLevel: overallScore >= 80 ? "Low" : overallScore >= 60 ? "Medium" : "High",
      recommendedAmount: Math.round(recommendedAmount),
      maxAmount: caseData.requestedAmount,
      terms: {
        interestRate: overallScore >= 80 ? 2.0 : overallScore >= 60 ? 2.5 : 3.0,
        fees: Math.round(recommendedAmount * 0.05),
        repaymentPeriod: "18 months"
      },
      approvalLikelihood: overallScore,
      reasoning: `Assessment based on case documentation, client information, and requested funding amount. ${caseData.documents.length > 0 ? 'Strong documentation supports funding decision.' : 'Limited documentation requires careful consideration.'} Case type: ${caseData.caseType}.`
    };
  };

  // Calculate derived data
  const riskFactors = selectedCase ? generateRiskFactors(selectedCase) : [];
  const aiRecommendation = selectedCase ? generateAIRecommendation(selectedCase) : null;

  // Mock similar cases (could be enhanced with real data from backend)
  const similarCases = [
    {
      id: "CASE-2023-156",
      similarity: 94,
      outcome: "Settled",
      amount: 118000,
      timeline: "14 months",
      fundingAmount: 14000,
      roi: "Positive"
    },
    {
      id: "CASE-2023-089",
      similarity: 89,
      outcome: "Settled",
      amount: 95000,
      timeline: "11 months",
      fundingAmount: 12000,
      roi: "Positive"
    },
    {
      id: "CASE-2023-203",
      similarity: 87,
      outcome: "Settled",
      amount: 142000,
      timeline: "16 months",
      fundingAmount: 16500,
      roi: "Positive"
    }
  ];

  const handleAcceptRecommendation = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert('Recommendation accepted and case approved for funding');
    }, 2000);
  };

  const handleOverrideAssessment = () => {
    alert('Override assessment form will open');
  };

  const handleRequestReview = () => {
    alert('Human review request submitted');
  };

  const getRiskColor = (score) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-error';
  };

  const getRiskBgColor = (score) => {
    if (score >= 80) return 'bg-success';
    if (score >= 60) return 'bg-warning';
    return 'bg-error';
  };

  // Loading state for plaintiffs
  if (plaintiffsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Icon name="Loader2" size={48} className="animate-spin text-primary mx-auto mb-4" />
          <p className="text-text-secondary">Loading plaintiffs...</p>
        </div>
      </div>
    );
  }

  // Error state for plaintiffs
  if (plaintiffsError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Icon name="AlertCircle" size={48} className="text-error mx-auto mb-4" />
          <p className="text-text-primary mb-2">Error loading plaintiffs</p>
          <p className="text-text-secondary mb-4">{plaintiffsError}</p>
          <button 
            onClick={fetchPlaintiffs}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // No plaintiffs available
  if (!plaintiffs || plaintiffs.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Icon name="Users" size={48} className="text-text-secondary mx-auto mb-4" />
          <p className="text-text-primary mb-2">No plaintiffs found</p>
          <p className="text-text-secondary mb-4">Add plaintiffs to the system to begin risk assessment</p>
          <Link 
            to="/client-intake-form"
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Add New Plaintiff
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Breadcrumb />
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-text-primary mb-2">AI Risk Assessment</h1>
              <p className="text-text-secondary">
                Intelligent case evaluation and risk scoring
                {selectedCase && ` for ${selectedCase.clientName}`}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                to="/case-management"
                className="flex items-center space-x-2 px-4 py-2 border border-border text-text-secondary hover:text-text-primary hover:bg-background rounded-lg transition-micro"
              >
                <Icon name="ArrowLeft" size={16} />
                <span>Back to Cases</span>
              </Link>
              {selectedCase && (
                <button
                  onClick={() => window.print()}
                  className="flex items-center space-x-2 px-4 py-2 border border-border text-text-secondary hover:text-text-primary hover:bg-background rounded-lg transition-micro"
                >
                  <Icon name="Printer" size={16} />
                  <span>Print Report</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Plaintiff Selection */}
        <div className="mb-8">
          <div className="bg-surface border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-4">Select Plaintiff for Assessment</h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <select
                  value={selectedPlaintiffId}
                  onChange={(e) => handlePlaintiffSelect(e.target.value)}
                  className="w-full px-4 py-3 border border-border rounded-lg bg-background text-text-primary focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Choose a plaintiff to assess...</option>
                  {plaintiffs.map((plaintiff) => (
                    <option key={plaintiff._id || plaintiff.id} value={plaintiff._id || plaintiff.id}>
                      {plaintiff.firstName} {plaintiff.lastName} - {plaintiff.caseType}
                      {plaintiff.requestedAmount && ` ($${plaintiff.requestedAmount.toLocaleString()})`}
                    </option>
                  ))}
                </select>
              </div>
              {selectedPlaintiffId && (
                <button
                  onClick={() => handlePlaintiffSelect('')}
                  className="px-4 py-3 border border-border text-text-secondary hover:text-text-primary hover:bg-background rounded-lg transition-micro"
                >
                  Clear Selection
                </button>
              )}
            </div>
            {selectedCase && (
              <div className="mt-4 p-4 bg-background border border-border rounded-lg">
                <p className="text-sm text-text-secondary">
                  <strong>Selected:</strong> {selectedCase.clientName} - {selectedCase.caseType}
                </p>
                <p className="text-sm text-text-secondary">
                  <strong>Requested Amount:</strong> ${selectedCase.requestedAmount?.toLocaleString() || '0'}
                </p>
              </div>
            )}
          </div>
        </div>

        {!selectedCase ? (
          <div className="text-center py-12">
            <Icon name="Target" size={64} className="text-text-secondary mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-text-primary mb-2">Ready for Assessment</h3>
            <p className="text-text-secondary">
              Select a plaintiff from the dropdown above to begin the AI risk assessment process.
            </p>
          </div>
        ) : (
          <>
            {/* Mobile Tab Navigation */}
        <div className="lg:hidden mb-6">
          <div className="flex space-x-1 bg-surface border border-border rounded-lg p-1">
            {[
              { id: 'overview', label: 'Overview', icon: 'BarChart3' },
              { id: 'analysis', label: 'Analysis', icon: 'Brain' },
              { id: 'recommendation', label: 'Recommendation', icon: 'Target' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-micro ${
                  activeTab === tab.id
                    ? 'bg-primary text-white' :'text-text-secondary hover:text-text-primary'
                }`}
              >
                <Icon name={tab.icon} size={16} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-8">
          {/* Left Panel - Case Summary */}
          <div className="lg:col-span-3">
            <CaseSummaryPanel case={selectedCase} />
          </div>

          {/* Center Panel - Risk Analysis */}
          <div className="lg:col-span-6">
            <RiskAnalysisCenter 
              riskFactors={riskFactors}
              aiRecommendation={aiRecommendation}
              similarCases={similarCases}
            />
          </div>

          {/* Right Panel - Recommendations */}
          <div className="lg:col-span-3">
            <RecommendationPanel 
              recommendation={aiRecommendation}
              onAccept={handleAcceptRecommendation}
              onOverride={handleOverrideAssessment}
              onRequestReview={handleRequestReview}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Mobile/Tablet Layout */}
        <div className="lg:hidden">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <CaseSummaryPanel case={selectedCase} />
            </div>
          )}

          {activeTab === 'analysis' && (
            <div className="space-y-6">
              <RiskAnalysisCenter 
                riskFactors={riskFactors}
                aiRecommendation={aiRecommendation}
                similarCases={similarCases}
              />
            </div>
          )}

          {activeTab === 'recommendation' && (
            <div className="space-y-6">
              <RecommendationPanel 
                recommendation={aiRecommendation}
                onAccept={handleAcceptRecommendation}
                onOverride={handleOverrideAssessment}
                onRequestReview={handleRequestReview}
                isLoading={isLoading}
              />
            </div>
          )}
        </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AIRiskAssessment;