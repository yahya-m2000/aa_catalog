import assert from 'node:assert/strict';
import { mock, test } from 'node:test';

import type { HomeCollection, HomeCollectionsProvider } from '../src/integrations/taobao/home.interface';
import type { NormalizedProduct } from '../src/types/product';
import type { CurrencyRates } from '../src/types/currency';

function makeProduct(id: string): NormalizedProduct {
  return {
    id,
    title: `Product ${id}`,
    images: [],
    price: { amount: 100, currency: 'CNY', usdAmount: 0, finalAmount: 0 },
    skus: [
      {
        skuId: `${id}-sku-1`,
        options: [],
        price: { amount: 100, currency: 'CNY', usdAmount: 0, finalAmount: 0 },
        inventory: 5,
      },
    ],
    sourcePlatform: 'mock',
  };
}

let nextCollections: HomeCollection[] = [];
let nextSimilar: NormalizedProduct[] = [];
const fakeProvider: HomeCollectionsProvider = {
  getCollections: async () => nextCollections,
  getSimilar: async () => nextSimilar,
};

const fakeRates: CurrencyRates = { base: 'USD', rates: { CNY: 7.2, USD: 1 }, updatedAt: new Date().toISOString() };

mock.module('../src/integrations/taobao/home.factory.ts', {
  namedExports: {
    getHomeProvider: () => fakeProvider,
  },
});

mock.module('../src/integrations/currency/rates.service.ts', {
  namedExports: {
    getCurrencyRates: async () => fakeRates,
  },
});

let getHomeCollections: typeof import('../src/controllers/home.controller.js').getHomeCollections;
let getSimilarProducts: typeof import('../src/controllers/home.controller.js').getSimilarProducts;

test.before(async () => {
  const mod = await import('../src/controllers/home.controller.js');
  getHomeCollections = mod.getHomeCollections;
  getSimilarProducts = mod.getSimilarProducts;
});

function fakeResponse() {
  let statusCode = 200;
  let body: unknown;
  return {
    res: {
      status(code: number) {
        statusCode = code;
        return this;
      },
      json(payload: unknown) {
        body = payload;
      },
    } as import('express').Response,
    getStatus: () => statusCode,
    getBody: () => body,
  };
}

test('getHomeCollections applies pricing to every item in every collection', async () => {
  nextCollections = [
    { dimension: 'hot', label: 'Hot Picks', items: [makeProduct('p1'), makeProduct('p2')] },
    { dimension: 'new', label: 'New Arrivals', items: [makeProduct('p3')] },
  ];

  const { res, getBody } = fakeResponse();
  await getHomeCollections({} as import('express').Request, res);

  const body = getBody() as { success: boolean; data: HomeCollection[] };
  assert.equal(body.success, true);
  assert.equal(body.data.length, 2);
  for (const collection of body.data) {
    for (const item of collection.items) {
      assert.ok(item.price.usdAmount > 0);
      assert.ok(item.price.finalAmount > item.price.usdAmount);
      for (const sku of item.skus) {
        assert.ok(sku.price.usdAmount > 0);
        assert.ok(sku.price.finalAmount > sku.price.usdAmount);
      }
    }
  }
});

test('getSimilarProducts applies pricing to every returned item', async () => {
  nextSimilar = [makeProduct('p4'), makeProduct('p5')];

  const { res, getBody } = fakeResponse();
  await getSimilarProducts({ params: { id: 'p1' } } as unknown as import('express').Request<{ id: string }>, res);

  const body = getBody() as { success: boolean; data: NormalizedProduct[] };
  assert.equal(body.success, true);
  assert.equal(body.data.length, 2);
  for (const item of body.data) {
    assert.ok(item.price.usdAmount > 0);
    assert.ok(item.price.finalAmount > item.price.usdAmount);
  }
});

test('getHomeCollections returns an empty array when the provider has no collections', async () => {
  nextCollections = [];

  const { res, getBody } = fakeResponse();
  await getHomeCollections({} as import('express').Request, res);

  const body = getBody() as { success: boolean; data: HomeCollection[] };
  assert.equal(body.success, true);
  assert.deepEqual(body.data, []);
});
