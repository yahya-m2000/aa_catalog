import assert from 'node:assert/strict';
import { mock, test } from 'node:test';

process.env.GRAPH_TENANT_ID = 'tenant';
process.env.GRAPH_CLIENT_ID = 'client';
process.env.GRAPH_CLIENT_SECRET = 'secret';
process.env.GRAPH_SITE_ID = 'site';
process.env.GRAPH_ORDERS_LIST_ID = 'list';
process.env.HIOBUY_RECEIVER_NAME = 'Test Receiver';
process.env.HIOBUY_RECEIVER_MOBILE = '13800000000';
process.env.HIOBUY_RECEIVER_PROVINCE = 'Guangdong';
process.env.HIOBUY_RECEIVER_CITY = 'Shenzhen';
process.env.HIOBUY_RECEIVER_ADDRESS = '1 Test Road';

function makeLineItemsJson(overrides: Partial<{ sourceProductId: string | null; skuId: string | null }> = {}) {
  const sourceProductId = 'sourceProductId' in overrides ? overrides.sourceProductId : '554456348334';
  const skuId = 'skuId' in overrides ? overrides.skuId : 'sku-1';
  return JSON.stringify([
    {
      productId: 'taobao_554456348334',
      productTitle: 'Test Product',
      ...(skuId !== null ? { skuId } : {}),
      quantity: 2,
      originalAmount: 100,
      originalCurrency: 'CNY',
      usdAmount: 14,
      markupAmount: 2.8,
      finalAmount: 16.8,
      ...(sourceProductId !== null ? { sourceProductId } : {}),
    },
  ]);
}

function makeItem(fields: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'item-1',
    '@odata.etag': '"etag-1"',
    fields: {
      OrderReference: 'ORD-TEST1234',
      InternalStatus: 'Payment Confirmed',
      LineItemsJson: makeLineItemsJson(),
      ...fields,
    },
  };
}

class FakeGraphConflictError extends Error {
  statusCode = 412;
  constructor(message: string) {
    super(message);
    this.name = 'GraphConflictError';
  }
}

let currentItem: ReturnType<typeof makeItem> | null = null;
const updateCalls: Array<{ itemId: string; etag: string; fields: Record<string, unknown> }> = [];
let updateBehavior: () => Promise<string> = async () => '"etag-2"';
let createBehavior: () => Promise<{ order_id: string }> = async () => ({ order_id: 'hio-order-1' });
let payBehavior: (orderId: string) => Promise<{ order_id: string; status: string }> = async (orderId) => ({
  order_id: orderId,
  status: 'PAID',
});
const createCalls: unknown[] = [];
const payCalls: string[] = [];

mock.module('../src/integrations/graph/orders.repository.ts', {
  namedExports: {
    getOrderItemByReference: async () => currentItem,
    updateOrderItemFields: async (itemId: string, etag: string, fields: Record<string, unknown>) => {
      updateCalls.push({ itemId, etag, fields });
      return updateBehavior();
    },
  },
});

mock.module('../src/integrations/graph/graph.client.ts', {
  namedExports: {
    GraphConflictError: FakeGraphConflictError,
    GraphRequestError: class GraphRequestError extends Error {},
  },
});

mock.module('../src/integrations/hiobuy/procurement.client.ts', {
  namedExports: {
    createHiobuyOrder: async (request: unknown) => {
      createCalls.push(request);
      return createBehavior();
    },
    payHiobuyOrder: async (orderId: string) => {
      payCalls.push(orderId);
      return payBehavior(orderId);
    },
  },
});

let procureOrder: typeof import('../src/services/procurement.service.js').procureOrder;
let ProcurementError: typeof import('../src/services/procurement.service.js').ProcurementError;

test.before(async () => {
  const mod = await import('../src/services/procurement.service.js');
  procureOrder = mod.procureOrder;
  ProcurementError = mod.ProcurementError;
});

function reset() {
  currentItem = null;
  updateCalls.length = 0;
  createCalls.length = 0;
  payCalls.length = 0;
  updateBehavior = async () => '"etag-2"';
  createBehavior = async () => ({ order_id: 'hio-order-1' });
  payBehavior = async (orderId) => ({ order_id: orderId, status: 'PAID' });
}

test('procureOrder throws ORDER_NOT_FOUND when the reference does not exist', async () => {
  reset();
  await assert.rejects(() => procureOrder('ORD-MISSING'), (error: unknown) => {
    assert.ok(error instanceof ProcurementError);
    assert.equal(error.code, 'ORDER_NOT_FOUND');
    return true;
  });
  assert.equal(createCalls.length, 0);
});

test('procureOrder refuses when InternalStatus is not "Payment Confirmed"', async () => {
  reset();
  currentItem = makeItem({ InternalStatus: 'New' });
  await assert.rejects(() => procureOrder('ORD-TEST1234'), (error: unknown) => {
    assert.ok(error instanceof ProcurementError);
    assert.equal(error.code, 'WRONG_STATUS');
    return true;
  });
  assert.equal(createCalls.length, 0);
});

test('procureOrder refuses when the order was already procured (HiobuyOrderId set)', async () => {
  reset();
  currentItem = makeItem({ HiobuyOrderId: 'hio-order-old' });
  await assert.rejects(() => procureOrder('ORD-TEST1234'), (error: unknown) => {
    assert.ok(error instanceof ProcurementError);
    assert.equal(error.code, 'ALREADY_PROCURED');
    return true;
  });
  assert.equal(createCalls.length, 0);
});

