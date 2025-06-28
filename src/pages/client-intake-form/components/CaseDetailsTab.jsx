import React, { useState } from 'react';
import Icon from 'components/AppIcon';

const CaseDetailsTab = ({ data, errors, onChange }) => {
  const [showAdditionalFields, setShowAdditionalFields] = useState(false);

  const handleInputChange = (field, value) => {
    onChange({ [field]: value });
    
    // Show additional fields based on case type
    if (field === 'caseType' && value) {
      setShowAdditionalFields(true);
    }
  };

  const handleInjuryChange = (injury, checked) => {
    const updatedInjuries = checked
      ? [...data.injuries, injury]
      : data.injuries.filter(i => i !== injury);
    onChange({ injuries: updatedInjuries });
  };

  const caseTypes = [
    'Motor Vehicle Accident',
    'Slip and Fall',
    'Medical Malpractice',
    'Product Liability',
    'Workplace Injury',
    'Wrongful Death',
    'Personal Injury',
    'Other'
  ];

  const injuryTypes = [
    'Head/Brain Injury',
    'Spinal Cord Injury',
    'Broken Bones',
    'Soft Tissue Injury',
    'Burns',
    'Internal Injuries',
    'Psychological Trauma',
    'Other'
  ];

  const caseStatuses = [
    'Investigation',
    'Pre-litigation',
    'Litigation Filed',
    'Discovery',
    'Mediation',
    'Trial Preparation',
    'Settlement Negotiations'
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-4">Case Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Case Type *
            </label>
            <select
              value={data.caseType}
              onChange={(e) => handleInputChange('caseType', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-micro ${
                errors.caseType ? 'border-error' : 'border-border'
              }`}
            >
              <option value="">Select case type</option>
              {caseTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {errors.caseType && (
              <p className="text-error text-sm mt-1">{errors.caseType}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Incident Date *
            </label>
            <input
              type="date"
              value={data.incidentDate}
              onChange={(e) => handleInputChange('incidentDate', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-micro ${
                errors.incidentDate ? 'border-error' : 'border-border'
              }`}
            />
            {errors.incidentDate && (
              <p className="text-error text-sm mt-1">{errors.incidentDate}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Estimated Settlement Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-text-secondary">$</span>
              <input
                type="number"
                value={data.estimatedSettlement}
                onChange={(e) => handleInputChange('estimatedSettlement', e.target.value)}
                className="w-full pl-8 pr-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-micro"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Current Case Status
            </label>
            <select
              value={data.currentStatus}
              onChange={(e) => handleInputChange('currentStatus', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-micro"
            >
              <option value="">Select status</option>
              {caseStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Court Location
            </label>
            <input
              type="text"
              value={data.courtLocation}
              onChange={(e) => handleInputChange('courtLocation', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-micro"
              placeholder="Enter court location"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Case Number
            </label>
            <input
              type="text"
              value={data.caseNumber}
              onChange={(e) => handleInputChange('caseNumber', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-micro"
              placeholder="Enter case number"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Case Description *
        </label>
        <textarea
          value={data.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={4}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-micro ${
            errors.description ? 'border-error' : 'border-border'
          }`}
          placeholder="Provide detailed description of the incident and circumstances..."
        />
        {errors.description && (
          <p className="text-error text-sm mt-1">{errors.description}</p>
        )}
      </div>

      {showAdditionalFields && (
        <>
          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-4">Injury Details</h3>
            
            <div>
              <label className="block text-sm font-medium text-text-primary mb-3">
                Type of Injuries (Select all that apply)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {injuryTypes.map(injury => (
                  <label key={injury} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={data.injuries.includes(injury)}
                      onChange={(e) => handleInjuryChange(injury, e.target.checked)}
                      className="w-4 h-4 text-primary border-border rounded focus:ring-primary focus:ring-2"
                    />
                    <span className="text-sm text-text-primary">{injury}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-text-primary mb-2">
                Medical Treatment Status
              </label>
              <select
                value={data.medicalTreatment}
                onChange={(e) => handleInputChange('medicalTreatment', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-micro"
              >
                <option value="">Select treatment status</option>
                <option value="ongoing">Ongoing Treatment</option>
                <option value="completed">Treatment Completed</option>
                <option value="future">Future Treatment Required</option>
                <option value="none">No Treatment Required</option>
              </select>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-text-primary mb-2">
                Work Status
              </label>
              <select
                value={data.workStatus}
                onChange={(e) => handleInputChange('workStatus', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-micro"
              >
                <option value="">Select work status</option>
                <option value="unable">Unable to Work</option>
                <option value="limited">Limited Work Capacity</option>
                <option value="returned">Returned to Work</option>
                <option value="unemployed">Unemployed Before Incident</option>
              </select>
            </div>
          </div>
        </>
      )}

      <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Icon name="AlertTriangle" size={20} className="text-warning flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-text-primary mb-1">Important Notice</h4>
            <p className="text-sm text-text-secondary">
              Accurate case information is crucial for proper risk assessment and funding decisions. Please ensure all details are complete and accurate.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseDetailsTab;