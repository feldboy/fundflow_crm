import React from 'react';
import Icon from 'components/AppIcon';

const FormProgress = ({ tabs, activeTab, onTabClick, overallProgress }) => {
  return (
    <div className="bg-surface border border-border rounded-lg p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-text-primary mb-2">Form Progress</h3>
        <div className="w-full bg-border rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-standard"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
        <p className="text-sm text-text-secondary mt-2">
          {Math.round(overallProgress)}% Complete
        </p>
      </div>

      <nav className="space-y-2">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            onClick={() => onTabClick(tab.id)}
            className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-micro ${
              activeTab === tab.id
                ? 'bg-primary text-white'
                : tab.completed
                ? 'bg-success/10 text-success hover:bg-success/20' :'text-text-secondary hover:text-text-primary hover:bg-background'
            }`}
          >
            <div className="flex-shrink-0">
              {tab.completed ? (
                <Icon name="CheckCircle" size={20} />
              ) : (
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-medium ${
                  activeTab === tab.id
                    ? 'border-white text-white' :'border-text-secondary text-text-secondary'
                }`}>
                  {index + 1}
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="font-medium">{tab.label}</div>
              {tab.completed && (
                <div className="text-xs opacity-80">Completed</div>
              )}
            </div>
            <Icon 
              name={tab.id === activeTab ? "ChevronDown" : "ChevronRight"} 
              size={16} 
              className="flex-shrink-0"
            />
          </button>
        ))}
      </nav>

      <div className="mt-6 p-4 bg-accent/10 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <Icon name="Info" size={16} className="text-accent" />
          <span className="text-sm font-medium text-text-primary">Quick Tips</span>
        </div>
        <ul className="text-xs text-text-secondary space-y-1">
          <li>• Complete all required fields in each section</li>
          <li>• Form auto-saves every 3 seconds</li>
          <li>• AI assessment updates as you progress</li>
          <li>• Upload documents for faster processing</li>
        </ul>
      </div>
    </div>
  );
};

export default FormProgress;