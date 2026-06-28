import type { PaginatedResult } from '../../types/api';
import type { NormalizedProduct } from '../../types/product';
import type { ProductSourceAdapter, SearchParams } from './adapter.interface';
import mockProducts from './mock-data/products.mock.json';

const products = mockProducts as NormalizedProduct[];

function matchesQuery(product: NormalizedProduct, query: string): boolean {
  const haystack = `${product.title} ${product.description ?? ''} ${product.shortDescription ?? ''}`.toLowerCase();
  return haystack.includes(query.toLowerCase());
}

function sortProducts(items: NormalizedProduct[], sort: SearchParams['sort']): NormalizedProduct[] {
  const sorted = [...items];
  switch (sort) {
    case 'price_asc':
      return sorted.sort((a, b) => a.price.finalAmount - b.price.finalAmount);
    case 'price_desc':
      return sorted.sort((a, b) => b.price.finalAmount - a.price.finalAmount);
    case 'newest':
      return sorted.reverse();
    case 'popular':
    case 'relevance':
    default:
      return sorted;
  }
}

export class MockProductAdapter implements ProductSourceAdapter {
  async search(params: SearchParams): Promise<PaginatedResult<NormalizedProduct>> {
    const filtered = params.query ? products.filter((p) => matchesQuery(p, params.query!)) : products;
    const sorted = sortProducts(filtered, params.sort);

    const start = (params.page - 1) * params.pageSize;
    const end = start + params.pageSize;
    const pageItems = sorted.slice(start, end);

    return {
      items: pageItems,
      page: params.page,
      pageSize: params.pageSize,
      totalItems: sorted.length,
      hasMore: end < sorted.length,
    };
  }

  async getById(id: string): Promise<NormalizedProduct | null> {
    return products.find((p) => p.id === id) ?? null;
  }
}
