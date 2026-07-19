import type { PaginatedResult } from '../../types/api';
import type { NormalizedProduct } from '../../types/product';
import type { ProductSourceAdapter, SearchParams } from '../taobao/adapter.interface';
import { hiobuyPost, HiobuyRequestError } from './hiobuy.client';
import { normalizeProductDetail, normalizeSearchItem } from './hiobuy.normalize';
import type { HiobuyProductDetailResponse, HiobuySearchResponse } from './hiobuy.types';

const SORT_FIELD: Record<SearchParams['sort'], 'price' | 'sales' | undefined> = {
  price_asc: 'price',
  price_desc: 'price',
  popular: 'sales',
  relevance: undefined,
  newest: undefined,
};

export class HiobuyProductAdapter implements ProductSourceAdapter {
  async search(params: SearchParams): Promise<PaginatedResult<NormalizedProduct>> {
    if (!params.query) {
      return { items: [], page: params.page, pageSize: params.pageSize, totalItems: 0, hasMore: false };
    }

    const response = await hiobuyPost<HiobuySearchResponse>('/v1/products/search', {
      channel: 'taobao',
      keyword: params.query,
      page: params.page,
      page_size: Math.min(params.pageSize, 50),
      sort_field: SORT_FIELD[params.sort],
    });

    const items = response.items.map(normalizeSearchItem);
    const total = response.total;

    return {
      items,
      page: response.page,
      pageSize: response.page_size,
      totalItems: total,
      hasMore: total !== undefined ? response.page * response.page_size < total : items.length === response.page_size,
    };
  }

  async getById(id: string): Promise<NormalizedProduct | null> {
    try {
      const response = await hiobuyPost<HiobuyProductDetailResponse>('/v1/products/detail', {
        channel: 'taobao',
        product_id: id,
      });
      return normalizeProductDetail(response.product);
    } catch (error) {
      if (error instanceof HiobuyRequestError && error.statusCode === 404) {
        return null;
      }
      throw error;
    }
  }
}
