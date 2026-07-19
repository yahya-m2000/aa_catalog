import type { Request, Response } from 'express';

import { buildPaymentInstructions, paymentConfig } from '../config/payment.config';
import type { ApiResponse } from '../types/api';

export interface PaymentInstructionsResponse {
  zaadNumber: string;
  zaadAccountName: string;
  cashContactNumber: string;
  paymentDeadlineDays: number;
  /** English-only this run — Somali translation (Run 14) is deferred; `so` exists in
   * buildPaymentInstructions()'s return shape already but is intentionally not surfaced here. */
  instructionsEn: string;
}

/**
 * Read-only, config-driven Cash/Zaad payment copy (plan §11) for a given order
 * reference (query param `?reference=`). Reference is optional — when omitted,
 * the instructions use a "[ORDER NUMBER]" placeholder so the raw config can
 * still be inspected without a real order.
 */
export function getPaymentInstructions(req: Request, res: Response) {
  const reference = typeof req.query.reference === 'string' && req.query.reference.trim().length > 0
    ? req.query.reference.trim()
    : '[ORDER NUMBER]';

  const { en } = buildPaymentInstructions(reference);

  const body: ApiResponse<PaymentInstructionsResponse> = {
    success: true,
    data: {
      zaadNumber: paymentConfig.zaadNumber,
      zaadAccountName: paymentConfig.zaadAccountName,
      cashContactNumber: paymentConfig.cashContactNumber,
      paymentDeadlineDays: paymentConfig.paymentDeadlineDays,
      instructionsEn: en,
    },
  };
  res.json(body);
}
