import React from 'react';
import Icon from 'components/AppIcon';

const AIRiskPanel = ({ assessment }) => {
  if (!assessment) {
    return (
      <div className="bg-surface border border-border rounded-lg p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="Brain" size={32} className="text-accent" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">AI Risk Assessment</h3>
          <p className="text-text-secondary text-sm">
            Complete case details to generate AI-powered risk assessment and funding recommendations.
          </p>
        </div>
      </div>
    );
  }

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

  const getFactorIcon = (impact) => {
    switch (impact) {
      case 'positive': return 'TrendingUp';
      case 'negative': return 'TrendingDown';
      default: return 'Minus';
    }
  };

  const getFactorColor = (impact) => {
    switch (impact) {
      case 'positive': return 'text-success';
      case 'negative': return 'text-error';
      default: return 'text-text-secondary';
    }
  };

  return (
    <div className="bg-surface border border-border rounded-lg p-6 space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="Brain" size={32} className="text-accent" />
        </div>
        <h3 className="text-lg font-semibold text-text-primary mb-2">AI Risk Assessment</h3>
      </div>

      {/* Risk Score */}
      <div className="text-center">
        <div className="relative w-24 h-24 mx-auto mb-4">
          <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-border"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={`${2 * Math.PI * 40}`}
              strokeDashoffset={`${2 * Math.PI * 40 * (1 - assessment.riskScore / 100)}`}
              className={getRiskColor(assessment.riskScore)}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-2xl font-bold ${getRiskColor(assessment.riskScore)}`}>
              {assessment.riskScore}
            </span>
          </div>
        </div>
        <p className="text-sm text-text-secondary">Risk Score</p>
      </div>

      {/* Recommendation */}
      <div className={`p-4 rounded-lg ${
        assessment.recommendation.includes('Approve') 
          ? 'bg-success/10 border border-success/20' :'bg-warning/10 border border-warning/20'
      }`}>
        <div className="flex items-center space-x-2 mb-2">
          <Icon 
            name={assessment.recommendation.includes('Approve') ? 'CheckCircle' : 'AlertTriangle'} 
            size={16} 
            className={assessment.recommendation.includes('Approve') ? 'text-success' : 'text-warning'} 
          />
          <span className="font-medium text-text-primary">Recommendation</span>
        </div>
        <p className="text-sm text-text-secondary">{assessment.recommendation}</p>
      </div>

      {/* Risk Factors */}
      <div>
        <h4 className="font-medium text-text-primary mb-3">Risk Factors</h4>
        <div className="space-y-3">
          {assessment.factors.map((factor, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-2 flex-1">
                <Icon 
                  name={getFactorIcon(factor.impact)} 
                  size={14} 
                  className={getFactorColor(factor.impact)} 
                />
                <span className="text-sm text-text-primary">{factor.factor}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-16 h-2 bg-border rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${getRiskBgColor(factor.score)}`}
                    style={{ width: `${factor.score}%` }}
                  />
                </div>
                <span className={`text-xs font-medium ${getRiskColor(factor.score)}`}>
                  {factor.score}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Details */}
      <div className="space-y-3 pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-secondary">Confidence Level</span>
          <span className="text-sm font-medium text-text-primary">{assessment.confidence}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-secondary">Est. Duration</span>
          <span className="text-sm font-medium text-text-primary">{assessment.estimatedDuration}</span>
        </div>
      </div>

      {/* AI Disclaimer */}
      <div className="bg-accent/10 border border-accent/20 rounded-lg p-3">
        <div className="flex items-start space-x-2">
          <Icon name="Info" size={14} className="text-accent flex-shrink-0 mt-0.5" />
          <p className="text-xs text-text-secondary">
            AI assessment is based on historical data and case patterns. Final funding decisions require human review and additional verification.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIRiskPanel;