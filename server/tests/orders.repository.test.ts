import assert from 'node:assert/strict';
import { mock, test } from 'node:test';

process.env.GRAPH_TENANT_ID = 'tenant';
process.env.GRAPH_CLIENT_ID = 'client';
process.env.GRAPH_CLIENT_SECRET = 'secret';
process.env.GRAPH_SITE_ID = 'site';
process.env.GRAPH_ORDERS_LIST_ID = 'list';

interface FakeCall {
  method: 'post' | 'patch' | 'get';
  path: string;
  header?: [string, string];
  body?: unknown;
  filterValue?: string;
}

const calls: FakeCall[] = [];
let nextPostResponse: unknown = { id: '1', '@odata.etag': '"1"' };
let nextPatchResponse: unknown = { '@odata.etag': '"2"' };
let nextGetResponse: unknown = { value: [] };
let nextError: (Error & { statusCode?: number }) | null = null;

function makeFakeClient() {
  return {
    api(path: string) {
      let headerPair: [string, string] | undefined;
      let filterValue: string | undefined;
      const chain = {
        header(name: string, value: string) {
          headerPair = [name, value];
          return chain;
        },
        filter(value: string) {
          filterValue = value;
          return chain;
        },
        expand() {
          return chain;
        },
        async post(body: unknown) {
          calls.push({ method: 'post', path, body });
          if (nextError) throw nextError;
          return nextPostResponse;
        },
        async patch(body: unknown) {
          calls.push({ method: 'patch', path, header: headerPair, body });
          if (nextError) throw nextError;
          return nextPatchResponse;
        },
        async get() {
          calls.push({ method: 'get', path, filterValue });
          if (nextError) throw nextError;
          return nextGetResponse;
        },
      };
      return chain;
    },
  };
}

mock.module('../src/integrations/graph/graph.client.ts', {
  namedExports: {
    getGraphClient: () => makeFakeClient(),
    GraphRequestError: class GraphRequestError extends Error {
      statusCode?: number;
      cause?: unknown;
      constructor(message: string, statusCode?: number, cause?: unknown) {
        super(message);
        this.name = 'GraphRequestError';
        this.statusCode = statusCode;
        this.cause = cause;
      }
    },
    GraphConflictError: class GraphConflictError extends Error {
      statusCode = 412;
      cause?: unknown;
      constructor(message: string, cause?: unknown) {
        super(message);
        this.name = 'GraphConflictError';
        this.cause = cause;
      }
    },
  },
});

let createOrderItem: typeof import('../src/integrations/graph/orders.repository.js').createOrderItem;
let getOrderItemByReference: typeof import('../src/integrations/graph/orders.repository.js').getOrderItemByReference;
let getExpirableOrderItems: typeof import('../src/integrations/graph/orders.repository.js').getExpirableOrderItems;
let updateEmailStatus: typeof import('../src/integrations/graph/orders.repository.js').updateEmailStatus;
let GraphConflictError: typeof import('../src/integrations/graph/graph.client.js').GraphConflictError;

test.before(async () => {
  const repo = await import('../src/integrations/graph/orders.repository.js');
  const client = await import('../src/integrations/graph/graph.client.js');
  createOrderItem = repo.createOrderItem;
  getOrderItemByReference = repo.getOrderItemByReference;
  getExpirableOrderItems = repo.getExpirableOrderItems;
  updateEmailStatus = repo.updateEmailStatus;
  GraphConflictError = client.GraphConflictError;
});

function resetFakes() {
  calls.length = 0;
  nextError = null;
  nextPostResponse = { id: '1', '@odata.etag': '"1"' };
  nextPatchResponse = { '@odata.etag': '"2"' };
  nextGetResponse = {
    fields: { LineItemsJson: '[]', InternalNotes: 'existing note' },
  };
}

test('createOrderItem posts fields mapped from the input DTO', async () => {
  resetFakes();
  const input = {
    reference: 'ORD-ABC123XYZ789',
    customer: {
      fullName: 'Jane Doe',
      email: 'jane@example.com',
      phone: '+1 555 123 4567',
      shippingAddress: '123 Main St',
      city: 'Springfield',
      postcode: '12345',
      country: 'USA',
    },
    paymentMethod: 'Cash' as const,
    lineItems: [],
    totals: { subtotalUsd: 10, deliveryUsd: 0, serviceFeeUsd: 0, markupUsd: 2, totalUsd: 12 },
    pricingPolicyVersion: 'v1',
    fxRate: 7.2,
    fxRateAt: '2026-07-19T00:00:00.000Z',
    priceValidatedAt: '2026-07-19T00:00:00.000Z',
    createdAt: '2026-07-19T00:00:00.000Z',
    expiresAt: '2026-07-26T00:00:00.000Z',
  };

  const result = await createOrderItem(input);

  assert.equal(calls.length, 1);
  assert.equal(calls[0].method, 'post');
  const body = calls[0].body as { fields: Record<string, unknown> };
  assert.equal(body.fields.OrderReference, 'ORD-ABC123XYZ789');
  assert.equal(body.fields.Postcode, '12345');
  assert.equal(body.fields.CustomerStatus, 'Order Received');
  assert.equal(body.fields.InternalStatus, 'New');
  assert.deepEqual(result, { id: '1', '@odata.etag': '"1"' });
});

