import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { HiobuyQuotaHeaders } from '../src/integrations/hiobuy/hiobuy.types';

let nextQuota: HiobuyQuotaHeaders = {};

import { mock } from 'node:test';

mock.module('../src/integrations/hiobuy/hiobuy.client.ts', {
  namedExports: {
    getLastKnownQuota: () => nextQuota,
  },
});

let isQuotaLow: typeof import('../src/integrations/hiobuy/quota.tracker.js').isQuotaLow;

test.before(async () => {
  const mod = await import('../src/integrations/hiobuy/quota.tracker.js');
  isQuotaLow = mod.isQuotaLow;
});

test('returns false when no quota header has ever been captured', () => {
  nextQuota = {};
  assert.equal(isQuotaLow(), false);
});

test('returns false when remaining quota is comfortably above the warning threshold', () => {
  nextQuota = { quotaRemainingDay: '500' };
  assert.equal(isQuotaLow(), false);
});

test('returns true when remaining quota is below the warning threshold', () => {
  nextQuota = { quotaRemainingDay: '3' };
  assert.equal(isQuotaLow(), true);
});

test('returns false when the header value is not a parseable number', () => {
  nextQuota = { quotaRemainingDay: 'not-a-number' };
  assert.equal(isQuotaLow(), false);
});
