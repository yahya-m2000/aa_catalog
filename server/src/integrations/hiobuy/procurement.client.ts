import { hiobuyPost } from './hiobuy.client';
import type {
  HiobuyOrderCreateRequest,
  HiobuyOrderCreateResult,
  HiobuyOrderPayResult,
} from './hiobuy.types';

/**
 * Creates a procurement order against the business's own linked Taobao account.
 * Does NOT trigger payment — see payHiobuyOrder. `external_order_id`/`outer_purchase_id`
 * are sent but do NOT reliably dedupe on HIOBuy's side — live sandbox testing (2026-07-20,
 * see project memory project_hiobuy_production_plan.md) showed retrying with the same
 * external_order_id created a second, distinct order rather than deduping, and HIOBuy
 * offers no working way to look up an existing order by our own reference afterward
 * (orders/detail requires HIOBuy's own order_id; orders/purchase/query returns a static
 * sandbox mock regardless of input). Real idempotency protection is therefore entirely
 * our own responsibility — see procurement.service.ts's early HiobuyOrderId write.
 */
export async function createHiobuyOrder(request: HiobuyOrderCreateRequest): Promise<HiobuyOrderCreateResult> {
  return hiobuyPost<HiobuyOrderCreateResult>('/v1/orders/create', request);
}

/**
 * Executes payment for a previously created order — this is the call that actually
 * debits the business's own Alipay/bank account. Irreversible once it succeeds.
 */
export async function payHiobuyOrder(orderId: string): Promise<HiobuyOrderPayResult> {
  return hiobuyPost<HiobuyOrderPayResult>('/v1/orders/pay', { channel: 'taobao', order_id: orderId });
}
