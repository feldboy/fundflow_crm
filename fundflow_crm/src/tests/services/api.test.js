import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';

// Mock axios
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    })),
    get: vi.fn(),
  },
}));

const mockedAxios = vi.mocked(axios);

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
    localStorage.clear();
  });

  it('should create axios instance with correct configuration', async () => {
    // Import after mocking
    const { default: apiClient } = await import('../../services/api');
    
    expect(mockedAxios.create).toHaveBeenCalledWith({
      baseURL: 'http://localhost:8001/api/v1',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  });

  it('should export healthCheck function', async () => {
    const { healthCheck } = await import('../../services/api');
    
    mockedAxios.get.mockResolvedValue({ data: { status: 'healthy' } });
    
    const result = await healthCheck();
    expect(result).toEqual({ status: 'healthy' });
    expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:8001/health');
  });

  it('should export testConnection function', async () => {
    const { testConnection } = await import('../../services/api');
    
    mockedAxios.get.mockResolvedValue({ data: { message: 'OK' } });
    
    const result = await testConnection();
    expect(result).toEqual({ message: 'OK' });
    expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:8001/');
  });

  it('should handle healthCheck errors', async () => {
    const { healthCheck } = await import('../../services/api');
    
    mockedAxios.get.mockRejectedValue(new Error('Network error'));
    
    await expect(healthCheck()).rejects.toThrow('Backend connection failed');
  });

  it('should handle testConnection errors', async () => {
    const { testConnection } = await import('../../services/api');
    
    mockedAxios.get.mockRejectedValue(new Error('Network error'));
    
    await expect(testConnection()).rejects.toThrow('API connection test failed');
  });
});
