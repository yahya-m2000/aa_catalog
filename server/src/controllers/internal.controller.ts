import type { Request, Response } from 'express';

import { runOrderExpirySweep } from '../services/orderExpiry.service';
import { ProcurementError, procureOrder } from '../services/procurement.service';
import type { ApiResponse } from '../types/api';
import type { OrderExpirySweepResult } from '../services/orderExpiry.service';
import type { ProcurementResult } from '../services/procurement.service';

export async function postExpireOrders(_req: Request, res: Response) {
  const result = await runOrderExpirySweep();
  const body: ApiResponse<OrderExpirySweepResult> = { success: true, data: result };
  res.json(body);
}

const PROCUREMENT_ERROR_STATUS: Record<ProcurementError['code'], number> = {
  ORDER_NOT_FOUND: 404,
  WRONG_STATUS: 409,
  MISSING_SOURCE_IDS: 422,
  MISSING_LINE_ITEMS: 422,
  ALREADY_PROCURED: 409,
  HIOBUY_ERROR: 502,
  GRAPH_CONFLICT: 409,
};

export async function postProcureOrder(req: Request, res: Response) {
  const reference = String(req.params.reference);

  try {
    const result = await procureOrder(reference);
    const body: ApiResponse<ProcurementResult> = { success: true, data: result };
    res.json(body);
  } catch (error) {
    if (error instanceof ProcurementError) {
      const body: ApiResponse<never> = { success: false, error: { code: error.code, message: error.message } };
      res.status(PROCUREMENT_ERROR_STATUS[error.code]).json(body);
      return;
    }
    throw error;
  }
}
