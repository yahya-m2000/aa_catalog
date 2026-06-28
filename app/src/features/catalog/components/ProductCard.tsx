import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PriceTag } from '@/components/PriceTag';
import { t } from '@/i18n';
import { colors, radius, spacing, typography } from '@/theme';
import type { NormalizedProduct } from '@/types/product';

interface ProductCardProps {
  product: NormalizedProduct;
  onPress: (product: NormalizedProduct) => void;
  onAddToBasket: (product: NormalizedProduct) => void;
}

export function ProductCard({ product, onPress, onAddToBasket }: ProductCardProps) {
  const primaryImage = product.images.find((image) => image.isPrimary) ?? product.images[0];
  const subtitle = product.sellerName ?? product.category;

  return (
    <Pressable style={styles.card} onPress={() => onPress(product)}>
      <Image
        source={primaryImage ? { uri: primaryImage.url } : undefined}
        style={styles.image}
        contentFit="cover"
        transition={150}
      />
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {product.title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
        <PriceTag price={product.price} compact />
        <Pressable style={styles.addButton} onPress={() => onAddToBasket(product)}>
          <Text style={styles.addButtonLabel}>{t('common.addToBasket')}</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: colors.surfaceAlt,
  },
  body: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  title: {
    ...typography.body,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textMuted,
  },
  addButton: {
    marginTop: spacing.sm,
    backgroundColor: colors.purple,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  addButtonLabel: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '600',
  },
});
