import { apiPost } from './client';
import type { BasketTotals } from '@/types/basket';
import type { CheckoutForm } from '@/types/checkout';

export type PaymentMethod = 'Cash' | 'Zaad';

export interface SubmitOrderItem {
  productId: string;
  skuId?: string;
  quantity: number;
  notes?: string;
}

export interface SubmitOrderPayload {
  customer: CheckoutForm;
  items: SubmitOrderItem[];
  paymentMethod?: PaymentMethod;
}

export interface SubmitOrderResult {
  reference: string;
  totals: BasketTotals;
}

export function submitOrder(payload: SubmitOrderPayload): Promise<SubmitOrderResult> {
  return apiPost<SubmitOrderResult>('/api/orders', payload);
}

export interface OrderLookupPayload {
  reference: string;
  email: string;
}

export interface PublicOrderLineItem {
  productId: string;
  skuId?: string;
  productTitle: string;
  variantOptions?: { name: string; value: string }[];
  quantity: number;
}

export interface PublicOrderDTO {
  reference: string;
  createdAt: string;
  status: string;
  items: PublicOrderLineItem[];
  totalUsd: number;
  paymentMethod: PaymentMethod;
}

export function lookupOrder(payload: OrderLookupPayload): Promise<PublicOrderDTO> {
  return apiPost<PublicOrderDTO>('/api/orders/lookup', payload);
}
