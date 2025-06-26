import React from 'react';
import Icon from 'components/AppIcon';

const KPICards = ({ dateRange }) => {
  const kpiData = [
    {
      id: 1,
      title: 'Total Active Cases',
      value: '1,247',
      change: '+12.5%',
      trend: 'up',
      icon: 'FolderOpen',
      color: 'bg-blue-500',
      description: 'Cases currently in progress'
    },
    {
      id: 2,
      title: 'Pending Approvals',
      value: '89',
      change: '-5.2%',
      trend: 'down',
      icon: 'Clock',
      color: 'bg-amber-500',
      description: 'Cases awaiting approval'
    },
    {
      id: 3,
      title: 'Monthly Funding Volume',
      value: '$2.4M',
      change: '+18.7%',
      trend: 'up',
      icon: 'DollarSign',
      color: 'bg-green-500',
      description: 'Total funding this month'
    },
    {
      id: 4,
      title: 'Conversion Rate',
      value: '68.3%',
      change: '+3.1%',
      trend: 'up',
      icon: 'TrendingUp',
      color: 'bg-purple-500',
      description: 'Applications to funding ratio'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpiData.map((kpi) => (
        <div
          key={kpi.id}
          className="bg-surface border border-border rounded-lg p-6 hover:shadow-card transition-standard cursor-pointer group"
        >
          <div className="flex items-start justify-between mb-4">
            <div className={`w-12 h-12 ${kpi.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-standard`}>
              <Icon name={kpi.icon} size={24} color="white" />
            </div>
            <div className={`flex items-center space-x-1 text-sm font-medium ${
              kpi.trend === 'up' ? 'text-success' : 'text-error'
            }`}>
              <Icon 
                name={kpi.trend === 'up' ? 'TrendingUp' : 'TrendingDown'} 
                size={16} 
              />
              <span>{kpi.change}</span>
            </div>
          </div>
          
          <div>
            <h3 className="text-2xl font-bold text-text-primary mb-1">
              {kpi.value}
            </h3>
            <p className="text-sm font-medium text-text-primary mb-1">
              {kpi.title}
            </p>
            <p className="text-xs text-text-secondary">
              {kpi.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default KPICards;