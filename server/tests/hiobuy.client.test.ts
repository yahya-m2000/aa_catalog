import assert from 'node:assert/strict';
import { afterEach, beforeEach, test } from 'node:test';

process.env.HIO_TEST_API_KEY = 'hio_test_fixture_key';
process.env.HIOBUY_ENV = 'test';

let hiobuyPost: typeof import('../src/integrations/hiobuy/hiobuy.client.js').hiobuyPost;
let HiobuyRequestError: typeof import('../src/integrations/hiobuy/hiobuy.client.js').HiobuyRequestError;
let getLastKnownQuota: typeof import('../src/integrations/hiobuy/hiobuy.client.js').getLastKnownQuota;

test.before(async () => {
  const mod = await import('../src/integrations/hiobuy/hiobuy.client.js');
  hiobuyPost = mod.hiobuyPost;
  HiobuyRequestError = mod.HiobuyRequestError;
  getLastKnownQuota = mod.getLastKnownQuota;
});

const originalFetch = globalThis.fetch;

function jsonResponse(status: number, body: unknown, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), { status, headers });
}

let fetchCalls: { url: string; init?: RequestInit }[] = [];

beforeEach(() => {
  fetchCalls = [];
});

afterEach(() => {
  globalThis.fetch = originalFetch;
});

test('hiobuyPost sends bearer auth and returns parsed JSON on success', async () => {
  globalThis.fetch = (async (url: string, init?: RequestInit) => {
    fetchCalls.push({ url: String(url), init });
    return jsonResponse(200, { ok: true }, { 'x-quota-remaining-day': '42' });
  }) as typeof fetch;

  const result = await hiobuyPost<{ ok: boolean }>('/v1/products/detail', { product_id: '1' });

  assert.deepEqual(result, { ok: true });
  assert.equal(fetchCalls.length, 1);
  assert.equal(fetchCalls[0].url, 'https://api.hiobuy.com/v1/products/detail');
  const headers = fetchCalls[0].init?.headers as Record<string, string>;
  assert.equal(headers.Authorization, 'Bearer hio_test_fixture_key');
  assert.equal(getLastKnownQuota().quotaRemainingDay, '42');
});

test('hiobuyPost throws HiobuyRequestError with envelope details on 400 without retrying', async () => {
  globalThis.fetch = (async () => {
    fetchCalls.push({ url: 'x' });
    return jsonResponse(400, { error: { code: 'VALIDATION_ERROR', message: 'bad keyword', category: 'VALIDATION_ERROR' } });
  }) as typeof fetch;

  await assert.rejects(
    () => hiobuyPost('/v1/products/search', {}),
    (error: unknown) => {
      assert.ok(error instanceof HiobuyRequestError);
      assert.equal(error.statusCode, 400);
      assert.equal(error.code, 'VALIDATION_ERROR');
      return true;
    },
  );
  assert.equal(fetchCalls.length, 1);
});

test('hiobuyPost retries on 429 then succeeds', async () => {
  let call = 0;
  globalThis.fetch = (async () => {
    call += 1;
    fetchCalls.push({ url: 'x' });
    if (call === 1) return jsonResponse(429, { error: { code: 'RATE_LIMIT_EXCEEDED', message: 'slow down' } });
    return jsonResponse(200, { ok: true });
  }) as typeof fetch;

  const result = await hiobuyPost<{ ok: boolean }>('/v1/products/search', {});
  assert.deepEqual(result, { ok: true });
  assert.equal(fetchCalls.length, 2);
});

test('hiobuyPost retries a 502 exactly once then throws if it persists', async () => {
  globalThis.fetch = (async () => {
    fetchCalls.push({ url: 'x' });
    return jsonResponse(502, { error: { code: 'CHANNEL_UPSTREAM_ERROR', message: 'upstream down' } });
  }) as typeof fetch;

  await assert.rejects(() => hiobuyPost('/v1/products/search', {}), HiobuyRequestError);
  assert.equal(fetchCalls.length, 2);
});
