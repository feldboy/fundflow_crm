import React, { useState, useMemo, useEffect } from 'react';
import Icon from 'components/AppIcon';
import Breadcrumb from 'components/ui/Breadcrumb';
import CaseTable from './components/CaseTable';
import CaseCards from './components/CaseCards';
import FilterPanel from './components/FilterPanel';
import CaseDetailPanel from './components/CaseDetailPanel';
import BulkActionsModal from './components/BulkActionsModal';
import { plaintiffService } from '../../services';
import { useApi } from '../../hooks/useApi';

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

  // Fetch real data from API
  const { 
    data: plaintiffsData, 
    loading, 
    error, 
    execute: fetchPlaintiffs 
  } = useApi(plaintiffService.getAll);

  // Load plaintiffs data on component mount
  useEffect(() => {
    fetchPlaintiffs();
  }, [fetchPlaintiffs]);

  // Transform API data to match the expected case format
  const transformPlaintiffToCase = (plaintiff) => ({
    id: plaintiff._id || plaintiff.id,
    clientName: `${plaintiff.firstName} ${plaintiff.lastName}`,
    attorney: plaintiff.lawFirmName || 'Unknown Law Firm',
    caseType: plaintiff.caseType || 'General',
    status: plaintiff.workflowStage || 'INITIAL_CONTACT',
    fundingAmount: plaintiff.fundingAmount || 0,
    requestedAmount: plaintiff.estimatedSettlement || 0,
    lastActivity: new Date(plaintiff.updatedAt || plaintiff.createdAt),
    createdDate: new Date(plaintiff.createdAt),
    phone: plaintiff.phone || '',
    email: plaintiff.email || '',
    accidentDate: plaintiff.incidentDate ? new Date(plaintiff.incidentDate) : null,
    description: plaintiff.incidentDescription || '',
    documents: plaintiff.documents?.map(doc => doc.title) || [],
    riskScore: plaintiff.riskScore || 75,
    estimatedSettlement: plaintiff.estimatedSettlement || 0,
    progress: plaintiff.progress || 50
  });

  // Use real data if available, otherwise show loading or empty state
  const cases = plaintiffsData ? plaintiffsData.map(transformPlaintiffToCase) : [];

  // Filter and sort cases based on current filters and search
  const filteredAndSortedCases = useMemo(() => {
    let filtered = cases;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(caseItem =>
        caseItem.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        caseItem.attorney.toLowerCase().includes(searchTerm.toLowerCase()) ||
        caseItem.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        caseItem.caseType.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply filters
    if (filters.status) {
      filtered = filtered.filter(caseItem => caseItem.status === filters.status);
    }

    if (filters.caseType) {
      filtered = filtered.filter(caseItem => caseItem.caseType === filters.caseType);
    }

    if (filters.attorney) {
      filtered = filtered.filter(caseItem => caseItem.attorney === filters.attorney);
    }

    if (filters.fundingRange) {
      const [min, max] = filters.fundingRange.split('-').map(Number);
      filtered = filtered.filter(caseItem => {
        const amount = caseItem.fundingAmount;
        return amount >= min && (max ? amount <= max : true);
      });
    }

    if (filters.dateRange) {
      const days = parseInt(filters.dateRange);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      filtered = filtered.filter(caseItem => caseItem.lastActivity >= cutoffDate);
    }

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [cases, searchTerm, filters, sortConfig]);

  // Handle case selection
  const handleCaseSelect = (caseId, isSelected) => {
    if (isSelected) {
      setSelectedCases(prev => [...prev, caseId]);
    } else {
      setSelectedCases(prev => prev.filter(id => id !== caseId));
    }
  };

  const handleSelectAll = (isSelected) => {
    if (isSelected) {
      setSelectedCases(filteredAndSortedCases.map(c => c.id));
    } else {
      setSelectedCases([]);
    }
  };

  // Handle case actions
  const handleCaseClick = (caseItem) => {
    setSelectedCase(caseItem);
  };

  const handleCloseCaseDetail = () => {
    setSelectedCase(null);
  };

  // Handle bulk actions
  const handleBulkAction = async (action, data) => {
    try {
      // Here you would implement the actual bulk actions via API
      console.log('Performing bulk action:', action, 'on cases:', selectedCases, 'with data:', data);
      
      // Reset selection after action
      setSelectedCases([]);
      setShowBulkModal(false);
      
      // Refresh data
      await fetchPlaintiffs();
    } catch (error) {
      console.error('Bulk action failed:', error);
    }
  };

  // Loading and error states
  if (loading && cases.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Icon name="spinner" className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading cases...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Icon name="exclamation-triangle" className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-2">Failed to load cases</p>
          <button 
            onClick={fetchPlaintiffs}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Breadcrumb 
            items={[
              { label: 'Dashboard', href: '/' },
              { label: 'Case Management', href: '/case-management' }
            ]} 
          />
          <h1 className="text-2xl font-bold text-gray-900 mt-2">Case Management</h1>
          <p className="text-gray-600">
            Manage and track all funding cases ({filteredAndSortedCases.length} {filteredAndSortedCases.length === 1 ? 'case' : 'cases'})
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'table'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon name="table-cells" className="w-4 h-4 inline mr-1" />
              Table
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'cards'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon name="squares-2x2" className="w-4 h-4 inline mr-1" />
              Cards
            </button>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <FilterPanel
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filters={filters}
        onFiltersChange={setFilters}
        caseCount={filteredAndSortedCases.length}
        selectedCount={selectedCases.length}
        onBulkActions={() => setShowBulkModal(true)}
        onRefresh={fetchPlaintiffs}
        loading={loading}
      />

      {/* Cases Display */}
      {viewMode === 'table' ? (
        <CaseTable
          cases={filteredAndSortedCases}
          selectedCases={selectedCases}
          onCaseSelect={handleCaseSelect}
          onSelectAll={handleSelectAll}
          sortConfig={sortConfig}
          onSort={setSortConfig}
          onCaseClick={handleCaseClick}
          loading={loading}
        />
      ) : (
        <CaseCards
          cases={filteredAndSortedCases}
          selectedCases={selectedCases}
          onCaseSelect={handleCaseSelect}
          onCaseClick={handleCaseClick}
          loading={loading}
        />
      )}

      {/* Empty State */}
      {filteredAndSortedCases.length === 0 && !loading && (
        <div className="text-center py-12">
          <Icon name="folder-open" className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No cases found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || Object.values(filters).some(f => f) 
              ? 'Try adjusting your search criteria or filters.'
              : 'Get started by creating your first case.'
            }
          </p>
        </div>
      )}

      {/* Case Detail Panel */}
      {selectedCase && (
        <CaseDetailPanel
          case={selectedCase}
          onClose={handleCloseCaseDetail}
          onRefresh={fetchPlaintiffs}
        />
      )}

      {/* Bulk Actions Modal */}
      {showBulkModal && (
        <BulkActionsModal
          selectedCases={selectedCases}
          onClose={() => setShowBulkModal(false)}
          onAction={handleBulkAction}
        />
      )}
    </div>
  );
};

export default CaseManagement;
