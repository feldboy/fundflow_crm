import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../../App';

// Mock the components to avoid complex dependencies
vi.mock('../../components/ConnectionStatus', () => ({
  default: () => <div data-testid="connection-status">Connection Status</div>,
}));

vi.mock('../../Routes', () => ({
  default: () => <div data-testid="routes">Routes</div>,
}));

const renderApp = () => {
  return render(<App />);
};

describe('App Component', () => {
  it('renders without crashing', () => {
    renderApp();
    expect(screen.getByTestId('connection-status')).toBeInTheDocument();
    expect(screen.getByTestId('routes')).toBeInTheDocument();
  });

  it('has correct CSS classes applied', () => {
    const { container } = renderApp();
    const appDiv = container.firstChild;
    
    expect(appDiv).toHaveClass('min-h-screen', 'bg-gray-50');
  });

  it('renders connection status bar with correct styling', () => {
    renderApp();
    const connectionStatusContainer = screen.getByTestId('connection-status').parentElement;
    
    expect(connectionStatusContainer).toHaveClass(
      'bg-white',
      'border-b',
      'border-gray-200',
      'px-4',
      'py-2'
    );
  });

  it('renders main application routes', () => {
    renderApp();
    expect(screen.getByTestId('routes')).toBeInTheDocument();
  });
});
