import { z } from 'zod';

export const checkoutFormSchema = z.object({
  fullName: z.string().trim().min(1, 'Full name is required'),
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email address'),
  phone: z.string().trim().min(1, 'Phone number is required'),
  shippingAddress: z.string().trim().min(1, 'Shipping address is required'),
  city: z.string().trim().min(1, 'City is required'),
  postcode: z.string().trim().min(1, 'Postcode is required'),
  country: z.string().trim().min(1, 'Country is required'),
});

export const orderItemSchema = z.object({
  productId: z.string().min(1),
  skuId: z.string().min(1).optional(),
  quantity: z.coerce.number().int().min(1),
  notes: z.string().trim().max(500).optional(),
});

export const createOrderSchema = z.object({
  customer: checkoutFormSchema,
  items: z.array(orderItemSchema).min(1, 'Basket must contain at least one item'),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
