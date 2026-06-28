import { useCallback, useEffect, useState } from 'react';

import { ApiClientError } from '@/services/api/client';
import { getProductById } from '@/services/api/products.api';
import type { NormalizedProduct } from '@/types/product';

interface UseProductDetailResult {
  product: NormalizedProduct | null;
  status: 'loading' | 'success' | 'error' | 'not-found';
  errorMessage: string | null;
  refresh: () => void;
}

export function useProductDetail(productId: string): UseProductDetailResult {
  const [product, setProduct] = useState<NormalizedProduct | null>(null);
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'not-found'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setStatus('loading');
    setErrorMessage(null);

    try {
      const result = await getProductById(productId);
      setProduct(result);
      setStatus('success');
    } catch (error) {
      if (error instanceof ApiClientError && error.code === 'PRODUCT_NOT_FOUND') {
        setStatus('not-found');
        return;
      }
      const message = error instanceof ApiClientError ? error.message : 'Something went wrong.';
      setErrorMessage(message);
      setStatus('error');
    }
  }, [productId]);

  useEffect(() => {
    load();
  }, [load]);

  return { product, status, errorMessage, refresh: load };
}
