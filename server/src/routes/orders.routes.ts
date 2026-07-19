import { Router } from 'express';

import { postOrder, postOrderLookup } from '../controllers/orders.controller';
import { createRateLimiter } from '../middleware/rateLimit';

export const ordersRouter = Router();

const lookupRateLimit = createRateLimiter({ windowMs: 60 * 60 * 1000, max: 10 });

ordersRouter.post('/', postOrder);
ordersRouter.post('/lookup', lookupRateLimit, postOrderLookup);
