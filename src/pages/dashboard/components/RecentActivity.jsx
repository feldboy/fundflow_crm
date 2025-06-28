import React from 'react';
import Icon from 'components/AppIcon';

const RecentActivity = () => {
  const activities = [
    {
      id: 1,
      type: 'case_approved',
      title: 'Case #12345 Approved',
      description: 'Sarah Johnson - Personal injury case approved for $15,000 funding',
      timestamp: '2 minutes ago',
      icon: 'CheckCircle',
      iconColor: 'text-success',
      iconBg: 'bg-success/10'
    },
    {
      id: 2,
      type: 'document_uploaded',
      title: 'Documents Received',
      description: 'Medical records uploaded for Case #12346 by Attorney Mark Davis',
      timestamp: '15 minutes ago',
      icon: 'FileText',
      iconColor: 'text-accent',
      iconBg: 'bg-accent/10'
    },
    {
      id: 3,
      type: 'payment_processed',
      title: 'Payment Processed',
      description: '$8,500 funding disbursed to client Michael Rodriguez',
      timestamp: '1 hour ago',
      icon: 'DollarSign',
      iconColor: 'text-success',
      iconBg: 'bg-success/10'
    },
    {
      id: 4,
      type: 'case_rejected',
      title: 'Case #12347 Rejected',
      description: 'Insufficient documentation - client notified for additional info',
      timestamp: '2 hours ago',
      icon: 'XCircle',
      iconColor: 'text-error',
      iconBg: 'bg-error/10'
    },
    {
      id: 5,
      type: 'new_application',
      title: 'New Application',
      description: 'Lisa Chen submitted application for motor vehicle accident case',
      timestamp: '3 hours ago',
      icon: 'Plus',
      iconColor: 'text-primary',
      iconBg: 'bg-primary/10'
    },
    {
      id: 6,
      type: 'attorney_verified',
      title: 'Attorney Verified',
      description: 'Thompson & Associates law firm verification completed',
      timestamp: '4 hours ago',
      icon: 'Shield',
      iconColor: 'text-accent',
      iconBg: 'bg-accent/10'
    }
  ];

  return (
    <div className="bg-surface border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-text-primary mb-1">
            Recent Activity
          </h3>
          <p className="text-sm text-text-secondary">
            Latest updates and actions
          </p>
        </div>
        <button className="p-2 hover:bg-background rounded-lg transition-micro">
          <Icon name="MoreHorizontal" size={16} className="text-text-secondary" />
        </button>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {activities.map((activity, index) => (
          <div key={activity.id} className="flex items-start space-x-3 group">
            <div className={`w-10 h-10 ${activity.iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
              <Icon name={activity.icon} size={16} className={activity.iconColor} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-text-primary group-hover:text-primary transition-micro">
                    {activity.title}
                  </h4>
                  <p className="text-sm text-text-secondary mt-1 line-clamp-2">
                    {activity.description}
                  </p>
                </div>
              </div>
              <p className="text-xs text-text-secondary mt-2">
                {activity.timestamp}
              </p>
            </div>
            
            {index < activities.length - 1 && (
              <div className="absolute left-8 mt-12 w-px h-4 bg-border"></div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-border">
        <button className="w-full text-center text-sm text-primary hover:text-primary/80 transition-micro font-medium">
          View All Activity
        </button>
      </div>
    </div>
  );
};

export default RecentActivity;