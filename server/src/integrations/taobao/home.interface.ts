import type { NormalizedProduct } from '../../types/product';

export interface HomeCollection {
  dimension: string;
  label: string;
  items: NormalizedProduct[];
}

export interface HomeCollectionsProvider {
  getCollections(): Promise<HomeCollection[]>;
  getSimilar(productId: string): Promise<NormalizedProduct[]>;
}
