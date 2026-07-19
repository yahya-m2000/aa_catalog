import { env } from '../../config/env';
import { recordGraphCall } from '../../utils/logger';
import { GraphConflictError, GraphRequestError, getGraphClient } from './graph.client';
import type {
  CreateOrderItemInput,
  CustomerStatus,
  EmailDeliveryStatus,
  GraphListItem,
  InternalStatus,
  OrderListItemFields,
} from './orders.types';

function listBase(): string {
  return `/sites/${env.graph.siteId}/lists/${env.graph.ordersListId}`;
}

export async function createOrderItem(input: CreateOrderItemInput): Promise<GraphListItem> {
  const fields: OrderListItemFields = {
    OrderReference: input.reference,
    CustomerFullName: input.customer.fullName,
    CustomerEmail: input.customer.email,
    CustomerPhone: input.customer.phone,
    ShippingAddress: input.customer.shippingAddress,
    City: input.customer.city,
    Postcode: input.customer.postcode,
    Country: input.customer.country,
    PaymentMethod: input.paymentMethod,
    CustomerStatus: 'Order Received',
    InternalStatus: 'New',
    LineItemsJson: JSON.stringify(input.lineItems),
    SubtotalUsd: input.totals.subtotalUsd,
    DeliveryUsd: input.totals.deliveryUsd,
    ServiceFeeUsd: input.totals.serviceFeeUsd,
    MarkupUsd: input.totals.markupUsd,
    TotalUsd: input.totals.totalUsd,
    PricingPolicyVersion: input.pricingPolicyVersion,
    FxRate: input.fxRate,
    FxRateAt: input.fxRateAt,
    PriceValidatedAt: input.priceValidatedAt,
    CreatedAt: input.createdAt,
    ExpiresAt: input.expiresAt,
    ...(input.internalNotes ? { InternalNotes: input.internalNotes } : {}),
  };

  try {
    const client = getGraphClient();
    const created = await client.api(`${listBase()}/items`).post({ fields });
    recordGraphCall('createOrderItem', true);
    return created as GraphListItem;
  } catch (error) {
    recordGraphCall('createOrderItem', false);
    throw new GraphRequestError('Failed to create order in SharePoint', undefined, error);
  }
}

/**
 * Looks up an order by its reference. Always performs the same Graph round-trip
 * regardless of input shape, so callers can build a timing-normalized lookup on top
 * (plan §8 — enumeration resistance must cover response latency, not just message text).
 */
export async function getOrderItemByReference(reference: string): Promise<GraphListItem | null> {
  try {
    const client = getGraphClient();
    const escaped = reference.replace(/'/g, "''");
    const result = await client
      .api(`${listBase()}/items`)
      .filter(`fields/OrderReference eq '${escaped}'`)
      .expand('fields')
      .get();

    const items = (result.value ?? []) as GraphListItem[];
    recordGraphCall('getOrderItemByReference', true);
    return items[0] ?? null;
  } catch (error) {
    recordGraphCall('getOrderItemByReference', false);
    throw new GraphRequestError('Failed to look up order in SharePoint', undefined, error);
  }
}

/**
 * SharePoint silently drops "multiple lines of text" columns (LineItemsJson,
 * InternalNotes) from an item on ANY partial /fields PATCH that doesn't explicitly
 * re-include them — confirmed by direct testing against the live Graph API, and
 * reproducible even with appendChangesToExistingText disabled on the column. Every
 * PATCH must therefore re-send their current values alongside whatever's actually
 * changing, or a later read of those columns silently comes back empty.
 */
const MULTILINE_TEXT_FIELDS = ['LineItemsJson', 'InternalNotes'] as const;

export async function updateOrderItemFields(
  itemId: string,
  etag: string,
  fields: Partial<OrderListItemFields>,
): Promise<string> {
  try {
    const client = getGraphClient();

    const needsMultilinePreservation = MULTILINE_TEXT_FIELDS.some((key) => !(key in fields));
    let patchFields = fields;

    if (needsMultilinePreservation) {
      const current = await client.api(`${listBase()}/items/${itemId}`).expand('fields').get();
      const preserved: Partial<OrderListItemFields> = {};
      for (const key of MULTILINE_TEXT_FIELDS) {
        if (!(key in fields) && current.fields[key] !== undefined) {
          preserved[key] = current.fields[key];
        }
      }
      patchFields = { ...preserved, ...fields };
    }

    const updated = await client
      .api(`${listBase()}/items/${itemId}/fields`)
      .header('If-Match', etag)
      .patch(patchFields);
    recordGraphCall('updateOrderItemFields', true);
    return (updated?.['@odata.etag'] as string | undefined) ?? etag;
  } catch (error) {
    recordGraphCall('updateOrderItemFields', false);
    const statusCode = (error as { statusCode?: number })?.statusCode;
    if (statusCode === 412) {
      throw new GraphConflictError(
        `Order item ${itemId} was modified concurrently (ETag mismatch) — refusing to overwrite`,
        error,
      );
    }
    throw new GraphRequestError(`Failed to update order item ${itemId}`, statusCode, error);
  }
}

export async function updateEmailStatus(
  itemId: string,
  etag: string,
  which: 'CustomerEmailStatus' | 'InternalEmailStatus',
  status: EmailDeliveryStatus,
): Promise<string> {
  return updateOrderItemFields(itemId, etag, { [which]: status });
}

export async function updateOrderStatus(
  itemId: string,
  etag: string,
  customerStatus: CustomerStatus,
  internalStatus: InternalStatus,
  extra?: Partial<OrderListItemFields>,
): Promise<string> {
  return updateOrderItemFields(itemId, etag, {
    CustomerStatus: customerStatus,
    InternalStatus: internalStatus,
    ...extra,
  });
}
