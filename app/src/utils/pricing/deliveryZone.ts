/**
 * Frontend-only mirror of the backend's `server/src/utils/deliveryZone.ts` +
 * `pricingConfig.deliveryZones`, for *instant local display only* — same
 * duplication rationale as `utils/pricing/pricing.ts` (plan §9): the backend
 * is authoritative at checkout time and re-derives this itself; this copy
 * only drives the on-screen price-breakdown estimate before submission.
 *
 * Somaliland-only at launch (plan §1/§6). If the backend's delivery config
 * changes, update `DELIVERY_ZONES`/`DEFAULT_ZONE` here to match.
 */
const DELIVERY_ZONES: Record<string, number> = {
  somaliland: 15,
};

const DEFAULT_ZONE = 'somaliland';

const ZONE_ALIASES: Record<string, string> = {
  somaliland: 'somaliland',
  'republic of somaliland': 'somaliland',
  hargeisa: 'somaliland',
  somalia: 'somaliland',
};

function resolveZone(country: string | undefined): string {
  const normalized = (country ?? '').trim().toLowerCase();
  return ZONE_ALIASES[normalized] ?? DEFAULT_ZONE;
}

/** Estimated delivery fee in USD for display purposes only (not authoritative). */
export function getEstimatedDeliveryFeeUsd(country?: string): number {
  const zone = resolveZone(country);
  return DELIVERY_ZONES[zone] ?? DELIVERY_ZONES[DEFAULT_ZONE];
}
