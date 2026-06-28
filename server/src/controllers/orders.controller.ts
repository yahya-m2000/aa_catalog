import type { Request, Response } from 'express';

import { createOrderSchema } from '../schemas/checkout.schema';
import { createOrder, OrderItemNotFoundError } from '../services/order.service';
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
