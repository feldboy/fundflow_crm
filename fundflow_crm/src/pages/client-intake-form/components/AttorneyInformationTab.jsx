import React, { useState } from 'react';
import Icon from 'components/AppIcon';

const AttorneyInformationTab = ({ data, errors, onChange }) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  const handleInputChange = (field, value) => {
    onChange({ [field]: value });
    
    // Reset verification when attorney info changes
    if (['attorneyName', 'barNumber', 'email'].includes(field)) {
      setVerificationResult(null);
      onChange({ verified: false });
    }
  };

  const handleVerifyAttorney = async () => {
    if (!data.attorneyName || !data.barNumber) {
      return;
    }

    setIsVerifying(true);
    
    // Simulate attorney verification API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockVerification = {
      verified: Math.random() > 0.2, // 80% success rate
      details: {
        name: data.attorneyName,
        barNumber: data.barNumber,
        status: 'Active',
        admissionDate: '2015-03-15',
        specialties: ['Personal Injury', 'Civil Litigation'],
        disciplinaryActions: 'None'
      }
    };
    
    setVerificationResult(mockVerification);
    onChange({ verified: mockVerification.verified });
    setIsVerifying(false);
  };

  const mockAttorneys = [
    { name: 'John Smith', firm: 'Smith & Associates', email: 'john@smithlaw.com', phone: '(555) 123-4567' },
    { name: 'Sarah Johnson', firm: 'Johnson Legal Group', email: 'sarah@johnsonlegal.com', phone: '(555) 234-5678' },
    { name: 'Michael Brown', firm: 'Brown Law Firm', email: 'michael@brownlaw.com', phone: '(555) 345-6789' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-4">Attorney Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Law Firm Name *
            </label>
            <input
              type="text"
              value={data.firmName}
              onChange={(e) => handleInputChange('firmName', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-micro ${
                errors.firmName ? 'border-error' : 'border-border'
              }`}
              placeholder="Enter law firm name"
            />
            {errors.firmName && (
              <p className="text-error text-sm mt-1">{errors.firmName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Attorney Name *
            </label>
            <input
              type="text"
              value={data.attorneyName}
              onChange={(e) => handleInputChange('attorneyName', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-micro ${
                errors.attorneyName ? 'border-error' : 'border-border'
              }`}
              placeholder="Enter attorney name"
            />
            {errors.attorneyName && (
              <p className="text-error text-sm mt-1">{errors.attorneyName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Attorney Email *
            </label>
            <input
              type="email"
              value={data.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-micro ${
                errors.email ? 'border-error' : 'border-border'
              }`}
              placeholder="Enter attorney email"
            />
            {errors.email && (
              <p className="text-error text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={data.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-micro"
              placeholder="(555) 123-4567"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Bar Number
            </label>
            <input
              type="text"
              value={data.barNumber}
              onChange={(e) => handleInputChange('barNumber', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-micro"
              placeholder="Enter bar number"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleVerifyAttorney}
              disabled={isVerifying || !data.attorneyName || !data.barNumber}
              className="w-full px-4 py-2 bg-accent text-white hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-micro flex items-center justify-center space-x-2"
            >
              {isVerifying ? (
                <>
                  <Icon name="Loader2" size={16} className="animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <Icon name="Shield" size={16} />
                  <span>Verify Attorney</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-text-primary mb-2">
            Firm Address
          </label>
          <textarea
            value={data.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-micro"
            placeholder="Enter complete firm address"
          />
        </div>
      </div>

      {/* Verification Result */}
      {verificationResult && (
        <div className={`border rounded-lg p-4 ${
          verificationResult.verified 
            ? 'bg-success/10 border-success/20' :'bg-error/10 border-error/20'
        }`}>
          <div className="flex items-start space-x-3">
            <Icon 
              name={verificationResult.verified ? "CheckCircle" : "XCircle"} 
              size={20} 
              className={`flex-shrink-0 mt-0.5 ${
                verificationResult.verified ? 'text-success' : 'text-error'
              }`} 
            />
            <div className="flex-1">
              <h4 className={`font-medium mb-2 ${
                verificationResult.verified ? 'text-success' : 'text-error'
              }`}>
                {verificationResult.verified ? 'Attorney Verified' : 'Verification Failed'}
              </h4>
              
              {verificationResult.verified && (
                <div className="space-y-2 text-sm text-text-secondary">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium">Status:</span> {verificationResult.details.status}
                    </div>
                    <div>
                      <span className="font-medium">Admission Date:</span> {verificationResult.details.admissionDate}
                    </div>
                    <div>
                      <span className="font-medium">Specialties:</span> {verificationResult.details.specialties.join(', ')}
                    </div>
                    <div>
                      <span className="font-medium">Disciplinary Actions:</span> {verificationResult.details.disciplinaryActions}
                    </div>
                  </div>
                </div>
              )}
              
              {!verificationResult.verified && (
                <p className="text-sm text-text-secondary">
                  Unable to verify attorney information. Please check the details and try again.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Attorney Lookup */}
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-4">Quick Attorney Lookup</h3>
        <p className="text-sm text-text-secondary mb-4">
          Select from our verified attorney database or add new attorney information above.
        </p>
        
        <div className="space-y-3">
          {mockAttorneys.map((attorney, index) => (
            <div key={index} className="border border-border rounded-lg p-4 hover:bg-background transition-micro">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div>
                      <h4 className="font-medium text-text-primary">{attorney.name}</h4>
                      <p className="text-sm text-text-secondary">{attorney.firm}</p>
                    </div>
                    <Icon name="Shield" size={16} className="text-success" />
                  </div>
                  <div className="mt-2 flex items-center space-x-4 text-sm text-text-secondary">
                    <span>{attorney.email}</span>
                    <span>{attorney.phone}</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    onChange({
                      firmName: attorney.firm,
                      attorneyName: attorney.name,
                      email: attorney.email,
                      phone: attorney.phone,
                      verified: true
                    });
                  }}
                  className="px-4 py-2 text-primary hover:bg-primary/10 rounded-lg transition-micro"
                >
                  Select
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Icon name="Info" size={20} className="text-accent flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-text-primary mb-1">Attorney Verification</h4>
            <p className="text-sm text-text-secondary">
              We verify attorney credentials through state bar associations to ensure legitimacy and active status. Verified attorneys receive priority processing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttorneyInformationTab;