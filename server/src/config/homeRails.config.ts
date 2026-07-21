import type { ProductSortOption } from '../integrations/taobao/adapter.interface';

export interface HomeRailConfig {
  dimension: string;
  label: string;
  keyword: string;
  sort: ProductSortOption;
}

/**
 * HIOBuy's `themes/dimensions` endpoint is blocked on this account (CHANNEL_NOT_AUTHORIZED,
 * see home.service.ts). These rails are fetched instead via the working `products/search`
 * path, seeded by keyword/sort per rail. Config-driven so keywords can be tuned without a
 * code change, per the pricing.config.ts/payment.config.ts convention in this codebase.
 */
export const homeRailsConfig: HomeRailConfig[] = [
  {
    dimension: 'deals',
    label: "Today's Deals",
    keyword: process.env.HOME_RAIL_DEALS_KEYWORD ?? 'clothing',
    sort: 'price_asc',
  },
  {
    dimension: 'new-arrivals',
    label: 'New Arrivals',
    keyword: process.env.HOME_RAIL_NEW_ARRIVALS_KEYWORD ?? 'home',
    sort: 'newest',
  },
  {
    dimension: 'best-sellers',
    label: 'Best Sellers',
    keyword: process.env.HOME_RAIL_BEST_SELLERS_KEYWORD ?? 'electronics',
    sort: 'popular',
  },
  {
    dimension: 'accessories',
    label: 'Accessories You Might Like',
    keyword: process.env.HOME_RAIL_ACCESSORIES_KEYWORD ?? 'accessories',
    sort: 'relevance',
  },
];
