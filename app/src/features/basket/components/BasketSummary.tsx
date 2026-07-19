import { StyleSheet, Text, View } from 'react-native';

import { t } from '@/i18n';
import { colors, spacing, typography } from '@/theme';
import type { BasketTotals } from '@/types/basket';

interface BasketSummaryProps {
  totals: BasketTotals;
}

function formatUSD(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

export function BasketSummary({ totals }: BasketSummaryProps) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>{t('basket.subtotal')}</Text>
        <Text style={styles.value}>{formatUSD(totals.subtotalUSD)}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>{t('basket.serviceAndMarkup')}</Text>
        <Text style={styles.value}>{formatUSD(totals.markupTotalUSD)}</Text>
      </View>
      <View style={[styles.row, styles.finalRow]}>
        <Text style={styles.finalLabel}>{t('basket.total')}</Text>
        <Text style={styles.finalValue}>{formatUSD(totals.finalTotalUSD)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    ...typography.body,
    color: colors.textSecondary,
  },
  value: {
    ...typography.body,
    color: colors.textPrimary,
  },
  finalRow: {
    marginTop: spacing.xs,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  finalLabel: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
  },
  finalValue: {
    ...typography.price,
    color: colors.textPrimary,
  },
});
