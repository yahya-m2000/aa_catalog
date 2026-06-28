import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { LoadingState } from '@/components/LoadingState';
import { useBasketStore } from '@/features/basket/store/basket.store';
import { ProductGrid } from '@/features/catalog/components/ProductGrid';
import { RecentSearches } from '@/features/catalog/components/RecentSearches';
import { SearchBar } from '@/features/catalog/components/SearchBar';
import { SortFilterTabs } from '@/features/catalog/components/SortFilterTabs';
import { useProductSearch } from '@/features/catalog/hooks/useProductSearch';
import { useRecentSearchesStore } from '@/features/catalog/store/recentSearches.store';
import { t } from '@/i18n';
import type { ProductSortOption } from '@/services/api/products.api';
import { colors, spacing } from '@/theme';
import type { NormalizedProduct } from '@/types/product';

export function HomeScreen() {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [sort, setSort] = useState<ProductSortOption>('relevance');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const searches = useRecentSearchesStore((state) => state.searches);
  const addSearch = useRecentSearchesStore((state) => state.addSearch);
  const addItem = useBasketStore((state) => state.addItem);

  const { products, status, errorMessage, isRefreshing, refresh } = useProductSearch(activeQuery, sort);

  const showRecentSearches = isSearchFocused || activeQuery.length === 0;

  const handleSubmitSearch = () => {
    const trimmed = searchInput.trim();
    setActiveQuery(trimmed);
    if (trimmed) addSearch(trimmed);
    setIsSearchFocused(false);
  };

  const handleSelectRecentSearch = (query: string) => {
    setSearchInput(query);
    setActiveQuery(query);
    setIsSearchFocused(false);
  };

  const handleProductPress = (product: NormalizedProduct) => {
    router.push({ pathname: '/product/[id]', params: { id: product.id } });
  };

  const handleAddToBasket = (product: NormalizedProduct) => {
    const defaultSku = product.skus.find((sku) => sku.inventory > 0) ?? product.skus[0];
    const primaryImage = product.images.find((image) => image.isPrimary) ?? product.images[0];

    addItem({
      productId: product.id,
      productTitle: product.title,
      productImageUrl: defaultSku?.imageUrl ?? primaryImage?.url ?? '',
      selectedSku: defaultSku ? { skuId: defaultSku.skuId, options: defaultSku.options } : undefined,
      quantity: 1,
      unitPrice: defaultSku ? defaultSku.price : product.price,
    });
  };

  return (
    <View style={styles.container}>
      <SearchBar
        value={searchInput}
        onChangeText={setSearchInput}
        onFocus={() => setIsSearchFocused(true)}
        onBlur={() => setIsSearchFocused(false)}
        onSubmit={handleSubmitSearch}
      />
      {!showRecentSearches ? <SortFilterTabs selected={sort} onSelect={setSort} /> : null}
      <View style={styles.content}>
        {showRecentSearches ? (
          <RecentSearches searches={searches} onSelect={handleSelectRecentSearch} />
        ) : status === 'loading' ? (
          <LoadingState message={t('home.loadingProducts')} />
        ) : status === 'error' ? (
          <ErrorState
            title={t('home.loadProductsErrorTitle')}
            message={errorMessage ?? undefined}
            onRetry={refresh}
          />
        ) : products.length === 0 ? (
          <EmptyState title={t('home.noProductsFoundTitle')} message={t('home.noProductsFoundMessage')} />
        ) : (
          <ProductGrid
            products={products}
            onProductPress={handleProductPress}
            onAddToBasket={handleAddToBasket}
            isRefreshing={isRefreshing}
            onRefresh={refresh}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    marginTop: spacing.md,
  },
});
