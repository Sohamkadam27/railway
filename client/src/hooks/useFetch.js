// client/src/hooks/useFetch.js
// Universal data fetching hook with full loading/error handling and cleanup support.

import { useState, useEffect, useCallback } from 'react';

export default function useFetch(url, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch logic wrapped in useCallback for manual re-fetch support
  const fetchData = useCallback(async () => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    try {
      // In development, '/api' is proxied by Vite to backend (no CORS issue)
      const response = await fetch(`/api${url}`, {
        credentials: 'include',
        headers: { 'Accept': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`Fetch failed (HTTP ${response.status})`);
      }

      const json = await response.json();
      if (!cancelled) setData(json);
    } catch (err) {
      if (!cancelled) {
        console.error('useFetch error:', err);
        setError(err.message || 'Failed to fetch data');
      }
    } finally {
      if (!cancelled) setLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [url]);

  // Auto-fetch whenever dependencies change
  useEffect(() => {
    const controller = new AbortController();
    fetchData();

    // Abort fetch on component unmount or dependency change
    return () => controller.abort();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error, refetch: fetchData };
}
