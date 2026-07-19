import { pricingConfig } from '../config/pricing.config';

const ZONE_ALIASES: Record<string, string> = {
  somaliland: 'somaliland',
  'republic of somaliland': 'somaliland',
  hargeisa: 'somaliland',
  somalia: 'somaliland',
};

export function resolveDeliveryZone(country: string): string {
  const normalized = country.trim().toLowerCase();
  return ZONE_ALIASES[normalized] ?? pricingConfig.defaultDeliveryZone;
}

export function getDeliveryFeeUsd(country: string): number {
  const zone = resolveDeliveryZone(country);
  return pricingConfig.deliveryZones[zone]?.baseUsd ?? pricingConfig.deliveryZones[pricingConfig.defaultDeliveryZone].baseUsd;
}
