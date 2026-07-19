import type { NextFunction, Request, Response } from 'express';

import type { ApiResponse } from '../types/api';

interface Bucket {
  count: number;
  windowStartMs: number;
}

/**
 * In-memory per-key token bucket. No Redis needed at this app's volume (plan §7/§8) —
 * state is process-lifetime only, same tradeoff as the rest of the in-memory cache layer.
 */
export function createRateLimiter(options: { windowMs: number; max: number; keyFn?: (req: Request) => string }) {
  const buckets = new Map<string, Bucket>();
  const keyFn = options.keyFn ?? ((req: Request) => req.ip ?? 'unknown');

  return function rateLimit(req: Request, res: Response, next: NextFunction) {
    const key = keyFn(req);
    const now = Date.now();
    const bucket = buckets.get(key);

    if (!bucket || now - bucket.windowStartMs >= options.windowMs) {
      buckets.set(key, { count: 1, windowStartMs: now });
      next();
      return;
    }

    if (bucket.count >= options.max) {
      const body: ApiResponse<never> = {
        success: false,
        error: { code: 'RATE_LIMITED', message: 'Too many requests. Please try again later.' },
      };
      res.status(429).json(body);
      return;
    }

    bucket.count += 1;
    next();
  };
}
