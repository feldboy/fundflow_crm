import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Icon from 'components/AppIcon';
import Breadcrumb from 'components/ui/Breadcrumb';
import FundingCalculator from './components/FundingCalculator';
import ReportingDashboard from './components/ReportingDashboard';
import CommissionCalculator from './components/CommissionCalculator';
import CashFlowProjections from './components/CashFlowProjections';

const FinancialCalculatorReporting = () => {
  const [activeTab, setActiveTab] = useState('calculator');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const tabs = [
    { id: 'calculator', label: 'Funding Calculator', icon: 'Calculator' },
    { id: 'reports', label: 'Reports & Analytics', icon: 'BarChart3' },
    { id: 'commission', label: 'Commission Tools', icon: 'DollarSign' },
    { id: 'cashflow', label: 'Cash Flow', icon: 'TrendingUp' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'calculator':
        return <FundingCalculator />;
      case 'reports':
        return <ReportingDashboard />;
      case 'commission':
        return <CommissionCalculator />;
      case 'cashflow':
        return <CashFlowProjections />;
      default:
        return <FundingCalculator />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Breadcrumb />
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-text-primary mb-2">
                Financial Calculator & Reporting
              </h1>
              <p className="text-text-secondary">
                Comprehensive funding calculations, profit analysis, and business intelligence
              </p>
            </div>
            
            <div className="hidden md:flex items-center space-x-4">
              <button className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-micro">
                <Icon name="Download" size={16} />
                <span>Export Report</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 border border-border text-text-primary rounded-lg hover:bg-background transition-micro">
                <Icon name="Settings" size={16} />
                <span>Settings</span>
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          {isMobile ? (
            <div className="relative">
              <select
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-lg bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {tabs.map((tab) => (
                  <option key={tab.id} value={tab.id}>
                    {tab.label}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex space-x-1 bg-background border border-border rounded-lg p-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-micro ${
                    activeTab === tab.id
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface'
                  }`}
                >
                  <Icon name={tab.icon} size={16} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderContent()}
        </motion.div>
      </div>
    </div>
  );
};

export default FinancialCalculatorReporting;