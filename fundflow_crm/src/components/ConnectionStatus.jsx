import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Wifi, WifiOff } from 'lucide-react';
import { healthCheck, testConnection } from '../services';

const ConnectionStatus = ({ className = '' }) => {
  const [status, setStatus] = useState('checking'); // 'checking', 'connected', 'disconnected', 'error'
  const [lastChecked, setLastChecked] = useState(null);
  const [error, setError] = useState(null);

  const checkConnection = async () => {
    try {
      setStatus('checking');
      setError(null);
      
      // Test both health check and API connection
      const [healthResult, apiResult] = await Promise.all([
        healthCheck(),
        testConnection()
      ]);
      
      if (healthResult.status === 'healthy' && apiResult.message) {
        setStatus('connected');
      } else {
        setStatus('disconnected');
      }
      
      setLastChecked(new Date());
    } catch (err) {
      setStatus('error');
      setError(err.message);
      setLastChecked(new Date());
    }
  };

  useEffect(() => {
    checkConnection();
    
    // Check connection every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return 'text-green-600';
      case 'disconnected':
      case 'error':
        return 'text-red-600';
      case 'checking':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-4 h-4" />;
      case 'disconnected':
        return <WifiOff className="w-4 h-4" />;
      case 'error':
        return <AlertCircle className="w-4 h-4" />;
      case 'checking':
        return <Wifi className="w-4 h-4 animate-pulse" />;
      default:
        return <Wifi className="w-4 h-4" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected':
        return 'Backend Connected';
      case 'disconnected':
        return 'Backend Disconnected';
      case 'error':
        return 'Connection Error';
      case 'checking':
        return 'Checking Connection...';
      default:
        return 'Unknown Status';
    }
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`flex items-center space-x-1 ${getStatusColor()}`}>
        {getStatusIcon()}
        <span className="text-sm font-medium">{getStatusText()}</span>
      </div>
      
      {lastChecked && (
        <span className="text-xs text-gray-500">
          Last checked: {lastChecked.toLocaleTimeString()}
        </span>
      )}
      
      {error && (
        <div className="text-xs text-red-600 max-w-xs truncate" title={error}>
          Error: {error}
        </div>
      )}
      
      <button
        onClick={checkConnection}
        className="text-xs text-blue-600 hover:text-blue-800 underline"
        disabled={status === 'checking'}
      >
        {status === 'checking' ? 'Checking...' : 'Refresh'}
      </button>
    </div>
  );
};

export default ConnectionStatus;
