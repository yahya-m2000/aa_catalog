import assert from 'node:assert/strict';
import { test } from 'node:test';

import { generateOrderReference } from '../src/utils/orderReference';

test('generates a reference matching the expected high-entropy ORD-XXXXXXXXXXXX format', () => {
  const reference = generateOrderReference();
  assert.match(reference, /^ORD-[A-Z2-9]{12}$/);
});

test('generates distinct references on successive calls', () => {
  const a = generateOrderReference();
  const b = generateOrderReference();
  assert.notEqual(a, b);
});

test('does not encode the current date in the reference', () => {
  const reference = generateOrderReference();
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  assert.equal(reference.includes(datePart), false);
});
