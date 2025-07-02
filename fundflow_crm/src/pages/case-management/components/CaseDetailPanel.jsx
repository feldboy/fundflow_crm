import React, { useState, useEffect } from 'react';
import Icon from 'components/AppIcon';
import { plaintiffService } from 'services/plaintiffService';
import { exportUtils } from 'utils/apiUtils';
import FileUpload from 'components/FileUpload';
import { documentService } from 'services/documentService';

const CaseDetailPanel = ({ case: caseData, onClose, getStatusColor, onCaseUpdate }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);

  useEffect(() => {
    if (activeTab === 'documents') {
      fetchDocuments();
    }
  }, [activeTab, caseData.id]);

  const fetchDocuments = async () => {
    setIsLoadingDocs(true);
    try {
      const docs = await documentService.getAll({ plaintiff_id: caseData.id });
      setDocuments(docs);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setIsLoadingDocs(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const getRiskScoreColor = (score) => {
    if (score >= 80) return 'text-success bg-success/10';
    if (score >= 60) return 'text-warning bg-warning/10';
    return 'text-error bg-error/10';
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'FileText' },
    { id: 'documents', label: 'Documents', icon: 'Folder' },
    { id: 'timeline', label: 'Timeline', icon: 'Clock' },
    { id: 'communications', label: 'Communications', icon: 'MessageSquare' }
  ];

  const mockTimeline = [
    {
      id: 1,
      date: new Date('2024-01-15'),
      title: 'Risk Assessment Completed',
      description: 'AI risk assessment completed with score of ' + caseData.riskScore + '%',
      type: 'assessment',
      user: 'System'
    },
    {
      id: 2,
      date: new Date('2024-01-12'),
      title: 'Documents Uploaded',
      description: 'Medical records and police report uploaded by attorney',
      type: 'document',
      user: caseData.attorney
    },
    {
      id: 3,
      date: new Date('2024-01-10'),
      title: 'Case Created',
      description: 'Initial case intake completed',
      type: 'created',
      user: 'John Doe'
    }
  ];

  const mockCommunications = [
    {
      id: 1,
      date: new Date('2024-01-15'),
      type: 'email',
      subject: 'Case Status Update',
      content: `Dear ${caseData.clientName}, we wanted to update you on the status of your case. Our review is progressing well and we expect to have a decision within the next few business days.`,
      from: 'FundFlow Team',
      to: caseData.email
    },
    {
      id: 2,
      date: new Date('2024-01-12'),
      type: 'phone',
      subject: 'Document Request Follow-up',
      content: 'Spoke with client regarding additional medical documentation needed for case evaluation.',
      from: 'Case Manager',
      to: caseData.clientName
    }
  ];

  const handleEditClick = () => {
    setEditData({
      firstName: caseData.firstName || '',
      lastName: caseData.lastName || '',
      email: caseData.email || '',
      phone: caseData.phone || '',
      address: caseData.address || '',
      caseType: caseData.caseType || '',
      requestedAmount: caseData.requestedAmount || '',
      status: caseData.status || ''
    });
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    setIsSaving(true);
    try {
      const updatedCase = await plaintiffService.update(caseData.id, editData);
      if (onCaseUpdate) {
        onCaseUpdate(updatedCase);
      }
      setIsEditing(false);
      alert('Case updated successfully!');
    } catch (error) {
      console.error('Error updating case:', error);
      alert('Failed to update case: ' + (error.response?.data?.detail || error.message));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData({});
  };

  const handleExportCase = () => {
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `case_${caseData.id}_${timestamp}`;
      exportUtils.toJSON([caseData], `${filename}.json`);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed: ' + error.message);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const updatedCase = await plaintiffService.update(caseData.id, { status: newStatus });
      if (onCaseUpdate) {
        onCaseUpdate(updatedCase);
      }
      alert(`Case ${newStatus.toLowerCase()} successfully!`);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleUploadSuccess = () => {
    fetchDocuments(); // Refresh document list after upload
  };

  const handleDownload = async (doc) => {
    try {
      const blob = await documentService.download(doc.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = doc.originalName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Failed to download document.');
    }
  };

  const handleDelete = async (docId) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await documentService.delete(docId);
        fetchDocuments(); // Refresh the list
      } catch (error) {
        console.error('Error deleting document:', error);
        alert('Failed to delete document.');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-1200 flex items-center justify-end">
      <div className="w-full max-w-2xl h-full bg-surface shadow-overlay overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold text-text-primary">{caseData.id}</h2>
            <p className="text-text-secondary">{caseData.clientName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-text-secondary hover:text-text-primary hover:bg-background rounded-lg transition-micro"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium transition-micro ${
                activeTab === tab.id
                  ? 'text-primary border-b-2 border-primary bg-primary/5' :'text-text-secondary hover:text-text-primary hover:bg-background'
              }`}
            >
              <Icon name={tab.icon} size={16} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Status and Progress */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-background rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-text-secondary">Status</span>
                    {isEditing ? (
                      <select
                        value={editData.status}
                        onChange={(e) => setEditData({...editData, status: e.target.value})}
                        className="px-3 py-1 border border-border rounded text-sm"
                      >
                        <option value="New Lead">New Lead</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Pending Documents">Pending Documents</option>
                      </select>
                    ) : (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(caseData.status)}`}>
                        {caseData.status}
                      </span>
                    )}
                  </div>
                  {caseData.progress > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-text-secondary">Progress</span>
                        <span className="text-xs text-text-secondary">{caseData.progress}%</span>
                      </div>
                      <div className="w-full bg-border rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-standard" 
                          style={{ width: `${caseData.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-background rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">Risk Score</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskScoreColor(caseData.riskScore)}`}>
                      {caseData.riskScore}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Client Information */}
              <div className="bg-background rounded-lg p-4">
                <h3 className="font-medium text-text-primary mb-4">Client Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-text-secondary">First Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.firstName}
                        onChange={(e) => setEditData({...editData, firstName: e.target.value})}
                        className="w-full px-3 py-2 border border-border rounded-lg"
                      />
                    ) : (
                      <p className="font-medium text-text-primary">{caseData.firstName}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm text-text-secondary">Last Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.lastName}
                        onChange={(e) => setEditData({...editData, lastName: e.target.value})}
                        className="w-full px-3 py-2 border border-border rounded-lg"
                      />
                    ) : (
                      <p className="font-medium text-text-primary">{caseData.lastName}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm text-text-secondary">Phone</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editData.phone}
                        onChange={(e) => setEditData({...editData, phone: e.target.value})}
                        className="w-full px-3 py-2 border border-border rounded-lg"
                      />
                    ) : (
                      <p className="font-medium text-text-primary">{caseData.phone}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm text-text-secondary">Email</label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={editData.email}
                        onChange={(e) => setEditData({...editData, email: e.target.value})}
                        className="w-full px-3 py-2 border border-border rounded-lg"
                      />
                    ) : (
                      <p className="font-medium text-text-primary">{caseData.email}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Case Details */}
              <div className="bg-background rounded-lg p-4">
                <h3 className="font-medium text-text-primary mb-4">Case Details</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-sm text-text-secondary">Case Type</label>
                    <p className="font-medium text-text-primary">{caseData.caseType}</p>
                  </div>
                  <div>
                    <label className="text-sm text-text-secondary">Accident Date</label>
                    <p className="font-medium text-text-primary">{formatDate(caseData.accidentDate)}</p>
                  </div>
                  <div>
                    <label className="text-sm text-text-secondary">Created Date</label>
                    <p className="font-medium text-text-primary">{formatDate(caseData.createdDate)}</p>
                  </div>
                  <div>
                    <label className="text-sm text-text-secondary">Last Activity</label>
                    <p className="font-medium text-text-primary">{formatDate(caseData.lastActivity)}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-text-secondary">Description</label>
                  <p className="text-text-primary mt-1">{caseData.description}</p>
                </div>
              </div>

              {/* Financial Information */}
              <div className="bg-background rounded-lg p-4">
                <h3 className="font-medium text-text-primary mb-4">Financial Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-text-secondary">Requested Amount</label>
                    <p className="font-medium text-text-primary">{formatCurrency(caseData.requestedAmount)}</p>
                  </div>
                  <div>
                    <label className="text-sm text-text-secondary">Funded Amount</label>
                    <p className="font-medium text-text-primary">
                      {caseData.fundingAmount > 0 ? formatCurrency(caseData.fundingAmount) : 'Not funded'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-text-secondary">Estimated Settlement</label>
                    <p className="font-medium text-text-primary">{formatCurrency(caseData.estimatedSettlement)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div>
              <h3 className="text-lg font-medium text-text-primary mb-4">Case Documents</h3>
              <div className="mb-6">
                <FileUpload plaintiffId={caseData.id} onUploadSuccess={handleUploadSuccess} />
              </div>
              <div>
                <h4 className="font-bold mb-2">Uploaded Files:</h4>
                {isLoadingDocs ? (
                  <p>Loading documents...</p>
                ) : (
                  <ul>
                    {documents.map(doc => (
                      <li key={doc.id} className="flex justify-between items-center p-2 bg-background rounded-lg mb-2">
                        <div>
                          <p className="font-medium">{doc.originalName}</p>
                          <p className="text-sm text-text-secondary">Uploaded on: {formatDate(new Date(doc.uploadTimestamp))}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button onClick={() => handleDownload(doc)} className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-micro">
                            <Icon name="Download" size={16} />
                          </button>
                          <button onClick={() => handleDelete(doc.id)} className="p-2 text-error hover:bg-error/10 rounded-lg transition-micro">
                            <Icon name="Trash2" size={16} />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <h3 className="font-medium text-text-primary">Case Timeline</h3>
              <div className="space-y-4">
                {mockTimeline.map((event) => (
                  <div key={event.id} className="flex space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <Icon name="Clock" size={16} className="text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-text-primary">{event.title}</h4>
                        <span className="text-sm text-text-secondary">{formatDate(event.date)}</span>
                      </div>
                      <p className="text-text-secondary mt-1">{event.description}</p>
                      <p className="text-xs text-text-secondary mt-1">by {event.user}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'communications' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-text-primary">Communications</h3>
                <button className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-micro text-sm">
                  <Icon name="Plus" size={16} />
                  <span>New Message</span>
                </button>
              </div>
              
              <div className="space-y-4">
                {mockCommunications.map((comm) => (
                  <div key={comm.id} className="p-4 bg-background rounded-lg border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Icon name={comm.type === 'email' ? 'Mail' : 'Phone'} size={16} className="text-primary" />
                        <span className="font-medium text-text-primary">{comm.subject}</span>
                      </div>
                      <span className="text-sm text-text-secondary">{formatDate(comm.date)}</span>
                    </div>
                    <p className="text-text-secondary mb-2">{comm.content}</p>
                    <div className="text-xs text-text-secondary">
                      From: {comm.from} • To: {comm.to}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-6 border-t border-border">
          <div className="flex items-center space-x-2">
            {!isEditing ? (
              <>
                <button 
                  onClick={handleEditClick}
                  className="flex items-center space-x-2 px-4 py-2 border border-border rounded-lg text-text-secondary hover:text-text-primary hover:bg-background transition-micro"
                >
                  <Icon name="Edit" size={16} />
                  <span>Edit Case</span>
                </button>
                <button 
                  onClick={handleExportCase}
                  className="flex items-center space-x-2 px-4 py-2 border border-border rounded-lg text-text-secondary hover:text-text-primary hover:bg-background transition-micro"
                >
                  <Icon name="Download" size={16} />
                  <span>Export</span>
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={handleSaveEdit}
                  disabled={isSaving}
                  className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-micro"
                >
                  <Icon name="Save" size={16} />
                  <span>{isSaving ? 'Saving...' : 'Save'}</span>
                </button>
                <button 
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  className="flex items-center space-x-2 px-4 py-2 border border-border rounded-lg text-text-secondary hover:text-text-primary hover:bg-background disabled:opacity-50 transition-micro"
                >
                  <Icon name="X" size={16} />
                  <span>Cancel</span>
                </button>
              </>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {caseData.status === 'Under Review' && !isEditing && (
              <>
                <button 
                  onClick={() => handleStatusChange('Rejected')}
                  className="px-4 py-2 border border-error text-error rounded-lg hover:bg-error/10 transition-micro"
                >
                  Reject
                </button>
                <button 
                  onClick={() => handleStatusChange('Approved')}
                  className="px-4 py-2 bg-success text-white rounded-lg hover:bg-success/90 transition-micro"
                >
                  Approve
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseDetailPanel;