import React from 'react';

const APIDebugComponent = () => {
  const getApiBaseUrl = () => {
    if (import.meta.env.VITE_API_BASE_URL) {
      return import.meta.env.VITE_API_BASE_URL.replace(/^http:\/\//, 'https://'); // Ensure HTTPS
    }
    if (import.meta.env.PROD) {
      return 'https://fundflowcrm-production.up.railway.app';
    }
    return 'https://localhost:8000'; // Default to HTTPS
  };

  const apiUrl = `${getApiBaseUrl()}/api/${import.meta.env.VITE_API_VERSION || 'v1'}`;

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
      <h3 className="text-lg font-bold text-red-800 mb-2">🚨 API URL Debug</h3>
      <div className="space-y-2 text-sm">
        <div><strong>Environment Variables:</strong></div>
        <div>VITE_API_BASE_URL: <code className="bg-gray-100 px-1 rounded">{import.meta.env.VITE_API_BASE_URL || 'NOT SET'}</code></div>
        <div>VITE_API_VERSION: <code className="bg-gray-100 px-1 rounded">{import.meta.env.VITE_API_VERSION || 'NOT SET'}</code></div>
        <div>MODE: <code className="bg-gray-100 px-1 rounded">{import.meta.env.MODE}</code></div>
        <div>PROD: <code className="bg-gray-100 px-1 rounded">{import.meta.env.PROD ? 'true' : 'false'}</code></div>
        <div>DEV: <code className="bg-gray-100 px-1 rounded">{import.meta.env.DEV ? 'true' : 'false'}</code></div>
        <div className="mt-3"><strong>Computed API URL:</strong></div>
        <div className={`font-mono text-sm p-2 rounded ${apiUrl.startsWith('https://') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {apiUrl}
        </div>
        {!apiUrl.startsWith('https://') && (
          <div className="text-red-600 font-medium">
            ⚠️ API URL is not HTTPS - this will cause mixed content errors!
          </div>
        )}
      </div>
    </div>
  );
};

export default APIDebugComponent;
