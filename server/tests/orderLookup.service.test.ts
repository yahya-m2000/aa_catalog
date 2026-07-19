import assert from 'node:assert/strict';
import { mock, test } from 'node:test';

import type { GraphListItem } from '../src/integrations/graph/orders.types';

let nextItem: GraphListItem | null = null;

function makeItem(overrides: Partial<GraphListItem['fields']> = {}): GraphListItem {
  return {
    id: '1',
    '@odata.etag': '"1"',
    fields: {
      OrderReference: 'ORD-ABC123XYZ789',
      CustomerFullName: 'Jane Doe',
      CustomerEmail: 'jane@example.com',
      CustomerPhone: '+1 555 123 4567',
      ShippingAddress: '123 Main St',
      City: 'Springfield',
      Postcode: '12345',
      Country: 'USA',
      PaymentMethod: 'Cash',
      CustomerStatus: 'Order Received',
      InternalStatus: 'New',
      LineItemsJson: '[]',
      SubtotalUsd: 10,
      DeliveryUsd: 0,
      ServiceFeeUsd: 0,
      MarkupUsd: 2,
      TotalUsd: 12,
      PricingPolicyVersion: 'v1',
      FxRate: 7.2,
      FxRateAt: '2026-07-19T00:00:00.000Z',
      PriceValidatedAt: '2026-07-19T00:00:00.000Z',
      CreatedAt: '2026-07-19T00:00:00.000Z',
      ExpiresAt: '2026-07-26T00:00:00.000Z',
      ...overrides,
    },
  };
}

mock.module('../src/integrations/graph/orders.repository.ts', {
  namedExports: {
    getOrderItemByReference: async (_reference: string) => nextItem,
  },
});

let lookupOrder: typeof import('../src/services/orderLookup.service.js').lookupOrder;
let OrderLookupNotFoundError: typeof import('../src/services/orderLookup.service.js').OrderLookupNotFoundError;

test.before(async () => {
  const mod = await import('../src/services/orderLookup.service.js');
  lookupOrder = mod.lookupOrder;
  OrderLookupNotFoundError = mod.OrderLookupNotFoundError;
});

test('lookupOrder returns the DTO when the reference and email both match', async () => {
  nextItem = makeItem();
  const result = await lookupOrder('ORD-ABC123XYZ789', 'jane@example.com');
  assert.equal(result.reference, 'ORD-ABC123XYZ789');
});

test('lookupOrder matches email case-insensitively', async () => {
  nextItem = makeItem();
  const result = await lookupOrder('ORD-ABC123XYZ789', 'JANE@EXAMPLE.COM');
  assert.equal(result.reference, 'ORD-ABC123XYZ789');
});

test('lookupOrder throws OrderLookupNotFoundError when the reference does not exist', async () => {
  nextItem = null;
  await assert.rejects(() => lookupOrder('ORD-NOTHING', 'jane@example.com'), OrderLookupNotFoundError);
});

test('lookupOrder throws OrderLookupNotFoundError when the email does not match', async () => {
  nextItem = makeItem();
  await assert.rejects(() => lookupOrder('ORD-ABC123XYZ789', 'wrong@example.com'), OrderLookupNotFoundError);
});

test('lookupOrder pads fast not-found responses to the same minimum duration as a real lookup', async () => {
  nextItem = null;
  const start = Date.now();
  await assert.rejects(() => lookupOrder('ORD-NOTHING', 'jane@example.com'), OrderLookupNotFoundError);
  const elapsed = Date.now() - start;
  assert.ok(elapsed >= 290, `expected padded duration >= ~300ms, got ${elapsed}ms`);
});

test('lookupOrder pads a wrong-email response to the same minimum duration as a not-found', async () => {
  nextItem = makeItem();
  const start = Date.now();
  await assert.rejects(() => lookupOrder('ORD-ABC123XYZ789', 'wrong@example.com'), OrderLookupNotFoundError);
  const elapsed = Date.now() - start;
  assert.ok(elapsed >= 290, `expected padded duration >= ~300ms, got ${elapsed}ms`);
});
