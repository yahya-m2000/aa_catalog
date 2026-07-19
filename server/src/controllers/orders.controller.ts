import type { Request, Response } from 'express';

import { createOrderSchema, orderLookupSchema } from '../schemas/checkout.schema';
import type { PublicOrderDTO } from '../integrations/graph/publicOrder.dto';
import { createOrder, OrderItemNotFoundError } from '../services/order.service';
import { lookupOrder, OrderLookupNotFoundError } from '../services/orderLookup.service';
import type { ApiResponse } from '../types/api';
import type { BasketTotals } from '../types/basket';

export async function postOrder(req: Request, res: Response) {
  const parsed = createOrderSchema.safeParse(req.body);
  if (!parsed.success) {
    const body: ApiResponse<never> = {
      success: false,
      error: { code: 'VALIDATION_ERROR', message: JSON.stringify(parsed.error.flatten()) },
    };
    res.status(400).json(body);
    return;
  }

  try {
    const order = await createOrder(parsed.data);
    const body: ApiResponse<{ reference: string; totals: BasketTotals }> = {
      success: true,
      data: { reference: order.reference, totals: order.totals },
    };
    res.json(body);
  } catch (error) {
    if (error instanceof OrderItemNotFoundError) {
      const body: ApiResponse<never> = {
        success: false,
        error: { code: 'ORDER_ITEM_NOT_FOUND', message: error.message },
      };
      res.status(400).json(body);
      return;
    }
    throw error;
  }
}

const LOOKUP_NOT_FOUND_BODY: ApiResponse<never> = {
  success: false,
  error: { code: 'NOT_FOUND', message: 'No matching order found' },
};

export async function postOrderLookup(req: Request, res: Response) {
  const parsed = orderLookupSchema.safeParse(req.body);

  try {
    // Malformed input still goes through the same timing-normalized path (empty string
    // reference/email will simply never match) so response latency can't distinguish
    // "badly formed request" from "well-formed but wrong" (plan §8 enumeration resistance).
    const { reference, email } = parsed.success ? parsed.data : { reference: '', email: '' };
    const order = await lookupOrder(reference, email);
    const body: ApiResponse<PublicOrderDTO> = { success: true, data: order };
    res.json(body);
  } catch (error) {
    if (error instanceof OrderLookupNotFoundError) {
      res.status(404).json(LOOKUP_NOT_FOUND_BODY);
      return;
    }
    throw error;
  }
}
