import { describe, it, expect, vi } from 'vitest';

// Mock the services import
vi.mock('../../services', () => ({
  services: {
    plaintiff: {
      getAll: vi.fn(),
      getById: vi.fn(),
    },
    communication: {
      getAll: vi.fn(),
    },
  },
}));

import { handleApiError } from '../../utils/apiUtils';

describe('API Utils', () => {
  describe('handleApiError', () => {
    it('should handle API errors correctly', () => {
      const mockError = {
        response: {
          status: 404,
          data: { message: 'Not found' }
        }
      };
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => handleApiError(mockError, 'test context')).not.toThrow();
      expect(consoleSpy).toHaveBeenCalledWith('API Error (test context):', mockError);
      
      consoleSpy.mockRestore();
    });

    it('should handle network errors', () => {
      const mockError = new Error('Network Error');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => handleApiError(mockError)).not.toThrow();
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });
});