test('procureOrder refuses when a line item is missing sourceProductId/skuId', async () => {
  reset();
  currentItem = makeItem({ LineItemsJson: makeLineItemsJson({ sourceProductId: null }) });
  await assert.rejects(() => procureOrder('ORD-TEST1234'), (error: unknown) => {
    assert.ok(error instanceof ProcurementError);
    assert.equal(error.code, 'MISSING_SOURCE_IDS');
    return true;
  });
  assert.equal(createCalls.length, 0);
});

test('procureOrder maps sourceProductId/skuId to offer_id/spec_id and calls create then pay', async () => {
  reset();
  currentItem = makeItem();

  const result = await procureOrder('ORD-TEST1234');

  assert.equal(createCalls.length, 1);
  const createRequest = createCalls[0] as { lines: Array<{ offer_id: string; spec_id: string; quantity: number }>; external_order_id: string };
  assert.deepEqual(createRequest.lines, [{ offer_id: '554456348334', spec_id: 'sku-1', quantity: 2 }]);
  assert.equal(createRequest.external_order_id, 'ORD-TEST1234');

  assert.deepEqual(payCalls, ['hio-order-1']);

  assert.equal(result.hiobuyOrderId, 'hio-order-1');
  assert.equal(result.hiobuyPurchaseStatus, 'PAID');

  assert.equal(updateCalls.length, 2);
  assert.equal(updateCalls[0].fields.HiobuyOrderId, 'hio-order-1');
  assert.equal(updateCalls[0].etag, '"etag-1"');
  assert.equal(updateCalls[1].fields.HiobuyOrderId, 'hio-order-1');
  assert.equal(updateCalls[1].fields.InternalStatus, 'Procuring');
  assert.equal(updateCalls[1].etag, '"etag-2"');
});

test('procureOrder records HiobuyOrderId immediately after create succeeds, before calling pay', async () => {
  reset();
  currentItem = makeItem();
  const callOrder: string[] = [];
  const originalUpdateBehavior = updateBehavior;
  updateBehavior = async () => {
    callOrder.push('update');
    return originalUpdateBehavior();
  };
  payBehavior = async (orderId) => {
    callOrder.push('pay');
    return { order_id: orderId, status: 'PAID' };
  };

  await procureOrder('ORD-TEST1234');

  assert.deepEqual(callOrder, ['update', 'pay', 'update']);
  assert.equal(updateCalls[0].fields.HiobuyOrderId, 'hio-order-1');
  assert.ok(!('InternalStatus' in updateCalls[0].fields), 'early write should only set HiobuyOrderId');
});

test('procureOrder does not call pay and surfaces GRAPH_CONFLICT when the early HiobuyOrderId write fails', async () => {
  reset();
  currentItem = makeItem();
  updateBehavior = async () => {
    throw new FakeGraphConflictError('stale etag');
  };

  await assert.rejects(() => procureOrder('ORD-TEST1234'), (error: unknown) => {
    assert.ok(error instanceof ProcurementError);
    assert.equal(error.code, 'GRAPH_CONFLICT');
    return true;
  });

  assert.equal(createCalls.length, 1);
  assert.equal(payCalls.length, 0);
  assert.equal(updateCalls.length, 1);
});

test('a retry after the early HiobuyOrderId write succeeds is rejected as ALREADY_PROCURED, not a second create', async () => {
  reset();
  currentItem = makeItem();
  await procureOrder('ORD-TEST1234');

  // Simulate the SharePoint state after the early write: HiobuyOrderId is now set.
  currentItem = makeItem({ HiobuyOrderId: 'hio-order-1' });
  createCalls.length = 0;

  await assert.rejects(() => procureOrder('ORD-TEST1234'), (error: unknown) => {
    assert.ok(error instanceof ProcurementError);
    assert.equal(error.code, 'ALREADY_PROCURED');
    return true;
  });
  assert.equal(createCalls.length, 0);
});

test('procureOrder records a Needs Review outcome and does not retry create when pay fails', async () => {
  reset();
  currentItem = makeItem();
  payBehavior = async () => {
    throw new Error('payment declined');
  };

  await assert.rejects(() => procureOrder('ORD-TEST1234'), (error: unknown) => {
    assert.ok(error instanceof ProcurementError);
    assert.equal(error.code, 'HIOBUY_ERROR');
    return true;
  });

  assert.equal(createCalls.length, 1);
  assert.equal(updateCalls.length, 2);
  assert.equal(updateCalls[0].fields.HiobuyOrderId, 'hio-order-1');
  assert.equal(updateCalls[1].fields.HiobuyOrderId, 'hio-order-1');
  assert.equal(updateCalls[1].fields.HiobuyPurchaseStatus, 'Pay Failed');
  assert.equal(updateCalls[1].fields.InternalStatus, 'Needs Review');
});

test('procureOrder surfaces a GRAPH_CONFLICT without implying HIOBuy failed when the post-pay SharePoint update hits a stale etag', async () => {
  reset();
  currentItem = makeItem();
  let updateCallCount = 0;
  updateBehavior = async () => {
    updateCallCount += 1;
    if (updateCallCount === 1) {
      // Early HiobuyOrderId write (before pay) succeeds.
      return '"etag-2"';
    }
    // Final outcome write (after pay) hits a stale etag.
    throw new FakeGraphConflictError('stale etag');
  };

  await assert.rejects(() => procureOrder('ORD-TEST1234'), (error: unknown) => {
    assert.ok(error instanceof ProcurementError);
    assert.equal(error.code, 'GRAPH_CONFLICT');
    return true;
  });

  assert.equal(createCalls.length, 1);
  assert.equal(payCalls.length, 1);
  assert.equal(updateCalls.length, 2);
});
