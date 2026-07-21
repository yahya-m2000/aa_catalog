export function splitCurrencyAmount(amount: number): { whole: string; cents: string } {
  const [whole, cents] = amount.toFixed(2).split('.');
  return { whole, cents };
}
