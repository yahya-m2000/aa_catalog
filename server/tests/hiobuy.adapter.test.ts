import assert from 'node:assert/strict';
import { mock, test } from 'node:test';

import type {
  HiobuyProductDetail,
  HiobuyProductDetailResponse,
  HiobuySearchResponse,
} from '../src/integrations/hiobuy/hiobuy.types';

let nextSearchResponse: HiobuySearchResponse = { page: 1, page_size: 20, total: 0, items: [] };
let nextDetailProduct: HiobuyProductDetail | null = null;
let nextDetailError: Error | null = null;
const postCalls: { path: string; body: unknown }[] = [];

class FakeHiobuyRequestError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'HiobuyRequestError';
    this.statusCode = statusCode;
  }
}

mock.module('../src/integrations/hiobuy/hiobuy.client.ts', {
  namedExports: {
    hiobuyPost: async (path: string, body: unknown) => {
      postCalls.push({ path, body });
      if (path === '/v1/products/detail') {
        if (nextDetailError) throw nextDetailError;
        const response: HiobuyProductDetailResponse | null = nextDetailProduct
          ? { product: nextDetailProduct, request_id: 'req_test' }
          : null;
        return response;
      }
      return nextSearchResponse;
    },
    HiobuyRequestError: FakeHiobuyRequestError,
  },
});

let HiobuyProductAdapter: typeof import('../src/integrations/hiobuy/hiobuy.adapter.js').HiobuyProductAdapter;

test.before(async () => {
  const mod = await import('../src/integrations/hiobuy/hiobuy.adapter.js');
  HiobuyProductAdapter = mod.HiobuyProductAdapter;
});

function resetFakes() {
  postCalls.length = 0;
  nextDetailError = null;
  nextDetailProduct = null;
  nextSearchResponse = { page: 1, page_size: 20, total: 0, items: [] };
}

test('search returns empty result without calling HIOBuy when query is empty', async () => {
  resetFakes();
  const adapter = new HiobuyProductAdapter();
  const result = await adapter.search({ query: undefined, sort: 'relevance', page: 1, pageSize: 20 });

  assert.deepEqual(result, { items: [], page: 1, pageSize: 20, totalItems: 0, hasMore: false });
  assert.equal(postCalls.length, 0);
});

test('search sends channel:taobao and maps sort to sort_field', async () => {
  resetFakes();
  nextSearchResponse = {
    page: 1,
    page_size: 20,
    total: 1,
    items: [
      {
        id: 'taobao_1',
        source_product_id: '1',
        title: { original: 'Item', translated: 'Item EN' },
        image: 'https://example.com/t.jpg',
        price: { original_currency: 'CNY', original_amount: 10, display_currency: 'CNY', display_amount: 9 },
      },
    ],
  };

  const adapter = new HiobuyProductAdapter();
  const result = await adapter.search({ query: 'jacket', sort: 'price_asc', page: 1, pageSize: 20 });

  assert.equal(postCalls.length, 1);
  assert.equal(postCalls[0].path, '/v1/products/search');
  const body = postCalls[0].body as Record<string, unknown>;
  assert.equal(body.channel, 'taobao');
  assert.equal(body.keyword, 'jacket');
  assert.equal(body.sort_field, 'price');
  assert.equal(result.items.length, 1);
  assert.equal(result.items[0].title, 'Item EN');
});

test('search caps page_size at 50', async () => {
  resetFakes();
  const adapter = new HiobuyProductAdapter();
  await adapter.search({ query: 'jacket', sort: 'relevance', page: 1, pageSize: 200 });

  const body = postCalls[0].body as Record<string, unknown>;
  assert.equal(body.page_size, 50);
});

test('getById returns a normalized product on success', async () => {
  resetFakes();
  nextDetailProduct = {
    id: 'taobao_1',
    source_product_id: '1',
    title: { original: 'Item', translated: 'Item EN' },
    price: { original_currency: 'CNY', original_amount: 10, display_currency: 'CNY', display_amount: 9 },
    images: [],
    variants: [],
  };

  const adapter = new HiobuyProductAdapter();
  const result = await adapter.getById('taobao_1');

  assert.equal(postCalls[0].path, '/v1/products/detail');
  assert.equal((postCalls[0].body as Record<string, unknown>).channel, 'taobao');
  assert.equal(result?.id, 'taobao_1');
});

test('getById returns null on a 404 HiobuyRequestError', async () => {
  resetFakes();
  nextDetailError = new FakeHiobuyRequestError('not found', 404);

  const adapter = new HiobuyProductAdapter();
  const result = await adapter.getById('missing');

  assert.equal(result, null);
});

test('getById rethrows non-404 errors', async () => {
  resetFakes();
  nextDetailError = new FakeHiobuyRequestError('server error', 500);

  const adapter = new HiobuyProductAdapter();
  await assert.rejects(() => adapter.getById('id'), FakeHiobuyRequestError);
});
