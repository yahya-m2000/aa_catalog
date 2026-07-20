import { Router } from 'express';

import { postExpireOrders, postProcureOrder } from '../controllers/internal.controller';
import { requireInternalTaskSecret } from '../middleware/internalAuth';

export const internalRouter = Router();

internalRouter.post('/expire-orders', requireInternalTaskSecret, postExpireOrders);
internalRouter.post('/orders/:reference/procure', requireInternalTaskSecret, postProcureOrder);
