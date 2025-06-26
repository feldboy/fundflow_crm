import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

// Mock the actual App component since we might have dependency issues
vi.mock('../App', () => ({
  default: () => React.createElement('div', { 'data-testid': 'app' }, 'FundFlow CRM App')
}));

// Simple component for testing React integration
const TestComponent = ({ title, onClick }) => {
  return React.createElement(
    'div',
    { 'data-testid': 'test-component' },
    React.createElement('h1', null, title),
    React.createElement('button', { onClick, 'data-testid': 'test-button' }, 'Click me')
  );
};

describe('React Testing Setup', () => {
  it('should render React components', () => {
    render(React.createElement(TestComponent, { title: 'Test Title' }));
    
    expect(screen.getByTestId('test-component')).toBeInTheDocument();
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('should handle component props', () => {
    const props = {
      title: 'Custom Title',
      onClick: vi.fn()
    };
    
    render(React.createElement(TestComponent, props));
    
    expect(screen.getByText('Custom Title')).toBeInTheDocument();
    
    const button = screen.getByTestId('test-button');
    button.click();
    
    expect(props.onClick).toHaveBeenCalledTimes(1);
  });

  it('should handle missing props gracefully', () => {
    render(React.createElement(TestComponent, {}));
    
    expect(screen.getByTestId('test-component')).toBeInTheDocument();
    expect(screen.getByTestId('test-button')).toBeInTheDocument();
  });
});

describe('Testing Library Matchers', () => {
  it('should have access to testing-library matchers', () => {
    render(React.createElement('div', { 'data-testid': 'test-div' }, 'Hello World'));
    
    const element = screen.getByTestId('test-div');
    
    // These matchers come from @testing-library/jest-dom
    expect(element).toBeInTheDocument();
    expect(element).toBeVisible();
    expect(element).toHaveTextContent('Hello World');
  });

  it('should work with form elements', () => {
    render(
      React.createElement(
        'form',
        null,
        React.createElement('input', {
          'data-testid': 'test-input',
          defaultValue: 'test value',
          disabled: false
        }),
        React.createElement('input', {
          'data-testid': 'disabled-input',
          disabled: true
        })
      )
    );
    
    const input = screen.getByTestId('test-input');
    const disabledInput = screen.getByTestId('disabled-input');
    
    expect(input).toHaveValue('test value');
    expect(input).not.toBeDisabled();
    expect(disabledInput).toBeDisabled();
  });
});
