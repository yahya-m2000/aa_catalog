import { useCallback, useEffect, useState } from 'react';

import { ApiClientError } from '@/services/api/client';
import { getHomeCollections } from '@/services/api/homeCollections.api';
import type { HomeCollection } from '@/types/homeCollection';

interface UseHomeCollectionsResult {
  collections: HomeCollection[];
  status: 'loading' | 'success' | 'error';
  errorMessage: string | null;
}

export function useHomeCollections(): UseHomeCollectionsResult {
  const [collections, setCollections] = useState<HomeCollection[]>([]);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setStatus('loading');
    setErrorMessage(null);

    try {
      const result = await getHomeCollections();
      setCollections(result);
      setStatus('success');
    } catch (error) {
      const message = error instanceof ApiClientError ? error.message : 'Something went wrong.';
      setErrorMessage(message);
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { collections, status, errorMessage };
}
