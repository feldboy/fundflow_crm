import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Icon from 'components/AppIcon';

const MonthlyPerformanceChart = ({ dateRange }) => {
  const [activeMetric, setActiveMetric] = useState('funding');

  const performanceData = [
    { month: 'Jan', funding: 1800000, cases: 145, conversion: 65 },
    { month: 'Feb', funding: 2100000, cases: 167, conversion: 68 },
    { month: 'Mar', funding: 1950000, cases: 156, conversion: 62 },
    { month: 'Apr', funding: 2300000, cases: 189, conversion: 71 },
    { month: 'May', funding: 2650000, cases: 201, conversion: 74 },
    { month: 'Jun', funding: 2400000, cases: 178, conversion: 69 }
  ];

  const metrics = [
    { key: 'funding', label: 'Funding Volume', color: '#1E40AF', format: (val) => `$${(val / 1000000).toFixed(1)}M` },
    { key: 'cases', label: 'Cases Processed', color: '#059669', format: (val) => val.toString() },
    { key: 'conversion', label: 'Conversion Rate', color: '#D97706', format: (val) => `${val}%` }
  ];

  const activeMetricData = metrics.find(m => m.key === activeMetric);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-surface border border-border rounded-lg p-3 shadow-overlay">
          <p className="font-medium text-text-primary mb-2">{label}</p>
          <div className="space-y-1">
            <p className="text-sm text-text-secondary">
              Funding: <span className="font-medium text-text-primary">
                ${(data.funding / 1000000).toFixed(1)}M
              </span>
            </p>
            <p className="text-sm text-text-secondary">
              Cases: <span className="font-medium text-text-primary">{data.cases}</span>
            </p>
            <p className="text-sm text-text-secondary">
              Conversion: <span className="font-medium text-text-primary">{data.conversion}%</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-surface border border-border rounded-lg p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-text-primary mb-1">
            Monthly Performance
          </h3>
          <p className="text-sm text-text-secondary">
            Key metrics over time
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex items-center space-x-2">
          <div className="flex bg-background rounded-lg p-1">
            {metrics.map((metric) => (
              <button
                key={metric.key}
                onClick={() => setActiveMetric(metric.key)}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-micro ${
                  activeMetric === metric.key
                    ? 'bg-surface text-text-primary shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {metric.label}
              </button>
            ))}
          </div>
          <button className="p-2 hover:bg-background rounded-lg transition-micro">
            <Icon name="MoreHorizontal" size={16} className="text-text-secondary" />
          </button>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={performanceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 12, fill: '#64748B' }}
              axisLine={{ stroke: '#E2E8F0' }}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#64748B' }}
              axisLine={{ stroke: '#E2E8F0' }}
              tickFormatter={activeMetricData.format}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey={activeMetric} 
              stroke={activeMetricData.color}
              strokeWidth={3}
              dot={{ fill: activeMetricData.color, strokeWidth: 2, r: 6 }}
              activeDot={{ r: 8, stroke: activeMetricData.color, strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: activeMetricData.color }}
          ></div>
          <span className="text-sm text-text-secondary">{activeMetricData.label}</span>
        </div>
        <button className="text-primary hover:text-primary/80 transition-micro font-medium text-sm">
          Export Data
        </button>
      </div>
    </div>
  );
};

export default MonthlyPerformanceChart;