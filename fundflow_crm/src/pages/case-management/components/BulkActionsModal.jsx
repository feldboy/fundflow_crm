import React, { useState } from 'react';
import Icon from 'components/AppIcon';
import { exportUtils } from 'utils/apiUtils';

const BulkActionsModal = ({ selectedCases, onClose, onComplete }) => {
  const [selectedAction, setSelectedAction] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [exportFormat, setExportFormat] = useState('csv');

  const bulkActions = [
    { value: 'status', label: 'Change Status', icon: 'RefreshCw' },
    { value: 'export', label: 'Export Cases', icon: 'Download' },
    { value: 'assign', label: 'Assign to User', icon: 'User' },
    { value: 'delete', label: 'Delete Cases', icon: 'Trash2' }
  ];

  const statusOptions = [
    { value: 'Under Review', label: 'Under Review' },
    { value: 'Approved', label: 'Approved' },
    { value: 'Pending Documents', label: 'Pending Documents' },
    { value: 'Rejected', label: 'Rejected' }
  ];

  const exportFormats = [
    { value: 'csv', label: 'CSV File' },
    { value: 'excel', label: 'Excel File' },
    { value: 'pdf', label: 'PDF Report' }
  ];

  const handleExecuteAction = async () => {
    setIsProcessing(true);
    
    try {
      switch (selectedAction) {
        case 'export':
          handleExport();
          break;
        case 'status':
          // TODO: Implement status change
          console.log('Changing status to:', newStatus);
          break;
        case 'assign':
          // TODO: Implement assignment
          console.log('Assigning cases');
          break;
        case 'delete':
          // TODO: Implement deletion
          console.log('Deleting cases');
          break;
        default:
          console.log('Unknown action:', selectedAction);
      }
      
      // Simulate processing time for non-export actions
      if (selectedAction !== 'export') {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
    } catch (error) {
      console.error('Action failed:', error);
      alert('Action failed: ' + error.message);
    } finally {
      setIsProcessing(false);
      onComplete();
    }
  };

  const handleExport = () => {
    try {
      if (!selectedCases || selectedCases.length === 0) {
        throw new Error('No cases selected for export');
      }

      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `cases_export_${timestamp}`;

      switch (exportFormat) {
        case 'csv':
          exportUtils.toCSV(selectedCases, `${filename}.csv`);
          break;
        case 'json':
          exportUtils.toJSON(selectedCases, `${filename}.json`);
          break;
        case 'excel':
          // For now, use CSV format for Excel
          exportUtils.toCSV(selectedCases, `${filename}.csv`);
          break;
        default:
          throw new Error('Unsupported export format');
      }
    } catch (error) {
      throw new Error(`Export failed: ${error.message}`);
    }
  };

  const getActionDescription = () => {
    switch (selectedAction) {
      case 'status':
        return `Change status of ${selectedCases.length} case${selectedCases.length > 1 ? 's' : ''} to "${newStatus}"`;
      case 'export':
        return `Export ${selectedCases.length} case${selectedCases.length > 1 ? 's' : ''} as ${exportFormat.toUpperCase()} file`;
      case 'assign':
        return `Assign ${selectedCases.length} case${selectedCases.length > 1 ? 's' : ''} to a team member`;
      case 'delete':
        return `Permanently delete ${selectedCases.length} case${selectedCases.length > 1 ? 's' : ''}`;
      default:
        return 'Select an action to perform on the selected cases';
    }
  };

  const isActionValid = () => {
    switch (selectedAction) {
      case 'status':
        return newStatus !== '';
      case 'export':
        return exportFormat !== '';
      case 'assign':
        return true; // Would check if user is selected
      case 'delete':
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-1300 flex items-center justify-center p-4">
      <div className="bg-surface rounded-lg shadow-overlay w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-text-primary">Bulk Actions</h2>
          <button
            onClick={onClose}
            className="p-2 text-text-secondary hover:text-text-primary hover:bg-background rounded-lg transition-micro"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Selected Cases Info */}
          <div className="bg-background rounded-lg p-4">
            <div className="flex items-center space-x-2 text-sm text-text-secondary">
              <Icon name="CheckSquare" size={16} />
              <span>{selectedCases.length} case{selectedCases.length > 1 ? 's' : ''} selected</span>
            </div>
          </div>

          {/* Action Selection */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-3">
              Select Action
            </label>
            <div className="space-y-2">
              {bulkActions.map((action) => (
                <label
                  key={action.value}
                  className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-micro ${
                    selectedAction === action.value
                      ? 'border-primary bg-primary/5' :'border-border hover:bg-background'
                  }`}
                >
                  <input
                    type="radio"
                    name="bulkAction"
                    value={action.value}
                    checked={selectedAction === action.value}
                    onChange={(e) => setSelectedAction(e.target.value)}
                    className="w-4 h-4 text-primary border-border focus:ring-primary focus:ring-2"
                  />
                  <Icon name={action.icon} size={16} className="text-text-secondary" />
                  <span className="text-text-primary">{action.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Action-specific Options */}
          {selectedAction === 'status' && (
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                New Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Select status...</option>
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          )}

          {selectedAction === 'export' && (
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Export Format
              </label>
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {exportFormats.map(format => (
                  <option key={format.value} value={format.value}>{format.label}</option>
                ))}
              </select>
            </div>
          )}

          {selectedAction === 'assign' && (
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Assign to
              </label>
              <select
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Select team member...</option>
                <option value="john">John Doe - Case Manager</option>
                <option value="sarah">Sarah Smith - Senior Underwriter</option>
                <option value="mike">Mike Johnson - Legal Analyst</option>
              </select>
            </div>
          )}

          {selectedAction === 'delete' && (
            <div className="bg-error/10 border border-error/20 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Icon name="AlertTriangle" size={20} className="text-error flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-error mb-1">Warning</h4>
                  <p className="text-sm text-error/80">
                    This action cannot be undone. All selected cases and their associated data will be permanently deleted.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Description */}
          <div className="bg-background rounded-lg p-4">
            <p className="text-sm text-text-secondary">{getActionDescription()}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-border text-text-secondary rounded-lg hover:bg-background transition-micro"
          >
            Cancel
          </button>
          <button
            onClick={handleExecuteAction}
            disabled={!selectedAction || !isActionValid() || isProcessing}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-micro ${
              selectedAction === 'delete'
                ? 'bg-error text-white hover:bg-error/90 disabled:bg-error/50' :'bg-primary text-white hover:bg-primary/90 disabled:bg-primary/50'
            } disabled:cursor-not-allowed`}
          >
            {isProcessing ? (
              <>
                <Icon name="Loader2" size={16} className="animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Icon name="Check" size={16} />
                <span>Execute Action</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkActionsModal;