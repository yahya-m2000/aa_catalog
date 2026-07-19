import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Text } from '@/components/Text';
import { t } from '@/i18n';
import { colors, spacing } from '@/theme';

interface CheckoutSuccessScreenProps {
  reference: string;
}

export function CheckoutSuccessScreen({ reference }: CheckoutSuccessScreenProps) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text variant="heading">{t('checkoutSuccess.title')}</Text>
      <Text variant="body" color={colors.textSecondary} style={styles.message}>
        {t('checkoutSuccess.message')}
      </Text>
      <Card style={styles.referenceBox}>
        <Text variant="caption" color={colors.textMuted}>
          {t('checkoutSuccess.referenceLabel')}
        </Text>
        <Text variant="price" color={colors.textPrimary}>
          {reference}
        </Text>
      </Card>
      <Button
        label={t('checkoutSuccess.viewPaymentInstructions')}
        variant="secondary"
        style={styles.paymentButton}
        onPress={() => router.push({ pathname: '/checkout/payment', params: { reference } })}
      />
      <Button
        label={t('checkoutSuccess.continueShopping')}
        variant="outline"
        onPress={() => router.replace('/')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.lg,
  },
  message: {
    textAlign: 'center',
  },
  referenceBox: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.xl,
  },
  paymentButton: {
    alignSelf: 'stretch',
    marginTop: spacing.md,
  },
});
