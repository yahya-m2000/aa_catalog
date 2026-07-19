import { StyleSheet, View } from 'react-native';

import { Text } from './Text';
import { t } from '@/i18n';
import { colors, spacing } from '@/theme';
import { getEstimatedDeliveryFeeUsd } from '@/utils/pricing/deliveryZone';
import type { BasketTotals } from '@/types/basket';

// Mirrors the backend's SERVICE_FEE_FIXED_USD env default (server/src/config/pricing.config.ts).
// Display-only — the backend recomputes the authoritative fee at checkout.
const ESTIMATED_SERVICE_FEE_USD = 0;

interface PriceBreakdownProps {
  totals: BasketTotals;
  /** Delivery destination country, used to estimate the delivery line (Somaliland-only at launch). */
  country?: string;
}

function formatUSD(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

/**
 * Customer-facing price breakdown (plan §6): three lines — "Item price"
 * (markup already folded in, never shown as its own line so margin isn't
 * exposed), "Delivery estimate", "Service fee" — plus a final total.
 *
 * `totals.subtotalUSD` here is used as the "Item price" line: it already
 * reflects the marked-up, customer-facing unit prices from
 * `calculateBasketTotals` (see ProductPrice.finalAmount upstream), so no
 * separate markup figure is surfaced.
 */
export function PriceBreakdown({ totals, country }: PriceBreakdownProps) {
  const deliveryUsd = getEstimatedDeliveryFeeUsd(country);
  const serviceFeeUsd = ESTIMATED_SERVICE_FEE_USD;
  const totalUsd = totals.finalTotalUSD + deliveryUsd;

  return (
    <View style={styles.container}>
      <Row label={t('priceBreakdown.itemPrice')} value={formatUSD(totals.finalTotalUSD)} />
      <Row label={t('priceBreakdown.deliveryEstimate')} value={formatUSD(deliveryUsd)} />
      <Row label={t('priceBreakdown.serviceFee')} value={formatUSD(serviceFeeUsd)} />
      <View style={styles.divider} />
      <Row
        label={t('priceBreakdown.total')}
        value={formatUSD(totalUsd)}
        labelVariant="bodyStrong"
        valueVariant="price"
      />
    </View>
  );
}

function Row({
  label,
  value,
  labelVariant = 'body',
  valueVariant = 'body',
}: {
  label: string;
  value: string;
  labelVariant?: 'body' | 'bodyStrong';
  valueVariant?: 'body' | 'bodyStrong' | 'price';
}) {
  return (
    <View style={styles.row}>
      <Text variant={labelVariant} color={colors.textSecondary}>
        {label}
      </Text>
      <Text variant={valueVariant} color={colors.textPrimary}>
        {value}
      </Text>
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
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },
});
