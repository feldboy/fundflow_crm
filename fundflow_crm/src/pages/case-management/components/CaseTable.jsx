import React from 'react';
import Icon from 'components/AppIcon';

const CaseTable = ({ 
  cases, 
  selectedCases, 
  sortConfig, 
  onSort, 
  onSelectCase, 
  onSelectAll, 
  onViewCase
}) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'New Lead': 'bg-blue-100 text-blue-800',
      'Info Gathering': 'bg-yellow-100 text-yellow-800',
      'Underwriting': 'bg-orange-100 text-orange-800',
      'Offer Made': 'bg-purple-100 text-purple-800',
      'Contracted': 'bg-green-100 text-green-800',
      'Declined': 'bg-red-100 text-red-800',
      'Cancelled': 'bg-gray-100 text-gray-800',
      'Under Review': 'bg-blue-100 text-blue-800',
      'Approved': 'bg-green-100 text-green-800',
      'Pending Documents': 'bg-yellow-100 text-yellow-800',
      'Medical Review': 'bg-orange-100 text-orange-800',
      'Legal Review': 'bg-purple-100 text-purple-800'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <Icon name="ArrowUpDown" size={14} className="text-text-secondary" />;
    }
    return sortConfig.direction === 'asc' 
      ? <Icon name="ArrowUp" size={14} className="text-primary" />
      : <Icon name="ArrowDown" size={14} className="text-primary" />;
  };

  return (
    <div className="bg-surface border border-border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-background border-b border-border">
            <tr>
              <th className="w-12 px-6 py-4">
                <input
                  type="checkbox"
                  checked={selectedCases.length === cases.length && cases.length > 0}
                  onChange={onSelectAll}
                  className="w-4 h-4 text-primary border-border rounded focus:ring-primary focus:ring-2"
                />
              </th>
              <th 
                className="px-6 py-4 text-left text-sm font-medium text-text-primary cursor-pointer hover:bg-background/50 transition-micro"
                onClick={() => onSort('id')}
              >
                <div className="flex items-center space-x-2">
                  <span>Case ID</span>
                  {getSortIcon('id')}
                </div>
              </th>
              <th 
                className="px-6 py-4 text-left text-sm font-medium text-text-primary cursor-pointer hover:bg-background/50 transition-micro"
                onClick={() => onSort('clientName')}
              >
                <div className="flex items-center space-x-2">
                  <span>Client</span>
                  {getSortIcon('clientName')}
                </div>
              </th>
              <th 
                className="px-6 py-4 text-left text-sm font-medium text-text-primary cursor-pointer hover:bg-background/50 transition-micro"
                onClick={() => onSort('attorney')}
              >
                <div className="flex items-center space-x-2">
                  <span>Attorney</span>
                  {getSortIcon('attorney')}
                </div>
              </th>
              <th 
                className="px-6 py-4 text-left text-sm font-medium text-text-primary cursor-pointer hover:bg-background/50 transition-micro"
                onClick={() => onSort('caseType')}
              >
                <div className="flex items-center space-x-2">
                  <span>Case Type</span>
                  {getSortIcon('caseType')}
                </div>
              </th>
              <th 
                className="px-6 py-4 text-left text-sm font-medium text-text-primary cursor-pointer hover:bg-background/50 transition-micro"
                onClick={() => onSort('status')}
              >
                <div className="flex items-center space-x-2">
                  <span>Status</span>
                  {getSortIcon('status')}
                </div>
              </th>
              <th 
                className="px-6 py-4 text-left text-sm font-medium text-text-primary cursor-pointer hover:bg-background/50 transition-micro"
                onClick={() => onSort('fundingAmount')}
              >
                <div className="flex items-center space-x-2">
                  <span>Funding</span>
                  {getSortIcon('fundingAmount')}
                </div>
              </th>
              <th 
                className="px-6 py-4 text-left text-sm font-medium text-text-primary cursor-pointer hover:bg-background/50 transition-micro"
                onClick={() => onSort('lastActivity')}
              >
                <div className="flex items-center space-x-2">
                  <span>Last Activity</span>
                  {getSortIcon('lastActivity')}
                </div>
              </th>
              <th className="px-6 py-4 text-right text-sm font-medium text-text-primary">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {cases.map((caseItem) => (
              <tr 
                key={caseItem.id}
                className="hover:bg-background/50 transition-micro cursor-pointer"
                onClick={() => onViewCase(caseItem)}
              >
                <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedCases.includes(caseItem.id)}
                    onChange={() => onSelectCase(caseItem.id)}
                    className="w-4 h-4 text-primary border-border rounded focus:ring-primary focus:ring-2"
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-text-primary">{caseItem.id}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-text-primary">{caseItem.clientName}</div>
                  <div className="text-sm text-text-secondary">{caseItem.phone}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-text-primary">{caseItem.attorney}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-text-primary">{caseItem.caseType}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(caseItem.status)}`}>
                    {caseItem.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-text-primary">
                    {caseItem.fundingAmount > 0 ? formatCurrency(caseItem.fundingAmount) : '-'}
                  </div>
                  {caseItem.requestedAmount > 0 && (
                    <div className="text-xs text-text-secondary">
                      Requested: {formatCurrency(caseItem.requestedAmount)}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-text-primary">{formatDate(caseItem.lastActivity)}</div>
                </td>
                <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => onViewCase(caseItem)}
                      className="p-1 text-text-secondary hover:text-text-primary transition-micro"
                      title="View Details"
                    >
                      <Icon name="Eye" size={16} />
                    </button>
                    <button
                      className="p-1 text-text-secondary hover:text-text-primary transition-micro"
                      title="Edit Case"
                    >
                      <Icon name="Edit" size={16} />
                    </button>
                    <button
                      className="p-1 text-text-secondary hover:text-text-primary transition-micro"
                      title="More Options"
                    >
                      <Icon name="MoreHorizontal" size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CaseTable;