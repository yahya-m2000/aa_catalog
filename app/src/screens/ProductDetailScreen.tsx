import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ErrorState } from '@/components/ErrorState';
import { LoadingState } from '@/components/LoadingState';
import { PriceTag } from '@/components/PriceTag';
import { useBasketStore } from '@/features/basket/store/basket.store';
import { ProductImageGallery } from '@/features/catalog/components/ProductImageGallery';
import { QuantitySelector } from '@/features/catalog/components/QuantitySelector';
import { VariantSelector } from '@/features/catalog/components/VariantSelector';
import { useProductDetail } from '@/features/catalog/hooks/useProductDetail';
import { t } from '@/i18n';
import { colors, radius, spacing, typography } from '@/theme';
import type { ProductSku } from '@/types/product';

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

export function ProductDetailScreen({ productId }: ProductDetailScreenProps) {
  const { product, status, errorMessage, refresh } = useProductDetail(productId);
  const addItem = useBasketStore((state) => state.addItem);

  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [confirmation, setConfirmation] = useState(false);

  const hasVariants = (product?.skus.length ?? 0) > 0;
  const selectedSku = useMemo(
    () => (product ? resolveSelectedSku(product.skus, selectedOptions) : null),
    [product, selectedOptions],
  );

  const handleSelectOption = (optionName: string, value: string) => {
    setSelectedOptions((prev) => ({ ...prev, [optionName]: value }));
    setQuantity(1);
    setConfirmation(false);
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

    setConfirmation(true);
  };

  if (status === 'loading') {
    return <LoadingState message={t('productDetail.loadingProduct')} />;
  }

  if (status === 'not-found') {
    return (
      <ErrorState title={t('productDetail.notFoundTitle')} message={t('productDetail.notFoundMessage')} />
    );
  }

  if (status === 'error' || !product) {
    return (
      <ErrorState
        title={t('productDetail.loadErrorTitle')}
        message={errorMessage ?? undefined}
        onRetry={refresh}
      />
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ProductImageGallery images={product.images} />

      <View style={styles.body}>
        <Text style={styles.title}>{product.title}</Text>
        {product.sellerName ? <Text style={styles.seller}>{product.sellerName}</Text> : null}

        <PriceTag price={selectedSku ? selectedSku.price : product.price} />

        {product.description ? <Text style={styles.description}>{product.description}</Text> : null}

        {hasVariants ? (
          <VariantSelector
            skus={product.skus}
            selectedOptions={selectedOptions}
            onSelectOption={handleSelectOption}
          />
        ) : null}

        <View style={styles.quantityRow}>
          <Text style={styles.quantityLabel}>{t('productDetail.quantityLabel')}</Text>
          <QuantitySelector
            quantity={quantity}
            maxQuantity={selectedSku?.inventory}
            onChange={setQuantity}
          />
        </View>

        <Pressable
          disabled={!canAddToBasket}
          style={[styles.addButton, !canAddToBasket && styles.addButtonDisabled]}
          onPress={handleAddToBasket}
        >
          <Text style={styles.addButtonLabel}>
            {canAddToBasket ? t('common.addToBasket') : t('productDetail.selectOptions')}
          </Text>
        </Pressable>

        {confirmation ? <Text style={styles.confirmation}>{t('productDetail.addedToBasket')}</Text> : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: spacing.xxxl,
  },
  body: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  title: {
    ...typography.heading,
    color: colors.textPrimary,
  },
  seller: {
    ...typography.caption,
    color: colors.textMuted,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantityLabel: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
  },
  addButton: {
    backgroundColor: colors.purple,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  addButtonLabel: {
    ...typography.bodyStrong,
    color: colors.white,
  },
  confirmation: {
    ...typography.body,
    color: colors.success,
    textAlign: 'center',
  },
});
