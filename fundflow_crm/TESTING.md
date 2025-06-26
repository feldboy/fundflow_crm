# FundFlow CRM Testing Guide

A comprehensive testing setup for the FundFlow CRM application with both frontend and backend test suites.

## 🧪 Test Coverage

### Frontend Tests
- **Unit Tests**: Component testing with Vitest and React Testing Library
- **Integration Tests**: Full page and workflow testing with MSW for API mocking
- **Performance Tests**: Render performance, memory usage, and user interaction testing
- **Accessibility Tests**: ARIA compliance and keyboard navigation
- **Hook Tests**: Custom React hooks testing

### Backend Tests
- **API Tests**: FastAPI endpoint testing with pytest
- **Database Tests**: MongoDB operations and data validation
- **Service Tests**: Business logic and external service integration
- **Security Tests**: Authentication, authorization, and input validation
- **Performance Tests**: Database query optimization and response times

## 📁 Test Structure

```
src/tests/
├── setup.js                 # Test configuration and global mocks
├── testUtils.js             # Shared testing utilities
├── components/              # Component unit tests
│   ├── App.test.jsx
│   └── ConnectionStatus.test.jsx
├── pages/                   # Page component tests
│   ├── Dashboard.test.jsx
│   └── ClientIntakeForm.test.jsx
├── services/                # Service layer tests
│   ├── api.test.js
│   └── plaintiffService.test.js
├── hooks/                   # Custom hooks tests
│   └── useApi.test.js
├── utils/                   # Utility function tests
│   └── apiUtils.test.js
├── integration/             # Integration tests
│   └── dashboard-case-management.test.jsx
└── performance/             # Performance tests
    └── performance.test.jsx

backend/tests/
├── conftest.py             # Pytest configuration and fixtures
├── test_main.py            # Main application tests
└── api/                    # API endpoint tests
    └── test_plaintiffs.py
```

## 🚀 Running Tests

### Quick Start
```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui
```

### Using the Test Script
```bash
# Make script executable
chmod +x run-tests.sh

# Run all tests
./run-tests.sh

# Run specific test suites
./run-tests.sh frontend
./run-tests.sh backend
./run-tests.sh lint
./run-tests.sh security
```

### Backend Tests
```bash
cd backend

# Create virtual environment (if not exists)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run tests
pytest tests/ -v

# Run with coverage
pytest tests/ --cov=app --cov-report=html
```

## 🛠 Test Configuration

### Frontend (Vitest)
```javascript
// vitest.config.js
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
});
```

### Backend (Pytest)
```python
# pytest.ini
[tool:pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
addopts = -v --tb=short
```

## 📊 Test Patterns

### Component Testing
```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

describe('Component', () => {
  it('should render correctly', () => {
    render(<Component />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('should handle user interactions', () => {
    const handleClick = vi.fn();
    render(<Component onClick={handleClick} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalled();
  });
});
```

### API Testing
```python
class TestPlaintiffsAPI:
    def test_get_all_plaintiffs(self, test_client, auth_headers):
        response = test_client.get("/api/v1/plaintiffs", headers=auth_headers)
        assert response.status_code == 200
        
    def test_create_plaintiff(self, test_client, auth_headers, mock_plaintiff_data):
        response = test_client.post(
            "/api/v1/plaintiffs", 
            json=mock_plaintiff_data,
            headers=auth_headers
        )
        assert response.status_code == 201
```

### Integration Testing
```javascript
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  http.get('/api/v1/plaintiffs', () => {
    return HttpResponse.json([
      { id: 1, firstName: 'John', lastName: 'Doe' }
    ]);
  })
);

describe('Integration Tests', () => {
  beforeEach(() => server.listen());
  afterEach(() => server.resetHandlers());
  
  it('should fetch and display data', async () => {
    render(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });
});
```

## 🎯 Testing Best Practices

### General Guidelines
1. **Test Behavior, Not Implementation**: Focus on what the component does, not how it does it
2. **Use Descriptive Test Names**: Make it clear what each test is verifying
3. **Follow AAA Pattern**: Arrange, Act, Assert
4. **Mock External Dependencies**: Use mocks for API calls, third-party libraries
5. **Test Edge Cases**: Invalid inputs, error states, loading states

### Component Testing
1. **Test User Interactions**: Click events, form submissions, keyboard navigation
2. **Test Accessibility**: Screen reader compatibility, keyboard accessibility
3. **Test Error Boundaries**: Component error handling
4. **Test Responsive Behavior**: Different screen sizes and orientations

### API Testing
1. **Test All HTTP Methods**: GET, POST, PUT, DELETE
2. **Test Authentication**: Protected and public endpoints
3. **Test Validation**: Input validation and error responses
4. **Test Edge Cases**: Empty responses, network errors, timeouts

### Performance Testing
1. **Measure Render Times**: Component mounting and updating
2. **Test Memory Usage**: Memory leaks and cleanup
3. **Test Large Data Sets**: Pagination, virtualization
4. **Test User Interactions**: Debouncing, throttling

## 📈 Coverage Goals

- **Overall Coverage**: > 80%
- **Critical Paths**: > 95%
- **Business Logic**: > 90%
- **UI Components**: > 80%
- **Utility Functions**: > 95%

## 🔧 Debugging Tests

### Frontend
```bash
# Run tests in debug mode
npm run test:debug

# Run specific test file
npm test -- Dashboard.test.jsx

# Run tests matching pattern
npm test -- --grep "should handle"
```

### Backend
```bash
# Run with verbose output
pytest tests/ -v -s

# Run specific test
pytest tests/test_main.py::TestHealthEndpoints::test_root_endpoint

# Run with debugger
pytest tests/ --pdb
```

## 🚨 Common Issues

### Frontend
1. **Module Not Found**: Check import paths and aliases
2. **Component Not Rendering**: Verify test setup and mocks
3. **Async Tests Failing**: Use `waitFor` and proper async/await

### Backend
1. **Database Connection**: Ensure test database is configured
2. **Import Errors**: Check Python path and module structure
3. **Async Tests**: Use `pytest-asyncio` for async functions

## 📝 Adding New Tests

### Frontend Component Test
1. Create test file: `ComponentName.test.jsx`
2. Import testing utilities
3. Mock dependencies
4. Write test cases
5. Update test coverage

### Backend API Test
1. Create test file: `test_endpoint.py`
2. Use test fixtures
3. Mock database operations
4. Test all scenarios
5. Verify response format

## 🔄 Continuous Integration

The test suite is designed to run in CI/CD pipelines:

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Setup Python
        uses: actions/setup-python@v2
        with:
          python-version: '3.9'
      - name: Run tests
        run: ./run-tests.sh
```

## 📞 Support

For questions about testing:
1. Check existing test examples
2. Review testing documentation
3. Ask team members for guidance
4. Create test-specific issues

---

**Happy Testing! 🧪✨**
