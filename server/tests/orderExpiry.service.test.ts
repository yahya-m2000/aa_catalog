import assert from 'node:assert/strict';
import { mock, test } from 'node:test';

process.env.GRAPH_TENANT_ID = 'tenant';
process.env.GRAPH_CLIENT_ID = 'client';
process.env.GRAPH_CLIENT_SECRET = 'secret';
process.env.GRAPH_SITE_ID = 'site';
process.env.GRAPH_ORDERS_LIST_ID = 'list';

interface UpdateCall {
  itemId: string;
  etag: string;
  customerStatus: string;
  internalStatus: string;
  extra?: Record<string, unknown>;
}

let expirableItems: Array<{ id: string; '@odata.etag': string }> = [];
const updateCalls: UpdateCall[] = [];
let updateBehavior: (itemId: string) => Promise<string> = async () => '"new-etag"';

class FakeGraphConflictError extends Error {
  statusCode = 412;
  constructor(message: string) {
    super(message);
    this.name = 'GraphConflictError';
  }
}

mock.module('../src/integrations/graph/orders.repository.ts', {
  namedExports: {
    getExpirableOrderItems: async () => expirableItems,
    updateOrderStatus: async (
      itemId: string,
      etag: string,
      customerStatus: string,
      internalStatus: string,
      extra?: Record<string, unknown>,
    ) => {
      updateCalls.push({ itemId, etag, customerStatus, internalStatus, extra });
      return updateBehavior(itemId);
    },
  },
});

mock.module('../src/integrations/graph/graph.client.ts', {
  namedExports: {
    GraphConflictError: FakeGraphConflictError,
    GraphRequestError: class GraphRequestError extends Error {},
  },
});

let runOrderExpirySweep: typeof import('../src/services/orderExpiry.service.js').runOrderExpirySweep;

test.before(async () => {
  const service = await import('../src/services/orderExpiry.service.js');
  runOrderExpirySweep = service.runOrderExpirySweep;
});

function reset() {
  expirableItems = [];
  updateCalls.length = 0;
  updateBehavior = async () => '"new-etag"';
}

test('runOrderExpirySweep does nothing when no orders are expirable', async () => {
  reset();

  const result = await runOrderExpirySweep(new Date('2026-07-19T00:00:00.000Z'));

  assert.deepEqual(result, { checked: 0, expired: 0, skippedConflict: 0, failed: 0 });
  assert.equal(updateCalls.length, 0);
});

test('runOrderExpirySweep flips CustomerStatus/InternalStatus to Expired and stamps ExpiredAt', async () => {
  reset();
  expirableItems = [{ id: '1', '@odata.etag': '"a"' }];
  const now = new Date('2026-07-19T12:00:00.000Z');

  const result = await runOrderExpirySweep(now);

  assert.equal(result.checked, 1);
  assert.equal(result.expired, 1);
  assert.equal(updateCalls.length, 1);
  assert.equal(updateCalls[0].itemId, '1');
  assert.equal(updateCalls[0].etag, '"a"');
  assert.equal(updateCalls[0].customerStatus, 'Expired');
  assert.equal(updateCalls[0].internalStatus, 'Expired');
  assert.deepEqual(updateCalls[0].extra, { ExpiredAt: now.toISOString() });
});

test('runOrderExpirySweep counts a 412 conflict as skipped, not failed, and continues to the next item', async () => {
  reset();
  expirableItems = [
    { id: '1', '@odata.etag': '"a"' },
    { id: '2', '@odata.etag': '"b"' },
  ];
  updateBehavior = async (itemId) => {
    if (itemId === '1') throw new FakeGraphConflictError('stale etag');
    return '"new-etag"';
  };

  const result = await runOrderExpirySweep();

  assert.equal(result.checked, 2);
  assert.equal(result.skippedConflict, 1);
  assert.equal(result.expired, 1);
  assert.equal(result.failed, 0);
  assert.equal(updateCalls.length, 2);
});

test('runOrderExpirySweep counts a non-conflict error as failed and continues to the next item', async () => {
  reset();
  expirableItems = [
    { id: '1', '@odata.etag': '"a"' },
    { id: '2', '@odata.etag': '"b"' },
  ];
  updateBehavior = async (itemId) => {
    if (itemId === '1') throw new Error('network blip');
    return '"new-etag"';
  };

  const result = await runOrderExpirySweep();

  assert.equal(result.checked, 2);
  assert.equal(result.failed, 1);
  assert.equal(result.expired, 1);
  assert.equal(result.skippedConflict, 0);
});
