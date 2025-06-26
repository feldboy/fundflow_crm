import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useApi, useApiOnMount } from '../../hooks/useApi';

// Mock the API service
const mockApiCall = vi.fn();

describe('useApi Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useApi(mockApiCall));

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.execute).toBe('function');
  });

  it('should handle successful API call', async () => {
    const mockData = { id: 1, name: 'Test Data' };
    mockApiCall.mockResolvedValue(mockData);

    const { result } = renderHook(() => useApi(mockApiCall));

    // Execute the API call
    await result.current.execute();

    // Wait for state to update
    await waitFor(() => {
      expect(result.current.data).toEqual(mockData);
    });

    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('should handle API call error', async () => {
    const mockError = new Error('API Error');
    mockApiCall.mockRejectedValue(mockError);

    const { result } = renderHook(() => useApi(mockApiCall));

    try {
      await result.current.execute();
    } catch (error) {
      // Expected to throw
    }

    // Wait for state to update
    await waitFor(() => {
      expect(result.current.error).toBe('API Error');
    });

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('should allow refetching data', async () => {
    const mockData = { id: 1, name: 'Test Data' };
    mockApiCall.mockResolvedValue(mockData);

    const { result } = renderHook(() => useApi(mockApiCall));

    // Initial call
    await result.current.execute();
    
    await waitFor(() => {
      expect(result.current.data).toEqual(mockData);
    });

    // Refetch with new data
    const newMockData = { id: 2, name: 'New Test Data' };
    mockApiCall.mockResolvedValue(newMockData);

    await result.current.execute();
    
    await waitFor(() => {
      expect(result.current.data).toEqual(newMockData);
    });
  });

  it('should handle multiple concurrent calls correctly', async () => {
    let resolveCall1, resolveCall2;
    const promise1 = new Promise(resolve => { resolveCall1 = resolve; });
    const promise2 = new Promise(resolve => { resolveCall2 = resolve; });

    const call1 = vi.fn().mockReturnValue(promise1);
    const call2 = vi.fn().mockReturnValue(promise2);

    const { result: result1 } = renderHook(() => useApi(call1));
    const { result: result2 } = renderHook(() => useApi(call2));

    // Execute multiple calls
    const exec1 = result1.current.execute();
    const exec2 = result2.current.execute();

    // Resolve the second call first
    resolveCall2({ id: 2 });
    await exec2;

    // Resolve the first call second
    resolveCall1({ id: 1 });
    await exec1;

    // Wait for both states to update
    await waitFor(() => {
      expect(result1.current.data).toEqual({ id: 1 });
    });
    
    await waitFor(() => {
      expect(result2.current.data).toEqual({ id: 2 });
    });
  });
});

describe('useApiOnMount Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should execute API call on mount', async () => {
    const mockData = { id: 1, name: 'Test Data' };
    mockApiCall.mockResolvedValue(mockData);

    const { result } = renderHook(() => useApiOnMount(mockApiCall));

    // Should start in loading state
    expect(result.current.loading).toBe(true);

    // Wait for the call to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockApiCall).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBeNull();
  });

  it('should handle API call error on mount', async () => {
    const mockError = new Error('API Error');
    mockApiCall.mockRejectedValue(mockError);

    // Suppress console errors for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useApiOnMount(mockApiCall));

    // Wait for the call to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe('API Error');

    consoleSpy.mockRestore();
  });

  it('should provide refetch functionality', async () => {
    const mockData = { id: 1, name: 'Test Data' };
    mockApiCall.mockResolvedValue(mockData);

    const { result } = renderHook(() => useApiOnMount(mockApiCall));

    // Wait for initial call to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockApiCall).toHaveBeenCalledTimes(1);

    // Refetch data
    const newMockData = { id: 2, name: 'New Test Data' };
    mockApiCall.mockResolvedValue(newMockData);

    await result.current.refetch();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockApiCall).toHaveBeenCalledTimes(2);
    expect(result.current.data).toEqual(newMockData);
  });

  it('should not execute call if apiCall is null', () => {
    const { result } = renderHook(() => useApiOnMount(null));

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should handle dependencies correctly', async () => {
    const mockData = { id: 1, name: 'Test Data' };
    mockApiCall.mockResolvedValue(mockData);

    // Test with initial dependency
    const { result } = renderHook(() => useApiOnMount(mockApiCall, ['initial']));

    // Wait for initial call to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockApiCall).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual(mockData);
    
    // This test primarily verifies that dependencies are passed correctly
    // More complex dependency change testing would require a more sophisticated setup
  });
});
