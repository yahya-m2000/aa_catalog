import { z } from 'zod';

import type { GraphListItem, PaymentMethod } from './orders.types';

const CUSTOMER_STATUS_LABELS: Record<string, string> = {
  'Order Received': 'Order Received',
  'Payment Pending': 'Payment Pending',
  Processing: 'Processing',
  Completed: 'Completed',
  Cancelled: 'Cancelled',
  Expired: 'Expired',
};

const DEFAULT_CUSTOMER_STATUS_LABEL = 'Processing';

const lineItemSchema = z.object({
  productId: z.string(),
  skuId: z.string().optional(),
  productTitle: z.string(),
  variantOptions: z.array(z.object({ name: z.string(), value: z.string() })).optional(),
  quantity: z.number(),
});

const lineItemsSchema = z.array(lineItemSchema);

export interface PublicOrderLineItem {
  productId: string;
  skuId?: string;
  productTitle: string;
  variantOptions?: { name: string; value: string }[];
  quantity: number;
}

export interface PublicOrderDTO {
  reference: string;
  createdAt: string;
  status: string;
  items: PublicOrderLineItem[];
  totalUsd: number;
  paymentMethod: PaymentMethod;
}

/**
 * Parses LineItemsJson defensively — SharePoint enforces no schema on this field (plan §4a/§8),
 * so a malformed value must degrade to an empty list, never throw into the lookup endpoint.
 */
function parseLineItems(raw: string): PublicOrderLineItem[] {
  try {
    const parsed = JSON.parse(raw);
    const result = lineItemsSchema.safeParse(parsed);
    return result.success ? result.data : [];
  } catch {
    return [];
  }
}

function mapCustomerStatusLabel(status: string): string {
  return CUSTOMER_STATUS_LABELS[status] ?? DEFAULT_CUSTOMER_STATUS_LABEL;
}

/**
 * Only reads the specific columns it needs — never InternalStatus, InternalNotes, or any
 * other field — and never returns the raw Graph item (plan §8).
 */
export function toPublicOrderDTO(item: GraphListItem): PublicOrderDTO {
  const { fields } = item;
  return {
    reference: fields.OrderReference,
    createdAt: fields.CreatedAt,
    status: mapCustomerStatusLabel(fields.CustomerStatus),
    items: parseLineItems(fields.LineItemsJson),
    totalUsd: fields.TotalUsd,
    paymentMethod: fields.PaymentMethod,
  };
}
