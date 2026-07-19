import assert from 'node:assert/strict';
import { test } from 'node:test';

import { MockHomeProvider } from '../src/integrations/taobao/mock.home.provider';
import mockProducts from '../src/integrations/taobao/mock-data/products.mock.json';

test('getCollections groups every mock product into a collection keyed by its category', async () => {
  const provider = new MockHomeProvider();
  const collections = await provider.getCollections();

  const totalItems = collections.reduce((sum, c) => sum + c.items.length, 0);
  assert.equal(totalItems, mockProducts.length);

  const categories = new Set(mockProducts.map((p) => p.category));
  assert.equal(collections.length, categories.size);

  for (const collection of collections) {
    assert.ok(collection.dimension.length > 0);
    assert.ok(collection.label.length > 0);
    assert.ok(collection.items.length > 0);
  }
});

test('getSimilar returns other products sharing the same category', async () => {
  const provider = new MockHomeProvider();
  const target = mockProducts[0];
  const sameCategory = mockProducts.filter(
    (p) => p.category === target.category && p.id !== target.id,
  );

  const result = await provider.getSimilar(target.id);

  assert.equal(result.length, sameCategory.length);
  assert.ok(result.every((p) => p.category === target.category));
  assert.ok(result.every((p) => p.id !== target.id));
});

test('getSimilar returns an empty array for an unknown product id', async () => {
  const provider = new MockHomeProvider();
  const result = await provider.getSimilar('does-not-exist');

  assert.deepEqual(result, []);
});
