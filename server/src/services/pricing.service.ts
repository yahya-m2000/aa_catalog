import { pricingConfig, type PricingConfig } from '../config/pricing.config';
import type { BasketItem, BasketTotals } from '../types/basket';
import type { CurrencyCode } from '../types/product';

export function convertToUSD(amount: number, fromCurrency: CurrencyCode, rates: Record<CurrencyCode, number>): number {
  if (fromCurrency === 'USD') return amount;
  return amount / rates[fromCurrency];
}

export function applyMarkup(
  amountUSD: number,
  config: Pick<PricingConfig, 'markupPercentage' | 'serviceFeeFixedUSD'> = pricingConfig,
): number {
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

export function roundToPrecision(amount: number, config: PricingConfig = pricingConfig): number {
  const factor = 10 ** config.roundingPrecision;
  return Math.round(amount * factor) / factor;
}

export interface PriceChangeAssessment {
  withinThreshold: boolean;
  deltaUsd: number;
  deltaPercent: number;
}

/**
 * Compares the price a customer's basket was quoted against the freshly-revalidated
 * price at order submission (plan §6). Increases up to whichever is LOWER of the
 * percent/USD threshold are absorbed silently; above that, the business follows up
 * with the customer manually — this function only flags it, it never blocks the order.
 */
export function assessPriceChange(
  originalQuoteUsd: number,
  revalidatedQuoteUsd: number,
  config: PricingConfig = pricingConfig,
): PriceChangeAssessment {
  const deltaUsd = revalidatedQuoteUsd - originalQuoteUsd;
  const deltaPercent = originalQuoteUsd === 0 ? 0 : (deltaUsd / originalQuoteUsd) * 100;

  if (deltaUsd <= 0) {
    return { withinThreshold: true, deltaUsd, deltaPercent };
  }

  const allowedUsd = Math.min(config.priceIncreaseAbsorbThresholdUSD, (config.priceIncreaseAbsorbThresholdPercent / 100) * originalQuoteUsd);

  return {
    withinThreshold: deltaUsd <= allowedUsd,
    deltaUsd,
    deltaPercent,
  };
}
