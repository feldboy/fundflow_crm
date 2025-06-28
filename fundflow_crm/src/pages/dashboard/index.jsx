import React, { useState, useEffect, useCallback } from 'react';
import Icon from 'components/AppIcon';
import Breadcrumb from 'components/ui/Breadcrumb';
import KPICards from './components/KPICards';
import FundingPipelineChart from './components/FundingPipelineChart';
import CaseStatusChart from './components/CaseStatusChart';
import MonthlyPerformanceChart from './components/MonthlyPerformanceChart';
import RecentActivity from './components/RecentActivity';
import UrgentTasks from './components/UrgentTasks';
import QuickActions from './components/QuickActions';
import CaseStatusSummary from './components/CaseStatusSummary';
import DatabaseStatus from '../../components/DatabaseStatus';
import EnvDebug from '../../components/EnvDebug';
import CORSTestComponent from '../../components/CORSTestComponent';
import APIDebugComponent from '../../components/APIDebugComponent';
import { plaintiffService, communicationService } from '../../services';
import { useApiOnMount } from '../../hooks/useApi';

const Dashboard = () => {
  const [dateRange, setDateRange] = useState('30');
  const [isLoading, setIsLoading] = useState(false);

  // Fetch dashboard data using custom hooks
  const { 
    data: plaintiffStats, 
    loading: plaintiffStatsLoading, 
    error: plaintiffStatsError,
    refetch: refetchPlaintiffStats 
  } = useApiOnMount(plaintiffService.getStats);

  const getCommunicationsWithParams = useCallback(() => 
    communicationService.getAll({ limit: 10, sort: 'createdAt', order: 'desc' }), []
  );

  const { 
    data: recentCommunications, 
    loading: communicationsLoading,
    error: communicationsError,
    refetch: refetchCommunications 
  } = useApiOnMount(getCommunicationsWithParams);

  const handleDateRangeChange = async (range) => {
    setIsLoading(true);
    setDateRange(range);
    
    try {
      // Refetch data with new date range
      await Promise.all([
        refetchPlaintiffStats(),
        refetchCommunications()
      ]);
    } catch (error) {
      console.error('Error refreshing dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const dateRangeOptions = [
    { value: '7', label: 'Last 7 days' },
    { value: '30', label: 'Last 30 days' },
    { value: '90', label: 'Last 90 days' },
    { value: '365', label: 'Last year' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <Breadcrumb />
          
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-text-primary mb-2">Dashboard</h1>
              <p className="text-text-secondary">
                Comprehensive overview of your pre-settlement funding operations
              </p>
            </div>
            
            {/* Date Range Filter */}
            <div className="mt-4 lg:mt-0">
              <div className="flex items-center space-x-2">
                <Icon name="Calendar" size={20} className="text-text-secondary" />
                <select
                  value={dateRange}
                  onChange={(e) => handleDateRangeChange(e.target.value)}
                  className="px-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-surface"
                >
                  {dateRangeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Loading Overlay */}
          {(isLoading || plaintiffStatsLoading || communicationsLoading) && (
            <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
              <div className="bg-surface p-6 rounded-lg shadow-overlay flex items-center space-x-3">
                <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full"></div>
                <span className="text-text-primary">
                  {isLoading ? 'Updating data...' : 'Loading dashboard data...'}
                </span>
              </div>
            </div>
          )}

          {/* Error Messages */}
          {(plaintiffStatsError || communicationsError) && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <Icon name="AlertCircle" size={20} className="text-red-500" />
                <span className="text-red-700 font-medium">Error loading dashboard data</span>
              </div>
              {plaintiffStatsError && (
                <p className="text-red-600 text-sm mt-1">Plaintiff stats: {plaintiffStatsError}</p>
              )}
              {communicationsError && (
                <p className="text-red-600 text-sm mt-1">Communications: {communicationsError}</p>
              )}
              <button
                onClick={() => {
                  refetchPlaintiffStats();
                  refetchCommunications();
                }}
                className="mt-2 px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
              >
                Retry
              </button>
            </div>
          )}

          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* Left Sidebar - Case Status Summary */}
            <div className="xl:col-span-2 order-2 xl:order-1">
              <CaseStatusSummary />
            </div>

            {/* Main Content Area */}
            <div className="xl:col-span-7 order-1 xl:order-2 space-y-6">
              {/* KPI Cards */}
              <KPICards dateRange={dateRange} data={plaintiffStats} />

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FundingPipelineChart dateRange={dateRange} data={plaintiffStats} />
                <CaseStatusChart dateRange={dateRange} data={plaintiffStats} />
              </div>

              {/* Monthly Performance Chart */}
              <MonthlyPerformanceChart dateRange={dateRange} data={plaintiffStats} />
            </div>

            {/* Right Sidebar */}
            <div className="xl:col-span-3 order-3 space-y-6">
              {/* Debug components - Development only */}
              {import.meta.env.DEV && (
                <>
                  <APIDebugComponent />
                  <EnvDebug />
                </>
              )}
              <DatabaseStatus />
              {/* CORS Test Component - Development Tool */}
              {import.meta.env.DEV && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-yellow-800 mb-2">🧪 Development Tools</h3>
                  <CORSTestComponent />
                </div>
              )}
              <QuickActions />
              <UrgentTasks />
              <RecentActivity data={recentCommunications} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;