import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { Card } from '@/components/Card';
import { ErrorState } from '@/components/ErrorState';
import { LoadingState } from '@/components/LoadingState';
import { PriceTag } from '@/components/PriceTag';
import { Text } from '@/components/Text';
import { useAppToast } from '@/components/useAppToast';
import { useBasketStore } from '@/features/basket/store/basket.store';
import { ProductImageGallery } from '@/features/catalog/components/ProductImageGallery';
import { ProductRail } from '@/features/catalog/components/ProductRail';
import { ProductStickyBar } from '@/features/catalog/components/ProductStickyBar';
import { ProductThumbnailStrip } from '@/features/catalog/components/ProductThumbnailStrip';
import { QuantitySelector } from '@/features/catalog/components/QuantitySelector';
import { VariantSelector } from '@/features/catalog/components/VariantSelector';
import { useProductDetail } from '@/features/catalog/hooks/useProductDetail';
import { useSimilarProducts } from '@/features/catalog/hooks/useSimilarProducts';
import { t } from '@/i18n';
import { colors, spacing } from '@/theme';
import type { NormalizedProduct, ProductSku } from '@/types/product';

interface ProductDetailScreenProps {
  productId: string;
}

function resolveSelectedSku(skus: ProductSku[], selectedOptions: Record<string, string>): ProductSku | null {
  if (skus.length === 0) return null;
  return (
    skus.find((sku) =>
      sku.options.every((option) => selectedOptions[option.name] === option.value) &&
      sku.options.length === Object.keys(selectedOptions).length,
    ) ?? null
  );
}

const LOW_STOCK_THRESHOLD = 10;

function stockLabel(inventory: number | undefined): string | null {
  if (inventory === undefined) return t('productDetail.inStock');
  if (inventory <= 0) return t('productDetail.outOfStock');
  if (inventory <= LOW_STOCK_THRESHOLD) return t('productDetail.lowStock', { count: inventory });
  return t('productDetail.inStock');
}

export function ProductDetailScreen({ productId }: ProductDetailScreenProps) {
  const router = useRouter();
  const { product, status, errorMessage, refresh } = useProductDetail(productId);
  const { products: similarProducts } = useSimilarProducts(productId);
  const addItem = useBasketStore((state) => state.addItem);
  const { showToast } = useAppToast();

  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const hasVariants = (product?.skus.length ?? 0) > 0;
  const selectedSku = useMemo(
    () => (product ? resolveSelectedSku(product.skus, selectedOptions) : null),
    [product, selectedOptions],
  );

  const handleSelectOption = (optionName: string, value: string) => {
    setSelectedOptions((prev) => ({ ...prev, [optionName]: value }));
    setQuantity(1);
  };

  const canAddToBasket = !hasVariants || selectedSku !== null;

  const handleAddToBasket = () => {
    if (!product || !canAddToBasket) return;

    const price = selectedSku ? selectedSku.price : product.price;
    const primaryImage = product.images.find((image) => image.isPrimary) ?? product.images[0];

    addItem({
      productId: product.id,
      productTitle: product.title,
      productImageUrl: selectedSku?.imageUrl ?? primaryImage?.url ?? '',
      selectedSku: selectedSku ? { skuId: selectedSku.skuId, options: selectedSku.options } : undefined,
      quantity,
      unitPrice: price,
    });

    showToast(t('common.addedToBasket'));
  };

  const handleRelatedProductPress = (relatedProduct: NormalizedProduct) => {
    router.push({ pathname: '/product/[id]', params: { id: relatedProduct.id } });
  };

  const handleAddRelatedToBasket = (relatedProduct: NormalizedProduct) => {
    const defaultSku = relatedProduct.skus.find((sku) => sku.inventory > 0) ?? relatedProduct.skus[0];
    const primaryImage = relatedProduct.images.find((image) => image.isPrimary) ?? relatedProduct.images[0];

    addItem({
      productId: relatedProduct.id,
      productTitle: relatedProduct.title,
      productImageUrl: defaultSku?.imageUrl ?? primaryImage?.url ?? '',
      selectedSku: defaultSku ? { skuId: defaultSku.skuId, options: defaultSku.options } : undefined,
      quantity: 1,
      unitPrice: defaultSku ? defaultSku.price : relatedProduct.price,
    });
    showToast(t('common.addedToBasket'));
  };

  if (status === 'loading' || status === 'not-found' || status === 'error' || !product) {
    return (
      <View className="flex-1 bg-background">
        {status === 'loading' ? (
          <LoadingState message={t('productDetail.loadingProduct')} />
        ) : status === 'not-found' ? (
          <ErrorState title={t('productDetail.notFoundTitle')} message={t('productDetail.notFoundMessage')} />
        ) : (
          <ErrorState
            title={t('productDetail.loadErrorTitle')}
            message={errorMessage ?? undefined}
            onRetry={refresh}
          />
        )}
      </View>
    );
  }

  const displayPrice = selectedSku ? selectedSku.price : product.price;
  const stock = stockLabel(selectedSku ? selectedSku.inventory : undefined);

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: spacing.xxxl * 2 }}
        showsVerticalScrollIndicator={false}
      >
        <ProductImageGallery
          images={product.images}
          activeIndex={activeImageIndex}
          onIndexChange={setActiveImageIndex}
        />
        <ProductThumbnailStrip
          images={product.images}
          activeIndex={activeImageIndex}
          onSelect={setActiveImageIndex}
        />

        <View className="p-lg gap-lg">
          {product.category ? (
            <Text variant="caption" color={colors.textMuted}>
              {product.category}
            </Text>
          ) : null}

          <Text variant="heading">{product.title}</Text>

          {product.sellerName ? (
            <View className="flex-row items-center gap-xs">
              <Ionicons name="storefront-outline" size={16} color={colors.textMuted} />
              <Text variant="caption" color={colors.textMuted}>
                {product.sellerName}
              </Text>
            </View>
          ) : null}

          <View className="flex-row items-center justify-between">
            <PriceTag price={displayPrice} />
            {stock ? (
              <Text variant="captionStrong" color={selectedSku?.inventory === 0 ? colors.error : colors.success}>
                {stock}
              </Text>
            ) : null}
          </View>

          {hasVariants ? (
            <VariantSelector
              skus={product.skus}
              selectedOptions={selectedOptions}
              onSelectOption={handleSelectOption}
            />
          ) : null}

          <View className="flex-row items-center justify-between">
            <Text variant="bodyStrong">{t('productDetail.quantityLabel')}</Text>
            <QuantitySelector
              quantity={quantity}
              maxQuantity={selectedSku?.inventory}
              onChange={setQuantity}
            />
          </View>
        </View>

        {product.description ? (
          <View className="px-lg mb-xl">
            <Text variant="subheading" style={{ color: colors.textPrimary, marginBottom: spacing.md }}>
              {t('productDetail.descriptionHeading')}
            </Text>
            <Card>
              <Text variant="body" color={colors.textSecondary}>
                {product.description}
              </Text>
            </Card>
          </View>
        ) : null}

        <ProductRail
          label={t('productDetail.relatedProductsHeading')}
          products={similarProducts}
          onProductPress={handleRelatedProductPress}
          onAddToBasket={handleAddRelatedToBasket}
        />
      </ScrollView>

      <ProductStickyBar
        price={displayPrice}
        ctaLabel={canAddToBasket ? t('common.addToBasket') : t('productDetail.selectOptions')}
        disabled={!canAddToBasket}
        onPress={handleAddToBasket}
      />
    </View>
  );
}
