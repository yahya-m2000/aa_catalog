import { cacheConfig } from '../../config/cache.config';
import { getLastKnownQuota } from './hiobuy.client';

/**
 * Non-essential calls (search, similar, themes) short-circuit once remaining
 * daily quota drops below the configured warning threshold. The checkout-time
 * revalidation call is never gated by this — see plan §7.
 */
export function isQuotaLow(): boolean {
  const quota = getLastKnownQuota();
  if (!quota.quotaRemainingDay) return false;
  const remaining = Number(quota.quotaRemainingDay);
  if (Number.isNaN(remaining)) return false;
  return remaining < cacheConfig.quotaWarningThreshold;
}
