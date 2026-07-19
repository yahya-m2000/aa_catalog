import { env } from '../../config/env';
import { CachedProductAdapter } from '../hiobuy/cached.adapter';
import { HiobuyProductAdapter } from '../hiobuy/hiobuy.adapter';
import type { ProductSourceAdapter } from './adapter.interface';
import { MockProductAdapter } from './mock.adapter';

let adapter: ProductSourceAdapter | null = null;
let uncachedAdapter: ProductSourceAdapter | null = null;

function hiobuyConfigured(): boolean {
  return env.hiobuy.env === 'live' ? Boolean(env.hiobuy.liveApiKey) : Boolean(env.hiobuy.testApiKey);
}

export function getProductAdapter(): ProductSourceAdapter {
  if (!adapter) {
    adapter = hiobuyConfigured() ? new CachedProductAdapter(new HiobuyProductAdapter()) : new MockProductAdapter();
  }
  return adapter;
}

/**
 * Uncached path, for order-submission revalidation only (plan §6/§13). Reading
 * through the browsing cache here would compare a quote against itself whenever
 * the cache entry hasn't expired yet, defeating the point of revalidating.
 */
export function getRevalidationProductAdapter(): ProductSourceAdapter {
  if (!uncachedAdapter) {
    uncachedAdapter = hiobuyConfigured() ? new HiobuyProductAdapter() : new MockProductAdapter();
  }
  return uncachedAdapter;
}
