import type { NormalizedProduct, ProductSku } from '../../types/product';
import type { HiobuyProductDetail, HiobuySearchItem, HiobuyVariant } from './hiobuy.types';

// HIOBuy's sandbox (HIO_TEST_API_KEY) returns image URLs on cdn.hiobuy.com, a domain
// that does not resolve at all (confirmed via DNS lookup 2026-07-20) — sandbox never
// actually served real image bytes. Swap those specific URLs for a deterministic
// picsum.photos placeholder so browsing/design work has real images to render. This
// only ever triggers for the known-broken sandbox host, so it's a no-op (and should be
// deleted) once real image URLs are returned, e.g. after switching to the live key.
const BROKEN_SANDBOX_IMAGE_HOST = 'cdn.hiobuy.com';

function placeholderImageUrl(sourceUrl: string): string {
  let hash = 0;
  for (let i = 0; i < sourceUrl.length; i++) hash = (hash * 31 + sourceUrl.charCodeAt(i)) >>> 0;
  const id = 20 + (hash % 950);
  return `https://picsum.photos/id/${id}/800/800`;
}

function fixImageUrl(url: string): string {
  return url.includes(BROKEN_SANDBOX_IMAGE_HOST) ? placeholderImageUrl(url) : url;
}

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
    imageUrl: variant.image ? fixImageUrl(variant.image) : variant.image,
  };
}

export function normalizeProductDetail(raw: HiobuyProductDetail): NormalizedProduct {
  return {
    id: raw.id,
    title: raw.title.translated ?? raw.title.original,
    description: raw.description?.translated ?? raw.description?.original,
    category: raw.category,
    sellerName: raw.seller?.name,
    images: raw.images.map((img, index) => ({
      url: fixImageUrl(img.url),
      isPrimary: img.type === 'main' || index === 0,
    })),
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
    images: raw.image ? [{ url: fixImageUrl(raw.image), isPrimary: true }] : [],
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
