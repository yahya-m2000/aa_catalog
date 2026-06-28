import { applyMarkup, convertToUSD } from '../services/pricing.service';
import type { CurrencyRates } from '../types/currency';
import type { NormalizedProduct, ProductPrice } from '../types/product';

function priceWithConversion(price: ProductPrice, rates: CurrencyRates['rates']): ProductPrice {
  const usdAmount = convertToUSD(price.amount, price.currency, rates);
  return {
    ...price,
    usdAmount,
    finalAmount: applyMarkup(usdAmount),
  };
}

export function applyPricingToProduct(product: NormalizedProduct, rates: CurrencyRates['rates']): NormalizedProduct {
  return {
    ...product,
    price: priceWithConversion(product.price, rates),
    skus: product.skus.map((sku) => ({
      ...sku,
      price: priceWithConversion(sku.price, rates),
    })),
  };
}