test('getOrderItemByReference filters on OrderReference and returns the first match', async () => {
  resetFakes();
  nextGetResponse = {
    value: [{ id: '1', '@odata.etag': '"1"', fields: { OrderReference: 'ORD-ABC123XYZ789' } }],
  };

  const result = await getOrderItemByReference('ORD-ABC123XYZ789');

  assert.equal(calls[0].method, 'get');
  assert.equal(calls[0].filterValue, "fields/OrderReference eq 'ORD-ABC123XYZ789'");
  assert.equal(result?.id, '1');
});

test('getOrderItemByReference returns null when no items match', async () => {
  resetFakes();
  nextGetResponse = { value: [] };

  const result = await getOrderItemByReference('ORD-NOTHING');

  assert.equal(result, null);
});

test('getOrderItemByReference escapes single quotes in the reference before filtering', async () => {
  resetFakes();
  await getOrderItemByReference("ORD-O'BRIEN");

  assert.equal(calls[0].filterValue, "fields/OrderReference eq 'ORD-O''BRIEN'");
});

test('updateEmailStatus sends If-Match with the given etag and returns the new etag', async () => {
  resetFakes();
  nextPatchResponse = { '@odata.etag': '"7"' };

  const newEtag = await updateEmailStatus('42', '"1"', 'CustomerEmailStatus', 'Sent');

  assert.equal(calls[0].method, 'get');
  const patchCall = calls.find((call) => call.method === 'patch');
  assert.deepEqual(patchCall?.header, ['If-Match', '"1"']);
  assert.deepEqual(patchCall?.body, {
    LineItemsJson: '[]',
    InternalNotes: 'existing note',
    CustomerEmailStatus: 'Sent',
  });
  assert.equal(newEtag, '"7"');
});

test('updateEmailStatus omits multiline fields from the preservation fetch that come back undefined', async () => {
  resetFakes();
  nextGetResponse = { fields: {} };

  await updateEmailStatus('42', '"1"', 'CustomerEmailStatus', 'Sent');

  const patchCall = calls.find((call) => call.method === 'patch');
  assert.deepEqual(patchCall?.body, { CustomerEmailStatus: 'Sent' });
});

test('updateOrderItemFields skips the preservation fetch when the caller already supplies both multiline fields', async () => {
  resetFakes();
  const { updateOrderItemFields } = await import('../src/integrations/graph/orders.repository.js');

  await updateOrderItemFields('42', '"1"', {
    LineItemsJson: '[{"productId":"p1"}]',
    InternalNotes: 'fresh note',
  });

  assert.equal(calls.length, 1);
  assert.equal(calls[0].method, 'patch');
  assert.deepEqual(calls[0].body, {
    LineItemsJson: '[{"productId":"p1"}]',
    InternalNotes: 'fresh note',
  });
});

test('updateEmailStatus throws GraphConflictError on a 412 response', async () => {
  resetFakes();
  const err = new Error('precondition failed') as Error & { statusCode?: number };
  err.statusCode = 412;
  nextError = err;

  await assert.rejects(
    () => updateEmailStatus('42', '"stale"', 'CustomerEmailStatus', 'Sent'),
    GraphConflictError,
  );
});

test('getExpirableOrderItems filters on ExpiresAt and the pending CustomerStatus set', async () => {
  resetFakes();
  nextGetResponse = { value: [{ id: '9', '@odata.etag': '"1"', fields: { OrderReference: 'ORD-1' } }] };

  const items = await getExpirableOrderItems('2026-07-19T00:00:00.000Z');

  assert.equal(calls[0].method, 'get');
  assert.match(calls[0].filterValue ?? '', /fields\/ExpiresAt lt '2026-07-19T00:00:00\.000Z'/);
  assert.match(calls[0].filterValue ?? '', /fields\/CustomerStatus eq 'Order Received'/);
  assert.match(calls[0].filterValue ?? '', /fields\/CustomerStatus eq 'Payment Pending'/);
  assert.match(calls[0].filterValue ?? '', /fields\/CustomerStatus eq 'Processing'/);
  assert.equal(items.length, 1);
  assert.equal(items[0].id, '9');
});

test('getExpirableOrderItems returns an empty array when nothing matches', async () => {
  resetFakes();
  nextGetResponse = { value: [] };

  const items = await getExpirableOrderItems('2026-07-19T00:00:00.000Z');

  assert.deepEqual(items, []);
});
