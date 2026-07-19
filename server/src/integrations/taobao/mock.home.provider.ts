import type { NormalizedProduct } from '../../types/product';
import type { HomeCollection, HomeCollectionsProvider } from './home.interface';
import mockProducts from './mock-data/products.mock.json';

const products = mockProducts as NormalizedProduct[];

export class MockHomeProvider implements HomeCollectionsProvider {
  async getCollections(): Promise<HomeCollection[]> {
    const byCategory = new Map<string, NormalizedProduct[]>();
    for (const product of products) {
      const category = product.category ?? 'Other';
      const existing = byCategory.get(category) ?? [];
      existing.push(product);
      byCategory.set(category, existing);
    }

    return Array.from(byCategory.entries()).map(([category, items]) => ({
      dimension: category.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      label: category,
      items,
    }));
  }

  async getSimilar(productId: string): Promise<NormalizedProduct[]> {
    const target = products.find((p) => p.id === productId);
    if (!target) return [];
    return products.filter((p) => p.id !== productId && p.category === target.category);
  }
}
