import { describe, it, expect, vi, beforeEach } from 'vitest';
import { plaintiffService } from '../../services/plaintiffService';

// Mock the API client
vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import apiClient from '../../services/api';

describe('PlaintiffService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('fetches all plaintiffs with default parameters', async () => {
      const mockResponse = {
        data: {
          plaintiffs: [
            { id: 1, firstName: 'John', lastName: 'Doe' },
            { id: 2, firstName: 'Jane', lastName: 'Smith' }
          ],
          total: 2,
          page: 1,
          limit: 10
        }
      };

      apiClient.get.mockResolvedValue(mockResponse);

      const result = await plaintiffService.getAll();

      expect(apiClient.get).toHaveBeenCalledWith('/plaintiffs', {
        params: {}
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('fetches plaintiffs with custom parameters', async () => {
      const mockResponse = {
        data: {
          plaintiffs: [],
          total: 0,
          page: 2,
          limit: 5
        }
      };

      apiClient.get.mockResolvedValue(mockResponse);

      const params = { page: 2, limit: 5, search: 'John' };
      const result = await plaintiffService.getAll(params);

      expect(apiClient.get).toHaveBeenCalledWith('/plaintiffs', {
        params
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('handles API errors gracefully', async () => {
      const errorMessage = 'Network Error';
      apiClient.get.mockRejectedValue(new Error(errorMessage));

      await expect(plaintiffService.getAll()).rejects.toThrow(errorMessage);
    });
  });

  describe('getById', () => {
    it('fetches plaintiff by ID', async () => {
      const mockPlaintiff = { id: 1, firstName: 'John', lastName: 'Doe' };
      const mockResponse = { data: mockPlaintiff };

      apiClient.get.mockResolvedValue(mockResponse);

      const result = await plaintiffService.getById(1);

      expect(apiClient.get).toHaveBeenCalledWith('/plaintiffs/1');
      expect(result).toEqual(mockPlaintiff);
    });

    it('handles not found error', async () => {
      apiClient.get.mockRejectedValue(new Error('Plaintiff not found'));

      await expect(plaintiffService.getById(999)).rejects.toThrow('Plaintiff not found');
    });
  });

  describe('create', () => {
    it('creates a new plaintiff', async () => {
      const newPlaintiff = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '555-1234'
      };
      const mockResponse = { data: { id: 1, ...newPlaintiff } };

      apiClient.post.mockResolvedValue(mockResponse);

      const result = await plaintiffService.create(newPlaintiff);

      expect(apiClient.post).toHaveBeenCalledWith('/plaintiffs', newPlaintiff);
      expect(result).toEqual(mockResponse.data);
    });

    it('handles validation errors', async () => {
      const invalidPlaintiff = { firstName: '' };
      apiClient.post.mockRejectedValue(new Error('Validation failed'));

      await expect(plaintiffService.create(invalidPlaintiff)).rejects.toThrow('Validation failed');
    });
  });

  describe('update', () => {
    it('updates an existing plaintiff', async () => {
      const updates = { firstName: 'Jane' };
      const mockResponse = { data: { id: 1, firstName: 'Jane', lastName: 'Doe' } };

      apiClient.put.mockResolvedValue(mockResponse);

      const result = await plaintiffService.update(1, updates);

      expect(apiClient.put).toHaveBeenCalledWith('/plaintiffs/1', updates);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('delete', () => {
    it('deletes a plaintiff', async () => {
      apiClient.delete.mockResolvedValue({ data: { message: 'Deleted successfully' } });

      const result = await plaintiffService.delete(1);

      expect(apiClient.delete).toHaveBeenCalledWith('/plaintiffs/1');
      expect(result).toEqual({ message: 'Deleted successfully' });
    });
  });

  describe('getStats', () => {
    it('fetches plaintiff statistics', async () => {
      const mockStats = {
        total: 100,
        active: 75,
        pending: 15,
        completed: 10,
        totalFunding: 1500000
      };
      const mockResponse = { data: mockStats };

      apiClient.get.mockResolvedValue(mockResponse);

      const result = await plaintiffService.getStats();

      expect(apiClient.get).toHaveBeenCalledWith('/plaintiffs/stats');
      expect(result).toEqual(mockStats);
    });
  });
});
