import type { Request, Response } from 'express';

import { runOrderExpirySweep } from '../services/orderExpiry.service';
import type { ApiResponse } from '../types/api';
import type { OrderExpirySweepResult } from '../services/orderExpiry.service';

export async function postExpireOrders(_req: Request, res: Response) {
  const result = await runOrderExpirySweep();
  const body: ApiResponse<OrderExpirySweepResult> = { success: true, data: result };
  res.json(body);
}
