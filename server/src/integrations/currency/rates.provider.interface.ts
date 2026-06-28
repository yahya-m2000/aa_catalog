import type { CurrencyRates } from '../../types/currency';

export interface RatesProvider {
  getRates(): Promise<CurrencyRates>;
}
