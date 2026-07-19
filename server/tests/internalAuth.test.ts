import assert from 'node:assert/strict';
import { mock, test } from 'node:test';

mock.module('../src/config/env.ts', {
  namedExports: {
    env: { internalTaskSecret: 'top-secret' },
  },
});

let requireInternalTaskSecret: typeof import('../src/middleware/internalAuth.js').requireInternalTaskSecret;

test.before(async () => {
  const mod = await import('../src/middleware/internalAuth.js');
  requireInternalTaskSecret = mod.requireInternalTaskSecret;
});

function fakeReqRes(headerValue: string | undefined) {
  let statusCode = 200;
  let body: unknown;
  let nextCalled = false;
  const req = { header: (_name: string) => headerValue } as unknown as Parameters<
    typeof requireInternalTaskSecret
  >[0];
  const res = {
    status(code: number) {
      statusCode = code;
      return this;
    },
    json(payload: unknown) {
      body = payload;
      return this;
    },
  } as unknown as Parameters<typeof requireInternalTaskSecret>[1];
  const next = () => {
    nextCalled = true;
  };
  return { req, res, next, getStatus: () => statusCode, getBody: () => body, wasNextCalled: () => nextCalled };
}

test('requireInternalTaskSecret calls next() when the header matches the configured secret', () => {
  const { req, res, next, wasNextCalled } = fakeReqRes('top-secret');
  requireInternalTaskSecret(req, res, next);
  assert.equal(wasNextCalled(), true);
});

test('requireInternalTaskSecret returns 401 when the header is missing', () => {
  const { req, res, next, getStatus, wasNextCalled } = fakeReqRes(undefined);
  requireInternalTaskSecret(req, res, next);
  assert.equal(wasNextCalled(), false);
  assert.equal(getStatus(), 401);
});

test('requireInternalTaskSecret returns 401 when the header does not match', () => {
  const { req, res, next, getStatus, wasNextCalled } = fakeReqRes('wrong-secret');
  requireInternalTaskSecret(req, res, next);
  assert.equal(wasNextCalled(), false);
  assert.equal(getStatus(), 401);
});
