import { useRouter } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Text } from '@/components/Text';
import { BasketReviewSummary } from '@/features/checkout/components/BasketReviewSummary';
import { CheckoutForm } from '@/features/checkout/components/CheckoutForm';
import { useSubmitOrder } from '@/features/checkout/hooks/useSubmitOrder';
import { useBasketStore } from '@/features/basket/store/basket.store';
import { t } from '@/i18n';
import { colors, radius, spacing } from '@/theme';
import { calculateBasketTotals } from '@/utils/pricing/pricing';

export function CheckoutScreen() {
  const router = useRouter();
  const items = useBasketStore((state) => state.items);
  const totals = useMemo(() => calculateBasketTotals(items), [items]);
  const { status, errorMessage, result, submit } = useSubmitOrder();

  useEffect(() => {
    if (status === 'success' && result) {
      router.replace({ pathname: '/checkout/success', params: { reference: result.reference } });
      return;
    }
    if (items.length === 0 && status === 'idle') {
      router.replace('/basket');
    }
  }, [status, result, items.length, router]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <BasketReviewSummary items={items} totals={totals} />

      <Text variant="subheading">{t('checkout.deliveryDetailsHeading')}</Text>
      <CheckoutForm onSubmit={submit} isSubmitting={status === 'submitting'} />

      {status === 'error' ? (
        <View style={styles.errorBanner}>
          <Text variant="body" color={colors.error}>
            {errorMessage}
          </Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  errorBanner: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: radius.md,
    padding: spacing.md,
  },
});
