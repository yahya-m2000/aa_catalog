import type { NormalizedProduct } from './product';

export interface HomeCollection {
  dimension: string;
  label: string;
  items: NormalizedProduct[];
}
