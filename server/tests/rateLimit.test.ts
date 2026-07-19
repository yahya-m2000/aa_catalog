import assert from 'node:assert/strict';
import { test } from 'node:test';

import { createRateLimiter } from '../src/middleware/rateLimit';

function makeReqRes(ip: string) {
  const req = { ip } as Parameters<ReturnType<typeof createRateLimiter>>[0];
  let statusCode = 200;
  let jsonBody: unknown;
  const res = {
    status(code: number) {
      statusCode = code;
      return res;
    },
    json(body: unknown) {
      jsonBody = body;
      return res;
    },
  } as Parameters<ReturnType<typeof createRateLimiter>>[1];
  return { req, res, getStatus: () => statusCode, getJson: () => jsonBody };
}

test('allows requests under the limit', () => {
  const limiter = createRateLimiter({ windowMs: 60_000, max: 2 });
  const { req, res } = makeReqRes('1.1.1.1');
  let nextCalled = 0;
  limiter(req, res, () => {
    nextCalled += 1;
  });
  assert.equal(nextCalled, 1);
});

test('blocks requests once the limit is exceeded within the window', () => {
  const limiter = createRateLimiter({ windowMs: 60_000, max: 2 });
  const ip = '2.2.2.2';
  let nextCalled = 0;
  const next = () => {
    nextCalled += 1;
  };

  limiter(makeReqRes(ip).req, makeReqRes(ip).res, next);
  limiter(makeReqRes(ip).req, makeReqRes(ip).res, next);
  const third = makeReqRes(ip);
  limiter(third.req, third.res, next);

  assert.equal(nextCalled, 2);
  assert.equal(third.getStatus(), 429);
  assert.equal((third.getJson() as { error: { code: string } }).error.code, 'RATE_LIMITED');
});

test('tracks separate buckets per key', () => {
  const limiter = createRateLimiter({ windowMs: 60_000, max: 1 });
  let nextCalled = 0;
  const next = () => {
    nextCalled += 1;
  };

  limiter(makeReqRes('3.3.3.3').req, makeReqRes('3.3.3.3').res, next);
  limiter(makeReqRes('4.4.4.4').req, makeReqRes('4.4.4.4').res, next);

  assert.equal(nextCalled, 2);
});
