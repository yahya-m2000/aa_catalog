import assert from 'node:assert/strict';
import { test } from 'node:test';

import { createOrderSchema, orderLookupSchema } from '../src/schemas/checkout.schema';

const validCustomer = {
  fullName: 'Jane Doe',
  email: 'jane@example.com',
  phone: '+1 555 123 4567',
  shippingAddress: '123 Main St',
  city: 'Springfield',
  postcode: '12345',
  country: 'USA',
};

test('accepts a valid order payload', () => {
  const result = createOrderSchema.safeParse({
    customer: validCustomer,
    paymentMethod: 'Cash',
    items: [{ productId: 'p1', quantity: 1 }],
  });
  assert.equal(result.success, true);
});

test('rejects an invalid email format', () => {
  const result = createOrderSchema.safeParse({
    customer: { ...validCustomer, email: 'not-an-email' },
    paymentMethod: 'Cash',
    items: [{ productId: 'p1', quantity: 1 }],
  });
  assert.equal(result.success, false);
});

test('rejects an empty phone number', () => {
  const result = createOrderSchema.safeParse({
    customer: { ...validCustomer, phone: '' },
    paymentMethod: 'Cash',
    items: [{ productId: 'p1', quantity: 1 }],
  });
  assert.equal(result.success, false);
});

test('rejects a missing required field', () => {
  const { fullName, ...customerWithoutName } = validCustomer;
  const result = createOrderSchema.safeParse({
    customer: customerWithoutName,
    paymentMethod: 'Cash',
    items: [{ productId: 'p1', quantity: 1 }],
  });
  assert.equal(result.success, false);
});

test('rejects an empty items array', () => {
  const result = createOrderSchema.safeParse({
    customer: validCustomer,
    paymentMethod: 'Cash',
    items: [],
  });
  assert.equal(result.success, false);
});

test('rejects a quantity less than 1', () => {
  const result = createOrderSchema.safeParse({
    customer: validCustomer,
    paymentMethod: 'Cash',
    items: [{ productId: 'p1', quantity: 0 }],
  });
  assert.equal(result.success, false);
});

test('rejects an invalid payment method', () => {
  const result = createOrderSchema.safeParse({
    customer: validCustomer,
    paymentMethod: 'Card',
    items: [{ productId: 'p1', quantity: 1 }],
  });
  assert.equal(result.success, false);
});

test('defaults to Cash when payment method is omitted (checkout UI does not collect it yet)', () => {
  const result = createOrderSchema.safeParse({
    customer: validCustomer,
    items: [{ productId: 'p1', quantity: 1 }],
  });
  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.data.paymentMethod, 'Cash');
  }
});

test('strips unexpected client-submitted price fields rather than trusting them', () => {
  const result = createOrderSchema.safeParse({
    customer: validCustomer,
    paymentMethod: 'Cash',
    items: [{ productId: 'p1', quantity: 1, finalAmount: 0.01 }],
  });
  assert.equal(result.success, true);
  if (result.success) {
    assert.equal('finalAmount' in result.data.items[0], false);
  }
});

test('orderLookupSchema accepts a valid reference and email', () => {
  const result = orderLookupSchema.safeParse({ reference: 'ORD-ABC123XYZ789', email: 'jane@example.com' });
  assert.equal(result.success, true);
});

test('orderLookupSchema rejects a missing reference', () => {
  const result = orderLookupSchema.safeParse({ email: 'jane@example.com' });
  assert.equal(result.success, false);
});

test('orderLookupSchema rejects an invalid email', () => {
  const result = orderLookupSchema.safeParse({ reference: 'ORD-ABC123XYZ789', email: 'not-an-email' });
  assert.equal(result.success, false);
});
