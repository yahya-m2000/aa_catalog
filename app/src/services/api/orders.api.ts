import { apiPost } from './client';
import type { BasketTotals } from '@/types/basket';
import type { CheckoutForm } from '@/types/checkout';

export interface SubmitOrderItem {
  productId: string;
  skuId?: string;
  quantity: number;
  notes?: string;
}

export interface SubmitOrderPayload {
  customer: CheckoutForm;
  items: SubmitOrderItem[];
}

export interface SubmitOrderResult {
  reference: string;
  totals: BasketTotals;
}

export function submitOrder(payload: SubmitOrderPayload): Promise<SubmitOrderResult> {
  return apiPost<SubmitOrderResult>('/api/orders', payload);
}
