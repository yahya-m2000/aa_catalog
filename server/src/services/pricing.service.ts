import { pricingConfig, type PricingConfig } from '../config/pricing.config';
import type { BasketItem, BasketTotals } from '../types/basket';
import type { CurrencyCode } from '../types/product';

export function convertToUSD(amount: number, fromCurrency: CurrencyCode, rates: Record<CurrencyCode, number>): number {
  if (fromCurrency === 'USD') return amount;
  return amount / rates[fromCurrency];
}

export function applyMarkup(amountUSD: number, config: PricingConfig = pricingConfig): number {
  return amountUSD * (1 + config.markupPercentage / 100) + config.serviceFeeFixedUSD;
}

export function calculateBasketTotals(items: BasketItem[]): BasketTotals {
  const subtotalUSD = items.reduce((sum, item) => sum + item.unitPrice.usdAmount * item.quantity, 0);
  const finalTotalUSD = items.reduce((sum, item) => sum + item.unitPrice.finalAmount * item.quantity, 0);

  return {
    subtotalUSD,
    markupTotalUSD: finalTotalUSD - subtotalUSD,
    finalTotalUSD,
  };
}
