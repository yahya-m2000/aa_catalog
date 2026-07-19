import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Text } from '@/components/Text';
import { checkoutFormSchema, type CheckoutFormValues } from '@/features/checkout/schema/checkoutForm.schema';
import { t } from '@/i18n';
import type { PaymentMethod } from '@/services/api/orders.api';
import { colors, radius, spacing } from '@/theme';

interface CheckoutFormProps {
  onSubmit: (values: CheckoutFormValues, paymentMethod: PaymentMethod) => void;
  isSubmitting: boolean;
}

interface FieldConfig {
  name: keyof CheckoutFormValues;
  label: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences';
}

const PAYMENT_METHODS: { value: PaymentMethod; labelKey: string }[] = [
  { value: 'Cash', labelKey: 'checkout.paymentMethodCash' },
  { value: 'Zaad', labelKey: 'checkout.paymentMethodZaad' },
];

export function CheckoutForm({ onSubmit, isSubmitting }: CheckoutFormProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');

  const FIELDS: FieldConfig[] = [
    { name: 'fullName', label: t('checkout.fullNameLabel') },
    { name: 'email', label: t('checkout.emailLabel'), keyboardType: 'email-address', autoCapitalize: 'none' },
    { name: 'phone', label: t('checkout.phoneLabel'), keyboardType: 'phone-pad' },
    { name: 'shippingAddress', label: t('checkout.shippingAddressLabel') },
    { name: 'city', label: t('checkout.cityLabel') },
    { name: 'postcode', label: t('checkout.postcodeLabel') },
    { name: 'country', label: t('checkout.countryLabel') },
  ];

  const { control, handleSubmit } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      shippingAddress: '',
      city: '',
      postcode: '',
      country: '',
    },
  });

  return (
    <View style={styles.container}>
      {FIELDS.map((fieldConfig) => (
        <Controller
          key={fieldConfig.name}
          control={control}
          name={fieldConfig.name}
          render={({ field, fieldState }) => (
            <Input
              label={fieldConfig.label}
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              errorMessage={fieldState.error?.message}
              keyboardType={fieldConfig.keyboardType}
              autoCapitalize={fieldConfig.autoCapitalize}
              editable={!isSubmitting}
            />
          )}
        />
      ))}

      <View style={styles.paymentSection}>
        <Text variant="caption" color={colors.textSecondary}>
          {t('checkout.paymentMethodHeading')}
        </Text>
        <View style={styles.paymentOptionsRow}>
          {PAYMENT_METHODS.map((method) => {
            const isSelected = paymentMethod === method.value;
            return (
              <Pressable
                key={method.value}
                disabled={isSubmitting}
                style={[styles.paymentOption, isSelected && styles.paymentOptionSelected]}
                onPress={() => setPaymentMethod(method.value)}
              >
                <Text variant="bodyStrong" color={isSelected ? colors.white : colors.textSecondary}>
                  {t(method.labelKey)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Button
        label={isSubmitting ? t('checkout.placingOrder') : t('checkout.placeOrder')}
        variant="secondary"
        disabled={isSubmitting}
        style={styles.submitButton}
        onPress={handleSubmit((values) => onSubmit(values, paymentMethod))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  paymentSection: {
    gap: spacing.xs,
  },
  paymentOptionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  paymentOption: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  paymentOptionSelected: {
    backgroundColor: colors.textPrimary,
    borderColor: colors.textPrimary,
  },
  submitButton: {
    marginTop: spacing.sm,
  },
});
