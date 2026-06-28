import { StyleSheet, Text, View } from 'react-native';

import { BasketSummary } from '@/features/basket/components/BasketSummary';
import { t } from '@/i18n';
import { colors, radius, spacing, typography } from '@/theme';
import type { BasketItem, BasketTotals } from '@/types/basket';

interface BasketReviewSummaryProps {
  items: BasketItem[];
  totals: BasketTotals;
}

export function BasketReviewSummary({ items, totals }: BasketReviewSummaryProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>{t('checkout.orderSummaryHeading')}</Text>
      {items.map((item) => {
        const variantSummary = item.selectedSku?.options.map((option) => option.value).join(', ');
        return (
          <View key={`${item.productId}::${item.selectedSku?.skuId ?? ''}`} style={styles.itemRow}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemTitle} numberOfLines={1}>
                {item.productTitle}
              </Text>
              {variantSummary ? <Text style={styles.itemVariant}>{variantSummary}</Text> : null}
              <Text style={styles.itemQuantity}>
                {t('checkout.quantityPrefix')} {item.quantity}
              </Text>
            </View>
            <Text style={styles.itemPrice}>${(item.unitPrice.finalAmount * item.quantity).toFixed(2)}</Text>
          </View>
        );
      })}
      <View style={styles.divider} />
      <BasketSummary totals={totals} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  heading: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    ...typography.body,
    color: colors.textPrimary,
  },
  itemVariant: {
    ...typography.caption,
    color: colors.textMuted,
  },
  itemQuantity: {
    ...typography.caption,
    color: colors.textMuted,
  },
  itemPrice: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
});
