import type { PaginatedResult } from '../../types/api';
import type { NormalizedProduct } from '../../types/product';

export type ProductSortOption = 'relevance' | 'price_asc' | 'price_desc' | 'newest' | 'popular';

export interface SearchParams {
  query?: string;
  sort: ProductSortOption;
  page: number;
  pageSize: number;
}

export interface ProductSourceAdapter {
  search(params: SearchParams): Promise<PaginatedResult<NormalizedProduct>>;
  getById(id: string): Promise<NormalizedProduct | null>;
}
