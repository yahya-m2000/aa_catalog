import assert from 'node:assert/strict';
import { test } from 'node:test';

import { normalizeProductDetail, normalizeSearchItem } from '../src/integrations/hiobuy/hiobuy.normalize';
import type { HiobuyProductDetail, HiobuySearchItem } from '../src/integrations/hiobuy/hiobuy.types';

test('normalizeProductDetail maps translated title, description, images, and variants', () => {
  const raw: HiobuyProductDetail = {
    id: 'taobao_123456',
    source_product_id: '123456',
    title: { original: '男士夹克', translated: "Men's Jacket", language: 'en' },
    description: { original: '一件保暖夹克', translated: 'A warm jacket' },
    price: { original_currency: 'CNY', original_amount: 100, display_currency: 'CNY', display_amount: 89 },
    images: [
      { url: 'https://example.com/gallery.jpg', type: 'gallery' },
      { url: 'https://example.com/main.jpg', type: 'main' },
    ],
    variants: [
      {
        sku_id: 'sku-1',
        attributes: [{ name: 'Color', value: 'Red' }],
        price: { original_currency: 'CNY', original_amount: 100, display_currency: 'CNY', display_amount: 89 },
        stock: 12,
        image: 'https://example.com/sku-1.jpg',
      },
    ],
    seller: { id: 'seller-1', name: 'Great Shop' },
    category: 'Outerwear',
  };

  const normalized = normalizeProductDetail(raw);

  assert.equal(normalized.id, 'taobao_123456');
  assert.equal(normalized.title, "Men's Jacket");
  assert.equal(normalized.description, 'A warm jacket');
  assert.equal(normalized.sellerName, 'Great Shop');
  assert.equal(normalized.price.amount, 89);
  assert.equal(normalized.price.currency, 'CNY');
  assert.equal(normalized.images.find((img) => img.url.includes('main'))?.isPrimary, true);
  assert.equal(normalized.skus.length, 1);
  assert.deepEqual(normalized.skus[0].options, [{ name: 'Color', value: 'Red' }]);
  assert.equal(normalized.skus[0].inventory, 12);
  assert.equal(normalized.sourcePlatform, 'taobao');
});

test('normalizeProductDetail falls back to original title/description when no translation is present', () => {
  const raw: HiobuyProductDetail = {
    id: 'taobao_1',
    source_product_id: '1',
    title: { original: '男士夹克' },
    description: { original: '一件保暖夹克' },
    price: { original_currency: 'CNY', original_amount: 100, display_currency: 'CNY', display_amount: 89 },
    images: [],
    variants: [],
  };

  const normalized = normalizeProductDetail(raw);
  assert.equal(normalized.title, '男士夹克');
  assert.equal(normalized.description, '一件保暖夹克');
});

test('normalizeSearchItem maps an image into a single primary image', () => {
  const raw: HiobuySearchItem = {
    id: 'taobao_2',
    source_product_id: '2',
    title: { original: 'Item', translated: 'Item EN' },
    image: 'https://example.com/thumb.jpg',
    price: { original_currency: 'CNY', original_amount: 50, display_currency: 'CNY', display_amount: 45 },
    seller: { name: 'Shop' },
  };

  const normalized = normalizeSearchItem(raw);
  assert.equal(normalized.images.length, 1);
  assert.equal(normalized.images[0].isPrimary, true);
  assert.equal(normalized.skus.length, 0);
  assert.equal(normalized.price.amount, 45);
});
