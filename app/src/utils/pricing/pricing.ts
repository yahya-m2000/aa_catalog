import type { BasketItem, BasketTotals } from '@/types/basket';

export function calculateBasketTotals(items: BasketItem[]): BasketTotals {
  const subtotalUSD = items.reduce((sum, item) => sum + item.unitPrice.usdAmount * item.quantity, 0);
  const finalTotalUSD = items.reduce((sum, item) => sum + item.unitPrice.finalAmount * item.quantity, 0);

  return {
    subtotalUSD,
    markupTotalUSD: finalTotalUSD - subtotalUSD,
    finalTotalUSD,
  };
}
