import type { OrderLineItem } from '../../types/order';

export type CustomerStatus =
  | 'Order Received'
  | 'Payment Pending'
  | 'Processing'
  | 'Completed'
  | 'Cancelled'
  | 'Expired';

export type InternalStatus =
  | 'New'
  | 'Awaiting Payment'
  | 'Payment Confirmed'
  | 'Procuring'
  | 'Shipped'
  | 'Completed'
  | 'Cancelled'
  | 'Expired'
  | 'Needs Review';

export type PaymentMethod = 'Cash' | 'Zaad';
export type EmailDeliveryStatus = 'Sent' | 'Failed' | 'Pending Retry';

// Fields as written to / read from the SharePoint "Orders" list (plan §4b).
export interface OrderListItemFields {
  OrderReference: string;
  CustomerFullName: string;
  CustomerEmail: string;
  CustomerPhone: string;
  ShippingAddress: string;
  City: string;
  Postcode: string;
  Country: string;
  PaymentMethod: PaymentMethod;
  CustomerStatus: CustomerStatus;
  InternalStatus: InternalStatus;
  InternalNotes?: string;
  LineItemsJson: string;
  SubtotalUsd: number;
  DeliveryUsd: number;
  ServiceFeeUsd: number;
  MarkupUsd: number;
  TotalUsd: number;
  PricingPolicyVersion: string;
  FxRate: number;
  FxRateAt: string;
  PriceValidatedAt: string;
  CreatedAt: string;
  ExpiresAt: string;
  ExpiredAt?: string;
  CustomerEmailStatus?: EmailDeliveryStatus;
  InternalEmailStatus?: EmailDeliveryStatus;
  HiobuyOrderId?: string;
  HiobuyPurchaseStatus?: string;
  ProcuredAt?: string;
}

export interface GraphListItem {
  id: string;
  '@odata.etag': string;
  fields: OrderListItemFields;
}

export interface CreateOrderItemInput {
  reference: string;
  customer: {
    fullName: string;
    email: string;
    phone: string;
    shippingAddress: string;
    city: string;
    postcode: string;
    country: string;
  };
  paymentMethod: PaymentMethod;
  lineItems: OrderLineItem[];
  totals: {
    subtotalUsd: number;
    deliveryUsd: number;
    serviceFeeUsd: number;
    markupUsd: number;
    totalUsd: number;
  };
  pricingPolicyVersion: string;
  fxRate: number;
  fxRateAt: string;
  priceValidatedAt: string;
  createdAt: string;
  expiresAt: string;
  internalNotes?: string;
}
