import assert from 'node:assert/strict';
import { mock, test } from 'node:test';

mock.module('../src/config/env.ts', {
  namedExports: {
    env: { internalTaskSecret: undefined },
  },
});

let requireInternalTaskSecret: typeof import('../src/middleware/internalAuth.js').requireInternalTaskSecret;

test.before(async () => {
  const mod = await import('../src/middleware/internalAuth.js');
  requireInternalTaskSecret = mod.requireInternalTaskSecret;
});

test('requireInternalTaskSecret refuses every request when INTERNAL_TASK_SECRET is unset, even a matching-looking header', () => {
  let statusCode = 200;
  let nextCalled = false;
  const req = { header: () => 'anything' } as unknown as Parameters<typeof requireInternalTaskSecret>[0];
  const res = {
    status(code: number) {
      statusCode = code;
      return this;
    },
    json() {
      return this;
    },
  } as unknown as Parameters<typeof requireInternalTaskSecret>[1];

  requireInternalTaskSecret(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(statusCode, 401);
});
