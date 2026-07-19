import { getExpirableOrderItems, updateOrderStatus } from '../integrations/graph/orders.repository';
import { GraphConflictError } from '../integrations/graph/graph.client';
import { recordGraphCall } from '../utils/logger';

export interface OrderExpirySweepResult {
  checked: number;
  expired: number;
  skippedConflict: number;
  failed: number;
}

/**
 * Passive status-only sweep (plan §1/§7a): flips CustomerStatus/InternalStatus to
 * "Expired" on orders past their ExpiresAt that are still pending. Never touches
 * HIOBuy, never cancels/refunds anything — those stay entirely manual per the plan's
 * confirmed operational model. Designed to be safe to call repeatedly (idempotent —
 * an order already moved to a final status is excluded by the repository's own filter)
 * and safe to trigger from any of the three mechanisms in plan §7a (Power Automate,
 * an external cron hitting this via the internal route, or a Render Cron Job), since
 * the actual scheduling decision is infrastructure, not application code.
 */
export async function runOrderExpirySweep(now: Date = new Date()): Promise<OrderExpirySweepResult> {
  const items = await getExpirableOrderItems(now.toISOString());
  const result: OrderExpirySweepResult = { checked: items.length, expired: 0, skippedConflict: 0, failed: 0 };

  for (const item of items) {
    try {
      await updateOrderStatus(item.id, item['@odata.etag'], 'Expired', 'Expired', {
        ExpiredAt: now.toISOString(),
      });
      result.expired += 1;
    } catch (error) {
      if (error instanceof GraphConflictError) {
        // Staff or a concurrent sweep already changed this item — leave it alone (plan §4a: If-Match, never overwrite).
        result.skippedConflict += 1;
        continue;
      }
      result.failed += 1;
      recordGraphCall('orderExpirySweep.itemFailed', false);
    }
  }

  return result;
}
