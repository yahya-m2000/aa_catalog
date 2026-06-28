import type { CurrencyCode } from './product';

export interface CurrencyRates {
  base: 'USD';
  rates: Record<CurrencyCode, number>;
  updatedAt: string;
}
