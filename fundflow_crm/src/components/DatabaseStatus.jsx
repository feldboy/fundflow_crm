import React, { useState, useEffect } from 'react';
import Icon from 'components/AppIcon';
import apiClient from '../services/api';

const DatabaseStatus = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDatabaseStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.get('/database/health');
      setStatus(response.data);
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch database status:', err);
    } finally {
      setLoading(false);
    }
  };

  const initializeDatabase = async () => {
    try {
      setLoading(true);
      await apiClient.post('/database/init');
      await fetchDatabaseStatus(); // Refresh status
    } catch (err) {
      setError('Failed to initialize database');
      console.error('Failed to initialize database:', err);
    } finally {
      setLoading(false);
    }
  };

  const seedDatabase = async () => {
    try {
      setLoading(true);
      await apiClient.post('/database/seed');
      await fetchDatabaseStatus(); // Refresh status
    } catch (err) {
      setError('Failed to seed database');
      console.error('Failed to seed database:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatabaseStatus();
  }, []);

  if (loading && !status) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-3">
          <Icon name="spinner" className="w-5 h-5 animate-spin text-blue-500" />
          <span className="text-sm text-gray-600">Checking database status...</span>
        </div>
      </div>
    );
  }

  const getStatusColor = () => {
    if (!status) return 'gray';
    switch (status.status) {
      case 'connected': return 'green';
      case 'mock': return 'yellow';
      case 'error': return 'red';
      default: return 'gray';
    }
  };

  const getStatusIcon = () => {
    if (!status) return 'question-mark-circle';
    switch (status.status) {
      case 'connected': return 'check-circle';
      case 'mock': return 'exclamation-triangle';
      case 'error': return 'x-circle';
      default: return 'question-mark-circle';
    }
  };

  const statusColor = getStatusColor();
  const statusIcon = getStatusIcon();

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Database Status</h3>
          <button
            onClick={fetchDatabaseStatus}
            disabled={loading}
            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
            title="Refresh status"
          >
            <Icon name="arrow-path" className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Status Indicator */}
          <div className="flex items-center space-x-3">
            <Icon 
              name={statusIcon} 
              className={`w-6 h-6 text-${statusColor}-500`} 
            />
            <div>
              <div className={`text-sm font-medium text-${statusColor}-600`}>
                {status?.status === 'connected' && 'Connected to MongoDB Atlas'}
                {status?.status === 'mock' && 'Using Mock Database'}
                {status?.status === 'error' && 'Database Connection Failed'}
                {!status && 'Unknown Status'}
              </div>
              <div className="text-xs text-gray-500">
                {status?.message || 'No status information available'}
              </div>
            </div>
          </div>

          {/* Collection Information */}
          {status?.collections && Object.keys(status.collections).length > 0 && (
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Collections</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(status.collections).map(([name, count]) => (
                  <div key={name} className="flex justify-between">
                    <span className="text-gray-600">{name}:</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="border-t pt-4">
              <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                {error}
              </div>
            </div>
          )}

          {/* Actions */}
          {status?.status === 'connected' && (
            <div className="border-t pt-4 space-y-2">
              <button
                onClick={initializeDatabase}
                disabled={loading}
                className="w-full text-xs bg-blue-50 text-blue-700 py-2 px-3 rounded hover:bg-blue-100 disabled:opacity-50"
              >
                Initialize Collections
              </button>
              
              {Object.keys(status.collections || {}).length === 0 && (
                <button
                  onClick={seedDatabase}
                  disabled={loading}
                  className="w-full text-xs bg-green-50 text-green-700 py-2 px-3 rounded hover:bg-green-100 disabled:opacity-50"
                >
                  Seed Sample Data
                </button>
              )}
            </div>
          )}

          {/* Mock Database Warning */}
          {status?.status === 'mock' && (
            <div className="border-t pt-4">
              <div className="text-xs text-yellow-700 bg-yellow-50 p-3 rounded">
                <Icon name="exclamation-triangle" className="w-4 h-4 inline mr-1" />
                Data will not persist! Configure MongoDB connection.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DatabaseStatus;
