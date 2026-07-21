import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { LoadingState } from '@/components/LoadingState';
import { useAppToast } from '@/components/useAppToast';
import { useBasketStore } from '@/features/basket/store/basket.store';
import { ProductGrid } from '@/features/catalog/components/ProductGrid';
import { RecentSearches } from '@/features/catalog/components/RecentSearches';
import { SortFilterTabs } from '@/features/catalog/components/SortFilterTabs';
import { useProductSearch } from '@/features/catalog/hooks/useProductSearch';
import { useRecentSearchesStore } from '@/features/catalog/store/recentSearches.store';
import { t } from '@/i18n';
import { useSearchInputStore } from '@/navigation/searchInput.store';
import type { ProductSortOption } from '@/services/api/products.api';
import type { NormalizedProduct } from '@/types/product';

interface SearchScreenProps {
  initialQuery?: string;
}

export function SearchScreen({ initialQuery }: SearchScreenProps) {
  const router = useRouter();
  const [activeQuery, setActiveQuery] = useState(initialQuery ?? '');
  const [sort, setSort] = useState<ProductSortOption>('relevance');

  const setHeaderQuery = useSearchInputStore((state) => state.setQuery);
  const submitCount = useSearchInputStore((state) => state.submitCount);
  const submittedQuery = useSearchInputStore((state) => state.submittedQuery);
  const searches = useRecentSearchesStore((state) => state.searches);
  const addSearch = useRecentSearchesStore((state) => state.addSearch);
  const removeSearch = useRecentSearchesStore((state) => state.removeSearch);
  const addItem = useBasketStore((state) => state.addItem);
  const { showToast } = useAppToast();

  const { products, status, errorMessage, isRefreshing, refresh } = useProductSearch(activeQuery, sort);

  useEffect(() => {
    if (initialQuery) {
      setHeaderQuery(initialQuery);
      addSearch(initialQuery);
    }
    // Only run once on mount for a category-tap deep link — subsequent
    // searches are driven by the effect below (header submit) or
    // runSearch (recent-search tap).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fires when the persistent header submits a query while this screen is
  // already mounted (user edits + resubmits without navigating away).
  useEffect(() => {
    if (submitCount > 0) {
      setActiveQuery(submittedQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitCount]);

  const runSearch = (query: string) => {
    const trimmed = query.trim();
    setHeaderQuery(trimmed);
    setActiveQuery(trimmed);
    if (trimmed) addSearch(trimmed);
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
    showToast(t('common.addedToBasket'));
  };

  const showResults = activeQuery.length > 0;

  return (
    <View className="flex-1 bg-background">
      {showResults ? (
        <>
          <View className="pt-lg pb-sm">
            <SortFilterTabs selected={sort} onSelect={setSort} />
          </View>
          {status === 'loading' ? (
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
              dismissKeyboardOnDrag
            />
          )}
        </>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerClassName="p-lg flex-grow"
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <RecentSearches searches={searches} onSelect={runSearch} onRemove={removeSearch} />
        </ScrollView>
      )}
    </View>
  );
}
