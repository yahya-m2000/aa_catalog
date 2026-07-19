import assert from 'node:assert/strict';
import { test } from 'node:test';

import { getDeliveryFeeUsd, resolveDeliveryZone } from '../src/utils/deliveryZone';

test('resolveDeliveryZone matches Somaliland case-insensitively', () => {
  assert.equal(resolveDeliveryZone('Somaliland'), 'somaliland');
  assert.equal(resolveDeliveryZone('  SOMALILAND  '), 'somaliland');
});

test('resolveDeliveryZone falls back to the default zone for an unrecognized country', () => {
  assert.equal(resolveDeliveryZone('Atlantis'), 'somaliland');
});

test('getDeliveryFeeUsd returns the configured base fee for the resolved zone', () => {
  const fee = getDeliveryFeeUsd('Somaliland');
  assert.equal(typeof fee, 'number');
  assert.ok(fee >= 0);
});

test('getDeliveryFeeUsd returns the same fee for an unrecognized country as for the default zone', () => {
  assert.equal(getDeliveryFeeUsd('Nowhereland'), getDeliveryFeeUsd('Somaliland'));
});
