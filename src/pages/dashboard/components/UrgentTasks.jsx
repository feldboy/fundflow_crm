import React from 'react';
import Icon from 'components/AppIcon';

const UrgentTasks = () => {
  const urgentTasks = [
    {
      id: 1,
      title: 'Review High-Value Case',
      description: 'Case #12348 requires executive approval - $50,000 funding request',
      priority: 'high',
      dueDate: 'Due in 2 hours',
      assignee: 'You',
      caseId: '12348'
    },
    {
      id: 2,
      title: 'Attorney Verification Pending',
      description: 'Wilson & Partners law firm needs verification for 3 pending cases',
      priority: 'medium',
      dueDate: 'Due today',
      assignee: 'Legal Team',
      caseId: null
    },
    {
      id: 3,
      title: 'Document Review Required',
      description: 'Medical records for Case #12349 need specialist review',
      priority: 'high',
      dueDate: 'Due in 4 hours',
      assignee: 'Medical Team',
      caseId: '12349'
    },
    {
      id: 4,
      title: 'Client Follow-up',
      description: 'Contact client about missing documentation for Case #12350',
      priority: 'medium',
      dueDate: 'Due tomorrow',
      assignee: 'Case Manager',
      caseId: '12350'
    }
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-error bg-error/10';
      case 'medium':
        return 'text-warning bg-warning/10';
      default:
        return 'text-accent bg-accent/10';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high':
        return 'AlertTriangle';
      case 'medium':
        return 'Clock';
      default:
        return 'Info';
    }
  };

  return (
    <div className="bg-surface border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-text-primary mb-1">
            Urgent Tasks
          </h3>
          <p className="text-sm text-text-secondary">
            Items requiring immediate attention
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 bg-error rounded-full animate-pulse"></span>
          <span className="text-xs text-error font-medium">{urgentTasks.length} urgent</span>
        </div>
      </div>

      <div className="space-y-4">
        {urgentTasks.map((task) => (
          <div
            key={task.id}
            className="border border-border rounded-lg p-4 hover:shadow-card transition-standard cursor-pointer group"
          >
            <div className="flex items-start space-x-3">
              <div className={`w-8 h-8 ${getPriorityColor(task.priority)} rounded-lg flex items-center justify-center flex-shrink-0`}>
                <Icon name={getPriorityIcon(task.priority)} size={14} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-sm font-medium text-text-primary group-hover:text-primary transition-micro">
                    {task.title}
                  </h4>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>
                
                <p className="text-sm text-text-secondary mb-3 line-clamp-2">
                  {task.description}
                </p>
                
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-4">
                    <span className="text-text-secondary">
                      <Icon name="User" size={12} className="inline mr-1" />
                      {task.assignee}
                    </span>
                    {task.caseId && (
                      <span className="text-text-secondary">
                        <Icon name="Hash" size={12} className="inline mr-1" />
                        {task.caseId}
                      </span>
                    )}
                  </div>
                  <span className="text-error font-medium">
                    {task.dueDate}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-border">
        <button className="w-full text-center text-sm text-primary hover:text-primary/80 transition-micro font-medium">
          View All Tasks
        </button>
      </div>
    </div>
  );
};

export default UrgentTasks;