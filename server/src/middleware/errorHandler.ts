import type { NextFunction, Request, Response } from 'express';

import type { ApiResponse } from '../types/api';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  console.error('[errorHandler] Unhandled error:', err);

  const body: ApiResponse<never> = {
    success: false,
    error: { code: 'INTERNAL_ERROR', message: 'Something went wrong. Please try again.' },
  };
  res.status(500).json(body);
}
