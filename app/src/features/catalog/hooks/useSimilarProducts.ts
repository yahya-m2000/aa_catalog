import { useCallback, useEffect, useState } from 'react';

import { ApiClientError } from '@/services/api/client';
import { getSimilarProducts } from '@/services/api/products.api';
import type { NormalizedProduct } from '@/types/product';

interface UseSimilarProductsResult {
  products: NormalizedProduct[];
  status: 'loading' | 'success' | 'error';
  errorMessage: string | null;
}

export function useSimilarProducts(productId: string): UseSimilarProductsResult {
  const [products, setProducts] = useState<NormalizedProduct[]>([]);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setStatus('loading');
    setErrorMessage(null);

    try {
      const result = await getSimilarProducts(productId);
      setProducts(result);
      setStatus('success');
    } catch (error) {
      const message = error instanceof ApiClientError ? error.message : 'Something went wrong.';
      setErrorMessage(message);
      setStatus('error');
    }
  }, [productId]);

  useEffect(() => {
    load();
  }, [load]);

  return { products, status, errorMessage };
}
