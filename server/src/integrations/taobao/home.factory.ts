import { env } from '../../config/env';
import { HiobuyHomeProvider } from '../hiobuy/home.service';
import type { HomeCollectionsProvider } from './home.interface';
import { MockHomeProvider } from './mock.home.provider';

let provider: HomeCollectionsProvider | null = null;

function hiobuyConfigured(): boolean {
  return env.hiobuy.env === 'live' ? Boolean(env.hiobuy.liveApiKey) : Boolean(env.hiobuy.testApiKey);
}

export function getHomeProvider(): HomeCollectionsProvider {
  if (!provider) {
    provider = hiobuyConfigured() ? new HiobuyHomeProvider() : new MockHomeProvider();
  }
  return provider;
}
