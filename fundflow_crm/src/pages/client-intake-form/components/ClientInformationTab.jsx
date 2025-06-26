import React, { useState } from 'react';
import Icon from 'components/AppIcon';

const ClientInformationTab = ({ data, errors, onChange }) => {
  const [addressLookup, setAddressLookup] = useState(false);

  const handleInputChange = (field, value) => {
    onChange({ [field]: value });
    
    // Auto-populate address fields based on zip code
    if (field === 'zipCode' && value.length === 5) {
      // Simulate address lookup
      const mockAddressData = {
        city: 'New York',
        state: 'NY'
      };
      onChange({ 
        city: mockAddressData.city,
        state: mockAddressData.state
      });
    }
  };

  const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-4">Personal Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              First Name *
            </label>
            <input
              type="text"
              value={data.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-micro ${
                errors.firstName ? 'border-error' : 'border-border'
              }`}
              placeholder="Enter first name"
            />
            {errors.firstName && (
              <p className="text-error text-sm mt-1">{errors.firstName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Last Name *
            </label>
            <input
              type="text"
              value={data.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-micro ${
                errors.lastName ? 'border-error' : 'border-border'
              }`}
              placeholder="Enter last name"
            />
            {errors.lastName && (
              <p className="text-error text-sm mt-1">{errors.lastName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Email Address *
            </label>
            <input
              type="email"
              value={data.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-micro ${
                errors.email ? 'border-error' : 'border-border'
              }`}
              placeholder="Enter email address"
            />
            {errors.email && (
              <p className="text-error text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              value={data.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-micro ${
                errors.phone ? 'border-error' : 'border-border'
              }`}
              placeholder="(555) 123-4567"
            />
            {errors.phone && (
              <p className="text-error text-sm mt-1">{errors.phone}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Date of Birth
            </label>
            <input
              type="date"
              value={data.dateOfBirth}
              onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-micro"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Social Security Number
            </label>
            <input
              type="password"
              value={data.ssn}
              onChange={(e) => handleInputChange('ssn', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-micro"
              placeholder="XXX-XX-XXXX"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-4">Address Information</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Street Address
            </label>
            <input
              type="text"
              value={data.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-micro"
              placeholder="Enter street address"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                City
              </label>
              <input
                type="text"
                value={data.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-micro"
                placeholder="Enter city"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                State
              </label>
              <select
                value={data.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-micro"
              >
                <option value="">Select state</option>
                {states.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                ZIP Code
              </label>
              <input
                type="text"
                value={data.zipCode}
                onChange={(e) => handleInputChange('zipCode', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-micro"
                placeholder="12345"
                maxLength={5}
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-4">Emergency Contact</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Emergency Contact Name
            </label>
            <input
              type="text"
              value={data.emergencyContact}
              onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-micro"
              placeholder="Enter contact name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Emergency Contact Phone
            </label>
            <input
              type="tel"
              value={data.emergencyPhone}
              onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-micro"
              placeholder="(555) 123-4567"
            />
          </div>
        </div>
      </div>

      <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Icon name="Shield" size={20} className="text-accent flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-text-primary mb-1">Privacy & Security</h4>
            <p className="text-sm text-text-secondary">
              All personal information is encrypted and stored securely. We comply with HIPAA and other privacy regulations to protect your data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientInformationTab;