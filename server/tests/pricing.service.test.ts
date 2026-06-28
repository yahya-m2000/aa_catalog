import assert from 'node:assert/strict';
import { test } from 'node:test';

import { applyMarkup, calculateBasketTotals, convertToUSD } from '../src/services/pricing.service';
import type { BasketItem } from '../src/types/basket';

test('convertToUSD returns the same amount when currency is already USD', () => {
  const result = convertToUSD(100, 'USD', { USD: 1, CNY: 7.2 });
  assert.equal(result, 100);
});

test('convertToUSD divides by the rate for a non-USD currency', () => {
  const result = convertToUSD(72, 'CNY', { USD: 1, CNY: 7.2 });
  assert.equal(result, 10);
});

test('applyMarkup adds percentage markup and fixed fee', () => {
  const result = applyMarkup(100, { markupPercentage: 20, serviceFeeFixedUSD: 2 });
  assert.equal(result, 122);
});

test('applyMarkup with zero markup and zero fee returns the same amount', () => {
  const result = applyMarkup(50, { markupPercentage: 0, serviceFeeFixedUSD: 0 });
  assert.equal(result, 50);
});

test('calculateBasketTotals sums subtotal, markup, and final total across quantities', () => {
  const items: BasketItem[] = [
    {
      productId: 'p1',
      productTitle: 'Item One',
      productImageUrl: 'https://example.com/1.jpg',
      quantity: 2,
      unitPrice: { amount: 10, currency: 'USD', usdAmount: 10, finalAmount: 12 },
    },
    {
      productId: 'p2',
      productTitle: 'Item Two',
      productImageUrl: 'https://example.com/2.jpg',
      quantity: 1,
      unitPrice: { amount: 7.2, currency: 'CNY', usdAmount: 1, finalAmount: 1.2 },
    },
  ];

  const totals = calculateBasketTotals(items);

  assert.equal(totals.subtotalUSD, 21);
  assert.equal(Math.round(totals.markupTotalUSD * 100) / 100, 4.2);
  assert.equal(Math.round(totals.finalTotalUSD * 100) / 100, 25.2);
});

test('calculateBasketTotals returns zeroed totals for an empty basket', () => {
  const totals = calculateBasketTotals([]);
  assert.deepEqual(totals, { subtotalUSD: 0, markupTotalUSD: 0, finalTotalUSD: 0 });
});
