import assert from 'node:assert/strict';
import { test } from 'node:test';

import { escapeHtml } from '../src/integrations/email/templates/emailParts';
import { customerConfirmationTemplate } from '../src/integrations/email/templates/customerConfirmation.template';
import { internalReceiptTemplate } from '../src/integrations/email/templates/internalReceipt.template';
import { orderProcessingTemplate } from '../src/integrations/email/templates/orderProcessing.template';
import type { Order } from '../src/types/order';

const sampleOrder: Order = {
  reference: 'ORD-20260628-TEST',
  customer: {
    fullName: 'Jane <script>alert(1)</script> Doe',
    email: 'jane@example.com',
    phone: '+1 555 123 4567',
    shippingAddress: '123 Main St',
    city: 'Springfield',
    postcode: '12345',
    country: 'USA',
  },
  items: [
    {
      productId: 'p1',
      productTitle: 'Test Product',
      skuId: 'sku1',
      variantOptions: [{ name: 'Color', value: 'Red' }],
      quantity: 2,
      originalAmount: 100,
      originalCurrency: 'CNY',
      usdAmount: 13.89,
      markupAmount: 2.78,
      finalAmount: 16.67,
    },
  ],
  totals: { subtotalUSD: 27.78, markupTotalUSD: 5.56, finalTotalUSD: 33.34 },
  createdAt: '2026-06-28T12:00:00.000Z',
};

test('escapeHtml neutralizes script tags and special characters', () => {
  const result = escapeHtml('<script>alert(1)</script> & "quotes" \'apostrophes\'');
  assert.equal(result.includes('<script>'), false);
  assert.match(result, /&lt;script&gt;/);
  assert.match(result, /&amp;/);
  assert.match(result, /&quot;/);
  assert.match(result, /&#39;/);
});

test('internalReceiptTemplate escapes injected customer name and includes required fields', () => {
  const rendered = internalReceiptTemplate(sampleOrder);
  assert.equal(rendered.html.includes('<script>alert(1)</script>'), false);
  assert.match(rendered.subject, /ORD-20260628-TEST/);
  assert.match(rendered.html, /ORD-20260628-TEST/);
  assert.match(rendered.html, /jane@example\.com/);
  assert.match(rendered.html, /Test Product/);
  assert.match(rendered.html, /sku1/);
  assert.match(rendered.html, /\$33\.34/);
  assert.match(rendered.html, /payment is handled separately/i);
});

test('orderProcessingTemplate includes shipping address and line item details', () => {
  const rendered = orderProcessingTemplate(sampleOrder);
  assert.match(rendered.html, /123 Main St/);
  assert.match(rendered.html, /Springfield/);
  assert.match(rendered.html, /Color: Red/);
  assert.match(rendered.html, /\$16\.67/);
});

test('customerConfirmationTemplate addresses the customer and includes order total', () => {
  const rendered = customerConfirmationTemplate(sampleOrder);
  assert.equal(rendered.html.includes('<script>alert(1)</script>'), false);
  assert.match(rendered.html, /Thank you for your order/);
  assert.match(rendered.html, /\$33\.34/);
});
