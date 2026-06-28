import { useCallback, useEffect, useState } from 'react';

import { ApiClientError } from '@/services/api/client';
import { searchProducts, type ProductSortOption } from '@/services/api/products.api';
import type { NormalizedProduct } from '@/types/product';

interface UseProductSearchResult {
  products: NormalizedProduct[];
  status: 'loading' | 'success' | 'error';
  errorMessage: string | null;
  isRefreshing: boolean;
  refresh: () => void;
}

export function useProductSearch(query: string, sort: ProductSortOption): UseProductSearchResult {
  const [products, setProducts] = useState<NormalizedProduct[]>([]);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const load = useCallback(
    async (mode: 'initial' | 'refresh') => {
      if (mode === 'initial') {
        setStatus('loading');
      } else {
        setIsRefreshing(true);
      }
      setErrorMessage(null);

      try {
        const result = await searchProducts({ q: query || undefined, sort });
        setProducts(result.items);
        setStatus('success');
      } catch (error) {
        const message = error instanceof ApiClientError ? error.message : 'Something went wrong.';
        setErrorMessage(message);
        setStatus('error');
      } finally {
        setIsRefreshing(false);
      }
    },
    [query, sort],
  );

  useEffect(() => {
    load('initial');
  }, [load]);

  const refresh = useCallback(() => {
    load('refresh');
  }, [load]);

  return { products, status, errorMessage, isRefreshing, refresh };
}
