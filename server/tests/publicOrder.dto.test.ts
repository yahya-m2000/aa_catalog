import assert from 'node:assert/strict';
import { test } from 'node:test';

import { toPublicOrderDTO } from '../src/integrations/graph/publicOrder.dto';
import type { GraphListItem } from '../src/integrations/graph/orders.types';

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
      InternalNotes: 'secret staff note',
      LineItemsJson: JSON.stringify([
        { productId: 'p1', productTitle: 'Item One', quantity: 2 },
      ]),
      SubtotalUsd: 20,
      DeliveryUsd: 0,
      ServiceFeeUsd: 0,
      MarkupUsd: 4,
      TotalUsd: 24,
      PricingPolicyVersion: '2026-07-19',
      FxRate: 7.2,
      FxRateAt: '2026-07-19T00:00:00.000Z',
      PriceValidatedAt: '2026-07-19T00:00:00.000Z',
      CreatedAt: '2026-07-19T00:00:00.000Z',
      ExpiresAt: '2026-07-26T00:00:00.000Z',
      ...overrides,
    },
  };
}

test('toPublicOrderDTO exposes only customer-safe fields', () => {
  const dto = toPublicOrderDTO(makeItem());
  assert.deepEqual(Object.keys(dto).sort(), [
    'createdAt',
    'items',
    'paymentMethod',
    'reference',
    'status',
    'totalUsd',
  ]);
});

test('toPublicOrderDTO never leaks InternalStatus or InternalNotes', () => {
  const dto = toPublicOrderDTO(makeItem());
  const serialized = JSON.stringify(dto);
  assert.equal(serialized.includes('secret staff note'), false);
  assert.equal(serialized.includes('"New"'), false);
});

test('toPublicOrderDTO maps a known CustomerStatus straight through', () => {
  const dto = toPublicOrderDTO(makeItem({ CustomerStatus: 'Completed' }));
  assert.equal(dto.status, 'Completed');
});

test('toPublicOrderDTO falls back to a generic label for an unrecognized status', () => {
  const dto = toPublicOrderDTO(makeItem({ CustomerStatus: 'SomeUnexpectedValue' as never }));
  assert.equal(dto.status, 'Processing');
});

test('toPublicOrderDTO parses valid LineItemsJson', () => {
  const dto = toPublicOrderDTO(makeItem());
  assert.deepEqual(dto.items, [{ productId: 'p1', productTitle: 'Item One', quantity: 2 }]);
});

test('toPublicOrderDTO degrades to an empty list on malformed LineItemsJson (not valid JSON)', () => {
  const dto = toPublicOrderDTO(makeItem({ LineItemsJson: 'not json{{{' }));
  assert.deepEqual(dto.items, []);
});

test('toPublicOrderDTO degrades to an empty list on well-formed but schema-invalid LineItemsJson', () => {
  const dto = toPublicOrderDTO(makeItem({ LineItemsJson: JSON.stringify({ not: 'an array' }) }));
  assert.deepEqual(dto.items, []);
});

test('toPublicOrderDTO degrades to an empty list when line items are missing required fields', () => {
  const dto = toPublicOrderDTO(makeItem({ LineItemsJson: JSON.stringify([{ productTitle: 'Missing productId' }]) }));
  assert.deepEqual(dto.items, []);
});
