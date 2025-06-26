import React from 'react';
import Icon from 'components/AppIcon';

const CaseCards = ({ 
  cases, 
  selectedCases, 
  onSelectCase, 
  onViewCase,
  getStatusColor 
}) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const getRiskScoreColor = (score) => {
    if (score >= 80) return 'text-success bg-success/10';
    if (score >= 60) return 'text-warning bg-warning/10';
    return 'text-error bg-error/10';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cases.map((caseItem) => (
        <div
          key={caseItem.id}
          className="bg-surface border border-border rounded-lg p-6 hover:shadow-card transition-standard cursor-pointer"
          onClick={() => onViewCase(caseItem)}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={selectedCases.includes(caseItem.id)}
                onChange={() => onSelectCase(caseItem.id)}
                onClick={(e) => e.stopPropagation()}
                className="w-4 h-4 text-primary border-border rounded focus:ring-primary focus:ring-2"
              />
              <div>
                <h3 className="text-sm font-medium text-text-primary">{caseItem.id}</h3>
                <p className="text-xs text-text-secondary">{formatDate(caseItem.createdDate)}</p>
              </div>
            </div>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(caseItem.status)}`}>
              {caseItem.status}
            </span>
          </div>

          {/* Client Info */}
          <div className="mb-4">
            <h4 className="font-medium text-text-primary mb-1">{caseItem.clientName}</h4>
            <p className="text-sm text-text-secondary mb-2">{caseItem.phone}</p>
            <div className="flex items-center space-x-2 text-sm text-text-secondary">
              <Icon name="Building" size={14} />
              <span>{caseItem.attorney}</span>
            </div>
          </div>

          {/* Case Details */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">Case Type:</span>
              <span className="text-sm font-medium text-text-primary">{caseItem.caseType}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">Risk Score:</span>
              <span className={`text-sm font-medium px-2 py-1 rounded ${getRiskScoreColor(caseItem.riskScore)}`}>
                {caseItem.riskScore}%
              </span>
            </div>

            {caseItem.fundingAmount > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">Funded:</span>
                <span className="text-sm font-medium text-success">{formatCurrency(caseItem.fundingAmount)}</span>
              </div>
            )}

            {caseItem.requestedAmount > 0 && caseItem.fundingAmount === 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">Requested:</span>
                <span className="text-sm font-medium text-text-primary">{formatCurrency(caseItem.requestedAmount)}</span>
              </div>
            )}

            {caseItem.estimatedSettlement > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">Est. Settlement:</span>
                <span className="text-sm font-medium text-text-primary">{formatCurrency(caseItem.estimatedSettlement)}</span>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          {caseItem.progress > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-text-secondary">Progress</span>
                <span className="text-xs text-text-secondary">{caseItem.progress}%</span>
              </div>
              <div className="w-full bg-background rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-standard" 
                  style={{ width: `${caseItem.progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="flex items-center space-x-2 text-xs text-text-secondary">
              <Icon name="Clock" size={12} />
              <span>Updated {formatDate(caseItem.lastActivity)}</span>
            </div>
            
            <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => onViewCase(caseItem)}
                className="p-1 text-text-secondary hover:text-text-primary transition-micro"
                title="View Details"
              >
                <Icon name="Eye" size={14} />
              </button>
              <button
                className="p-1 text-text-secondary hover:text-text-primary transition-micro"
                title="Edit Case"
              >
                <Icon name="Edit" size={14} />
              </button>
              <button
                className="p-1 text-text-secondary hover:text-text-primary transition-micro"
                title="More Options"
              >
                <Icon name="MoreHorizontal" size={14} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CaseCards;