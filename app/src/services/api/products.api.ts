import { apiGet } from './client';
import type { PaginatedResult } from '@/types/api';
import type { NormalizedProduct } from '@/types/product';

export type ProductSortOption = 'relevance' | 'price_asc' | 'price_desc' | 'newest' | 'popular';

export interface SearchProductsParams {
  q?: string;
  sort?: ProductSortOption;
  page?: number;
  pageSize?: number;
}

export function searchProducts(params: SearchProductsParams): Promise<PaginatedResult<NormalizedProduct>> {
  return apiGet<PaginatedResult<NormalizedProduct>>('/api/products/search', {
    q: params.q,
    sort: params.sort,
    page: params.page,
    pageSize: params.pageSize,
  });
}

export function getProductById(id: string): Promise<NormalizedProduct> {
  return apiGet<NormalizedProduct>(`/api/products/${id}`);
}
