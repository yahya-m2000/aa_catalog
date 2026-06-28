import { useState } from 'react';

import { useBasketStore } from '@/features/basket/store/basket.store';
import { ApiClientError } from '@/services/api/client';
import { submitOrder, type SubmitOrderResult } from '@/services/api/orders.api';
import type { CheckoutForm } from '@/types/checkout';

interface UseSubmitOrderResult {
  status: 'idle' | 'submitting' | 'success' | 'error';
  errorMessage: string | null;
  result: SubmitOrderResult | null;
  submit: (customer: CheckoutForm) => Promise<void>;
}

export function useSubmitOrder(): UseSubmitOrderResult {
  const items = useBasketStore((state) => state.items);
  const clearBasket = useBasketStore((state) => state.clearBasket);

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<SubmitOrderResult | null>(null);

  const submit = async (customer: CheckoutForm) => {
    setStatus('submitting');
    setErrorMessage(null);

    try {
      const orderResult = await submitOrder({
        customer,
        items: items.map((item) => ({
          productId: item.productId,
          skuId: item.selectedSku?.skuId,
          quantity: item.quantity,
          notes: item.notes,
        })),
      });
      setResult(orderResult);
      setStatus('success');
      clearBasket();
    } catch (error) {
      const message = error instanceof ApiClientError ? error.message : 'Something went wrong.';
      setErrorMessage(message);
      setStatus('error');
    }
  };

  return { status, errorMessage, result, submit };
}
