import assert from 'node:assert/strict';
import { mock, test } from 'node:test';

import type { PaginatedResult } from '../src/types/api';
import type { NormalizedProduct } from '../src/types/product';
import type { SearchParams } from '../src/integrations/taobao/adapter.interface';
import type { HiobuySimilarResponse } from '../src/integrations/hiobuy/hiobuy.types';

const postCalls: { path: string; body: unknown }[] = [];
const searchCalls: SearchParams[] = [];
let nextSearchResult: (params: SearchParams) => PaginatedResult<NormalizedProduct> = () => ({
  items: [],
  page: 1,
  pageSize: 20,
  totalItems: 0,
  hasMore: false,
});
let nextSearchError: Error | null = null;
let nextSimilar: HiobuySimilarResponse = { items: [] };
let nextError: Error | null = null;

class FakeHiobuyRequestError extends Error {
  statusCode: number;
  code?: string;
  constructor(message: string, statusCode: number, code?: string) {
    super(message);
    this.name = 'HiobuyRequestError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

mock.module('../src/integrations/hiobuy/hiobuy.client.ts', {
  namedExports: {
    hiobuyPost: async (path: string, body: unknown) => {
      postCalls.push({ path, body });
      if (nextError) throw nextError;
      if (path === '/v1/products/similar') return nextSimilar;
      throw new Error(`unexpected path ${path}`);
    },
    HiobuyRequestError: FakeHiobuyRequestError,
  },
});

mock.module('../src/integrations/taobao/adapter.factory.ts', {
  namedExports: {
    getProductAdapter: () => ({
      search: async (params: SearchParams) => {
        searchCalls.push(params);
        if (nextSearchError) throw nextSearchError;
        return nextSearchResult(params);
      },
      getById: async () => null,
    }),
  },
});

let HiobuyHomeProvider: typeof import('../src/integrations/hiobuy/home.service.js').HiobuyHomeProvider;

test.before(async () => {
  const mod = await import('../src/integrations/hiobuy/home.service.js');
  HiobuyHomeProvider = mod.HiobuyHomeProvider;
});

function product(id: string, category: string): NormalizedProduct {
  return {
    id,
    title: `Product ${id}`,
    category,
    images: [],
    price: { amount: 10, currency: 'CNY', usdAmount: 1.5, finalAmount: 1.8 },
    skus: [],
    sourcePlatform: 'taobao',
  };
}

function resetFakes() {
  postCalls.length = 0;
  searchCalls.length = 0;
  nextSearchResult = () => ({ items: [], page: 1, pageSize: 20, totalItems: 0, hasMore: false });
  nextSearchError = null;
  nextSimilar = { items: [] };
  nextError = null;
}

test('getCollections fetches one keyword rail per configured entry via the product adapter', async () => {
  resetFakes();
  nextSearchResult = (params) => ({
    items: [product(`${params.query}-1`, 'Apparel')],
    page: 1,
    pageSize: 20,
    totalItems: 1,
    hasMore: false,
  });

  const provider = new HiobuyHomeProvider();
  const result = await provider.getCollections();

  // 4 configured keyword rails (deals/new-arrivals/best-sellers/accessories) + 1 derived category rail
  assert.equal(searchCalls.length, 4);
  const keywordDimensions = result.map((c) => c.dimension).filter((d) => !d.startsWith('category-'));
  assert.deepEqual(keywordDimensions.sort(), ['accessories', 'best-sellers', 'deals', 'new-arrivals']);
});

test('getCollections derives category rails from the keyword-seeded search results', async () => {
  resetFakes();
  nextSearchResult = (params) => ({
    items: [product(`${params.query}-a`, 'Apparel'), product(`${params.query}-b`, 'Home')],
    page: 1,
    pageSize: 20,
    totalItems: 2,
    hasMore: false,
  });

  const provider = new HiobuyHomeProvider();
  const result = await provider.getCollections();

  const categoryRails = result.filter((c) => c.dimension.startsWith('category-'));
  const categoryLabels = categoryRails.map((c) => c.label).sort();
  assert.deepEqual(categoryLabels, ['Apparel', 'Home']);
});

test('getCollections drops empty collections', async () => {
  resetFakes();
  nextSearchResult = () => ({ items: [], page: 1, pageSize: 20, totalItems: 0, hasMore: false });

  const provider = new HiobuyHomeProvider();
  const result = await provider.getCollections();

  assert.deepEqual(result, []);
});

test('getCollections returns an empty array when the product adapter throws a HiobuyRequestError', async () => {
  resetFakes();
  nextSearchError = new FakeHiobuyRequestError('rate limited', 429, 'QUOTA_EXCEEDED');

  const provider = new HiobuyHomeProvider();
  const result = await provider.getCollections();

  assert.deepEqual(result, []);
});

test('getSimilar returns an empty array when the channel is not authorized', async () => {
  resetFakes();
  nextError = new FakeHiobuyRequestError('not authorized', 401, 'CHANNEL_NOT_AUTHORIZED');

  const provider = new HiobuyHomeProvider();
  const result = await provider.getSimilar('taobao_1');

  assert.deepEqual(result, []);
});

test('getSimilar maps items on success and sends channel:taobao', async () => {
  resetFakes();
  nextSimilar = {
    items: [
      {
        id: 'taobao_2',
        source_product_id: '2',
        title: { original: 'Item', translated: 'Item EN' },
        image: 'https://example.com/i.jpg',
        price: { original_currency: 'CNY', original_amount: 20, display_currency: 'CNY', display_amount: 18 },
      },
    ],
  };

  const provider = new HiobuyHomeProvider();
  const result = await provider.getSimilar('taobao_1');

  assert.equal(result.length, 1);
  assert.equal(postCalls[0].path, '/v1/products/similar');
  assert.equal((postCalls[0].body as Record<string, unknown>).channel, 'taobao');
});
