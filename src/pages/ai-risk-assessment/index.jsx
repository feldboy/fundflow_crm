import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Icon from 'components/AppIcon';

import Breadcrumb from 'components/ui/Breadcrumb';
import CaseSummaryPanel from './components/CaseSummaryPanel';
import RiskAnalysisCenter from './components/RiskAnalysisCenter';
import RecommendationPanel from './components/RecommendationPanel';

const AIRiskAssessment = () => {
  const [selectedCase, setSelectedCase] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);

  // Mock case data
  const mockCase = {
    id: "CASE-2024-001",
    clientName: "Sarah Johnson",
    caseType: "Personal Injury - Motor Vehicle Accident",
    attorney: "Michael Rodriguez, Esq.",
    lawFirm: "Rodriguez & Associates",
    incidentDate: "2023-08-15",
    filingDate: "2023-09-20",
    estimatedSettlement: 125000,
    requestedAmount: 15000,
    caseStatus: "Active Litigation",
    jurisdiction: "Los Angeles County, CA",
    description: `Client sustained significant injuries in a rear-end collision on Interstate 405. The defendant was clearly at fault, having been texting while driving. Medical records show herniated discs, soft tissue damage, and ongoing physical therapy requirements. The case has strong liability evidence including police reports, witness statements, and traffic camera footage.

The opposing insurance company has already made initial settlement overtures, indicating recognition of liability. Client's medical treatment is ongoing with an orthopedic specialist and physical therapist. Lost wages documentation is comprehensive, and pain and suffering damages are well-documented through medical records and client testimony.`,
    documents: [
      { name: "Police Report", status: "Analyzed", confidence: 95 },
      { name: "Medical Records", status: "Analyzed", confidence: 92 },
      { name: "Insurance Correspondence", status: "Analyzed", confidence: 88 },
      { name: "Witness Statements", status: "Analyzed", confidence: 90 }
    ]
  };

  const riskFactors = [
    {
      category: "Case Strength",
      score: 85,
      factors: [
        { name: "Liability Clarity", score: 92, impact: "High" },
        { name: "Evidence Quality", score: 88, impact: "High" },
        { name: "Damages Documentation", score: 82, impact: "Medium" }
      ]
    },
    {
      category: "Attorney Track Record",
      score: 78,
      factors: [
        { name: "Success Rate", score: 85, impact: "High" },
        { name: "Settlement History", score: 75, impact: "Medium" },
        { name: "Case Volume", score: 72, impact: "Low" }
      ]
    },
    {
      category: "Settlement Probability",
      score: 82,
      factors: [
        { name: "Insurance Company History", score: 80, impact: "Medium" },
        { name: "Case Complexity", score: 85, impact: "High" },
        { name: "Jurisdiction Trends", score: 78, impact: "Medium" }
      ]
    },
    {
      category: "Timeline Risk",
      score: 70,
      factors: [
        { name: "Court Backlog", score: 65, impact: "High" },
        { name: "Discovery Complexity", score: 75, impact: "Medium" },
        { name: "Settlement Negotiations", score: 72, impact: "Medium" }
      ]
    }
  ];

  const aiRecommendation = {
    overallScore: 79,
    confidence: 87,
    riskLevel: "Medium-Low",
    recommendedAmount: 12500,
    maxAmount: 15000,
    terms: {
      interestRate: 2.5,
      fees: 850,
      repaymentPeriod: "18 months"
    },
    approvalLikelihood: 85,
    reasoning: `Based on comprehensive analysis of case documents and historical data, this case presents a favorable risk profile. Strong liability evidence and clear damages documentation support the funding recommendation. The attorney's track record and the defendant's insurance company history indicate high settlement probability within the estimated timeframe.`
  };

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

  useEffect(() => {
    setSelectedCase(mockCase);
  }, []);

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

  if (!selectedCase) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Icon name="Loader2" size={48} className="animate-spin text-primary mx-auto mb-4" />
          <p className="text-text-secondary">Loading case data...</p>
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
                Intelligent case evaluation and risk scoring for {selectedCase.clientName}
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
              <button
                onClick={() => window.print()}
                className="flex items-center space-x-2 px-4 py-2 border border-border text-text-secondary hover:text-text-primary hover:bg-background rounded-lg transition-micro"
              >
                <Icon name="Printer" size={16} />
                <span>Print Report</span>
              </button>
            </div>
          </div>
        </div>

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
      </div>
    </div>
  );
};

export default AIRiskAssessment;