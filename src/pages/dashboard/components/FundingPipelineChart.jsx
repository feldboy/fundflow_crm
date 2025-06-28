import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Icon from 'components/AppIcon';

const FundingPipelineChart = ({ dateRange }) => {
  const pipelineData = [
    { stage: 'Inquiry', count: 245, amount: 1200000 },
    { stage: 'Application', count: 189, amount: 950000 },
    { stage: 'Review', count: 156, amount: 780000 },
    { stage: 'Underwriting', count: 98, amount: 490000 },
    { stage: 'Approved', count: 67, amount: 335000 },
    { stage: 'Funded', count: 45, amount: 225000 }
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-surface border border-border rounded-lg p-3 shadow-overlay">
          <p className="font-medium text-text-primary mb-1">{label}</p>
          <p className="text-sm text-text-secondary">
            Cases: <span className="font-medium text-text-primary">{data.count}</span>
          </p>
          <p className="text-sm text-text-secondary">
            Value: <span className="font-medium text-text-primary">
              ${(data.amount / 1000).toFixed(0)}K
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-surface border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-text-primary mb-1">
            Funding Pipeline
          </h3>
          <p className="text-sm text-text-secondary">
            Cases by stage in the funding process
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Icon name="BarChart3" size={20} className="text-text-secondary" />
          <button className="p-2 hover:bg-background rounded-lg transition-micro">
            <Icon name="MoreHorizontal" size={16} className="text-text-secondary" />
          </button>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={pipelineData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis 
              dataKey="stage" 
              tick={{ fontSize: 12, fill: '#64748B' }}
              axisLine={{ stroke: '#E2E8F0' }}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#64748B' }}
              axisLine={{ stroke: '#E2E8F0' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="count" 
              fill="#1E40AF" 
              radius={[4, 4, 0, 0]}
              className="hover:opacity-80 transition-standard"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-primary rounded-full"></div>
            <span className="text-text-secondary">Active Cases</span>
          </div>
        </div>
        <button className="text-primary hover:text-primary/80 transition-micro font-medium">
          View Details
        </button>
      </div>
    </div>
  );
};

export default FundingPipelineChart;