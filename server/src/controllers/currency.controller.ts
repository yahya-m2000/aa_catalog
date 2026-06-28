import type { Request, Response } from 'express';

import { getCurrencyRates } from '../integrations/currency/rates.service';
import type { ApiResponse } from '../types/api';
import type { CurrencyRates } from '../types/currency';

export async function getRates(_req: Request, res: Response) {
  const rates = await getCurrencyRates();
  const body: ApiResponse<CurrencyRates> = { success: true, data: rates };
  res.json(body);
}
