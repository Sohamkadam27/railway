// client/src/hooks/useFetch.js
// Universal data fetching hook with loading, error, and manual refetch support.

import { useState, useEffect, useCallback } from 'react';

export default function useFetch(url, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // fetchData wrapped in useCallback to allow refetching
  const fetchData = useCallback(async (signal) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api${url}`, {
        credentials: 'include',
        headers: { 'Accept': 'application/json' },
        signal, // attach signal to fetch for aborting
      });

      if (!response.ok) {
        throw new Error(`Fetch failed (HTTP ${response.status})`);
      }

      const json = await response.json();
      setData(json);
    } catch (err) {
      if (err.name !== 'AbortError') { // ignore abort errors
        console.error('useFetch error:', err);
        setError(err.message || 'Failed to fetch data');
      }
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    const controller = new AbortController();
    fetchData(controller.signal); // pass abort signal to fetch

    return () => {
      controller.abort(); // cancel fetch on unmount or deps change
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error, refetch: () => fetchData(new AbortController().signal) };
}
