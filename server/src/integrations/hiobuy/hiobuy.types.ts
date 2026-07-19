// Raw HIOBuy API response shapes, verified from https://api.hiobuy.com/openapi.json
// (77 paths, pulled 2026-07-19) and hiobuy.com/en/api-docs/*. See project memory
// project_hiobuy_api_facts.md for the full verified fact set this is derived from.

export interface HiobuyErrorEnvelope {
  error: {
    code: string;
    message: string;
    request_id?: string;
    category?: 'AUTH_ERROR' | 'VALIDATION_ERROR' | 'RATE_LIMIT_ERROR' | 'CHANNEL_ERROR' | 'INTERNAL_ERROR';
    upstream?: unknown;
  };
}

export interface HiobuyQuotaHeaders {
  quotaBillableUnits?: string;
  quotaChannel?: string;
  quotaRemainingDay?: string;
  quotaPackRemaining?: string;
  requestId?: string;
}

// Verified against live sandbox responses 2026-07-19 (server/debug-search.mjs, debug-detail.mjs)
// — the openapi.json-derived shapes below were wrong in several fields; this is ground truth.

export interface HiobuyPrice {
  original_currency: string;
  original_amount: number;
  display_currency: string;
  display_amount: number;
}

export interface HiobuyImage {
  url: string;
  type: 'main' | 'gallery' | 'variant';
}

export interface HiobuyVariantAttribute {
  name: string;
  value: string;
  original_name?: string;
  original_value?: string;
}

export interface HiobuyVariant {
  sku_id: string;
  attributes: HiobuyVariantAttribute[];
  price: HiobuyPrice;
  stock: number;
  image?: string;
}

export interface HiobuySeller {
  id: string;
  name: string;
  shop_url?: string;
}

export interface HiobuyShippingFee {
  currency: string;
  amount: number;
}

export interface HiobuyShipping {
  shipping_from?: string;
  domestic_shipping_fee?: HiobuyShippingFee;
}

export interface HiobuyLocalizedTitle {
  original: string;
  translated?: string;
  language?: string;
}

export interface HiobuyLocalizedText {
  original: string;
  translated?: string;
  language?: string;
}

// POST /v1/products/detail response is wrapped in { product, request_id }
export interface HiobuyProductDetail {
  id: string; // "{channel}_{source_product_id}"
  channel?: string;
  source_product_id: string;
  source_url?: string;
  title: HiobuyLocalizedTitle;
  description?: HiobuyLocalizedText;
  price: HiobuyPrice;
  images: HiobuyImage[];
  variants: HiobuyVariant[];
  seller?: HiobuySeller;
  shipping?: HiobuyShipping;
  category?: string;
}

export interface HiobuyProductDetailResponse {
  product: HiobuyProductDetail;
  request_id?: string;
}

// POST /v1/products/search response item (list shape is thinner than detail)
export interface HiobuySearchItem {
  id: string;
  channel?: string;
  source_product_id: string;
  source_url?: string;
  title: HiobuyLocalizedTitle;
  image: string;
  price: HiobuyPrice;
  seller?: { name: string };
}

export interface HiobuySearchResponse {
  page: number;
  page_size: number;
  total?: number;
  items: HiobuySearchItem[];
}

// POST /v1/products/similar — shape unverified against live sandbox (this account's
// taobao channel returns 401 CHANNEL_NOT_AUTHORIZED for this endpoint as of 2026-07-19,
// see project memory project_hiobuy_api_facts.md). Modeled on the same item shape as
// search results since that's the only verified list-item pattern in this API.
export interface HiobuySimilarResponse {
  items: HiobuySearchItem[];
}

// POST /v1/products/themes/dimensions — shape unverified, same caveat as above.
export interface HiobuyThemeDimension {
  dimension: string;
  label: string;
}

export interface HiobuyThemeDimensionsResponse {
  dimensions: HiobuyThemeDimension[];
}

// POST /v1/products/themes/items — shape unverified, same caveat as above.
export interface HiobuyThemeItemsResponse {
  dimension: string;
  items: HiobuySearchItem[];
}
