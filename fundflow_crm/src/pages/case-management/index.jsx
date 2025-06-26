import React, { useState, useMemo } from 'react';
import Icon from 'components/AppIcon';
import Breadcrumb from 'components/ui/Breadcrumb';
import CaseTable from './components/CaseTable';
import CaseCards from './components/CaseCards';
import FilterPanel from './components/FilterPanel';
import CaseDetailPanel from './components/CaseDetailPanel';
import BulkActionsModal from './components/BulkActionsModal';

const CaseManagement = () => {
  const [viewMode, setViewMode] = useState('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCases, setSelectedCases] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'lastActivity', direction: 'desc' });
  const [selectedCase, setSelectedCase] = useState(null);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    caseType: '',
    fundingRange: '',
    dateRange: '',
    attorney: ''
  });

  // Mock data for cases
  const mockCases = [
    {
      id: 'CS-2024-001',
      clientName: 'Sarah Johnson',
      attorney: 'Miller & Associates',
      caseType: 'Personal Injury',
      status: 'Under Review',
      fundingAmount: 15000,
      requestedAmount: 20000,
      lastActivity: new Date('2024-01-15'),
      createdDate: new Date('2024-01-10'),
      phone: '(555) 123-4567',
      email: 'sarah.johnson@email.com',
      accidentDate: new Date('2023-12-01'),
      description: `Motor vehicle accident case involving rear-end collision on Highway 101. Client sustained injuries to neck and back requiring ongoing physical therapy. Case has strong liability with clear fault determination.`,
      documents: ['Medical Records', 'Police Report', 'Insurance Claim'],
      riskScore: 85,
      estimatedSettlement: 75000,
      progress: 65
    },
    {
      id: 'CS-2024-002',
      clientName: 'Michael Rodriguez',
      attorney: 'Thompson Legal Group',
      caseType: 'Workers Compensation',
      status: 'Approved',
      fundingAmount: 8500,
      requestedAmount: 10000,
      lastActivity: new Date('2024-01-14'),
      createdDate: new Date('2024-01-08'),
      phone: '(555) 987-6543',
      email: 'michael.rodriguez@email.com',
      accidentDate: new Date('2023-11-15'),
      description: `Workplace injury case involving fall from scaffolding at construction site. Client suffered broken arm and shoulder injuries. Clear workers compensation claim with documented safety violations.`,
      documents: ['Medical Records', 'Incident Report', 'Witness Statements'],
      riskScore: 92,
      estimatedSettlement: 45000,
      progress: 80
    },
    {
      id: 'CS-2024-003',
      clientName: 'Emily Chen',
      attorney: 'Davis & Partners',
      caseType: 'Medical Malpractice',
      status: 'Pending Documents',
      fundingAmount: 0,
      requestedAmount: 25000,
      lastActivity: new Date('2024-01-13'),
      createdDate: new Date('2024-01-05'),
      phone: '(555) 456-7890',
      email: 'emily.chen@email.com',
      accidentDate: new Date('2023-10-20'),
      description: `Medical malpractice case involving misdiagnosis leading to delayed treatment. Client experienced complications due to delayed proper diagnosis. Case requires additional medical expert testimony.`,
      documents: ['Medical Records', 'Expert Opinion'],
      riskScore: 68,
      estimatedSettlement: 120000,
      progress: 35
    },
    {
      id: 'CS-2024-004',
      clientName: 'David Wilson',
      attorney: 'Roberts Law Firm',
      caseType: 'Product Liability',
      status: 'Rejected',
      fundingAmount: 0,
      requestedAmount: 30000,
      lastActivity: new Date('2024-01-12'),
      createdDate: new Date('2024-01-03'),
      phone: '(555) 321-0987',
      email: 'david.wilson@email.com',
      accidentDate: new Date('2023-09-10'),
      description: `Product liability case involving defective automotive part leading to accident. Case rejected due to insufficient evidence of product defect and unclear liability chain.`,
      documents: ['Incident Report', 'Product Analysis'],
      riskScore: 45,
      estimatedSettlement: 0,
      progress: 0
    },
    {
      id: 'CS-2024-005',
      clientName: 'Lisa Thompson',
      attorney: 'Anderson Legal',
      caseType: 'Slip and Fall',
      status: 'Funded',
      fundingAmount: 12000,
      requestedAmount: 12000,
      lastActivity: new Date('2024-01-11'),
      createdDate: new Date('2023-12-28'),
      phone: '(555) 654-3210',
      email: 'lisa.thompson@email.com',
      accidentDate: new Date('2023-11-05'),
      description: `Slip and fall case at retail store due to wet floor without proper signage. Client sustained hip fracture requiring surgery. Strong liability case with clear negligence.`,
      documents: ['Medical Records', 'Incident Report', 'Security Footage', 'Witness Statements'],
      riskScore: 88,
      estimatedSettlement: 65000,
      progress: 100
    },
    {
      id: 'CS-2024-006',
      clientName: 'Robert Martinez',
      attorney: 'Johnson & Associates',
      caseType: 'Personal Injury',
      status: 'Under Review',
      fundingAmount: 0,
      requestedAmount: 18000,
      lastActivity: new Date('2024-01-10'),
      createdDate: new Date('2024-01-02'),
      phone: '(555) 789-0123',
      email: 'robert.martinez@email.com',
      accidentDate: new Date('2023-12-15'),
      description: `Motorcycle accident case involving intersection collision. Client sustained multiple injuries including broken leg and road rash. Case under review for liability determination.`,
      documents: ['Medical Records', 'Police Report'],
      riskScore: 72,
      estimatedSettlement: 85000,
      progress: 25
    }
  ];

  // Filter and sort cases
  const filteredAndSortedCases = useMemo(() => {
    let filtered = mockCases.filter(caseItem => {
      const matchesSearch = searchTerm === '' || 
        caseItem.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        caseItem.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        caseItem.attorney.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = filters.status === '' || caseItem.status === filters.status;
      const matchesCaseType = filters.caseType === '' || caseItem.caseType === filters.caseType;
      const matchesAttorney = filters.attorney === '' || caseItem.attorney === filters.attorney;

      let matchesFundingRange = true;
      if (filters.fundingRange) {
        const [min, max] = filters.fundingRange.split('-').map(Number);
        matchesFundingRange = caseItem.fundingAmount >= min && caseItem.fundingAmount <= max;
      }

      return matchesSearch && matchesStatus && matchesCaseType && matchesAttorney && matchesFundingRange;
    });

    // Sort cases
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (aValue instanceof Date) {
          aValue = aValue.getTime();
          bValue = bValue.getTime();
        }

        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [mockCases, searchTerm, filters, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSelectCase = (caseId) => {
    setSelectedCases(prev => 
      prev.includes(caseId) 
        ? prev.filter(id => id !== caseId)
        : [...prev, caseId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCases.length === filteredAndSortedCases.length) {
      setSelectedCases([]);
    } else {
      setSelectedCases(filteredAndSortedCases.map(c => c.id));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return 'text-success bg-success/10';
      case 'Funded': return 'text-success bg-success/10';
      case 'Under Review': return 'text-warning bg-warning/10';
      case 'Pending Documents': return 'text-accent bg-accent/10';
      case 'Rejected': return 'text-error bg-error/10';
      default: return 'text-text-secondary bg-background';
    }
  };

  const activeFiltersCount = Object.values(filters).filter(value => value !== '').length;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Breadcrumb />
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">Case Management</h1>
            <p className="text-text-secondary">
              Manage and track all client cases from intake to funding completion
            </p>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 lg:mt-0">
            <button
              onClick={() => setShowBulkModal(true)}
              disabled={selectedCases.length === 0}
              className="flex items-center space-x-2 px-4 py-2 border border-border rounded-lg text-text-secondary hover:text-text-primary hover:bg-background transition-micro disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Icon name="Settings" size={16} />
              <span>Bulk Actions ({selectedCases.length})</span>
            </button>
            
            <button className="flex items-center space-x-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-micro font-medium">
              <Icon name="Plus" size={16} />
              <span>New Case</span>
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-surface border border-border rounded-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 mb-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Icon name="Search" size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" />
                <input
                  type="text"
                  placeholder="Search cases, clients, or attorneys..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-text-secondary">
                <span>View:</span>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded-lg transition-micro ${
                    viewMode === 'table' ? 'bg-primary text-white' : 'hover:bg-background'
                  }`}
                >
                  <Icon name="Table" size={16} />
                </button>
                <button
                  onClick={() => setViewMode('cards')}
                  className={`p-2 rounded-lg transition-micro ${
                    viewMode === 'cards' ? 'bg-primary text-white' : 'hover:bg-background'
                  }`}
                >
                  <Icon name="Grid3X3" size={16} />
                </button>
              </div>
            </div>
          </div>

          <FilterPanel 
            filters={filters}
            setFilters={setFilters}
            activeFiltersCount={activeFiltersCount}
          />
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-text-secondary">
            Showing {filteredAndSortedCases.length} of {mockCases.length} cases
            {activeFiltersCount > 0 && (
              <span className="ml-2 px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} active
              </span>
            )}
          </div>
          
          {selectedCases.length > 0 && (
            <div className="text-sm text-text-secondary">
              {selectedCases.length} case{selectedCases.length > 1 ? 's' : ''} selected
            </div>
          )}
        </div>

        {/* Cases Display */}
        {viewMode === 'table' ? (
          <CaseTable
            cases={filteredAndSortedCases}
            selectedCases={selectedCases}
            sortConfig={sortConfig}
            onSort={handleSort}
            onSelectCase={handleSelectCase}
            onSelectAll={handleSelectAll}
            onViewCase={setSelectedCase}
            getStatusColor={getStatusColor}
          />
        ) : (
          <CaseCards
            cases={filteredAndSortedCases}
            selectedCases={selectedCases}
            onSelectCase={handleSelectCase}
            onViewCase={setSelectedCase}
            getStatusColor={getStatusColor}
          />
        )}

        {/* Empty State */}
        {filteredAndSortedCases.length === 0 && (
          <div className="bg-surface border border-border rounded-lg p-12 text-center">
            <div className="w-16 h-16 bg-text-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="Search" size={32} className="text-text-secondary" />
            </div>
            <h3 className="text-lg font-medium text-text-primary mb-2">No cases found</h3>
            <p className="text-text-secondary mb-6">
              {searchTerm || activeFiltersCount > 0 
                ? 'Try adjusting your search or filters to find what you\'re looking for.'
                : 'Get started by creating your first case.'
              }
            </p>
            {(searchTerm || activeFiltersCount > 0) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilters({
                    status: '',
                    caseType: '',
                    fundingRange: '',
                    dateRange: '',
                    attorney: ''
                  });
                }}
                className="px-4 py-2 text-primary hover:bg-primary/10 rounded-lg transition-micro"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Case Detail Panel */}
      {selectedCase && (
        <CaseDetailPanel
          case={selectedCase}
          onClose={() => setSelectedCase(null)}
          getStatusColor={getStatusColor}
        />
      )}

      {/* Bulk Actions Modal */}
      {showBulkModal && (
        <BulkActionsModal
          selectedCases={selectedCases}
          onClose={() => setShowBulkModal(false)}
          onComplete={() => {
            setSelectedCases([]);
            setShowBulkModal(false);
          }}
        />
      )}
    </div>
  );
};

export default CaseManagement;