import type { Request, Response } from 'express';

import { getCurrencyRates } from '../integrations/currency/rates.service';
import { getHomeProvider } from '../integrations/taobao/home.factory';
import type { HomeCollection } from '../integrations/taobao/home.interface';
import type { ApiResponse } from '../types/api';
import type { NormalizedProduct } from '../types/product';
import { applyPricingToProduct } from '../utils/applyPricingToProduct';

export async function getHomeCollections(_req: Request, res: Response) {
  const provider = getHomeProvider();
  const [collections, currencyRates] = await Promise.all([provider.getCollections(), getCurrencyRates()]);

  const priced: HomeCollection[] = collections.map((collection) => ({
    ...collection,
    items: collection.items.map((item) => applyPricingToProduct(item, currencyRates.rates)),
  }));

  const body: ApiResponse<HomeCollection[]> = { success: true, data: priced };
  res.json(body);
}

export async function getSimilarProducts(req: Request<{ id: string }>, res: Response) {
  const provider = getHomeProvider();
  const [items, currencyRates] = await Promise.all([
    provider.getSimilar(req.params.id),
    getCurrencyRates(),
  ]);

  const priced: NormalizedProduct[] = items.map((item) => applyPricingToProduct(item, currencyRates.rates));

  const body: ApiResponse<NormalizedProduct[]> = { success: true, data: priced };
  res.json(body);
}
