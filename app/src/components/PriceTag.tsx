import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/theme';
import type { ProductPrice } from '@/types/product';

interface PriceTagProps {
  price: ProductPrice;
  compact?: boolean;
}

function formatAmount(amount: number): string {
  return amount.toFixed(2);
}

export function PriceTag({ price, compact = false }: PriceTagProps) {
  const showOriginal = price.currency !== 'USD';

  return (
    <View style={styles.container}>
      <Text style={[styles.finalAmount, compact && styles.finalAmountCompact]}>
        ${formatAmount(price.finalAmount)}
      </Text>
      {showOriginal ? (
        <Text style={styles.originalAmount}>
          {price.currency} {formatAmount(price.amount)}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  finalAmount: {
    ...typography.price,
    color: colors.purpleLight,
  },
  finalAmountCompact: {
    fontSize: 16,
  },
  originalAmount: {
    ...typography.caption,
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
});
