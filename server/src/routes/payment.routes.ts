import { Router } from 'express';

import { getPaymentInstructions } from '../controllers/payment.controller';

export const paymentRouter = Router();

paymentRouter.get('/instructions', getPaymentInstructions);
