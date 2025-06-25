import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import Icon from 'components/AppIcon';

const ReportingDashboard = () => {
  const [dateRange, setDateRange] = useState('last30days');
  const [selectedReport, setSelectedReport] = useState('overview');

  // Mock data for charts
  const monthlyFundingData = [
    { month: 'Jan', funding: 450000, cases: 23, profit: 135000 },
    { month: 'Feb', funding: 520000, cases: 28, profit: 156000 },
    { month: 'Mar', funding: 380000, cases: 19, profit: 114000 },
    { month: 'Apr', funding: 680000, cases: 34, profit: 204000 },
    { month: 'May', funding: 750000, cases: 38, profit: 225000 },
    { month: 'Jun', funding: 620000, cases: 31, profit: 186000 }
  ];

  const casePerformanceData = [
    { attorney: 'Smith & Associates', cases: 45, avgValue: 125000, successRate: 92 },
    { attorney: 'Johnson Law Firm', cases: 38, avgValue: 98000, successRate: 88 },
    { attorney: 'Williams Legal', cases: 32, avgValue: 156000, successRate: 95 },
    { attorney: 'Brown & Partners', cases: 28, avgValue: 87000, successRate: 85 },
    { attorney: 'Davis Law Group', cases: 25, avgValue: 134000, successRate: 90 }
  ];

  const riskAssessmentData = [
    { name: 'Low Risk', value: 45, color: '#059669' },
    { name: 'Medium Risk', value: 35, color: '#D97706' },
    { name: 'High Risk', value: 20, color: '#DC2626' }
  ];

  const cashFlowData = [
    { month: 'Jan', inflow: 890000, outflow: 450000, net: 440000 },
    { month: 'Feb', inflow: 1020000, outflow: 520000, net: 500000 },
    { month: 'Mar', inflow: 760000, outflow: 380000, net: 380000 },
    { month: 'Apr', inflow: 1360000, outflow: 680000, net: 680000 },
    { month: 'May', inflow: 1500000, outflow: 750000, net: 750000 },
    { month: 'Jun', inflow: 1240000, outflow: 620000, net: 620000 }
  ];

  const keyMetrics = [
    {
      title: 'Total Funding Volume',
      value: '$3.4M',
      change: '+12.5%',
      trend: 'up',
      icon: 'DollarSign',
      color: 'text-success'
    },
    {
      title: 'Active Cases',
      value: '173',
      change: '+8.2%',
      trend: 'up',
      icon: 'FolderOpen',
      color: 'text-primary'
    },
    {
      title: 'Average ROI',
      value: '24.8%',
      change: '+2.1%',
      trend: 'up',
      icon: 'TrendingUp',
      color: 'text-accent'
    },
    {
      title: 'Success Rate',
      value: '89.5%',
      change: '-1.2%',
      trend: 'down',
      icon: 'Target',
      color: 'text-warning'
    }
  ];

  const reportTypes = [
    { id: 'overview', label: 'Business Overview', icon: 'BarChart3' },
    { id: 'funding', label: 'Funding Analysis', icon: 'DollarSign' },
    { id: 'performance', label: 'Case Performance', icon: 'TrendingUp' },
    { id: 'risk', label: 'Risk Assessment', icon: 'Shield' },
    { id: 'cashflow', label: 'Cash Flow', icon: 'Activity' }
  ];

  const dateRanges = [
    { value: 'last7days', label: 'Last 7 Days' },
    { value: 'last30days', label: 'Last 30 Days' },
    { value: 'last90days', label: 'Last 90 Days' },
    { value: 'last6months', label: 'Last 6 Months' },
    { value: 'lastyear', label: 'Last Year' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const exportReport = (format) => {
    // Mock export functionality
    console.log(`Exporting report in ${format} format`);
  };

  return (
    <div className="space-y-8">
      {/* Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-wrap gap-4">
          <select
            value={selectedReport}
            onChange={(e) => setSelectedReport(e.target.value)}
            className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            {reportTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.label}
              </option>
            ))}
          </select>

          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            {dateRanges.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => exportReport('pdf')}
            className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-micro"
          >
            <Icon name="FileText" size={16} />
            <span>PDF</span>
          </button>
          <button
            onClick={() => exportReport('excel')}
            className="flex items-center space-x-2 px-4 py-2 bg-success text-white rounded-lg hover:bg-success/90 transition-micro"
          >
            <Icon name="FileSpreadsheet" size={16} />
            <span>Excel</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {keyMetrics.map((metric, index) => (
          <div key={index} className="bg-surface border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center`}>
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

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Funding Volume */}
        <div className="bg-surface border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-text-primary">Monthly Funding Volume</h3>
            <Icon name="BarChart3" size={20} className="text-text-secondary" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyFundingData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="month" stroke="#64748B" />
                <YAxis stroke="#64748B" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#FFFFFF', 
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="funding" fill="#1E40AF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Portfolio Risk Distribution */}
        <div className="bg-surface border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-text-primary">Portfolio Risk Distribution</h3>
            <Icon name="PieChart" size={20} className="text-text-secondary" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskAssessmentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {riskAssessmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center space-x-6 mt-4">
            {riskAssessmentData.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-text-secondary">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Cash Flow Analysis */}
        <div className="bg-surface border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-text-primary">Cash Flow Analysis</h3>
            <Icon name="Activity" size={20} className="text-text-secondary" />
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
                />
                <Area 
                  type="monotone" 
                  dataKey="inflow" 
                  stackId="1" 
                  stroke="#059669" 
                  fill="#059669" 
                  fillOpacity={0.6}
                />
                <Area 
                  type="monotone" 
                  dataKey="outflow" 
                  stackId="2" 
                  stroke="#DC2626" 
                  fill="#DC2626" 
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Profit Trends */}
        <div className="bg-surface border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-text-primary">Profit Trends</h3>
            <Icon name="TrendingUp" size={20} className="text-text-secondary" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyFundingData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="month" stroke="#64748B" />
                <YAxis stroke="#64748B" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#FFFFFF', 
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="profit" 
                  stroke="#0EA5E9" 
                  strokeWidth={3}
                  dot={{ fill: '#0EA5E9', strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Attorney Performance Table */}
      <div className="bg-surface border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-text-primary">Case Performance by Attorney</h3>
          <Icon name="Users" size={20} className="text-text-secondary" />
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-medium text-text-primary">Attorney/Firm</th>
                <th className="text-right py-3 px-4 font-medium text-text-primary">Cases</th>
                <th className="text-right py-3 px-4 font-medium text-text-primary">Avg Case Value</th>
                <th className="text-right py-3 px-4 font-medium text-text-primary">Success Rate</th>
                <th className="text-center py-3 px-4 font-medium text-text-primary">Performance</th>
              </tr>
            </thead>
            <tbody>
              {casePerformanceData.map((attorney, index) => (
                <tr key={index} className="border-b border-border hover:bg-background transition-micro">
                  <td className="py-4 px-4">
                    <div className="font-medium text-text-primary">{attorney.attorney}</div>
                  </td>
                  <td className="py-4 px-4 text-right text-text-primary">{attorney.cases}</td>
                  <td className="py-4 px-4 text-right text-text-primary">
                    ${attorney.avgValue.toLocaleString()}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className={`font-medium ${
                      attorney.successRate >= 90 ? 'text-success' :
                      attorney.successRate >= 85 ? 'text-warning' : 'text-error'
                    }`}>
                      {attorney.successRate}%
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="w-full bg-background rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          attorney.successRate >= 90 ? 'bg-success' :
                          attorney.successRate >= 85 ? 'bg-warning' : 'bg-error'
                        }`}
                        style={{ width: `${attorney.successRate}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportingDashboard;