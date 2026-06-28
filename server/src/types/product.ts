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
}
