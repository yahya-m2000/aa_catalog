import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
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
  headerHeight?: number;
  footerHeight?: number;
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  dismissKeyboardOnDrag?: boolean;
}

export function ProductGrid({
  products,
  onProductPress,
  onAddToBasket,
  isRefreshing,
  onRefresh,
  headerHeight = 0,
  footerHeight = 0,
  onScroll,
  dismissKeyboardOnDrag,
}: ProductGridProps) {
  return (
    <FlatList
      data={products}
      keyExtractor={(item) => item.id}
      numColumns={2}
      columnWrapperStyle={styles.row}
      contentContainerStyle={[
        styles.content,
        { paddingTop: headerHeight + spacing.lg, paddingBottom: footerHeight + spacing.lg },
      ]}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.textPrimary} />
      }
      onScroll={onScroll}
      scrollEventThrottle={16}
      keyboardDismissMode={dismissKeyboardOnDrag ? 'on-drag' : undefined}
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
