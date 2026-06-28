import { Router } from 'express';

import { postOrder } from '../controllers/orders.controller';

export const ordersRouter = Router();

ordersRouter.post('/', postOrder);
