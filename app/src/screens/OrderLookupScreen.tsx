import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { Text } from '@/components/Text';
import { t } from '@/i18n';
import { ApiClientError } from '@/services/api/client';
import { lookupOrder, type PublicOrderDTO } from '@/services/api/orders.api';
import { colors, spacing } from '@/theme';

export function OrderLookupScreen() {
  const [reference, setReference] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<PublicOrderDTO | null>(null);

  const canSubmit = reference.trim().length > 0 && email.trim().length > 0 && !submitting;

  const handleSubmit = () => {
    setSubmitting(true);
    setNotFound(false);
    setErrorMessage(null);
    setResult(null);

    lookupOrder({ reference: reference.trim(), email: email.trim() })
      .then(setResult)
      .catch((err) => {
        if (err instanceof ApiClientError && err.code === 'NOT_FOUND') {
          setNotFound(true);
        } else {
          setErrorMessage(err instanceof ApiClientError ? err.message : t('common.somethingWentWrong'));
        }
      })
      .finally(() => setSubmitting(false));
  };

  const handleNewSearch = () => {
    setResult(null);
    setNotFound(false);
    setErrorMessage(null);
  };

  if (result) {
    return (
      <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}>
        <Card className="gap-sm">
          <View className="flex-row justify-between items-center">
            <Text variant="caption" color={colors.textMuted}>
              {t('orderLookup.resultReferenceLabel')}
            </Text>
            <Text variant="bodyStrong" color={colors.textPrimary}>
              {result.reference}
            </Text>
          </View>
          <View className="flex-row justify-between items-center">
            <Text variant="caption" color={colors.textMuted}>
              {t('orderLookup.resultStatusLabel')}
            </Text>
            <Text variant="bodyStrong" color={colors.textPrimary}>
              {result.status}
            </Text>
          </View>
          <View className="flex-row justify-between items-center">
            <Text variant="caption" color={colors.textMuted}>
              {t('orderLookup.resultDateLabel')}
            </Text>
            <Text variant="body" color={colors.textPrimary}>
              {new Date(result.createdAt).toLocaleDateString()}
            </Text>
          </View>
          <View className="flex-row justify-between items-center">
            <Text variant="caption" color={colors.textMuted}>
              {t('orderLookup.resultPaymentMethodLabel')}
            </Text>
            <Text variant="body" color={colors.textPrimary}>
              {result.paymentMethod}
            </Text>
          </View>
        </Card>

        <Card className="gap-sm">
          <Text variant="subheading">{t('orderLookup.resultItemsHeading')}</Text>
          {result.items.map((item, index) => (
            <View key={`${item.productId}-${item.skuId ?? index}`} className="flex-row justify-between py-xs">
              <Text variant="body" color={colors.textPrimary} style={{ flex: 1, marginRight: spacing.sm }}>
                {item.productTitle}
              </Text>
              <Text variant="body" color={colors.textSecondary}>
                x{item.quantity}
              </Text>
            </View>
          ))}
          <View className="flex-row justify-between items-center mt-sm pt-sm border-t border-border">
            <Text variant="bodyStrong" color={colors.textPrimary}>
              {t('orderLookup.resultTotalLabel')}
            </Text>
            <Text variant="price" color={colors.textPrimary}>
              ${result.totalUsd.toFixed(2)}
            </Text>
          </View>
        </Card>

        <Button label={t('orderLookup.newSearch')} variant="outline" onPress={handleNewSearch} />
      </ScrollView>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}>
      <Text variant="heading">{t('orderLookup.title')}</Text>
      <Text variant="body" color={colors.textSecondary}>
        {t('orderLookup.intro')}
      </Text>

      <Input
        label={t('orderLookup.referenceLabel')}
        value={reference}
        onChangeText={setReference}
        autoCapitalize="characters"
      />
      <Input
        label={t('orderLookup.emailLabel')}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      {notFound ? (
        <View>
          <Text variant="captionStrong" color={colors.error}>
            {t('orderLookup.notFoundTitle')}
          </Text>
          <Text variant="caption" color={colors.textSecondary}>
            {t('orderLookup.notFoundMessage')}
          </Text>
        </View>
      ) : null}
      {errorMessage ? (
        <Text variant="caption" color={colors.error}>
          {errorMessage}
        </Text>
      ) : null}

      <Button
        label={submitting ? t('orderLookup.searching') : t('orderLookup.submitButton')}
        variant="secondary"
        disabled={!canSubmit}
        onPress={handleSubmit}
      />
    </ScrollView>
  );
}
