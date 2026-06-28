import type { PaginatedResult } from '../../types/api';
import type { NormalizedProduct } from '../../types/product';
import type { ProductSourceAdapter, SearchParams } from './adapter.interface';

export class NotImplementedError extends Error {
  constructor(method: string) {
    super(`TaobaoProductAdapter.${method} is not implemented yet — real signing/HTTP client is a later run.`);
    this.name = 'NotImplementedError';
  }
}

// TODO: real implementation depends on taobao.client.ts (request signing + token
// refresh), which is not built yet — see plan §6 "What's explicitly NOT built this round".
// This class exists so adapter.factory.ts has a real type to switch to once
// TAOBAO_APP_KEY is set; it is not wired in by default.
export class TaobaoProductAdapter implements ProductSourceAdapter {
  async search(_params: SearchParams): Promise<PaginatedResult<NormalizedProduct>> {
    throw new NotImplementedError('search');
  }

  async getById(_id: string): Promise<NormalizedProduct | null> {
    throw new NotImplementedError('getById');
  }
}
