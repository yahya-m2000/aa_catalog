export interface PricingConfig {
  markupPercentage: number;
  serviceFeeFixedUSD: number;
}

export const pricingConfig: PricingConfig = {
  markupPercentage: Number(process.env.MARKUP_PERCENTAGE ?? 20),
  serviceFeeFixedUSD: Number(process.env.SERVICE_FEE_FIXED_USD ?? 0),
};
