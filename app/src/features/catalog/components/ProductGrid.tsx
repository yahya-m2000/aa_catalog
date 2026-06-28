import { FlatList, RefreshControl, StyleSheet } from 'react-native';

import { ProductCard } from './ProductCard';
import { colors, spacing } from '@/theme';
import type { NormalizedProduct } from '@/types/product';

interface ProductGridProps {
  products: NormalizedProduct[];
  onProductPress: (product: NormalizedProduct) => void;
  onAddToBasket: (product: NormalizedProduct) => void;
  isRefreshing: boolean;
  onRefresh: () => void;
}

export function ProductGrid({ products, onProductPress, onAddToBasket, isRefreshing, onRefresh }: ProductGridProps) {
  return (
    <FlatList
      data={products}
      keyExtractor={(item) => item.id}
      numColumns={2}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.purpleLight} />
      }
      renderItem={({ item }) => (
        <ProductCard product={item} onPress={onProductPress} onAddToBasket={onAddToBasket} />
      )}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  row: {
    gap: spacing.md,
  },
});
