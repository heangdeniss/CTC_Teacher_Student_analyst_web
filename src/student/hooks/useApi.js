import { useEffect, useState } from 'react';
import { apiGet } from '../services/api';

/**
 * Fetches a page payload and re-fetches whenever the global filters change.
 * In-flight requests are aborted so rapid filter changes cannot race.
 */
export function useApi(path, filters) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const key = filters ? JSON.stringify(filters) : '';

  useEffect(() => {
    const controller = new AbortController();
    setState((previous) => ({ ...previous, loading: true, error: null }));

    apiGet(path, filters, controller.signal)
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((error) => {
        if (error.name === 'AbortError') return;
        setState({ data: null, loading: false, error: error.message });
      });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, key]);

  return state;
}
