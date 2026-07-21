import { cacheConfig } from '../../config/cache.config';
import { homeRailsConfig } from '../../config/homeRails.config';
import type { HomeCollection, HomeCollectionsProvider } from '../taobao/home.interface';
import type { NormalizedProduct } from '../../types/product';
import { getProductAdapter } from '../taobao/adapter.factory';
import type { ProductSortOption } from '../taobao/adapter.interface';
import { hiobuyPost, HiobuyRequestError } from './hiobuy.client';
import { normalizeSearchItem } from './hiobuy.normalize';
import type { HiobuySimilarResponse } from './hiobuy.types';
import { SwrCache } from '../../utils/swrCache';

/**
 * These HIOBuy endpoints require taobao-channel authorization that this account
 * does not currently have (verified 401 CHANNEL_NOT_AUTHORIZED against live sandbox,
 * 2026-07-19 — see project memory project_hiobuy_api_facts.md). Every call here must
 * degrade to an empty result rather than surface an error to the app, since this is
 * an account-provisioning gap, not a bug, and may resolve itself once/if HIOBuy grants
 * broader channel access.
 */
function isChannelNotAuthorized(error: unknown): boolean {
  return error instanceof HiobuyRequestError && error.code === 'CHANNEL_NOT_AUTHORIZED';
}

export class HiobuyHomeProvider implements HomeCollectionsProvider {
  private readonly dimensionsCache = new SwrCache<HomeCollection[]>({
    freshMs: cacheConfig.home.freshMs,
    staleMs: cacheConfig.home.staleMs,
    name: 'home',
  });

  private readonly similarCache = new SwrCache<NormalizedProduct[]>({
    freshMs: cacheConfig.home.freshMs,
    staleMs: cacheConfig.home.staleMs,
    name: 'home-similar',
  });

  /**
   * `themes/dimensions`/`themes/items` are blocked (CHANNEL_NOT_AUTHORIZED, see file header),
   * so rails are built instead from the working `products/search` path: one rail per
   * homeRailsConfig entry (keyword/sort-seeded), plus rails grouped from whatever `category`
   * values the configured keyword-search results actually return. Once this account gains
   * `themes` access (or moves to live), only this method needs to change back — the
   * HomeCollection contract and every consumer stay the same.
   */
  private async fetchKeywordRail(dimension: string, label: string, keyword: string, sort: ProductSortOption): Promise<HomeCollection> {
    const result = await getProductAdapter().search({ query: keyword, sort, page: 1, pageSize: 20 });
    return { dimension, label, items: result.items };
  }

  private buildCategoryCollections(seedItems: NormalizedProduct[]): HomeCollection[] {
    const byCategory = new Map<string, NormalizedProduct[]>();
    for (const product of seedItems) {
      const category = product.category ?? 'Other';
      const existing = byCategory.get(category) ?? [];
      existing.push(product);
      byCategory.set(category, existing);
    }
    return Array.from(byCategory.entries()).map(([category, items]) => ({
      dimension: `category-${category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      label: category,
      items,
    }));
  }

  async getCollections(): Promise<HomeCollection[]> {
    return this.dimensionsCache.getOrFetch('home-collections', async () => {
      try {
        const keywordRails = await Promise.all(
          homeRailsConfig.map((rail) => this.fetchKeywordRail(rail.dimension, rail.label, rail.keyword, rail.sort)),
        );

        const seenIds = new Set<string>();
        const seedItems = keywordRails
          .flatMap((rail) => rail.items)
          .filter((item) => (seenIds.has(item.id) ? false : (seenIds.add(item.id), true)));
        const categoryRails = this.buildCategoryCollections(seedItems);

        return [...keywordRails, ...categoryRails].filter((c) => c.items.length > 0);
      } catch (error) {
        // products/search is not gated by the themes/dimensions channel-auth gap, but it
        // can still fail transiently (rate-limit, quota, network) — degrade to empty rails
        // rather than surfacing a 500 to the Home screen.
        if (error instanceof HiobuyRequestError) return [];
        throw error;
      }
    });
  }

  async getSimilar(productId: string): Promise<NormalizedProduct[]> {
    return this.similarCache.getOrFetch(`similar:${productId}`, async () => {
      try {
        const response = await hiobuyPost<HiobuySimilarResponse>('/v1/products/similar', {
          channel: 'taobao',
          product_id: productId,
        });
        return response.items.map(normalizeSearchItem);
      } catch (error) {
        if (isChannelNotAuthorized(error)) return [];
        throw error;
      }
    });
  }
}
