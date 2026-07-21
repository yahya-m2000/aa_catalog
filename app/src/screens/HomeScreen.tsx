import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useBasketStore } from '@/features/basket/store/basket.store';
import { useAppToast } from '@/components/useAppToast';
import { CategoryRail } from '@/features/catalog/components/CategoryRail';
import { FeatureSpotlight } from '@/features/catalog/components/FeatureSpotlight';
import { HeroBanner } from '@/features/catalog/components/HeroBanner';
import { ProductGridSection } from '@/features/catalog/components/ProductGridSection';
import { ProductRail } from '@/features/catalog/components/ProductRail';
import type { ProductCardSize } from '@/features/catalog/components/ProductCard';
import { useHomeCollections } from '@/features/catalog/hooks/useHomeCollections';
import { t } from '@/i18n';
import { useTabBarScrollHandler } from '@/navigation/tabBarVisibility';
import { spacing } from '@/theme';
import type { NormalizedProduct } from '@/types/product';

const TAB_BAR_HEIGHT = 64;

const BADGE_DIMENSIONS = new Set(['best-sellers', 'new-arrivals']);

// Curated collections (few, hand-picked items) get larger, more prominent
// cards; everything else is a standard browse-at-volume rail. Density is
// tied to what the rail *is*, not rotated arbitrarily by position.
const CURATED_DIMENSIONS = new Set(['trending', 'best-sellers', 'new-arrivals']);

function railCardSize(dimension: string): ProductCardSize {
  return CURATED_DIMENSIONS.has(dimension) ? 'large' : 'regular';
}

export function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const addItem = useBasketStore((state) => state.addItem);
  const { showToast } = useAppToast();
  const { collections } = useHomeCollections();

  const categories = useMemo(
    () => collections.map((collection) => ({ label: collection.label })),
    [collections],
  );

  const heroImageUrl = useMemo(() => {
    const deals = collections.find((collection) => collection.dimension === 'deals');
    const firstProduct = (deals ?? collections[0])?.items[0];
    return (firstProduct?.images.find((image) => image.isPrimary) ?? firstProduct?.images[0])?.url;
  }, [collections]);

  const spotlightDimension = useMemo(() => {
    const candidate = collections.find(
      (collection) => collection.dimension !== 'deals' && collection.dimension !== 'trending' && collection.items.length > 0,
    );
    return candidate?.dimension;
  }, [collections]);

  const goToSearch = (query?: string) => {
    if (query) {
      router.push({ pathname: '/search', params: { q: query } });
    } else {
      router.push('/search');
    }
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

  const tabBarHeight = TAB_BAR_HEIGHT + insets.bottom;
  const handleScroll = useTabBarScrollHandler(tabBarHeight);

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: tabBarHeight + spacing.xl }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <HeroBanner
          title={t('home.heroTitle')}
          subtitle={t('home.heroSubtitle')}
          ctaLabel={t('home.heroCta')}
          imageUrl={heroImageUrl}
          onPress={() => goToSearch()}
        />
        <CategoryRail categories={categories} onSelect={goToSearch} />
        {collections.map((collection) => {
          if (collection.dimension === 'deals') {
            return (
              <ProductGridSection
                key={collection.dimension}
                label={collection.label}
                products={collection.items}
                onProductPress={handleProductPress}
                onSeeAll={() => goToSearch(collection.label)}
              />
            );
          }

          if (collection.dimension === spotlightDimension) {
            return (
              <FeatureSpotlight
                key={collection.dimension}
                label={collection.label}
                product={collection.items[0]}
                onPress={handleProductPress}
              />
            );
          }

          return (
            <ProductRail
              key={collection.dimension}
              label={collection.label}
              badge={BADGE_DIMENSIONS.has(collection.dimension) ? collection.label : undefined}
              products={collection.items}
              onProductPress={handleProductPress}
              onAddToBasket={handleAddToBasket}
              onSeeAll={() => goToSearch(collection.label)}
              cardSize={railCardSize(collection.dimension)}
            />
          );
        })}
      </ScrollView>
    </View>
  );
}
