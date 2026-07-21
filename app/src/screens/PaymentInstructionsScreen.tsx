import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ErrorState } from '@/components/ErrorState';
import { LoadingState } from '@/components/LoadingState';
import { Text } from '@/components/Text';
import { t } from '@/i18n';
import { ApiClientError } from '@/services/api/client';
import { getPaymentInstructions, type PaymentInstructions } from '@/services/api/payment.api';
import { colors, spacing } from '@/theme';

interface PaymentInstructionsScreenProps {
  reference?: string;
}

export function PaymentInstructionsScreen({ reference }: PaymentInstructionsScreenProps) {
  const router = useRouter();
  const [instructions, setInstructions] = useState<PaymentInstructions | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getPaymentInstructions(reference)
      .then((result) => {
        if (!cancelled) setInstructions(result);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof ApiClientError ? err.message : t('common.somethingWentWrong'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [reference]);

  if (loading) {
    return <LoadingState message={t('payment.loading')} />;
  }

  if (error || !instructions) {
    return (
      <ErrorState
        title={t('payment.loadErrorTitle')}
        message={error ?? undefined}
        onRetry={() => {
          setLoading(true);
          setError(null);
          getPaymentInstructions(reference)
            .then(setInstructions)
            .catch((err) => setError(err instanceof ApiClientError ? err.message : t('common.somethingWentWrong')))
            .finally(() => setLoading(false));
        }}
      />
    );
  }

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}>
      <Text variant="heading">{t('payment.title')}</Text>

      <Card className="gap-sm">
        <Text variant="body" color={colors.textPrimary} style={{ lineHeight: 22 }}>
          {instructions.instructionsEn}
        </Text>
      </Card>

      <Card className="gap-sm">
        <View className="flex-row justify-between items-center">
          <Text variant="caption" color={colors.textMuted}>
            {t('checkout.paymentMethodZaad')}
          </Text>
          <Text variant="bodyStrong" color={colors.textPrimary}>
            {instructions.zaadNumber}
          </Text>
        </View>
        <View className="flex-row justify-between items-center">
          <Text variant="caption" color={colors.textMuted}>
            {instructions.zaadAccountName}
          </Text>
        </View>
        <View className="flex-row justify-between items-center">
          <Text variant="caption" color={colors.textMuted}>
            {t('checkout.paymentMethodCash')}
          </Text>
          <Text variant="bodyStrong" color={colors.textPrimary}>
            {instructions.cashContactNumber}
          </Text>
        </View>
      </Card>

      <Text variant="caption" color={colors.textSecondary} style={{ textAlign: 'center' }}>
        {t('payment.deadlineNote', { days: instructions.paymentDeadlineDays })}
      </Text>

      <Button
        label={t('payment.doneButton')}
        variant="secondary"
        onPress={() => router.replace('/')}
        style={{ marginTop: 12 }}
      />
    </ScrollView>
  );
}
