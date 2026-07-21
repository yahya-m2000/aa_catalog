import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Text } from '@/components/Text';
import { t } from '@/i18n';
import { colors } from '@/theme';

interface CheckoutSuccessScreenProps {
  reference: string;
}

export function CheckoutSuccessScreen({ reference }: CheckoutSuccessScreenProps) {
  const router = useRouter();

  return (
    <View className="flex-1 bg-background items-center justify-center p-xl gap-lg">
      <Text variant="heading">{t('checkoutSuccess.title')}</Text>
      <Text variant="body" color={colors.textSecondary} style={{ textAlign: 'center' }}>
        {t('checkoutSuccess.message')}
      </Text>
      <Card className="items-center gap-xs px-xl">
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
        style={{ alignSelf: 'stretch', marginTop: 12 }}
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
