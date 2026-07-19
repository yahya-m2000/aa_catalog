import assert from 'node:assert/strict';
import { mock, test } from 'node:test';

import type { PaginatedResult } from '../src/types/api';
import type { NormalizedProduct } from '../src/types/product';
import type { ProductSourceAdapter, SearchParams } from '../src/integrations/taobao/adapter.interface';

let quotaLow = false;

mock.module('../src/integrations/hiobuy/quota.tracker.ts', {
  namedExports: {
    isQuotaLow: () => quotaLow,
  },
});

let CachedProductAdapter: typeof import('../src/integrations/hiobuy/cached.adapter.js').CachedProductAdapter;

test.before(async () => {
  const mod = await import('../src/integrations/hiobuy/cached.adapter.js');
  CachedProductAdapter = mod.CachedProductAdapter;
});

function product(id: string): NormalizedProduct {
  return {
    id,
    title: `Product ${id}`,
    images: [],
    price: { amount: 1, currency: 'CNY', usdAmount: 1, finalAmount: 1 },
    skus: [],
    sourcePlatform: 'taobao',
  };
}

class FakeAdapter implements ProductSourceAdapter {
  searchCalls = 0;
  detailCalls = 0;

  async search(params: SearchParams): Promise<PaginatedResult<NormalizedProduct>> {
    this.searchCalls += 1;
    return { items: [product('s1')], page: params.page, pageSize: params.pageSize, totalItems: 1, hasMore: false };
  }

  async getById(id: string): Promise<NormalizedProduct | null> {
    this.detailCalls += 1;
    return product(id);
  }
}

test.beforeEach(() => {
  quotaLow = false;
});

test('search caches by normalized query/sort/page/pageSize and coalesces the inner call', async () => {
  const inner = new FakeAdapter();
  const adapter = new CachedProductAdapter(inner);
  const params: SearchParams = { query: 'Jacket', sort: 'relevance', page: 1, pageSize: 20 };

  await adapter.search(params);
  await adapter.search({ ...params, query: '  jacket  ' });

  assert.equal(inner.searchCalls, 1);
});

test('search calls the inner adapter again for a different query', async () => {
  const inner = new FakeAdapter();
  const adapter = new CachedProductAdapter(inner);

  await adapter.search({ query: 'jacket', sort: 'relevance', page: 1, pageSize: 20 });
  await adapter.search({ query: 'shoes', sort: 'relevance', page: 1, pageSize: 20 });

  assert.equal(inner.searchCalls, 2);
});

test('getById caches per id', async () => {
  const inner = new FakeAdapter();
  const adapter = new CachedProductAdapter(inner);

  await adapter.getById('p1');
  await adapter.getById('p1');
  await adapter.getById('p2');

  assert.equal(inner.detailCalls, 2);
});

test('when quota is low, search returns a cached value if present without calling the inner adapter', async () => {
  const inner = new FakeAdapter();
  const adapter = new CachedProductAdapter(inner);
  const params: SearchParams = { query: 'jacket', sort: 'relevance', page: 1, pageSize: 20 };

  await adapter.search(params);
  quotaLow = true;
  const result = await adapter.search(params);

  assert.equal(inner.searchCalls, 1);
  assert.equal(result.items.length, 1);
});

test('when quota is low and there is no cached value, search returns an empty result without calling the inner adapter', async () => {
  const inner = new FakeAdapter();
  const adapter = new CachedProductAdapter(inner);
  quotaLow = true;

  const result = await adapter.search({ query: 'never-cached', sort: 'relevance', page: 2, pageSize: 10 });

  assert.equal(inner.searchCalls, 0);
  assert.deepEqual(result, { items: [], page: 2, pageSize: 10, totalItems: 0, hasMore: false });
});

test('when quota is low and there is no cached detail, getById returns null without calling the inner adapter', async () => {
  const inner = new FakeAdapter();
  const adapter = new CachedProductAdapter(inner);
  quotaLow = true;

  const result = await adapter.getById('never-cached');

  assert.equal(inner.detailCalls, 0);
  assert.equal(result, null);
});
