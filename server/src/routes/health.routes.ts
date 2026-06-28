import { Router } from 'express';

import type { ApiResponse } from '../types/api';

export const healthRouter = Router();

healthRouter.get('/', (_req, res) => {
  const body: ApiResponse<{ status: 'ok'; uptimeSeconds: number }> = {
    success: true,
    data: {
      status: 'ok',
      uptimeSeconds: Math.floor(process.uptime()),
    },
  };
  res.json(body);
});
