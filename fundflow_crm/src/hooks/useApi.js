import { useState, useEffect, useCallback } from 'react';

// Custom hook for API calls with loading, error, and data states
export const useApi = (apiFunction, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const enforceHttps = (url) => url.replace(/^http:\/\//, 'https://');

  const execute = useCallback(async (...args) => {
    if (!apiFunction) {
      return;
    }
    try {
      setLoading(true);
      setError(null);

      // Enforce HTTPS for the API function
      const result = await apiFunction(...args.map(arg => {
        if (typeof arg === 'string' && arg.startsWith('http://')) {
          return enforceHttps(arg);
        }
        return arg;
      }));

      setData(result);
      return result;
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction, ...dependencies]);

  return { data, loading, error, execute };
};

// Custom hook for API calls that run on mount
export const useApiOnMount = (apiFunction, dependencies = []) => {
  const { data, loading, error, execute } = useApi(apiFunction, dependencies);

  useEffect(() => {
    if (apiFunction) {
      // Catch any unhandled promise rejections from execute
      execute().catch(err => {
        // Error is already handled in the execute function
        // This catch is just to prevent unhandled promise rejection
        console.warn('API call error in useApiOnMount:', err.message);
      });
    }
    // Only run on mount, not when apiFunction changes to prevent infinite loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { data, loading, error, refetch: execute };
};

// Custom hook for form submissions
export const useApiSubmit = (apiFunction) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const submit = useCallback(async (data) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      
      const result = await apiFunction(data);
      setSuccess(true);
      return result;
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction]);

  const reset = useCallback(() => {
    setError(null);
    setSuccess(false);
    setLoading(false);
  }, []);

  return { submit, loading, error, success, reset };
};

// Custom hook for paginated API calls
export const usePaginatedApi = (apiFunction, initialFilters = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState(initialFilters);

  const loadMore = useCallback(async (reset = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const currentPage = reset ? 1 : page;
      const result = await apiFunction({ 
        ...filters, 
        page: currentPage, 
        limit: 20 
      });
      
      if (reset) {
        setData(result.data || []);
        setPage(2);
      } else {
        setData(prev => [...prev, ...(result.data || [])]);
        setPage(prev => prev + 1);
      }
      
      setHasMore((result.data || []).length >= 20);
      return result;
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction, filters, page]);

  const updateFilters = useCallback((newFilters) => {
    setFilters(newFilters);
    setPage(1);
    loadMore(true);
  }, [loadMore]);

  const refresh = useCallback(() => {
    setPage(1);
    loadMore(true);
  }, [loadMore]);

  return {
    data,
    loading,
    error,
    hasMore,
    loadMore: () => loadMore(false),
    refresh,
    updateFilters,
    filters
  };
};
