import assert from 'node:assert/strict';
import { mock, test } from 'node:test';

import type {
  HiobuySimilarResponse,
  HiobuyThemeDimensionsResponse,
  HiobuyThemeItemsResponse,
} from '../src/integrations/hiobuy/hiobuy.types';

const postCalls: { path: string; body: unknown }[] = [];
let nextDimensions: HiobuyThemeDimensionsResponse = { dimensions: [] };
let nextThemeItems: Record<string, HiobuyThemeItemsResponse> = {};
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
      if (path === '/v1/products/themes/dimensions') return nextDimensions;
      if (path === '/v1/products/themes/items') {
        const dimension = (body as { dimension: string }).dimension;
        return nextThemeItems[dimension] ?? { dimension, items: [] };
      }
      if (path === '/v1/products/similar') return nextSimilar;
      throw new Error(`unexpected path ${path}`);
    },
    HiobuyRequestError: FakeHiobuyRequestError,
  },
});

let HiobuyHomeProvider: typeof import('../src/integrations/hiobuy/home.service.js').HiobuyHomeProvider;

test.before(async () => {
  const mod = await import('../src/integrations/hiobuy/home.service.js');
  HiobuyHomeProvider = mod.HiobuyHomeProvider;
});

function resetFakes() {
  postCalls.length = 0;
  nextDimensions = { dimensions: [] };
  nextThemeItems = {};
  nextSimilar = { items: [] };
  nextError = null;
}

test('getCollections returns an empty array when the channel is not authorized', async () => {
  resetFakes();
  nextError = new FakeHiobuyRequestError('not authorized', 401, 'CHANNEL_NOT_AUTHORIZED');

  const provider = new HiobuyHomeProvider();
  const result = await provider.getCollections();

  assert.deepEqual(result, []);
});

test('getCollections rethrows errors that are not CHANNEL_NOT_AUTHORIZED', async () => {
  resetFakes();
  nextError = new FakeHiobuyRequestError('server error', 500, 'INTERNAL_ERROR');

  const provider = new HiobuyHomeProvider();
  await assert.rejects(() => provider.getCollections(), FakeHiobuyRequestError);
});

test('getCollections fetches items for each dimension and drops empty collections', async () => {
  resetFakes();
  nextDimensions = {
    dimensions: [
      { dimension: 'hot', label: 'Hot Picks' },
      { dimension: 'empty', label: 'Nothing Here' },
    ],
  };
  nextThemeItems = {
    hot: {
      dimension: 'hot',
      items: [
        {
          id: 'taobao_1',
          source_product_id: '1',
          title: { original: 'Item', translated: 'Item EN' },
          image: 'https://example.com/i.jpg',
          price: { original_currency: 'CNY', original_amount: 10, display_currency: 'CNY', display_amount: 9 },
        },
      ],
    },
    empty: { dimension: 'empty', items: [] },
  };

  const provider = new HiobuyHomeProvider();
  const result = await provider.getCollections();

  assert.equal(result.length, 1);
  assert.equal(result[0].dimension, 'hot');
  assert.equal(result[0].items.length, 1);
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
