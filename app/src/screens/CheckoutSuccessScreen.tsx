import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { t } from '@/i18n';
import { colors, radius, spacing, typography } from '@/theme';

interface CheckoutSuccessScreenProps {
  reference: string;
}

export function CheckoutSuccessScreen({ reference }: CheckoutSuccessScreenProps) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('checkoutSuccess.title')}</Text>
      <Text style={styles.message}>{t('checkoutSuccess.message')}</Text>
      <View style={styles.referenceBox}>
        <Text style={styles.referenceLabel}>{t('checkoutSuccess.referenceLabel')}</Text>
        <Text style={styles.referenceValue}>{reference}</Text>
      </View>
      <Pressable style={styles.homeButton} onPress={() => router.replace('/')}>
        <Text style={styles.homeButtonLabel}>{t('checkoutSuccess.continueShopping')}</Text>
      </Pressable>
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
  title: {
    ...typography.heading,
    color: colors.textPrimary,
  },
  message: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  referenceBox: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    gap: spacing.xs,
  },
  referenceLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  referenceValue: {
    ...typography.price,
    color: colors.purpleLight,
  },
  homeButton: {
    marginTop: spacing.md,
    backgroundColor: colors.purple,
    borderRadius: radius.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  homeButtonLabel: {
    ...typography.bodyStrong,
    color: colors.white,
  },
});
