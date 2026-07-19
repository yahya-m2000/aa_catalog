import assert from 'node:assert/strict';
import { mock, test } from 'node:test';

import type { CreateOrderInput } from '../src/schemas/checkout.schema';
import type { NormalizedProduct } from '../src/types/product';
import type { GraphListItem } from '../src/integrations/graph/orders.types';

const createOrderItemCalls: unknown[] = [];
const updateEmailStatusCalls: { itemId: string; etag: string; field: string; status: string }[] = [];
const sendOrderEmailsCalls: unknown[] = [];

let createOrderItemBehavior: () => Promise<GraphListItem> = async () => ({
  id: 'item-1',
  '@odata.etag': '"1"',
  fields: {} as GraphListItem['fields'],
});
let sendOrderEmailsBehavior: () => Promise<void> = async () => undefined;
let updateEmailStatusEtagCounter = 1;

mock.module('../src/integrations/graph/orders.repository.ts', {
  namedExports: {
    createOrderItem: async (input: unknown) => {
      createOrderItemCalls.push(input);
      return createOrderItemBehavior();
    },
    updateEmailStatus: async (itemId: string, etag: string, field: string, status: string) => {
      updateEmailStatusCalls.push({ itemId, etag, field, status });
      updateEmailStatusEtagCounter += 1;
      return `"${updateEmailStatusEtagCounter}"`;
    },
  },
});

mock.module('../src/integrations/email/sendOrderEmails.ts', {
  namedExports: {
    sendOrderEmails: async (order: unknown) => {
      sendOrderEmailsCalls.push(order);
      return sendOrderEmailsBehavior();
    },
  },
});

const mockProduct: NormalizedProduct = {
  id: 'p1',
  title: 'Test Product',
  images: [],
  price: { amount: 72, currency: 'CNY', usdAmount: 10, finalAmount: 12 },
  skus: [],
  sourcePlatform: 'mock',
};

const fakeAdapter = {
  search: async () => ({ items: [], page: 1, pageSize: 10, hasMore: false }),
  getById: async (id: string) => (id === 'p1' ? mockProduct : null),
};

mock.module('../src/integrations/taobao/adapter.factory.ts', {
  namedExports: {
    getProductAdapter: () => fakeAdapter,
    getRevalidationProductAdapter: () => fakeAdapter,
  },
});

mock.module('../src/integrations/currency/rates.service.ts', {
  namedExports: {
    getCurrencyRates: async () => ({
      base: 'USD' as const,
      rates: { USD: 1, CNY: 7.2 },
      updatedAt: '2026-07-19T00:00:00.000Z',
    }),
  },
});

let createOrder: typeof import('../src/services/order.service.js').createOrder;
let OrderItemNotFoundError: typeof import('../src/services/order.service.js').OrderItemNotFoundError;

test.before(async () => {
  const mod = await import('../src/services/order.service.js');
  createOrder = mod.createOrder;
  OrderItemNotFoundError = mod.OrderItemNotFoundError;
});

function resetFakes() {
  createOrderItemCalls.length = 0;
  updateEmailStatusCalls.length = 0;
  sendOrderEmailsCalls.length = 0;
  updateEmailStatusEtagCounter = 1;
  createOrderItemBehavior = async () => ({
    id: 'item-1',
    '@odata.etag': '"1"',
    fields: {} as GraphListItem['fields'],
  });
  sendOrderEmailsBehavior = async () => undefined;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const baseInput: CreateOrderInput = {
  customer: {
    fullName: 'Jane Doe',
    email: 'jane@example.com',
    phone: '+1 555 123 4567',
    shippingAddress: '123 Main St',
    city: 'Springfield',
    postcode: '12345',
    country: 'USA',
  },
  paymentMethod: 'Cash',
  items: [{ productId: 'p1', quantity: 1 }],
};

test('createOrder writes to SharePoint and returns a real reference', async () => {
  resetFakes();
  const order = await createOrder(baseInput);

  assert.equal(createOrderItemCalls.length, 1);
  assert.match(order.reference, /^ORD-[A-Z2-9]{12}$/);
  assert.equal(order.customer.email, 'jane@example.com');
});

test('createOrder throws OrderItemNotFoundError for an unknown product and never calls Graph', async () => {
  resetFakes();
  await assert.rejects(
    () => createOrder({ ...baseInput, items: [{ productId: 'does-not-exist', quantity: 1 }] }),
    OrderItemNotFoundError,
  );
  assert.equal(createOrderItemCalls.length, 0);
});

test('createOrder succeeds even when email delivery fails (order existence never depends on email)', async () => {
  resetFakes();
  sendOrderEmailsBehavior = async () => {
    throw new Error('SMTP down');
  };

  const order = await createOrder(baseInput);
  assert.match(order.reference, /^ORD-/);

  // Email delivery is fire-and-forget (§8a step 4) — give it a tick to run and record status.
  await sleep(50);
  assert.equal(sendOrderEmailsCalls.length, 1);
  const failureRecord = updateEmailStatusCalls.find((c) => c.status === 'Failed');
  assert.ok(failureRecord, 'expected a Failed status to be recorded after email failure');
});

test('createOrder records Sent status on both email fields after successful delivery', async () => {
  resetFakes();
  await createOrder(baseInput);
  await sleep(50);

  assert.equal(sendOrderEmailsCalls.length, 1);
  const sentFields = updateEmailStatusCalls.filter((c) => c.status === 'Sent').map((c) => c.field);
  assert.deepEqual(sentFields.sort(), ['CustomerEmailStatus', 'InternalEmailStatus']);
});

test('createOrder writes the SharePoint item before attempting email (order creation is independent of email)', async () => {
  resetFakes();
  let sharePointWriteHappenedBeforeEmail = false;
  createOrderItemBehavior = async () => {
    sharePointWriteHappenedBeforeEmail = sendOrderEmailsCalls.length === 0;
    return { id: 'item-1', '@odata.etag': '"1"', fields: {} as GraphListItem['fields'] };
  };

  await createOrder(baseInput);

  assert.equal(sharePointWriteHappenedBeforeEmail, true);
});
