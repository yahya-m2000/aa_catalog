import assert from 'node:assert/strict';
import { test } from 'node:test';

import { generateOrderReference } from '../src/utils/orderReference';

test('generates a reference matching the expected ORD-YYYYMMDD-XXXX format', () => {
  const reference = generateOrderReference(new Date('2026-06-28T10:00:00.000Z'));
  assert.match(reference, /^ORD-20260628-[A-Z0-9]{4}$/);
});

test('generates distinct references on successive calls', () => {
  const a = generateOrderReference();
  const b = generateOrderReference();
  assert.notEqual(a, b);
});
