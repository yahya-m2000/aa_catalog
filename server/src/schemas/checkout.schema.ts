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
  // Optional + defaulted: older/unknown clients that don't send a payment method
  // still default sensibly to Cash. The checkout UI (Run 15) now collects this via
  // CheckoutForm's Cash/Zaad selector.
  paymentMethod: z.enum(['Cash', 'Zaad']).default('Cash'),
  items: z.array(orderItemSchema).min(1, 'Basket must contain at least one item'),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export const orderLookupSchema = z.object({
  reference: z.string().trim().min(1, 'Order reference is required'),
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email address'),
});

export type OrderLookupInput = z.infer<typeof orderLookupSchema>;
