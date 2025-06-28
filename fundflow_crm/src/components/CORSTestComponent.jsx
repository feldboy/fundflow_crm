import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Globe, Server, Clock } from 'lucide-react';

const CORSTestComponent = () => {
  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [backendUrl, setBackendUrl] = useState('https://fundflowcrm-production.up.railway.app');

  const testEndpoints = [
    { path: '/health', method: 'GET', description: 'Health Check' },
    { path: '/cors-info', method: 'GET', description: 'CORS Configuration' },
    { path: '/api/v1/database/status', method: 'GET', description: 'Database Status' },
    { path: '/api/v1/communications/', method: 'GET', description: 'Communications API' }
  ];

  const testCorsEndpoint = async (endpoint) => {
    const startTime = Date.now();
    const url = `${backendUrl}${endpoint.path}`;

    try {
      // Test the actual request
      const response = await fetch(url, {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors', // Explicitly use CORS mode
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      let responseData = null;
      try {
        responseData = await response.json();
      } catch (e) {
        responseData = await response.text();
      }

      return {
        endpoint: endpoint.path,
        description: endpoint.description,
        method: endpoint.method,
        status: response.status,
        success: response.ok,
        duration,
        corsHeaders: {
          'access-control-allow-origin': response.headers.get('access-control-allow-origin'),
          'access-control-allow-methods': response.headers.get('access-control-allow-methods'),
          'access-control-allow-credentials': response.headers.get('access-control-allow-credentials'),
        },
        responseData: typeof responseData === 'string' ? responseData.substring(0, 100) : JSON.stringify(responseData).substring(0, 100),
        error: null
      };
    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;

      return {
        endpoint: endpoint.path,
        description: endpoint.description,
        method: endpoint.method,
        status: 0,
        success: false,
        duration,
        corsHeaders: {},
        responseData: null,
        error: error.message
      };
    }
  };

  const runCorsTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    try {
      const results = [];
      for (const endpoint of testEndpoints) {
        const result = await testCorsEndpoint(endpoint);
        results.push(result);
        setTestResults([...results]); // Update UI incrementally
      }
    } catch (error) {
      console.error('Error running CORS tests:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (result) => {
    if (result.success) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    } else if (result.error && result.error.includes('CORS')) {
      return <XCircle className="h-5 w-5 text-red-500" />;
    } else {
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (result) => {
    if (result.success) return 'bg-green-50 border-green-200';
    if (result.error && result.error.includes('CORS')) return 'bg-red-50 border-red-200';
    return 'bg-yellow-50 border-yellow-200';
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Globe className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-800">CORS Test Dashboard</h2>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Backend URL
          </label>
          <div className="flex space-x-3">
            <input
              type="url"
              value={backendUrl}
              onChange={(e) => setBackendUrl(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://your-backend-url.com"
            />
            <button
              onClick={runCorsTests}
              disabled={isRunning}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isRunning ? (
                <>
                  <Clock className="h-4 w-4 animate-spin" />
                  <span>Testing...</span>
                </>
              ) : (
                <>
                  <Server className="h-4 w-4" />
                  <span>Run CORS Tests</span>
                </>
              )}
            </button>
          </div>
        </div>

        {testResults.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Test Results</h3>
            <div className="grid gap-4">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 border rounded-lg ${getStatusColor(result)}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(result)}
                      <div>
                        <h4 className="font-medium text-gray-800">
                          {result.description}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {result.method} {result.endpoint}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        result.success 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {result.status || 'Failed'}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {result.duration}ms
                      </p>
                    </div>
                  </div>

                  {result.error && (
                    <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded">
                      <p className="text-sm text-red-700">
                        <strong>Error:</strong> {result.error}
                      </p>
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h5 className="font-medium text-gray-700 mb-2">CORS Headers</h5>
                      <div className="space-y-1 text-xs">
                        <div>
                          <span className="font-medium">Origin:</span>{' '}
                          <span className="text-gray-600">
                            {result.corsHeaders['access-control-allow-origin'] || 'Not set'}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">Methods:</span>{' '}
                          <span className="text-gray-600">
                            {result.corsHeaders['access-control-allow-methods'] || 'Not set'}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">Credentials:</span>{' '}
                          <span className="text-gray-600">
                            {result.corsHeaders['access-control-allow-credentials'] || 'Not set'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {result.responseData && (
                      <div>
                        <h5 className="font-medium text-gray-700 mb-2">Response Preview</h5>
                        <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                          {result.responseData}...
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">💡 CORS Troubleshooting Tips</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• If you see CORS errors, check that your backend includes your frontend domain in allowed origins</li>
                <li>• Mixed content errors occur when HTTPS sites try to access HTTP endpoints</li>
                <li>• Check browser developer console (F12) for detailed error messages</li>
                <li>• Ensure your backend is running and accessible at the specified URL</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CORSTestComponent;
