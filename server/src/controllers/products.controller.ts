import type { Request, Response } from 'express';

import { getCurrencyRates } from '../integrations/currency/rates.service';
import { getProductAdapter } from '../integrations/taobao/adapter.factory';
import { productSearchQuerySchema } from '../schemas/product-query.schema';
import type { ApiResponse, PaginatedResult } from '../types/api';
import type { NormalizedProduct } from '../types/product';
import { applyPricingToProduct } from '../utils/applyPricingToProduct';

export async function searchProducts(req: Request, res: Response) {
  const parsed = productSearchQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    const body: ApiResponse<never> = {
      success: false,
      error: { code: 'VALIDATION_ERROR', message: JSON.stringify(parsed.error.flatten()) },
    };
    res.status(400).json(body);
    return;
  }

  const { q, sort, page, pageSize } = parsed.data;
  const adapter = getProductAdapter();
  const [result, currencyRates] = await Promise.all([
    adapter.search({ query: q, sort, page, pageSize }),
    getCurrencyRates(),
  ]);

  const pricedItems = result.items.map((item) => applyPricingToProduct(item, currencyRates.rates));

  const body: ApiResponse<PaginatedResult<NormalizedProduct>> = {
    success: true,
    data: { ...result, items: pricedItems },
  };
  res.json(body);
}

export async function getProductById(req: Request<{ id: string }>, res: Response) {
  const adapter = getProductAdapter();
  const product = await adapter.getById(req.params.id);

  if (!product) {
    const body: ApiResponse<never> = {
      success: false,
      error: { code: 'PRODUCT_NOT_FOUND', message: `No product found with id "${req.params.id}"` },
    };
    res.status(404).json(body);
    return;
  }

  const currencyRates = await getCurrencyRates();
  const pricedProduct = applyPricingToProduct(product, currencyRates.rates);

  const body: ApiResponse<NormalizedProduct> = { success: true, data: pricedProduct };
  res.json(body);
}
