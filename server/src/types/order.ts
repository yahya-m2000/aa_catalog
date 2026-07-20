import type { BasketTotals } from './basket';
import type { CheckoutForm } from './checkout';
import type { CurrencyCode, ProductVariantOption } from './product';

export interface OrderLineItem {
  productId: string;
  productTitle: string;
  skuId?: string;
  variantOptions?: ProductVariantOption[];
  quantity: number;
  originalAmount: number;
  originalCurrency: CurrencyCode;
  usdAmount: number;
  markupAmount: number;
  finalAmount: number;
  /** HIOBuy's raw source_product_id — the `offer_id` procurement needs. Undefined for
   * mock-sourced items, which are never procured. See NormalizedProduct.sourceProductId. */
  sourceProductId?: string;
}

export interface Order {
  reference: string;
  customer: CheckoutForm;
  items: OrderLineItem[];
  totals: BasketTotals;
  createdAt: string;
}
