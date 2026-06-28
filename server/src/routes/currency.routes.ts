import { Router } from 'express';

import { getRates } from '../controllers/currency.controller';

export const currencyRouter = Router();

currencyRouter.get('/rates', getRates);
