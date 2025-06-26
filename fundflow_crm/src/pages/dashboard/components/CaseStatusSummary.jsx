import React from 'react';
import { Link } from 'react-router-dom';
import Icon from 'components/AppIcon';

const CaseStatusSummary = () => {
  const statusSummary = [
    {
      id: 1,
      status: 'New Applications',
      count: 23,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      icon: 'FileText',
      link: '/case-management?status=new'
    },
    {
      id: 2,
      status: 'Under Review',
      count: 45,
      color: 'bg-amber-500',
      textColor: 'text-amber-600',
      bgColor: 'bg-amber-50',
      icon: 'Eye',
      link: '/case-management?status=review'
    },
    {
      id: 3,
      status: 'Approved',
      count: 67,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
      icon: 'CheckCircle',
      link: '/case-management?status=approved'
    },
    {
      id: 4,
      status: 'Funded',
      count: 89,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
      icon: 'DollarSign',
      link: '/case-management?status=funded'
    },
    {
      id: 5,
      status: 'Rejected',
      count: 12,
      color: 'bg-red-500',
      textColor: 'text-red-600',
      bgColor: 'bg-red-50',
      icon: 'XCircle',
      link: '/case-management?status=rejected'
    },
    {
      id: 6,
      status: 'On Hold',
      count: 8,
      color: 'bg-gray-500',
      textColor: 'text-gray-600',
      bgColor: 'bg-gray-50',
      icon: 'Pause',
      link: '/case-management?status=hold'
    }
  ];

  const totalCases = statusSummary.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="bg-surface border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-text-primary mb-1">
            Case Status
          </h3>
          <p className="text-sm text-text-secondary">
            {totalCases} total cases
          </p>
        </div>
        <Icon name="BarChart3" size={20} className="text-text-secondary" />
      </div>

      <div className="space-y-3">
        {statusSummary.map((item) => (
          <Link
            key={item.id}
            to={item.link}
            className={`block p-4 ${item.bgColor} rounded-lg hover:shadow-card transition-standard group`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 ${item.color} rounded-lg flex items-center justify-center`}>
                  <Icon name={item.icon} size={16} color="white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary group-hover:text-primary transition-micro">
                    {item.status}
                  </p>
                  <p className="text-xs text-text-secondary">
                    Click to view cases
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <p className={`text-2xl font-bold ${item.textColor}`}>
                  {item.count}
                </p>
                <p className="text-xs text-text-secondary">
                  {((item.count / totalCases) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="mt-3 w-full bg-white/50 rounded-full h-1">
              <div 
                className={`h-1 ${item.color} rounded-full transition-standard`}
                style={{ width: `${(item.count / totalCases) * 100}%` }}
              ></div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-border">
        <Link
          to="/case-management"
          className="flex items-center justify-center space-x-2 w-full py-2 text-sm text-primary hover:text-primary/80 transition-micro font-medium"
        >
          <span>View All Cases</span>
          <Icon name="ArrowRight" size={16} />
        </Link>
      </div>
    </div>
  );
};

export default CaseStatusSummary;