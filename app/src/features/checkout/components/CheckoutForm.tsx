import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Input } from '@/components/Input';
import { checkoutFormSchema, type CheckoutFormValues } from '@/features/checkout/schema/checkoutForm.schema';
import { t } from '@/i18n';
import { colors, radius, spacing, typography } from '@/theme';

interface CheckoutFormProps {
  onSubmit: (values: CheckoutFormValues) => void;
  isSubmitting: boolean;
}

interface FieldConfig {
  name: keyof CheckoutFormValues;
  label: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences';
}

export function CheckoutForm({ onSubmit, isSubmitting }: CheckoutFormProps) {
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

      <Pressable
        disabled={isSubmitting}
        style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
        onPress={handleSubmit(onSubmit)}
      >
        <Text style={styles.submitButtonLabel}>
          {isSubmitting ? t('checkout.placingOrder') : t('checkout.placeOrder')}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  submitButton: {
    backgroundColor: colors.purple,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonLabel: {
    ...typography.bodyStrong,
    color: colors.white,
  },
});
