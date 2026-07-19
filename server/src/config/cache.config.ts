export interface CacheTtlConfig {
  freshMs: number;
  staleMs: number;
}

export interface CacheConfig {
  search: CacheTtlConfig;
  detail: CacheTtlConfig;
  home: CacheTtlConfig;
  negative: CacheTtlConfig;
  quotaWarningThreshold: number;
}

function minutes(n: number): number {
  return n * 60 * 1000;
}

function hours(n: number): number {
  return n * 60 * 60 * 1000;
}

export const cacheConfig: CacheConfig = {
  search: {
    freshMs: Number(process.env.CACHE_SEARCH_FRESH_MS ?? minutes(15)),
    staleMs: Number(process.env.CACHE_SEARCH_STALE_MS ?? hours(2)),
  },
  detail: {
    freshMs: Number(process.env.CACHE_DETAIL_FRESH_MS ?? minutes(30)),
    staleMs: Number(process.env.CACHE_DETAIL_STALE_MS ?? hours(4)),
  },
  home: {
    freshMs: Number(process.env.CACHE_HOME_FRESH_MS ?? hours(6)),
    staleMs: Number(process.env.CACHE_HOME_STALE_MS ?? hours(24)),
  },
  negative: {
    freshMs: Number(process.env.CACHE_NEGATIVE_FRESH_MS ?? minutes(5)),
    staleMs: 0,
  },
  // Once X-Quota-Remaining-Day drops below this, non-essential calls (search/home)
  // short-circuit to stale-or-empty rather than spending remaining quota.
  quotaWarningThreshold: Number(process.env.CACHE_QUOTA_WARNING_THRESHOLD ?? 10),
};
