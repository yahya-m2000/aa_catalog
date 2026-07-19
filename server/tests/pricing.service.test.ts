import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  applyMarkup,
  assessPriceChange,
  calculateBasketTotals,
  convertToUSD,
  roundToPrecision,
} from '../src/services/pricing.service';
import type { BasketItem } from '../src/types/basket';
import type { PricingConfig } from '../src/config/pricing.config';

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

test('roundToPrecision rounds to 2 decimal places by default', () => {
  const config: PricingConfig = {
    markupPercentage: 0,
    serviceFeeFixedUSD: 0,
    priceIncreaseAbsorbThresholdPercent: 3,
    priceIncreaseAbsorbThresholdUSD: 3,
    roundingPrecision: 2,
    deliveryZones: {},
    defaultDeliveryZone: 'somaliland',
  };
  assert.equal(roundToPrecision(10.005, config), 10.01);
  assert.equal(roundToPrecision(10.004, config), 10);
});

const thresholdConfig: PricingConfig = {
  markupPercentage: 20,
  serviceFeeFixedUSD: 0,
  priceIncreaseAbsorbThresholdPercent: 3,
  priceIncreaseAbsorbThresholdUSD: 3,
  roundingPrecision: 2,
  deliveryZones: { somaliland: { baseUsd: 15 } },
  defaultDeliveryZone: 'somaliland',
};

test('assessPriceChange treats a price decrease as within threshold', () => {
  const result = assessPriceChange(100, 95, thresholdConfig);
  assert.equal(result.withinThreshold, true);
  assert.equal(result.deltaUsd, -5);
});

test('assessPriceChange treats no change as within threshold', () => {
  const result = assessPriceChange(100, 100, thresholdConfig);
  assert.equal(result.withinThreshold, true);
  assert.equal(result.deltaUsd, 0);
});

test('assessPriceChange absorbs an increase under both the percent and USD caps', () => {
  // 3% of 100 = 3, USD cap = 3 -> allowed = min(3, 3) = 3. A $2 increase is within threshold.
  const result = assessPriceChange(100, 102, thresholdConfig);
  assert.equal(result.withinThreshold, true);
});

test('assessPriceChange flags an increase exceeding the USD cap when the USD cap is the lower bound', () => {
  // On a $200 base, 3% = $6, but the USD cap is $3 (the lower of the two) -> $4 increase exceeds it.
  const result = assessPriceChange(200, 204, thresholdConfig);
  assert.equal(result.withinThreshold, false);
  assert.equal(result.deltaUsd, 4);
});

test('assessPriceChange flags an increase exceeding the percent cap when the percent cap is the lower bound', () => {
  // On a $50 base, 3% = $1.50 (the lower of the two, since USD cap is $3) -> $2 increase exceeds it.
  const result = assessPriceChange(50, 52, thresholdConfig);
  assert.equal(result.withinThreshold, false);
});

test('assessPriceChange treats an increase exactly at the threshold as within threshold', () => {
  // On a $100 base, allowed = min(3, 3) = 3 -> a $3 increase is exactly at the boundary.
  const result = assessPriceChange(100, 103, thresholdConfig);
  assert.equal(result.withinThreshold, true);
  assert.equal(result.deltaUsd, 3);
});

test('assessPriceChange handles a zero original quote without dividing by zero', () => {
  const result = assessPriceChange(0, 5, thresholdConfig);
  assert.equal(result.deltaPercent, 0);
  assert.equal(result.deltaUsd, 5);
});
