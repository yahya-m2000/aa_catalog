import type { NormalizedProduct, ProductSku, ProductVariantOption } from '../../types/product';
import type { TaobaoRawProductDetailResponse, TaobaoRawProductSpu, TaobaoSku } from './taobao.types';

// TODO: confirm with real sandbox credentials whether Taobao price strings are in
// minor units (cents/fen) or major units (whole CNY) — docs samples are inconsistent
// (e.g. "price": "24" vs "price": "27900" for what reads like comparable items).
// Isolated here so it is a one-line fix once verified against a live response.
function parsePriceAmount(raw: string): number {
  return Number(raw);
}

function parseSkuOptions(properties: TaobaoSku['properties']): ProductVariantOption[] {
  if (!properties || properties === '-') return [];
  return properties.map((prop) => ({ name: prop.prop_name, value: prop.value_name }));
}

function normalizeSku(sku: TaobaoSku, currency: 'CNY' | 'USD'): ProductSku {
  const amount = parsePriceAmount(sku.price);
  return {
    skuId: sku.mp_skuId ?? sku.sku_id ?? '',
    options: parseSkuOptions(sku.properties),
    price: {
      amount,
      currency,
      // TODO: backend controller overwrites usdAmount/finalAmount via pricing service (Run 3+).
      usdAmount: amount,
      finalAmount: amount,
    },
    inventory: sku.quantity ? Number(sku.quantity) : 0,
    imageUrl: sku.pic_url,
  };
}

// TODO: verify request signing (taobao.client.ts) before this path can be exercised
// against the real platform — not yet built, see adapter.factory.ts.
export function normalizeProductDetail(
  raw: TaobaoRawProductDetailResponse['data'],
): NormalizedProduct {
  const currency: 'CNY' | 'USD' = 'CNY';
  const amount = parsePriceAmount(raw.price);
  const skus = raw.sku_list.map((sku) => normalizeSku(sku, currency));

  return {
    id: raw.item_id,
    title: raw.title,
    description: raw.description,
    category: raw.category_path ?? raw.category_name,
    sellerName: raw.shop_name,
    images: raw.pic_urls.map((url, index) => ({ url, isPrimary: index === 0 })),
    price: {
      amount,
      currency,
      usdAmount: amount,
      finalAmount: amount,
    },
    skus,
    sourcePlatform: 'taobao',
  };
}

export function normalizeProductSpu(raw: TaobaoRawProductSpu): NormalizedProduct {
  const currency = raw.currency === 'USD' ? 'USD' : 'CNY';
  const amount = parsePriceAmount(raw.price);

  let imageUrls: string[] = [];
  try {
    const parsed = JSON.parse(raw.images);
    if (Array.isArray(parsed)) imageUrls = parsed;
  } catch {
    imageUrls = [];
  }

  return {
    id: raw.item_id,
    title: raw.title,
    category: raw.tb_category_path ?? raw.category_name,
    images: imageUrls.map((url, index) => ({ url, isPrimary: index === 0 })),
    price: {
      amount,
      currency,
      usdAmount: amount,
      finalAmount: amount,
    },
    skus: [],
    sourcePlatform: 'taobao',
  };
}
