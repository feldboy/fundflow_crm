import React from 'react';
import Icon from 'components/AppIcon';

const RecommendationPanel = ({ 
  recommendation, 
  onAccept, 
  onOverride, 
  onRequestReview, 
  isLoading 
}) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value) => {
    return `${value}%`;
  };

  return (
    <div className="space-y-6">
      {/* Recommendation Summary */}
      <div className="bg-surface border border-border rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon name="Target" size={20} className="text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-text-primary">AI Recommendation</h2>
            <p className="text-sm text-text-secondary">Funding Decision Support</p>
          </div>
        </div>

        {/* Recommendation Status */}
        <div className="bg-success/10 border border-success/20 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="CheckCircle" size={16} className="text-success" />
            <span className="font-medium text-success">Recommended for Approval</span>
          </div>
          <p className="text-sm text-text-secondary">
            Case meets funding criteria with {recommendation.confidence}% confidence
          </p>
        </div>

        {/* Funding Details */}
        <div className="space-y-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-sm text-text-secondary">Recommended Amount:</span>
            <span className="text-lg font-bold text-primary">
              {formatCurrency(recommendation.recommendedAmount)}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-text-secondary">Maximum Amount:</span>
            <span className="text-sm font-medium text-text-primary">
              {formatCurrency(recommendation.maxAmount)}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-text-secondary">Approval Likelihood:</span>
            <span className="text-sm font-medium text-success">
              {formatPercentage(recommendation.approvalLikelihood)}
            </span>
          </div>
        </div>

        {/* Terms */}
        <div className="border-t border-border pt-4 mb-6">
          <h3 className="font-medium text-text-primary mb-3">Recommended Terms</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-text-secondary">Interest Rate:</span>
              <span className="text-sm font-medium text-text-primary">
                {formatPercentage(recommendation.terms.interestRate)} monthly
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-text-secondary">Processing Fee:</span>
              <span className="text-sm font-medium text-text-primary">
                {formatCurrency(recommendation.terms.fees)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-text-secondary">Expected Timeline:</span>
              <span className="text-sm font-medium text-text-primary">
                {recommendation.terms.repaymentPeriod}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={onAccept}
            disabled={isLoading}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-success text-white rounded-lg hover:bg-success/90 disabled:opacity-50 disabled:cursor-not-allowed transition-micro font-medium"
          >
            {isLoading ? (
              <>
                <Icon name="Loader2" size={16} className="animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Icon name="CheckCircle" size={16} />
                <span>Accept Recommendation</span>
              </>
            )}
          </button>

          <button
            onClick={onOverride}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 border border-border text-text-primary hover:bg-background rounded-lg transition-micro font-medium"
          >
            <Icon name="Edit" size={16} />
            <span>Override Assessment</span>
          </button>

          <button
            onClick={onRequestReview}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 border border-border text-text-secondary hover:text-text-primary hover:bg-background rounded-lg transition-micro"
          >
            <Icon name="Users" size={16} />
            <span>Request Human Review</span>
          </button>
        </div>
      </div>

      {/* Risk Indicators */}
      <div className="bg-surface border border-border rounded-lg p-6">
        <h3 className="font-medium text-text-primary mb-4">Risk Indicators</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-success rounded-full"></div>
              <span className="text-sm text-text-secondary">Case Strength</span>
            </div>
            <span className="text-sm font-medium text-success">Strong</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-success rounded-full"></div>
              <span className="text-sm text-text-secondary">Attorney Track Record</span>
            </div>
            <span className="text-sm font-medium text-success">Excellent</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-warning rounded-full"></div>
              <span className="text-sm text-text-secondary">Timeline Risk</span>
            </div>
            <span className="text-sm font-medium text-warning">Moderate</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-success rounded-full"></div>
              <span className="text-sm text-text-secondary">Settlement Probability</span>
            </div>
            <span className="text-sm font-medium text-success">High</span>
          </div>
        </div>
      </div>

      {/* Additional Actions */}
      <div className="bg-surface border border-border rounded-lg p-6">
        <h3 className="font-medium text-text-primary mb-4">Additional Actions</h3>
        
        <div className="space-y-3">
          <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-text-secondary hover:text-text-primary hover:bg-background border border-border rounded-lg transition-micro">
            <Icon name="Download" size={16} />
            <span>Download Report</span>
          </button>

          <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-text-secondary hover:text-text-primary hover:bg-background border border-border rounded-lg transition-micro">
            <Icon name="Share" size={16} />
            <span>Share Assessment</span>
          </button>

          <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-text-secondary hover:text-text-primary hover:bg-background border border-border rounded-lg transition-micro">
            <Icon name="Calendar" size={16} />
            <span>Schedule Review</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecommendationPanel;