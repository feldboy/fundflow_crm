import React from 'react';

// Determine the correct API base URL (same logic as api.js)
const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  if (import.meta.env.PROD) {
    return 'https://fundflowcrm-production.up.railway.app';
  }
  return 'http://localhost:8000';
};

const EnvDebug = () => {
  const envVars = {
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
    VITE_API_VERSION: import.meta.env.VITE_API_VERSION,
    NODE_ENV: import.meta.env.NODE_ENV,
    MODE: import.meta.env.MODE,
    DEV: import.meta.env.DEV,
    PROD: import.meta.env.PROD
  };

  return (
    <div className="bg-gray-100 p-4 rounded-lg">
      <h3 className="text-lg font-bold mb-2">Environment Variables Debug</h3>
      <pre className="text-sm bg-white p-2 rounded border overflow-auto">
        {JSON.stringify(envVars, null, 2)}
      </pre>
      <div className="mt-2 text-sm">
        <p><strong>Expected API URL:</strong> {`${getApiBaseUrl()}/api/${envVars.VITE_API_VERSION || 'v1'}`}</p>
      </div>
    </div>
  );
};

export default EnvDebug;
