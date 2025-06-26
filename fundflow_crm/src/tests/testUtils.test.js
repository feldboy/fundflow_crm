import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';

// Test utilities for common testing patterns
export const renderWithRouter = (ui, options = {}) => {
  const { initialEntries = ['/'], ...renderOptions } = options;
  
  const Wrapper = ({ children }) => React.createElement(
    BrowserRouter,
    null,
    children
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

export const mockApiResponse = (data, delay = 0) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ data }), delay);
  });
};

export const mockApiError = (error, delay = 0) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => reject(error), delay);
  });
};

// Mock component for testing
const TestComponent = ({ onClick, children }) => React.createElement(
  'div',
  { 'data-testid': 'test-component', onClick },
  children
);

describe('Test Utilities', () => {
  it('should create mock API response correctly', async () => {
    const testData = { id: 1, name: 'Test' };
    const response = await mockApiResponse(testData, 10);
    
    expect(response.data).toEqual(testData);
  });

  it('should create mock API error correctly', async () => {
    const testError = new Error('Test error');
    
    await expect(mockApiError(testError, 10)).rejects.toThrow('Test error');
  });

  it('should handle basic component rendering', () => {
    render(React.createElement(TestComponent, null, 'Test Content'));
    expect(screen.getByTestId('test-component')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should handle component interactions', () => {
    const handleClick = vi.fn();
    render(
      React.createElement(TestComponent, { onClick: handleClick }, 'Clickable Content')
    );

    const component = screen.getByTestId('test-component');
    fireEvent.click(component);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});

// Form testing utilities
export const fillFormField = (fieldName, value) => {
  const field = screen.getByTestId(fieldName) || screen.getByLabelText(new RegExp(fieldName, 'i'));
  fireEvent.change(field, { target: { value } });
  return field;
};

export const submitForm = (formTestId = 'form') => {
  const form = screen.getByTestId(formTestId);
  fireEvent.submit(form);
  return form;
};

export const expectFormError = (fieldName, errorMessage) => {
  const errorElement = screen.getByTestId(`${fieldName}-error`) || 
                      screen.getByText(errorMessage);
  expect(errorElement).toBeInTheDocument();
};

// API mocking utilities
export const createMockApiService = (responses) => {
  const mock = {};
  
  Object.keys(responses).forEach(method => {
    mock[method] = vi.fn().mockImplementation((url, data) => {
      const response = responses[method][url];
      if (response instanceof Error) {
        return Promise.reject(response);
      }
      return Promise.resolve(response);
    });
  });
  
  return mock;
};

describe('Testing Utilities Functions', () => {
  it('should create mock API service correctly', () => {
    const mockService = createMockApiService({
      get: {
        '/users': { data: [{ id: 1, name: 'John' }] },
        '/users/1': { data: { id: 1, name: 'John' } }
      },
      post: {
        '/users': new Error('Validation failed')
      }
    });

    expect(mockService.get).toBeDefined();
    expect(mockService.post).toBeDefined();
    expect(typeof mockService.get).toBe('function');
    expect(typeof mockService.post).toBe('function');
  });
});
