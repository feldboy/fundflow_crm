import React, { useState, useRef } from 'react';
import Icon from 'components/AppIcon';

const DocumentUploadTab = ({ documents, onChange }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const fileInputRef = useRef(null);

  const documentTypes = [
    { id: 'medical', label: 'Medical Records', icon: 'FileText', required: true },
    { id: 'police', label: 'Police Report', icon: 'Shield', required: true },
    { id: 'insurance', label: 'Insurance Documents', icon: 'FileCheck', required: false },
    { id: 'photos', label: 'Photos/Evidence', icon: 'Camera', required: false },
    { id: 'witness', label: 'Witness Statements', icon: 'Users', required: false },
    { id: 'employment', label: 'Employment Records', icon: 'Briefcase', required: false },
    { id: 'other', label: 'Other Documents', icon: 'File', required: false }
  ];

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = async (files) => {
    const fileArray = Array.from(files);
    
    for (const file of fileArray) {
      const fileId = Date.now() + Math.random();
      
      // Simulate file upload with progress
      setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));
      
      const newDocument = {
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type,
        category: 'other',
        uploadDate: new Date().toISOString(),
        status: 'uploading'
      };
      
      onChange([...documents, newDocument]);
      
      // Simulate upload progress
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setUploadProgress(prev => ({ ...prev, [fileId]: progress }));
      }
      
      // Update document status to completed
      onChange(prev => prev.map(doc => 
        doc.id === fileId 
          ? { ...doc, status: 'completed' }
          : doc
      ));
      
      setUploadProgress(prev => {
        const { [fileId]: removed, ...rest } = prev;
        return rest;
      });
    }
  };

  const removeDocument = (documentId) => {
    onChange(documents.filter(doc => doc.id !== documentId));
  };

  const updateDocumentCategory = (documentId, category) => {
    onChange(documents.map(doc => 
      doc.id === documentId 
        ? { ...doc, category }
        : doc
    ));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getDocumentsByCategory = (category) => {
    return documents.filter(doc => doc.category === category);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-4">Document Upload</h3>
        <p className="text-text-secondary mb-6">
          Upload all relevant documents to support your case. Required documents are marked with an asterisk (*).
        </p>
      </div>

      {/* Upload Zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-micro ${
          dragActive 
            ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Icon name="Upload" size={32} className="text-primary" />
          </div>
          <div>
            <h4 className="text-lg font-medium text-text-primary mb-2">
              Drop files here or click to upload
            </h4>
            <p className="text-text-secondary mb-4">
              Supports PDF, DOC, DOCX, JPG, PNG files up to 10MB each
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-2 bg-primary text-white hover:bg-primary/90 rounded-lg transition-micro"
            >
              Choose Files
            </button>
          </div>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          onChange={handleFileInput}
          className="hidden"
        />
      </div>

      {/* Document Categories */}
      <div className="space-y-6">
        {documentTypes.map((docType) => {
          const categoryDocs = getDocumentsByCategory(docType.id);
          
          return (
            <div key={docType.id} className="border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Icon name={docType.icon} size={20} className="text-primary" />
                  <h4 className="font-medium text-text-primary">
                    {docType.label}
                    {docType.required && <span className="text-error ml-1">*</span>}
                  </h4>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-text-secondary">
                    {categoryDocs.length} file{categoryDocs.length !== 1 ? 's' : ''}
                  </span>
                  {docType.required && categoryDocs.length === 0 && (
                    <Icon name="AlertCircle" size={16} className="text-warning" />
                  )}
                </div>
              </div>

              {categoryDocs.length > 0 ? (
                <div className="space-y-2">
                  {categoryDocs.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 bg-background rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Icon name="File" size={16} className="text-text-secondary" />
                        <div>
                          <p className="text-sm font-medium text-text-primary">{doc.name}</p>
                          <p className="text-xs text-text-secondary">
                            {formatFileSize(doc.size)} • {new Date(doc.uploadDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {doc.status === 'uploading' && uploadProgress[doc.id] !== undefined && (
                          <div className="flex items-center space-x-2">
                            <div className="w-20 h-2 bg-border rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary transition-standard"
                                style={{ width: `${uploadProgress[doc.id]}%` }}
                              />
                            </div>
                            <span className="text-xs text-text-secondary">
                              {uploadProgress[doc.id]}%
                            </span>
                          </div>
                        )}
                        
                        {doc.status === 'completed' && (
                          <>
                            <select
                              value={doc.category}
                              onChange={(e) => updateDocumentCategory(doc.id, e.target.value)}
                              className="text-xs border border-border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
                            >
                              {documentTypes.map(type => (
                                <option key={type.id} value={type.id}>{type.label}</option>
                              ))}
                            </select>
                            
                            <button
                              onClick={() => removeDocument(doc.id)}
                              className="p-1 text-text-secondary hover:text-error transition-micro"
                            >
                              <Icon name="Trash2" size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-text-secondary">
                  <Icon name={docType.icon} size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No {docType.label.toLowerCase()} uploaded</p>
                  {docType.required && (
                    <p className="text-xs text-warning mt-1">This document type is required</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Upload Summary */}
      {documents.length > 0 && (
        <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Icon name="FileCheck" size={20} className="text-accent flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-text-primary mb-1">Upload Summary</h4>
              <p className="text-sm text-text-secondary mb-2">
                {documents.length} document{documents.length !== 1 ? 's' : ''} uploaded
              </p>
              <div className="text-xs text-text-secondary">
                <p>• All documents are encrypted and stored securely</p>
                <p>• Documents will be reviewed within 24 hours</p>
                <p>• You can add more documents after submission</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentUploadTab;