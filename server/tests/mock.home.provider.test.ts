import assert from 'node:assert/strict';
import { test } from 'node:test';

import { MockHomeProvider } from '../src/integrations/taobao/mock.home.provider';
import mockProducts from '../src/integrations/taobao/mock-data/products.mock.json';

function topLevelCategory(category: string | undefined): string {
  return (category ?? 'Other').split('>')[0].trim();
}

test('getCollections includes curated deals/trending rails plus one rail per top-level category', async () => {
  const provider = new MockHomeProvider();
  const collections = await provider.getCollections();

  const dimensions = collections.map((c) => c.dimension);
  assert.ok(dimensions.includes('deals'));
  assert.ok(dimensions.includes('trending'));

  const topLevelCategories = new Set(mockProducts.map((p) => topLevelCategory(p.category)));
  const categoryCollections = collections.filter((c) => c.dimension !== 'deals' && c.dimension !== 'trending');
  assert.equal(categoryCollections.length, topLevelCategories.size);

  const categoryItemTotal = categoryCollections.reduce((sum, c) => sum + c.items.length, 0);
  assert.equal(categoryItemTotal, mockProducts.length);

  for (const collection of collections) {
    assert.ok(collection.dimension.length > 0);
    assert.ok(collection.label.length > 0);
    assert.ok(collection.items.length > 0);
  }
});

test('getSimilar returns other products sharing the same top-level category', async () => {
  const provider = new MockHomeProvider();
  const target = mockProducts[0];
  const targetTopLevel = topLevelCategory(target.category);
  const sameCategory = mockProducts.filter(
    (p) => topLevelCategory(p.category) === targetTopLevel && p.id !== target.id,
  );

  const result = await provider.getSimilar(target.id);

  assert.equal(result.length, sameCategory.length);
  assert.ok(result.every((p) => topLevelCategory(p.category) === targetTopLevel));
  assert.ok(result.every((p) => p.id !== target.id));
});

test('getSimilar returns an empty array for an unknown product id', async () => {
  const provider = new MockHomeProvider();
  const result = await provider.getSimilar('does-not-exist');

  assert.deepEqual(result, []);
});
