import type { ProductSourceAdapter } from './adapter.interface';
import { MockProductAdapter } from './mock.adapter';
import { TaobaoProductAdapter } from './taobao.adapter';

let adapter: ProductSourceAdapter | null = null;

export function getProductAdapter(): ProductSourceAdapter {
  if (!adapter) {
    adapter = process.env.TAOBAO_APP_KEY ? new TaobaoProductAdapter() : new MockProductAdapter();
  }
  return adapter;
}
