export interface DeliveryZoneConfig {
  baseUsd: number;
}

export interface PricingConfig {
  markupPercentage: number;
  serviceFeeFixedUSD: number;
  priceIncreaseAbsorbThresholdPercent: number;
  priceIncreaseAbsorbThresholdUSD: number;
  roundingPrecision: number;
  deliveryZones: Record<string, DeliveryZoneConfig>;
  defaultDeliveryZone: string;
}

export const pricingConfig: PricingConfig = {
  markupPercentage: Number(process.env.MARKUP_PERCENTAGE ?? 20),
  serviceFeeFixedUSD: Number(process.env.SERVICE_FEE_FIXED_USD ?? 0),
  // Absorb upstream price increases up to whichever is LOWER of the percent/USD threshold;
  // above that, the business contacts the customer for approval (manual, outside the app).
  priceIncreaseAbsorbThresholdPercent: Number(process.env.PRICE_INCREASE_ABSORB_THRESHOLD_PERCENT ?? 3),
  priceIncreaseAbsorbThresholdUSD: Number(process.env.PRICE_INCREASE_ABSORB_THRESHOLD_USD ?? 3),
  roundingPrecision: Number(process.env.PRICING_ROUNDING_PRECISION ?? 2),
  // Somaliland-only at launch (plan §1/§6); keyed so more regions can be added later
  // without restructuring the order/pricing system.
  deliveryZones: {
    somaliland: { baseUsd: Number(process.env.DELIVERY_ZONE_SOMALILAND_USD ?? 15) },
  },
  defaultDeliveryZone: 'somaliland',
};
