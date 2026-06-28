import { z } from 'zod';

import { t } from '@/i18n';

export const checkoutFormSchema = z.object({
  fullName: z.string().trim().min(1, t('checkout.validation.fullNameRequired')),
  email: z
    .string()
    .trim()
    .min(1, t('checkout.validation.emailRequired'))
    .email(t('checkout.validation.emailInvalid')),
  phone: z.string().trim().min(1, t('checkout.validation.phoneRequired')),
  shippingAddress: z.string().trim().min(1, t('checkout.validation.shippingAddressRequired')),
  city: z.string().trim().min(1, t('checkout.validation.cityRequired')),
  postcode: z.string().trim().min(1, t('checkout.validation.postcodeRequired')),
  country: z.string().trim().min(1, t('checkout.validation.countryRequired')),
});

export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;
