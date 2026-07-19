import { cacheConfig } from '../../config/cache.config';
import type { PaginatedResult } from '../../types/api';
import type { NormalizedProduct } from '../../types/product';
import type { ProductSourceAdapter, SearchParams } from '../taobao/adapter.interface';
import { isQuotaLow } from './quota.tracker';
import { SwrCache } from '../../utils/swrCache';

const EMPTY_RESULT: PaginatedResult<NormalizedProduct> = {
  items: [],
  page: 1,
  pageSize: 0,
  totalItems: 0,
  hasMore: false,
};

function searchKey(params: SearchParams): string {
  const query = (params.query ?? '').trim().toLowerCase();
  return `search:${query}:${params.sort}:${params.page}:${params.pageSize}`;
}

/**
 * Wraps any ProductSourceAdapter with a browsing-only, process-lifetime cache
 * (search + detail lookups). Checkout/order-submission code must never read
 * through this cache — it calls the HIOBuy client directly for revalidation.
 * See plan §7.
 */
export class CachedProductAdapter implements ProductSourceAdapter {
  private readonly searchCache = new SwrCache<PaginatedResult<NormalizedProduct>>({
    freshMs: cacheConfig.search.freshMs,
    staleMs: cacheConfig.search.staleMs,
    name: 'search',
  });

  private readonly detailCache = new SwrCache<NormalizedProduct | null>({
    freshMs: cacheConfig.detail.freshMs,
    staleMs: cacheConfig.detail.staleMs,
    name: 'detail',
  });

  constructor(private readonly inner: ProductSourceAdapter) {}

  async search(params: SearchParams): Promise<PaginatedResult<NormalizedProduct>> {
    const key = searchKey(params);

    if (isQuotaLow()) {
      const cached = this.searchCache.get(key);
      if (cached) return cached.value;
      return { ...EMPTY_RESULT, page: params.page, pageSize: params.pageSize };
    }

    return this.searchCache.getOrFetch(key, () => this.inner.search(params));
  }

  async getById(id: string): Promise<NormalizedProduct | null> {
    const key = `detail:${id}`;

    if (isQuotaLow()) {
      const cached = this.detailCache.get(key);
      if (cached) return cached.value;
      return null;
    }

    return this.detailCache.getOrFetch(key, () => this.inner.getById(id));
  }
}
