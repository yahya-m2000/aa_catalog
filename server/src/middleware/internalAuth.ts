import type { NextFunction, Request, Response } from 'express';

import { env } from '../config/env';
import type { ApiResponse } from '../types/api';

/**
 * Guards internal-only routes (e.g. the order-expiry sweep trigger, plan §7a) with a
 * shared secret in the `X-Internal-Task-Secret` header — not a full auth system, just
 * enough to keep this off the public API surface if its path is ever guessed. If
 * INTERNAL_TASK_SECRET is unset, the route is refused entirely rather than left open,
 * since an unset secret is a configuration gap, not an "allow all" signal.
 */
export function requireInternalTaskSecret(req: Request, res: Response, next: NextFunction) {
  const configured = env.internalTaskSecret;
  const provided = req.header('X-Internal-Task-Secret');

  if (!configured || !provided || provided !== configured) {
    const body: ApiResponse<never> = {
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Not authorized' },
    };
    res.status(401).json(body);
    return;
  }

  next();
}
