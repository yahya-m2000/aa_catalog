import type { NormalizedProduct } from '../../types/product';
import type { HomeCollection, HomeCollectionsProvider } from './home.interface';
import mockProducts from './mock-data/products.mock.json';

const products = mockProducts as NormalizedProduct[];

function topLevelCategory(product: NormalizedProduct): string {
  return (product.category ?? 'Other').split('>')[0].trim();
}

export class MockHomeProvider implements HomeCollectionsProvider {
  async getCollections(): Promise<HomeCollection[]> {
    const collections: HomeCollection[] = [];

    const deals = [...products].sort((a, b) => a.price.finalAmount - b.price.finalAmount).slice(0, 8);
    collections.push({ dimension: 'deals', label: "Today's Deals", items: deals });

    const trending = [...products].reverse().slice(0, 8);
    collections.push({ dimension: 'trending', label: 'Trending Now', items: trending });

    const byCategory = new Map<string, NormalizedProduct[]>();
    for (const product of products) {
      const category = topLevelCategory(product);
      const existing = byCategory.get(category) ?? [];
      existing.push(product);
      byCategory.set(category, existing);
    }

    for (const [category, items] of byCategory.entries()) {
      collections.push({
        dimension: category.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        label: category,
        items,
      });
    }

    return collections;
  }

  async getSimilar(productId: string): Promise<NormalizedProduct[]> {
    const target = products.find((p) => p.id === productId);
    if (!target) return [];
    const targetCategory = topLevelCategory(target);
    return products.filter((p) => p.id !== productId && topLevelCategory(p) === targetCategory);
  }
}
