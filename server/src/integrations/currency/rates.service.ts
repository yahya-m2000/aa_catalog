import type { CurrencyRates } from '../../types/currency';
import { MockRatesProvider } from './mock-rates.provider';
import type { RatesProvider } from './rates.provider.interface';

let provider: RatesProvider | null = null;

function getRatesProvider(): RatesProvider {
  if (!provider) {
    // CURRENCY_PROVIDER is reserved for selecting a live provider later (plan §13 risk 6);
    // only "mock" exists today, so the switch is a no-op until one is added.
    provider = new MockRatesProvider();
  }
  return provider;
}

export async function getCurrencyRates(): Promise<CurrencyRates> {
  return getRatesProvider().getRates();
}
