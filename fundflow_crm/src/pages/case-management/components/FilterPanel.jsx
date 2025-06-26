import React, { useState } from 'react';
import Icon from 'components/AppIcon';

const FilterPanel = ({ filters, setFilters, activeFiltersCount }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'Under Review', label: 'Under Review' },
    { value: 'Approved', label: 'Approved' },
    { value: 'Funded', label: 'Funded' },
    { value: 'Pending Documents', label: 'Pending Documents' },
    { value: 'Rejected', label: 'Rejected' }
  ];

  const caseTypeOptions = [
    { value: '', label: 'All Case Types' },
    { value: 'Personal Injury', label: 'Personal Injury' },
    { value: 'Workers Compensation', label: 'Workers Compensation' },
    { value: 'Medical Malpractice', label: 'Medical Malpractice' },
    { value: 'Product Liability', label: 'Product Liability' },
    { value: 'Slip and Fall', label: 'Slip and Fall' }
  ];

  const fundingRangeOptions = [
    { value: '', label: 'All Amounts' },
    { value: '0-5000', label: '$0 - $5,000' },
    { value: '5000-15000', label: '$5,000 - $15,000' },
    { value: '15000-30000', label: '$15,000 - $30,000' },
    { value: '30000-999999', label: '$30,000+' }
  ];

  const attorneyOptions = [
    { value: '', label: 'All Attorneys' },
    { value: 'Miller & Associates', label: 'Miller & Associates' },
    { value: 'Thompson Legal Group', label: 'Thompson Legal Group' },
    { value: 'Davis & Partners', label: 'Davis & Partners' },
    { value: 'Roberts Law Firm', label: 'Roberts Law Firm' },
    { value: 'Anderson Legal', label: 'Anderson Legal' },
    { value: 'Johnson & Associates', label: 'Johnson & Associates' }
  ];

  const dateRangeOptions = [
    { value: '', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' }
  ];

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearAllFilters = () => {
    setFilters({
      status: '',
      caseType: '',
      fundingRange: '',
      dateRange: '',
      attorney: ''
    });
  };

  const getActiveFilterChips = () => {
    const chips = [];
    
    if (filters.status) {
      chips.push({ key: 'status', label: `Status: ${filters.status}` });
    }
    if (filters.caseType) {
      chips.push({ key: 'caseType', label: `Type: ${filters.caseType}` });
    }
    if (filters.fundingRange) {
      const range = fundingRangeOptions.find(opt => opt.value === filters.fundingRange);
      chips.push({ key: 'fundingRange', label: `Amount: ${range?.label}` });
    }
    if (filters.attorney) {
      chips.push({ key: 'attorney', label: `Attorney: ${filters.attorney}` });
    }
    if (filters.dateRange) {
      const range = dateRangeOptions.find(opt => opt.value === filters.dateRange);
      chips.push({ key: 'dateRange', label: `Date: ${range?.label}` });
    }
    
    return chips;
  };

  const activeChips = getActiveFilterChips();

  return (
    <div className="space-y-4">
      {/* Quick Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <select
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className="px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          {statusOptions.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>

        <select
          value={filters.caseType}
          onChange={(e) => handleFilterChange('caseType', e.target.value)}
          className="px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          {caseTypeOptions.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>

        <select
          value={filters.fundingRange}
          onChange={(e) => handleFilterChange('fundingRange', e.target.value)}
          className="px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          {fundingRangeOptions.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center space-x-2 px-3 py-2 border border-border rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-background transition-micro"
        >
          <Icon name="Filter" size={16} />
          <span>More Filters</span>
          <Icon name={isExpanded ? "ChevronUp" : "ChevronDown"} size={16} />
        </button>

        {activeFiltersCount > 0 && (
          <button
            onClick={clearAllFilters}
            className="flex items-center space-x-2 px-3 py-2 text-sm text-error hover:bg-error/10 rounded-lg transition-micro"
          >
            <Icon name="X" size={16} />
            <span>Clear All</span>
          </button>
        )}
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-background rounded-lg border border-border">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Attorney</label>
            <select
              value={filters.attorney}
              onChange={(e) => handleFilterChange('attorney', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              {attorneyOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Date Range</label>
            <select
              value={filters.dateRange}
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              {dateRangeOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Active Filter Chips */}
      {activeChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-text-secondary">Active filters:</span>
          {activeChips.map((chip) => (
            <div
              key={chip.key}
              className="flex items-center space-x-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
            >
              <span>{chip.label}</span>
              <button
                onClick={() => handleFilterChange(chip.key, '')}
                className="hover:bg-primary/20 rounded-full p-0.5 transition-micro"
              >
                <Icon name="X" size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FilterPanel;