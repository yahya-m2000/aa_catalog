import { cacheConfig } from '../../config/cache.config';
import type { HomeCollection, HomeCollectionsProvider } from '../taobao/home.interface';
import type { NormalizedProduct } from '../../types/product';
import { hiobuyPost, HiobuyRequestError } from './hiobuy.client';
import { normalizeSearchItem } from './hiobuy.normalize';
import type {
  HiobuySimilarResponse,
  HiobuyThemeDimensionsResponse,
  HiobuyThemeItemsResponse,
} from './hiobuy.types';
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

  private async fetchThemeItems(dimension: string, label: string): Promise<HomeCollection> {
    try {
      const response = await hiobuyPost<HiobuyThemeItemsResponse>('/v1/products/themes/items', {
        channel: 'taobao',
        dimension,
      });
      return { dimension, label, items: response.items.map(normalizeSearchItem) };
    } catch (error) {
      if (isChannelNotAuthorized(error)) return { dimension, label, items: [] };
      throw error;
    }
  }

  async getCollections(): Promise<HomeCollection[]> {
    return this.dimensionsCache.getOrFetch('home-collections', async () => {
      try {
        const dimensionsResponse = await hiobuyPost<HiobuyThemeDimensionsResponse>('/v1/products/themes/dimensions', {
          channel: 'taobao',
        });
        const collections = await Promise.all(
          dimensionsResponse.dimensions.map((d) => this.fetchThemeItems(d.dimension, d.label)),
        );
        return collections.filter((c) => c.items.length > 0);
      } catch (error) {
        if (isChannelNotAuthorized(error)) return [];
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
