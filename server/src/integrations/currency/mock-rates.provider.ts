import type { CurrencyRates } from '../../types/currency';
import type { RatesProvider } from './rates.provider.interface';

// TODO: replace with a live provider (e.g. exchangerate.host, Open Exchange Rates)
// behind the same RatesProvider interface once one is chosen — see plan §13 risk 6.
// Fixed table approximates CNY/USD; rates expressed as "1 USD = X <currency>".
const FIXED_RATES: CurrencyRates['rates'] = {
  USD: 1,
  CNY: 7.2,
};

export class MockRatesProvider implements RatesProvider {
  async getRates(): Promise<CurrencyRates> {
    return {
      base: 'USD',
      rates: FIXED_RATES,
      updatedAt: new Date().toISOString(),
    };
  }
}
