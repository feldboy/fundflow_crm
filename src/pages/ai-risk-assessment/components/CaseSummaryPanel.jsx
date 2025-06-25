import React from 'react';
import Icon from 'components/AppIcon';


const CaseSummaryPanel = ({ case: caseData }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-surface border border-border rounded-lg p-6 h-fit">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <Icon name="FileText" size={20} className="text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Case Summary</h2>
          <p className="text-sm text-text-secondary">{caseData.id}</p>
        </div>
      </div>

      {/* Client Information */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center">
            <Icon name="User" size={20} className="text-secondary" />
          </div>
          <div>
            <h3 className="font-medium text-text-primary">{caseData.clientName}</h3>
            <p className="text-sm text-text-secondary">Client</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center">
            <Icon name="Scale" size={20} className="text-accent" />
          </div>
          <div>
            <h3 className="font-medium text-text-primary">{caseData.attorney}</h3>
            <p className="text-sm text-text-secondary">{caseData.lawFirm}</p>
          </div>
        </div>
      </div>

      {/* Case Details */}
      <div className="space-y-4 mb-6">
        <div className="border-t border-border pt-4">
          <h4 className="font-medium text-text-primary mb-3">Case Details</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-text-secondary">Case Type:</span>
              <span className="text-sm font-medium text-text-primary text-right">{caseData.caseType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-text-secondary">Status:</span>
              <span className="text-sm font-medium text-success">{caseData.caseStatus}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-text-secondary">Incident Date:</span>
              <span className="text-sm font-medium text-text-primary">{formatDate(caseData.incidentDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-text-secondary">Filing Date:</span>
              <span className="text-sm font-medium text-text-primary">{formatDate(caseData.filingDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-text-secondary">Jurisdiction:</span>
              <span className="text-sm font-medium text-text-primary text-right">{caseData.jurisdiction}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Information */}
      <div className="space-y-4 mb-6">
        <div className="border-t border-border pt-4">
          <h4 className="font-medium text-text-primary mb-3">Financial Overview</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-text-secondary">Estimated Settlement:</span>
              <span className="text-sm font-medium text-success">{formatCurrency(caseData.estimatedSettlement)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-text-secondary">Requested Amount:</span>
              <span className="text-sm font-medium text-primary">{formatCurrency(caseData.requestedAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-text-secondary">Funding Ratio:</span>
              <span className="text-sm font-medium text-text-primary">
                {((caseData.requestedAmount / caseData.estimatedSettlement) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Document Status */}
      <div className="border-t border-border pt-4">
        <h4 className="font-medium text-text-primary mb-3">Document Analysis</h4>
        <div className="space-y-2">
          {caseData.documents.map((doc, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-background rounded-lg">
              <div className="flex items-center space-x-2">
                <Icon name="FileCheck" size={16} className="text-success" />
                <span className="text-sm text-text-primary">{doc.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-text-secondary">{doc.confidence}%</span>
                <div className="w-2 h-2 bg-success rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Case Description */}
      <div className="border-t border-border pt-4 mt-6">
        <h4 className="font-medium text-text-primary mb-3">Case Description</h4>
        <div className="text-sm text-text-secondary leading-relaxed max-h-32 overflow-y-auto">
          <p>{caseData.description}</p>
        </div>
      </div>
    </div>
  );
};

export default CaseSummaryPanel;