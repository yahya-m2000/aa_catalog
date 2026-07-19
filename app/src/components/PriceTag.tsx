import { StyleSheet, View } from 'react-native';

import { Text } from './Text';
import { colors, spacing } from '@/theme';
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
      <Text
        variant="price"
        color={colors.textPrimary}
        style={compact ? styles.finalAmountCompact : undefined}
      >
        ${formatAmount(price.finalAmount)}
      </Text>
      {showOriginal ? (
        <Text variant="caption" color={colors.textMuted} style={styles.originalAmount}>
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
  finalAmountCompact: {
    fontSize: 16,
  },
  originalAmount: {
    textDecorationLine: 'line-through',
  },
});
