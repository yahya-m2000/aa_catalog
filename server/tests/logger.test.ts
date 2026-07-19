import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  __resetLoggerCountersForTests,
  logCacheStats,
  logEmailDelivery,
  logHiobuyQuota,
  recordCacheOutcome,
  recordGraphCall,
  recordHiobuyCall,
} from '../src/utils/logger';

function captureConsoleLog(fn: () => void): string[] {
  const original = console.log;
  const lines: string[] = [];
  console.log = (...args: unknown[]) => {
    lines.push(args.map(String).join(' '));
  };
  try {
    fn();
  } finally {
    console.log = original;
  }
  return lines;
}

test.beforeEach(() => {
  __resetLoggerCountersForTests();
});

test('logHiobuyQuota emits only quota header fields and call counters — never a secret-shaped value', () => {
  const lines = captureConsoleLog(() => {
    logHiobuyQuota({ quotaRemainingDay: '42', quotaPackRemaining: '10', quotaBillableUnits: '1' });
  });
  assert.equal(lines.length, 1);
  const parsed = JSON.parse(lines[0]);
  assert.equal(parsed.event, 'hiobuy_quota');
  assert.equal(parsed.remainingDay, '42');
  // No field resembling an API key/token should ever be present.
  const serialized = JSON.stringify(parsed);
  assert.ok(!/hio_(test|live)_/.test(serialized));
  assert.ok(!('apiKey' in parsed));
  assert.ok(!('authorization' in parsed));
});

test('recordHiobuyCall increments the total shown in the next quota log line', () => {
  recordHiobuyCall('/v1/products/search', true);
  recordHiobuyCall('/v1/products/detail', false);
  const lines = captureConsoleLog(() => {
    logHiobuyQuota({});
  });
  const parsed = JSON.parse(lines[0]);
  assert.equal(parsed.callCountTotal, 2);
  assert.equal(parsed.callErrors, 1);
});

test('recordCacheOutcome + logCacheStats computes a correct hit rate including stale hits', () => {
  recordCacheOutcome('search', 'fresh');
  recordCacheOutcome('search', 'fresh');
  recordCacheOutcome('search', 'stale');
  recordCacheOutcome('search', 'miss');
  const lines = captureConsoleLog(() => {
    logCacheStats();
  });
  const parsed = JSON.parse(lines[0]);
  assert.equal(parsed.event, 'cache_stats');
  assert.equal(parsed.caches.search.hits, 2);
  assert.equal(parsed.caches.search.staleHits, 1);
  assert.equal(parsed.caches.search.misses, 1);
  // (2 hits + 1 stale) / 4 total = 0.75
  assert.equal(parsed.caches.search.hitRate, 0.75);
});

test('recordGraphCall logs an operation label and outcome without any Graph payload/token fields', () => {
  const lines = captureConsoleLog(() => {
    recordGraphCall('createOrderItem', true);
  });
  const parsed = JSON.parse(lines[0]);
  assert.equal(parsed.event, 'graph_call');
  assert.equal(parsed.operation, 'createOrderItem');
  assert.ok(!('clientSecret' in parsed));
  assert.ok(!('accessToken' in parsed));
});

test('recordGraphCall on failure logs a graph_error event', () => {
  const lines = captureConsoleLog(() => {
    recordGraphCall('updateOrderItemFields', false);
  });
  const parsed = JSON.parse(lines[0]);
  assert.equal(parsed.event, 'graph_error');
  assert.equal(parsed.callErrors, 1);
});

test('logEmailDelivery logs only the order reference, kind, and status — never a recipient address or body', () => {
  const lines = captureConsoleLog(() => {
    logEmailDelivery('ORD-20260719-AB3F', 'customer', 'sent');
  });
  const parsed = JSON.parse(lines[0]);
  assert.equal(parsed.event, 'email_delivery');
  assert.equal(parsed.orderReference, 'ORD-20260719-AB3F');
  assert.equal(parsed.kind, 'customer');
  assert.equal(parsed.status, 'sent');
  const keys = Object.keys(parsed).sort();
  assert.deepEqual(keys, ['event', 'kind', 'orderReference', 'status', 'ts']);
});
