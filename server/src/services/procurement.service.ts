import { assertReceiverConfigured, receiverConfig } from '../config/receiver.config';
import { GraphConflictError, GraphRequestError } from '../integrations/graph/graph.client';
import { getOrderItemByReference, updateOrderItemFields } from '../integrations/graph/orders.repository';
import type { GraphListItem, InternalStatus } from '../integrations/graph/orders.types';
import { createHiobuyOrder, payHiobuyOrder } from '../integrations/hiobuy/procurement.client';
import type { HiobuyOrderLine } from '../integrations/hiobuy/hiobuy.types';
import type { OrderLineItem } from '../types/order';
import { recordGraphCall } from '../utils/logger';

export class ProcurementError extends Error {
  constructor(
    message: string,
    public readonly code:
      | 'ORDER_NOT_FOUND'
      | 'WRONG_STATUS'
      | 'MISSING_SOURCE_IDS'
      | 'MISSING_LINE_ITEMS'
      | 'ALREADY_PROCURED'
      | 'HIOBUY_ERROR'
      | 'GRAPH_CONFLICT',
  ) {
    super(message);
    this.name = 'ProcurementError';
  }
}

/**
 * Only orders staff have explicitly marked "Payment Confirmed" (in the SharePoint UI,
 * per the owner's confirmed manual-verify-then-automate workflow) are eligible. This is
 * the sole trigger condition — nothing in this app calls HIOBuy procurement on any other
 * signal. Refusing every other InternalStatus, including "Procuring"/"Completed", means a
 * duplicate Power Automate run or a retried request can never re-fire a real payment.
 */
const REQUIRED_STATUS: InternalStatus = 'Payment Confirmed';

export interface ProcurementResult {
  reference: string;
  hiobuyOrderId: string;
  hiobuyPurchaseStatus: string;
}

function buildOrderLines(lineItems: OrderLineItem[]): HiobuyOrderLine[] {
  const missing = lineItems.filter((line) => !line.sourceProductId || !line.skuId);
  if (missing.length > 0) {
    throw new ProcurementError(
      `${missing.length} line item(s) are missing sourceProductId/skuId — cannot map to HIOBuy offer_id/spec_id (older orders created before this field was tracked cannot be auto-procured)`,
      'MISSING_SOURCE_IDS',
    );
  }
  return lineItems.map((line) => ({
    offer_id: line.sourceProductId!,
    spec_id: line.skuId!,
    quantity: line.quantity,
  }));
}

function parseLineItems(json: string | undefined, reference: string): OrderLineItem[] {
  if (!json) {
    throw new ProcurementError(`Order ${reference} has no LineItemsJson — cannot procure`, 'MISSING_LINE_ITEMS');
  }
  try {
    return JSON.parse(json) as OrderLineItem[];
  } catch {
    throw new ProcurementError(`Order ${reference} has malformed LineItemsJson — cannot procure`, 'MISSING_LINE_ITEMS');
  }
}

/**
 * Creates then pays a HIOBuy procurement order against the business's own linked
 * Taobao/Alipay account, for exactly one SharePoint order already marked "Payment
 * Confirmed" by staff. This is the only place in the codebase that calls
 * orders/create or orders/pay — see plan §2 and project memory
 * project_hiobuy_production_plan.md for why that's normally out of scope. Every step
 * that mutates state (the SharePoint status flip afterward) uses If-Match, matching
 * the rest of this codebase's optimistic-concurrency convention.
 */
