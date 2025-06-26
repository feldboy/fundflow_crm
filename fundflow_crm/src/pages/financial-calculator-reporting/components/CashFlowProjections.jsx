import React, { useState } from 'react';
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import Icon from 'components/AppIcon';

const CashFlowProjections = () => {
  const [projectionPeriod, setProjectionPeriod] = useState('6months');
  const [scenarioType, setScenarioType] = useState('realistic');

  // Mock cash flow data
  const cashFlowData = [
    { 
      month: 'Jan', 
      inflow: 890000, 
      outflow: 450000, 
      net: 440000,
      projected: false,
      fundingAdvances: 450000,
      settlements: 890000,
      operatingExpenses: 280000,
      commissions: 170000
    },
    { 
      month: 'Feb', 
      inflow: 1020000, 
      outflow: 520000, 
      net: 500000,
      projected: false,
      fundingAdvances: 520000,
      settlements: 1020000,
      operatingExpenses: 290000,
      commissions: 230000
    },
    { 
      month: 'Mar', 
      inflow: 760000, 
      outflow: 380000, 
      net: 380000,
      projected: false,
      fundingAdvances: 380000,
      settlements: 760000,
      operatingExpenses: 250000,
      commissions: 130000
    },
    { 
      month: 'Apr', 
      inflow: 1150000, 
      outflow: 680000, 
      net: 470000,
      projected: true,
      fundingAdvances: 680000,
      settlements: 1150000,
      operatingExpenses: 320000,
      commissions: 360000
    },
    { 
      month: 'May', 
      inflow: 1280000, 
      outflow: 750000, 
      net: 530000,
      projected: true,
      fundingAdvances: 750000,
      settlements: 1280000,
      operatingExpenses: 340000,
      commissions: 410000
    },
    { 
      month: 'Jun', 
      inflow: 1420000, 
      outflow: 820000, 
      net: 600000,
      projected: true,
      fundingAdvances: 820000,
      settlements: 1420000,
      operatingExpenses: 360000,
      commissions: 460000
    }
  ];

  const scenarioData = {
    conservative: {
      growthRate: 0.05,
      riskFactor: 0.8,
      description: 'Conservative growth with lower risk assumptions'
    },
    realistic: {
      growthRate: 0.12,
      riskFactor: 1.0,
      description: 'Realistic projections based on historical data'
    },
    optimistic: {
      growthRate: 0.20,
      riskFactor: 1.2,
      description: 'Optimistic growth with favorable market conditions'
    }
  };

  const keyMetrics = [
    {
      title: 'Current Cash Position',
      value: '$2.4M',
      change: '+15.2%',
      trend: 'up',
      icon: 'Wallet'
    },
    {
      title: 'Monthly Net Flow',
      value: '$485K',
      change: '+8.7%',
      trend: 'up',
      icon: 'TrendingUp'
    },
    {
      title: 'Projected 6M Net',
      value: '$3.1M',
      change: '+22.5%',
      trend: 'up',
      icon: 'Target'
    },
    {
      title: 'Burn Rate',
      value: '18 months',
      change: '+3 months',
      trend: 'up',
      icon: 'Clock'
    }
  ];

  const upcomingObligations = [
    { date: '2024-04-15', description: 'Quarterly Commission Payments', amount: 450000, type: 'commission' },
    { date: '2024-04-30', description: 'Operating Expenses', amount: 320000, type: 'expense' },
    { date: '2024-05-15', description: 'Expected Settlement Returns', amount: 1280000, type: 'income' },
    { date: '2024-05-31', description: 'Loan Interest Payment', amount: 85000, type: 'expense' },
    { date: '2024-06-15', description: 'Major Settlement Expected', amount: 2100000, type: 'income' }
  ];

  const calculateProjectedBalance = () => {
    const currentBalance = 2400000; // Mock current balance
    const projectedNet = cashFlowData
      .filter(item => item.projected)
      .reduce((sum, item) => sum + item.net, 0);
    return currentBalance + projectedNet;
  };

  const getObligationType = (type) => {
    switch (type) {
      case 'income': return { color: 'text-success bg-success/10', icon: 'ArrowUp' };
      case 'expense': return { color: 'text-error bg-error/10', icon: 'ArrowDown' };
      case 'commission': return { color: 'text-warning bg-warning/10', icon: 'Users' };
      default: return { color: 'text-text-secondary bg-background', icon: 'Circle' };
    }
  };

  return (
    <div className="space-y-8">
      {/* Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-wrap gap-4">
          <select
            value={projectionPeriod}
            onChange={(e) => setProjectionPeriod(e.target.value)}
            className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="3months">3 Months</option>
            <option value="6months">6 Months</option>
            <option value="12months">12 Months</option>
            <option value="24months">24 Months</option>
          </select>

          <select
            value={scenarioType}
            onChange={(e) => setScenarioType(e.target.value)}
            className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="conservative">Conservative</option>
            <option value="realistic">Realistic</option>
            <option value="optimistic">Optimistic</option>
          </select>
        </div>

        <div className="flex gap-2">
          <button className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-micro">
            <Icon name="RefreshCw" size={16} />
            <span>Update Projections</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 border border-border text-text-primary rounded-lg hover:bg-background transition-micro">
            <Icon name="Download" size={16} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {keyMetrics.map((metric, index) => (
          <div key={index} className="bg-surface border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Icon name={metric.icon} size={24} className="text-primary" />
              </div>
              <div className={`flex items-center space-x-1 text-sm ${
                metric.trend === 'up' ? 'text-success' : 'text-error'
              }`}>
                <Icon name={metric.trend === 'up' ? 'TrendingUp' : 'TrendingDown'} size={16} />
                <span>{metric.change}</span>
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary mb-1">{metric.value}</p>
              <p className="text-sm text-text-secondary">{metric.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Scenario Information */}
      <div className="bg-surface border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text-primary">Current Scenario: {scenarioType.charAt(0).toUpperCase() + scenarioType.slice(1)}</h3>
          <Icon name="Info" size={20} className="text-text-secondary" />
        </div>
        <p className="text-text-secondary mb-4">{scenarioData[scenarioType].description}</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-background rounded-lg p-4">
            <div className="text-sm text-text-secondary">Growth Rate</div>
            <div className="text-lg font-semibold text-text-primary">
              {(scenarioData[scenarioType].growthRate * 100).toFixed(1)}%
            </div>
          </div>
          <div className="bg-background rounded-lg p-4">
            <div className="text-sm text-text-secondary">Risk Factor</div>
            <div className="text-lg font-semibold text-text-primary">
              {scenarioData[scenarioType].riskFactor}x
            </div>
          </div>
          <div className="bg-background rounded-lg p-4">
            <div className="text-sm text-text-secondary">Projected Balance</div>
            <div className="text-lg font-semibold text-success">
              ${(calculateProjectedBalance() / 1000000).toFixed(1)}M
            </div>
          </div>
        </div>
      </div>

      {/* Cash Flow Chart */}
      <div className="bg-surface border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-text-primary">Cash Flow Projections</h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-success rounded-full" />
              <span className="text-sm text-text-secondary">Inflow</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-error rounded-full" />
              <span className="text-sm text-text-secondary">Outflow</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-primary rounded-full" />
              <span className="text-sm text-text-secondary">Net Flow</span>
            </div>
          </div>
        </div>
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={cashFlowData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="month" stroke="#64748B" />
              <YAxis stroke="#64748B" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#FFFFFF', 
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px'
                }}
                formatter={(value) => [`$${(value / 1000).toFixed(0)}K`, '']}
              />
              <Area 
                type="monotone" 
                dataKey="inflow" 
                stackId="1" 
                stroke="#059669" 
                fill="#059669" 
                fillOpacity={0.3}
              />
              <Area 
                type="monotone" 
                dataKey="outflow" 
                stackId="2" 
                stroke="#DC2626" 
                fill="#DC2626" 
                fillOpacity={0.3}
              />
              <Line 
                type="monotone" 
                dataKey="net" 
                stroke="#1E40AF" 
                strokeWidth={3}
                dot={{ fill: '#1E40AF', strokeWidth: 2, r: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Cash Flow Breakdown */}
        <div className="bg-surface border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-6 flex items-center">
            <Icon name="PieChart" size={18} className="mr-2" />
            Monthly Breakdown
          </h3>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cashFlowData.slice(-3)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="month" stroke="#64748B" />
                <YAxis stroke="#64748B" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#FFFFFF', 
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px'
                  }}
                  formatter={(value) => [`$${(value / 1000).toFixed(0)}K`, '']}
                />
                <Bar dataKey="fundingAdvances" fill="#DC2626" name="Funding Advances" />
                <Bar dataKey="operatingExpenses" fill="#D97706" name="Operating Expenses" />
                <Bar dataKey="commissions" fill="#0EA5E9" name="Commissions" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Upcoming Obligations */}
        <div className="bg-surface border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-6 flex items-center">
            <Icon name="Calendar" size={18} className="mr-2" />
            Upcoming Obligations
          </h3>
          
          <div className="space-y-4 max-h-64 overflow-y-auto">
            {upcomingObligations.map((obligation, index) => {
              const typeInfo = getObligationType(obligation.type);
              return (
                <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${typeInfo.color}`}>
                      <Icon name={typeInfo.icon} size={16} />
                    </div>
                    <div>
                      <div className="font-medium text-text-primary text-sm">{obligation.description}</div>
                      <div className="text-xs text-text-secondary">{obligation.date}</div>
                    </div>
                  </div>
                  <div className={`font-semibold ${
                    obligation.type === 'income' ? 'text-success' : 'text-error'
                  }`}>
                    {obligation.type === 'income' ? '+' : '-'}${(obligation.amount / 1000).toFixed(0)}K
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Action Items */}
      <div className="bg-surface border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Recommended Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 border border-warning/20 bg-warning/5 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Icon name="AlertTriangle" size={16} className="text-warning" />
              <span className="font-medium text-text-primary">Cash Flow Alert</span>
            </div>
            <p className="text-sm text-text-secondary">Monitor May outflow projections closely</p>
          </div>
          
          <div className="p-4 border border-success/20 bg-success/5 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Icon name="TrendingUp" size={16} className="text-success" />
              <span className="font-medium text-text-primary">Growth Opportunity</span>
            </div>
            <p className="text-sm text-text-secondary">Consider increasing funding capacity</p>
          </div>
          
          <div className="p-4 border border-primary/20 bg-primary/5 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Icon name="Shield" size={16} className="text-primary" />
              <span className="font-medium text-text-primary">Risk Management</span>
            </div>
            <p className="text-sm text-text-secondary">Maintain 3-month cash reserve</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashFlowProjections;