import { Router } from 'express';

import { postExpireOrders } from '../controllers/internal.controller';
import { requireInternalTaskSecret } from '../middleware/internalAuth';

export const internalRouter = Router();

internalRouter.post('/expire-orders', requireInternalTaskSecret, postExpireOrders);
