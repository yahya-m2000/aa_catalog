import assert from 'node:assert/strict';
import { test } from 'node:test';

import { SwrCache } from '../src/utils/swrCache';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

test('getOrFetch calls the fetcher once on a cold cache and returns its value', async () => {
  const cache = new SwrCache<number>({ freshMs: 1000, staleMs: 2000 });
  let calls = 0;
  const value = await cache.getOrFetch('k', async () => {
    calls += 1;
    return 42;
  });
  assert.equal(value, 42);
  assert.equal(calls, 1);
});

test('getOrFetch returns the fresh cached value without calling the fetcher again', async () => {
  const cache = new SwrCache<number>({ freshMs: 1000, staleMs: 2000 });
  let calls = 0;
  const fetcher = async () => {
    calls += 1;
    return calls;
  };
  const first = await cache.getOrFetch('k', fetcher);
  const second = await cache.getOrFetch('k', fetcher);
  assert.equal(first, 1);
  assert.equal(second, 1);
  assert.equal(calls, 1);
});

test('concurrent getOrFetch calls for the same key coalesce into a single fetch', async () => {
  const cache = new SwrCache<number>({ freshMs: 1000, staleMs: 2000 });
  let calls = 0;
  const fetcher = async () => {
    calls += 1;
    await sleep(20);
    return 7;
  };
  const [a, b, c] = await Promise.all([
    cache.getOrFetch('k', fetcher),
    cache.getOrFetch('k', fetcher),
    cache.getOrFetch('k', fetcher),
  ]);
  assert.deepEqual([a, b, c], [7, 7, 7]);
  assert.equal(calls, 1);
});

test('a stale entry is used as a fallback when the refetch fails', async () => {
  const cache = new SwrCache<number>({ freshMs: 5, staleMs: 1000 });
  await cache.getOrFetch('k', async () => 1);
  await sleep(10);

  const value = await cache.getOrFetch('k', async () => {
    throw new Error('upstream down');
  });
  assert.equal(value, 1);
});

test('a fully expired entry (past staleMs) is not used as a fallback and the error propagates', async () => {
  const cache = new SwrCache<number>({ freshMs: 5, staleMs: 10 });
  await cache.getOrFetch('k', async () => 1);
  await sleep(20);

  await assert.rejects(
    () =>
      cache.getOrFetch('k', async () => {
        throw new Error('upstream down');
      }),
    /upstream down/,
  );
});

test('get returns null for a key that was never set', () => {
  const cache = new SwrCache<number>({ freshMs: 1000, staleMs: 2000 });
  assert.equal(cache.get('missing'), null);
});

test('clear empties both the store and any in-flight tracking', async () => {
  const cache = new SwrCache<number>({ freshMs: 1000, staleMs: 2000 });
  await cache.getOrFetch('k', async () => 1);
  cache.clear();
  assert.equal(cache.get('k'), null);
});
