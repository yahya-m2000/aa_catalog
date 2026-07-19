import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/Card';
import { PriceBreakdown } from '@/components/PriceBreakdown';
import { Text } from '@/components/Text';
import { t } from '@/i18n';
import { colors, spacing } from '@/theme';
import type { BasketItem, BasketTotals } from '@/types/basket';

interface BasketReviewSummaryProps {
  items: BasketItem[];
  totals: BasketTotals;
  country?: string;
}

export function BasketReviewSummary({ items, totals, country }: BasketReviewSummaryProps) {
  return (
    <Card style={styles.container}>
      <Text variant="bodyStrong" style={styles.heading}>
        {t('checkout.orderSummaryHeading')}
      </Text>
      {items.map((item) => {
        const variantSummary = item.selectedSku?.options.map((option) => option.value).join(', ');
        return (
          <View key={`${item.productId}::${item.selectedSku?.skuId ?? ''}`} style={styles.itemRow}>
            <View style={styles.itemInfo}>
              <Text variant="body" color={colors.textPrimary} numberOfLines={1}>
                {item.productTitle}
              </Text>
              {variantSummary ? (
                <Text variant="caption" color={colors.textMuted}>
                  {variantSummary}
                </Text>
              ) : null}
              <Text variant="caption" color={colors.textMuted}>
                {t('checkout.quantityPrefix')} {item.quantity}
              </Text>
            </View>
            <Text variant="bodyStrong" color={colors.textPrimary}>
              ${(item.unitPrice.finalAmount * item.quantity).toFixed(2)}
            </Text>
          </View>
        );
      })}
      <View style={styles.divider} />
      <PriceBreakdown totals={totals} country={country} />
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  heading: {
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
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
});
