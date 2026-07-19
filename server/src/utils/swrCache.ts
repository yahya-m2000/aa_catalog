import { recordCacheOutcome } from './logger';

export type CacheEntryState = 'fresh' | 'stale' | 'miss';

interface CacheEntry<T> {
  value: T;
  storedAt: number;
}

export interface SwrCacheOptions {
  freshMs: number;
  staleMs: number;
  maxEntries?: number;
  /** Name used for hit-rate logging (e.g. "search", "detail", "home"). Optional — caches without a name are simply not tracked. */
  name?: string;
}

/**
 * In-memory, process-lifetime-only cache with stale-while-revalidate semantics
 * and single-flight request coalescing. No persistence across restarts by design
 * (see plan §7 — Render's free/standard tiers have no persistent disk).
 */
export class SwrCache<T> {
  private readonly store = new Map<string, CacheEntry<T>>();
  private readonly inFlight = new Map<string, Promise<T>>();
  private readonly freshMs: number;
  private readonly staleMs: number;
  private readonly maxEntries: number;
  private readonly name?: string;

  constructor(options: SwrCacheOptions) {
    this.freshMs = options.freshMs;
    this.staleMs = options.staleMs;
    this.maxEntries = options.maxEntries ?? 500;
    this.name = options.name;
  }

  private stateOf(entry: CacheEntry<T> | undefined): CacheEntryState {
    if (!entry) return 'miss';
    const age = Date.now() - entry.storedAt;
    if (age <= this.freshMs) return 'fresh';
    if (age <= this.staleMs) return 'stale';
    return 'miss';
  }

  get(key: string): { value: T; state: CacheEntryState } | null {
    const entry = this.store.get(key);
    const state = this.stateOf(entry);
    if (state === 'miss' || !entry) return null;
    return { value: entry.value, state };
  }

  set(key: string, value: T): void {
    if (this.store.size >= this.maxEntries && !this.store.has(key)) {
      const oldestKey = this.store.keys().next().value;
      if (oldestKey !== undefined) this.store.delete(oldestKey);
    }
    this.store.delete(key);
    this.store.set(key, { value, storedAt: Date.now() });
  }

  /**
   * Fresh-or-fetch with single-flight coalescing: concurrent callers for the
   * same key share one in-flight fetch instead of issuing duplicate upstream calls.
   * On fetch failure with a stale entry available, falls back to the stale value.
   */
  async getOrFetch(key: string, fetcher: () => Promise<T>): Promise<T> {
    const entryState = this.stateOf(this.store.get(key));
    if (this.name) recordCacheOutcome(this.name, entryState);

    const cached = this.get(key);
    if (cached?.state === 'fresh') return cached.value;

    const existingFlight = this.inFlight.get(key);
    if (existingFlight) return existingFlight;

    const flight = fetcher()
      .then((value) => {
        this.set(key, value);
        return value;
      })
      .catch((error) => {
        if (cached?.state === 'stale') return cached.value;
        throw error;
      })
      .finally(() => {
        this.inFlight.delete(key);
      });

    this.inFlight.set(key, flight);
    return flight;
  }

  clear(): void {
    this.store.clear();
    this.inFlight.clear();
  }
}
