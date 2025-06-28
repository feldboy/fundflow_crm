import React, { useState } from 'react';
import Icon from 'components/AppIcon';

const RiskAnalysisCenter = ({ riskFactors, aiRecommendation, similarCases }) => {
  const [activeSection, setActiveSection] = useState('overview');

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

  const getScoreWidth = (score) => `${score}%`;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Overall Risk Score */}
      <div className="bg-surface border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-text-primary">AI Risk Assessment</h2>
          <div className="flex items-center space-x-2">
            <Icon name="Brain" size={20} className="text-primary" />
            <span className="text-sm text-text-secondary">AI Powered</span>
          </div>
        </div>

        {/* Risk Score Gauge */}
        <div className="text-center mb-8">
          <div className="relative w-32 h-32 mx-auto mb-4">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="50"
                stroke="#E2E8F0"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="60"
                cy="60"
                r="50"
                stroke={aiRecommendation.overallScore >= 80 ? '#059669' : aiRecommendation.overallScore >= 60 ? '#D97706' : '#DC2626'}
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${(aiRecommendation.overallScore / 100) * 314} 314`}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className={`text-2xl font-bold ${getRiskColor(aiRecommendation.overallScore)}`}>
                  {aiRecommendation.overallScore}
                </div>
                <div className="text-xs text-text-secondary">Risk Score</div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-center space-x-4">
            <div className="text-center">
              <div className="text-lg font-semibold text-text-primary">{aiRecommendation.confidence}%</div>
              <div className="text-xs text-text-secondary">Confidence</div>
            </div>
            <div className="w-px h-8 bg-border"></div>
            <div className="text-center">
              <div className={`text-lg font-semibold ${getRiskColor(aiRecommendation.overallScore)}`}>
                {aiRecommendation.riskLevel}
              </div>
              <div className="text-xs text-text-secondary">Risk Level</div>
            </div>
          </div>
        </div>

        {/* Section Navigation */}
        <div className="flex space-x-1 bg-background border border-border rounded-lg p-1 mb-6">
          {[
            { id: 'overview', label: 'Overview', icon: 'BarChart3' },
            { id: 'factors', label: 'Risk Factors', icon: 'AlertTriangle' },
            { id: 'similar', label: 'Similar Cases', icon: 'Users' }
          ].map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-micro ${
                activeSection === section.id
                  ? 'bg-surface text-primary border border-border' :'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Icon name={section.icon} size={16} />
              <span>{section.label}</span>
            </button>
          ))}
        </div>

        {/* Content Sections */}
        {activeSection === 'overview' && (
          <div className="space-y-6">
            <div className="bg-background rounded-lg p-4">
              <h3 className="font-medium text-text-primary mb-3">AI Analysis Summary</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {aiRecommendation.reasoning}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-background rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Icon name="TrendingUp" size={16} className="text-success" />
                  <span className="text-sm font-medium text-text-primary">Approval Likelihood</span>
                </div>
                <div className="text-2xl font-bold text-success">{aiRecommendation.approvalLikelihood}%</div>
              </div>

              <div className="bg-background rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Icon name="DollarSign" size={16} className="text-primary" />
                  <span className="text-sm font-medium text-text-primary">Recommended Amount</span>
                </div>
                <div className="text-2xl font-bold text-primary">{formatCurrency(aiRecommendation.recommendedAmount)}</div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'factors' && (
          <div className="space-y-4">
            {riskFactors.map((category, index) => (
              <div key={index} className="bg-background rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-text-primary">{category.category}</h3>
                  <div className={`text-lg font-bold ${getRiskColor(category.score)}`}>
                    {category.score}
                  </div>
                </div>
                
                <div className="w-full bg-border rounded-full h-2 mb-4">
                  <div
                    className={`h-2 rounded-full transition-all duration-1000 ${getRiskBgColor(category.score)}`}
                    style={{ width: getScoreWidth(category.score) }}
                  ></div>
                </div>

                <div className="space-y-2">
                  {category.factors.map((factor, factorIndex) => (
                    <div key={factorIndex} className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${
                          factor.impact === 'High' ? 'bg-error' :
                          factor.impact === 'Medium' ? 'bg-warning' : 'bg-success'
                        }`}></div>
                        <span className="text-text-secondary">{factor.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`font-medium ${getRiskColor(factor.score)}`}>{factor.score}</span>
                        <span className="text-xs text-text-secondary">({factor.impact})</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeSection === 'similar' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-text-primary">Similar Cases Analysis</h3>
              <span className="text-sm text-text-secondary">{similarCases.length} cases found</span>
            </div>

            {similarCases.map((similarCase, index) => (
              <div key={index} className="bg-background rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className="font-medium text-text-primary">{similarCase.id}</span>
                    <span className="text-sm text-success bg-success/10 px-2 py-1 rounded-full">
                      {similarCase.similarity}% match
                    </span>
                  </div>
                  <span className={`text-sm font-medium ${
                    similarCase.roi === 'Positive' ? 'text-success' : 'text-error'
                  }`}>
                    {similarCase.outcome}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-text-secondary">Settlement:</span>
                    <div className="font-medium text-text-primary">{formatCurrency(similarCase.amount)}</div>
                  </div>
                  <div>
                    <span className="text-text-secondary">Timeline:</span>
                    <div className="font-medium text-text-primary">{similarCase.timeline}</div>
                  </div>
                  <div>
                    <span className="text-text-secondary">Funding:</span>
                    <div className="font-medium text-text-primary">{formatCurrency(similarCase.fundingAmount)}</div>
                  </div>
                  <div>
                    <span className="text-text-secondary">ROI:</span>
                    <div className={`font-medium ${
                      similarCase.roi === 'Positive' ? 'text-success' : 'text-error'
                    }`}>
                      {similarCase.roi}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RiskAnalysisCenter;