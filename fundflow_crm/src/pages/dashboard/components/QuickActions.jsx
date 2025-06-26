import React from 'react';
import { Link } from 'react-router-dom';
import Icon from 'components/AppIcon';

const QuickActions = () => {
  const quickActions = [
    {
      id: 1,
      title: 'New Case Intake',
      description: 'Start a new client application',
      icon: 'Plus',
      color: 'bg-primary',
      hoverColor: 'hover:bg-primary/90',
      link: '/client-intake-form'
    },
    {
      id: 2,
      title: 'AI Risk Assessment',
      description: 'Run automated case evaluation',
      icon: 'Brain',
      color: 'bg-accent',
      hoverColor: 'hover:bg-accent/90',
      link: '/ai-risk-assessment'
    },
    {
      id: 3,
      title: 'Financial Calculator',
      description: 'Calculate funding amounts',
      icon: 'Calculator',
      color: 'bg-success',
      hoverColor: 'hover:bg-success/90',
      link: '/financial-calculator-reporting'
    },
    {
      id: 4,
      title: 'Client Communications',
      description: 'Send updates and messages',
      icon: 'MessageSquare',
      color: 'bg-warning',
      hoverColor: 'hover:bg-warning/90',
      link: '/client-communication-hub'
    }
  ];

  return (
    <div className="bg-surface border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-text-primary mb-1">
            Quick Actions
          </h3>
          <p className="text-sm text-text-secondary">
            Common workflows and tasks
          </p>
        </div>
        <Icon name="Zap" size={20} className="text-warning" />
      </div>

      <div className="grid grid-cols-1 gap-3">
        {quickActions.map((action) => (
          <Link
            key={action.id}
            to={action.link}
            className={`flex items-center space-x-4 p-4 ${action.color} ${action.hoverColor} rounded-lg transition-standard group`}
          >
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Icon name={action.icon} size={20} color="white" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-white mb-1">
                {action.title}
              </h4>
              <p className="text-xs text-white/80">
                {action.description}
              </p>
            </div>
            
            <Icon 
              name="ArrowRight" 
              size={16} 
              color="white" 
              className="group-hover:translate-x-1 transition-standard" 
            />
          </Link>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-secondary">Need help?</span>
          <button className="text-primary hover:text-primary/80 transition-micro font-medium">
            View Guide
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;