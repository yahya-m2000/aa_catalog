import type { NormalizedProduct, ProductSku } from '../../types/product';
import type { HiobuyProductDetail, HiobuySearchItem, HiobuyVariant } from './hiobuy.types';

function normalizeVariant(variant: HiobuyVariant): ProductSku {
  return {
    skuId: variant.sku_id,
    options: variant.attributes.map((attr) => ({ name: attr.name, value: attr.value })),
    price: {
      amount: variant.price.display_amount,
      currency: 'CNY',
      // Overwritten by applyPricingToProduct (server/src/utils/applyPricingToProduct.ts)
      // once currency rates are available — placeholder here matches the source amount.
      usdAmount: 0,
      finalAmount: 0,
    },
    inventory: variant.stock,
    imageUrl: variant.image,
  };
}

export function normalizeProductDetail(raw: HiobuyProductDetail): NormalizedProduct {
  return {
    id: raw.id,
    title: raw.title.translated ?? raw.title.original,
    description: raw.description?.translated ?? raw.description?.original,
    category: raw.category,
    sellerName: raw.seller?.name,
    images: raw.images.map((img, index) => ({ url: img.url, isPrimary: img.type === 'main' || index === 0 })),
    price: {
      amount: raw.price.display_amount,
      currency: 'CNY',
      usdAmount: 0,
      finalAmount: 0,
    },
    skus: raw.variants.map(normalizeVariant),
    sourcePlatform: 'taobao',
    sourceProductId: raw.source_product_id,
  };
}

export function normalizeSearchItem(raw: HiobuySearchItem): NormalizedProduct {
  return {
    id: raw.id,
    title: raw.title.translated ?? raw.title.original,
    sellerName: raw.seller?.name,
    images: raw.image ? [{ url: raw.image, isPrimary: true }] : [],
    price: {
      amount: raw.price.display_amount,
      currency: 'CNY',
      usdAmount: 0,
      finalAmount: 0,
    },
    skus: [],
    sourcePlatform: 'taobao',
    sourceProductId: raw.source_product_id,
  };
}