export async function procureOrder(reference: string): Promise<ProcurementResult> {
  assertReceiverConfigured();

  const item = await getOrderItemByReference(reference);
  if (!item) {
    throw new ProcurementError(`No order found for reference ${reference}`, 'ORDER_NOT_FOUND');
  }

  if (item.fields.HiobuyOrderId) {
    throw new ProcurementError(
      `Order ${reference} was already procured (HIOBuy order ${item.fields.HiobuyOrderId})`,
      'ALREADY_PROCURED',
    );
  }

  if (item.fields.InternalStatus !== REQUIRED_STATUS) {
    throw new ProcurementError(
      `Order ${reference} has InternalStatus "${item.fields.InternalStatus}", expected "${REQUIRED_STATUS}" — refusing to procure`,
      'WRONG_STATUS',
    );
  }

  const lineItems = parseLineItems(item.fields.LineItemsJson, reference);
  const lines = buildOrderLines(lineItems);

  let orderId: string;
  try {
    const created = await createHiobuyOrder({
      channel: 'taobao',
      receiver: receiverConfig,
      lines,
      external_order_id: reference,
      outer_purchase_id: reference,
      buyer_message: reference,
    });
    orderId = created.order_id;
  } catch (error) {
    throw new ProcurementError(
      `HIOBuy orders/create failed for ${reference}: ${error instanceof Error ? error.message : String(error)}`,
      'HIOBUY_ERROR',
    );
  }

  /**
   * HIOBuy has no reliable way to look up an order by our own reference (orders/detail
   * only accepts its own order_id; orders/purchase/query returns a static sandbox mock
   * regardless of input — verified live 2026-07-20, see project memory
   * project_hiobuy_production_plan.md). `external_order_id`/`outer_purchase_id` are sent
   * on create but their dedup behavior is unconfirmed and was seen NOT to dedupe in
   * sandbox testing. So our own ALREADY_PROCURED guard is the only real protection against
   * double-creating a purchase on retry — which only works if HiobuyOrderId is persisted
   * before anything else can fail. Record it here, immediately after create succeeds and
   * before calling pay, rather than only at the end: if the process crashes between create
   * and pay (or between pay and the final recordProcurementOutcome below), a retry will see
   * HiobuyOrderId already set and refuse with ALREADY_PROCURED instead of calling
   * orders/create again and creating a second, distinct order.
   */
  let etag = item['@odata.etag'];
  try {
    etag = await updateOrderItemFields(item.id, etag, { HiobuyOrderId: orderId });
  } catch (error) {
    // The HIOBuy order now exists but we couldn't record it — do NOT attempt pay, and do
    // NOT let this look like a clean failure a caller might retry via a fresh create.
    throw new ProcurementError(
      `HIOBuy order ${orderId} was created for ${reference} but recording it in SharePoint failed before payment — resolve manually, do not retry automatically: ${error instanceof Error ? error.message : String(error)}`,
      'GRAPH_CONFLICT',
    );
  }

  let payStatus: string;
  try {
    const paid = await payHiobuyOrder(orderId);
    payStatus = paid.status;
  } catch (error) {
    // Order was created but payment failed/errored — record the outcome so staff can see
    // in SharePoint that a HIOBuy order exists needing manual attention.
    await recordProcurementOutcome({ ...item, '@odata.etag': etag }, orderId, 'Pay Failed', 'Needs Review');
    throw new ProcurementError(
      `HIOBuy order ${orderId} was created for ${reference} but orders/pay failed: ${error instanceof Error ? error.message : String(error)}. Manual follow-up required — do not retry automatically.`,
      'HIOBUY_ERROR',
    );
  }

  await recordProcurementOutcome({ ...item, '@odata.etag': etag }, orderId, payStatus, 'Procuring');

  return { reference, hiobuyOrderId: orderId, hiobuyPurchaseStatus: payStatus };
}

async function recordProcurementOutcome(
  item: GraphListItem,
  hiobuyOrderId: string,
  hiobuyPurchaseStatus: string,
  internalStatus: InternalStatus,
): Promise<void> {
  try {
    await updateOrderItemFields(item.id, item['@odata.etag'], {
      HiobuyOrderId: hiobuyOrderId,
      HiobuyPurchaseStatus: hiobuyPurchaseStatus,
      ProcuredAt: new Date().toISOString(),
      InternalStatus: internalStatus,
    });
  } catch (error) {
    recordGraphCall('procureOrder.recordOutcome', false);
    if (error instanceof GraphConflictError) {
      throw new ProcurementError(
        `HIOBuy order ${hiobuyOrderId} was created/paid for ${item.fields.OrderReference}, but the SharePoint item was modified concurrently and could not be updated with the result — resolve manually, do not retry procurement`,
        'GRAPH_CONFLICT',
      );
    }
    throw new GraphRequestError(
      `HIOBuy order ${hiobuyOrderId} succeeded for ${item.fields.OrderReference} but recording the result in SharePoint failed — resolve manually`,
      undefined,
      error,
    );
  }
}
