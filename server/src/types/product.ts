export type CurrencyCode = 'CNY' | 'USD';

export interface ProductImage {
  url: string;
  isPrimary: boolean;
}

export interface ProductPrice {
  amount: number;
  currency: CurrencyCode;
  usdAmount: number;
  finalAmount: number;
}

export interface ProductVariantOption {
  name: string;
  value: string;
}

export interface ProductSku {
  skuId: string;
  options: ProductVariantOption[];
  price: ProductPrice;
  inventory: number;
  imageUrl?: string;
}

export interface NormalizedProduct {
  id: string;
  title: string;
  description?: string;
  shortDescription?: string;
  category?: string;
  sellerName?: string;
  images: ProductImage[];
  price: ProductPrice;
  skus: ProductSku[];
  sourcePlatform: 'taobao' | 'mock';
  /** Raw upstream product id (HIOBuy's source_product_id), unprefixed unlike `id`.
   * Maps to `offer_id` when calling HIOBuy's orders/preview or orders/create — see
   * https://hiobuy.com/en/api-docs/product-response-models ("Map to orders:
   * source_product_id -> offer_id, variants[].sku_id -> spec_id"). Undefined for mock
   * products, which are never procured. */
  sourceProductId?: string;
}
