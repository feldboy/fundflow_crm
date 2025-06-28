import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import Icon from 'components/AppIcon';

const CaseStatusChart = ({ dateRange }) => {
  const statusData = [
    { name: 'Active', value: 45, color: '#1E40AF' },
    { name: 'Pending', value: 25, color: '#D97706' },
    { name: 'Approved', value: 20, color: '#059669' },
    { name: 'Rejected', value: 10, color: '#DC2626' }
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-surface border border-border rounded-lg p-3 shadow-overlay">
          <p className="font-medium text-text-primary mb-1">{data.name}</p>
          <p className="text-sm text-text-secondary">
            {data.value}% of total cases
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
            Case Status Distribution
          </h3>
          <p className="text-sm text-text-secondary">
            Current status breakdown
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Icon name="PieChart" size={20} className="text-text-secondary" />
          <button className="p-2 hover:bg-background rounded-lg transition-micro">
            <Icon name="MoreHorizontal" size={16} className="text-text-secondary" />
          </button>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={statusData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
            >
              {statusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        {statusData.map((item, index) => (
          <div key={index} className="flex items-center space-x-3">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            ></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-text-primary">{item.name}</p>
              <p className="text-xs text-text-secondary">{item.value}%</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CaseStatusChart;