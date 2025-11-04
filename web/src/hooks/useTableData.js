// Shared hook for table data with loading/error states
// Root cause: Pages silently failed when data was undefined or API calls failed
// Fix: Centralized hook with try/catch, default empty arrays, and error state management

import { useState, useEffect, useMemo } from 'react';

export function useTableData(fetchFn, dependencies = []) {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await fetchFn();
      setData(Array.isArray(result) ? result : []);
    } catch (err) {
      console.error('Data fetch error:', err);
      setError(err.message || 'Failed to load data');
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, dependencies);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  };
}

// Helper to safely get data with defaults
export function safeArray(value, defaultValue = []) {
  return Array.isArray(value) ? value : defaultValue;
}

