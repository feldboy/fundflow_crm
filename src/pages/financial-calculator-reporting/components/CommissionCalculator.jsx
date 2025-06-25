import React, { useState } from 'react';

import Icon from 'components/AppIcon';

const CommissionCalculator = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('current');
  const [commissionStructure, setCommissionStructure] = useState('tiered');

  // Mock commission data
  const commissionData = [
    {
      id: 1,
      employee: 'Sarah Johnson',
      role: 'Senior Case Manager',
      casesHandled: 45,
      totalFunding: 1250000,
      baseCommission: 0.02,
      bonusCommission: 0.005,
      totalCommission: 27500,
      status: 'approved'
    },
    {
      id: 2,
      employee: 'Michael Chen',
      role: 'Underwriter',
      casesHandled: 38,
      totalFunding: 980000,
      baseCommission: 0.015,
      bonusCommission: 0.003,
      totalCommission: 17640,
      status: 'pending'
    },
    {
      id: 3,
      employee: 'Emily Rodriguez',
      role: 'Business Development',
      casesHandled: 52,
      totalFunding: 1680000,
      baseCommission: 0.025,
      bonusCommission: 0.008,
      totalCommission: 55440,
      status: 'approved'
    },
    {
      id: 4,
      employee: 'David Thompson',
      role: 'Case Manager',
      casesHandled: 29,
      totalFunding: 750000,
      baseCommission: 0.018,
      bonusCommission: 0.002,
      totalCommission: 15000,
      status: 'approved'
    }
  ];

  const commissionTiers = [
    { tier: 'Tier 1', range: '$0 - $500K', rate: '1.5%', color: 'bg-gray-100' },
    { tier: 'Tier 2', range: '$500K - $1M', rate: '2.0%', color: 'bg-blue-100' },
    { tier: 'Tier 3', range: '$1M - $2M', rate: '2.5%', color: 'bg-green-100' },
    { tier: 'Tier 4', range: '$2M+', rate: '3.0%', color: 'bg-purple-100' }
  ];

  const monthlyCommissionTrends = [
    { month: 'Jan', total: 125000, employees: 12 },
    { month: 'Feb', total: 138000, employees: 13 },
    { month: 'Mar', total: 142000, employees: 13 },
    { month: 'Apr', total: 156000, employees: 14 },
    { month: 'May', total: 168000, employees: 15 },
    { month: 'Jun', total: 175000, employees: 15 }
  ];

  const calculateTotalCommissions = () => {
    return commissionData.reduce((total, employee) => total + employee.totalCommission, 0);
  };

  const calculateAverageCommission = () => {
    const total = calculateTotalCommissions();
    return total / commissionData.length;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-success bg-success/10';
      case 'pending': return 'text-warning bg-warning/10';
      case 'rejected': return 'text-error bg-error/10';
      default: return 'text-text-secondary bg-background';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-wrap gap-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="current">Current Month</option>
            <option value="last">Last Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>

          <select
            value={commissionStructure}
            onChange={(e) => setCommissionStructure(e.target.value)}
            className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="tiered">Tiered Structure</option>
            <option value="flat">Flat Rate</option>
            <option value="performance">Performance Based</option>
          </select>
        </div>

        <div className="flex gap-2">
          <button className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-micro">
            <Icon name="Calculator" size={16} />
            <span>Calculate All</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 border border-border text-text-primary rounded-lg hover:bg-background transition-micro">
            <Icon name="Download" size={16} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name="DollarSign" size={24} className="text-primary" />
            </div>
            <span className="text-sm text-success">+12.5%</span>
          </div>
          <div>
            <p className="text-2xl font-bold text-text-primary mb-1">
              ${calculateTotalCommissions().toLocaleString()}
            </p>
            <p className="text-sm text-text-secondary">Total Commissions</p>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
              <Icon name="Users" size={24} className="text-accent" />
            </div>
            <span className="text-sm text-success">+2</span>
          </div>
          <div>
            <p className="text-2xl font-bold text-text-primary mb-1">{commissionData.length}</p>
            <p className="text-sm text-text-secondary">Active Employees</p>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
              <Icon name="TrendingUp" size={24} className="text-success" />
            </div>
            <span className="text-sm text-success">+8.3%</span>
          </div>
          <div>
            <p className="text-2xl font-bold text-text-primary mb-1">
              ${Math.round(calculateAverageCommission()).toLocaleString()}
            </p>
            <p className="text-sm text-text-secondary">Average Commission</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Commission Structure */}
        <div className="bg-surface border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-6 flex items-center">
            <Icon name="Layers" size={18} className="mr-2" />
            Commission Tiers
          </h3>

          <div className="space-y-4">
            {commissionTiers.map((tier, index) => (
              <div key={index} className={`p-4 rounded-lg ${tier.color}`}>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-text-primary">{tier.tier}</span>
                  <span className="text-lg font-bold text-primary">{tier.rate}</span>
                </div>
                <p className="text-sm text-text-secondary">{tier.range}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-background rounded-lg">
            <h4 className="font-medium text-text-primary mb-2">Bonus Qualifiers</h4>
            <ul className="text-sm text-text-secondary space-y-1">
              <li>• 95%+ Success Rate: +0.5%</li>
              <li>• 30+ Cases/Month: +0.3%</li>
              <li>• Client Satisfaction &gt; 4.5: +0.2%</li>
            </ul>
          </div>
        </div>

        {/* Commission Calculator */}
        <div className="lg:col-span-2 bg-surface border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-6 flex items-center">
            <Icon name="Calculator" size={18} className="mr-2" />
            Employee Commission Details
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-text-primary">Employee</th>
                  <th className="text-right py-3 px-4 font-medium text-text-primary">Cases</th>
                  <th className="text-right py-3 px-4 font-medium text-text-primary">Funding Volume</th>
                  <th className="text-right py-3 px-4 font-medium text-text-primary">Base Rate</th>
                  <th className="text-right py-3 px-4 font-medium text-text-primary">Commission</th>
                  <th className="text-center py-3 px-4 font-medium text-text-primary">Status</th>
                </tr>
              </thead>
              <tbody>
                {commissionData.map((employee) => (
                  <tr key={employee.id} className="border-b border-border hover:bg-background transition-micro">
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-medium text-text-primary">{employee.employee}</div>
                        <div className="text-sm text-text-secondary">{employee.role}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right text-text-primary">{employee.casesHandled}</td>
                    <td className="py-4 px-4 text-right text-text-primary">
                      ${employee.totalFunding.toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-right text-text-primary">
                      {(employee.baseCommission * 100).toFixed(1)}%
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="font-semibold text-success">
                        ${employee.totalCommission.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(employee.status)}`}>
                        {employee.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button className="flex items-center space-x-2 px-4 py-2 bg-success text-white rounded-lg hover:bg-success/90 transition-micro">
              <Icon name="Check" size={16} />
              <span>Approve All</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-micro">
              <Icon name="Send" size={16} />
              <span>Process Payments</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 border border-border text-text-primary rounded-lg hover:bg-background transition-micro">
              <Icon name="FileText" size={16} />
              <span>Generate Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Monthly Trends */}
      <div className="bg-surface border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-text-primary">Commission Trends</h3>
          <Icon name="TrendingUp" size={20} className="text-text-secondary" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {monthlyCommissionTrends.map((month, index) => (
            <div key={index} className="text-center">
              <div className="bg-primary/10 rounded-lg p-4 mb-2">
                <div className="text-lg font-bold text-primary">
                  ${(month.total / 1000).toFixed(0)}K
                </div>
                <div className="text-xs text-text-secondary">{month.employees} employees</div>
              </div>
              <div className="text-sm font-medium text-text-primary">{month.month}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-surface border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center space-x-2 p-4 border border-border rounded-lg hover:bg-background transition-micro">
            <Icon name="UserPlus" size={20} />
            <span>Add New Employee</span>
          </button>
          <button className="flex items-center justify-center space-x-2 p-4 border border-border rounded-lg hover:bg-background transition-micro">
            <Icon name="Settings" size={20} />
            <span>Update Commission Rules</span>
          </button>
          <button className="flex items-center justify-center space-x-2 p-4 border border-border rounded-lg hover:bg-background transition-micro">
            <Icon name="Calendar" size={20} />
            <span>Schedule Payments</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommissionCalculator;