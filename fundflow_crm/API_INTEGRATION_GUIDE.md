# API Service Integration Guide

This document explains how the frontend connects to the backend API using the service layer architecture.

## Architecture Overview

The frontend uses a service layer pattern to communicate with the FastAPI backend. This includes:

- **API Client Configuration** (`src/services/api.js`)
- **Service Modules** for each API endpoint
- **Custom React Hooks** for API state management
- **Utility Functions** for common operations

## Configuration

### Environment Variables

Add these variables to your `.env` file:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_API_VERSION=v1
```

### Backend Setup

Make sure your FastAPI backend is running on `http://localhost:8000` with the following endpoints:

- `/health` - Health check
- `/api/v1/plaintiffs` - Plaintiff management
- `/api/v1/law-firms` - Law firm management
- `/api/v1/employees` - Employee management
- `/api/v1/communications` - Communication management
- `/api/v1/documents` - Document management
- `/api/v1/ai` - AI services
- `/api/v1/google` - Google services

## Service Modules

### 1. Basic API Client

```javascript
import { apiClient, healthCheck, testConnection } from '../services';

// Test backend connection
const checkBackend = async () => {
  try {
    const health = await healthCheck();
    const api = await testConnection();
    console.log('Backend is connected:', health, api);
  } catch (error) {
    console.error('Backend connection failed:', error);
  }
};
```

### 2. Plaintiff Service

```javascript
import { plaintiffService } from '../services';

// Get all plaintiffs
const plaintiffs = await plaintiffService.getAll();

// Get plaintiff by ID
const plaintiff = await plaintiffService.getById('123');

// Create new plaintiff
const newPlaintiff = await plaintiffService.create({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  phone: '+1234567890',
  caseType: 'personal_injury'
});

// Update plaintiff
const updatedPlaintiff = await plaintiffService.update('123', {
  status: 'approved'
});

// Delete plaintiff
await plaintiffService.delete('123');

// Search plaintiffs
const searchResults = await plaintiffService.search('john');

// Get statistics
const stats = await plaintiffService.getStats();
```

### 3. AI Services

```javascript
import { aiService } from '../services';

// Risk Assessment
const riskAnalysis = await aiService.riskAssessment.analyzeCase({
  caseType: 'personal_injury',
  injuryType: 'back_injury',
  medicalExpenses: 50000,
  estimatedSettlement: 200000
});

// Document Analysis
const documentAnalysis = await aiService.documentAnalysis.analyzeDocument('doc123');

// Contract Generation
const contract = await aiService.contractGeneration.generateContract({
  plaintiffId: '123',
  fundingAmount: 10000,
  interestRate: 0.15
});

// Communication Drafting
const draftedEmail = await aiService.communicationDrafting.draftEmail({
  recipientType: 'plaintiff',
  purpose: 'status_update',
  caseDetails: { plaintiffName: 'John Doe', status: 'approved' }
});
```

### 4. Document Management

```javascript
import { documentService } from '../services';

// Upload document
const formData = new FormData();
formData.append('file', file);
formData.append('plaintiffId', '123');
formData.append('documentType', 'medical_record');

const uploadedDoc = await documentService.upload(formData, (progress) => {
  console.log('Upload progress:', progress.loaded / progress.total * 100 + '%');
});

// Download document
const fileBlob = await documentService.download('doc123');

// Get documents by plaintiff
const plaintiffDocs = await documentService.getByPlaintiffId('123');
```

### 5. Google Services

```javascript
import { googleService } from '../services';

// Validate address
const validation = await googleService.validateAddress('123 Main St, New York, NY');

// Geocode address
const coordinates = await googleService.geocodeAddress('123 Main St, New York, NY');

// Get directions
const directions = await googleService.getDirections(
  '123 Main St, New York, NY',
  '456 Oak Ave, Brooklyn, NY'
);
```

## React Hooks

### 1. useApi - Basic API Calls

```javascript
import { useApi } from '../hooks/useApi';
import { plaintiffService } from '../services';

const MyComponent = () => {
  const { data, loading, error, execute } = useApi(plaintiffService.getById);

  const loadPlaintiff = async (id) => {
    try {
      const plaintiff = await execute(id);
      console.log('Loaded plaintiff:', plaintiff);
    } catch (error) {
      console.error('Failed to load plaintiff:', error);
    }
  };

  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {data && <p>Plaintiff: {data.firstName} {data.lastName}</p>}
      <button onClick={() => loadPlaintiff('123')}>Load Plaintiff</button>
    </div>
  );
};
```

### 2. useApiOnMount - Auto-loading Data

```javascript
import { useApiOnMount } from '../hooks/useApi';
import { plaintiffService } from '../services';

const PlaintiffList = () => {
  const { data: plaintiffs, loading, error, refetch } = useApiOnMount(
    () => plaintiffService.getAll()
  );

  if (loading) return <div>Loading plaintiffs...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <button onClick={refetch}>Refresh</button>
      {plaintiffs?.map(plaintiff => (
        <div key={plaintiff.id}>
          {plaintiff.firstName} {plaintiff.lastName}
        </div>
      ))}
    </div>
  );
};
```

