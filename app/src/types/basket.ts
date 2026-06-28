import type { ProductPrice, ProductVariantOption } from './product';

export interface BasketItem {
  productId: string;
  productTitle: string;
  productImageUrl: string;
  selectedSku?: { skuId: string; options: ProductVariantOption[] };
  quantity: number;
  unitPrice: ProductPrice;
  notes?: string;
}

export interface BasketTotals {
  subtotalUSD: number;
  markupTotalUSD: number;
  finalTotalUSD: number;
}
