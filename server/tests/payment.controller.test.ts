import assert from 'node:assert/strict';
import { mock, test } from 'node:test';

import type { PaymentConfig } from '../src/config/payment.config';

const fakeConfig: PaymentConfig = {
  zaadNumber: '063xxxxxxx',
  zaadAccountName: 'AA Group',
  cashContactNumber: '063yyyyyyy',
  paymentDeadlineDays: 5,
};

mock.module('../src/config/payment.config.ts', {
  namedExports: {
    paymentConfig: fakeConfig,
    buildPaymentInstructions: (orderReference: string, config: PaymentConfig = fakeConfig) => ({
      en: `EN instructions for ${orderReference} using ${config.zaadNumber}`,
      so: `SO instructions for ${orderReference}`,
    }),
  },
});

let getPaymentInstructions: typeof import('../src/controllers/payment.controller.js').getPaymentInstructions;

test.before(async () => {
  const mod = await import('../src/controllers/payment.controller.js');
  getPaymentInstructions = mod.getPaymentInstructions;
});

function fakeResponse() {
  let statusCode = 200;
  let body: unknown;
  return {
    res: {
      status(code: number) {
        statusCode = code;
        return this;
      },
      json(payload: unknown) {
        body = payload;
      },
    } as import('express').Response,
    getStatus: () => statusCode,
    getBody: () => body,
  };
}

test('getPaymentInstructions returns config values and English-only copy with a placeholder reference', async () => {
  const { res, getBody } = fakeResponse();
  await getPaymentInstructions({ query: {} } as unknown as import('express').Request, res);

  const body = getBody() as { success: boolean; data: Record<string, unknown> };
  assert.equal(body.success, true);
  assert.equal(body.data.zaadNumber, fakeConfig.zaadNumber);
  assert.equal(body.data.zaadAccountName, fakeConfig.zaadAccountName);
  assert.equal(body.data.cashContactNumber, fakeConfig.cashContactNumber);
  assert.equal(body.data.paymentDeadlineDays, fakeConfig.paymentDeadlineDays);
  assert.equal(body.data.instructionsEn, 'EN instructions for [ORDER NUMBER] using 063xxxxxxx');
  assert.equal('instructionsSo' in body.data, false);
  assert.equal('so' in body.data, false);
});

test('getPaymentInstructions interpolates a provided order reference', async () => {
  const { res, getBody } = fakeResponse();
  await getPaymentInstructions(
    { query: { reference: 'AAG-1234' } } as unknown as import('express').Request,
    res,
  );

  const body = getBody() as { success: boolean; data: Record<string, unknown> };
  assert.equal(body.data.instructionsEn, 'EN instructions for AAG-1234 using 063xxxxxxx');
});

test('getPaymentInstructions ignores a blank reference query param and falls back to the placeholder', async () => {
  const { res, getBody } = fakeResponse();
  await getPaymentInstructions(
    { query: { reference: '   ' } } as unknown as import('express').Request,
    res,
  );

  const body = getBody() as { success: boolean; data: Record<string, unknown> };
  assert.equal(body.data.instructionsEn, 'EN instructions for [ORDER NUMBER] using 063xxxxxxx');
});