### 3. useApiSubmit - Form Submissions

```javascript
import { useApiSubmit } from '../hooks/useApi';
import { plaintiffService } from '../services';

const PlaintiffForm = () => {
  const { submit, loading, error, success, reset } = useApiSubmit(
    plaintiffService.create
  );

  const handleSubmit = async (formData) => {
    try {
      const newPlaintiff = await submit(formData);
      console.log('Created:', newPlaintiff);
      // Form will be reset automatically
    } catch (error) {
      console.error('Submission failed:', error);
    }
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      handleSubmit(Object.fromEntries(formData));
    }}>
      <input name="firstName" placeholder="First Name" required />
      <input name="lastName" placeholder="Last Name" required />
      <input name="email" type="email" placeholder="Email" required />
      
      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Plaintiff'}
      </button>
      
      {error && <p style={{color: 'red'}}>Error: {error}</p>}
      {success && <p style={{color: 'green'}}>Plaintiff created successfully!</p>}
    </form>
  );
};
```

### 4. usePaginatedApi - Paginated Data

```javascript
import { usePaginatedApi } from '../hooks/useApi';
import { plaintiffService } from '../services';

const PaginatedPlaintiffs = () => {
  const {
    data: plaintiffs,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    updateFilters,
    filters
  } = usePaginatedApi(plaintiffService.getAll, { status: 'active' });

  const handleSearch = (searchTerm) => {
    updateFilters({ ...filters, search: searchTerm });
  };

  return (
    <div>
      <input
        placeholder="Search..."
        onChange={(e) => handleSearch(e.target.value)}
      />
      
      {plaintiffs.map(plaintiff => (
        <div key={plaintiff.id}>
          {plaintiff.firstName} {plaintiff.lastName}
        </div>
      ))}
      
      {hasMore && (
        <button onClick={loadMore} disabled={loading}>
          {loading ? 'Loading...' : 'Load More'}
        </button>
      )}
      
      {error && <p>Error: {error}</p>}
      
      <button onClick={refresh}>Refresh All</button>
    </div>
  );
};
```

## Error Handling

The API client includes automatic error handling:

```javascript
import { handleApiError } from '../utils/apiUtils';

try {
  const result = await plaintiffService.create(data);
} catch (error) {
  const userFriendlyMessage = handleApiError(error, 'Creating Plaintiff');
  // Display userFriendlyMessage to user
}
```

## Connection Status

Monitor backend connection status:

```javascript
import ConnectionStatus from '../components/ConnectionStatus';

const App = () => {
  return (
    <div>
      <ConnectionStatus />
      {/* Rest of your app */}
    </div>
  );
};
```

## Authentication

The API client automatically handles authentication tokens:

```javascript
// Set token (usually done during login)
localStorage.setItem('authToken', 'your-jwt-token');

// All subsequent API calls will include the token
// If token expires (401 response), user is redirected to login

// Remove token (during logout)
localStorage.removeItem('authToken');
```

## Best Practices

### 1. Error Handling
Always handle errors gracefully:

```javascript
const { data, loading, error } = useApiOnMount(apiCall);

if (error) {
  return <ErrorComponent message={error} onRetry={refetch} />;
}
```

### 2. Loading States
Show loading indicators:

```javascript
if (loading) {
  return <LoadingSpinner />;
}
```

### 3. Optimistic Updates
For better UX, update UI immediately then sync with backend:

```javascript
const handleToggleStatus = async (plaintiffId) => {
  // Update UI immediately
  setPlaintiffs(prev => prev.map(p => 
    p.id === plaintiffId ? { ...p, status: p.status === 'active' ? 'inactive' : 'active' } : p
  ));
  
  try {
    // Sync with backend
    await plaintiffService.update(plaintiffId, { status: newStatus });
  } catch (error) {
    // Revert on error
    setPlaintiffs(prev => prev.map(p => 
      p.id === plaintiffId ? { ...p, status: originalStatus } : p
    ));
  }
};
```

### 4. Caching
Use the built-in cache for frequently accessed data:

```javascript
import { cache } from '../utils/apiUtils';

// Check cache first
const cachedData = cache.get('plaintiffs-list');
if (cachedData) {
  return cachedData;
}

// Fetch and cache
const data = await plaintiffService.getAll();
cache.set('plaintiffs-list', data, 10 * 60 * 1000); // Cache for 10 minutes
```

## Testing

Test your API integration:

```javascript
// Test backend connection
import { testConnection, healthCheck } from '../services';

const testBackendConnection = async () => {
  try {
    await Promise.all([testConnection(), healthCheck()]);
    console.log('✅ Backend connection successful');
  } catch (error) {
    console.error('❌ Backend connection failed:', error);
  }
};
```

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure backend CORS is configured for `http://localhost:3000`
2. **404 Errors**: Check API endpoint URLs in service files
3. **401 Errors**: Verify authentication token is set correctly
4. **Network Errors**: Ensure backend is running on correct port

### Debug Mode

Enable debug logging:

```javascript
// In api.js, add request logging
apiClient.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url, config.data);
    return config;
  }
);
```
