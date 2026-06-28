// Raw Taobao Global Open Platform response shapes, verified from official docs
// (pasted by user, 2026-06-28). Real API returns numbers/booleans as strings and
// has inconsistent field casing across endpoints — normalize defensively.

export interface TaobaoSkuProperty {
  prop_name: string;
  prop_id: string;
  value_id: string;
  value_name: string;
}

export interface TaobaoSku {
  mp_skuId?: string;
  sku_id?: string | null;
  quantity?: string;
  price: string;
  postFee?: string;
  coupon_price?: string;
  pic_url?: string;
  properties?: TaobaoSkuProperty[] | '-';
  promotion_price?: string;
  status?: string;
}

// GET/POST /product/get response.data shape — primary single-product detail source.
export interface TaobaoRawProductDetailResponse {
  error_msg: string | null;
  code: string;
  data: {
    quantity?: string;
    mp_id?: string;
    category_name?: string;
    item_id: string;
    item_type?: string;
    description?: string;
    promotion_displays?: unknown;
    pic_urls: string[];
    begin_amount?: string;
    shop_name?: string;
    title: string;
    product_unit?: string;
    user_nick?: string;
    promotion_price?: string;
    mi_id?: string;
    shop_id?: string;
    category_id?: string;
    category_path?: string;
    price: string;
    sku_list: TaobaoSku[];
    coupon_price?: string;
    status: string;
  };
  success: string;
  fail_items?: string | null;
  error_code: string | null;
  request_id: string;
}

// GET/POST /product/spus/get response.data shape — paginated/scroll listing source.
export interface TaobaoRawProductSpu {
  tb_category_path?: string;
  created_time?: string;
  images: string; // JSON-encoded array string, not a real array — must JSON.parse defensively
  category_name?: string;
  item_id: string;
  is_new?: string;
  weight?: string;
  title: string;
  inventory?: string;
  modified_time: string;
  category_id?: string;
  price: string;
  tb_category_id?: string;
  currency: string;
  status: string;
}

export interface TaobaoRawProductSearchResponse {
  error_msg: string | null;
  code: string;
  data: {
    surplus_total: string;
    results_total: string;
    product_list: TaobaoRawProductSpu[];
    scroll_id?: string;
  };
  success: string;
  error_code: string;
  request_id: string;
}
