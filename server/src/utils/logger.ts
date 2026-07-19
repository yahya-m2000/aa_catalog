/**
 * Minimal structured, redacted logging + in-process counters (plan Addendum 2 §12/Run 16).
 *
 * Design constraints:
 * - No secrets (API keys, Graph client secret/tokens) and no customer PII (name, email,
 *   phone, address, full order details) may ever appear in a log line. Callers pass only
 *   counts, durations, status codes, and non-identifying keys (e.g. a cache key built from
 *   a normalized search query, not a customer identifier).
 * - Counters are in-memory/process-lifetime only, same tradeoff as the rest of the cache
 *   layer (plan §7) — they reset on restart and are not persisted anywhere.
 * - One JSON object per line (easy to grep/parse in Render's log viewer) rather than a new
 *   logging framework/dependency — matches the existing convention of plain `console.*`
 *   calls used elsewhere in this codebase (errorHandler.ts, order.service.ts).
 */

export type LogEvent =
  | 'hiobuy_call'
  | 'hiobuy_quota'
  | 'cache_stats'
  | 'graph_call'
  | 'graph_error'
  | 'email_delivery';

interface HiobuyCallCounters {
  total: number;
  byPath: Record<string, number>;
  errors: number;
}

interface GraphCallCounters {
  total: number;
  errors: number;
}

interface CacheCounters {
  hits: number;
  staleHits: number;
  misses: number;
}

const hiobuyCounters: HiobuyCallCounters = { total: 0, byPath: {}, errors: 0 };
const graphCounters: GraphCallCounters = { total: 0, errors: 0 };
const cacheCounters: Record<string, CacheCounters> = {};

function emptyCacheCounters(): CacheCounters {
  return { hits: 0, staleHits: 0, misses: 0 };
}

function cacheHitRate(counters: CacheCounters): number {
  const total = counters.hits + counters.staleHits + counters.misses;
  if (total === 0) return 0;
  return Math.round(((counters.hits + counters.staleHits) / total) * 1000) / 1000;
}

function emit(event: LogEvent, fields: Record<string, unknown>): void {
  // Single-line JSON, no secrets/PII — see module doc comment. Callers are responsible for
  // only ever passing redacted/non-identifying fields into this function.
  console.log(JSON.stringify({ event, ...fields, ts: new Date().toISOString() }));
}

/** Records one outbound HIOBuy API call (path + outcome only — never the request/response body). */
export function recordHiobuyCall(path: string, ok: boolean): void {
  hiobuyCounters.total += 1;
  hiobuyCounters.byPath[path] = (hiobuyCounters.byPath[path] ?? 0) + 1;
  if (!ok) hiobuyCounters.errors += 1;
}

/** Logs the latest known HIOBuy quota snapshot (headers only — no auth/key material). */
export function logHiobuyQuota(quota: {
  quotaRemainingDay?: string;
  quotaPackRemaining?: string;
  quotaBillableUnits?: string;
}): void {
  emit('hiobuy_quota', {
    remainingDay: quota.quotaRemainingDay ?? null,
    packRemaining: quota.quotaPackRemaining ?? null,
    billableUnits: quota.quotaBillableUnits ?? null,
    callCountTotal: hiobuyCounters.total,
    callErrors: hiobuyCounters.errors,
  });
}

/** Records one cache lookup outcome for a named cache (e.g. "search", "detail", "home"). */
export function recordCacheOutcome(cacheName: string, state: 'fresh' | 'stale' | 'miss'): void {
  const counters = (cacheCounters[cacheName] ??= emptyCacheCounters());
  if (state === 'fresh') counters.hits += 1;
  else if (state === 'stale') counters.staleHits += 1;
  else counters.misses += 1;
}

/** Emits a snapshot of cache hit-rate stats for all tracked caches. Safe to call periodically or on-demand. */
export function logCacheStats(): void {
  const snapshot: Record<string, { hits: number; staleHits: number; misses: number; hitRate: number }> = {};
  for (const [name, counters] of Object.entries(cacheCounters)) {
    snapshot[name] = { ...counters, hitRate: cacheHitRate(counters) };
  }
  emit('cache_stats', { caches: snapshot });
}

/** Records one Microsoft Graph API call (operation label + outcome only — never tokens/payloads). */
export function recordGraphCall(operation: string, ok: boolean): void {
  graphCounters.total += 1;
  if (!ok) graphCounters.errors += 1;
  emit(ok ? 'graph_call' : 'graph_error', {
    operation,
    callCountTotal: graphCounters.total,
    callErrors: graphCounters.errors,
  });
}

/** Records an order-confirmation/notification email delivery outcome — reference only, never the recipient address or body. */
export function logEmailDelivery(orderReference: string, kind: 'customer' | 'internal', status: 'sent' | 'failed'): void {
  emit('email_delivery', { orderReference, kind, status });
}

/** Test-only: resets all in-memory counters between test runs. */
export function __resetLoggerCountersForTests(): void {
  hiobuyCounters.total = 0;
  hiobuyCounters.errors = 0;
  for (const key of Object.keys(hiobuyCounters.byPath)) delete hiobuyCounters.byPath[key];
  graphCounters.total = 0;
  graphCounters.errors = 0;
  for (const key of Object.keys(cacheCounters)) delete cacheCounters[key];
}
