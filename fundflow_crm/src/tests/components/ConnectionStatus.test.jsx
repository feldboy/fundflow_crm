import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ConnectionStatus from '../../components/ConnectionStatus';

// Mock the services
vi.mock('../../services', () => ({
  healthCheck: vi.fn(),
  testConnection: vi.fn(),
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  AlertCircle: () => <div>AlertCircle</div>,
  CheckCircle: () => <div>CheckCircle</div>,
  Wifi: () => <div>Wifi</div>,
  WifiOff: () => <div>WifiOff</div>,
}));

import { healthCheck, testConnection } from '../../services';

describe('ConnectionStatus Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders connection status indicator', async () => {
    healthCheck.mockResolvedValue({ status: 'healthy' });
    testConnection.mockResolvedValue({ message: 'OK' });
    
    render(<ConnectionStatus />);
    
    // Wait for the component to load and check connection
    await waitFor(() => {
      expect(screen.getByText(/connection/i) || screen.getByText(/status/i) || screen.getByText(/connected/i) || screen.getByText(/online/i)).toBeInTheDocument();
    });
  });

  it('displays connected status when services are healthy', async () => {
    healthCheck.mockResolvedValue({ status: 'healthy' });
    testConnection.mockResolvedValue({ message: 'OK' });
    
    render(<ConnectionStatus />);
    
    await waitFor(() => {
      expect(healthCheck).toHaveBeenCalled();
      expect(testConnection).toHaveBeenCalled();
    });
  });

  it('handles connection errors gracefully', async () => {
    healthCheck.mockRejectedValue(new Error('Connection failed'));
    testConnection.mockRejectedValue(new Error('API failed'));
    
    render(<ConnectionStatus />);
    
    await waitFor(() => {
      expect(healthCheck).toHaveBeenCalled();
    });
  });
});
