import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PriceTag } from '@/components/PriceTag';
import { QuantitySelector } from '@/features/catalog/components/QuantitySelector';
import { t } from '@/i18n';
import { colors, radius, spacing, typography } from '@/theme';
import type { BasketItem } from '@/types/basket';

interface BasketListItemProps {
  item: BasketItem;
  onChangeQuantity: (quantity: number) => void;
  onRemove: () => void;
}

export function BasketListItem({ item, onChangeQuantity, onRemove }: BasketListItemProps) {
  const variantSummary = item.selectedSku?.options.map((option) => option.value).join(', ');

  return (
    <View style={styles.container}>
      <Image source={{ uri: item.productImageUrl }} style={styles.image} contentFit="cover" />
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {item.productTitle}
        </Text>
        {variantSummary ? <Text style={styles.variant}>{variantSummary}</Text> : null}
        <PriceTag price={item.unitPrice} compact />
        <View style={styles.footerRow}>
          <QuantitySelector quantity={item.quantity} onChange={onChangeQuantity} />
          <Pressable onPress={onRemove}>
            <Text style={styles.removeLabel}>{t('basket.remove')}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  image: {
    width: 88,
    height: 88,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
  },
  body: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    ...typography.body,
    color: colors.textPrimary,
  },
  variant: {
    ...typography.caption,
    color: colors.textMuted,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  removeLabel: {
    ...typography.caption,
    color: colors.error,
  },
});
